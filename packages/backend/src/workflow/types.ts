export type WorkflowStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused';

export type StepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

export type WorkflowType =
  | 'feature'
  | 'bugfix'
  | 'refactor'
  | 'documentation'
  | 'testing'
  | 'custom';

export type AgentType =
  | 'backend'
  | 'frontend'
  | 'testing'
  | 'code-review'
  | 'documentation'
  | 'devops';

export interface WorkflowContext {
  projectId: string;
  repositoryPath: string;
  branch: string;
  taskId?: string | undefined;
  variables: Record<string, any>;
  metadata: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string | undefined;
  type: 'agent' | 'command' | 'condition' | 'parallel' | 'sequential';
  agentType?: AgentType | undefined;
  command?: string | undefined;
  condition?: string | undefined;
  steps?: WorkflowStep[] | undefined;
  timeout?: number | undefined;
  retries?: number | undefined;
  onSuccess?: string[] | undefined;
  onFailure?: string[] | undefined;
  dependsOn?: string[] | undefined;
  status: StepStatus;
  startedAt?: Date | undefined;
  completedAt?: Date | undefined;
  output?: any;
  error?: string | undefined;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: WorkflowType;
  version: string;
  author?: string | undefined;
  tags?: string[] | undefined;
  variables?: WorkflowVariable[] | undefined;
  steps: WorkflowStep[];
  onSuccess?: WorkflowStep[] | undefined;
  onFailure?: WorkflowStep[] | undefined;
  timeout?: number | undefined;
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean | undefined;
  default?: any;
  description?: string | undefined;
  validation?: string | undefined;
}

export interface WorkflowInstance {
  id: string;
  templateId: string;
  name: string;
  type: WorkflowType;
  status: WorkflowStatus;
  context: WorkflowContext;
  steps: WorkflowStep[];
  currentStepId?: string | undefined;
  progress: number;
  startedAt: Date;
  completedAt?: Date | undefined;
  error?: string | undefined;
  logs: WorkflowLog[];
}

export interface WorkflowLog {
  id: string;
  workflowId: string;
  stepId?: string | undefined;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  timestamp: Date;
}

export interface WorkflowEvent {
  type:
    | 'workflow.started'
    | 'workflow.completed'
    | 'workflow.failed'
    | 'workflow.cancelled'
    | 'workflow.paused'
    | 'workflow.resumed'
    | 'step.started'
    | 'step.completed'
    | 'step.failed'
    | 'step.skipped';
  workflowId: string;
  stepId?: string | undefined;
  data?: any;
  timestamp: Date;
}

export interface WorkflowExecutor {
  execute(
    template: WorkflowTemplate,
    context: WorkflowContext
  ): Promise<WorkflowInstance>;
  pause(workflowId: string): Promise<void>;
  resume(workflowId: string): Promise<void>;
  cancel(workflowId: string): Promise<void>;
  getStatus(workflowId: string): Promise<WorkflowInstance>;
}

export interface StepExecutor {
  execute(step: WorkflowStep, context: WorkflowContext): Promise<WorkflowStep>;
}

export interface WorkflowRepository {
  getTemplate(id: string): Promise<WorkflowTemplate | null>;
  getTemplateByType(type: WorkflowType): Promise<WorkflowTemplate[]>;
  saveTemplate(template: WorkflowTemplate): Promise<void>;
  deleteTemplate(id: string): Promise<void>;
  listTemplates(): Promise<WorkflowTemplate[]>;
}

export interface WorkflowInstanceRepository {
  save(instance: WorkflowInstance): Promise<void>;
  get(id: string): Promise<WorkflowInstance | null>;
  list(filters?: Partial<WorkflowInstance>): Promise<WorkflowInstance[]>;
  update(id: string, updates: Partial<WorkflowInstance>): Promise<void>;
  delete(id: string): Promise<void>;
}
