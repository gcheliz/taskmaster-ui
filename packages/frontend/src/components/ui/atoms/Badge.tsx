import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 transform-gpu hover:scale-105 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-accent-primary text-white hover:bg-accent-primary/90 dark:bg-accent-primary dark:text-white dark:hover:bg-accent-primary/90 hover:shadow-md hover:shadow-accent-primary/25',
        primary:
          'border-transparent bg-accent-primary text-white hover:bg-accent-primary/90 dark:bg-accent-primary dark:text-white dark:hover:bg-accent-primary/90 hover:shadow-md hover:shadow-accent-primary/25',
        secondary:
          'border-transparent bg-slate-600 text-white hover:bg-slate-700 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700 hover:shadow-md hover:shadow-slate-500/25',
        success:
          'border-transparent bg-accent-success text-white hover:bg-accent-success/90 dark:bg-accent-success dark:text-white dark:hover:bg-accent-success/90 hover:shadow-md hover:shadow-accent-success/25',
        warning:
          'border-transparent bg-accent-warning text-white hover:bg-accent-warning/90 dark:bg-accent-warning dark:text-white dark:hover:bg-accent-warning/90 hover:shadow-md hover:shadow-accent-warning/25',
        error:
          'border-transparent bg-accent-error text-white hover:bg-accent-error/90 dark:bg-accent-error dark:text-white dark:hover:bg-accent-error/90 hover:shadow-md hover:shadow-accent-error/25',
        outline:
          'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 hover:shadow-md hover:shadow-slate-500/25',
        // TaskMaster specific status badges with mockup colors
        pending: 'border-transparent bg-accent-warning text-white hover:bg-accent-warning/90 hover:shadow-md hover:shadow-accent-warning/25',
        'in-progress': 'border-transparent bg-accent-primary text-white hover:bg-accent-primary/90 hover:shadow-md hover:shadow-accent-primary/25',
        done: 'border-transparent bg-accent-success text-white hover:bg-accent-success/90 hover:shadow-md hover:shadow-accent-success/25',
        blocked: 'border-transparent bg-accent-error text-white hover:bg-accent-error/90 hover:shadow-md hover:shadow-accent-error/25',
        deferred: 'border-transparent bg-slate-500 text-white hover:bg-slate-600 hover:shadow-md hover:shadow-slate-500/25',
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
