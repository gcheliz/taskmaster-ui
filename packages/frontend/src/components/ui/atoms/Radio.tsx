import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const radioVariants = cva(
  'aspect-square h-4 w-4 rounded-full border border-secondary-300 text-primary-600 ring-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
      variant: {
        default: 'border-secondary-300 text-primary-600',
        error: 'border-error-500 text-error-600',
        success: 'border-success-500 text-success-600',
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
