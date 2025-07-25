import { useEffect, useRef } from 'react'
import { useLocation } from "react-router"

/**
 * Workaround for first navigation reload bug
 * This appears to be a Vite/React Router development issue
 */
export const useFixFirstNavigation = () => {
  const location = useLocation()
  const isFirstNavigation = useRef(true)
  const hasNavigated = useRef(false)

  useEffect(() => {
    // Mark that we've navigated
    if (location.pathname !== '/' || hasNavigated.current) {
      hasNavigated.current = true
    }

    // After first navigation, mark it as complete
    if (hasNavigated.current && isFirstNavigation.current) {
      isFirstNavigation.current = false
      
      // Prevent any reload that happens within 100ms of first navigation
      const preventReload = (e: BeforeUnloadEvent) => {
        console.log('[FixFirstNavigation] Preventing first navigation reload')
        e.preventDefault()
        e.returnValue = ''
        return false
      }

      window.addEventListener('beforeunload', preventReload)
      
      // Remove after a short delay
      setTimeout(() => {
        window.removeEventListener('beforeunload', preventReload)
        console.log('[FixFirstNavigation] First navigation protection removed')
      }, 100)
    }
  }, [location])
}