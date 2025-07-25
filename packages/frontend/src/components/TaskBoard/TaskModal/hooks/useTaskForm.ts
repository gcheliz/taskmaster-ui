import { useState, useCallback } from 'react'
import type { Task } from '../../../../types/task'
import type { ValidationErrors } from '../types'
import { DEFAULT_TASK_VALUES } from '../constants'

export interface UseTaskFormProps {
  initialData?: Partial<Task>
  onSubmit: (data: Partial<Task>) => Promise<void>
}

export interface UseTaskFormReturn {
  formData: Partial<Task>
  setFormData: React.Dispatch<React.SetStateAction<Partial<Task>>>
  validationErrors: ValidationErrors
  isLoading: boolean
  error: string | null
  updateField: (field: keyof Task, value: any) => void
  validateForm: () => boolean
  handleSubmit: (e: React.FormEvent) => Promise<void>
  resetForm: () => void
  setError: (error: string | null) => void
}

export function useTaskForm({ initialData, onSubmit }: UseTaskFormProps): UseTaskFormReturn {
  const [formData, setFormData] = useState<Partial<Task>>(initialData || DEFAULT_TASK_VALUES)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateField = useCallback((field: keyof Task, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {}

    // Title validation
    if (!formData.title?.trim()) {
      errors.title = 'Title is required'
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long'
    } else if (formData.title.trim().length > 100) {
      errors.title = 'Title must be less than 100 characters'
    }

    // Description validation
    if (!formData.description?.trim()) {
      errors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long'
    } else if (formData.description.trim().length > 500) {
      errors.description = 'Description must be less than 500 characters'
    }

    // Priority validation
    if (!formData.priority) {
      errors.priority = 'Priority is required'
    }

    // Status validation
    if (!formData.status) {
      errors.status = 'Status is required'
    }

    // Due date validation
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (dueDate < today) {
        errors.dueDate = 'Due date cannot be in the past'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const taskData = {
          ...formData,
          title: formData.title?.trim(),
          description: formData.description?.trim(),
          details: formData.details?.trim() || undefined,
          testStrategy: formData.testStrategy?.trim() || undefined,
          assignedTo: formData.assignedTo?.trim() || undefined,
          dependencies: formData.dependencies?.filter((dep) => dep !== undefined) || [],
          tags: formData.tags?.filter((tag) => tag.trim() !== '') || [],
        }

        await onSubmit(taskData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save task')
        throw err // Re-throw to let the modal handle it
      } finally {
        setIsLoading(false)
      }
    },
    [formData, validateForm, onSubmit]
  )

  const resetForm = useCallback(() => {
    setFormData(initialData || DEFAULT_TASK_VALUES)
    setValidationErrors({})
    setError(null)
  }, [initialData])

  return {
    formData,
    setFormData,
    validationErrors,
    isLoading,
    error,
    updateField,
    validateForm,
    handleSubmit,
    resetForm,
    setError,
  }
}