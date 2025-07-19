import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { Icon, ChevronDownIcon } from './Icon';

const selectVariants = cva(
  // Base styles with enhanced dark theme support and micro-interactions
  'flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-all duration-200 ease-in-out placeholder:text-secondary-500 dark:placeholder:text-secondary-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 appearance-none focus:ring-offset-surface-100 dark:focus:ring-offset-surface-900 hover:shadow-sm focus:shadow-md transform-gpu focus:scale-[1.02] focus:z-10',
  {
    variants: {
      variant: {
        default:
          'border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-secondary-600 dark:focus:border-primary-400 dark:focus:ring-primary-400 hover:border-secondary-400 dark:hover:border-secondary-500 hover:shadow-secondary-500/25 dark:hover:shadow-secondary-400/25',
        error:
          'border-error-500 focus:border-error-500 focus:ring-2 focus:ring-error-500 focus:ring-offset-2 dark:border-error-600 dark:focus:border-error-400 dark:focus:ring-error-400 hover:border-error-600 dark:hover:border-error-500 hover:shadow-error-500/25 dark:hover:shadow-error-400/25',
        success:
          'border-success-500 focus:border-success-500 focus:ring-2 focus:ring-success-500 focus:ring-offset-2 dark:border-success-600 dark:focus:border-success-400 dark:focus:ring-success-400 hover:border-success-600 dark:hover:border-success-500 hover:shadow-success-500/25 dark:hover:shadow-success-400/25',
      },
      selectSize: {
        sm: 'h-8 px-2 py-1 text-xs',
        md: 'h-10 px-3 py-2',
        lg: 'h-12 px-4 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      selectSize: 'md',
    },
  }
);

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectVariants> {
  /**
   * Shows error state styling
   * @default false
   */
  error?: boolean;
  /**
   * Shows success state styling
   * @default false
   */
  success?: boolean;
  /**
   * The visual style variant of the select
   * @default 'default'
   */
  variant?: 'default' | 'error' | 'success';
  /**
   * The size of the select
   * @default 'md'
   */
  selectSize?: 'sm' | 'md' | 'lg';
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, variant, selectSize, error, success, children, ...props },
    ref
  ) => {
    // Determine variant based on state
    const computedVariant = error ? 'error' : success ? 'success' : variant;

    return (
      <div className="relative">
        <select
          className={cn(
            selectVariants({ variant: computedVariant, selectSize, className })
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 dark:text-secondary-400 pointer-events-none">
          <Icon icon={ChevronDownIcon} size="sm" />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select, selectVariants };
