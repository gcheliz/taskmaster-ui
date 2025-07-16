import { EventEmitter } from 'events';
import { 
  ITaskMasterService, 
  TaskMasterConfig, 
  TaskMasterResult, 
  TaskInfo, 
  ProjectInfo 
} from '../types/taskMaster';
import { CommandExecutor, commandExecutor } from './commandExecutor';
import { TaskMasterCommandBuilder, taskMasterCommandBuilder } from './taskMasterCommandBuilder';
import { TaskMasterOutputParser, taskMasterOutputParser } from './taskMasterOutputParser';
import { logger, LogContext } from '../utils/logger';
import { errorHandler, TaskMasterError, ErrorType } from '../utils/errorHandler';

/**
 * Facade Pattern Implementation for TaskMaster CLI Service
 * Demonstrates: Facade pattern, dependency injection, event-driven architecture
 */
export class TaskMasterService extends EventEmitter implements ITaskMasterService {
  private commandExecutor: CommandExecutor;
  private commandBuilder: TaskMasterCommandBuilder;
  private outputParser: TaskMasterOutputParser;
  private defaultConfig: Partial<TaskMasterConfig>;

  constructor(
    executor?: CommandExecutor,
    builder?: TaskMasterCommandBuilder,
    parser?: TaskMasterOutputParser,
    config?: Partial<TaskMasterConfig>
  ) {
    super();
    
    // Dependency injection with defaults (IoC pattern)
    this.commandExecutor = executor || commandExecutor;
    this.commandBuilder = builder || taskMasterCommandBuilder;
    this.outputParser = parser || taskMasterOutputParser;
    this.defaultConfig = config || {
      timeout: 60000, // 60 seconds
      verbose: false
    };

    // Set up event forwarding from command executor
    this.commandExecutor.on('progress', (processId, progress) => {
      this.emit('commandProgress', processId, progress);
    });
  }

  /**
   * Initialize a new TaskMaster project
   */
  async initProject(path: string, options: { prdFile?: string } = {}): Promise<TaskMasterResult<ProjectInfo>> {
    const startTime = Date.now();
    
    const requestId = this.generateRequestId();
    const context: LogContext = {
      requestId,
      repositoryPath: path,
      operation: 'init',
      prdFile: options.prdFile
    };

    logger.info('Initializing TaskMaster project', context, 'service');
    
    try {
      // Validate inputs
      this.validateRepositoryPath(path, context);
      
      this.emit('operationStart', 'initProject', { path, options });
      logger.logCliExecution('init', path, context);
      
      const command = this.commandBuilder.buildCommand('init', {
        prdFile: options.prdFile
      });

      logger.debug('Built init command', { ...context, command: command.command }, 'service');

      const result = await this.commandExecutor.executeCommand(
        command.command,
        command.args,
        {
          cwd: path,
          timeout: this.defaultConfig.timeout
        }
      );

      const duration = Date.now() - startTime;

      if (!result.success) {
        const error = new Error(result.stderr || 'Initialization failed');
        const taskMasterError = errorHandler.handleCliError(error, {
          ...context,
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode
        });
        
        logger.logCliResult('init', false, duration, context, taskMasterError);
        
        throw taskMasterError;
      }

      // Parse output with error handling
      let projectInfo: ProjectInfo | null = null;
      try {
        projectInfo = this.outputParser.extractProjectInfo(result.stdout);
      } catch (parseError) {
        const taskMasterError = errorHandler.handleParsingError(
          result.stdout, 
          'init', 
          parseError as Error, 
          context
        );
        
        logger.warn('Failed to parse init output, using defaults', context, 'service');
        // Continue with default project info instead of failing
      }

      const finalProjectInfo = projectInfo || {
        name: 'TaskMaster Project',
        path,
        taskCount: 0,
        completedTasks: 0,
        lastUpdated: new Date()
      };

      const taskMasterResult: TaskMasterResult<ProjectInfo> = {
        success: true,
        data: finalProjectInfo,
        output: result.stdout,
        error: result.stderr,
        exitCode: result.exitCode || 0,
        duration,
        command: `${command.command} ${command.args.join(' ')}`,
        timestamp: new Date()
      };

      logger.logCliResult('init', true, duration, context);
      this.emit('operationComplete', 'initProject', taskMasterResult);
      return taskMasterResult;

    } catch (error) {
      const duration = Date.now() - startTime;
      const taskMasterError = error instanceof TaskMasterError ? 
        error : 
        errorHandler.normalizeError(error, context);
      
      logger.logCliResult('init', false, duration, context, taskMasterError);
      
      const errorResult = this.createErrorResult<ProjectInfo>(
        taskMasterError,
        'initProject',
        path,
        startTime
      );
      
      this.emit('operationError', 'initProject', errorResult);
      throw taskMasterError;
    }
  }

