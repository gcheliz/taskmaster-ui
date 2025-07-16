"use strict";
// Advanced Router with OpenAPI Integration and Route Composition
// Demonstrates: Route composition, OpenAPI integration, advanced routing patterns
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskMasterApiSchemas = exports.TaskMasterRouteFactory = void 0;
exports.createTaskMasterRoutes = createTaskMasterRoutes;
const express_1 = require("express");
const taskMasterController_1 = require("../controllers/taskMasterController");
const taskMasterService_1 = require("../services/taskMasterService");
const middleware_1 = require("../middleware");
// OpenAPI Schema Definitions
const schemas = {
    CliExecuteRequest: {
        type: 'object',
        required: ['repositoryPath', 'operation'],
        properties: {
            repositoryPath: {
                type: 'string',
                description: 'Absolute path to the repository',
                example: '/Users/john/projects/my-app'
            },
            operation: {
                type: 'string',
                enum: ['init', 'list', 'show', 'set-status', 'next', 'parse-prd', 'expand', 'analyze-complexity'],
                description: 'TaskMaster CLI operation to execute'
            },
            arguments: {
                type: 'object',
                description: 'Operation-specific arguments',
                additionalProperties: true
            },
            options: {
                type: 'object',
                properties: {
                    timeout: { type: 'number', minimum: 1000, maximum: 300000 },
                    tag: { type: 'string' },
                    async: { type: 'boolean' },
                    streaming: { type: 'boolean' }
                }
            }
        }
    },
    ProjectStatusRequest: {
        type: 'object',
        required: ['repositoryPath'],
        properties: {
            repositoryPath: { type: 'string' },
            includeStats: { type: 'boolean', default: false },
            includeTasks: { type: 'boolean', default: false }
        }
    },
    TaskListRequest: {
        type: 'object',
        required: ['repositoryPath'],
        properties: {
            repositoryPath: { type: 'string' },
            filters: {
                type: 'object',
                properties: {
                    status: { type: 'array', items: { type: 'string' } },
                    priority: { type: 'array', items: { type: 'string' } },
                    complexityRange: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 },
                    search: { type: 'string' }
                }
            },
            pagination: {
                type: 'object',
                properties: {
                    page: { type: 'number', minimum: 1, default: 1 },
                    limit: { type: 'number', minimum: 1, maximum: 100, default: 50 }
                }
            },
            sorting: {
                type: 'object',
                properties: {
                    field: { type: 'string', enum: ['id', 'title', 'status', 'priority', 'complexity'] },
                    direction: { type: 'string', enum: ['asc', 'desc'], default: 'asc' }
                }
            }
        }
    },
    TaskUpdateRequest: {
        type: 'object',
        required: ['repositoryPath', 'updates'],
        properties: {
            repositoryPath: { type: 'string' },
            updates: {
                type: 'object',
                properties: {
                    status: { type: 'string', enum: ['pending', 'in-progress', 'done', 'blocked', 'deferred'] },
                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                    description: { type: 'string' },
                    notes: { type: 'string' }
                }
            },
            options: {
                type: 'object',
                properties: {
                    validateDependencies: { type: 'boolean', default: false },
                    notifySubscribers: { type: 'boolean', default: true },
                    createHistoryEntry: { type: 'boolean', default: true }
                }
            }
        }
    }
};
exports.taskMasterApiSchemas = schemas;
// Route Factory Pattern
class TaskMasterRouteFactory {
    constructor(taskMasterService, webSocketService) {
        this.validateCliOperation = (req) => {
            const errors = [];
            const { operation, arguments: args } = req.body;
            // Operation-specific validation
            switch (operation) {
                case 'show':
                case 'set-status':
                    if (!args?.id) {
                        errors.push({
                            field: 'arguments.id',
                            code: 'REQUIRED',
                            message: `Task ID is required for ${operation} operation`,
                            value: args?.id
                        });
                    }
                    break;
                case 'set-status':
                    if (!args?.status) {
                        errors.push({
                            field: 'arguments.status',
                            code: 'REQUIRED',
                            message: 'Status is required for set-status operation',
                            value: args?.status
                        });
                    }
                    break;
                case 'parse-prd':
                    if (!args?.file) {
                        errors.push({
                            field: 'arguments.file',
                            code: 'REQUIRED',
                            message: 'PRD file path is required for parse-prd operation',
                            value: args?.file
                        });
                    }
                    break;
                case 'expand':
                    if (!args?.id && !args?.all) {
                        errors.push({
                            field: 'arguments',
                            code: 'INVALID',
                            message: 'Either task ID or --all flag is required for expand operation',
                            value: args
                        });
                    }
                    break;
            }
            return errors;
        };
        this.validateRepositoryAccess = (req) => {
            const errors = [];
            const { repositoryPath } = req.body || req.query;
            // Basic repository path validation
            if (repositoryPath) {
                // Check if path looks suspicious
                if (repositoryPath.includes('..') || repositoryPath.includes('~')) {
                    errors.push({
                        field: 'repositoryPath',
                        code: 'SECURITY_VIOLATION',
                        message: 'Repository path contains potentially dangerous characters',
                        value: repositoryPath
                    });
                }
                // Check path length
                if (repositoryPath.length > 500) {
                    errors.push({
                        field: 'repositoryPath',
                        code: 'TOO_LONG',
                        message: 'Repository path is too long',
                        value: repositoryPath
                    });
                }
            }
            return errors;
        };
        this.asyncHandler = (fn) => {
            return (req, res, next) => {
                Promise.resolve(fn(req, res, next)).catch(next);
            };
        };
        this.controller = new taskMasterController_1.TaskMasterController(taskMasterService, webSocketService);
    }
    createRouter() {
        const router = (0, express_1.Router)();
        // Apply global middleware stack
        const globalMiddleware = (0, middleware_1.composeMiddleware)((0, middleware_1.requestIdMiddleware)(), (0, middleware_1.loggingMiddleware)(), (0, middleware_1.securityHeadersMiddleware)(), (0, middleware_1.apiResponseMiddleware)(), (0, middleware_1.rateLimitMiddleware)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 100,
            keyGenerator: (req) => `${req.ip}:${req.user?.id || 'anonymous'}`
        }));
        router.use(globalMiddleware);
        // Health Check Endpoint
        router.get('/health', this.createHealthEndpoint());
        // CLI Execution Endpoints
        this.addCliRoutes(router);
        // Project Management Endpoints
        this.addProjectRoutes(router);
        // Task Management Endpoints
        this.addTaskRoutes(router);
        // Analysis Endpoints
        this.addAnalysisRoutes(router);
        // Streaming Endpoints
        this.addStreamingRoutes(router);
        // API Documentation Endpoint
        router.get('/docs', this.createDocsEndpoint());
        return router;
    }
    addCliRoutes(router) {
        /**
         * @openapi
         * /api/cli/execute:
         *   post:
         *     tags:
         *       - CLI Operations
         *     summary: Execute TaskMaster CLI command
         *     description: Execute a specific TaskMaster CLI operation against a repository
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/CliExecuteRequest'
         *     responses:
         *       200:
         *         description: Command executed successfully
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/CliExecuteResponse'
         *       400:
         *         description: Invalid request parameters
         *       429:
         *         description: Rate limit exceeded
         *       500:
         *         description: Internal server error
         */
        router.post('/cli/execute', (0, middleware_1.validationMiddleware)({
            bodySchema: {
                required: ['repositoryPath', 'operation']
            },
            customValidators: [
                this.validateCliOperation,
                this.validateRepositoryAccess
            ]
        }), this.asyncHandler(this.controller.executeCommand.bind(this.controller)));
    }
    addProjectRoutes(router) {
        /**
         * @openapi
         * /api/project/status:
         *   get:
         *     tags:
         *       - Project Management
         *     summary: Get project status and overview
         *     description: Retrieve comprehensive project information including statistics
         *     parameters:
         *       - in: query
         *         name: repositoryPath
         *         required: true
         *         schema:
         *           type: string
         *         description: Absolute path to the repository
         *       - in: query
         *         name: includeStats
         *         schema:
         *           type: boolean
         *           default: false
         *         description: Include project statistics in response
         *       - in: query
         *         name: includeTasks
         *         schema:
         *           type: boolean
         *           default: false
         *         description: Include task list in response
         *     responses:
         *       200:
         *         description: Project status retrieved successfully
         */
        router.get('/project/status', (0, middleware_1.validationMiddleware)({
            querySchema: {
                required: ['repositoryPath']
            }
        }), this.asyncHandler(this.controller.getProjectStatus.bind(this.controller)));
        /**
         * @openapi
         * /api/project/init:
         *   post:
         *     tags:
         *       - Project Management
         *     summary: Initialize new TaskMaster project
         *     description: Initialize a new TaskMaster project in the specified repository
         */
        router.post('/project/init', (0, middleware_1.validationMiddleware)({
            bodySchema: {
                required: ['repositoryPath']
            }
        }), this.asyncHandler(async (req, res) => {
            // Delegate to execute command with 'init' operation
            req.validatedBody = {
                ...req.validatedBody,
                operation: 'init'
            };
            await this.controller.executeCommand(req, res);
        }));
    }
    addTaskRoutes(router) {
        /**
         * @openapi
         * /api/tasks:
         *   get:
         *     tags:
         *       - Task Management
         *     summary: List tasks with filtering and pagination
         *     description: Retrieve tasks with advanced filtering, sorting, and pagination
         */
        router.get('/tasks', (0, middleware_1.validationMiddleware)({
            querySchema: {
                required: ['repositoryPath']
            }
        }), this.asyncHandler(this.controller.listTasks.bind(this.controller)));
        /**
         * @openapi
         * /api/tasks/{taskId}:
         *   get:
         *     tags:
         *       - Task Management
         *     summary: Get task details
         *     description: Retrieve detailed information about a specific task
         *     parameters:
         *       - in: path
         *         name: taskId
         *         required: true
         *         schema:
         *           type: string
         *         description: Task ID
         */
        router.get('/tasks/:taskId', (0, middleware_1.validationMiddleware)({
            querySchema: {
                required: ['repositoryPath']
            }
        }), this.asyncHandler(this.controller.getTask.bind(this.controller)));
        /**
         * @openapi
         * /api/tasks/{taskId}:
         *   put:
         *     tags:
         *       - Task Management
         *     summary: Update task
         *     description: Update task properties such as status, priority, or description
         */
        router.put('/tasks/:taskId', (0, middleware_1.validationMiddleware)({
            bodySchema: {
                required: ['repositoryPath', 'updates']
            }
        }), this.asyncHandler(this.controller.updateTask.bind(this.controller)));
        /**
         * @openapi
         * /api/tasks/{taskId}/expand:
         *   post:
         *     tags:
         *       - Task Management
         *     summary: Expand task into subtasks
         *     description: Break down a complex task into smaller, manageable subtasks
         */
        router.post('/tasks/:taskId/expand', (0, middleware_1.validationMiddleware)({
            bodySchema: {
                required: ['repositoryPath']
            }
        }), this.asyncHandler(this.controller.expandTask.bind(this.controller)));
        /**
         * @openapi
         * /api/tasks/next:
         *   get:
         *     tags:
         *       - Task Management
         *     summary: Get next available task
         *     description: Retrieve the next task that is ready to be worked on
         */
        router.get('/tasks/next', (0, middleware_1.validationMiddleware)({
            querySchema: {
                required: ['repositoryPath']
            }
        }), this.asyncHandler(async (req, res) => {
            req.validatedBody = {
                repositoryPath: req.query.repositoryPath,
                operation: 'next'
            };
            await this.controller.executeCommand(req, res);
        }));
    }
    addAnalysisRoutes(router) {
        /**
         * @openapi
         * /api/analysis/complexity:
         *   post:
         *     tags:
         *       - Analysis
         *     summary: Analyze project complexity
         *     description: Perform comprehensive complexity analysis of project tasks
         */
        router.post('/analysis/complexity', (0, middleware_1.validationMiddleware)({
            bodySchema: {
                required: ['repositoryPath']
            }
        }), this.asyncHandler(this.controller.analyzeComplexity.bind(this.controller)));
        /**
         * @openapi
         * /api/analysis/dependencies:
         *   get:
         *     tags:
         *       - Analysis
         *     summary: Validate task dependencies
         *     description: Check for dependency conflicts and circular dependencies
         */
        router.get('/analysis/dependencies', (0, middleware_1.validationMiddleware)({
            querySchema: {
                required: ['repositoryPath']
            }
        }), this.asyncHandler(async (req, res) => {
            req.validatedBody = {
                repositoryPath: req.query.repositoryPath,
                operation: 'validate-dependencies'
            };
            await this.controller.executeCommand(req, res);
        }));
    }
    addStreamingRoutes(router) {
        /**
         * @openapi
         * /api/stream/commands:
         *   get:
         *     tags:
         *       - Streaming
         *     summary: Stream command execution
         *     description: Execute commands with real-time progress updates via Server-Sent Events
         */
        router.get('/stream/commands', (0, middleware_1.validationMiddleware)({
            querySchema: {
                required: ['repositoryPath', 'operation']
            }
        }), this.asyncHandler(this.controller.streamCommand.bind(this.controller)));
    }
    // Helper Methods and Middleware
    createHealthEndpoint() {
        return (req, res) => {
            const healthInfo = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                version: process.env.API_VERSION || '1.0.0',
                memory: process.memoryUsage(),
                pid: process.pid,
                environment: process.env.NODE_ENV || 'development'
            };
            res.apiSuccess(healthInfo);
        };
    }
    createDocsEndpoint() {
        return (req, res) => {
            const apiDocs = {
                openapi: '3.0.0',
                info: {
                    title: 'TaskMaster CLI API',
                    version: '1.0.0',
                    description: 'Advanced API for TaskMaster CLI integration with enterprise features'
                },
                servers: [
                    {
                        url: '/api',
                        description: 'TaskMaster API Server'
                    }
                ],
                components: {
                    schemas: schemas
                },
                paths: {
                // OpenAPI paths would be auto-generated from route annotations
                }
            };
            res.json(apiDocs);
        };
    }
}
exports.TaskMasterRouteFactory = TaskMasterRouteFactory;
// Factory function for creating routes
function createTaskMasterRoutes(taskMasterServiceInstance = taskMasterService_1.taskMasterService, webSocketService) {
    const factory = new TaskMasterRouteFactory(taskMasterServiceInstance, webSocketService);
    return factory.createRouter();
}
//# sourceMappingURL=taskMasterRoutes.js.map