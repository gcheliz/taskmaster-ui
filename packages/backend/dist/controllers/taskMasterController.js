"use strict";
// Advanced Controller Architecture with Clean Code Principles
// Demonstrates: Clean architecture, dependency injection, comprehensive error handling
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskMasterController = void 0;
// Main Controller Implementation
class TaskMasterController {
    constructor(taskMasterService, webSocketService) {
        this.taskMasterService = taskMasterService;
        this.webSocketService = webSocketService;
    }
    /**
     * Execute CLI Command Endpoint
     * POST /api/cli/execute
     */
    async executeCommand(req, res) {
        try {
            const request = req.validatedBody;
            const { repositoryPath, operation, arguments: args = {}, options = {} } = request;
            // Emit WebSocket event for real-time tracking
            this.emitWebSocketEvent('command:start', {
                requestId: req.requestId,
                repositoryPath,
                operation,
                timestamp: new Date().toISOString()
            });
            let result;
            // Route to appropriate service method based on operation
            switch (operation) {
                case 'init':
                    result = await this.taskMasterService.initProject(repositoryPath, args);
                    break;
                case 'status':
                case 'list':
                    result = await this.taskMasterService.listTasks(repositoryPath, {
                        status: args.status,
                        tag: options.tag
                    });
                    break;
                case 'show':
                    if (!args.id) {
                        throw new Error('Task ID is required for show operation');
                    }
                    result = await this.taskMasterService.getTask(repositoryPath, args.id.toString(), {
                        tag: options.tag
                    });
                    break;
                case 'set-status':
                    if (!args.id || !args.status) {
                        throw new Error('Task ID and status are required for set-status operation');
                    }
                    result = await this.taskMasterService.updateTaskStatus(repositoryPath, args.id.toString(), args.status, { tag: options.tag });
                    break;
                case 'next':
                    result = await this.taskMasterService.getNextTask(repositoryPath, {
                        tag: options.tag
                    });
                    break;
                case 'parse-prd':
                    if (!args.file) {
                        throw new Error('PRD file path is required for parse-prd operation');
                    }
                    result = await this.taskMasterService.parsePRD(repositoryPath, args.file, {
                        append: args.append
                    });
                    break;
                case 'expand':
                    if (!args.id && !args.all) {
                        throw new Error('Task ID or --all flag is required for expand operation');
                    }
                    result = await this.taskMasterService.expandTask(repositoryPath, args.id?.toString(), {
                        research: args.research,
                        force: args.force,
                        tag: options.tag
                    });
                    break;
                case 'analyze-complexity':
                    result = await this.taskMasterService.analyzeComplexity(repositoryPath, {
                        from: args.from,
                        to: args.to,
                        research: args.research,
                        tag: options.tag
                    });
                    break;
                case 'validate-dependencies':
                    result = await this.taskMasterService.validateDependencies(repositoryPath, {
                        tag: options.tag
                    });
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
                timestamp: new Date().toISOString()
            });
            const response = {
                success: true,
                data: result,
                metadata: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                    duration: Date.now() - req.startTime,
                    version: process.env.API_VERSION || '1.0.0',
                    rateLimit: req.rateLimit
                }
            };
            res.apiSuccess(result, {
                rateLimit: req.rateLimit
            });
        }
        catch (error) {
            await this.handleError(error, req, res, 'executeCommand');
        }
    }
    /**
     * Get Project Status Endpoint
     * GET /api/project/status
     */
    async getProjectStatus(req, res) {
        try {
            const request = req.query;
            const { repositoryPath, includeStats, includeTasks } = request;
            if (!repositoryPath) {
                throw new Error('Repository path is required');
            }
            // Get project status
            const statusResult = await this.taskMasterService.getProjectStatus(repositoryPath);
            let tasksData = undefined;
            if (includeTasks) {
                const tasksResult = await this.taskMasterService.listTasks(repositoryPath);
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
                tasks: tasksData
            };
            res.apiSuccess(responseData, {
                rateLimit: req.rateLimit
            });
        }
        catch (error) {
            await this.handleError(error, req, res, 'getProjectStatus');
        }
    }
    /**
     * List Tasks with Advanced Filtering
     * GET /api/tasks
     */
    async listTasks(req, res) {
        try {
            const request = req.query;
            const { repositoryPath, filters = {}, pagination = { page: 1, limit: 50 }, sorting } = request;
            if (!repositoryPath) {
                throw new Error('Repository path is required');
            }
            // Get tasks from service
            const result = await this.taskMasterService.listTasks(repositoryPath, {
                status: filters.status?.[0], // Service accepts single status for now
                tag: this.extractTagFromPath(repositoryPath)
            });
            if (!result.success || !result.data) {
                throw new Error('Failed to retrieve tasks');
            }
            // Apply client-side filtering and pagination
            let filteredTasks = result.data;
            // Apply filters
            if (filters.status && filters.status.length > 0) {
                filteredTasks = filteredTasks.filter(task => filters.status.includes(task.status));
            }
            if (filters.priority && filters.priority.length > 0) {
                filteredTasks = filteredTasks.filter(task => filters.priority.includes(task.priority));
            }
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filteredTasks = filteredTasks.filter(task => task.title.toLowerCase().includes(searchTerm) ||
                    task.description?.toLowerCase().includes(searchTerm));
            }
            // Apply sorting
            if (sorting) {
                filteredTasks = this.sortTasks(filteredTasks, sorting);
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
                    hasPrevious: pagination.page > 1
                },
                filters,
                totalCount
            };
            res.apiSuccess(responseData, {
                rateLimit: req.rateLimit
            });
        }
        catch (error) {
            await this.handleError(error, req, res, 'listTasks');
        }
    }
    /**
     * Get Task Details
     * GET /api/tasks/:taskId
     */
    async getTask(req, res) {
        try {
            const { taskId } = req.params;
            const request = req.query;
            const { repositoryPath, includeSubtasks, includeHistory } = request;
            if (!repositoryPath) {
                throw new Error('Repository path is required');
            }
            // Get task details
            const result = await this.taskMasterService.getTask(repositoryPath, taskId, {
                tag: this.extractTagFromPath(repositoryPath)
            });
            if (!result.success || !result.data) {
                throw new Error(`Task ${taskId} not found`);
            }
            const responseData = {
                task: result.data,
                subtasks: includeSubtasks ? [] : undefined, // Would be implemented with subtask service
                history: includeHistory ? [] : undefined, // Would be implemented with history service
                dependencies: [], // Would be populated from dependency analysis
                dependents: [] // Would be populated from dependency analysis
            };
            res.apiSuccess(responseData, {
                rateLimit: req.rateLimit
            });
        }
        catch (error) {
            await this.handleError(error, req, res, 'getTask');
        }
    }
    /**
     * Update Task
     * PUT /api/tasks/:taskId
     */
    async updateTask(req, res) {
        try {
            const { taskId } = req.params;
            const request = req.validatedBody;
            const { repositoryPath, updates, options = {} } = request;
            // Validate dependencies if requested
            if (options.validateDependencies) {
                await this.taskMasterService.validateDependencies(repositoryPath);
            }
            // Update task status if provided
            if (updates.status) {
                const result = await this.taskMasterService.updateTaskStatus(repositoryPath, taskId, updates.status, { tag: this.extractTagFromPath(repositoryPath) });
                if (!result.success) {
                    throw new Error('Failed to update task status');
                }
                // Emit WebSocket notification
                this.emitWebSocketEvent('task:updated', {
                    taskId,
                    repositoryPath,
                    updates,
                    timestamp: new Date().toISOString()
                });
                res.apiSuccess(result.data, {
                    rateLimit: req.rateLimit
                });
            }
            else {
                // For other updates, get current task data
                const taskResult = await this.taskMasterService.getTask(repositoryPath, taskId);
                if (!taskResult.success || !taskResult.data) {
                    throw new Error(`Task ${taskId} not found`);
                }
                // In a real implementation, you'd update other fields here
                res.apiSuccess(taskResult.data, {
                    rateLimit: req.rateLimit
                });
            }
        }
        catch (error) {
            await this.handleError(error, req, res, 'updateTask');
        }
    }
    /**
     * Expand Task into Subtasks
     * POST /api/tasks/:taskId/expand
     */
    async expandTask(req, res) {
        try {
            const { taskId } = req.params;
            const request = req.validatedBody;
            const { repositoryPath, options = {} } = request;
            const result = await this.taskMasterService.expandTask(repositoryPath, taskId, {
                research: options.research,
                force: options.force,
                tag: this.extractTagFromPath(repositoryPath)
            });
            // Create expansion result
            const responseData = {
                expandedTasks: [{ id: taskId, title: 'Expanded Task' }], // Would be populated from actual expansion
                expansionMetadata: {
                    totalTasksExpanded: 1,
                    totalSubtasksCreated: 0, // Would be calculated from actual expansion
                    averageExpansionRatio: 0,
                    estimatedTimeToComplete: '1 hour',
                    researchUsed: options.research || false
                }
            };
            // Emit WebSocket notification
            this.emitWebSocketEvent('task:expanded', {
                taskId,
                repositoryPath,
                options,
                result: responseData,
                timestamp: new Date().toISOString()
            });
            res.apiSuccess(responseData, {
                rateLimit: req.rateLimit
            });
        }
        catch (error) {
            await this.handleError(error, req, res, 'expandTask');
        }
    }
    /**
     * Analyze Project Complexity
     * POST /api/analysis/complexity
     */
    async analyzeComplexity(req, res) {
        try {
            const request = req.validatedBody;
            const { repositoryPath, range, options = {} } = request;
            const result = await this.taskMasterService.analyzeComplexity(repositoryPath, {
                from: range?.from,
                to: range?.to,
                research: options.research,
                tag: this.extractTagFromPath(repositoryPath)
            });
            // Create complexity analysis result
            const responseData = {
                overallComplexity: 7.5, // Would be calculated from actual analysis
                taskComplexities: [], // Would be populated from analysis
                recommendations: [], // Would be generated from analysis
                metadata: {
                    analysisTime: result.duration,
                    algorithmsUsed: ['dependency-analysis', 'complexity-heuristics'],
                    confidenceScore: 0.85,
                    lastUpdate: new Date().toISOString()
                }
            };
            res.apiSuccess(responseData, {
                rateLimit: req.rateLimit
            });
        }
        catch (error) {
            await this.handleError(error, req, res, 'analyzeComplexity');
        }
    }
    /**
     * Stream Command Execution (Server-Sent Events)
     * GET /api/cli/stream
     */
    async streamCommand(req, res) {
        try {
            const { repositoryPath, operation } = req.query;
            if (!repositoryPath || !operation) {
                throw new Error('Repository path and operation are required');
            }
            // Set up Server-Sent Events
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            });
            // Send initial event
            this.sendSSE(res, 'start', {
                requestId: req.requestId,
                operation,
                timestamp: new Date().toISOString()
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
                    timestamp: new Date().toISOString()
                });
                clearInterval(heartbeat);
                res.end();
            }, 3000);
        }
        catch (error) {
            await this.handleError(error, req, res, 'streamCommand');
        }
    }
    // Helper Methods
    async handleError(error, req, res, operation) {
        console.error(`Error in ${operation} for request ${req.requestId}:`, error);
        // Emit error event
        this.emitWebSocketEvent('command:error', {
            requestId: req.requestId,
            operation,
            error: error.message,
            timestamp: new Date().toISOString()
        });
        const apiError = {
            code: this.getErrorCode(error),
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                operation
            } : undefined,
            correlationId: req.correlationId
        };
        res.apiError(apiError, this.getStatusCode(error));
    }
    getErrorCode(error) {
        if (error.message.includes('not found'))
            return 'NOT_FOUND';
        if (error.message.includes('required'))
            return 'VALIDATION_ERROR';
        if (error.message.includes('permission'))
            return 'PERMISSION_DENIED';
        if (error.message.includes('timeout'))
            return 'TIMEOUT';
        return 'INTERNAL_ERROR';
    }
    getStatusCode(error) {
        const code = this.getErrorCode(error);
        switch (code) {
            case 'NOT_FOUND': return 404;
            case 'VALIDATION_ERROR': return 400;
            case 'PERMISSION_DENIED': return 403;
            case 'TIMEOUT': return 408;
            default: return 500;
        }
    }
    emitWebSocketEvent(event, data) {
        if (this.webSocketService) {
            this.webSocketService.broadcast({ event, data });
        }
    }
    sendSSE(res, type, data) {
        const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
        res.write(message);
    }
    extractTagFromPath(path) {
        const pathParts = path.split('/');
        return pathParts[pathParts.length - 1] || 'default';
    }
    calculateProjectStats(tasks) {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
        const pendingTasks = tasks.filter(t => t.status === 'pending').length;
        const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            pendingTasks,
            blockedTasks,
            averageComplexity: 5.5, // Would be calculated from actual complexity data
            estimatedCompletion: '2 weeks',
            lastActivity: new Date().toISOString()
        };
    }
    sortTasks(tasks, sorting) {
        return tasks.sort((a, b) => {
            const aValue = a[sorting.field];
            const bValue = b[sorting.field];
            if (sorting.direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            }
            else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }
}
exports.TaskMasterController = TaskMasterController;
//# sourceMappingURL=taskMasterController.js.map