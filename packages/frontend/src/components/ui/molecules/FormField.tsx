import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../utils/cn'
import { Label } from '../atoms/Label'
import { Input } from '../atoms/Input'

const formFieldVariants = cva('space-y-2', {
  variants: {
    variant: {
      default: '',
      inline: 'flex items-center space-x-3 space-y-0',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface FormFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof formFieldVariants> {
  /**
   * The label text for the form field
   */
  label: string
  /**
   * Description text displayed below the label
   */
  description?: string
  /**
   * Help text displayed below the description
   */
  helpText?: string
  /**
   * Error message to display (shows error state)
   */
  error?: string
  /**
   * Success message to display (shows success state)
   */
  success?: string
  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean
  /**
   * Icon to display on the left side of the input
   */
  leftIcon?: React.ReactNode
  /**
   * Icon to display on the right side of the input
   */
  rightIcon?: React.ReactNode
  /**
   * Size of the input field
   * @default 'md'
   */
  inputSize?: 'sm' | 'md' | 'lg'
  /**
   * Layout variant of the form field
   * @default 'default'
   */
  variant?: 'default' | 'inline'
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      className,
      variant,
      label,
      description,
      helpText,
      error,
      success,
      required,
      leftIcon,
      rightIcon,
      inputSize,
      id,
      ...props
    },
    ref
  ) => {
    const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`
    const hasError = Boolean(error)
    const hasSuccess = Boolean(success)

    return (
      <div className={cn(formFieldVariants({ variant, className }))}>
        <Label
          htmlFor={fieldId}
          required={required}
          error={hasError}
          success={hasSuccess}
          description={error || success || description}
          helpText={helpText}
        >
          {label}
        </Label>
        <Input
          id={fieldId}
          ref={ref}
          error={hasError}
          success={hasSuccess}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          inputSize={inputSize}
          aria-describedby={
            description || helpText || error || success ? `${fieldId}-description` : undefined
          }
          aria-invalid={hasError}
          {...props}
        />
      </div>
    )
  }
)

FormField.displayName = 'FormField'

export { FormField, formFieldVariants }
