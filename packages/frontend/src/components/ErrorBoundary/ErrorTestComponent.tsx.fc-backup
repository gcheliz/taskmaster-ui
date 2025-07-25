import React, { useState } from 'react'
import { Button } from '../ui/atoms/Button'
import { Card } from '../ui/atoms/Card'
import { useAsyncError } from './AsyncErrorBoundary'

/**
 * Component for testing error boundaries in development
 * This should be removed or disabled in production
 */
export const ErrorTestComponent: React.FC = () => {
  const [shouldError, setShouldError] = useState(false)
  const throwAsyncError = useAsyncError()

  // Force a render error
  if (shouldError) {
    throw new Error('Test render error - Error boundary should catch this!')
  }

  const handleRenderError = () => {
    setShouldError(true)
  }

  const handleAsyncError = async () => {
    try {
      // Simulate async operation that fails
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Test async error - Error boundary should catch this!'))
        }, 100)
      })
    } catch (error) {
      throwAsyncError(error as Error)
    }
  }

  const handlePromiseRejection = () => {
    // Create an unhandled promise rejection
    Promise.reject(new Error('Test unhandled promise rejection!'))
  }

  const handleNetworkError = async () => {
    try {
      // Simulate network failure
      const response = await fetch('http://nonexistent-domain.invalid/api/test')
      await response.json()
    } catch (error) {
      throwAsyncError(new Error('Network request failed - this simulates an API error'))
    }
  }

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Card className="p-4 border-yellow-200 bg-yellow-50 m-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-yellow-800 mb-2">
          🧪 Error Boundary Testing (Development Only)
        </h3>
        <p className="text-xs text-yellow-700 mb-3">
          Use these buttons to test different types of errors and verify error boundaries are
          working correctly.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleRenderError}
          size="sm"
          variant="outline"
          className="text-xs border-yellow-300 hover:bg-yellow-100"
        >
          Test Render Error
        </Button>

        <Button
          onClick={handleAsyncError}
          size="sm"
          variant="outline"
          className="text-xs border-yellow-300 hover:bg-yellow-100"
        >
          Test Async Error
        </Button>

        <Button
          onClick={handlePromiseRejection}
          size="sm"
          variant="outline"
          className="text-xs border-yellow-300 hover:bg-yellow-100"
        >
          Test Promise Rejection
        </Button>

        <Button
          onClick={handleNetworkError}
          size="sm"
          variant="outline"
          className="text-xs border-yellow-300 hover:bg-yellow-100"
        >
          Test Network Error
        </Button>
      </div>
    </Card>
  )
}
