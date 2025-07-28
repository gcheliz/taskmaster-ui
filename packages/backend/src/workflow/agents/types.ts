import { AgentType, WorkflowContext } from '../types';

export type AgentStatus = 'idle' | 'busy' | 'error' | 'terminated';

export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  status: AgentStatus;
  context: WorkflowContext;
  config: Record<string, any>;
  createdAt: Date;
  lastActivity: Date;
  currentTask?: string | undefined;
  lastError?: string | undefined;
  processId?: number | undefined;
  metrics: AgentMetrics;
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksFaileded: number;
  totalExecutionTime: number;
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'data' | 'command' | 'query' | 'response';
  content: any;
  timestamp: Date;
}

export interface AgentResult {
  success: boolean;
  output?: any;
  error?: string | undefined;
  executionTime: number;
  agentId: string;
  task: string;
}

export interface AgentCoordinator {
  createAgent(
    type: AgentType,
    name: string,
    context: WorkflowContext
  ): Promise<Agent>;
  executeTask(
    agentId: string,
    task: string,
    timeout?: number
  ): Promise<AgentResult>;
  sendMessage(
    fromAgentId: string,
    toAgentId: string,
    message: any
  ): Promise<void>;
  waitForAgents(agentIds: string[], timeout?: number): Promise<void>;
  terminateAgent(agentId: string): Promise<void>;
}
