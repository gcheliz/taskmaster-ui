import React, { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary-100 text-primary-700',
        secondary: 'bg-secondary-100 text-secondary-700',
        success: 'bg-success-100 text-success-700',
        warning: 'bg-warning-100 text-warning-700',
        error: 'bg-error-100 text-error-700',
        info: 'bg-info-100 text-info-700',
        outline: 'border border-secondary-300 text-secondary-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

// Status badge variants for task statuses
const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      status: {
        pending: 'bg-status-pending text-white',
        'in-progress': 'bg-status-in-progress text-white',
        done: 'bg-status-done text-white',
        blocked: 'bg-status-blocked text-white',
        deferred: 'bg-status-deferred text-white',
      },
    },
    defaultVariants: {
      status: 'pending',
    },
  }
)

export interface StatusBadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {}

const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(statusBadgeVariants({ status, className }))}
        {...props}
      />
    )
  }
)

StatusBadge.displayName = 'StatusBadge'

// Priority badge variants
const priorityBadgeVariants = cva(
  'inline-flex items-center rounded-md border-l-4 px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      priority: {
        low: 'border-priority-low bg-priority-low/10 text-priority-low',
        medium: 'border-priority-medium bg-priority-medium/10 text-priority-medium',
        high: 'border-priority-high bg-priority-high/10 text-priority-high',
      },
    },
    defaultVariants: {
      priority: 'low',
    },
  }
)

export interface PriorityBadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof priorityBadgeVariants> {}

const PriorityBadge = forwardRef<HTMLSpanElement, PriorityBadgeProps>(
  ({ className, priority, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(priorityBadgeVariants({ priority, className }))}
        {...props}
      />
    )
  }
)

PriorityBadge.displayName = 'PriorityBadge'

export { Badge, StatusBadge, PriorityBadge, badgeVariants, statusBadgeVariants, priorityBadgeVariants }