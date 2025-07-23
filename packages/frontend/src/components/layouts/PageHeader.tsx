import React from 'react'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  backButtonLabel?: string
  actions?: React.ReactNode
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  backButtonLabel = 'Back',
  actions,
  breadcrumbs,
  className,
}) => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className={cn('mb-8', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-secondary-400">/</span>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-secondary-600 hover:text-secondary-900 transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-secondary-900 font-medium">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          {/* Back button */}
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mr-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {backButtonLabel}
            </Button>
          )}

          {/* Title and subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm sm:text-base text-secondary-600">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}