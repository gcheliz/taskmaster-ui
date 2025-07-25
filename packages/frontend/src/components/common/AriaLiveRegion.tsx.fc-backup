import React, { useEffect, useState } from 'react'
import { cn } from '../../utils/cn'

export interface AriaLiveRegionProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The message to announce to screen readers
   */
  message?: string
  /**
   * The politeness level of the announcement
   * @default 'polite'
   */
  politeness?: 'polite' | 'assertive' | 'off'
  /**
   * Whether to clear the message after announcement
   * @default true
   */
  clearOnAnnounce?: boolean
  /**
   * Delay in milliseconds before clearing the message
   * @default 1000
   */
  clearDelay?: number
}

/**
 * AriaLiveRegion Component
 * 
 * Provides a live region for screen reader announcements.
 * Used for dynamic content updates that need to be announced.
 */
export const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({
  message,
  politeness = 'polite',
  clearOnAnnounce = true,
  clearDelay = 1000,
  className,
  ...props
}) => {
  const [announcement, setAnnouncement] = useState<string>('')

  useEffect(() => {
    if (message) {
      setAnnouncement(message)

      if (clearOnAnnounce) {
        const timer = setTimeout(() => {
          setAnnouncement('')
        }, clearDelay)

        return () => clearTimeout(timer)
      }
    }
  }, [message, clearOnAnnounce, clearDelay])

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className={cn('sr-only', className)}
      {...props}
    >
      {announcement}
    </div>
  )
}

/**
 * Hook for managing aria live announcements
 */
export const useAriaLive = () => {
  const [message, setMessage] = useState<string>('')

  const announce = (text: string) => {
    setMessage(text)
  }

  return { message, announce }
}

export default AriaLiveRegion