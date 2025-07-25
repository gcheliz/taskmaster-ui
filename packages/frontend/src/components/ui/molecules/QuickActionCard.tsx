import React from 'react'
import { Card, CardContent } from '../atoms/Card'
import { Badge } from '../atoms/Badge'
import { Icon } from '../atoms/Icon'
// Using the icon type from the Icon component props
type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>

export interface QuickActionCardProps {
  id: string
  title: string
  description?: string
  icon: IconType
  iconColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted'
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline'
  badge?: {
    text: string
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  }
  disabled?: boolean
  loading?: boolean
  shortcut?: string
  onClick?: () => void
  className?: string
}

const QuickActionCard = ({
  id: _id,
  title,
  description,
  icon,
  iconColor = 'primary',
  variant = 'outline',
  badge,
  disabled = false,
  loading = false,
  shortcut,
  onClick,
  className = '',
}: QuickActionCardProps) => {
  const getCardVariant = () => {
    if (variant === 'primary') return 'elevated'
    return 'outline'
  }

  const getHoverClasses = () => {
    if (disabled || loading) return ''
    return 'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
  }

  const getIconColorForVariant = () => {
    if (variant === 'primary') return 'primary'
    return iconColor
  }

  const getBorderColor = () => {
    switch (variant) {
      case 'primary':
        return 'border-primary-200 dark:border-primary-800'
      case 'secondary':
        return 'border-secondary-200 dark:border-secondary-800'
      case 'success':
        return 'border-success-200 dark:border-success-800'
      case 'warning':
        return 'border-warning-200 dark:border-warning-800'
      case 'error':
        return 'border-error-200 dark:border-error-800'
      default:
        return 'border-surface-200 dark:border-surface-700'
    }
  }

  const getBackgroundColor = () => {
    if (variant === 'primary') {
      return 'bg-primary-50 dark:bg-primary-950'
    }
    return 'bg-surface-50 dark:bg-surface-900'
  }

  const handleClick = () => {
    if (disabled || loading) return
    onClick?.()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled || loading) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
    }
  }

  return (
    <Card
      variant={getCardVariant()}
      className={`
        relative transition-all duration-200 ease-in-out
        ${getHoverClasses()}
        ${getBorderColor()}
        ${getBackgroundColor()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${loading ? 'opacity-75' : ''}
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled || loading ? -1 : 0}
      role="button"
      aria-label={`${title}${description ? `: ${description}` : ''}`}
      aria-disabled={disabled || loading}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
            <Icon
              icon={icon}
              size="lg"
              color={getIconColorForVariant()}
              className={loading ? 'animate-pulse' : ''}
            />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-secondary-600 dark:text-secondary-400 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Badge */}
          {badge && (
            <Badge
              variant={badge.variant || 'secondary'}
              size="sm"
              className="animate-in fade-in-50 duration-300"
            >
              {badge.text}
            </Badge>
          )}

          {/* Shortcut */}
          {shortcut && !disabled && !loading && (
            <div className="absolute top-2 right-2">
              <span className="text-xs text-secondary-500 dark:text-secondary-500 font-mono bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded border border-surface-200 dark:border-surface-700">
                {shortcut}
              </span>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-50/50 dark:bg-surface-900/50 rounded-lg">
              <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { QuickActionCard }