  /**
   * Get project status and overview
   */
  async getProjectStatus(path: string): Promise<TaskMasterResult<ProjectInfo>> {
    const startTime = Date.now();
    
    try {
      this.emit('operationStart', 'getProjectStatus', { path });
      
      const command = this.commandBuilder.buildCommand('list', {
        tag: this.extractTagFromPath(path)
      });

      const result = await this.commandExecutor.executeCommand(
        command.command,
        command.args,
        {
          cwd: path,
          timeout: this.defaultConfig.timeout
        }
      );

      const projectInfo = this.outputParser.extractProjectInfo(result.stdout) || {
        name: 'TaskMaster Project',
        path,
        taskCount: 0,
        completedTasks: 0,
        lastUpdated: new Date()
      };

      // Enhance project info with path
      projectInfo.path = path;

      const taskMasterResult: TaskMasterResult<ProjectInfo> = {
        success: result.success,
        data: projectInfo,
        output: result.stdout,
        error: result.stderr,
        exitCode: result.exitCode || 0,
        duration: Date.now() - startTime,
        command: `${command.command} ${command.args.join(' ')}`,
        timestamp: new Date()
      };

      this.emit('operationComplete', 'getProjectStatus', taskMasterResult);
      return taskMasterResult;

    } catch (error) {
      const errorResult = this.createErrorResult<ProjectInfo>(
        error as Error,
        'getProjectStatus',
        path,
        startTime
      );
      
      this.emit('operationError', 'getProjectStatus', errorResult);
      throw error;
    }
  }

