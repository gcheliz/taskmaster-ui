import React, { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const badgeVariants = cva(
  'badge',
  {
    variants: {
      variant: {
        default: 'badge-blue',
        secondary: 'badge-gray',
        success: 'badge-green',
        warning: 'badge-yellow',
        error: 'badge-red',
        info: 'bg-cyan-100 text-cyan-800',
        purple: 'bg-purple-100 text-purple-800',
        outline: 'border border-gray-300 text-gray-700',
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
  'badge',
  {
    variants: {
      status: {
        pending: 'status-pending',
        'in-progress': 'status-in-progress',
        done: 'status-done',
        blocked: 'badge-red',
        deferred: 'badge-yellow',
        review: 'status-review',
        testing: 'status-testing',
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
  'badge',
  {
    variants: {
      priority: {
        low: 'priority-low bg-gray-50 text-gray-700',
        medium: 'priority-medium bg-amber-50 text-amber-700',
        high: 'priority-high bg-red-50 text-red-700',
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