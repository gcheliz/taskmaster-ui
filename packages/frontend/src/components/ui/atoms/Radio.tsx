import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const radioVariants = cva(
  'aspect-square h-4 w-4 rounded-full border border-secondary-300 text-primary-600 ring-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out transform-gpu hover:scale-110 focus-visible:ring-offset-surface-100 dark:focus-visible:ring-offset-surface-900 hover:shadow-md dark:border-secondary-600 dark:text-primary-500 dark:focus-visible:ring-primary-400 hover:border-secondary-400 dark:hover:border-secondary-500',
  {
    variants: {
      size: {
        sm: 'h-3 w-3 min-h-[0.75rem] min-w-[0.75rem]',
        md: 'h-4 w-4 min-h-[1rem] min-w-[1rem]',
        lg: 'h-5 w-5 min-h-[1.25rem] min-w-[1.25rem]',
      },
      variant: {
        default:
          'border-secondary-300 text-primary-600 dark:border-secondary-600 dark:text-primary-500 hover:shadow-primary-500/25 dark:hover:shadow-primary-400/25',
        error:
          'border-error-500 text-error-600 dark:border-error-600 dark:text-error-500 hover:shadow-error-500/25 dark:hover:shadow-error-400/25',
        success:
          'border-success-500 text-success-600 dark:border-success-600 dark:text-success-500 hover:shadow-success-500/25 dark:hover:shadow-success-400/25',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof radioVariants> {
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
   * Size of the radio button
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Visual style variant of the radio button
   * @default 'default'
   */
  variant?: 'default' | 'error' | 'success';
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, size, variant, error, success, style, ...props }, ref) => {
    const computedVariant = error ? 'error' : success ? 'success' : variant;

    // CSS for radio checked state
    const radioStyles: React.CSSProperties = {
      ...style,
      ...(props.checked && {
        backgroundImage:
          'radial-gradient(circle, currentColor 40%, transparent 41%)',
      }),
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          type="radio"
          className={cn(
            radioVariants({ size, variant: computedVariant, className })
          )}
          ref={ref}
          style={radioStyles}
          {...props}
        />
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export { Radio, radioVariants };
