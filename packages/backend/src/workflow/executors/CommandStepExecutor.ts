import { BaseStepExecutor } from './BaseStepExecutor';
import { WorkflowStep, WorkflowContext } from '../types';
import { CommandExecutor } from '../../services/commandExecutor';
import { logger } from '../../utils/logger';

export class CommandStepExecutor extends BaseStepExecutor {
  private commandExecutor: CommandExecutor;

  constructor() {
    super();
    this.commandExecutor = new CommandExecutor();
  }

  async execute(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<WorkflowStep> {
    try {
      if (!step.command) {
        throw new Error('Command is required for command steps');
      }

      logger.info(`Executing command step: ${step.name}`, {
        stepId: step.id,
        command: step.command,
        projectId: context.projectId,
      });

      const command = this.interpolateVariables(step.command, context);

      const executeCommand = async () => {
        const result = await this.commandExecutor.executeCommand(command, [], {
          cwd: context.repositoryPath,
        });
        return result;
      };

      let result;
      if (step.timeout) {
        result = await this.executeWithTimeout(executeCommand, step.timeout);
      } else {
        result = await executeCommand();
      }

      if (step.retries && !result.success) {
        result = await this.executeWithRetry(executeCommand, step.retries);
      }

      return {
        ...step,
        status: result.success ? 'completed' : 'failed',
        output: result.stdout,
        error: result.stderr || result.error,
        completedAt: new Date(),
      };
    } catch (error) {
      logger.error('Command step execution failed', {
        error,
        stepId: step.id,
        command: step.command,
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
