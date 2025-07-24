import { useRef } from 'react'

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