import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import { AgentType, WorkflowContext } from '../types';
import { TaskMasterService } from '../../services/taskMasterService';
import { Agent, AgentStatus, AgentMessage, AgentResult } from './types';

export class AgentManager extends EventEmitter {
  private agents: Map<string, Agent>;
  private taskMasterService: TaskMasterService;
  private agentQueues: Map<string, AgentMessage[]>;
  private sharedContext: Map<string, any>;

  constructor() {
    super();
    this.agents = new Map();
    this.agentQueues = new Map();
    this.sharedContext = new Map();
    this.taskMasterService = new TaskMasterService();
  }

  async createAgent(
    type: AgentType,
    name: string,
    context: WorkflowContext,
    config?: any
  ): Promise<Agent> {
    const agentId = uuidv4();

    const agent: Agent = {
      id: agentId,
      type,
      name,
      status: 'idle',
      context: { ...context },
      config: config || {},
      createdAt: new Date(),
      lastActivity: new Date(),
      metrics: {
        tasksCompleted: 0,
        tasksFaileded: 0,
        totalExecutionTime: 0,
      },
    };

    this.agents.set(agentId, agent);
    this.agentQueues.set(agentId, []);

    logger.info('Agent created', {
      agentId,
      type,
      name,
      projectId: context.projectId,
    });

    this.emit('agent.created', agent);
    return agent;
  }

  async executeTask(
    agentId: string,
    task: string,
    timeout?: number
  ): Promise<AgentResult> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (agent.status === 'busy') {
      throw new Error(`Agent ${agentId} is busy`);
    }

    const startTime = Date.now();
    agent.status = 'busy';
    agent.lastActivity = new Date();
    agent.currentTask = task;

    this.emit('agent.task.started', { agentId, task });

    try {
      const result = await this.performAgentTask(agent, task, timeout);

      const executionTime = Date.now() - startTime;
      agent.metrics.tasksCompleted++;
      agent.metrics.totalExecutionTime += executionTime;

      agent.status = 'idle';
      agent.currentTask = undefined;
      agent.lastActivity = new Date();

      this.emit('agent.task.completed', {
        agentId,
        task,
        result,
        executionTime,
      });

      return {
        success: true,
        output: result.output,
        executionTime,
        agentId,
        task,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      agent.metrics.tasksFaileded++;
      agent.status = 'error';
      agent.lastError =
        error instanceof Error ? error.message : 'Unknown error';
      agent.currentTask = undefined;
      agent.lastActivity = new Date();

      logger.error('Agent task failed', {
        error,
        agentId,
        task,
        agentType: agent.type,
      });

      this.emit('agent.task.failed', {
        agentId,
        task,
        error: agent.lastError,
        executionTime,
      });

      return {
        success: false,
        error: agent.lastError,
        executionTime,
        agentId,
        task,
      };
    }
  }

  async sendMessage(
    fromAgentId: string,
    toAgentId: string,
    message: any
  ): Promise<void> {
    const fromAgent = this.agents.get(fromAgentId);
    const toAgent = this.agents.get(toAgentId);

    if (!fromAgent || !toAgent) {
      throw new Error('Invalid agent IDs for messaging');
    }

    const agentMessage: AgentMessage = {
      id: uuidv4(),
      from: fromAgentId,
      to: toAgentId,
      type: 'data',
      content: message,
      timestamp: new Date(),
    };

    const queue = this.agentQueues.get(toAgentId);
    if (queue) {
      queue.push(agentMessage);
    }

    this.emit('agent.message', agentMessage);

    // Process message if recipient is idle
    if (toAgent.status === 'idle') {
      await this.processAgentMessages(toAgentId);
    }
  }

  async broadcastMessage(
    fromAgentId: string,
    message: any,
    filter?: (agent: Agent) => boolean
  ): Promise<void> {
    const fromAgent = this.agents.get(fromAgentId);
    if (!fromAgent) {
      throw new Error(`Agent ${fromAgentId} not found`);
    }

    const recipients = Array.from(this.agents.values()).filter(
      agent => agent.id !== fromAgentId && (!filter || filter(agent))
    );

    for (const recipient of recipients) {
      await this.sendMessage(fromAgentId, recipient.id, message);
    }
  }

