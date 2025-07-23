import React from 'react'
import { cn } from '../../../utils/cn'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The progress value (0-100) */
  value: number
  /** Maximum value */
  max?: number
  /** Progress bar size */
  size?: 'sm' | 'md' | 'lg'
  /** Progress bar color variant */
  variant?: 'primary' | 'success' | 'warning' | 'error'
  /** Whether to show the progress value as text */
  showValue?: boolean
  /** Whether to animate the progress bar */
  animated?: boolean
}

const progressVariants = {
  primary: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600',
}

const progressSizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      size = 'md',
      variant = 'primary',
      showValue = false,
      animated = true,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))

    return (
      <div className={cn('relative', className)} {...props}>
        <div
          ref={ref}
          className={cn(
            'w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700',
            progressSizes[size]
          )}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              progressVariants[variant],
              animated && 'animate-pulse'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showValue && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    )
  }
)

Progress.displayName = 'Progress'

export default Progress