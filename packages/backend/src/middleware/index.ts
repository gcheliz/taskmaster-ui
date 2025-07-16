// Advanced Middleware Stack with AOP Patterns
// Demonstrates: Aspect-oriented programming, middleware composition, dependency injection

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, ApiError, ApiMetadata, ValidationError } from '../types/api';

// Enhanced Request/Response Interfaces
export interface EnhancedRequest extends Request {
  requestId: string;
  startTime: number;
  user?: any;
  rateLimit?: any;
  validatedBody?: any;
  repositoryPath?: string;
  correlationId?: string;
}

export interface EnhancedResponse extends Response {
  apiResponse: <T>(data?: T, error?: ApiError) => void;
  apiError: (error: ApiError, statusCode?: number) => void;
  apiSuccess: <T>(data: T, metadata?: Partial<ApiMetadata>) => void;
}

// Middleware Factory Pattern
export type MiddlewareFactory<T = any> = (options?: T) => (req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => void | Promise<void>;

// Request Context Management
export class RequestContext {
  private static contexts = new Map<string, RequestContext>();

  constructor(
    public readonly requestId: string,
    public readonly startTime: number,
    public readonly correlationId?: string
  ) {}

  static create(req: EnhancedRequest): RequestContext {
    const context = new RequestContext(
      req.requestId,
      req.startTime,
      req.correlationId
    );
    
    RequestContext.contexts.set(req.requestId, context);
    return context;
  }

  static get(requestId: string): RequestContext | undefined {
    return RequestContext.contexts.get(requestId);
  }

  static cleanup(requestId: string): void {
    RequestContext.contexts.delete(requestId);
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }
}

// Request ID and Correlation Middleware
export const requestIdMiddleware: MiddlewareFactory = () => {
  return (req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => {
    req.requestId = uuidv4();
    req.startTime = Date.now();
    req.correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
    
    // Set response headers
    res.setHeader('X-Request-ID', req.requestId);
    res.setHeader('X-Correlation-ID', req.correlationId || req.requestId);
    
    // Create request context
    RequestContext.create(req);
    
    // Cleanup on response finish
    res.on('finish', () => {
      RequestContext.cleanup(req.requestId);
    });
    
    next();
  };
};

// Enhanced API Response Middleware
export const apiResponseMiddleware: MiddlewareFactory = () => {
  return (req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => {
    // Success response helper
    res.apiSuccess = <T>(data: T, metadata?: Partial<ApiMetadata>) => {
      const context = RequestContext.get(req.requestId);
      const response: ApiResponse<T> = {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
          duration: context?.getDuration() || 0,
          version: process.env.API_VERSION || '1.0.0',
          ...metadata
        }
      };
      
      res.status(200).json(response);
    };

    // Error response helper
    res.apiError = (error: ApiError, statusCode: number = 500) => {
      const context = RequestContext.get(req.requestId);
      const response: ApiResponse = {
        success: false,
        error: {
          ...error,
          correlationId: req.correlationId
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
          duration: context?.getDuration() || 0,
          version: process.env.API_VERSION || '1.0.0'
        }
      };
      
      res.status(statusCode).json(response);
    };

    // Generic response helper
    res.apiResponse = <T>(data?: T, error?: ApiError) => {
      if (error) {
        res.apiError(error);
      } else {
        res.apiSuccess(data);
      }
    };

    next();
  };
};

// Advanced Request Validation Middleware
export interface ValidationOptions {
  bodySchema?: any;
  querySchema?: any;
  paramSchema?: any;
  customValidators?: Array<(req: EnhancedRequest) => ValidationError[]>;
}

export const validationMiddleware: MiddlewareFactory<ValidationOptions> = (options = {}) => {
  return async (req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    try {
      // Body validation
      if (options.bodySchema && req.body) {
        const bodyErrors = validateWithSchema(req.body, options.bodySchema, 'body');
        errors.push(...bodyErrors);
      }

      // Query validation
      if (options.querySchema && req.query) {
        const queryErrors = validateWithSchema(req.query, options.querySchema, 'query');
        errors.push(...queryErrors);
      }

      // Param validation
      if (options.paramSchema && req.params) {
        const paramErrors = validateWithSchema(req.params, options.paramSchema, 'params');
        errors.push(...paramErrors);
      }

      // Custom validators
      if (options.customValidators) {
        for (const validator of options.customValidators) {
          const customErrors = validator(req);
          errors.push(...customErrors);
        }
      }

      // Repository path validation
      if (req.body?.repositoryPath || req.query?.repositoryPath) {
        const repoPath = req.body?.repositoryPath || req.query?.repositoryPath;
        req.repositoryPath = repoPath as string;
        
        const repoErrors = validateRepositoryPath(repoPath as string);
        errors.push(...repoErrors);
      }

      if (errors.length > 0) {
        return res.apiError({
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: { errors, warnings }
        }, 400);
      }

      // Store validated body
      req.validatedBody = req.body;
      next();

    } catch (error) {
      return res.apiError({
        code: 'VALIDATION_SYSTEM_ERROR',
        message: 'Validation system error',
        details: { error: (error as Error).message }
      }, 500);
    }
  };
};

// Rate Limiting Middleware with Redis-like pattern
export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: EnhancedRequest) => string;
  skipSuccessful?: boolean;
  skipFailed?: boolean;
}

