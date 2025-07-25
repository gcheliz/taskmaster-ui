import React from 'react'
import { AriaLiveRegion, useAriaLive } from './AriaLiveRegion'

export interface LoadingAnnouncementProps {
  /**
   * Whether loading is in progress
   */
  isLoading: boolean
  /**
   * The action being performed
   */
  action?: string
  /**
   * Success message to announce when loading completes
   */
  successMessage?: string
  /**
   * Error message to announce if loading fails
   */
  errorMessage?: string
}

/**
 * LoadingAnnouncement Component
 * 
 * Announces loading states to screen readers using ARIA live regions.
 * Helps users understand when asynchronous actions are happening.
 */
export const LoadingAnnouncement = ({
  isLoading,
  action = 'Loading',
  successMessage,
  errorMessage,
}: LoadingAnnouncementProps) => {
  const { message, announce } = useAriaLive()

  React.useEffect(() => {
    if (isLoading) {
      announce(`${action} in progress`)
    }
  }, [isLoading, action, announce])

  React.useEffect(() => {
    if (!isLoading && successMessage) {
      announce(successMessage)
    }
  }, [isLoading, successMessage, announce])

  React.useEffect(() => {
    if (!isLoading && errorMessage) {
      announce(errorMessage)
    }
  }, [isLoading, errorMessage, announce])

  return <AriaLiveRegion message={message} politeness="polite" />
}

/**
 * Hook for managing loading announcements
 */
export const useLoadingAnnouncement = () => {
  const { message, announce } = useAriaLive()

  const announceLoading = (action: string) => {
    announce(`${action} in progress`)
  }

  const announceSuccess = (message: string) => {
    announce(message)
  }

  const announceError = (error: string) => {
    announce(`Error: ${error}`)
  }

  return {
    message,
    announceLoading,
    announceSuccess,
    announceError,
  }
}

export default LoadingAnnouncement