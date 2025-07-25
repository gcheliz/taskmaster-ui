import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from "react-router-dom"

interface PageHeaderProps {
  title: string
  actions?: React.ReactNode
}

export const PageHeader = ({ title, actions }: PageHeaderProps) => {
  const location = useLocation()
  
  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean)
    const breadcrumbs: { label: string; path: string }[] = [
      { label: 'Home', path: '/' }
    ]
    
    let currentPath = ''
    paths.forEach(path => {
      currentPath += `/${path}`
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
      breadcrumbs.push({ label, path: currentPath })
    })
    
    return breadcrumbs
  }
  
  const breadcrumbs = generateBreadcrumbs()
  const isHome = location.pathname === '/'

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 md:px-8 py-3">
      <div className="flex items-center justify-between">
        {/* Left side with breadcrumb and title */}
        <div className="flex items-center space-x-4">
          {/* Breadcrumb for non-home pages */}
          {!isHome && (
            <nav className="flex items-center space-x-1 text-sm">
              {breadcrumbs.slice(0, -1).map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && (
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  )}
                  <Link 
                    to={crumb.path} 
                    className="text-gray-500 hover:text-gray-700 transition-colors flex items-center"
                  >
                    {index === 0 && <Home className="w-3 h-3 mr-1" />}
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </nav>
          )}
          
          {/* Title */}
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}