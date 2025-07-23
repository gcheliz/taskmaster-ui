import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../utils/cn'

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-solid border-current border-r-transparent',
  {
    variants: {
      size: {
        xs: 'h-3 w-3 border',
        sm: 'h-4 w-4 border',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-2',
        xl: 'h-12 w-12 border-2',
      },
      spinnerColor: {
        current: 'text-current',
        primary: 'text-primary-600',
        secondary: 'text-secondary-600',
        success: 'text-success-600',
        warning: 'text-warning-600',
        error: 'text-error-600',
        white: 'text-white',
        muted: 'text-secondary-400',
      },
    },
    defaultVariants: {
      size: 'md',
      spinnerColor: 'current',
    },
  }
)

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Accessible label for the spinner
   * @default 'Loading'
   */
  'aria-label'?: string
  /**
   * Size of the spinner
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /**
   * Color of the spinner
   * @default 'current'
   */
  spinnerColor?:
    | 'current'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'white'
    | 'muted'
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, spinnerColor, 'aria-label': ariaLabel = 'Loading', ...props }, ref) => {
    return (
      <div
        role="status"
        aria-label={ariaLabel}
        className={cn(spinnerVariants({ size, spinnerColor, className }))}
        ref={ref}
        {...props}
      >
        <span className="sr-only">{ariaLabel}</span>
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'

// Pulse Spinner variant for different loading states
const pulseVariants = cva('animate-pulse rounded-full bg-current opacity-75', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    pulseColor: {
      current: 'bg-current',
      primary: 'bg-primary-600',
      secondary: 'bg-secondary-600',
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      error: 'bg-error-600',
      white: 'bg-white',
      muted: 'bg-secondary-400',
    },
  },
  defaultVariants: {
    size: 'md',
    pulseColor: 'current',
  },
})

export interface PulseSpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof pulseVariants> {
  'aria-label'?: string
}

const PulseSpinner = React.forwardRef<HTMLDivElement, PulseSpinnerProps>(
  ({ className, size, pulseColor, 'aria-label': ariaLabel = 'Loading', ...props }, ref) => {
    return (
      <div
        role="status"
        aria-label={ariaLabel}
        className={cn(pulseVariants({ size, pulseColor, className }))}
        ref={ref}
        {...props}
      >
        <span className="sr-only">{ariaLabel}</span>
      </div>
    )
  }
)

PulseSpinner.displayName = 'PulseSpinner'

// Dots Spinner for subtle loading states
export interface DotsSpinnerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'current' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white' | 'muted'
  'aria-label'?: string
}

const DotsSpinner = React.forwardRef<HTMLDivElement, DotsSpinnerProps>(
  (
    { className, size = 'md', color = 'current', 'aria-label': ariaLabel = 'Loading', ...props },
    ref
  ) => {
    const dotSize =
      size === 'xs'
        ? 'h-1 w-1'
        : size === 'sm'
          ? 'h-1.5 w-1.5'
          : size === 'md'
            ? 'h-2 w-2'
            : size === 'lg'
              ? 'h-2.5 w-2.5'
              : 'h-3 w-3'
    const colorClass =
      color === 'current'
        ? 'bg-current'
        : color === 'primary'
          ? 'bg-primary-600'
          : color === 'secondary'
            ? 'bg-secondary-600'
            : color === 'success'
              ? 'bg-success-600'
              : color === 'warning'
                ? 'bg-warning-600'
                : color === 'error'
                  ? 'bg-error-600'
                  : color === 'white'
                    ? 'bg-white'
                    : 'bg-secondary-400'

    return (
      <div
        role="status"
        aria-label={ariaLabel}
        className={cn('flex space-x-1', className)}
        ref={ref}
        {...props}
      >
        <div
          className={cn(dotSize, colorClass, 'rounded-full animate-bounce')}
          style={{ animationDelay: '0ms' }}
        />
        <div
          className={cn(dotSize, colorClass, 'rounded-full animate-bounce')}
          style={{ animationDelay: '150ms' }}
        />
        <div
          className={cn(dotSize, colorClass, 'rounded-full animate-bounce')}
          style={{ animationDelay: '300ms' }}
        />
        <span className="sr-only">{ariaLabel}</span>
      </div>
    )
  }
)

DotsSpinner.displayName = 'DotsSpinner'

export { Spinner, PulseSpinner, DotsSpinner, spinnerVariants, pulseVariants }
