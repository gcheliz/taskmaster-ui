import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../utils/cn'
import { Icon, CheckIcon, XMarkIcon } from '../atoms/Icon'
import { Button } from '../atoms/Button'

const alertVariants = cva('relative w-full rounded-lg border p-4', {
  variants: {
    variant: {
      default: 'bg-white border-secondary-200 text-secondary-950',
      success: 'bg-success-50 border-success-200 text-success-950',
      warning: 'bg-warning-50 border-warning-200 text-warning-950',
      error: 'bg-error-50 border-error-200 text-error-950',
      info: 'bg-primary-50 border-primary-200 text-primary-950',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const alertIconVariants = cva('h-4 w-4', {
  variants: {
    variant: {
      default: 'text-secondary-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      error: 'text-error-600',
      info: 'text-primary-600',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
  icon?: React.ReactNode
  actions?: React.ReactNode
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    { className, variant, title, dismissible, onDismiss, icon, actions, children, ...props },
    ref
  ) => {
    const defaultIcons = {
      success: <Icon icon={CheckIcon} className={alertIconVariants({ variant })} />,
      error: <Icon icon={XMarkIcon} className={alertIconVariants({ variant })} />,
      warning: <Icon icon={XMarkIcon} className={alertIconVariants({ variant })} />,
      info: <Icon icon={CheckIcon} className={alertIconVariants({ variant })} />,
      default: null,
    }

    const displayIcon = icon !== undefined ? icon : defaultIcons[variant || 'default']

    return (
      <div ref={ref} role="alert" className={cn(alertVariants({ variant, className }))} {...props}>
        <div className="flex">
          {displayIcon && <div className="flex-shrink-0">{displayIcon}</div>}
          <div className={cn('flex-1', displayIcon && 'ml-3')}>
            {title && <h4 className="mb-1 font-medium leading-none tracking-tight">{title}</h4>}
            <div className={cn('text-sm', !title && 'font-medium')}>{children}</div>
            {actions && <div className="mt-3">{actions}</div>}
          </div>
          {dismissible && (
            <div className="flex-shrink-0 ml-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0"
                onClick={onDismiss}
                aria-label="Dismiss alert"
              >
                <Icon icon={XMarkIcon} size="sm" />
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }
)

Alert.displayName = 'Alert'

export { Alert, alertVariants }
