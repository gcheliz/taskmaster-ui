import { useState, useCallback, useMemo } from 'react'
import type { Task } from '../../../../types/task'
import type { ValidationErrors } from '../types'
import { DEFAULT_TASK_VALUES } from '../constants'
import { useTaskValidation } from './useTaskValidation'
import { useTaskSubmit } from './useTaskSubmit'
import { useTaskDependencies } from './useTaskDependencies'
import { useTaskTags } from './useTaskTags'

export interface UseTaskFormV2Props {
  initialData?: Partial<Task>
  availableTasks?: Task[]
  onSubmit: (data: Partial<Task>) => Promise<void>
  validationRules?: Parameters<typeof useTaskValidation>[0]
}

export interface UseTaskFormV2Return {
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
  // Additional utilities from composed hooks
  dependencies: ReturnType<typeof useTaskDependencies>
  tags: ReturnType<typeof useTaskTags>
}

/**
 * Enhanced version of useTaskForm that composes multiple specialized hooks
 * Provides a complete solution for task form management
 */
export function useTaskFormV2({
  initialData,
  availableTasks = [],
  onSubmit,
  validationRules,
}: UseTaskFormV2Props): UseTaskFormV2Return {
  const [formData, setFormData] = useState<Partial<Task>>(initialData || DEFAULT_TASK_VALUES)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // Compose specialized hooks
  const validation = useTaskValidation(validationRules)
  
  const dependencies = useTaskDependencies({
    availableTasks,
    currentTaskId: formData.id,
  })

  const tags = useTaskTags({
    initialTags: formData.tags || [],
    availableTags: extractAvailableTags(availableTasks),
  })

  const {
    isSubmitting: isLoading,
    submitError: error,
    submit,
    clearError: setError,
  } = useTaskSubmit(onSubmit)

  // Update field with validation
  const updateField = useCallback(
    (field: keyof Task, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))

      // Clear error for this field when user types
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))

      // Special handling for dependencies and tags
      if (field === 'dependencies' && Array.isArray(value)) {
        dependencies.setDependencies(value)
      } else if (field === 'tags' && Array.isArray(value)) {
        tags.setTags(value)
      }
    },
    [dependencies, tags]
  )

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const errors = validation.validateForm(formData)
    
    // Add dependency validation
    const depError = dependencies.validateDependencies()
    if (depError) {
      errors.dependencies = depError
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData, validation, dependencies])

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const dataToSubmit = {
        ...formData,
        dependencies: dependencies.dependencies,
        tags: tags.tags,
      }

      await submit(dataToSubmit, {
        validateBeforeSubmit: validateForm,
        showSuccessMessage: false,
      })
    },
    [formData, dependencies.dependencies, tags.tags, submit, validateForm]
  )

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialData || DEFAULT_TASK_VALUES)
    setValidationErrors({})
    dependencies.setDependencies(initialData?.dependencies || [])
    tags.setTags(initialData?.tags || [])
    setError(null)
  }, [initialData, dependencies, tags, setError])

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
    dependencies,
    tags,
  }
}

/**
 * Extract unique tags from all tasks
 */
function extractAvailableTags(tasks: Task[]): string[] {
  const tagSet = new Set<string>()
  tasks.forEach((task) => {
    task.tags?.forEach((tag) => tagSet.add(tag))
  })
  return Array.from(tagSet).sort()
}