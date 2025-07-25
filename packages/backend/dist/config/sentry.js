"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.ApplicationError = void 0;
exports.initSentry = initSentry;
exports.setupSentryMiddleware = setupSentryMiddleware;
exports.setupSentryErrorHandler = setupSentryErrorHandler;
exports.startTransaction = startTransaction;
exports.measurePerformance = measurePerformance;
exports.asyncHandler = asyncHandler;
exports.captureErrorWithContext = captureErrorWithContext;
const Sentry = __importStar(require("@sentry/node"));
// import { ProfilingIntegration } from '@sentry/profiling-node'
const Tracing = __importStar(require("@sentry/tracing"));
const winston_adapter_1 = require("../utils/winston-adapter");
function initSentry(app) {
    const sentryDsn = process.env.SENTRY_DSN;
    if (!sentryDsn) {
        winston_adapter_1.logger.info('Sentry DSN not configured, skipping initialization');
        return;
    }
    const config = {
        dsn: sentryDsn,
        environment: process.env.NODE_ENV || 'development',
        release: process.env.APP_VERSION || 'unknown',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        debug: process.env.NODE_ENV !== 'production',
    };
    Sentry.init({
        ...config,
        integrations: [
            // Enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),
            // Enable Express.js middleware tracing
            new Tracing.Integrations.Express({ app: app }),
            // Enable profiling (disabled due to missing native module)
            // new ProfilingIntegration(),
            // Prisma integration
            new Tracing.Integrations.Prisma({ client: true }),
            // Additional integrations
            new Sentry.Integrations.OnUncaughtException({
                onFatalError: (err) => {
                    winston_adapter_1.logger.error('Fatal error occurred:', err);
                    process.exit(1);
                },
            }),
            new Sentry.Integrations.OnUnhandledRejection({
                mode: 'warn',
            }),
        ],
        // Configure tracing
        tracesSampler: (samplingContext) => {
            // Don't trace health checks
            if (samplingContext.request?.url?.includes('/health')) {
                return 0;
            }
            // Don't trace static assets
            if (samplingContext.request?.url?.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
                return 0;
            }
            // Use default sample rate for everything else
            return config.tracesSampleRate || 0.1;
        },
        // Filter out certain errors
        beforeSend(event, hint) {
            // Filter out expected errors
            if (event.exception?.values?.[0]?.type === 'ValidationError') {
                return null;
            }
            // Add additional context
            if (event.request) {
                // Remove sensitive data
                delete event.request.cookies;
                delete event.request.headers?.authorization;
                delete event.request.headers?.cookie;
            }
            return event;
        },
        // Configure breadcrumbs
        beforeBreadcrumb(breadcrumb, hint) {
            // Filter out noisy breadcrumbs
            if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
                return null;
            }
            // Don't log SQL queries in breadcrumbs
            if (breadcrumb.category === 'query') {
                return null;
            }
            return breadcrumb;
        },
    });
    winston_adapter_1.logger.info('Sentry initialized successfully', {
        environment: config.environment,
        release: config.release,
    });
}
// Sentry middleware setup
function setupSentryMiddleware(app) {
    // RequestHandler creates a separate execution context using domains
    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
}
// Sentry error handler (must be before any other error middleware)
function setupSentryErrorHandler(app) {
    app.use(Sentry.Handlers.errorHandler({
        shouldHandleError(error) {
            // Capture 4xx errors in development
            if (process.env.NODE_ENV !== 'production') {
                return true;
            }
            // Only capture 5xx errors in production
            return !error.status || (typeof error.status === 'number' && error.status >= 500);
        },
    }));
}
// Custom error classes for better tracking
class ApplicationError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApplicationError = ApplicationError;
class ValidationError extends ApplicationError {
    constructor(message, details) {
        super(message, 400, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
        if (details) {
            this.details = details;
        }
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends ApplicationError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends ApplicationError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends ApplicationError {
    constructor(resource) {
        super(`${resource} not found`, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends ApplicationError {
    constructor(message) {
        super(message, 409, 'CONFLICT');
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends ApplicationError {
    constructor(message = 'Too many requests') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;
// Performance monitoring helpers
function startTransaction(name, op) {
    return Sentry.startTransaction({ name, op });
}
function measurePerformance(name, operation, op = 'function') {
    const transaction = startTransaction(name, op);
    const span = transaction.startChild({
        op: `${op}.execution`,
        description: name,
    });
    try {
        const result = operation();
        if (result instanceof Promise) {
            return result.finally(() => {
                span.finish();
                transaction.finish();
            });
        }
        span.finish();
        transaction.finish();
        return result;
    }
    catch (error) {
        span.setStatus('internal_error');
        transaction.setStatus('internal_error');
        span.finish();
        transaction.finish();
        throw error;
    }
}
// Express async handler wrapper with Sentry integration
function asyncHandler(fn) {
    return (req, res, next) => {
        const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
        const span = transaction?.startChild({
            op: 'request.handler',
            description: `${req.method} ${req.route?.path || req.path}`,
        });
        Promise.resolve(fn(req, res, next))
            .catch((error) => {
            span?.setStatus('internal_error');
            next(error);
        })
            .finally(() => {
            span?.finish();
        });
    };
}
// Capture additional context for errors
function captureErrorWithContext(error, context) {
    const scope = new Sentry.Scope();
    if (context.user) {
        scope.setUser(context.user);
    }
    if (context.request) {
        scope.setContext('request', {
            method: context.request.method,
            url: context.request.url,
            params: context.request.params,
            query: context.request.query,
        });
    }
    if (context.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
            scope.setExtra(key, value);
        });
    }
    if (context.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
            scope.setTag(key, value);
        });
    }
    return Sentry.captureException(error, scope);
}
//# sourceMappingURL=sentry.js.map