import React, { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import * as Sentry from '@sentry/react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './ui/atoms/Button'
import { Card } from './ui/atoms/Card'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, resetError: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'component' | 'app'
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Report to Sentry
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
        errorBoundary: {
          level: this.props.level || 'component',
          errorId: this.state.errorId,
        },
      },
      tags: {
        component: 'ErrorBoundary',
        level: this.props.level || 'component',
      },
    })

    // Update state with error info
    this.setState({
      errorInfo,
      errorId: eventId || this.state.errorId,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError)
      }

      // Default error UI based on level
      switch (this.props.level) {
        case 'app':
          return <AppErrorFallback error={this.state.error} errorId={this.state.errorId} onReset={this.resetError} />
        case 'page':
          return <PageErrorFallback error={this.state.error} errorId={this.state.errorId} onReset={this.resetError} />
        default:
          return <ComponentErrorFallback error={this.state.error} errorId={this.state.errorId} onReset={this.resetError} />
      }
    }

    return this.props.children
  }
}

// App-level error fallback
const AppErrorFallback = ({ error, errorId, onReset }: { error: Error; errorId: string | null; onReset: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-6">
          We're sorry, but something unexpected happened. Our team has been notified.
        </p>
        {import.meta.env.DEV && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error details (development only)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
              {error.stack || error.message}
            </pre>
          </details>
        )}
        {errorId && (
          <p className="text-xs text-gray-500 mb-6">
            Error ID: {errorId}
          </p>
        )}
        <div className="space-x-4">
          <Button onClick={onReset} variant="primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

// Page-level error fallback
const PageErrorFallback = ({ error, errorId, onReset }: { error: Error; errorId: string | null; onReset: () => void }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="max-w-md w-full p-6 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Page Error</h2>
        <p className="text-gray-600 mb-4">
          This page encountered an error and cannot be displayed.
        </p>
        {import.meta.env.DEV && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error details
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        )}
        {errorId && (
          <p className="text-xs text-gray-500 mb-4">
            Error ID: {errorId}
          </p>
        )}
        <div className="space-x-3">
          <Button onClick={onReset} size="sm" variant="primary">
            Try Again
          </Button>
          <Button onClick={() => window.history.back()} size="sm" variant="outline">
            Go Back
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Component-level error fallback
const ComponentErrorFallback = ({ error, errorId, onReset }: { error: Error; errorId: string | null; onReset: () => void }) => {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">Component Error</h3>
          <p className="mt-1 text-sm text-red-700">
            This component failed to render properly.
          </p>
          {import.meta.env.DEV && (
            <p className="mt-2 text-xs text-red-600 font-mono">
              {error.message}
            </p>
          )}
          {errorId && (
            <p className="mt-1 text-xs text-red-600">
              ID: {errorId}
            </p>
          )}
          <button
            onClick={onReset}
            className="mt-3 text-sm text-red-600 hover:text-red-700 underline focus:outline-none"
          >
            Try reloading this component
          </button>
        </div>
      </div>
    </div>
  )
}

// Sentry-specific error boundary with additional features
export const SentryErrorBoundary = Sentry.ErrorBoundary

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.ComponentType<P> => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`

  return WrappedComponent
}