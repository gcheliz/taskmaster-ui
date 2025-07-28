import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import {
  WorkflowTemplate,
  WorkflowInstance,
  WorkflowContext,
  WorkflowStep,
  StepStatus,
  WorkflowEvent,
  WorkflowExecutor,
  WorkflowInstanceRepository,
} from './types';
import { StepExecutorFactory } from './executors/StepExecutorFactory';
import { WorkflowValidator } from './validators/WorkflowValidator';
import { WorkflowContextResolver } from './resolvers/WorkflowContextResolver';

export class WorkflowEngine extends EventEmitter implements WorkflowExecutor {
  private runningWorkflows: Map<string, WorkflowInstance>;
  private stepExecutorFactory: StepExecutorFactory;
  private validator: WorkflowValidator;
  private contextResolver: WorkflowContextResolver;
  private repository: WorkflowInstanceRepository;

  constructor(repository: WorkflowInstanceRepository) {
    super();
    this.runningWorkflows = new Map();
    this.stepExecutorFactory = new StepExecutorFactory();
    this.validator = new WorkflowValidator();
    this.contextResolver = new WorkflowContextResolver();
    this.repository = repository;
  }

  async execute(
    template: WorkflowTemplate,
    context: WorkflowContext
  ): Promise<WorkflowInstance> {
    try {
      // Validate template
      await this.validator.validateTemplate(template);

      // Resolve context variables
      const resolvedContext = await this.contextResolver.resolve(
        context,
        template.variables
      );

      // Create workflow instance
      const instance: WorkflowInstance = {
        id: uuidv4(),
        templateId: template.id,
        name: template.name,
        type: template.type,
        status: 'pending',
        context: resolvedContext,
        steps: this.initializeSteps(template.steps),
        progress: 0,
        startedAt: new Date(),
        logs: [],
      };

      // Save initial state
      await this.repository.save(instance);
      this.runningWorkflows.set(instance.id, instance);

      // Emit workflow started event
      this.emitEvent({
        type: 'workflow.started',
        workflowId: instance.id,
        timestamp: new Date(),
      });

      // Start execution
      this.executeWorkflow(instance, template);

      return instance;
    } catch (error) {
      logger.error('Failed to execute workflow', { error, template });
      throw error;
    }
  }

  async pause(workflowId: string): Promise<void> {
    const instance = this.runningWorkflows.get(workflowId);
    if (!instance) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (instance.status !== 'running') {
      throw new Error(`Cannot pause workflow in status ${instance.status}`);
    }

    instance.status = 'paused';
    await this.repository.update(workflowId, { status: 'paused' });

    this.emitEvent({
      type: 'workflow.paused',
      workflowId,
      timestamp: new Date(),
    });
  }

  async resume(workflowId: string): Promise<void> {
    const instance = this.runningWorkflows.get(workflowId);
    if (!instance) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (instance.status !== 'paused') {
      throw new Error(`Cannot resume workflow in status ${instance.status}`);
    }

    instance.status = 'running';
    await this.repository.update(workflowId, { status: 'running' });

    this.emitEvent({
      type: 'workflow.resumed',
      workflowId,
      timestamp: new Date(),
    });

    // Continue execution from current step
    if (instance.currentStepId) {
      const currentStep = this.findStep(instance.steps, instance.currentStepId);
      if (currentStep) {
        this.executeStep(instance, currentStep);
      }
    }
  }

  async cancel(workflowId: string): Promise<void> {
    const instance = this.runningWorkflows.get(workflowId);
    if (!instance) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (['completed', 'failed', 'cancelled'].includes(instance.status)) {
      throw new Error(`Cannot cancel workflow in status ${instance.status}`);
    }

    instance.status = 'cancelled';
    instance.completedAt = new Date();
    await this.repository.update(workflowId, {
      status: 'cancelled',
      completedAt: instance.completedAt,
    });

    this.runningWorkflows.delete(workflowId);

    this.emitEvent({
      type: 'workflow.cancelled',
      workflowId,
      timestamp: new Date(),
    });
  }

  async getStatus(workflowId: string): Promise<WorkflowInstance> {
    const instance = this.runningWorkflows.get(workflowId);
    if (instance) {
      return instance;
    }

    const saved = await this.repository.get(workflowId);
    if (!saved) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    return saved;
  }

  private async executeWorkflow(
    instance: WorkflowInstance,
    _template: WorkflowTemplate
  ): Promise<void> {
    try {
      instance.status = 'running';
      await this.repository.update(instance.id, { status: 'running' });

      // Execute steps
      for (const step of instance.steps) {
        if (instance.status !== 'running') {
          break;
        }

        // Check dependencies
        if (
          step.dependsOn &&
          !this.areDependenciesMet(instance.steps, step.dependsOn)
        ) {
          step.status = 'skipped';
          continue;
        }

        await this.executeStep(instance, step);

        // Update progress
        const completedSteps = instance.steps.filter(s =>
          ['completed', 'skipped'].includes(s.status)
        ).length;
        instance.progress = Math.round(
          (completedSteps / instance.steps.length) * 100
        );
        await this.repository.update(instance.id, {
          progress: instance.progress,
        });
      }

      // Handle completion
      if (instance.status === 'running') {
        const failedSteps = instance.steps.filter(s => s.status === 'failed');
        if (failedSteps.length > 0) {
          instance.status = 'failed';
          instance.error = `${failedSteps.length} steps failed`;
        } else {
          instance.status = 'completed';
        }
      }

      instance.completedAt = new Date();
      await this.repository.update(instance.id, {
        status: instance.status,
        completedAt: instance.completedAt,
        error: instance.error || undefined,
      });

      this.runningWorkflows.delete(instance.id);

      // Emit completion event
      const eventType =
        instance.status === 'completed'
          ? 'workflow.completed'
          : 'workflow.failed';
      this.emitEvent({
        type: eventType,
        workflowId: instance.id,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Workflow execution failed', {
        error,
        workflowId: instance.id,
      });
      instance.status = 'failed';
      instance.error = error instanceof Error ? error.message : 'Unknown error';
      instance.completedAt = new Date();

      await this.repository.update(instance.id, {
        status: instance.status,
        completedAt: instance.completedAt,
        error: instance.error || undefined,
      });

      this.runningWorkflows.delete(instance.id);

      this.emitEvent({
        type: 'workflow.failed',
        workflowId: instance.id,
        data: { error: instance.error },
        timestamp: new Date(),
      });
    }
  }

  private async executeStep(
    instance: WorkflowInstance,
    step: WorkflowStep
  ): Promise<void> {
    try {
      instance.currentStepId = step.id;
      step.status = 'running';
      step.startedAt = new Date();

      this.emitEvent({
        type: 'step.started',
        workflowId: instance.id,
        stepId: step.id,
        timestamp: new Date(),
      });

      // Get appropriate executor
      const executor = this.stepExecutorFactory.getExecutor(step.type);
      const result = await executor.execute(step, instance.context);

      step.status = result.status;
      step.output = result.output;
      step.error = result.error || undefined;
      step.completedAt = new Date();

      await this.repository.update(instance.id, { steps: instance.steps });

      const eventType =
        step.status === 'completed'
          ? 'step.completed'
          : step.status === 'failed'
            ? 'step.failed'
            : 'step.skipped';

      this.emitEvent({
        type: eventType,
        workflowId: instance.id,
        stepId: step.id,
        data: { output: step.output, error: step.error },
        timestamp: new Date(),
      });

      // Handle step-level success/failure actions
      if (step.status === 'completed' && step.onSuccess) {
        // Execute success actions
      } else if (step.status === 'failed' && step.onFailure) {
        // Execute failure actions
      }
    } catch (error) {
      logger.error('Step execution failed', { error, stepId: step.id });
      step.status = 'failed';
      step.error = error instanceof Error ? error.message : 'Unknown error';
      step.completedAt = new Date();

      await this.repository.update(instance.id, { steps: instance.steps });

      this.emitEvent({
        type: 'step.failed',
        workflowId: instance.id,
        stepId: step.id,
        data: { error: step.error },
        timestamp: new Date(),
      });
    }
  }

  private initializeSteps(steps: WorkflowStep[]): WorkflowStep[] {
    return steps.map((step, index) => {
      const initialized: WorkflowStep = {
        ...step,
        id: step.id || `step-${index + 1}`,
        status: 'pending' as StepStatus,
      };
      if (step.steps) {
        initialized.steps = this.initializeSteps(step.steps);
      }
      return initialized;
    });
  }

  private findStep(steps: WorkflowStep[], stepId: string): WorkflowStep | null {
    for (const step of steps) {
      if (step.id === stepId) {
        return step;
      }
      if (step.steps) {
        const found = this.findStep(step.steps, stepId);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  private areDependenciesMet(
    steps: WorkflowStep[],
    dependencies: string[]
  ): boolean {
    for (const depId of dependencies) {
      const dep = this.findStep(steps, depId);
      if (!dep || dep.status !== 'completed') {
        return false;
      }
    }
    return true;
  }

  private emitEvent(event: WorkflowEvent): void {
    this.emit('workflow.event', event);
    logger.debug('Workflow event emitted', { event });
  }

  private _addLog(
    instance: WorkflowInstance,
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: any
  ): void {
    instance.logs.push({
      id: uuidv4(),
      workflowId: instance.id,
      level,
      message,
      data,
      timestamp: new Date(),
    });
  }
}
