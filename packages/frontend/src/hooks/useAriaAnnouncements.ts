import { useState, useCallback } from 'react'

/**
 * Hook for managing ARIA live region announcements
 * Provides methods to announce different types of messages to screen readers
 */
export const useAriaAnnouncements = () => {
  const [announcement, setAnnouncement] = useState<string>('')
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite')

  /**
   * Announce a message to screen readers
   * @param message - The message to announce
   * @param isUrgent - Whether the announcement should interrupt current speech
   */
  const announce = useCallback((message: string, isUrgent = false) => {
    setPoliteness(isUrgent ? 'assertive' : 'polite')
    setAnnouncement(message)
    
    // Clear the announcement after a delay to allow re-announcement of the same message
    setTimeout(() => setAnnouncement(''), 100)
  }, [])

  /**
   * Announce task movement
   */
  const announceTaskMove = useCallback((taskTitle: string, fromColumn: string, toColumn: string) => {
    announce(`Task "${taskTitle}" moved from ${fromColumn} to ${toColumn}`)
  }, [announce])

  /**
   * Announce task creation
   */
  const announceTaskCreated = useCallback((taskTitle: string) => {
    announce(`New task "${taskTitle}" created`)
  }, [announce])

  /**
   * Announce task deletion
   */
  const announceTaskDeleted = useCallback((taskTitle: string) => {
    announce(`Task "${taskTitle}" deleted`)
  }, [announce])

  /**
   * Announce task update
   */
  const announceTaskUpdated = useCallback((taskTitle: string, field: string) => {
    announce(`Task "${taskTitle}" ${field} updated`)
  }, [announce])

  /**
   * Announce filter changes
   */
  const announceFilterChange = useCallback((filterType: string, value: string) => {
    announce(`Filter changed: ${filterType} set to ${value}`)
  }, [announce])

  /**
   * Announce search results
   */
  const announceSearchResults = useCallback((count: number, query: string) => {
    if (count === 0) {
      announce(`No tasks found for "${query}"`)
    } else if (count === 1) {
      announce(`1 task found for "${query}"`)
    } else {
      announce(`${count} tasks found for "${query}"`)
    }
  }, [announce])

  /**
   * Announce loading state
   */
  const announceLoading = useCallback((isLoading: boolean, context?: string) => {
    if (isLoading) {
      announce(`Loading ${context || 'content'}...`, true)
    } else {
      announce(`${context || 'Content'} loaded`)
    }
  }, [announce])

  /**
   * Announce error
   */
  const announceError = useCallback((error: string) => {
    announce(`Error: ${error}`, true)
  }, [announce])

  /**
   * Announce success
   */
  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`)
  }, [announce])

  return {
    announcement,
    politeness,
    announce,
    announceTaskMove,
    announceTaskCreated,
    announceTaskDeleted,
    announceTaskUpdated,
    announceFilterChange,
    announceSearchResults,
    announceLoading,
    announceError,
    announceSuccess,
  }
}

export default useAriaAnnouncements