export const rateLimitMiddleware: MiddlewareFactory<RateLimitOptions> = (options = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
}) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => {
    const key = options.keyGenerator?.(req) || req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Cleanup old entries
    for (const [k, v] of requests.entries()) {
      if (v.resetTime < windowStart) {
        requests.delete(k);
      }
    }

    const current = requests.get(key) || { count: 0, resetTime: now + options.windowMs };
    
    if (current.resetTime < now) {
      current.count = 0;
      current.resetTime = now + options.windowMs;
    }

    current.count++;
    requests.set(key as string, current);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.maxRequests - current.count));
    res.setHeader('X-RateLimit-Reset', new Date(current.resetTime).toISOString());

    if (current.count > options.maxRequests) {
      return res.apiError({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        details: {
          limit: options.maxRequests,
          windowMs: options.windowMs,
          resetTime: new Date(current.resetTime).toISOString()
        }
      }, 429);
    }

    req.rateLimit = {
      limit: options.maxRequests,
      remaining: options.maxRequests - current.count,
      resetTime: new Date(current.resetTime).toISOString()
    };

    next();
  };
};

// Security Headers Middleware
export const securityHeadersMiddleware: MiddlewareFactory = () => {
  return (req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    next();
  };
};

// Error Handling Middleware
export const errorHandlingMiddleware = (
  error: Error,
  req: EnhancedRequest,
  res: EnhancedResponse,
  next: NextFunction
) => {
  console.error(`Error in request ${req.requestId}:`, error);

  // Don't respond if headers already sent
  if (res.headersSent) {
    return next(error);
  }

  const context = RequestContext.get(req.requestId);
  
  res.apiError({
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'An internal server error occurred'
      : error.message,
    details: process.env.NODE_ENV === 'development' ? {
      stack: error.stack,
      duration: context?.getDuration()
    } : undefined,
    correlationId: req.correlationId
  }, 500);
};

// Logging Middleware
export const loggingMiddleware: MiddlewareFactory = () => {
  return (req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => {
    const startTime = Date.now();
    
    // Log request
    console.log(`[${new Date().toISOString()}] ${req.requestId} ${req.method} ${req.originalUrl} - Started`);
    
    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
      
      console.log(
        `[${new Date().toISOString()}] ${req.requestId} ${req.method} ${req.originalUrl} - ` +
        `${res.statusCode} ${res.statusMessage} - ${duration}ms [${logLevel}]`
      );
    });
    
    next();
  };
};

// Helper Functions
function validateWithSchema(data: any, schema: any, context: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Basic validation implementation
  // In production, use libraries like Joi, Yup, or Zod
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data) || data[field] === undefined || data[field] === null) {
        errors.push({
          field: `${context}.${field}`,
          code: 'REQUIRED',
          message: `Field '${field}' is required`,
          value: data[field]
        });
      }
    }
  }
  
  return errors;
}

function validateRepositoryPath(path: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!path || typeof path !== 'string') {
    errors.push({
      field: 'repositoryPath',
      code: 'INVALID_TYPE',
      message: 'Repository path must be a string',
      value: path
    });
    return errors;
  }
  
  if (path.length === 0) {
    errors.push({
      field: 'repositoryPath',
      code: 'EMPTY_PATH',
      message: 'Repository path cannot be empty',
      value: path
    });
  }
  
  if (!path.startsWith('/')) {
    errors.push({
      field: 'repositoryPath',
      code: 'INVALID_PATH',
      message: 'Repository path must be absolute',
      value: path
    });
  }
  
  return errors;
}

// Middleware Composition Helper
export function composeMiddleware(...middlewares: Array<(req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => void>) {
  return (req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => {
    let index = 0;
    
    function executeNext(): void {
      if (index >= middlewares.length) {
        return next();
      }
      
      const middleware = middlewares[index++];
      middleware(req, res, executeNext);
    }
    
    executeNext();
  };
}