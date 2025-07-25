import { useEffect } from 'react'
import { useLocation, useNavigate } from "react-router"

export const NavigationDebug = () => {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('[NavigationDebug] Route changed to:', location.pathname)
    console.log('[NavigationDebug] Navigation type:', window.performance.getEntriesByType('navigation')[0])
    
    // Log if this was a full page reload
    const navEntry = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navEntry) {
      console.log('[NavigationDebug] Navigation type:', navEntry.type) // 'navigate', 'reload', 'back_forward', or 'prerender'
    }
  }, [location])

  // Add a global click listener to catch any navigation attempts
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      if (link) {
        console.log('[NavigationDebug] Link clicked:', {
          href: link.href,
          pathname: link.pathname,
          hasOnClick: !!link.onclick,
          defaultPrevented: e.defaultPrevented,
          isReactRouterLink: link.hasAttribute('data-discover-internal-link'),
          linkTagName: link.tagName,
          linkAttributes: Array.from(link.attributes).map(attr => `${attr.name}="${attr.value}"`),
        })
        
        // Check if this is being handled by React Router
        setTimeout(() => {
          console.log('[NavigationDebug] After click - defaultPrevented:', e.defaultPrevented)
        }, 0)
      }
    }

    // Capture phase to catch event before React Router
    document.addEventListener('click', handleClick, true)
    
    // Also add one in bubble phase to see final state
    const handleClickBubble = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      if (link) {
        console.log('[NavigationDebug] Link click (bubble phase) - defaultPrevented:', e.defaultPrevented)
      }
    }
    document.addEventListener('click', handleClickBubble, false)
    
    return () => {
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('click', handleClickBubble, false)
    }
  }, [])

  return null
}