  async waitForAgents(
    agentIds: string[],
    timeout: number = 300000
  ): Promise<void> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkAgents = () => {
        const allIdle = agentIds.every(id => {
          const agent = this.agents.get(id);
          return agent && (agent.status === 'idle' || agent.status === 'error');
        });

        if (allIdle) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for agents'));
        } else {
          setTimeout(checkAgents, 1000);
        }
      };

      checkAgents();
    });
  }

  setSharedData(key: string, value: any): void {
    this.sharedContext.set(key, value);
    this.emit('context.updated', { key, value });
  }

  getSharedData(key: string): any {
    return this.sharedContext.get(key);
  }

  getAllSharedData(): Record<string, any> {
    const data: Record<string, any> = {};
    for (const [key, value] of this.sharedContext.entries()) {
      data[key] = value;
    }
    return data;
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAgentsByType(type: AgentType): Agent[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.type === type
    );
  }

  getAgentsByStatus(status: AgentStatus): Agent[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.status === status
    );
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  async terminateAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return;
    }

    if (agent.status === 'busy' && agent.processId) {
      // Kill any running process
      try {
        process.kill(agent.processId, 'SIGTERM');
      } catch (error) {
        logger.warn('Failed to kill agent process', { error, agentId });
      }
    }

    this.agents.delete(agentId);
    this.agentQueues.delete(agentId);

    this.emit('agent.terminated', { agentId });
  }

  async terminateAllAgents(): Promise<void> {
    const agentIds = Array.from(this.agents.keys());
    for (const agentId of agentIds) {
      await this.terminateAgent(agentId);
    }
  }

  private async performAgentTask(
    agent: Agent,
    task: string,
    timeout?: number
  ): Promise<any> {
    // Map agent type to task-master command
    const commandMap: Record<AgentType, string> = {
      backend: 'backend-task',
      frontend: 'frontend-task',
      testing: 'test-task',
      'code-review': 'review-task',
      documentation: 'docs-task',
      devops: 'devops-task',
    };

    const operation = commandMap[agent.type] || 'custom-task';

    try {
      const result = await this.taskMasterService.execute(
        operation as any,
        {
          task,
          context: agent.context,
          sharedData: this.getAllSharedData(),
        },
        agent.context.repositoryPath,
        { timeout }
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  private async processAgentMessages(agentId: string): Promise<void> {
    const queue = this.agentQueues.get(agentId);
    const agent = this.agents.get(agentId);

    if (!queue || !agent || queue.length === 0) {
      return;
    }

    while (queue.length > 0 && agent.status === 'idle') {
      const message = queue.shift();
      if (message) {
        this.emit('agent.message.processing', { agentId, message });

        // Handle different message types
        switch (message.type) {
          case 'data':
            // Store in shared context
            this.setSharedData(
              `${message.from}_to_${message.to}`,
              message.content
            );
            break;

          case 'command':
            // Execute command
            await this.executeTask(agentId, message.content);
            break;

          case 'query':
            // Respond to query
            const response = this.getSharedData(message.content);
            await this.sendMessage(agentId, message.from, response);
            break;
        }
      }
    }
  }

  getAgentMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {
      totalAgents: this.agents.size,
      agentsByType: {},
      agentsByStatus: {},
      totalTasksCompleted: 0,
      totalTasksFailed: 0,
      averageExecutionTime: 0,
    };

    let totalExecutionTime = 0;
    let totalTasks = 0;

    for (const agent of this.agents.values()) {
      // Count by type
      metrics.agentsByType[agent.type] =
        (metrics.agentsByType[agent.type] || 0) + 1;

      // Count by status
      metrics.agentsByStatus[agent.status] =
        (metrics.agentsByStatus[agent.status] || 0) + 1;

      // Aggregate metrics
      metrics.totalTasksCompleted += agent.metrics.tasksCompleted;
      metrics.totalTasksFailed += agent.metrics.tasksFaileded;
      totalExecutionTime += agent.metrics.totalExecutionTime;
      totalTasks += agent.metrics.tasksCompleted + agent.metrics.tasksFaileded;
    }

    if (totalTasks > 0) {
      metrics.averageExecutionTime = totalExecutionTime / totalTasks;
    }

    return metrics;
  }
}
