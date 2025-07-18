import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { Icon, CheckIcon } from './Icon';

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-sm border border-secondary-300 ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600 data-[state=checked]:text-white transition-all duration-200 ease-in-out transform-gpu hover:scale-110 focus-visible:ring-offset-surface-100 dark:focus-visible:ring-offset-surface-900 hover:shadow-md dark:border-secondary-600 dark:data-[state=checked]:bg-primary-500 dark:data-[state=checked]:border-primary-500 dark:focus-visible:ring-primary-400 hover:border-secondary-400 dark:hover:border-secondary-500',
  {
    variants: {
      size: {
        sm: 'h-3 w-3 min-h-[0.75rem] min-w-[0.75rem]',
        md: 'h-4 w-4 min-h-[1rem] min-w-[1rem]',
        lg: 'h-5 w-5 min-h-[1.25rem] min-w-[1.25rem]',
      },
      variant: {
        default:
          'data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600 dark:data-[state=checked]:bg-primary-500 dark:data-[state=checked]:border-primary-500 hover:shadow-primary-500/25 dark:hover:shadow-primary-400/25',
        error:
          'border-error-500 data-[state=checked]:bg-error-600 data-[state=checked]:border-error-600 dark:border-error-600 dark:data-[state=checked]:bg-error-500 dark:data-[state=checked]:border-error-500 hover:shadow-error-500/25 dark:hover:shadow-error-400/25',
        success:
          'border-success-500 data-[state=checked]:bg-success-600 data-[state=checked]:border-success-600 dark:border-success-600 dark:data-[state=checked]:bg-success-500 dark:data-[state=checked]:border-success-500 hover:shadow-success-500/25 dark:hover:shadow-success-400/25',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
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
   * Shows indeterminate state (partially checked)
   * @default false
   */
  indeterminate?: boolean;
  /**
   * Size of the checkbox
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Visual style variant of the checkbox
   * @default 'default'
   */
  variant?: 'default' | 'error' | 'success';
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      size,
      variant,
      error,
      success,
      indeterminate,
      checked,
      ...props
    },
    ref
  ) => {
    const computedVariant = error ? 'error' : success ? 'success' : variant;
    const isChecked = indeterminate ? false : checked;
    const dataState = indeterminate
      ? 'indeterminate'
      : isChecked
        ? 'checked'
        : 'unchecked';

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className={cn(
            checkboxVariants({ size, variant: computedVariant, className })
          )}
          ref={ref}
          checked={isChecked}
          data-state={dataState}
          aria-checked={indeterminate ? 'mixed' : isChecked}
          {...props}
        />
        {(isChecked || indeterminate) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {indeterminate ? (
              <div className="w-2 h-0.5 bg-white rounded-full" />
            ) : (
              <Icon
                icon={CheckIcon}
                size={size === 'sm' ? 'xs' : size === 'lg' ? 'sm' : 'xs'}
                color="current"
              />
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants };
