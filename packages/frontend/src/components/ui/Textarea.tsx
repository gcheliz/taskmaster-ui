import React, { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const textareaVariants = cva(
  'w-full rounded-md border bg-white px-4 py-3 text-secondary-900 transition-all duration-200 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-500 resize-y',
  {
    variants: {
      variant: {
        default: 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500',
        error: 'border-error-500 focus:border-error-500 focus:ring-error-500',
        success: 'border-success-500 focus:border-success-500 focus:ring-success-500',
      },
      size: {
        sm: 'text-xs min-h-[60px]',
        md: 'text-sm min-h-[80px]',
        lg: 'text-base min-h-[100px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string
  error?: string
  helperText?: string
  maxLength?: number
  showCount?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant,
    size,
    label,
    error,
    helperText,
    maxLength,
    showCount = false,
    id,
    value,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${textareaId}-error`
    const helperId = `${textareaId}-helper`
    
    const currentLength = value ? String(value).length : 0

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-secondary-700"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            textareaVariants({ variant: error ? 'error' : variant, size, className })
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          maxLength={maxLength}
          value={value}
          {...props}
        />
        <div className="flex items-center justify-between">
          <div>
            {error && (
              <p id={errorId} className="text-xs text-error-500" role="alert">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={helperId} className="text-xs text-secondary-500">
                {helperText}
              </p>
            )}
          </div>
          {showCount && maxLength && (
            <span className="text-xs text-secondary-500">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }