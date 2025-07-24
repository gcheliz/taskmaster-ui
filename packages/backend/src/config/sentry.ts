import * as Sentry from '@sentry/node'
import { ProfilingIntegration } from '@sentry/profiling-node'
import * as Tracing from '@sentry/tracing'
import { Express, Request, Response, NextFunction } from 'express'
import { logger } from '../utils/winston-adapter'

interface SentryConfig {
  dsn: string
  environment: string
  release?: string
  tracesSampleRate?: number
  profilesSampleRate?: number
  debug?: boolean
}

export function initSentry(app: Express): void {
  const sentryDsn = process.env.SENTRY_DSN

  if (!sentryDsn) {
    logger.info('Sentry DSN not configured, skipping initialization')
    return
  }

  const config: SentryConfig = {
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION || 'unknown',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV !== 'production',
  }

  Sentry.init({
    ...config,
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
      // Enable profiling
      new ProfilingIntegration(),
      // Prisma integration
      new Tracing.Integrations.Prisma({ client: true }),
      // Additional integrations
      new Sentry.Integrations.OnUncaughtException({
        onFatalError: (err) => {
          logger.error('Fatal error occurred:', err)
          process.exit(1)
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
        return 0
      }
      // Don't trace static assets
      if (samplingContext.request?.url?.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
        return 0
      }
      // Use default sample rate for everything else
      return config.tracesSampleRate || 0.1
    },
    // Filter out certain errors
    beforeSend(event, hint) {
      // Filter out expected errors
      if (event.exception?.values?.[0]?.type === 'ValidationError') {
        return null
      }
      
      // Add additional context
      if (event.request) {
        // Remove sensitive data
        delete event.request.cookies
        delete event.request.headers?.authorization
        delete event.request.headers?.cookie
      }
      
      return event
    },
    // Configure breadcrumbs
    beforeBreadcrumb(breadcrumb, hint) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null
      }
      // Don't log SQL queries in breadcrumbs
      if (breadcrumb.category === 'query') {
        return null
      }
      return breadcrumb
    },
  })

  logger.info('Sentry initialized successfully', {
    environment: config.environment,
    release: config.release,
  })
}

// Sentry middleware setup
export function setupSentryMiddleware(app: Express): void {
  // RequestHandler creates a separate execution context using domains
  app.use(Sentry.Handlers.requestHandler())

  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler())
}

// Sentry error handler (must be before any other error middleware)
export function setupSentryErrorHandler(app: Express): void {
  app.use(Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture 4xx errors in development
      if (process.env.NODE_ENV !== 'production') {
        return true
      }
      // Only capture 5xx errors in production
      return !error.status || error.status >= 500
    },
  }))
}

// Custom error classes for better tracking
export class ApplicationError extends Error {
  public statusCode: number
  public code: string
  public isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
    if (details) {
      (this as any).details = details
    }
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends ApplicationError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
    this.name = 'RateLimitError'
  }
}

// Performance monitoring helpers
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({ name, op })
}

export function measurePerformance<T>(
  name: string,
  operation: () => T | Promise<T>,
  op: string = 'function'
): T | Promise<T> {
  const transaction = startTransaction(name, op)
  const span = transaction.startChild({
    op: `${op}.execution`,
    description: name,
  })

  try {
    const result = operation()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        span.finish()
        transaction.finish()
      })
    }
    
    span.finish()
    transaction.finish()
    return result
  } catch (error) {
    span.setStatus('internal_error')
    transaction.setStatus('internal_error')
    span.finish()
    transaction.finish()
    throw error
  }
}

// Express async handler wrapper with Sentry integration
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction()
    const span = transaction?.startChild({
      op: 'request.handler',
      description: `${req.method} ${req.route?.path || req.path}`,
    })

    Promise.resolve(fn(req, res, next))
      .catch((error) => {
        span?.setStatus('internal_error')
        next(error)
      })
      .finally(() => {
        span?.finish()
      })
  }
}

// Capture additional context for errors
export function captureErrorWithContext(
  error: Error,
  context: {
    user?: { id: string; email?: string }
    request?: Request
    extra?: Record<string, any>
    tags?: Record<string, string>
  }
): string {
  const scope = new Sentry.Scope()

  if (context.user) {
    scope.setUser(context.user)
  }

  if (context.request) {
    scope.setContext('request', {
      method: context.request.method,
      url: context.request.url,
      params: context.request.params,
      query: context.request.query,
    })
  }

  if (context.extra) {
    Object.entries(context.extra).forEach(([key, value]) => {
      scope.setExtra(key, value)
    })
  }

  if (context.tags) {
    Object.entries(context.tags).forEach(([key, value]) => {
      scope.setTag(key, value)
    })
  }

  return Sentry.captureException(error, scope)
}