import React from 'react'
import { cn } from '../../utils/cn'

export interface LoadingScreenProps {
  className?: string
  message?: string
}

export const LoadingScreen = ({
  className,
  message = 'Loading...',
}: LoadingScreenProps) => {
  return (
    <div
      className={cn('fixed inset-0 flex flex-col items-center justify-center bg-white', className)}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-secondary-200" />
          <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
        </div>

        {/* Loading message */}
        <p className="text-secondary-600 text-sm font-medium">{message}</p>
      </div>
    </div>
  )
}
