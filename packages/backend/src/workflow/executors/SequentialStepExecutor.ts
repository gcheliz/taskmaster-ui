import { BaseStepExecutor } from './BaseStepExecutor';
import { WorkflowStep, WorkflowContext } from '../types';
import { StepExecutorFactory } from './StepExecutorFactory';
import { logger } from '../../utils/logger';

export class SequentialStepExecutor extends BaseStepExecutor {
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

      logger.info(`Executing sequential step: ${step.name}`, {
        stepId: step.id,
        stepCount: step.steps.length,
        projectId: context.projectId,
      });

      const results: WorkflowStep[] = [];
      let shouldContinue = true;

      // Execute nested steps sequentially
      for (const nestedStep of step.steps) {
        if (!shouldContinue) {
          // Skip remaining steps if previous step failed
          results.push({
            ...nestedStep,
            status: 'skipped',
            completedAt: new Date(),
          });
          continue;
        }

        try {
          const executor = this.factory.getExecutor(nestedStep.type);

          const executeStep = async () => {
            return await executor.execute(nestedStep, context);
          };

          let result: WorkflowStep;
          const timeout = nestedStep.timeout || step.timeout;
          if (timeout) {
            result = await this.executeWithTimeout(executeStep, timeout);
          } else {
            result = await executeStep();
          }

          results.push(result);

          // Stop execution if step failed (unless explicitly configured to continue)
          if (result.status === 'failed') {
            shouldContinue = false;
          }
        } catch (error) {
          logger.error(`Sequential step ${nestedStep.id} failed`, { error });
          const failedStep = {
            ...nestedStep,
            status: 'failed' as const,
            error: error instanceof Error ? error.message : 'Unknown error',
            completedAt: new Date(),
          };
          results.push(failedStep);
          shouldContinue = false;
        }
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
            ? `Sequential execution failed at step ${failedSteps[0].id}`
            : undefined,
        completedAt: new Date(),
      };
    } catch (error) {
      logger.error('Sequential step execution failed', {
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
