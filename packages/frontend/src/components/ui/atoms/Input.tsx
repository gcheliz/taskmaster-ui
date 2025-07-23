import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../utils/cn'

const inputVariants = cva(
  // Base styles with enhanced dark theme support and micro-interactions
  'input-base flex w-full transition-all duration-200 ease-in-out file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-500 dark:placeholder:text-secondary-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-offset-surface-100 dark:focus-visible:ring-offset-surface-900 hover:shadow-sm focus-visible:shadow-md transform-gpu focus-visible:scale-[1.02] focus-visible:z-10',
  {
    variants: {
      variant: {
        default:
          'border-secondary-300 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-secondary-600 dark:focus-visible:border-primary-400 dark:focus-visible:ring-primary-400 hover:border-secondary-400 dark:hover:border-secondary-500 hover:shadow-secondary-500/25 dark:hover:shadow-secondary-400/25',
        error:
          'border-error-500 focus-visible:border-error-500 focus-visible:ring-2 focus-visible:ring-error-500 focus-visible:ring-offset-2 dark:border-error-600 dark:focus-visible:border-error-400 dark:focus-visible:ring-error-400 hover:border-error-600 dark:hover:border-error-500 hover:shadow-error-500/25 dark:hover:shadow-error-400/25',
        success:
          'border-success-500 focus-visible:border-success-500 focus-visible:ring-2 focus-visible:ring-success-500 focus-visible:ring-offset-2 dark:border-success-600 dark:focus-visible:border-success-400 dark:focus-visible:ring-success-400 hover:border-success-600 dark:hover:border-success-500 hover:shadow-success-500/25 dark:hover:shadow-success-400/25',
      },
      inputSize: {
        sm: 'h-8 px-3 py-1 text-sm min-h-[2rem]',
        md: 'h-10 px-3 py-2 min-h-[2.5rem]',
        lg: 'h-12 px-4 py-3 text-lg min-h-[3rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  /**
   * Shows error state styling
   * @default false
   */
  error?: boolean
  /**
   * Shows success state styling
   * @default false
   */
  success?: boolean
  /**
   * Icon to display on the left side of the input
   */
  leftIcon?: React.ReactNode
  /**
   * Icon to display on the right side of the input
   */
  rightIcon?: React.ReactNode
  /**
   * The visual style variant of the input
   * @default 'default'
   */
  variant?: 'default' | 'error' | 'success'
  /**
   * The size of the input
   * @default 'md'
   */
  inputSize?: 'sm' | 'md' | 'lg'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, error, success, leftIcon, rightIcon, type, ...props }, ref) => {
    // Determine variant based on state
    const computedVariant = error ? 'error' : success ? 'success' : variant

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
    )

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
      )
    }

    return inputElement
  }
)

Input.displayName = 'Input'

export { Input, inputVariants }
