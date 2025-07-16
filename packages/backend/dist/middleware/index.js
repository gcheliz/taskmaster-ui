"use strict";
// Advanced Middleware Stack with AOP Patterns
// Demonstrates: Aspect-oriented programming, middleware composition, dependency injection
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingMiddleware = exports.errorHandlingMiddleware = exports.securityHeadersMiddleware = exports.rateLimitMiddleware = exports.validationMiddleware = exports.apiResponseMiddleware = exports.requestIdMiddleware = exports.RequestContext = void 0;
exports.composeMiddleware = composeMiddleware;
const uuid_1 = require("uuid");
// Request Context Management
class RequestContext {
    constructor(requestId, startTime, correlationId) {
        this.requestId = requestId;
        this.startTime = startTime;
        this.correlationId = correlationId;
    }
    static create(req) {
        const context = new RequestContext(req.requestId, req.startTime, req.correlationId);
        RequestContext.contexts.set(req.requestId, context);
        return context;
    }
    static get(requestId) {
        return RequestContext.contexts.get(requestId);
    }
    static cleanup(requestId) {
        RequestContext.contexts.delete(requestId);
    }
    getDuration() {
        return Date.now() - this.startTime;
    }
}
exports.RequestContext = RequestContext;
RequestContext.contexts = new Map();
// Request ID and Correlation Middleware
const requestIdMiddleware = () => {
    return (req, res, next) => {
        req.requestId = (0, uuid_1.v4)();
        req.startTime = Date.now();
        req.correlationId = req.headers['x-correlation-id'] || (0, uuid_1.v4)();
        // Set response headers
        res.setHeader('X-Request-ID', req.requestId);
        res.setHeader('X-Correlation-ID', req.correlationId);
        // Create request context
        RequestContext.create(req);
        // Cleanup on response finish
        res.on('finish', () => {
            RequestContext.cleanup(req.requestId);
        });
        next();
    };
};
exports.requestIdMiddleware = requestIdMiddleware;
// Enhanced API Response Middleware
const apiResponseMiddleware = () => {
    return (req, res, next) => {
        // Success response helper
        res.apiSuccess = (data, metadata) => {
            const context = RequestContext.get(req.requestId);
            const response = {
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
        res.apiError = (error, statusCode = 500) => {
            const context = RequestContext.get(req.requestId);
            const response = {
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
        res.apiResponse = (data, error) => {
            if (error) {
                res.apiError(error);
            }
            else {
                res.apiSuccess(data);
            }
        };
        next();
    };
};
exports.apiResponseMiddleware = apiResponseMiddleware;
const validationMiddleware = (options = {}) => {
    return async (req, res, next) => {
        const errors = [];
        const warnings = [];
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
                req.repositoryPath = repoPath;
                const repoErrors = validateRepositoryPath(repoPath);
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
        }
        catch (error) {
            return res.apiError({
                code: 'VALIDATION_SYSTEM_ERROR',
                message: 'Validation system error',
                details: { error: error.message }
            }, 500);
        }
    };
};
exports.validationMiddleware = validationMiddleware;
const rateLimitMiddleware = (options = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
}) => {
    const requests = new Map();
    return (req, res, next) => {
        const key = options.keyGenerator?.(req) || req.ip;
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
        requests.set(key, current);
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
exports.rateLimitMiddleware = rateLimitMiddleware;
// Security Headers Middleware
const securityHeadersMiddleware = () => {
    return (req, res, next) => {
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
exports.securityHeadersMiddleware = securityHeadersMiddleware;
// Error Handling Middleware
const errorHandlingMiddleware = (error, req, res, next) => {
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
exports.errorHandlingMiddleware = errorHandlingMiddleware;
// Logging Middleware
const loggingMiddleware = () => {
    return (req, res, next) => {
        const startTime = Date.now();
        // Log request
        console.log(`[${new Date().toISOString()}] ${req.requestId} ${req.method} ${req.originalUrl} - Started`);
        // Log response when finished
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
            console.log(`[${new Date().toISOString()}] ${req.requestId} ${req.method} ${req.originalUrl} - ` +
                `${res.statusCode} ${res.statusMessage} - ${duration}ms [${logLevel}]`);
        });
        next();
    };
};
exports.loggingMiddleware = loggingMiddleware;
// Helper Functions
function validateWithSchema(data, schema, context) {
    const errors = [];
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
function validateRepositoryPath(path) {
    const errors = [];
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
function composeMiddleware(...middlewares) {
    return (req, res, next) => {
        let index = 0;
        function executeNext() {
            if (index >= middlewares.length) {
                return next();
            }
            const middleware = middlewares[index++];
            middleware(req, res, executeNext);
        }
        executeNext();
    };
}
//# sourceMappingURL=index.js.map