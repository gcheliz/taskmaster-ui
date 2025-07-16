// Repository Management Controller
// Handles repository validation and management operations

import { 
  RepositoryValidateRequest,
  RepositoryValidateResponse,
  ApiResponse 
} from '../types/api';
import { Request, Response } from 'express';
import { repositoryValidationService } from '../services/repositoryValidationService';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';

export class RepositoryController {
  /**
   * Validate a repository path
   * POST /api/repositories/validate
   */
  async validateRepository(req: any, res: any): Promise<void> {
    const startTime = Date.now();
    const requestId = req.requestId || 'unknown';
    const context = { 
      requestId, 
      operation: 'validate-repository',
      path: req.body?.repositoryPath 
    };

    try {
      logger.logApiRequest(req.method, req.path, context);

      const validateRequest: RepositoryValidateRequest = req.validatedBody;
      const { repositoryPath, validateGit = true, validateTaskMaster = true } = validateRequest;

      logger.info('Validating repository', { 
        ...context, 
        repositoryPath,
        validateGit,
        validateTaskMaster 
      }, 'repository-controller');

      // Perform validation
      const validationResult = await repositoryValidationService.validateRepository(
        repositoryPath,
        {
          validateGit,
          validateTaskMaster,
          checkPermissions: true
        }
      );

      const duration = Date.now() - startTime;
      
      const response: RepositoryValidateResponse = {
        success: true,
        data: validationResult,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId,
          duration,
          version: '1.0.0'
        }
      };

      logger.logApiResponse(req.method, req.path, 200, duration, context);
      logger.info('Repository validation completed', { 
        ...context, 
        isValid: validationResult.isValid,
        validationCount: validationResult.validations.length
      }, 'repository-controller');

      res.status(200).json(response);

    } catch (error) {
      const duration = Date.now() - startTime;
      const taskMasterError = errorHandler.normalizeError(error, context);
      
      logger.logApiResponse(req.method, req.path, 500, duration, context);
      logger.error('Repository validation failed', context, taskMasterError, 'repository-controller');

      const statusCode = errorHandler.getHttpStatusCode(taskMasterError);
      
      const errorResponse: ApiResponse = {
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
  async getRepositoryInfo(req: any, res: any): Promise<void> {
    const startTime = Date.now();
    const requestId = req.requestId || 'unknown';
    const repositoryPath = req.query.repositoryPath as string;
    const context = { 
      requestId, 
      operation: 'get-repository-info',
      path: repositoryPath 
    };

    try {
      logger.logApiRequest(req.method, req.path, context);

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

      logger.info('Getting repository info', { ...context, repositoryPath }, 'repository-controller');

      // Get repository information through validation
      const validationResult = await repositoryValidationService.validateRepository(
        repositoryPath,
        {
          validateGit: true,
          validateTaskMaster: true,
          checkPermissions: false // Just get info, don't check permissions
        }
      );

      const duration = Date.now() - startTime;
      
      const response: ApiResponse = {
        success: true,
        data: validationResult.repositoryInfo,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId,
          duration,
          version: '1.0.0'
        }
      };

      logger.logApiResponse(req.method, req.path, 200, duration, context);
      res.status(200).json(response);

    } catch (error) {
      const duration = Date.now() - startTime;
      const taskMasterError = errorHandler.normalizeError(error, context);
      
      logger.logApiResponse(req.method, req.path, 500, duration, context);
      logger.error('Get repository info failed', context, taskMasterError, 'repository-controller');

      const statusCode = errorHandler.getHttpStatusCode(taskMasterError);
      
      const errorResponse: ApiResponse = {
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
  async healthCheck(req: any, res: any): Promise<void> {
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

      const response: ApiResponse = {
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

    } catch (error) {
      const taskMasterError = errorHandler.normalizeError(error, { 
        requestId, 
        operation: 'repository-health-check' 
      });
      
      const response: ApiResponse = {
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