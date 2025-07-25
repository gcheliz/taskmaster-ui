/**
 * Toast Component for Notifications
 * Provides feedback for user actions and system events
 */

import React, { useEffect, useState, useRef } from 'react'
import { Icon, CheckIcon, XMarkIcon } from '../atoms/Icon'
import { cn } from '../../../utils/cn'

interface ToastProps {
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  duration?: number
  onClose?: () => void
  className?: string
}

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  duration = 5000,
  onClose,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const exitTimerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  useEffect(() => {
    // Cleanup exit timer on unmount
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current)
      }
    }
  }, [])

  const handleClose = () => {
    setIsExiting(true)
    exitTimerRef.current = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300) // Match animation duration
  }

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-accent-success border-accent-success/20 text-white'
      case 'error':
        return 'bg-accent-error border-accent-error/20 text-white'
      case 'warning':
        return 'bg-accent-warning border-accent-warning/20 text-white'
      default:
        return 'bg-accent-primary border-accent-primary/20 text-white'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Icon icon={CheckIcon} size="sm" color="white" />
      case 'error':
        return <Icon icon={XMarkIcon} size="sm" color="white" />
      case 'warning':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center space-x-3 px-4 py-3 rounded-lg border shadow-lg transition-[transform,opacity] duration-300 ease-in-out transform',
        getToastStyles(),
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0">{getIcon()}</div>

      <div className="flex-1 text-sm font-medium">{message}</div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        <Icon icon={XMarkIcon} size="sm" />
      </button>
    </div>
  )
}

export default Toast
