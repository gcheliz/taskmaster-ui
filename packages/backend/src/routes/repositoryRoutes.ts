// Repository Management Routes
// RESTful endpoints for repository validation and management

import { Router } from 'express';
import { RepositoryController } from '../controllers/repositoryController';
import { Request, Response, NextFunction } from 'express';

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

// Route Factory
export class RepositoryRouteFactory {
  private controller: RepositoryController;

  constructor() {
    this.controller = new RepositoryController();
  }

  createRouter(): Router {
    const router = Router();

    // Basic middleware for now
    router.use((req: any, res: any, next: any) => {
      req.requestId = `repo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      next();
    });

    // Repository validation routes
    this.addValidationRoutes(router);

    // Repository information routes
    this.addInfoRoutes(router);

    // Health check route
    this.addHealthRoutes(router);

    return router;
  }

  private addValidationRoutes(router: Router): void {
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
    router.post('/validate',
      (req: any, res: any, next: any) => {
        // Basic validation
        if (!req.body.repositoryPath) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'MISSING_PARAMETER',
              message: 'repositoryPath is required'
            }
          });
        }
        req.validatedBody = req.body;
        next();
      },
      this.asyncHandler(this.controller.validateRepository.bind(this.controller))
    );
  }

  private addInfoRoutes(router: Router): void {
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
    router.get('/info',
      this.asyncHandler(this.controller.getRepositoryInfo.bind(this.controller))
    );
  }

  private addHealthRoutes(router: Router): void {
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
    router.get('/health',
      this.asyncHandler(this.controller.healthCheck.bind(this.controller))
    );
  }

  // Custom Validation Functions

  private asyncHandler = (fn: Function) => {
    return (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };
}

// Factory function for creating repository routes
export function createRepositoryRoutes(): Router {
  const factory = new RepositoryRouteFactory();
  return factory.createRouter();
}

// Export route schemas
export { schemas as repositoryApiSchemas };