import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-100 text-primary-800 hover:bg-primary-200',
        secondary: 'border-transparent bg-secondary-100 text-secondary-800 hover:bg-secondary-200',
        success: 'border-transparent bg-success-100 text-success-800 hover:bg-success-200',
        warning: 'border-transparent bg-warning-100 text-warning-800 hover:bg-warning-200',
        error: 'border-transparent bg-error-100 text-error-800 hover:bg-error-200',
        outline: 'border-secondary-300 text-secondary-700 hover:bg-secondary-50',
        // TaskMaster specific status badges
        pending: 'status-pending text-white',
        'in-progress': 'status-in-progress text-white',
        done: 'status-done text-white',
        blocked: 'status-blocked text-white',
        deferred: 'status-deferred text-white',
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
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'pending' | 'in-progress' | 'done' | 'blocked' | 'deferred';
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
        {...props}
      >
        {icon && <span className="mr-1 flex items-center">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };