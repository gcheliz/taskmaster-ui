import React, { useEffect, useState } from 'react'
import { useSearchParams } from "react-router"
import { Spinner } from '../ui/atoms/Spinner'

export interface OAuthCallbackProps {
  /**
   * Callback when OAuth is successful
   */
  onSuccess?: (data: { user: any; token: string }) => void
  /**
   * Callback when OAuth fails
   */
  onError?: (error: string) => void
}

export const OAuthCallback = ({ onSuccess, onError }: OAuthCallbackProps) => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Processing OAuth callback...')

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Check for error parameter
        const error = searchParams.get('error')
        if (error) {
          const errorMessage = getErrorMessage(error)
          setStatus('error')
          setMessage(errorMessage)
          onError?.(errorMessage)
          return
        }

        // Check for token and user data
        const token = searchParams.get('token')
        const userJson = searchParams.get('user')

        if (!token || !userJson) {
          const errorMessage = 'Missing token or user data in OAuth callback'
          setStatus('error')
          setMessage(errorMessage)
          onError?.(errorMessage)
          return
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userJson))

        // Store token in localStorage
        localStorage.setItem('authToken', token)
        localStorage.setItem('user', JSON.stringify(user))

        setStatus('success')
        setMessage('OAuth login successful! Redirecting...')

        // Call success callback
        onSuccess?.({ user, token })

        // Redirect after a brief delay
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      } catch (error) {
        console.error('OAuth callback error:', error)
        const errorMessage = 'Failed to process OAuth callback'
        setStatus('error')
        setMessage(errorMessage)
        onError?.(errorMessage)
      }
    }

    processCallback()
  }, [searchParams, onSuccess, onError])

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'oauth_failed':
        return 'OAuth authentication failed. Please try again.'
      case 'oauth_callback_failed':
        return 'OAuth callback processing failed. Please try again.'
      case 'access_denied':
        return 'Access denied. Please grant permissions to continue.'
      default:
        return `Authentication error: ${error}`
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Spinner size="lg" className="text-blue-600" />
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6 flex justify-center">{getStatusIcon()}</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {status === 'processing' && 'Processing...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h1>

        <p className={`text-lg ${getStatusColor()} mb-6`}>{message}</p>

        {status === 'error' && (
          <div className="space-y-4">
            <button
              onClick={() => (window.location.href = '/auth')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>

            <button
              onClick={() => (window.location.href = '/')}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Go Home
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="text-sm text-gray-500">You will be redirected automatically...</div>
        )}
      </div>
    </div>
  )
}

export default OAuthCallback
