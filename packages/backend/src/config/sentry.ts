import * as Sentry from '@sentry/node';
import { expressIntegration } from '@sentry/node';
import { Application, Request, Response, NextFunction } from 'express';
import { logger } from '../utils/winston-adapter';

interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate?: number;
  profilesSampleRate?: number;
  debug?: boolean;
}

export function initSentry(_app: Application): void {
  const sentryDsn = process.env['SENTRY_DSN'];

  if (!sentryDsn) {
    logger.info('Sentry DSN not configured, skipping initialization');
    return;
  }

  const config: SentryConfig = {
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
      expressIntegration(),
      // Prisma integration
      Sentry.prismaIntegration(),
      // Additional integrations
      Sentry.onUncaughtExceptionIntegration({
        onFatalError: (err: Error) => {
          logger.error('Fatal error occurred:', err);
          process.exit(1);
        },
      }),
      Sentry.onUnhandledRejectionIntegration({
        mode: 'warn',
      }),
    ],
    // Configure tracing
    tracesSampler: (samplingContext: any) => {
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
    beforeSend(event: any, _hint: any) {
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
    beforeBreadcrumb(breadcrumb: any, _hint: any) {
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

  logger.info('Sentry initialized successfully', {
    environment: config.environment,
    release: config.release,
  });
}

// Sentry middleware setup
export function setupSentryMiddleware(_app: Application): void {
  // In Sentry v9, Express handlers are part of the Express integration
  // No need for separate request/tracing handlers - they're handled automatically
  // by the Express integration during Sentry.init()
}

// Sentry error handler (must be before any other error middleware)
export function setupSentryErrorHandler(_app: Application): void {
  // In Sentry v9, the error handling is done automatically by the Express integration
  // We can add a custom error handler if needed
  _app.use((error: any, _req: Request, _res: Response, next: NextFunction) => {
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
export class ApplicationError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    if (details) {
      (this as any).details = details;
    }
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends ApplicationError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

// Performance monitoring helpers
export function startTransaction(name: string, op: string) {
  // In v9, create a transaction-like wrapper around startSpan
  let spanFinished = false;

  const transactionLike = {
    finish: () => {
      spanFinished = true;
    },
    setStatus: (_status: any) => {
      // Status is handled within the span callback
    },
    startChild: (_childOp: { op: string; name: string }) => ({
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

export function measurePerformance<T>(
  name: string,
  operation: () => T | Promise<T>,
  op: string = 'function'
): T | Promise<T> {
  return Sentry.startSpan({ name, op }, () => {
    return operation();
  });
}

// Express async handler wrapper with Sentry integration
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
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
export function captureErrorWithContext(
  error: Error,
  context: {
    user?: { id: string; email?: string };
    request?: Request;
    extra?: Record<string, any>;
    tags?: Record<string, string>;
  }
): string {
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
