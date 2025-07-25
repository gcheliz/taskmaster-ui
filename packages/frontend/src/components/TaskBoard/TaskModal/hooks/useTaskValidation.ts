import { useCallback } from 'react'
import type { Task } from '../../../../types/task'
import type { ValidationErrors } from '../types'

export interface ValidationRules {
  titleMinLength?: number
  titleMaxLength?: number
  descriptionMinLength?: number
  descriptionMaxLength?: number
  requirePriority?: boolean
  requireStatus?: boolean
  allowPastDueDate?: boolean
}

const DEFAULT_RULES: ValidationRules = {
  titleMinLength: 3,
  titleMaxLength: 100,
  descriptionMinLength: 10,
  descriptionMaxLength: 500,
  requirePriority: true,
  requireStatus: true,
  allowPastDueDate: false,
}

export interface UseTaskValidationReturn {
  validateField: (field: keyof Task, value: any) => string | undefined
  validateForm: (formData: Partial<Task>) => ValidationErrors
  clearFieldError: (field: keyof Task) => void
}

/**
 * Hook for task form validation
 * Provides field-level and form-level validation
 */
export function useTaskValidation(rules: ValidationRules = DEFAULT_RULES) {
  const mergedRules = { ...DEFAULT_RULES, ...rules }

  const validateField = useCallback(
    (field: keyof Task, value: any): string | undefined => {
      switch (field) {
        case 'title': {
          const title = value as string
          if (!title?.trim()) {
            return 'Title is required'
          }
          if (title.trim().length < mergedRules.titleMinLength!) {
            return `Title must be at least ${mergedRules.titleMinLength} characters long`
          }
          if (title.trim().length > mergedRules.titleMaxLength!) {
            return `Title must be less than ${mergedRules.titleMaxLength} characters`
          }
          return undefined
        }

        case 'description': {
          const description = value as string
          if (!description?.trim()) {
            return 'Description is required'
          }
          if (description.trim().length < mergedRules.descriptionMinLength!) {
            return `Description must be at least ${mergedRules.descriptionMinLength} characters long`
          }
          if (description.trim().length > mergedRules.descriptionMaxLength!) {
            return `Description must be less than ${mergedRules.descriptionMaxLength} characters`
          }
          return undefined
        }

        case 'priority': {
          if (mergedRules.requirePriority && !value) {
            return 'Priority is required'
          }
          return undefined
        }

        case 'status': {
          if (mergedRules.requireStatus && !value) {
            return 'Status is required'
          }
          return undefined
        }

        case 'dueDate': {
          if (value && !mergedRules.allowPastDueDate) {
            const dueDate = new Date(value)
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            if (dueDate < today) {
              return 'Due date cannot be in the past'
            }
          }
          return undefined
        }

        case 'estimatedHours': {
          if (value !== undefined && value !== null) {
            const hours = Number(value)
            if (isNaN(hours) || hours < 0) {
              return 'Estimated hours must be a positive number'
            }
            if (hours > 999) {
              return 'Estimated hours seems too high'
            }
          }
          return undefined
        }

        case 'tags': {
          const tags = value as string[]
          if (tags && tags.length > 10) {
            return 'Maximum 10 tags allowed'
          }
          return undefined
        }

        default:
          return undefined
      }
    },
    [mergedRules]
  )

  const validateForm = useCallback(
    (formData: Partial<Task>): ValidationErrors => {
      const errors: ValidationErrors = {}

      // Validate each field
      const fieldsToValidate: (keyof Task)[] = [
        'title',
        'description',
        'priority',
        'status',
        'dueDate',
        'estimatedHours',
        'tags',
      ]

      fieldsToValidate.forEach((field) => {
        const error = validateField(field, formData[field])
        if (error) {
          errors[field] = error
        }
      })

      return errors
    },
    [validateField]
  )

  const clearFieldError = useCallback((field: keyof Task) => {
    // This would be used with a state management solution
    // For now, it's a placeholder for the API
  }, [])

  return {
    validateField,
    validateForm,
    clearFieldError,
  }
}