"use strict";
// Repository Management Routes
// RESTful endpoints for repository validation and management
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositoryApiSchemas = exports.RepositoryRouteFactory = void 0;
exports.createRepositoryRoutes = createRepositoryRoutes;
const express_1 = require("express");
const repositoryController_1 = require("../controllers/repositoryController");
const middleware_1 = require("../middleware");
// OpenAPI Schema Definitions
const schemas = {
    RepositoryValidateRequest: {
        type: 'object',
        required: ['repositoryPath'],
        properties: {
            repositoryPath: {
                type: 'string',
                description: 'Absolute path to the repository directory',
                example: '/Users/john/projects/my-app',
                minLength: 1,
                maxLength: 500
            },
            validateGit: {
                type: 'boolean',
                description: 'Whether to validate Git repository status',
                default: true
            },
            validateTaskMaster: {
                type: 'boolean',
                description: 'Whether to validate TaskMaster project status',
                default: true
            }
        }
    },
    RepositoryValidateResponse: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            data: {
                type: 'object',
                properties: {
                    isValid: { type: 'boolean' },
                    validations: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'string',
                                    enum: ['path', 'directory', 'git', 'taskmaster', 'permissions']
                                },
                                isValid: { type: 'boolean' },
                                message: { type: 'string' },
                                details: { type: 'object' }
                            }
                        }
                    },
                    repositoryInfo: {
                        type: 'object',
                        properties: {
                            path: { type: 'string' },
                            name: { type: 'string' },
                            isGitRepository: { type: 'boolean' },
                            isTaskMasterProject: { type: 'boolean' },
                            gitBranch: { type: 'string' },
                            gitRemoteUrl: { type: 'string' }
                        }
                    },
                    errors: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                }
            },
            error: {
                type: 'object',
                properties: {
                    code: { type: 'string' },
                    message: { type: 'string' },
                    correlationId: { type: 'string' }
                }
            },
            metadata: {
                type: 'object',
                properties: {
                    timestamp: { type: 'string' },
                    requestId: { type: 'string' },
                    duration: { type: 'number' },
                    version: { type: 'string' }
                }
            }
        }
    }
};
exports.repositoryApiSchemas = schemas;
// Route Factory
class RepositoryRouteFactory {
    constructor() {
        // Custom Validation Functions
        this.validateRepositoryPath = (req) => {
            const errors = [];
            const { repositoryPath } = req.body;
            if (repositoryPath) {
                // Security validation - prevent directory traversal
                if (repositoryPath.includes('..') || repositoryPath.includes('~')) {
                    errors.push({
                        field: 'repositoryPath',
                        code: 'SECURITY_VIOLATION',
                        message: 'Repository path contains potentially dangerous characters',
                        value: repositoryPath
                    });
                }
                // Path format validation
                if (!repositoryPath.startsWith('/')) {
                    errors.push({
                        field: 'repositoryPath',
                        code: 'INVALID_FORMAT',
                        message: 'Repository path must be an absolute path',
                        value: repositoryPath
                    });
                }
                // Length validation
                if (repositoryPath.length < 2) {
                    errors.push({
                        field: 'repositoryPath',
                        code: 'TOO_SHORT',
                        message: 'Repository path is too short',
                        value: repositoryPath
                    });
                }
                if (repositoryPath.length > 500) {
                    errors.push({
                        field: 'repositoryPath',
                        code: 'TOO_LONG',
                        message: 'Repository path is too long (max 500 characters)',
                        value: repositoryPath
                    });
                }
            }
            return errors;
        };
        this.validateRepositoryPathFromQuery = (req) => {
            const errors = [];
            const repositoryPath = req.query.repositoryPath;
            if (repositoryPath) {
                // Apply same validation as body path
                const mockReq = { body: { repositoryPath } };
                return this.validateRepositoryPath(mockReq);
            }
            return errors;
        };
        this.validateSecurityConstraints = (req) => {
            const errors = [];
            const { repositoryPath } = req.body;
            if (repositoryPath) {
                // Check for suspicious patterns
                const suspiciousPatterns = [
                    '/etc/',
                    '/var/',
                    '/root/',
                    '/usr/bin',
                    '/System/',
                    '/Windows/',
                    'C:\\',
                    'D:\\',
                    '$HOME',
                    '%USERPROFILE%'
                ];
                for (const pattern of suspiciousPatterns) {
                    if (repositoryPath.includes(pattern)) {
                        errors.push({
                            field: 'repositoryPath',
                            code: 'SUSPICIOUS_PATH',
                            message: 'Repository path appears to target system directories',
                            value: repositoryPath
                        });
                        break;
                    }
                }
                // Check for common development directories (more permissive)
                const allowedPrefixes = [
                    '/Users/',
                    '/home/',
                    '/opt/',
                    '/tmp/',
                    '/var/tmp/',
                    process.cwd() // Allow current working directory and subdirectories
                ];
                const isAllowed = allowedPrefixes.some(prefix => repositoryPath.startsWith(prefix) || repositoryPath.startsWith(process.cwd()));
                if (!isAllowed) {
                    errors.push({
                        field: 'repositoryPath',
                        code: 'RESTRICTED_PATH',
                        message: 'Repository path is outside allowed directories',
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
        this.controller = new repositoryController_1.RepositoryController();
    }
    createRouter() {
        const router = (0, express_1.Router)();
        // Apply global middleware stack
        const globalMiddleware = (0, middleware_1.composeMiddleware)((0, middleware_1.requestIdMiddleware)(), (0, middleware_1.loggingMiddleware)(), (0, middleware_1.securityHeadersMiddleware)(), (0, middleware_1.apiResponseMiddleware)(), (0, middleware_1.rateLimitMiddleware)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 50, // Lower limit for validation operations
            keyGenerator: (req) => `${req.ip}:repository-validation`
        }));
        router.use(globalMiddleware);
        // Repository validation routes
        this.addValidationRoutes(router);
        // Repository information routes
        this.addInfoRoutes(router);
        // Health check route
        this.addHealthRoutes(router);
        return router;
    }
    addValidationRoutes(router) {
        /**
         * @openapi
         * /api/repositories/validate:
         *   post:
         *     tags:
         *       - Repository Management
         *     summary: Validate repository path
         *     description: |
         *       Validate that a local path is a valid repository directory.
         *       Checks path existence, directory status, permissions, Git status, and TaskMaster project status.
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/RepositoryValidateRequest'
         *           examples:
         *             basic:
         *               summary: Basic validation
         *               value:
         *                 repositoryPath: "/Users/john/projects/my-app"
         *             gitOnly:
         *               summary: Git validation only
         *               value:
         *                 repositoryPath: "/Users/john/projects/my-app"
         *                 validateGit: true
         *                 validateTaskMaster: false
         *     responses:
         *       200:
         *         description: Validation completed successfully
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/RepositoryValidateResponse'
         *             examples:
         *               validRepo:
         *                 summary: Valid repository
         *                 value:
         *                   success: true
         *                   data:
         *                     isValid: true
         *                     validations:
         *                       - type: "path"
         *                         isValid: true
         *                         message: "Path exists and is accessible"
         *                       - type: "directory"
         *                         isValid: true
         *                         message: "Path is a valid directory"
         *                       - type: "git"
         *                         isValid: true
         *                         message: "Valid Git repository"
         *                     repositoryInfo:
         *                       path: "/Users/john/projects/my-app"
         *                       name: "my-app"
         *                       isGitRepository: true
         *                       isTaskMasterProject: false
         *                       gitBranch: "main"
         *               invalidRepo:
         *                 summary: Invalid repository
         *                 value:
         *                   success: true
         *                   data:
         *                     isValid: false
         *                     validations:
         *                       - type: "path"
         *                         isValid: false
         *                         message: "Path does not exist or is not accessible"
         *                     errors:
         *                       - "Path does not exist or is not accessible"
         *       400:
         *         description: Invalid request parameters
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 success:
         *                   type: boolean
         *                   example: false
         *                 error:
         *                   type: object
         *                   properties:
         *                     code:
         *                       type: string
         *                       example: "VALIDATION_ERROR"
         *                     message:
         *                       type: string
         *                       example: "Repository path is required"
         *       429:
         *         description: Rate limit exceeded
         *       500:
         *         description: Internal server error
         */
        router.post('/validate', (0, middleware_1.validationMiddleware)({
            bodySchema: {
                required: ['repositoryPath'],
                properties: {
                    repositoryPath: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 500
                    },
                    validateGit: { type: 'boolean' },
                    validateTaskMaster: { type: 'boolean' }
                }
            },
            customValidators: [
                this.validateRepositoryPath,
                this.validateSecurityConstraints
            ]
        }), this.asyncHandler(this.controller.validateRepository.bind(this.controller)));
    }
    addInfoRoutes(router) {
        /**
         * @openapi
         * /api/repositories/info:
         *   get:
         *     tags:
         *       - Repository Management
         *     summary: Get repository information
         *     description: Retrieve detailed information about a repository without full validation
         *     parameters:
         *       - in: query
         *         name: repositoryPath
         *         required: true
         *         schema:
         *           type: string
         *         description: Absolute path to the repository
         *     responses:
         *       200:
         *         description: Repository information retrieved successfully
         *       400:
         *         description: Missing or invalid repository path
         *       500:
         *         description: Internal server error
         */
        router.get('/info', (0, middleware_1.validationMiddleware)({
            querySchema: {
                required: ['repositoryPath'],
                properties: {
                    repositoryPath: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 500
                    }
                }
            },
            customValidators: [
                this.validateRepositoryPathFromQuery
            ]
        }), this.asyncHandler(this.controller.getRepositoryInfo.bind(this.controller)));
    }
    addHealthRoutes(router) {
        /**
         * @openapi
         * /api/repositories/health:
         *   get:
         *     tags:
         *       - Repository Management
         *     summary: Repository service health check
         *     description: Check the health status of repository management services
         *     responses:
         *       200:
         *         description: Service is healthy
         */
        router.get('/health', this.asyncHandler(this.controller.healthCheck.bind(this.controller)));
    }
}
exports.RepositoryRouteFactory = RepositoryRouteFactory;
// Factory function for creating repository routes
function createRepositoryRoutes() {
    const factory = new RepositoryRouteFactory();
    return factory.createRouter();
}
//# sourceMappingURL=repositoryRoutes.js.map