import { useEffect } from 'react'
import { useNavigate } from "react-router-dom"

/**
 * This component ensures React Router is properly initialized
 * and prevents full page reloads on first navigation
 */
export const NavigationWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()

  useEffect(() => {
    // Override default link behavior for all anchor tags
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href && !link.target && !link.download) {
        const url = new URL(link.href)
        
        // Check if it's an internal link
        if (url.origin === window.location.origin) {
          e.preventDefault()
          e.stopPropagation()
          navigate(url.pathname + url.search + url.hash)
        }
      }
    }

    // Add listener in capture phase to intercept before any other handlers
    document.addEventListener('click', handleClick, true)
    
    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [navigate])

  return children
}