  /**
   * List tasks with filtering options
   */
  async listTasks(path: string, options: { status?: string; tag?: string } = {}): Promise<TaskMasterResult<TaskInfo[]>> {
    const startTime = Date.now();
    
    try {
      this.emit('operationStart', 'listTasks', { path, options });
      
      const command = this.commandBuilder.buildCommand('list', {
        status: options.status,
        tag: options.tag || this.extractTagFromPath(path)
      });

      const result = await this.commandExecutor.executeCommand(
        command.command,
        command.args,
        {
          cwd: path,
          timeout: this.defaultConfig.timeout
        }
      );

      const parsedOutput = this.outputParser.parseOutput(result.stdout, 'list');
      const tasks = parsedOutput
        .filter(p => p.metadata?.type === 'task')
        .map(p => p.data as TaskInfo);

      const taskMasterResult: TaskMasterResult<TaskInfo[]> = {
        success: result.success,
        data: tasks,
        output: result.stdout,
        error: result.stderr,
        exitCode: result.exitCode || 0,
        duration: Date.now() - startTime,
        command: `${command.command} ${command.args.join(' ')}`,
        timestamp: new Date()
      };

      this.emit('operationComplete', 'listTasks', taskMasterResult);
      return taskMasterResult;

    } catch (error) {
      const errorResult = this.createErrorResult<TaskInfo[]>(
        error as Error,
        'listTasks',
        path,
        startTime
      );
      
      this.emit('operationError', 'listTasks', errorResult);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific task
   */
  async getTask(path: string, taskId: string, options: { tag?: string } = {}): Promise<TaskMasterResult<TaskInfo>> {
    const startTime = Date.now();
    
    try {
      this.emit('operationStart', 'getTask', { path, taskId, options });
      
      const command = this.commandBuilder.buildCommand('show', {
        id: taskId,
        tag: options.tag || this.extractTagFromPath(path)
      });

      const result = await this.commandExecutor.executeCommand(
        command.command,
        command.args,
        {
          cwd: path,
          timeout: this.defaultConfig.timeout
        }
      );

      const taskInfo = this.outputParser.extractTaskInfo(result.stdout);
      
      if (!taskInfo) {
        throw new Error(`Task ${taskId} not found or could not be parsed`);
      }

      const taskMasterResult: TaskMasterResult<TaskInfo> = {
        success: result.success,
        data: taskInfo,
        output: result.stdout,
        error: result.stderr,
        exitCode: result.exitCode || 0,
        duration: Date.now() - startTime,
        command: `${command.command} ${command.args.join(' ')}`,
        timestamp: new Date()
      };

      this.emit('operationComplete', 'getTask', taskMasterResult);
      return taskMasterResult;

    } catch (error) {
      const errorResult = this.createErrorResult<TaskInfo>(
        error as Error,
        'getTask',
        `${path}:${taskId}`,
        startTime
      );
      
      this.emit('operationError', 'getTask', errorResult);
      throw error;
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    path: string, 
    taskId: string, 
    status: string, 
    options: { tag?: string } = {}
  ): Promise<TaskMasterResult<TaskInfo>> {
    const startTime = Date.now();
    
    try {
      this.emit('operationStart', 'updateTaskStatus', { path, taskId, status, options });
      
      const command = this.commandBuilder.buildCommand('set-status', {
        id: taskId,
        status,
        tag: options.tag || this.extractTagFromPath(path)
      });

      const result = await this.commandExecutor.executeCommand(
        command.command,
        command.args,
        {
          cwd: path,
          timeout: this.defaultConfig.timeout
        }
      );

      // Get updated task info
      const updatedTask = await this.getTask(path, taskId, options);

      const taskMasterResult: TaskMasterResult<TaskInfo> = {
        success: result.success,
        data: updatedTask.data,
        output: result.stdout,
        error: result.stderr,
        exitCode: result.exitCode || 0,
        duration: Date.now() - startTime,
        command: `${command.command} ${command.args.join(' ')}`,
        timestamp: new Date()
      };

      this.emit('operationComplete', 'updateTaskStatus', taskMasterResult);
      return taskMasterResult;

    } catch (error) {
      const errorResult = this.createErrorResult<TaskInfo>(
        error as Error,
        'updateTaskStatus',
        `${path}:${taskId}`,
        startTime
      );
      
      this.emit('operationError', 'updateTaskStatus', errorResult);
      throw error;
    }
  }

  /**
   * Get next available task
   */
  async getNextTask(path: string, options: { tag?: string } = {}): Promise<TaskMasterResult<TaskInfo | null>> {
    const startTime = Date.now();
    
    try {
      this.emit('operationStart', 'getNextTask', { path, options });
      
      const command = this.commandBuilder.buildCommand('next', {
        tag: options.tag || this.extractTagFromPath(path)
      });

      const result = await this.commandExecutor.executeCommand(
        command.command,
        command.args,
        {
          cwd: path,
          timeout: this.defaultConfig.timeout
        }
      );

      const taskInfo = this.outputParser.extractTaskInfo(result.stdout);

      const taskMasterResult: TaskMasterResult<TaskInfo | null> = {
        success: result.success,
        data: taskInfo,
        output: result.stdout,
        error: result.stderr,
        exitCode: result.exitCode || 0,
        duration: Date.now() - startTime,
        command: `${command.command} ${command.args.join(' ')}`,
        timestamp: new Date()
      };

      this.emit('operationComplete', 'getNextTask', taskMasterResult);
      return taskMasterResult;

    } catch (error) {
      const errorResult = this.createErrorResult<TaskInfo | null>(
        error as Error,
        'getNextTask',
        path,
        startTime
      );
      
      this.emit('operationError', 'getNextTask', errorResult);
      throw error;
    }
  }

  // Additional methods for advanced operations...
  async parsePRD(path: string, prdFile: string, options: { append?: boolean } = {}): Promise<TaskMasterResult> {
    return this.executeGenericCommand('parse-prd', path, {
      file: prdFile,
      append: options.append
    });
  }

  async expandTask(
    path: string, 
    taskId: string, 
    options: { research?: boolean; force?: boolean; tag?: string } = {}
  ): Promise<TaskMasterResult> {
    return this.executeGenericCommand('expand', path, {
      id: taskId,
      research: options.research,
      force: options.force,
      tag: options.tag || this.extractTagFromPath(path)
    });
  }

  async analyzeComplexity(
    path: string, 
    options: { from?: number; to?: number; research?: boolean; tag?: string } = {}
  ): Promise<TaskMasterResult> {
    return this.executeGenericCommand('analyze-complexity', path, {
      from: options.from,
      to: options.to,
      research: options.research,
      tag: options.tag || this.extractTagFromPath(path)
    });
  }

  async validateDependencies(path: string, options: { tag?: string } = {}): Promise<TaskMasterResult> {
    return this.executeGenericCommand('validate-dependencies', path, {
      tag: options.tag || this.extractTagFromPath(path)
    });
  }

  async generateReport(
    path: string, 
    type: 'complexity' | 'progress', 
    options: { tag?: string } = {}
  ): Promise<TaskMasterResult> {
    const command = type === 'complexity' ? 'complexity-report' : 'list';
    return this.executeGenericCommand(command, path, {
      tag: options.tag || this.extractTagFromPath(path)
    });
  }

  /**
   * Generic command execution helper
   */
  private async executeGenericCommand(
    operation: string, 
    path: string, 
    args: Record<string, any>
  ): Promise<TaskMasterResult> {
    const startTime = Date.now();
    
    try {
      this.emit('operationStart', operation, { path, args });
      
      const command = this.commandBuilder.buildCommand(operation, args);

      const result = await this.commandExecutor.executeCommand(
        command.command,
        command.args,
        {
          cwd: path,
          timeout: this.defaultConfig.timeout
        }
      );

      const taskMasterResult: TaskMasterResult = {
        success: result.success,
        output: result.stdout,
        error: result.stderr,
        exitCode: result.exitCode || 0,
        duration: Date.now() - startTime,
        command: `${command.command} ${command.args.join(' ')}`,
        timestamp: new Date()
      };

      this.emit('operationComplete', operation, taskMasterResult);
      return taskMasterResult;

    } catch (error) {
      const errorResult = this.createErrorResult(
        error as Error,
        operation,
        path,
        startTime
      );
      
      this.emit('operationError', operation, errorResult);
      throw error;
    }
  }

  /**
   * Helper to create error results
   */
  private createErrorResult<T>(
    error: TaskMasterError | Error, 
    operation: string, 
    context: string, 
    startTime: number
  ): TaskMasterResult<T> {
    const taskMasterError = error instanceof TaskMasterError ? 
      error : 
      errorHandler.normalizeError(error, { operation, context });
    
    return {
      success: false,
      error: taskMasterError.userMessage,
      output: '',
      exitCode: 1,
      duration: Date.now() - startTime,
      command: operation,
      timestamp: new Date()
    };
  }

  /**
   * Generate unique request ID for tracking
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate repository path
   */
  private validateRepositoryPath(path: string, context: LogContext): void {
    if (!path || typeof path !== 'string') {
      throw errorHandler.handleValidationError(
        'repositoryPath',
        path,
        'Repository path is required and must be a string',
        context
      );
    }

    if (path.trim().length === 0) {
      throw errorHandler.handleValidationError(
        'repositoryPath',
        path,
        'Repository path cannot be empty',
        context
      );
    }

    // Security check - prevent directory traversal
    if (path.includes('..') || path.includes('~')) {
      throw errorHandler.handleSecurityError(
        'Directory traversal attempt detected',
        { ...context, suspiciousPath: path },
        'high' as any
      );
    }

    // Check for reasonable path length
    if (path.length > 500) {
      throw errorHandler.handleValidationError(
        'repositoryPath',
        path,
        'Repository path is too long (max 500 characters)',
        context
      );
    }
  }

  /**
   * Validate operation name
   */
  private validateOperation(operation: string, context: LogContext): void {
    const validOperations = [
      'init', 'list', 'show', 'set-status', 'next', 'parse-prd', 
      'expand', 'analyze-complexity', 'validate-dependencies'
    ];

    if (!validOperations.includes(operation)) {
      throw errorHandler.handleValidationError(
        'operation',
        operation,
        `Invalid operation. Valid operations: ${validOperations.join(', ')}`,
        context
      );
    }
  }

  /**
   * Extract tag from repository path
   */
  private extractTagFromPath(path: string): string {
    // Extract project name from path to use as tag
    const pathParts = path.split('/');
    return pathParts[pathParts.length - 1] || 'default';
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    logger.info('Disposing TaskMaster service', {}, 'service');
    
    try {
      this.commandExecutor.killAllProcesses();
      this.removeAllListeners();
      
      logger.info('TaskMaster service disposed successfully', {}, 'service');
    } catch (error) {
      logger.error('Error disposing TaskMaster service', {}, error as Error, 'service');
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    const context = {
      requestId: this.generateRequestId(),
      operation: 'health-check'
    };

    try {
      logger.debug('Performing health check', context, 'service');
      
      // Test CLI availability by checking version or help
      const command = this.commandBuilder.buildCommand('help', {});
      
      const result = await this.commandExecutor.executeCommand(
        command.command,
        ['--version'],
        {
          timeout: 5000 // Short timeout for health check
        }
      );

      const healthy = result.success;
      const details = {
        cliAvailable: healthy,
        version: healthy ? result.stdout.trim() : 'unknown',
        lastCheck: new Date().toISOString(),
        executorHealthy: true, // this.commandExecutor.isHealthy(),
        activeProcesses: this.commandExecutor.getActiveProcessCount()
      };

      logger.info('Health check completed', { ...context, healthy, details }, 'service');
      
      return { healthy, details };
      
    } catch (error) {
      const taskMasterError = errorHandler.normalizeError(error, context);
      
      logger.error('Health check failed', context, taskMasterError, 'service');
      
      return {
        healthy: false,
        details: {
          error: taskMasterError.message,
          cliAvailable: false,
          lastCheck: new Date().toISOString()
        }
      };
    }
  }
}

// Export singleton instance for convenience
export const taskMasterService = new TaskMasterService();