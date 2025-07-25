import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  useTaskValidation,
  useTaskSubmit,
  useFormField,
  useTaskDependencies,
  useTaskTags,
} from '../hooks'
import { createMockTask } from '../../../../test-utils'

describe('Task Form Hooks', () => {
  describe('useTaskValidation', () => {
    it('validates title field correctly', () => {
      const { result } = renderHook(() => useTaskValidation())
      
      expect(result.current.validateField('title', '')).toBe('Title is required')
      expect(result.current.validateField('title', 'Hi')).toBe('Title must be at least 3 characters long')
      expect(result.current.validateField('title', 'Valid Title')).toBeUndefined()
    })

    it('validates description field correctly', () => {
      const { result } = renderHook(() => useTaskValidation())
      
      expect(result.current.validateField('description', '')).toBe('Description is required')
      expect(result.current.validateField('description', 'Short')).toBe('Description must be at least 10 characters long')
      expect(result.current.validateField('description', 'Valid description text')).toBeUndefined()
    })

    it('validates due date correctly', () => {
      const { result } = renderHook(() => useTaskValidation())
      
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      expect(result.current.validateField('dueDate', yesterday.toISOString())).toBe('Due date cannot be in the past')
      expect(result.current.validateField('dueDate', tomorrow.toISOString())).toBeUndefined()
    })

    it('allows custom validation rules', () => {
      const { result } = renderHook(() => useTaskValidation({
        titleMinLength: 5,
        titleMaxLength: 50,
      }))
      
      expect(result.current.validateField('title', 'Test')).toBe('Title must be at least 5 characters long')
      expect(result.current.validateField('title', 'Valid Title')).toBeUndefined()
    })

    it('validates entire form', () => {
      const { result } = renderHook(() => useTaskValidation())
      
      const formData = {
        title: 'Hi',
        description: 'Short',
        priority: undefined,
        status: undefined,
      }
      
      const errors = result.current.validateForm(formData)
      
      expect(errors.title).toBe('Title must be at least 3 characters long')
      expect(errors.description).toBe('Description must be at least 10 characters long')
      expect(errors.priority).toBe('Priority is required')
      expect(errors.status).toBe('Status is required')
    })
  })

  describe('useTaskSubmit', () => {
    it('handles successful submission', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined)
      const mockOnSuccess = vi.fn()
      
      const { result } = renderHook(() => useTaskSubmit(mockOnSubmit, mockOnSuccess))
      
      expect(result.current.isSubmitting).toBe(false)
      
      await act(async () => {
        await result.current.submit({ title: 'Test Task' })
      })
      
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Task',
        description: undefined,
        details: undefined,
        testStrategy: undefined,
        assignedTo: undefined,
        dependencies: [],
        tags: [],
      })
      expect(mockOnSuccess).toHaveBeenCalled()
      expect(result.current.submitSuccess).toBe(true)
    })

    it('handles submission errors', async () => {
      const mockError = new Error('Submission failed')
      const mockOnSubmit = vi.fn().mockRejectedValue(mockError)
      const mockOnError = vi.fn()
      
      const { result } = renderHook(() => useTaskSubmit(mockOnSubmit, undefined, mockOnError))
      
      await expect(
        act(async () => {
          await result.current.submit({ title: 'Test Task' })
        })
      ).rejects.toThrow('Submission failed')
      
      expect(result.current.submitError).toBe('Submission failed')
      expect(mockOnError).toHaveBeenCalledWith(mockError)
    })

    it('cleans data before submission', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined)
      
      const { result } = renderHook(() => useTaskSubmit(mockOnSubmit))
      
      await act(async () => {
        await result.current.submit({
          title: '  Trimmed Title  ',
          description: '  Trimmed Description  ',
          tags: ['', 'tag1', '  tag2  ', ''],
        })
      })
      
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Trimmed Title',
        description: 'Trimmed Description',
        details: undefined,
        testStrategy: undefined,
        assignedTo: undefined,
        dependencies: [],
        tags: ['tag1', 'tag2'],
      })
    })

    it('respects validation option', async () => {
      const mockOnSubmit = vi.fn()
      const mockValidate = vi.fn().mockReturnValue(false)
      
      const { result } = renderHook(() => useTaskSubmit(mockOnSubmit))
      
      await act(async () => {
        await result.current.submit(
          { title: 'Test' },
          { validateBeforeSubmit: mockValidate }
        )
      })
      
      expect(mockValidate).toHaveBeenCalled()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('useFormField', () => {
    it('manages field state correctly', () => {
      const { result } = renderHook(() => useFormField({
        initialValue: 'Initial',
      }))
      
      expect(result.current.value).toBe('Initial')
      expect(result.current.error).toBeUndefined()
      expect(result.current.touched).toBe(false)
      
      act(() => {
        result.current.setValue('Updated')
      })
      
      expect(result.current.value).toBe('Updated')
      expect(result.current.touched).toBe(true)
    })

    it('validates on change when touched', () => {
      const mockValidate = vi.fn((value) => value.length < 5 ? 'Too short' : undefined)
      
      const { result } = renderHook(() => useFormField({
        initialValue: '',
        validate: mockValidate,
      }))
      
      act(() => {
        result.current.setValue('Hi')
      })
      
      expect(result.current.error).toBe('Too short')
      
      act(() => {
        result.current.setValue('Valid text')
      })
      
      expect(result.current.error).toBeUndefined()
    })

    it('applies transform function', () => {
      const { result } = renderHook(() => useFormField({
        initialValue: '',
        transform: (value: string) => value.toUpperCase(),
      }))
      
      act(() => {
        result.current.setValue('lowercase')
      })
      
      expect(result.current.value).toBe('LOWERCASE')
    })

    it('resets to initial value', () => {
      const { result } = renderHook(() => useFormField({
        initialValue: 'Initial',
      }))
      
      act(() => {
        result.current.setValue('Changed')
        result.current.setTouched(true)
        result.current.setError('Some error')
      })
      
      expect(result.current.value).toBe('Changed')
      expect(result.current.touched).toBe(true)
      expect(result.current.error).toBe('Some error')
      
      act(() => {
        result.current.reset()
      })
      
      expect(result.current.value).toBe('Initial')
      expect(result.current.touched).toBe(false)
      expect(result.current.error).toBeUndefined()
    })
  })

  describe('useTaskDependencies', () => {
    const mockTasks = [
      createMockTask({ id: 1, title: 'Task 1' }),
      createMockTask({ id: 2, title: 'Task 2', dependencies: [1] }),
      createMockTask({ id: 3, title: 'Task 3', dependencies: [2] }),
      createMockTask({ id: 4, title: 'Task 4' }),
    ]

    it('filters out current task from available dependencies', () => {
      const { result } = renderHook(() => useTaskDependencies({
        availableTasks: mockTasks,
        currentTaskId: 2,
      }))
      
      const availableIds = result.current.availableForDependency.map(t => t.id)
      expect(availableIds).not.toContain(2)
    })

    it('adds and removes dependencies', () => {
      const { result } = renderHook(() => useTaskDependencies({
        availableTasks: mockTasks,
        currentTaskId: 4,
      }))
      
      expect(result.current.dependencies).toEqual([])
      
      act(() => {
        result.current.addDependency(1)
      })
      
      expect(result.current.dependencies).toEqual([1])
      
      act(() => {
        result.current.addDependency(2)
      })
      
      expect(result.current.dependencies).toEqual([1, 2])
      
      act(() => {
        result.current.removeDependency(1)
      })
      
      expect(result.current.dependencies).toEqual([2])
    })

    it('toggles dependencies', () => {
      const { result } = renderHook(() => useTaskDependencies({
        availableTasks: mockTasks,
        currentTaskId: 4,
      }))
      
      act(() => {
        result.current.toggleDependency(1)
      })
      
      expect(result.current.dependencies).toEqual([1])
      
      act(() => {
        result.current.toggleDependency(1)
      })
      
      expect(result.current.dependencies).toEqual([])
    })

    it('validates dependencies', () => {
      const { result } = renderHook(() => useTaskDependencies({
        availableTasks: mockTasks,
        currentTaskId: 4,
      }))
      
      act(() => {
        result.current.setDependencies([1, 2, 99])
      })
      
      const error = result.current.validateDependencies()
      expect(error).toContain('Some dependencies no longer exist')
    })
  })

  describe('useTaskTags', () => {
    it('manages tags correctly', () => {
      const { result } = renderHook(() => useTaskTags({
        initialTags: ['tag1', 'tag2'],
      }))
      
      expect(result.current.tags).toEqual(['tag1', 'tag2'])
      
      act(() => {
        const added = result.current.addTag('tag3')
        expect(added).toBe(true)
      })
      
      expect(result.current.tags).toEqual(['tag1', 'tag2', 'tag3'])
      
      act(() => {
        result.current.removeTag('tag2')
      })
      
      expect(result.current.tags).toEqual(['tag1', 'tag3'])
    })

    it('validates tags', () => {
      const { result } = renderHook(() => useTaskTags({
        maxTags: 3,
      }))
      
      expect(result.current.validateTag('')).toBe('Tag cannot be empty')
      expect(result.current.validateTag('a')).toBe('Tag must be at least 2 characters')
      expect(result.current.validateTag('valid-tag')).toBeUndefined()
      expect(result.current.validateTag('invalid tag!')).toBe('Tag can only contain letters, numbers, hyphens, and underscores')
      
      act(() => {
        result.current.setTags(['tag1', 'tag2', 'tag3'])
      })
      
      expect(result.current.validateTag('tag4')).toBe('Maximum 3 tags allowed')
      expect(result.current.validateTag('tag1')).toBe('Tag already exists')
    })

    it('suggests available tags', () => {
      const { result } = renderHook(() => useTaskTags({
        initialTags: ['bug'],
        availableTags: ['bug', 'feature', 'urgent', 'documentation'],
      }))
      
      expect(result.current.suggestedTags).toEqual(['feature', 'urgent', 'documentation'])
    })

    it('respects custom tag restrictions', () => {
      const { result } = renderHook(() => useTaskTags({
        availableTags: ['allowed1', 'allowed2'],
        allowCustomTags: false,
      }))
      
      expect(result.current.validateTag('custom')).toBe('Custom tags are not allowed')
      expect(result.current.validateTag('allowed1')).toBeUndefined()
      
      act(() => {
        const added = result.current.addTag('custom')
        expect(added).toBe(false)
      })
      
      expect(result.current.tags).toEqual([])
      
      act(() => {
        const added = result.current.addTag('allowed1')
        expect(added).toBe(true)
      })
      
      expect(result.current.tags).toEqual(['allowed1'])
    })
  })
})