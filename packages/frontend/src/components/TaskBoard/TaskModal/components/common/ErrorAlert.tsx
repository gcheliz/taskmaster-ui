import React from 'react'

interface ErrorAlertProps {
  error: string
  onDismiss: () => void
}

export const ErrorAlert = ({ error, onDismiss }: ErrorAlertProps) => {
  return (
    <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
      <span className="text-red-500" aria-hidden="true">
        ⚠️
      </span>
      <span className="flex-1 text-sm text-red-700">{error}</span>
      <button
        className="text-red-400 hover:text-red-600 transition-colors"
        onClick={onDismiss}
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  )
}