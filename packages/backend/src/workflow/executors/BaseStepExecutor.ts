import { StepExecutor, WorkflowStep, WorkflowContext } from '../types';
import { logger } from '../../utils/logger';

export abstract class BaseStepExecutor implements StepExecutor {
  abstract execute(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<WorkflowStep>;

  protected async executeWithRetry(
    fn: () => Promise<any>,
    retries: number = 0,
    delay: number = 1000
  ): Promise<any> {
    let lastError: Error | null = null;

    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Execution attempt ${i + 1} failed`, { error });

        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }

    throw lastError;
  }

  protected async executeWithTimeout(
    fn: () => Promise<any>,
    timeout: number
  ): Promise<any> {
    return Promise.race([
      fn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), timeout)
      ),
    ]);
  }

  protected interpolateVariables(
    text: string,
    context: WorkflowContext
  ): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context.variables[key] ?? match;
    });
  }
}
