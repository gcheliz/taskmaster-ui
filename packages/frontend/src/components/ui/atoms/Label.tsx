import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'text-secondary-900',
        error: 'text-error-700',
        success: 'text-success-700',
        muted: 'text-secondary-600',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-error-500",
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      required: false,
    },
  }
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
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
   * Description text displayed below the label
   */
  description?: string;
  /**
   * Help text displayed below the description
   */
  helpText?: string;
  /**
   * Visual style variant of the label
   * @default 'default'
   */
  variant?: 'default' | 'error' | 'success' | 'muted';
  /**
   * Size of the label text
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Shows required indicator (asterisk)
   * @default false
   */
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      className,
      variant,
      size,
      required,
      error,
      success,
      description,
      helpText,
      children,
      ...props
    },
    ref
  ) => {
    // Determine variant based on state
    const computedVariant = error ? 'error' : success ? 'success' : variant;

    return (
      <div className="space-y-1">
        <label
          ref={ref}
          className={cn(
            labelVariants({
              variant: computedVariant,
              size,
              required,
              className,
            })
          )}
          {...props}
        >
          {children}
        </label>
        {description && (
          <p
            className={cn(
              'text-xs',
              error
                ? 'text-error-600'
                : success
                  ? 'text-success-600'
                  : 'text-secondary-600'
            )}
          >
            {description}
          </p>
        )}
        {helpText && <p className="text-xs text-secondary-500">{helpText}</p>}
      </div>
    );
  }
);

Label.displayName = 'Label';

export { Label, labelVariants };
