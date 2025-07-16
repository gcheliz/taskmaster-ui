"use strict";
// Repository Management Controller
// Handles repository validation and management operations
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryController = void 0;
const repositoryValidationService_1 = require("../services/repositoryValidationService");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../utils/errorHandler");
class RepositoryController {
    /**
     * Validate a repository path
     * POST /api/repositories/validate
     */
    async validateRepository(req, res) {
        const startTime = Date.now();
        const requestId = req.requestId || 'unknown';
        const context = {
            requestId,
            operation: 'validate-repository',
            path: req.body?.repositoryPath
        };
        try {
            logger_1.logger.logApiRequest(req.method, req.path, context);
            const validateRequest = req.validatedBody;
            const { repositoryPath, validateGit = true, validateTaskMaster = true } = validateRequest;
            logger_1.logger.info('Validating repository', {
                ...context,
                repositoryPath,
                validateGit,
                validateTaskMaster
            }, 'repository-controller');
            // Perform validation
            const validationResult = await repositoryValidationService_1.repositoryValidationService.validateRepository(repositoryPath, {
                validateGit,
                validateTaskMaster,
                checkPermissions: true
            });
            const duration = Date.now() - startTime;
            const response = {
                success: true,
                data: validationResult,
                metadata: {
                    timestamp: new Date().toISOString(),
                    requestId,
                    duration,
                    version: '1.0.0'
                }
            };
            logger_1.logger.logApiResponse(req.method, req.path, 200, duration, context);
            logger_1.logger.info('Repository validation completed', {
                ...context,
                isValid: validationResult.isValid,
                validationCount: validationResult.validations.length
            }, 'repository-controller');
            res.status(200).json(response);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const taskMasterError = errorHandler_1.errorHandler.normalizeError(error, context);
            logger_1.logger.logApiResponse(req.method, req.path, 500, duration, context);
            logger_1.logger.error('Repository validation failed', context, taskMasterError, 'repository-controller');
            const statusCode = errorHandler_1.errorHandler.getHttpStatusCode(taskMasterError);
            const errorResponse = {
                success: false,
                error: {
                    code: taskMasterError.code,
                    message: taskMasterError.userMessage,
                    details: {
                        type: taskMasterError.type,
                        severity: taskMasterError.severity,
                        suggestions: taskMasterError.suggestions
                    },
                    correlationId: requestId
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    requestId,
                    duration,
                    version: '1.0.0'
                }
            };
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * Get repository information
     * GET /api/repositories/info?repositoryPath=<path>
     */
    async getRepositoryInfo(req, res) {
        const startTime = Date.now();
        const requestId = req.requestId || 'unknown';
        const repositoryPath = req.query.repositoryPath;
        const context = {
            requestId,
            operation: 'get-repository-info',
            path: repositoryPath
        };
        try {
            logger_1.logger.logApiRequest(req.method, req.path, context);
            if (!repositoryPath) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_PARAMETER',
                        message: 'repositoryPath query parameter is required'
                    },
                    metadata: {
                        timestamp: new Date().toISOString(),
                        requestId,
                        duration: Date.now() - startTime,
                        version: '1.0.0'
                    }
                });
                return;
            }
            logger_1.logger.info('Getting repository info', { ...context, repositoryPath }, 'repository-controller');
            // Get repository information through validation
            const validationResult = await repositoryValidationService_1.repositoryValidationService.validateRepository(repositoryPath, {
                validateGit: true,
                validateTaskMaster: true,
                checkPermissions: false // Just get info, don't check permissions
            });
            const duration = Date.now() - startTime;
            const response = {
                success: true,
                data: validationResult.repositoryInfo,
                metadata: {
                    timestamp: new Date().toISOString(),
                    requestId,
                    duration,
                    version: '1.0.0'
                }
            };
            logger_1.logger.logApiResponse(req.method, req.path, 200, duration, context);
            res.status(200).json(response);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const taskMasterError = errorHandler_1.errorHandler.normalizeError(error, context);
            logger_1.logger.logApiResponse(req.method, req.path, 500, duration, context);
            logger_1.logger.error('Get repository info failed', context, taskMasterError, 'repository-controller');
            const statusCode = errorHandler_1.errorHandler.getHttpStatusCode(taskMasterError);
            const errorResponse = {
                success: false,
                error: {
                    code: taskMasterError.code,
                    message: taskMasterError.userMessage,
                    correlationId: requestId
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    requestId,
                    duration,
                    version: '1.0.0'
                }
            };
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * Health check for repository service
     * GET /api/repositories/health
     */
    async healthCheck(req, res) {
        const startTime = Date.now();
        const requestId = req.requestId || 'unknown';
        try {
            const healthInfo = {
                service: 'repository-management',
                status: 'healthy',
                timestamp: new Date().toISOString(),
                checks: {
                    service: 'ok',
                    dependencies: {
                        filesystem: 'ok',
                        git: 'ok'
                    }
                }
            };
            const response = {
                success: true,
                data: healthInfo,
                metadata: {
                    timestamp: new Date().toISOString(),
                    requestId,
                    duration: Date.now() - startTime,
                    version: '1.0.0'
                }
            };
            res.status(200).json(response);
        }
        catch (error) {
            const taskMasterError = errorHandler_1.errorHandler.normalizeError(error, {
                requestId,
                operation: 'repository-health-check'
            });
            const response = {
                success: false,
                error: {
                    code: taskMasterError.code,
                    message: taskMasterError.userMessage,
                    correlationId: requestId
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    requestId,
                    duration: Date.now() - startTime,
                    version: '1.0.0'
                }
            };
            res.status(500).json(response);
        }
    }
}
exports.RepositoryController = RepositoryController;
//# sourceMappingURL=repositoryController.js.map