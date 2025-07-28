import { BaseStepExecutor } from './BaseStepExecutor';
import { WorkflowStep, WorkflowContext } from '../types';
import { logger } from '../../utils/logger';
import vm from 'vm';

export class ConditionStepExecutor extends BaseStepExecutor {
  async execute(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<WorkflowStep> {
    try {
      if (!step.condition) {
        throw new Error('Condition is required for condition steps');
      }

      logger.info(`Evaluating condition step: ${step.name}`, {
        stepId: step.id,
        condition: step.condition,
        projectId: context.projectId,
      });

      // Evaluate condition in a sandboxed environment
      const conditionResult = await this.evaluateCondition(
        step.condition,
        context
      );

      if (conditionResult && step.steps) {
        // Execute nested steps if condition is true
        // This would be handled by the parent executor
        return {
          ...step,
          status: 'completed',
          output: { conditionMet: true, executeSteps: true },
          completedAt: new Date(),
        };
      } else {
        return {
          ...step,
          status: 'skipped',
          output: { conditionMet: false, executeSteps: false },
          completedAt: new Date(),
        };
      }
    } catch (error) {
      logger.error('Condition step execution failed', {
        error,
        stepId: step.id,
        condition: step.condition,
      });

      return {
        ...step,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      };
    }
  }

  private async evaluateCondition(
    condition: string,
    context: WorkflowContext
  ): Promise<boolean> {
    try {
      // Create a safe context for evaluation
      const sandbox = {
        context: context.variables,
        metadata: context.metadata,
        env: process.env,
        // Add safe utility functions
        includes: (arr: any[], item: any) => arr.includes(item),
        startsWith: (str: string, prefix: string) => str.startsWith(prefix),
        endsWith: (str: string, suffix: string) => str.endsWith(suffix),
        match: (str: string, pattern: string) => new RegExp(pattern).test(str),
      };

      // Interpolate variables in condition
      const interpolatedCondition = this.interpolateVariables(
        condition,
        context
      );

      // Create VM context
      const vmContext = vm.createContext(sandbox);

      // Evaluate condition
      const result = vm.runInContext(interpolatedCondition, vmContext, {
        timeout: 5000, // 5 second timeout
        displayErrors: true,
      });

      return Boolean(result);
    } catch (error) {
      logger.error('Failed to evaluate condition', { error, condition });
      throw new Error(
        `Invalid condition: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
