import { BaseStepExecutor } from './BaseStepExecutor';
import { WorkflowStep, WorkflowContext } from '../types';
import { StepExecutorFactory } from './StepExecutorFactory';
import { logger } from '../../utils/logger';

export class ParallelStepExecutor extends BaseStepExecutor {
  constructor(private factory: StepExecutorFactory) {
    super();
  }

  async execute(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<WorkflowStep> {
    try {
      if (!step.steps || step.steps.length === 0) {
        return {
          ...step,
          status: 'completed',
          output: { message: 'No steps to execute' },
          completedAt: new Date(),
        };
      }

      logger.info(`Executing parallel step: ${step.name}`, {
        stepId: step.id,
        stepCount: step.steps.length,
        projectId: context.projectId,
      });

      // Execute all nested steps in parallel
      const promises = step.steps.map(async nestedStep => {
        try {
          const executor = this.factory.getExecutor(nestedStep.type);
          return await executor.execute(nestedStep, context);
        } catch (error) {
          logger.error(`Parallel step ${nestedStep.id} failed`, { error });
          return {
            ...nestedStep,
            status: 'failed' as const,
            error: error instanceof Error ? error.message : 'Unknown error',
            completedAt: new Date(),
          };
        }
      });

      const executeParallel = async () => {
        const results = await Promise.all(promises);
        return results;
      };

      let results: WorkflowStep[];
      if (step.timeout) {
        results = await this.executeWithTimeout(executeParallel, step.timeout);
      } else {
        results = await executeParallel();
      }

      // Update nested steps with results
      step.steps = results;

      // Determine overall status
      const failedSteps = results.filter(s => s.status === 'failed');
      const allCompleted = results.every(
        s => s.status === 'completed' || s.status === 'skipped'
      );

      return {
        ...step,
        status:
          failedSteps.length > 0
            ? 'failed'
            : allCompleted
              ? 'completed'
              : 'failed',
        output: {
          completed: results.filter(s => s.status === 'completed').length,
          failed: failedSteps.length,
          skipped: results.filter(s => s.status === 'skipped').length,
          total: results.length,
        },
        error:
          failedSteps.length > 0
            ? `${failedSteps.length} parallel steps failed`
            : undefined,
        completedAt: new Date(),
      };
    } catch (error) {
      logger.error('Parallel step execution failed', {
        error,
        stepId: step.id,
      });

      return {
        ...step,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      };
    }
  }
}
