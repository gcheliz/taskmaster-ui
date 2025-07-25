import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Hook to prevent full page reloads on navigation
 * This is a workaround for a React Router issue where
 * the first navigation causes a full page reload
 */
export const usePreventReload = () => {
  const location = useLocation()

  useEffect(() => {
    let isFirstNavigation = true

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only prevent reload if we just navigated
      if (!isFirstNavigation && performance.navigation.type !== 1) {
        // Allow the unload
        return
      }
      
      // Check if this is happening right after a route change
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      const lastNav = navEntries[navEntries.length - 1]
      
      if (lastNav && Date.now() - lastNav.startTime < 1000) {
        // This is likely the reload bug - prevent it
        e.preventDefault()
        e.returnValue = ''
        console.warn('[PreventReload] Blocked unwanted page reload after navigation')
        return false
      }
    }

    // Add the handler
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Mark that we're past the first navigation
    const timer = setTimeout(() => {
      isFirstNavigation = false
    }, 1000)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearTimeout(timer)
    }
  }, [location])
}