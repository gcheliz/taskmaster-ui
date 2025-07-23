import React, { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { BaseErrorBoundary } from './BaseErrorBoundary'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKeys?: Array<string | number>
  context?: string
}

interface State {
  asyncError: Error | null
}

/**
 * AsyncErrorBoundary handles both synchronous and asynchronous errors
 * by providing a way to catch promise rejections and async/await errors
 */
export class AsyncErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { asyncError: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { asyncError: error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  componentDidMount() {
    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection)
  }

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    // Only handle rejections that occur within our component tree
    // This is a basic approach - you might want more sophisticated detection
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))

    // Set the async error which will trigger a re-render
    this.setState({ asyncError: error })

    // Prevent the error from being logged to console
    event.preventDefault()
  }

  resetAsyncError = () => {
    this.setState({ asyncError: null })
  }

  render() {
    const { asyncError } = this.state

    if (asyncError) {
      // If we have an async error, create a synthetic error to pass to BaseErrorBoundary
      throw asyncError
    }

    return (
      <BaseErrorBoundary
        {...this.props}
        resetKeys={[
          ...(this.props.resetKeys || []),
          ...(asyncError ? [Date.now().toString()] : []),
        ]}
      >
        {this.props.children}
      </BaseErrorBoundary>
    )
  }
}

/**
 * Hook to capture async errors in functional components
 */
export const useAsyncError = () => {
  const [, setError] = React.useState()

  return React.useCallback(
    (error: Error) => {
      setError(() => {
        throw error
      })
    },
    [setError]
  )
}

/**
 * Higher-order component to wrap components with async error handling
 */
export function withAsyncErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <AsyncErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </AsyncErrorBoundary>
  )

  WrappedComponent.displayName = `withAsyncErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
