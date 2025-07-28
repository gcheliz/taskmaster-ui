import { Request, Response } from 'express';
import { {{serviceName}} } from '../services/{{serviceName}}';
import { logger } from '../utils/winston-adapter';
{{#if authentication}}
import type { AuthenticatedRequest } from '../middleware/auth';
{{/if}}
{{#if validation}}
import { {{resourceName}}ValidationSchemas } from '../types/validation/{{resourceName}}Validation';
{{/if}}

export class {{controllerName}} {
  /**
   * {{description}}
   */
  static async {{methodName}}(req: {{#if authentication}}AuthenticatedRequest{{else}}Request{{/if}}, res: Response): Promise<Response> {
    try {
      {{#if authentication}}
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }
      {{/if}}
      
      {{#if validation}}
      // Validate request data
      const validationResult = {{resourceName}}ValidationSchemas.{{methodName}}.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validationResult.error.flatten(),
          },
        });
      }
      {{/if}}
      
      // Call service method
      const result = await {{serviceName}}.{{methodName}}(
        {{#if validation}}validationResult.data{{else}}req{{/if}}{{#if authentication}}, req.user.userId{{/if}}
      );
      
      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('{{controllerName}}.{{methodName}} error:', error);
      
      const message = error instanceof Error ? error.message : 'Request failed';
      const statusCode = (error as any).statusCode || 500;
      
      return res.status(statusCode).json({
        success: false,
        error: {
          code: 'REQUEST_FAILED',
          message,
        },
      });
    }
  }
}

export default {{controllerName}};