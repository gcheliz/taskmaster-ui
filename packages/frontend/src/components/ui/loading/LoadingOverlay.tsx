import React from 'react'
import { Spinner } from './Spinner'

interface LoadingOverlayProps {
  visible: boolean
  message?: string
  fullScreen?: boolean
  blur?: boolean
  className?: string
}

export const LoadingOverlay = ({
  visible,
  message,
  fullScreen = false,
  blur = true,
  className = '',
}) => {
  if (!visible) return null

  const overlayClasses = fullScreen
    ? 'fixed inset-0 z-50'
    : 'absolute inset-0 z-10'

  return (
    <div
      className={`${overlayClasses} flex items-center justify-center ${blur ? 'backdrop-blur-sm' : ''} bg-white/60 ${className}`}
    >
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" />
        {message && (
          <p className="text-sm font-medium text-gray-700">{message}</p>
        )}
      </div>
    </div>
  )
}