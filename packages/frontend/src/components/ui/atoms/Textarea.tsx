import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../utils/cn'

const textareaVariants = cva(
  // Base styles with enhanced dark theme support and micro-interactions
  'flex min-h-[80px] w-full rounded-md border bg-white text-gray-900 px-3 py-2 text-sm transition-[border-color,box-shadow,transform] duration-200 ease-in-out placeholder:text-gray-500 dark:placeholder:text-secondary-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-vertical focus-visible:ring-offset-white dark:focus-visible:ring-offset-surface-900 hover:shadow-sm focus-visible:shadow-md transform-gpu focus-visible:scale-[1.02] focus-visible:z-10',
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
      textareaSize: {
        sm: 'min-h-[60px] px-2 py-1 text-sm',
        md: 'min-h-[80px] px-3 py-2',
        lg: 'min-h-[100px] px-4 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      textareaSize: 'md',
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
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
   * The visual style variant of the textarea
   * @default 'default'
   */
  variant?: 'default' | 'error' | 'success'
  /**
   * The size of the textarea
   * @default 'md'
   */
  textareaSize?: 'sm' | 'md' | 'lg'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, textareaSize, error, success, ...props }, ref) => {
    // Determine variant based on state
    const computedVariant = error ? 'error' : success ? 'success' : variant

    return (
      <textarea
        className={cn(
          textareaVariants({
            variant: computedVariant,
            textareaSize,
            className,
          })
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }
