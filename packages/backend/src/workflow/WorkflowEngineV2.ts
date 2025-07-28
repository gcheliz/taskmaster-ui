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
import { AgentManager } from './agents/AgentManager';
import { MessageBroker } from './communication/MessageBroker';
import { WorkflowContextManager } from './context/WorkflowContextManager';
import { ParallelAgentCoordinator } from './coordinators/ParallelAgentCoordinator';
import { EnhancedAgentStepExecutor } from './executors/EnhancedAgentStepExecutor';

export class WorkflowEngineV2 extends EventEmitter implements WorkflowExecutor {
  private runningWorkflows: Map<string, WorkflowInstance>;
  private stepExecutorFactory: StepExecutorFactory;
  private validator: WorkflowValidator;
  private contextResolver: WorkflowContextResolver;
  private repository: WorkflowInstanceRepository;
  private workflowContexts: Map<string, WorkflowContextManager>;
  private workflowBrokers: Map<string, MessageBroker>;
  private workflowAgentManagers: Map<string, AgentManager>;

  constructor(repository: WorkflowInstanceRepository) {
    super();
    this.runningWorkflows = new Map();
    this.stepExecutorFactory = new StepExecutorFactory();
    this.validator = new WorkflowValidator();
    this.contextResolver = new WorkflowContextResolver();
    this.repository = repository;
    this.workflowContexts = new Map();
    this.workflowBrokers = new Map();
    this.workflowAgentManagers = new Map();

    this.setupEnhancedExecutors();
  }

  private setupEnhancedExecutors(): void {
    // Register enhanced executors that use the coordination layer
    this.stepExecutorFactory.registerExecutor(
      'enhanced-agent',
      new EnhancedAgentStepExecutor(this.getOrCreateAgentManager('global'))
    );
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

      // Set up workflow-specific components
      this.setupWorkflowComponents(instance);

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

  private setupWorkflowComponents(instance: WorkflowInstance): void {
    // Create workflow-specific context manager
    const contextManager = new WorkflowContextManager(instance.context);
    this.workflowContexts.set(instance.id, contextManager);

    // Create workflow-specific message broker
    const messageBroker = new MessageBroker();
    this.workflowBrokers.set(instance.id, messageBroker);

    // Create workflow-specific agent manager
    const agentManager = new AgentManager();
    this.workflowAgentManagers.set(instance.id, agentManager);

    // Set up enhanced step executor for this workflow
    this.stepExecutorFactory.registerExecutor(
      `agent-${instance.id}`,
      new EnhancedAgentStepExecutor(agentManager)
    );

    // Subscribe to context updates
    contextManager.on('context.updated', event => {
      this.emitEvent({
        type: 'workflow.context.updated' as any,
        workflowId: instance.id,
        data: event,
        timestamp: new Date(),
      });
    });

    // Subscribe to agent events
    agentManager.on('agent.created', agent => {
      messageBroker.publish('agent.created', 'system', {
        agentId: agent.id,
        type: agent.type,
        name: agent.name,
      });
    });

    agentManager.on('agent.task.completed', event => {
      messageBroker.publish('agent.task.completed', event.agentId, event);
    });
  }

  private async executeWorkflow(
    instance: WorkflowInstance,
    template: WorkflowTemplate
  ): Promise<void> {
    try {
      instance.status = 'running';
      await this.repository.update(instance.id, { status: 'running' });

      const contextManager = this.workflowContexts.get(instance.id)!;
      const messageBroker = this.workflowBrokers.get(instance.id)!;

      // Create coordinator for parallel execution
      const coordinator = new ParallelAgentCoordinator();

      // Execute steps with enhanced coordination
      for (const step of instance.steps) {
        if (instance.status !== 'running') {
          break;
        }

        // Update context with current progress
        contextManager.setMetadata('currentStep', step.id, 'system');
        contextManager.setMetadata('progress', instance.progress, 'system');

        // Check dependencies
        if (
          step.dependsOn &&
          !this.areDependenciesMet(instance.steps, step.dependsOn)
        ) {
          step.status = 'skipped';
          continue;
        }

        // Execute step based on type
        if (step.type === 'parallel' && step.steps) {
          // Use parallel coordinator for parallel steps
          const results = await coordinator.executeParallelSteps(
            step.steps,
            contextManager.getContext()
          );
          step.steps = results;
          step.status = results.every(r => r.status === 'completed')
            ? 'completed'
            : 'failed';
        } else {
          // Use appropriate executor for other step types
          await this.executeStep(instance, step, contextManager);
        }

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

        // Publish step completion event
        messageBroker.publish('step.completed', 'system', {
          stepId: step.id,
          status: step.status,
          output: step.output,
        });
      }

      // Handle completion
      await this.completeWorkflow(instance);
    } catch (error) {
      logger.error('Workflow execution failed', {
        error,
        workflowId: instance.id,
      });
      await this.failWorkflow(instance, error);
    }
  }

  private async executeStep(
    instance: WorkflowInstance,
    step: WorkflowStep,
    contextManager: WorkflowContextManager
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
      const executorType =
        step.type === 'agent' ? `agent-${instance.id}` : step.type;
      const executor = this.stepExecutorFactory.getExecutor(executorType);

      // Execute with current context
      const result = await executor.execute(step, contextManager.getContext());

      // Update step with results
      Object.assign(step, result);

      // Store step output in context
      if (result.output) {
        contextManager.setSharedData(
          `step.${step.id}.output`,
          result.output,
          'system'
        );
      }

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

  private async completeWorkflow(instance: WorkflowInstance): Promise<void> {
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

    // Clean up workflow components
    await this.cleanupWorkflowComponents(instance.id);

    this.runningWorkflows.delete(instance.id);

    const eventType =
      instance.status === 'completed'
        ? 'workflow.completed'
        : 'workflow.failed';
    this.emitEvent({
      type: eventType,
      workflowId: instance.id,
      timestamp: new Date(),
    });
  }

  private async failWorkflow(
    instance: WorkflowInstance,
    error: any
  ): Promise<void> {
    instance.status = 'failed';
    instance.error = error instanceof Error ? error.message : 'Unknown error';
    instance.completedAt = new Date();

    await this.repository.update(instance.id, {
      status: instance.status,
      completedAt: instance.completedAt,
      error: instance.error || undefined,
    });

    await this.cleanupWorkflowComponents(instance.id);
    this.runningWorkflows.delete(instance.id);

    this.emitEvent({
      type: 'workflow.failed',
      workflowId: instance.id,
      data: { error: instance.error },
      timestamp: new Date(),
    });
  }

  private async cleanupWorkflowComponents(workflowId: string): Promise<void> {
    // Clean up context manager
    const contextManager = this.workflowContexts.get(workflowId);
    if (contextManager) {
      contextManager.removeAllListeners();
      this.workflowContexts.delete(workflowId);
    }

    // Clean up message broker
    const messageBroker = this.workflowBrokers.get(workflowId);
    if (messageBroker) {
      messageBroker.stop();
      messageBroker.removeAllListeners();
      this.workflowBrokers.delete(workflowId);
    }

    // Clean up agent manager
    const agentManager = this.workflowAgentManagers.get(workflowId);
    if (agentManager) {
      await agentManager.terminateAllAgents();
      agentManager.removeAllListeners();
      this.workflowAgentManagers.delete(workflowId);
    }

    // Unregister workflow-specific executors
    this.stepExecutorFactory.registerExecutor(
      `agent-${workflowId}`,
      null as any
    );
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

    // Pause all agents
    const agentManager = this.workflowAgentManagers.get(workflowId);
    if (agentManager) {
      // Implementation would pause agent execution
    }

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

    // Continue execution would be implemented here
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

    await this.cleanupWorkflowComponents(workflowId);
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

  private getOrCreateAgentManager(scope: string): AgentManager {
    if (!this.workflowAgentManagers.has(scope)) {
      this.workflowAgentManagers.set(scope, new AgentManager());
    }
    return this.workflowAgentManagers.get(scope)!;
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
}
