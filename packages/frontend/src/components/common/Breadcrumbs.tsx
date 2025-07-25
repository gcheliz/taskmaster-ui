import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
  separator?: React.ReactNode
  showHome?: boolean
}

// Generate breadcrumbs from path
const generateBreadcrumbsFromPath = (pathname: string): BreadcrumbItem[] => {
  const paths = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  paths.forEach((path, index) => {
    const href = `/${paths.slice(0, index + 1).join('/')}`
    const label = path
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    breadcrumbs.push({
      label,
      href: index < paths.length - 1 ? href : undefined,
    })
  })

  return breadcrumbs
}

export const Breadcrumbs = ({
  items,
  className,
  separator = <ChevronRight className="h-4 w-4" />,
  showHome = true,
}: BreadcrumbsProps) => {
  const location = useLocation()

  // Use provided items or generate from path
  const breadcrumbItems = items || generateBreadcrumbsFromPath(location.pathname)

  // Don't show breadcrumbs on home page
  if (location.pathname === '/' && !items) {
    return null
  }

  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)} aria-label="Breadcrumb">
      {showHome && (
        <>
          <Link
            to="/"
            className="text-secondary-500 hover:text-secondary-700 transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbItems.length > 0 && <span className="text-secondary-400">{separator}</span>}
        </>
      )}

      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-secondary-400">{separator}</span>}
          {item.href ? (
            <Link
              to={item.href}
              className="text-secondary-500 hover:text-secondary-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-secondary-900 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
