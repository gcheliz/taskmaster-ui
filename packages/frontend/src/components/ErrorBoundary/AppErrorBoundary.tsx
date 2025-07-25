import React from 'react'
import type { ReactNode } from 'react'
import { BaseErrorBoundary } from './BaseErrorBoundary'
import { ErrorReportingWidget, setupGlobalErrorHandling } from './ErrorReporting'

interface AppErrorBoundaryProps {
  children: ReactNode
}

/**
 * App-level error boundary that wraps the entire application
 * Provides global error handling and reporting capabilities
 */
export const AppErrorBoundary = ({ children }: AppErrorBoundaryProps) => {
  React.useEffect(() => {
    // Setup global error handlers on mount
    setupGlobalErrorHandling()
  }, [])

  const handleAppError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log application-level errors
    console.group('🚨 Application Error')
    console.error('Error:', error)
    console.error('Component Stack:', errorInfo.componentStack)
    console.groupEnd()

    // In production, you would send this to your error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // errorTrackingService.captureException(error, {
      //   tags: { level: 'application' },
      //   extra: errorInfo,
      // });
    }
  }

  return (
    <>
      <BaseErrorBoundary
        level="page"
        context="Application"
        onError={handleAppError}
        resetOnPropsChange={false}
      >
        {children}
      </BaseErrorBoundary>

      {/* Global error reporting widget */}
      <ErrorReportingWidget />
    </>
  )
}
