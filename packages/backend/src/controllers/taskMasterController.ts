// Advanced Controller Architecture with Clean Code Principles
// Demonstrates: Clean architecture, dependency injection, comprehensive error handling

import { TaskMasterService } from '../services/taskMasterService';
import { WebSocketService } from '../services/websocket';
import { EnhancedRequest, EnhancedResponse } from '../middleware';
import {
  CliExecuteRequest,
  CliExecuteResponse,
  ProjectStatusRequest,
  TaskListRequest,
  TaskDetailRequest,
  TaskUpdateRequest,
  TaskExpansionRequest,
  ComplexityAnalysisRequest,
  ApiError,
  SortingOptions,
} from '../types/api';
import { logger } from '../utils/winston-adapter';
import { TaskInfo } from '../types/taskMaster';

// Controller Interface for Dependency Injection
export interface ITaskMasterController {
  executeCommand(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
  getProjectStatus(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
  listTasks(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
  getTask(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
  createTask(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
  updateTask(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
  expandTask(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
  analyzeComplexity(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
  streamCommand(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
}

// Main Controller Implementation
export class TaskMasterController implements ITaskMasterController {
  constructor(
    private readonly taskMasterService: TaskMasterService,
    private readonly webSocketService?: WebSocketService
  ) {}

  /**
   * Execute CLI Command Endpoint
   * POST /api/cli/execute
   */
  async executeCommand(
    req: EnhancedRequest,
    res: EnhancedResponse
  ): Promise<void> {
    try {
      const request = req.validatedBody as CliExecuteRequest;
      const {
        repositoryPath,
        operation,
        arguments: args = {},
        options = {},
      } = request;

      // Emit WebSocket event for real-time tracking
      this.emitWebSocketEvent('command:start', {
        requestId: req.requestId,
        repositoryPath,
        operation,
        timestamp: new Date().toISOString(),
      });

      let result;

      // Route to appropriate service method based on operation
      switch (operation) {
        case 'init':
          result = await this.taskMasterService.initProject(
            repositoryPath,
            args
          );
          break;

        case 'status':
        case 'list':
          result = await this.taskMasterService.listTasks(repositoryPath, {
            status: args.status as string | undefined,
            tag: options.tag,
          });
          break;

        case 'show':
          if (!args.id) {
            throw new Error('Task ID is required for show operation');
          }
          result = await this.taskMasterService.getTask(
            repositoryPath,
            args.id.toString(),
            {
              tag: options.tag,
            }
          );
          break;

        case 'set-status':
          if (!args.id || !args.status) {
            throw new Error(
              'Task ID and status are required for set-status operation'
            );
          }
          result = await this.taskMasterService.updateTaskStatus(
            repositoryPath,
            args.id.toString(),
            String(args.status),
            { tag: options.tag }
          );
          break;

        case 'next':
          result = await this.taskMasterService.getNextTask(repositoryPath, {
            tag: options.tag,
          });
          break;

        case 'parse-prd':
          if (!args.file) {
            throw new Error(
              'PRD file path is required for parse-prd operation'
            );
          }
          result = await this.taskMasterService.parsePRD(
            repositoryPath,
            String(args.file),
            {
              append: args.append as boolean | undefined,
            }
          );
          break;

        case 'expand':
          if (!args.id && !args.all) {
            throw new Error(
              'Task ID or --all flag is required for expand operation'
            );
          }
          result = await this.taskMasterService.expandTask(
            repositoryPath,
            args.id?.toString() || '',
            {
              research: args.research as boolean | undefined,
              force: args.force as boolean | undefined,
              tag: options.tag,
            }
          );
          break;

        case 'analyze-complexity':
          result = await this.taskMasterService.analyzeComplexity(
            repositoryPath,
            {
              from: args.from as number | undefined,
              to: args.to as number | undefined,
              research: args.research as boolean | undefined,
              tag: options.tag,
            }
          );
          break;

        case 'validate-dependencies':
          result = await this.taskMasterService.validateDependencies(
            repositoryPath,
            {
              tag: options.tag,
            }
          );
          break;

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      // Emit success event
      this.emitWebSocketEvent('command:complete', {
        requestId: req.requestId,
        repositoryPath,
        operation,
        success: result.success,
        duration: result.duration,
        timestamp: new Date().toISOString(),
      });

      res.apiSuccess(result, {
        rateLimit: req.rateLimit,
      });
    } catch (error) {
      await this.handleError(error as Error, req, res, 'executeCommand');
    }
  }

  /**
   * Get Project Status Endpoint
   * GET /api/project/status
   */
  async getProjectStatus(
    req: EnhancedRequest,
    res: EnhancedResponse
  ): Promise<void> {
    try {
      const request = req.query as unknown as ProjectStatusRequest;
      const { repositoryPath, includeStats, includeTasks } = request;

      if (!repositoryPath) {
        throw new Error('Repository path is required');
      }

      // Get project status
      const statusResult =
        await this.taskMasterService.getProjectStatus(repositoryPath);

      let tasksData = undefined;
      if (includeTasks) {
        const tasksResult =
          await this.taskMasterService.listTasks(repositoryPath);
        tasksData = tasksResult.data;
      }

      // Calculate stats if requested
      let stats = undefined;
      if (includeStats && tasksData) {
        stats = this.calculateProjectStats(tasksData);
      }

      const responseData = {
        project: statusResult.data,
        stats,
        tasks: tasksData,
      };

      res.apiSuccess(responseData, {
        rateLimit: req.rateLimit,
      });
    } catch (error) {
      await this.handleError(error as Error, req, res, 'getProjectStatus');
    }
  }

  /**
   * List Tasks with Advanced Filtering
   * GET /api/tasks
   */
  async listTasks(req: EnhancedRequest, res: EnhancedResponse): Promise<void> {
    try {
      const request = req.query as unknown as TaskListRequest;
      const {
        repositoryPath,
        filters = {},
        pagination = { page: 1, limit: 50 },
        sorting,
      } = request;

      if (!repositoryPath) {
        throw new Error('Repository path is required');
      }

      // Get tasks from service
      const result = await this.taskMasterService.listTasks(repositoryPath, {
        status: filters.status?.[0], // Service accepts single status for now
        tag: this.extractTagFromPath(repositoryPath),
      });

      if (!result.success || !result.data) {
        throw new Error('Failed to retrieve tasks');
      }

      // Apply client-side filtering and pagination
      let filteredTasks = result.data;

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        filteredTasks = filteredTasks.filter(
          task => filters.status?.includes(task.status) ?? false
        );
      }

      if (filters.priority && filters.priority.length > 0) {
        filteredTasks = filteredTasks.filter(
          task => filters.priority?.includes(task.priority) ?? false
        );
      }

      if (filters.complexity && filters.complexity.length > 0) {
        filteredTasks = filteredTasks.filter(task => {
          const taskComplexity = this.getTaskComplexityLevel(
            task.complexity || 1
          );
          return filters.complexity?.includes(taskComplexity) ?? false;
        });
      }

      if (filters.assignee && filters.assignee.length > 0) {
        filteredTasks = filteredTasks.filter(task => {
          // For now, we'll treat all tasks as unassigned since assignee is not in TaskInfo
          const taskAssignee = (task as any).assignee ?? 'unassigned';
          return filters.assignee?.includes(taskAssignee) ?? false;
        });
      }

      if (filters.complexityRange && filters.complexityRange.length === 2) {
        const [minComplexity, maxComplexity] = filters.complexityRange;
        filteredTasks = filteredTasks.filter(task => {
          const complexity = task.complexity || 1;
          return complexity >= minComplexity && complexity <= maxComplexity;
        });
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredTasks = filteredTasks.filter(
          task =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.description?.toLowerCase().includes(searchTerm) ||
            (task as any).details?.toLowerCase().includes(searchTerm)
        );
      }

      // Apply sorting
      if (sorting) {
        filteredTasks = this.sortTasks(filteredTasks, sorting) as TaskInfo[];
      }

      // Apply pagination
      const totalCount = filteredTasks.length;
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

      const responseData = {
        tasks: paginatedTasks,
        pagination: {
          currentPage: pagination.page,
          totalPages: Math.ceil(totalCount / pagination.limit),
          pageSize: pagination.limit,
          totalItems: totalCount,
          hasNext: endIndex < totalCount,
          hasPrevious: pagination.page > 1,
        },
        filters,
        totalCount,
      };

      res.apiSuccess(responseData, {
        rateLimit: req.rateLimit,
      });
    } catch (error) {
      await this.handleError(error as Error, req, res, 'listTasks');
    }
  }

  /**
   * Get Task Details
   * GET /api/tasks/:taskId
   */
  async getTask(req: EnhancedRequest, res: EnhancedResponse): Promise<void> {
    try {
      const { taskId } = req.params;
      const request = req.query as unknown as TaskDetailRequest;
      const { repositoryPath, includeSubtasks, includeHistory } = request;

      if (!repositoryPath) {
        throw new Error('Repository path is required');
      }

      // Get task details
      const result = await this.taskMasterService.getTask(
        repositoryPath,
        taskId,
        {
          tag: this.extractTagFromPath(repositoryPath),
        }
      );

      if (!result.success || !result.data) {
        throw new Error(`Task ${taskId} not found`);
      }

      const responseData = {
        task: result.data,
        subtasks: includeSubtasks ? [] : undefined, // Would be implemented with subtask service
        history: includeHistory ? [] : undefined, // Would be implemented with history service
        dependencies: [], // Would be populated from dependency analysis
        dependents: [], // Would be populated from dependency analysis
      };

      res.apiSuccess(responseData, {
        rateLimit: req.rateLimit,
      });
    } catch (error) {
      await this.handleError(error as Error, req, res, 'getTask');
    }
  }

  /**
   * Create Task
   * POST /api/tasks
   */
  async createTask(req: EnhancedRequest, res: EnhancedResponse): Promise<void> {
    try {
      const request = req.validatedBody as any; // TaskCreateRequest type
      const {
        repositoryPath,
        title,
        description,
        priority,
        status = 'pending',
        dependencies = [],
        tags = [],
        ...optionalFields
      } = request;

      // Check if repository is initialized
      let projectStatus;
      try {
        projectStatus =
          await this.taskMasterService.getProjectStatus(repositoryPath);
      } catch (error) {
        throw new Error('Failed to check project status');
      }

      if (
        !projectStatus ||
        !projectStatus.success ||
        !projectStatus.data?.initialized
      ) {
        throw new Error('TaskMaster is not initialized in this repository');
      }

      // Get current tasks to determine next ID
      const currentTasks = await this.taskMasterService.listTasks(
        repositoryPath,
        {
          tag: this.extractTagFromPath(repositoryPath),
        }
      );

      if (!currentTasks.success || !currentTasks.data) {
        throw new Error('Failed to retrieve current tasks');
      }

      // Calculate next task ID
      const maxId = currentTasks.data.reduce(
        (max, task) => Math.max(max, task.id),
        0
      );
      const newTaskId = maxId + 1;

      // Validate dependencies exist
      if (dependencies.length > 0) {
        const existingIds = new Set(currentTasks.data.map(t => t.id));
        const invalidDeps = dependencies.filter(
          depId => !existingIds.has(depId)
        );
        if (invalidDeps.length > 0) {
          res.status(400).apiError({
            code: 'INVALID_DEPENDENCY',
            message: `Dependencies not found: ${invalidDeps.join(', ')}`,
          });
          return;
        }
      }

      // Check for circular dependencies
      if (
        optionalFields.parentTaskId &&
        dependencies.includes(optionalFields.parentTaskId)
      ) {
        res.status(400).apiError({
          code: 'CIRCULAR_DEPENDENCY',
          message: 'A subtask cannot depend on its parent task',
        });
        return;
      }

      // Prepare task object
      const newTask = {
        id: newTaskId,
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dependencies,
        tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...optionalFields,
      };

      // Create the task using the service
      const createResult = await this.taskMasterService.createTask(
        repositoryPath,
        {
          prompt: `${title}: ${description}`,
          priority,
          status,
          dependencies:
            dependencies.length > 0 ? dependencies.join(',') : undefined,
          tags: tags.length > 0 ? tags.join(',') : undefined,
        },
        {
          research: optionalFields.aiEnhancement?.generateDetails || false,
          tag: this.extractTagFromPath(repositoryPath),
        }
      );

      if (!createResult.success) {
        throw new Error('Failed to create task');
      }

      // Emit WebSocket notification
      this.emitWebSocketEvent('task:created', {
        task: newTask,
        repositoryPath,
        timestamp: new Date().toISOString(),
      });

      // Send response
      res.status(201).apiSuccess({
        task: newTask,
        metadata: {
          createdAt: newTask.createdAt,
          createdBy: req.user?.username || 'system',
          projectTag: this.extractTagFromPath(repositoryPath),
          taskNumber: `${newTaskId}`,
        },
        links: {
          self: `/api/tasks/${newTaskId}`,
          parent: optionalFields.parentTaskId
            ? `/api/tasks/${optionalFields.parentTaskId}`
            : undefined,
          dependencies: dependencies.map(
            (depId: number) => `/api/tasks/${depId}`
          ),
        },
      });

      logger.info('Task created successfully', {
        taskId: newTaskId,
        title,
        repositoryPath,
        requestId: req.id,
      });
    } catch (error) {
      await this.handleError(error as Error, req, res, 'createTask');
    }
  }

  /**
   * Update Task
   * PUT /api/tasks/:taskId
   */
  async updateTask(req: EnhancedRequest, res: EnhancedResponse): Promise<void> {
    try {
      const { taskId } = req.params;
      const request = req.validatedBody as TaskUpdateRequest;
      const { repositoryPath, updates, options = {} } = request;

      // Validate dependencies if requested
      if (options.validateDependencies) {
        await this.taskMasterService.validateDependencies(repositoryPath);
      }

      // Update task status if provided
      if (updates.status) {
        const result = await this.taskMasterService.updateTaskStatus(
          repositoryPath,
          taskId,
          updates.status,
          { tag: this.extractTagFromPath(repositoryPath) }
        );

        if (!result.success) {
          throw new Error('Failed to update task status');
        }

        // Emit WebSocket notification
        this.emitWebSocketEvent('task:updated', {
          taskId,
          repositoryPath,
          updates,
          timestamp: new Date().toISOString(),
        });

        res.apiSuccess(result.data, {
          rateLimit: req.rateLimit,
        });
      } else {
        // For other updates, get current task data
        const taskResult = await this.taskMasterService.getTask(
          repositoryPath,
          taskId
        );

        if (!taskResult.success || !taskResult.data) {
          throw new Error(`Task ${taskId} not found`);
        }

        // In a real implementation, you'd update other fields here
        res.apiSuccess(taskResult.data, {
          rateLimit: req.rateLimit,
        });
      }
    } catch (error) {
      await this.handleError(error as Error, req, res, 'updateTask');
    }
  }

  /**
   * Expand Task into Subtasks
   * POST /api/tasks/:taskId/expand
   */
  async expandTask(req: EnhancedRequest, res: EnhancedResponse): Promise<void> {
    try {
      const { taskId } = req.params;
      const request = req.validatedBody as TaskExpansionRequest;
      const { repositoryPath, options = {} } = request;

      await this.taskMasterService.expandTask(repositoryPath, taskId, {
        research: options.research,
        force: options.force,
        tag: this.extractTagFromPath(repositoryPath),
      });

      // Create expansion result
      const responseData = {
        expandedTasks: [{ id: taskId, title: 'Expanded Task' }], // Would be populated from actual expansion
        expansionMetadata: {
          totalTasksExpanded: 1,
          totalSubtasksCreated: 0, // Would be calculated from actual expansion
          averageExpansionRatio: 0,
          estimatedTimeToComplete: '1 hour',
          researchUsed: options.research || false,
        },
      };

      // Emit WebSocket notification
      this.emitWebSocketEvent('task:expanded', {
        taskId,
        repositoryPath,
        options,
        result: responseData,
        timestamp: new Date().toISOString(),
      });

      res.apiSuccess(responseData, {
        rateLimit: req.rateLimit,
      });
    } catch (error) {
      await this.handleError(error as Error, req, res, 'expandTask');
    }
  }

  /**
   * Analyze Project Complexity
   * POST /api/analysis/complexity
   */
  async analyzeComplexity(
    req: EnhancedRequest,
    res: EnhancedResponse
  ): Promise<void> {
    try {
      const request = req.validatedBody as ComplexityAnalysisRequest;
      const { repositoryPath, range, options = {} } = request;

      const result = await this.taskMasterService.analyzeComplexity(
        repositoryPath,
        {
          from: range?.from,
          to: range?.to,
          research: options.research,
          tag: this.extractTagFromPath(repositoryPath),
        }
      );

      // Create complexity analysis result
      const responseData = {
        overallComplexity: 7.5, // Would be calculated from actual analysis
        taskComplexities: [], // Would be populated from analysis
        recommendations: [], // Would be generated from analysis
        metadata: {
          analysisTime: result.duration,
          algorithmsUsed: ['dependency-analysis', 'complexity-heuristics'],
          confidenceScore: 0.85,
          lastUpdate: new Date().toISOString(),
        },
      };

      res.apiSuccess(responseData, {
        rateLimit: req.rateLimit,
      });
    } catch (error) {
      await this.handleError(error as Error, req, res, 'analyzeComplexity');
    }
  }

  /**
   * Stream Command Execution (Server-Sent Events)
   * GET /api/cli/stream
   */
  async streamCommand(
    req: EnhancedRequest,
    res: EnhancedResponse
  ): Promise<void> {
    try {
      const { repositoryPath, operation } = req.query as any;

      if (!repositoryPath || !operation) {
        throw new Error('Repository path and operation are required');
      }

      // Set up Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      });

      // Send initial event
      this.sendSSE(res, 'start', {
        requestId: req.requestId,
        operation,
        timestamp: new Date().toISOString(),
      });

      // Set up periodic heartbeat
      const heartbeat = setInterval(() => {
        this.sendSSE(res, 'heartbeat', { timestamp: new Date().toISOString() });
      }, 30000);

      // Handle client disconnect
      req.on('close', () => {
        clearInterval(heartbeat);
      });

      // Simulate streaming execution (in reality, you'd hook into the command executor events)
      setTimeout(() => {
        this.sendSSE(res, 'progress', { stage: 'parsing', progress: 25 });
      }, 1000);

      setTimeout(() => {
        this.sendSSE(res, 'progress', { stage: 'executing', progress: 75 });
      }, 2000);

      setTimeout(() => {
        this.sendSSE(res, 'complete', {
          success: true,
          duration: 3000,
          timestamp: new Date().toISOString(),
        });
        clearInterval(heartbeat);
        res.end();
      }, 3000);
    } catch (error) {
      await this.handleError(error as Error, req, res, 'streamCommand');
    }
  }

  // Helper Methods

  private async handleError(
    error: Error,
    req: EnhancedRequest,
    res: EnhancedResponse,
    operation: string
  ): Promise<void> {
    logger.error(`Error in ${operation} for request ${req.requestId}:`, error);

    // Emit error event
    this.emitWebSocketEvent('command:error', {
      requestId: req.requestId,
      operation,
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    const errorCode = this.getErrorCode(error);
    const apiError: ApiError = {
      code: errorCode,
      message:
        errorCode === 'INTERNAL_ERROR' && process.env.NODE_ENV !== 'development'
          ? 'An unexpected error occurred'
          : error.message,
      details:
        process.env.NODE_ENV === 'development'
          ? {
              stack: error.stack,
              operation,
            }
          : undefined,
      correlationId: req.correlationId,
    };

    res.apiError(apiError, this.getStatusCode(error));
  }

  private getErrorCode(error: Error): string {
    if (error.message.includes('not found')) return 'NOT_FOUND';
    if (error.message.includes('required')) return 'VALIDATION_ERROR';
    if (error.message.includes('permission')) return 'PERMISSION_DENIED';
    if (error.message.includes('timeout')) return 'TIMEOUT';
    return 'INTERNAL_ERROR';
  }

  private getStatusCode(error: Error): number {
    const code = this.getErrorCode(error);
    switch (code) {
      case 'NOT_FOUND':
        return 404;
      case 'VALIDATION_ERROR':
        return 400;
      case 'PERMISSION_DENIED':
        return 403;
      case 'TIMEOUT':
        return 408;
      default:
        return 500;
    }
  }

  private emitWebSocketEvent(event: string, data: any): void {
    if (this.webSocketService) {
      this.webSocketService.broadcast({ event, data });
    }
  }

  private sendSSE(res: EnhancedResponse, type: string, data: any): void {
    const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
    res.write(message);
  }

  private extractTagFromPath(path: string): string {
    const pathParts = path.split('/');
    return pathParts[pathParts.length - 1] || 'default';
  }

  private calculateProjectStats(tasks: unknown[]): any {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      t => (t as any).status === 'done'
    ).length;
    const inProgressTasks = tasks.filter(
      t => (t as any).status === 'in-progress'
    ).length;
    const pendingTasks = tasks.filter(
      t => (t as any).status === 'pending'
    ).length;
    const blockedTasks = tasks.filter(
      t => (t as any).status === 'blocked'
    ).length;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      blockedTasks,
      averageComplexity: 5.5, // Would be calculated from actual complexity data
      estimatedCompletion: '2 weeks',
      lastActivity: new Date().toISOString(),
    };
  }

  private sortTasks(tasks: unknown[], sorting: SortingOptions): unknown[] {
    return tasks.sort((a, b) => {
      let aValue = (a as any)[sorting.field];
      let bValue = (b as any)[sorting.field];

      // Handle special sorting cases
      if (sorting.field === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[aValue as keyof typeof priorityOrder] || 0;
        bValue = priorityOrder[bValue as keyof typeof priorityOrder] || 0;
      }

      if (sorting.field === 'status') {
        const statusOrder = {
          pending: 1,
          'in-progress': 2,
          done: 3,
          blocked: 4,
          deferred: 5,
        };
        aValue = statusOrder[aValue as keyof typeof statusOrder] || 0;
        bValue = statusOrder[bValue as keyof typeof statusOrder] || 0;
      }

      if (sorting.field === 'created' || sorting.field === 'updated') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sorting.direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  private getTaskComplexityLevel(complexity: number): string {
    if (complexity >= 7) return 'high';
    if (complexity >= 4) return 'medium';
    return 'low';
  }
}
