import { useEffect, useRef } from 'react'
import { useLocation } from "react-router-dom"

export const useNavigationDebug = () => {
  const location = useLocation()
  const previousLocation = useRef(location.pathname)
  const navigationTimeRef = useRef<number>(0)

  useEffect(() => {
    // Track when navigation happens
    if (location.pathname !== previousLocation.current) {
      navigationTimeRef.current = Date.now()
      console.log(`[NavigationDebug] Client-side navigation completed to: ${location.pathname}`)
      previousLocation.current = location.pathname

      // Monitor for any reload attempts after navigation
      const checkInterval = setInterval(() => {
        const timeSinceNav = Date.now() - navigationTimeRef.current
        if (timeSinceNav > 2000) {
          clearInterval(checkInterval)
          return
        }
        
        // Check if page is about to reload
        if (document.readyState === 'loading') {
          console.error('[NavigationDebug] UNEXPECTED RELOAD DETECTED after navigation!')
        }
      }, 10)

      // Monitor for reload attempts (can't override window.location.reload as it's read-only)
      // Instead, we'll just log if a reload is happening

      // Monitor for any location.href changes
      let href = window.location.href
      const hrefChecker = setInterval(() => {
        if (window.location.href !== href) {
          console.error('[NavigationDebug] window.location.href changed!', {
            from: href,
            to: window.location.href,
            stack: new Error().stack
          })
          href = window.location.href
        }
      }, 10)

      // Clean up after 2 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        clearInterval(hrefChecker)
      }, 2000)
    }
  }, [location])

  // Listen for unload events
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const timeSinceNav = Date.now() - navigationTimeRef.current
      if (timeSinceNav < 1000) {
        console.error('[NavigationDebug] Page unloading within 1s of navigation!', {
          timeSinceNav,
          currentPath: location.pathname
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [location])
}