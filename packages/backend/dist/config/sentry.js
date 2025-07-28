'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.RateLimitError =
  exports.ConflictError =
  exports.NotFoundError =
  exports.AuthorizationError =
  exports.AuthenticationError =
  exports.ValidationError =
  exports.ApplicationError =
    void 0;
exports.initSentry = initSentry;
exports.setupSentryMiddleware = setupSentryMiddleware;
exports.setupSentryErrorHandler = setupSentryErrorHandler;
exports.startTransaction = startTransaction;
exports.measurePerformance = measurePerformance;
exports.asyncHandler = asyncHandler;
exports.captureErrorWithContext = captureErrorWithContext;
const Sentry = __importStar(require('@sentry/node'));
const node_1 = require('@sentry/node');
const winston_adapter_1 = require('../utils/winston-adapter');
function initSentry(app) {
  const sentryDsn = process.env['SENTRY_DSN'];
  if (!sentryDsn) {
    winston_adapter_1.logger.info(
      'Sentry DSN not configured, skipping initialization'
    );
    return;
  }
  const config = {
    dsn: sentryDsn,
    environment: process.env['NODE_ENV'] || 'development',
    release: process.env['APP_VERSION'] || 'unknown',
    tracesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.1 : 1.0,
    debug: process.env['NODE_ENV'] !== 'production',
  };
  Sentry.init({
    ...config,
    integrations: [
      // Enable HTTP calls tracing
      Sentry.httpIntegration(),
      // Enable Express.js middleware tracing
      (0, node_1.expressIntegration)(),
      // Prisma integration
      Sentry.prismaIntegration(),
      // Additional integrations
      Sentry.onUncaughtExceptionIntegration({
        onFatalError: err => {
          winston_adapter_1.logger.error('Fatal error occurred:', err);
          process.exit(1);
        },
      }),
      Sentry.onUnhandledRejectionIntegration({
        mode: 'warn',
      }),
    ],
    // Configure tracing
    tracesSampler: samplingContext => {
      // Don't trace health checks
      if (samplingContext.request?.url?.includes('/health')) {
        return 0;
      }
      // Don't trace static assets
      if (
        samplingContext.request?.url?.match(
          /\.(js|css|png|jpg|jpeg|gif|ico|svg)$/
        )
      ) {
        return 0;
      }
      // Use default sample rate for everything else
      return config.tracesSampleRate || 0.1;
    },
    // Filter out certain errors
    beforeSend(event, _hint) {
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
    beforeBreadcrumb(breadcrumb, _hint) {
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
  // In Sentry v9, Express handlers are part of the Express integration
  // No need for separate request/tracing handlers - they're handled automatically
  // by the Express integration during Sentry.init()
}
// Sentry error handler (must be before any other error middleware)
function setupSentryErrorHandler(app) {
  // In Sentry v9, the error handling is done automatically by the Express integration
  // We can add a custom error handler if needed
  app.use((error, _req, _res, next) => {
    // Check if we should handle this error
    const shouldHandle =
      process.env['NODE_ENV'] !== 'production'
        ? true
        : !error.status ||
          (typeof error.status === 'number' && error.status >= 500);
    if (shouldHandle) {
      Sentry.captureException(error);
    }
    next(error);
  });
}
// Custom error classes for better tracking
class ApplicationError extends Error {
  constructor(
    message,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    isOperational = true
  ) {
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
  // In v9, create a transaction-like wrapper around startSpan
  let spanFinished = false;
  const transactionLike = {
    finish: () => {
      spanFinished = true;
    },
    setStatus: status => {
      // Status is handled within the span callback
    },
    startChild: childOp => ({
      finish: () => {},
    }),
  };
  // Start the span asynchronously
  Sentry.startSpan({ name, op }, () => {
    // Wait for finish to be called
    return new Promise(resolve => {
      const checkFinished = () => {
        if (spanFinished) {
          resolve(undefined);
        } else {
          setTimeout(checkFinished, 10);
        }
      };
      checkFinished();
    });
  });
  return transactionLike;
}
function measurePerformance(name, operation, op = 'function') {
  return Sentry.startSpan({ name, op }, () => {
    return operation();
  });
}
// Express async handler wrapper with Sentry integration
function asyncHandler(fn) {
  return (req, res, next) => {
    return Sentry.startSpan(
      {
        op: 'request.handler',
        name: `${req.method} ${req.route?.path || req.path}`,
      },
      async () => {
        try {
          await fn(req, res, next);
        } catch (error) {
          next(error);
        }
      }
    );
  };
}
// Capture additional context for errors
function captureErrorWithContext(error, context) {
  const scope = Sentry.getCurrentScope().clone();
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
