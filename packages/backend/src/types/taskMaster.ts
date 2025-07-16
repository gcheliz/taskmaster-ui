// Task Master CLI Service Type Definitions
// Demonstrates: Strong typing for service abstraction

export interface TaskMasterConfig {
  repositoryPath: string;
  timeout?: number;
  environment?: Record<string, string>;
  verbose?: boolean;
}

export interface TaskMasterCommand {
  command: string;
  args: string[];
  description: string;
  requiresRepository: boolean;
}

export interface TaskMasterResult<T = any> {
  success: boolean;
  data?: T;
  output: string;
  error?: string;
  exitCode: number;
  duration: number;
  command: string;
  timestamp: Date;
}

export interface TaskInfo {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'done' | 'blocked' | 'deferred' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
  complexity?: number;
  description?: string;
}

export interface ProjectInfo {
  name: string;
  path: string;
  taskCount: number;
  completedTasks: number;
  lastUpdated: Date;
}

export interface ParsedTaskMasterOutput {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  data?: any;
  metadata?: Record<string, any>;
}

// Service Interface - Defines contract for TaskMaster CLI operations
export interface ITaskMasterService {
  // Project Management
  initProject(path: string, options?: { prdFile?: string }): Promise<TaskMasterResult<ProjectInfo>>;
  getProjectStatus(path: string): Promise<TaskMasterResult<ProjectInfo>>;
  
  // Task Management
  listTasks(path: string, options?: { status?: string; tag?: string }): Promise<TaskMasterResult<TaskInfo[]>>;
  getTask(path: string, taskId: string, options?: { tag?: string }): Promise<TaskMasterResult<TaskInfo>>;
  updateTaskStatus(path: string, taskId: string, status: string, options?: { tag?: string }): Promise<TaskMasterResult<TaskInfo>>;
  getNextTask(path: string, options?: { tag?: string }): Promise<TaskMasterResult<TaskInfo | null>>;
  
  // Advanced Operations
  parsePRD(path: string, prdFile: string, options?: { append?: boolean }): Promise<TaskMasterResult>;
  expandTask(path: string, taskId: string, options?: { research?: boolean; force?: boolean; tag?: string }): Promise<TaskMasterResult>;
  analyzeComplexity(path: string, options?: { from?: number; to?: number; research?: boolean; tag?: string }): Promise<TaskMasterResult>;
  
  // Utility Operations
  validateDependencies(path: string, options?: { tag?: string }): Promise<TaskMasterResult>;
  generateReport(path: string, type: 'complexity' | 'progress', options?: { tag?: string }): Promise<TaskMasterResult>;
}

// Command Builder Interface - For constructing CLI commands
export interface ITaskMasterCommandBuilder {
  buildCommand(operation: string, args?: Record<string, any>): TaskMasterCommand;
  validateCommand(command: TaskMasterCommand): boolean;
  getAvailableCommands(): TaskMasterCommand[];
}

// Output Parser Interface - For parsing CLI output
export interface ITaskMasterOutputParser {
  parseOutput(rawOutput: string, command: string): ParsedTaskMasterOutput[];
  extractTaskInfo(output: string): TaskInfo | null;
  extractProjectInfo(output: string): ProjectInfo | null;
  isErrorOutput(output: string): boolean;
}

// Configuration Interface
export interface ITaskMasterConfigManager {
  getConfig(repositoryPath: string): Promise<TaskMasterConfig>;
  updateConfig(repositoryPath: string, config: Partial<TaskMasterConfig>): Promise<void>;
  validateConfig(config: TaskMasterConfig): boolean;
}