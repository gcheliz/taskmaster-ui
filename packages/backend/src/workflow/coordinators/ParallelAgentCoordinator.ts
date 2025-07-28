import { EventEmitter } from 'events';
import { AgentManager } from '../agents/AgentManager';
import { WorkflowStep, WorkflowContext, AgentType } from '../types';
import { Agent, AgentResult } from '../agents/types';
import { logger } from '../../utils/logger';

export interface ParallelExecutionPlan {
  groups: ExecutionGroup[];
  sharedDataKeys: string[];
}

export interface ExecutionGroup {
  id: string;
  agents: AgentTask[];
  waitForPrevious: boolean;
  shareResults: boolean;
}

export interface AgentTask {
  agentType: AgentType;
  name: string;
  task: string;
  dependsOnAgents?: string[] | undefined;
  timeout?: number | undefined;
}

export class ParallelAgentCoordinator extends EventEmitter {
  private agentManager: AgentManager;
  private runningAgents: Map<string, Agent>;
  private results: Map<string, AgentResult>;

  constructor() {
    super();
    this.agentManager = new AgentManager();
    this.runningAgents = new Map();
    this.results = new Map();

    // Forward agent events
    this.agentManager.on('agent.task.completed', event => {
      this.emit('agent.completed', event);
    });

    this.agentManager.on('agent.task.failed', event => {
      this.emit('agent.failed', event);
    });
  }

  async executePlan(
    plan: ParallelExecutionPlan,
    context: WorkflowContext
  ): Promise<Map<string, AgentResult>> {
    try {
      logger.info('Executing parallel agent plan', {
        groups: plan.groups.length,
        projectId: context.projectId,
      });

      for (const group of plan.groups) {
        await this.executeGroup(group, context);

        if (group.shareResults) {
          this.shareGroupResults(group);
        }
      }

      return this.results;
    } catch (error) {
      logger.error('Parallel execution plan failed', { error });

      // Terminate all running agents on failure
      await this.terminateAllAgents();

      throw error;
    }
  }

  async executeParallelSteps(
    steps: WorkflowStep[],
    context: WorkflowContext
  ): Promise<WorkflowStep[]> {
    try {
      // Convert steps to execution plan
      const plan = this.createPlanFromSteps(steps);

      // Execute plan
      const results = await this.executePlan(plan, context);

      // Update steps with results
      return steps.map(step => {
        const result = results.get(step.id);
        if (result) {
          return {
            ...step,
            status: result.success ? 'completed' : 'failed',
            output: result.output,
            error: result.error,
            completedAt: new Date(),
          };
        }
        return {
          ...step,
          status: 'skipped',
          completedAt: new Date(),
        };
      });
    } catch (error) {
      logger.error('Parallel step execution failed', { error });
      throw error;
    }
  }

  private async executeGroup(
    group: ExecutionGroup,
    context: WorkflowContext
  ): Promise<void> {
    const groupAgents: Map<string, Agent> = new Map();

    try {
      // Create all agents for this group
      for (const agentTask of group.agents) {
        const agent = await this.agentManager.createAgent(
          agentTask.agentType,
          agentTask.name,
          context
        );
        groupAgents.set(agentTask.name, agent);
        this.runningAgents.set(agent.id, agent);
      }

      // Execute tasks in parallel
      const promises = group.agents.map(async agentTask => {
        const agent = groupAgents.get(agentTask.name);
        if (!agent) {
          throw new Error(`Agent ${agentTask.name} not found`);
        }

        // Wait for dependencies if specified
        if (agentTask.dependsOnAgents && agentTask.dependsOnAgents.length > 0) {
          await this.waitForDependencies(
            agentTask.dependsOnAgents,
            groupAgents
          );
        }

        // Execute task
        const result = await this.agentManager.executeTask(
          agent.id,
          agentTask.task,
          agentTask.timeout
        );

        this.results.set(agentTask.name, result);
        return result;
      });

      // Wait for all tasks in group to complete
      await Promise.all(promises);

      logger.info('Execution group completed', {
        groupId: group.id,
        agentCount: group.agents.length,
      });
    } finally {
      // Clean up agents
      for (const agent of groupAgents.values()) {
        await this.agentManager.terminateAgent(agent.id);
        this.runningAgents.delete(agent.id);
      }
    }
  }

  private async waitForDependencies(
    dependencyNames: string[],
    groupAgents: Map<string, Agent>
  ): Promise<void> {
    const dependencyAgentIds = dependencyNames
      .map(name => groupAgents.get(name)?.id)
      .filter(id => id !== undefined) as string[];

    if (dependencyAgentIds.length > 0) {
      await this.agentManager.waitForAgents(dependencyAgentIds);
    }
  }

  private shareGroupResults(group: ExecutionGroup): void {
    for (const agentTask of group.agents) {
      const result = this.results.get(agentTask.name);
      if (result && result.success && result.output) {
        this.agentManager.setSharedData(
          `${group.id}_${agentTask.name}_result`,
          result.output
        );
      }
    }
  }

  private createPlanFromSteps(steps: WorkflowStep[]): ParallelExecutionPlan {
    // Group steps by their dependencies
    const groups: ExecutionGroup[] = [];
    const processedSteps = new Set<string>();

    // First group: steps with no dependencies
    const noDepsSteps = steps.filter(
      step => !step.dependsOn || step.dependsOn.length === 0
    );

    if (noDepsSteps.length > 0) {
      groups.push({
        id: 'group-1',
        agents: noDepsSteps.map(step => ({
          agentType: step.agentType || 'backend',
          name: step.id,
          task: step.description || step.name,
          timeout: step.timeout,
        })),
        waitForPrevious: false,
        shareResults: true,
      });

      noDepsSteps.forEach(step => processedSteps.add(step.id));
    }

    // Subsequent groups: steps with dependencies
    let groupIndex = 2;
    while (processedSteps.size < steps.length) {
      const nextSteps = steps.filter(
        step =>
          !processedSteps.has(step.id) &&
          step.dependsOn?.every(dep => processedSteps.has(dep))
      );

      if (nextSteps.length === 0) {
        // Circular dependency or unresolvable
        logger.warn('Unable to resolve all step dependencies');
        break;
      }

      groups.push({
        id: `group-${groupIndex}`,
        agents: nextSteps.map(step => ({
          agentType: step.agentType || 'backend',
          name: step.id,
          task: step.description || step.name,
          dependsOnAgents: step.dependsOn,
          timeout: step.timeout,
        })),
        waitForPrevious: true,
        shareResults: true,
      });

      nextSteps.forEach(step => processedSteps.add(step.id));
      groupIndex++;
    }

    return {
      groups,
      sharedDataKeys: Array.from(processedSteps),
    };
  }

  private async terminateAllAgents(): Promise<void> {
    const agentIds = Array.from(this.runningAgents.keys());
    for (const agentId of agentIds) {
      await this.agentManager.terminateAgent(agentId);
    }
    this.runningAgents.clear();
  }

  getAgentManager(): AgentManager {
    return this.agentManager;
  }

  getResults(): Map<string, AgentResult> {
    return new Map(this.results);
  }
}
