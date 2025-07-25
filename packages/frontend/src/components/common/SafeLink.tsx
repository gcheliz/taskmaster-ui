import React from 'react'
import { useNavigate } from 'react-router-dom'

interface SafeLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
  children: React.ReactNode
}

/**
 * A safe link component that prevents full page reloads
 * This is a workaround for React Router Link issues
 */
export const SafeLink = React.forwardRef<HTMLAnchorElement, SafeLinkProps>(
  ({ to, onClick, children, ...props }, ref) => {
    const navigate = useNavigate()

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      e.stopPropagation()
      
      // Call any custom onClick handler
      if (onClick) {
        onClick(e)
      }
      
      // Use navigate instead of Link
      navigate(to)
    }

    return (
      <a
        ref={ref}
        href={to}
        onClick={handleClick}
        {...props}
      >
        {children}
      </a>
    )
  }
)

SafeLink.displayName = 'SafeLink'