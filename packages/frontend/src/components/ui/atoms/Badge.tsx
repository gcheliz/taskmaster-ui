import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-100 dark:focus:ring-offset-surface-900 transform-gpu hover:scale-105 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-100 text-primary-800 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-100 dark:hover:bg-primary-800 hover:shadow-md hover:shadow-primary-500/25 dark:hover:shadow-primary-400/25',
        primary:
          'border-transparent bg-primary-100 text-primary-800 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-100 dark:hover:bg-primary-800 hover:shadow-md hover:shadow-primary-500/25 dark:hover:shadow-primary-400/25',
        secondary:
          'border-transparent bg-secondary-100 text-secondary-800 hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-100 dark:hover:bg-secondary-700 hover:shadow-md hover:shadow-secondary-500/25 dark:hover:shadow-secondary-400/25',
        success:
          'border-transparent bg-success-100 text-success-800 hover:bg-success-200 dark:bg-success-900 dark:text-success-100 dark:hover:bg-success-800 hover:shadow-md hover:shadow-success-500/25 dark:hover:shadow-success-400/25',
        warning:
          'border-transparent bg-warning-100 text-warning-800 hover:bg-warning-200 dark:bg-warning-900 dark:text-warning-100 dark:hover:bg-warning-800 hover:shadow-md hover:shadow-warning-500/25 dark:hover:shadow-warning-400/25',
        error:
          'border-transparent bg-error-100 text-error-800 hover:bg-error-200 dark:bg-error-900 dark:text-error-100 dark:hover:bg-error-800 hover:shadow-md hover:shadow-error-500/25 dark:hover:shadow-error-400/25',
        outline:
          'border-secondary-300 text-secondary-700 hover:bg-secondary-50 dark:border-secondary-600 dark:text-secondary-300 dark:hover:bg-secondary-800 hover:shadow-md hover:shadow-secondary-500/25 dark:hover:shadow-secondary-400/25',
        // TaskMaster specific status badges with enhanced dark theme
        pending: 'status-pending text-white hover:shadow-md hover:shadow-yellow-500/25 dark:hover:shadow-yellow-400/25',
        'in-progress': 'status-in-progress text-white hover:shadow-md hover:shadow-blue-500/25 dark:hover:shadow-blue-400/25',
        done: 'status-done text-white hover:shadow-md hover:shadow-green-500/25 dark:hover:shadow-green-400/25',
        blocked: 'status-blocked text-white hover:shadow-md hover:shadow-red-500/25 dark:hover:shadow-red-400/25',
        deferred: 'status-deferred text-white hover:shadow-md hover:shadow-gray-500/25 dark:hover:shadow-gray-400/25',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs min-w-[1.5rem] min-h-[1.25rem]',
        md: 'px-2.5 py-0.5 text-xs min-w-[2rem] min-h-[1.5rem]',
        lg: 'px-3 py-1 text-sm min-w-[2.5rem] min-h-[1.75rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Optional icon to display before the badge text
   */
  icon?: React.ReactNode;
  /**
   * The visual style variant of the badge
   * @default 'default'
   */
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'outline'
    | 'pending'
    | 'in-progress'
    | 'done'
    | 'blocked'
    | 'deferred';
  /**
   * The size of the badge
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <span
        className={cn(badgeVariants({ variant, size, className }))}
        ref={ref}
        role="status"
        aria-label={`Status: ${children}`}
        {...props}
      >
        {icon && (
          <span className="mr-1 flex items-center" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
