import { BaseStepExecutor } from './BaseStepExecutor';
import { WorkflowStep, WorkflowContext } from '../types';
import { AgentManager } from '../agents/AgentManager';
import { logger } from '../../utils/logger';

export class EnhancedAgentStepExecutor extends BaseStepExecutor {
  constructor(private agentManager: AgentManager) {
    super();
  }

  async execute(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<WorkflowStep> {
    try {
      if (!step.agentType) {
        throw new Error('Agent type is required for agent steps');
      }

      logger.info(`Executing enhanced agent step: ${step.name}`, {
        stepId: step.id,
        agentType: step.agentType,
        projectId: context.projectId,
      });

      // Create agent for this step
      const agent = await this.agentManager.createAgent(
        step.agentType,
        `${step.name}-agent`,
        context,
        {
          stepId: step.id,
          workflowId: context.metadata?.['workflowId'],
        }
      );

      // Build task description
      const task = step.description
        ? this.interpolateVariables(step.description, context)
        : step.name;

      // Execute task with agent
      const executeTask = async () => {
        return await this.agentManager.executeTask(
          agent.id,
          task,
          step.timeout
        );
      };

      let result;
      if (step.retries && step.retries > 0) {
        result = await this.executeWithRetry(executeTask, step.retries);
      } else {
        result = await executeTask();
      }

      // Share results with other agents if needed
      if (result.success && result.output) {
        this.agentManager.setSharedData(`${step.id}_result`, result.output);
      }

      // Clean up agent
      await this.agentManager.terminateAgent(agent.id);

      return {
        ...step,
        status: result.success ? 'completed' : 'failed',
        output: result.output,
        error: result.error,
        completedAt: new Date(),
      };
    } catch (error) {
      logger.error('Enhanced agent step execution failed', {
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
}
