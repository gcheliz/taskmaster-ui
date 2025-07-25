import { useState, useCallback } from 'react'
import type { Task } from '../../../../types/task'

export interface SubmitOptions {
  optimisticUpdate?: boolean
  showSuccessMessage?: boolean
  resetOnSuccess?: boolean
  validateBeforeSubmit?: () => boolean
}

export interface UseTaskSubmitReturn {
  isSubmitting: boolean
  submitError: string | null
  submitSuccess: boolean
  submit: (data: Partial<Task>, options?: SubmitOptions) => Promise<void>
  clearError: () => void
  clearSuccess: () => void
}

/**
 * Hook for handling task form submission
 * Manages loading states, error handling, and success feedback
 */
export function useTaskSubmit(
  onSubmit: (data: Partial<Task>) => Promise<void>,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): UseTaskSubmitReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const submit = useCallback(
    async (data: Partial<Task>, options: SubmitOptions = {}) => {
      const {
        optimisticUpdate = false,
        showSuccessMessage = true,
        resetOnSuccess = false,
        validateBeforeSubmit,
      } = options

      // Run validation if provided
      if (validateBeforeSubmit && !validateBeforeSubmit()) {
        return
      }

      setIsSubmitting(true)
      setSubmitError(null)
      setSubmitSuccess(false)

      try {
        // Clean up the data before submission
        const cleanedData = {
          ...data,
          title: data.title?.trim(),
          description: data.description?.trim(),
          details: data.details?.trim() || undefined,
          testStrategy: data.testStrategy?.trim() || undefined,
          assignedTo: data.assignedTo?.trim() || undefined,
          dependencies: data.dependencies?.filter(Boolean) || [],
          tags: data.tags?.filter((tag) => tag.trim() !== '') || [],
        }

        await onSubmit(cleanedData)

        if (showSuccessMessage) {
          setSubmitSuccess(true)
        }

        if (onSuccess) {
          onSuccess()
        }

        // Clear success message after 3 seconds
        if (showSuccessMessage) {
          setTimeout(() => setSubmitSuccess(false), 3000)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save task'
        setSubmitError(errorMessage)
        
        if (onError) {
          onError(error instanceof Error ? error : new Error(errorMessage))
        }
        
        throw error // Re-throw for component-level handling
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit, onSuccess, onError]
  )

  const clearError = useCallback(() => {
    setSubmitError(null)
  }, [])

  const clearSuccess = useCallback(() => {
    setSubmitSuccess(false)
  }, [])

  return {
    isSubmitting,
    submitError,
    submitSuccess,
    submit,
    clearError,
    clearSuccess,
  }
}