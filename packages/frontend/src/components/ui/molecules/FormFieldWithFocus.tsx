import React, { useEffect, useRef } from 'react'
import { FormField } from './FormField'
import type { FormFieldProps } from './FormField'

export interface FormFieldWithFocusProps extends FormFieldProps {
  /** Focus this field when it has an error */
  focusOnError?: boolean
  /** Callback when field receives focus */
  onFocus?: () => void
  /** Callback when field loses focus */
  onBlur?: () => void
}

/**
 * Enhanced FormField component with focus management
 * Automatically focuses field when it has an error
 */
export const FormFieldWithFocus: React.FC<FormFieldWithFocusProps> = ({
  focusOnError = true,
  onFocus,
  onBlur,
  error,
  children,
  ...props
}) => {
  const fieldRef = useRef<HTMLDivElement>(null)
  const previousError = useRef(error)

  useEffect(() => {
    // Focus field when error appears
    if (focusOnError && error && !previousError.current) {
      const input = fieldRef.current?.querySelector('input, textarea, select')
      if (input) {
        (input as HTMLElement).focus()
        input.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    previousError.current = error
  }, [error, focusOnError])

  // Clone children to add focus handlers
  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      const childElement = child as React.ReactElement<any>
      return React.cloneElement(childElement, {
        onFocus: (e: React.FocusEvent) => {
          childElement.props?.onFocus?.(e)
          onFocus?.()
        },
        onBlur: (e: React.FocusEvent) => {
          childElement.props?.onBlur?.(e)
          onBlur?.()
        },
      })
    }
    return child
  })

  return (
    <div ref={fieldRef}>
      <FormField error={error} {...props}>
        {enhancedChildren}
      </FormField>
    </div>
  )
}

/**
 * Hook to manage form focus
 */
export const useFormFocus = () => {
  const formRef = useRef<HTMLFormElement>(null)
  
  const focusFirstField = () => {
    if (!formRef.current) return
    
    const firstInput = formRef.current.querySelector(
      'input:not([disabled]), textarea:not([disabled]), select:not([disabled])'
    )
    
    if (firstInput) {
      (firstInput as HTMLElement).focus()
    }
  }
  
  const focusFirstError = () => {
    if (!formRef.current) return
    
    const firstError = formRef.current.querySelector('[aria-invalid="true"]')
    
    if (firstError) {
      (firstError as HTMLElement).focus()
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
  
  return {
    formRef,
    focusFirstField,
    focusFirstError,
  }
}