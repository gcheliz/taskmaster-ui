// Main exports
export { BaseErrorBoundary } from './BaseErrorBoundary'
export { AsyncErrorBoundary, useAsyncError, withAsyncErrorBoundary } from './AsyncErrorBoundary'
export {
  APIErrorBoundary,
  DatabaseErrorBoundary,
  TerminalErrorBoundary,
  RepositoryErrorBoundary,
  RouteErrorBoundary,
  WebSocketErrorBoundary,
} from './SpecializedBoundaries'
export {
  ErrorReportingModal,
  ErrorReportingWidget,
  setupGlobalErrorHandling,
} from './ErrorReporting'
export { AppErrorBoundary } from './AppErrorBoundary'
export { ErrorTestComponent } from './ErrorTestComponent'

// Re-export types for convenience
export type { ComponentType } from 'react'
