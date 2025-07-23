import React from 'react'

export interface SkipLinkProps {
  /** The ID of the element to skip to */
  href: string
  /** The text to display in the skip link */
  children: React.ReactNode
}

/**
 * Skip Link Component
 * 
 * Provides keyboard users with a way to skip repetitive navigation
 * and jump directly to main content. Only visible when focused.
 */
export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      // Set focus to the target element
      (target as HTMLElement).focus()
      // Scroll it into view
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 
                 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md 
                 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      {children}
    </a>
  )
}

/**
 * Skip Links Container
 * 
 * Container for multiple skip links
 */
export const SkipLinksContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="skip-links-container" role="navigation" aria-label="Skip links">
      {children}
    </div>
  )
}