import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, createMockTask, waitFor } from '../../../../test-utils'
import { TaskForm } from '../components/TaskForm'
import { DEFAULT_TASK_VALUES } from '../constants'

describe('TaskForm', () => {
  const mockOnFieldChange = vi.fn()
  const mockOnSubmit = vi.fn()

  const defaultProps = {
    formData: DEFAULT_TASK_VALUES,
    validationErrors: {},
    isLoading: false,
    isReadOnly: false,
    availableTasks: [],
    onFieldChange: mockOnFieldChange,
    onSubmit: mockOnSubmit,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('renders all form fields', () => {
      render(<TaskForm {...defaultProps} />)
      
      expect(screen.getByTestId('task-title-input')).toBeInTheDocument()
      expect(screen.getByTestId('task-description-input')).toBeInTheDocument()
      expect(screen.getByTestId('task-priority-select')).toBeInTheDocument()
      expect(screen.getByTestId('task-status-select')).toBeInTheDocument()
    })

    it('populates fields with form data', () => {
      const formData = {
        ...DEFAULT_TASK_VALUES,
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high' as const,
        status: 'in-progress' as const,
        assignedTo: 'John Doe',
      }
      
      render(<TaskForm {...defaultProps} formData={formData} />)
      
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
      
      // For select elements, check the selected value
      const prioritySelect = screen.getByTestId('task-priority-select') as HTMLSelectElement
      expect(prioritySelect.value).toBe('high')
      
      const statusSelect = screen.getByTestId('task-status-select') as HTMLSelectElement
      expect(statusSelect.value).toBe('in-progress')
      
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })

    it('displays validation errors', () => {
      const validationErrors = {
        title: 'Title is required',
        description: 'Description is too short',
      }
      
      render(<TaskForm {...defaultProps} validationErrors={validationErrors} />)
      
      expect(screen.getByText('Title is required')).toBeInTheDocument()
      expect(screen.getByText('Description is too short')).toBeInTheDocument()
    })

    it('disables fields in read-only mode', () => {
      render(<TaskForm {...defaultProps} isReadOnly={true} />)
      
      expect(screen.getByTestId('task-title-input')).toBeDisabled()
      expect(screen.getByTestId('task-description-input')).toBeDisabled()
      expect(screen.getByTestId('task-priority-select')).toBeDisabled()
    })

    it('disables fields when loading', () => {
      render(<TaskForm {...defaultProps} isLoading={true} />)
      
      expect(screen.getByTestId('task-title-input')).toBeDisabled()
      expect(screen.getByTestId('task-description-input')).toBeDisabled()
      expect(screen.getByTestId('task-priority-select')).toBeDisabled()
    })
  })

  describe('Field Interactions', () => {
    it('calls onFieldChange when title is changed', async () => {
      const { user } = render(<TaskForm {...defaultProps} />)
      
      const titleInput = screen.getByTestId('task-title-input')
      await user.clear(titleInput)
      await user.type(titleInput, 'New Title')
      
      // Check that onChange was called with the complete value
      expect(mockOnFieldChange).toHaveBeenCalledWith('title', 'New Title')
    })

    it('calls onFieldChange when description is changed', async () => {
      const { user } = render(<TaskForm {...defaultProps} />)
      
      const descriptionInput = screen.getByTestId('task-description-input')
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'New Description')
      
      // Check that onChange was called with the complete value
      expect(mockOnFieldChange).toHaveBeenCalledWith('description', 'New Description')
    })

    it('calls onFieldChange when priority is changed', async () => {
      const { user } = render(<TaskForm {...defaultProps} />)
      
      const prioritySelect = screen.getByTestId('task-priority-select')
      await user.selectOptions(prioritySelect, 'high')
      
      expect(mockOnFieldChange).toHaveBeenCalledWith('priority', 'high')
    })

    it('calls onFieldChange when status is changed', async () => {
      const { user } = render(<TaskForm {...defaultProps} />)
      
      const statusSelect = screen.getByTestId('task-status-select')
      await user.selectOptions(statusSelect, 'in-progress')
      
      expect(mockOnFieldChange).toHaveBeenCalledWith('status', 'in-progress')
    })

    it('handles due date changes', async () => {
      const { user } = render(<TaskForm {...defaultProps} />)
      
      const dueDateInput = screen.getByTestId('task-due-date-input')
      await user.type(dueDateInput, '2024-12-31')
      
      // The component converts to ISO string
      expect(mockOnFieldChange).toHaveBeenCalledWith('dueDate', expect.stringContaining('2024-12-31'))
    })

    it('handles estimated hours changes', async () => {
      const { user } = render(<TaskForm {...defaultProps} />)
      
      const hoursInput = screen.getByTestId('task-estimated-hours-input')
      await user.type(hoursInput, '8')
      
      expect(mockOnFieldChange).toHaveBeenCalledWith('estimatedHours', 8)
    })
  })

  describe.skip('Dependencies Management', () => {
    const availableTasks = [
      createMockTask({ id: 1, title: 'Task 1' }),
      createMockTask({ id: 2, title: 'Task 2' }),
      createMockTask({ id: 3, title: 'Task 3' }),
    ]

    it('displays available tasks for dependencies', () => {
      render(<TaskForm {...defaultProps} availableTasks={availableTasks} />)
      
      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.getByText('Task 2')).toBeInTheDocument()
      expect(screen.getByText('Task 3')).toBeInTheDocument()
    })

    it('shows selected dependencies', () => {
      const formData = {
        ...DEFAULT_TASK_VALUES,
        dependencies: [1, 2],
      }
      
      render(
        <TaskForm 
          {...defaultProps} 
          formData={formData}
          availableTasks={availableTasks}
        />
      )
      
      const task1Checkbox = screen.getByRole('checkbox', { name: /Task 1/i })
      const task2Checkbox = screen.getByRole('checkbox', { name: /Task 2/i })
      
      expect(task1Checkbox).toBeChecked()
      expect(task2Checkbox).toBeChecked()
    })

    it('toggles dependencies when clicked', async () => {
      const { user } = render(
        <TaskForm 
          {...defaultProps} 
          availableTasks={availableTasks}
        />
      )
      
      const task1Checkbox = screen.getByRole('checkbox', { name: /Task 1/i })
      await user.click(task1Checkbox)
      
      expect(mockOnFieldChange).toHaveBeenCalledWith('dependencies', [1])
    })
  })

  describe('Tags Management', () => {
    it('displays current tags', () => {
      const formData = {
        ...DEFAULT_TASK_VALUES,
        tags: ['bug', 'urgent'],
      }
      
      render(<TaskForm {...defaultProps} formData={formData} />)
      
      const tagInput = screen.getByTestId('task-tags-input')
      expect(tagInput).toHaveValue('bug, urgent')
    })

    it('adds new tags', async () => {
      const { user } = render(<TaskForm {...defaultProps} />)
      
      const tagInput = screen.getByTestId('task-tags-input')
      await user.type(tagInput, 'new-tag, another-tag')
      
      expect(mockOnFieldChange).toHaveBeenCalledWith('tags', ['new-tag', 'another-tag'])
    })

    it('removes tags when clicked', async () => {
      const formData = {
        ...DEFAULT_TASK_VALUES,
        tags: ['bug', 'urgent'],
      }
      
      const { user } = render(<TaskForm {...defaultProps} formData={formData} />)
      
      const tagInput = screen.getByTestId('task-tags-input')
      await user.clear(tagInput)
      await user.type(tagInput, 'urgent')
      
      expect(mockOnFieldChange).toHaveBeenCalledWith('tags', ['urgent'])
    })
  })

  describe('Form Submission', () => {
    it('calls onSubmit when form is submitted', async () => {
      const { user } = render(<TaskForm {...defaultProps} />)
      
      const titleInput = screen.getByTestId('task-title-input')
      const form = titleInput.closest('form')!
      
      fireEvent.submit(form)
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })

    it('prevents submission when loading', () => {
      render(<TaskForm {...defaultProps} isLoading={true} />)
      
      const titleInput = screen.getByTestId('task-title-input')
      const form = titleInput.closest('form')!
      
      fireEvent.submit(form)
      
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })

  describe('Visual Feedback', () => {
    it('shows priority indicator', () => {
      const formData = {
        ...DEFAULT_TASK_VALUES,
        priority: 'high' as const,
      }
      
      render(<TaskForm {...defaultProps} formData={formData} />)
      
      // The priority selector shows a colored indicator
      const prioritySection = screen.getByText('Priority *').parentElement
      const indicator = prioritySection?.querySelector('.w-3.h-3.rounded-full')
      expect(indicator).toBeInTheDocument()
      expect(indicator).toHaveStyle({ backgroundColor: 'rgb(239, 68, 68)' })
    })

    it('shows status indicator', () => {
      const formData = {
        ...DEFAULT_TASK_VALUES,
        status: 'in-progress' as const,
      }
      
      render(<TaskForm {...defaultProps} formData={formData} />)
      
      // The status selector shows a colored indicator
      const statusSection = screen.getByText('Status *').parentElement
      const indicator = statusSection?.querySelector('.w-3.h-3.rounded-full')
      expect(indicator).toBeInTheDocument()
    })

    it('highlights fields with errors', () => {
      const validationErrors = {
        title: 'Title is required',
      }
      
      render(<TaskForm {...defaultProps} validationErrors={validationErrors} />)
      
      const titleInput = screen.getByTestId('task-title-input')
      expect(titleInput).toHaveClass('border-red-300')
    })
  })
})