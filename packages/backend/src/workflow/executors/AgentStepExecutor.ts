import { BaseStepExecutor } from './BaseStepExecutor';
import { WorkflowStep, WorkflowContext, AgentType } from '../types';
import { TaskMasterService } from '../../services/taskMasterService';
import { logger } from '../../utils/logger';

export class AgentStepExecutor extends BaseStepExecutor {
  private taskMasterService: TaskMasterService;

  constructor() {
    super();
    this.taskMasterService = new TaskMasterService();
  }

  async execute(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<WorkflowStep> {
    try {
      if (!step.agentType) {
        throw new Error('Agent type is required for agent steps');
      }

      logger.info(`Executing agent step: ${step.name}`, {
        stepId: step.id,
        agentType: step.agentType,
        projectId: context.projectId,
      });

      const command = this.buildAgentCommand(step, context);

      const executeTask = async () => {
        const result = await this.taskMasterService.execute(
          'custom',
          { command },
          context.repositoryPath
        );
        return result;
      };

      const result = step.timeout
        ? await this.executeWithTimeout(executeTask, step.timeout)
        : await executeTask();

      if (step.retries) {
        await this.executeWithRetry(executeTask, step.retries);
      }

      return {
        ...step,
        status: result.success ? 'completed' : 'failed',
        output: result.output,
        error: result.error,
        completedAt: new Date(),
      };
    } catch (error) {
      logger.error('Agent step execution failed', {
        error,
        stepId: step.id,
        agentType: step.agentType,
      });

      return {
        ...step,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      };
    }
  }

  private buildAgentCommand(
    step: WorkflowStep,
    context: WorkflowContext
  ): string {
    const baseCommand = this.getAgentBaseCommand(step.agentType!);
    const description = step.description
      ? this.interpolateVariables(step.description, context)
      : '';

    // Build command based on agent type and context
    switch (step.agentType) {
      case 'backend':
        return `${baseCommand} --task="${description}" --path=backend`;

      case 'frontend':
        return `${baseCommand} --task="${description}" --path=frontend`;

      case 'testing':
        return `${baseCommand} --task="${description}" --type=test`;

      case 'code-review':
        return `${baseCommand} --task="${description}" --type=review`;

      case 'documentation':
        return `${baseCommand} --task="${description}" --type=docs`;

      case 'devops':
        return `${baseCommand} --task="${description}" --type=infrastructure`;

      default:
        return `${baseCommand} --task="${description}"`;
    }
  }

  private getAgentBaseCommand(agentType: AgentType): string {
    // Map agent types to task-master commands
    const agentCommands: Record<AgentType, string> = {
      backend: 'task-master agent backend',
      frontend: 'task-master agent frontend',
      testing: 'task-master agent testing',
      'code-review': 'task-master agent review',
      documentation: 'task-master agent docs',
      devops: 'task-master agent devops',
    };

    return agentCommands[agentType] || 'task-master agent';
  }
}
