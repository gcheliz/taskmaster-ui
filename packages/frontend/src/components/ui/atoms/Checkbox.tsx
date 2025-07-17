import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { Icon, CheckIcon } from './Icon';

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-sm border border-secondary-300 ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600 data-[state=checked]:text-white',
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
      variant: {
        default: 'data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600',
        error: 'border-error-500 data-[state=checked]:bg-error-600 data-[state=checked]:border-error-600',
        success: 'border-success-500 data-[state=checked]:bg-success-600 data-[state=checked]:border-success-600',
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
  error?: boolean;
  success?: boolean;
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, size, variant, error, success, indeterminate, checked, ...props }, ref) => {
    const computedVariant = error ? 'error' : success ? 'success' : variant;
    const isChecked = indeterminate ? false : checked;
    const dataState = indeterminate ? 'indeterminate' : isChecked ? 'checked' : 'unchecked';

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className={cn(checkboxVariants({ size, variant: computedVariant, className }))}
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