import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom'
import { useEffect } from 'react'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN
const ENVIRONMENT = import.meta.env.VITE_APP_ENV || 'development'
const RELEASE = import.meta.env.VITE_APP_VERSION || 'unknown'

export function initSentry() {
  if (!SENTRY_DSN) {
    console.log('Sentry DSN not configured, skipping initialization')
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    release: RELEASE,
    integrations: [
      new BrowserTracing({
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/api\.taskmaster\.app\//,
          /^\//,
        ],
        // Routing instrumentation
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
      new Sentry.Replay({
        // Mask all text content, but keep media playback
        maskAllText: true,
        blockAllMedia: false,
        // Capture 10% of all sessions
        sessionSampleRate: 0.1,
        // Capture 100% of sessions with an error
        errorSampleRate: 1.0,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Release Health
    autoSessionTracking: true,
    // Environment
    beforeSend(event, hint) {
      // Filter out certain errors in production
      if (ENVIRONMENT === 'production') {
        // Ignore browser extension errors
        if (event.exception?.values?.[0]?.value?.includes('extension://')) {
          return null
        }
        // Ignore network errors that are expected
        if (event.exception?.values?.[0]?.type === 'NetworkError') {
          return null
        }
      }
      
      // Add user context if available
      const user = getUserContext()
      if (user) {
        event.user = {
          id: user.id,
          email: user.email,
          username: user.username,
        }
      }
      
      return event
    },
    // Breadcrumbs
    beforeBreadcrumb(breadcrumb, hint) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null
      }
      return breadcrumb
    },
  })
}

// Error boundary specific configuration
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  })
}

// Performance monitoring helpers
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({ name, op })
}

export function measurePerformance<T>(
  name: string,
  operation: () => T | Promise<T>
): T | Promise<T> {
  const transaction = startTransaction(name, 'custom')
  
  try {
    const result = operation()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        transaction.finish()
      })
    }
    
    transaction.finish()
    return result
  } catch (error) {
    transaction.setStatus('internal_error')
    transaction.finish()
    throw error
  }
}

// User context helper (implement based on your auth system)
function getUserContext() {
  // This should be implemented based on your auth system
  // For example, reading from localStorage, Redux store, or Context
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }
  return null
}

// Custom error types for better tracking
export class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'ApplicationError'
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, context)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'AUTHENTICATION_ERROR', 401, context)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', 403, context)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'NOT_FOUND', 404, context)
    this.name = 'NotFoundError'
  }
}