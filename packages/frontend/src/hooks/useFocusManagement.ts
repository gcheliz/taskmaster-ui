import { useEffect, useRef, useCallback } from 'react'
import { useLocation } from "react-router"

/**
 * Hook to manage focus on route changes
 * Ensures focus is moved to main content when navigating
 */
export const useRouteFocusManagement = () => {
  const location = useLocation()
  const previousLocation = useRef(location.pathname)

  useEffect(() => {
    if (location.pathname !== previousLocation.current) {
      previousLocation.current = location.pathname
      
      // Find the main content area
      const mainContent = document.querySelector('main') || document.querySelector('[role="main"]')
      
      if (mainContent) {
        // Set tabindex to make it focusable
        mainContent.setAttribute('tabindex', '-1')
        
        // Focus the main content
        ;(mainContent as HTMLElement).focus()
        
        // Remove tabindex after focusing
        setTimeout(() => {
          mainContent.removeAttribute('tabindex')
        }, 100)
      }
      
      // Announce page change to screen readers
      const pageTitle = document.title
      const announcement = `Navigated to ${pageTitle}`
      const liveRegion = document.querySelector('[aria-live="polite"]')
      
      if (liveRegion) {
        liveRegion.textContent = announcement
        setTimeout(() => {
          liveRegion.textContent = ''
        }, 1000)
      }
    }
  }, [location])
}

/**
 * Hook to restore focus after an action
 * Useful for modals, dialogs, and temporary UI elements
 */
export const useFocusRestore = () => {
  const previousFocus = useRef<HTMLElement | null>(null)

  const saveFocus = useCallback(() => {
    previousFocus.current = document.activeElement as HTMLElement
  }, [])

  const restoreFocus = useCallback(() => {
    if (previousFocus.current && previousFocus.current.focus) {
      previousFocus.current.focus()
    }
  }, [])

  return { saveFocus, restoreFocus }
}

/**
 * Hook to manage focus within a container
 * Useful for complex forms and interactive regions
 */
export const useFocusWithin = (containerRef: React.RefObject<HTMLElement>) => {
  const focusFirst = useCallback(() => {
    if (!containerRef.current) return

    const focusableElements = containerRef.current.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus()
    }
  }, [containerRef])

  const focusLast = useCallback(() => {
    if (!containerRef.current) return

    const focusableElements = containerRef.current.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length > 0) {
      (focusableElements[focusableElements.length - 1] as HTMLElement).focus()
    }
  }, [containerRef])

  return { focusFirst, focusLast }
}

/**
 * Hook to focus on errors in forms
 */
export const useErrorFocus = () => {
  const focusFirstError = useCallback(() => {
    // Find first element with aria-invalid="true"
    const firstError = document.querySelector('[aria-invalid="true"]')
    
    if (firstError) {
      (firstError as HTMLElement).focus()
      
      // Also scroll it into view
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  return { focusFirstError }
}

/**
 * Hook to manage focus zones
 * Implements roving tabindex within a zone
 */
export const useFocusZone = (
  containerRef: React.RefObject<HTMLElement>,
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both'
    loop?: boolean
  } = {}
) => {
  const { orientation = 'both', loop = true } = options

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const focusableElements = Array.from(
        container.querySelectorAll('[tabindex="0"], [tabindex="-1"]')
      ) as HTMLElement[]

      const currentIndex = focusableElements.findIndex(el => el === document.activeElement)
      if (currentIndex === -1) return

      let nextIndex = currentIndex
      const lastIndex = focusableElements.length - 1

      switch (e.key) {
        case 'ArrowUp':
          if (orientation === 'horizontal') return
          e.preventDefault()
          nextIndex = currentIndex - 1
          if (nextIndex < 0) nextIndex = loop ? lastIndex : 0
          break

        case 'ArrowDown':
          if (orientation === 'horizontal') return
          e.preventDefault()
          nextIndex = currentIndex + 1
          if (nextIndex > lastIndex) nextIndex = loop ? 0 : lastIndex
          break

        case 'ArrowLeft':
          if (orientation === 'vertical') return
          e.preventDefault()
          nextIndex = currentIndex - 1
          if (nextIndex < 0) nextIndex = loop ? lastIndex : 0
          break

        case 'ArrowRight':
          if (orientation === 'vertical') return
          e.preventDefault()
          nextIndex = currentIndex + 1
          if (nextIndex > lastIndex) nextIndex = loop ? 0 : lastIndex
          break

        case 'Home':
          e.preventDefault()
          nextIndex = 0
          break

        case 'End':
          e.preventDefault()
          nextIndex = lastIndex
          break

        default:
          return
      }

      // Update tabindex
      focusableElements.forEach((el, index) => {
        el.setAttribute('tabindex', index === nextIndex ? '0' : '-1')
      })

      // Focus the next element
      focusableElements[nextIndex].focus()
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [containerRef, orientation, loop])
}