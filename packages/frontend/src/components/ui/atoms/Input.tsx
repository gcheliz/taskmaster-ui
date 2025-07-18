import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const inputVariants = cva(
  // Base styles from design system
  'input-base flex w-full transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-secondary-300 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        error:
          'border-error-500 focus-visible:border-error-500 focus-visible:ring-2 focus-visible:ring-error-500 focus-visible:ring-offset-2',
        success:
          'border-success-500 focus-visible:border-success-500 focus-visible:ring-2 focus-visible:ring-success-500 focus-visible:ring-offset-2',
      },
      inputSize: {
        sm: 'h-8 px-3 py-1 text-sm',
        md: 'h-10 px-3 py-2',
        lg: 'h-12 px-4 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
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
   * Icon to display on the left side of the input
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display on the right side of the input
   */
  rightIcon?: React.ReactNode;
  /**
   * The visual style variant of the input
   * @default 'default'
   */
  variant?: 'default' | 'error' | 'success';
  /**
   * The size of the input
   * @default 'md'
   */
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      error,
      success,
      leftIcon,
      rightIcon,
      type,
      ...props
    },
    ref
  ) => {
    // Determine variant based on state
    const computedVariant = error ? 'error' : success ? 'success' : variant;

    const inputElement = (
      <input
        type={type}
        className={cn(
          inputVariants({ variant: computedVariant, inputSize, className }),
          leftIcon && 'pl-10',
          rightIcon && 'pr-10'
        )}
        ref={ref}
        {...props}
      />
    );

    if (leftIcon || rightIcon) {
      return (
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500">
              {leftIcon}
            </div>
          )}
          {inputElement}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }

    return inputElement;
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
