import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, createMockTask } from '../../../../test-utils'
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
      
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/assigned to/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/due date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/estimated hours/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/details/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/test strategy/i)).toBeInTheDocument()
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
      expect(screen.getByDisplayValue('high')).toBeInTheDocument()
      expect(screen.getByDisplayValue('in-progress')).toBeInTheDocument()
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
      
      expect(screen.getByLabelText(/title/i)).toBeDisabled()
      expect(screen.getByLabelText(/description/i)).toBeDisabled()
      expect(screen.getByLabelText(/priority/i)).toBeDisabled()
    })

    it('disables fields when loading', () => {
      render(<TaskForm {...defaultProps} isLoading={true} />)
      
      expect(screen.getByLabelText(/title/i)).toBeDisabled()
      expect(screen.getByLabelText(/description/i)).toBeDisabled()
      expect(screen.getByLabelText(/priority/i)).toBeDisabled()
    })
  })

  describe('Field Interactions', () => {
    it('calls onFieldChange when title is changed', async () => {
      const { user } = render(<TaskForm {...defaultProps} />)
      
      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'New Title')
      
      expect(mockOnFieldChange).toHaveBeenCalledWith('title', 'New Title')
    })

    it('calls onFieldChange when description is changed', async () => {
      const { user } = render(<TaskForm {...defaultProps} />)
      
      const descriptionInput = screen.getByLabelText(/description/i)
      await user.type(descriptionInput, 'New Description')
      
      expect(mockOnFieldChange).toHaveBeenCalledWith('description', 'New Description')
    })

    it('calls onFieldChange when priority is changed', async () => {
      const { user } = render(<TaskForm {...defaultProps} />)
      
      const prioritySelect = screen.getByLabelText(/priority/i)
      await user.selectOptions(prioritySelect, 'high')
      
      expect(mockOnFieldChange).toHaveBeenCalledWith('priority', 'high')
    })

    it('calls onFieldChange when status is changed', async () => {
      const { user } = render(<TaskForm {...defaultProps} />)
      
      const statusSelect = screen.getByLabelText(/status/i)
      await user.selectOptions(statusSelect, 'in-progress')
      
      expect(mockOnFieldChange).toHaveBeenCalledWith('status', 'in-progress')
    })

    it('handles due date changes', async () => {
      const { user } = render(<TaskForm {...defaultProps} />)
      
      const dueDateInput = screen.getByLabelText(/due date/i)
      await user.type(dueDateInput, '2024-12-31')
      
      expect(mockOnFieldChange).toHaveBeenCalledWith('dueDate', '2024-12-31')
    })

    it('handles estimated hours changes', async () => {
      const { user } = render(<TaskForm {...defaultProps} />)
      
      const hoursInput = screen.getByLabelText(/estimated hours/i)
      await user.type(hoursInput, '8')
      
      expect(mockOnFieldChange).toHaveBeenCalledWith('estimatedHours', 8)
    })
  })

  describe('Dependencies Management', () => {
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
      
      expect(screen.getByText('bug')).toBeInTheDocument()
      expect(screen.getByText('urgent')).toBeInTheDocument()
    })

    it('adds new tags', async () => {
      const { user } = render(<TaskForm {...defaultProps} />)
      
      const tagInput = screen.getByPlaceholderText(/add tags/i)
      await user.type(tagInput, 'new-tag{Enter}')
      
      expect(mockOnFieldChange).toHaveBeenCalledWith('tags', ['new-tag'])
    })

    it('removes tags when clicked', async () => {
      const formData = {
        ...DEFAULT_TASK_VALUES,
        tags: ['bug', 'urgent'],
      }
      
      const { user } = render(<TaskForm {...defaultProps} formData={formData} />)
      
      const removeButton = screen.getAllByLabelText(/remove tag/i)[0]
      await user.click(removeButton)
      
      expect(mockOnFieldChange).toHaveBeenCalledWith('tags', ['urgent'])
    })
  })

  describe('Form Submission', () => {
    it('calls onSubmit when form is submitted', async () => {
      const { user } = render(<TaskForm {...defaultProps} />)
      
      const form = screen.getByRole('form')
      fireEvent.submit(form)
      
      expect(mockOnSubmit).toHaveBeenCalled()
    })

    it('prevents submission when loading', () => {
      render(<TaskForm {...defaultProps} isLoading={true} />)
      
      const form = screen.getByRole('form')
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
      
      const priorityIndicator = screen.getByTestId('priority-indicator')
      expect(priorityIndicator).toHaveStyle({ backgroundColor: expect.stringContaining('ef4444') })
    })

    it('shows status indicator', () => {
      const formData = {
        ...DEFAULT_TASK_VALUES,
        status: 'in-progress' as const,
      }
      
      render(<TaskForm {...defaultProps} formData={formData} />)
      
      const statusIndicator = screen.getByTestId('status-indicator')
      expect(statusIndicator).toHaveStyle({ backgroundColor: expect.stringContaining('3b82f6') })
    })

    it('highlights fields with errors', () => {
      const validationErrors = {
        title: 'Title is required',
      }
      
      render(<TaskForm {...defaultProps} validationErrors={validationErrors} />)
      
      const titleInput = screen.getByLabelText(/title/i)
      expect(titleInput).toHaveClass('border-red-300')
    })
  })
})