import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, createMockTask } from '../../../../test-utils'
import { TaskModal } from '../index'
import type { TaskModalProps } from '../index'

describe('TaskModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnEdit = vi.fn()

  const defaultProps: TaskModalProps = {
    isOpen: true,
    mode: 'create',
    onClose: mockOnClose,
    onSave: mockOnSave,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Modal Visibility', () => {
    it('renders when isOpen is true', () => {
      render(<TaskModal {...defaultProps} />)
      expect(screen.getByText('Create New Task')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<TaskModal {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument()
    })
  })

  describe('Modal Modes', () => {
    it('displays correct title for create mode', () => {
      render(<TaskModal {...defaultProps} mode="create" />)
      expect(screen.getByText('Create New Task')).toBeInTheDocument()
    })

    it('displays correct title for edit mode', () => {
      const task = createMockTask()
      render(<TaskModal {...defaultProps} mode="edit" task={task} />)
      expect(screen.getByText('Edit Task')).toBeInTheDocument()
    })

    it('displays correct title for view mode', () => {
      const task = createMockTask()
      render(<TaskModal {...defaultProps} mode="view" task={task} />)
      expect(screen.getByText('Task Details')).toBeInTheDocument()
    })
  })

  describe('Create Mode', () => {
    it('shows empty form in create mode', () => {
      render(<TaskModal {...defaultProps} mode="create" />)
      
      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
      const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement
      
      expect(titleInput.value).toBe('')
      expect(descriptionInput.value).toBe('')
    })

    it('validates required fields', async () => {
      const { user } = render(<TaskModal {...defaultProps} mode="create" />)
      
      const saveButton = screen.getByText('Create Task')
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
        expect(screen.getByText('Description is required')).toBeInTheDocument()
      })
      
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('submits form with valid data', async () => {
      const { user } = render(<TaskModal {...defaultProps} mode="create" />)
      
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      
      await user.type(titleInput, 'New Task Title')
      await user.type(descriptionInput, 'New task description that is long enough')
      
      const saveButton = screen.getByText('Create Task')
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Task Title',
            description: 'New task description that is long enough',
          })
        )
      })
    })
  })

  describe('Edit Mode', () => {
    const mockTask = createMockTask({
      id: 1,
      title: 'Existing Task',
      description: 'Existing task description',
      priority: 'high',
      status: 'in-progress',
    })

    it('populates form with task data in edit mode', () => {
      render(<TaskModal {...defaultProps} mode="edit" task={mockTask} />)
      
      const titleInput = screen.getByDisplayValue('Existing Task')
      const descriptionInput = screen.getByDisplayValue('Existing task description')
      
      expect(titleInput).toBeInTheDocument()
      expect(descriptionInput).toBeInTheDocument()
    })

    it('shows delete button in edit mode', () => {
      render(<TaskModal {...defaultProps} mode="edit" task={mockTask} onDelete={mockOnDelete} />)
      
      expect(screen.getByText('Delete Task')).toBeInTheDocument()
    })

    it('confirms before deleting', async () => {
      const { user } = render(
        <TaskModal {...defaultProps} mode="edit" task={mockTask} onDelete={mockOnDelete} />
      )
      
      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
      
      const deleteButton = screen.getByText('Delete Task')
      await user.click(deleteButton)
      
      expect(confirmSpy).toHaveBeenCalledWith(
        `Are you sure you want to delete task "Existing Task"? This action cannot be undone.`
      )
      
      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith(1)
      })
      
      confirmSpy.mockRestore()
    })

    it('does not delete when confirm is cancelled', async () => {
      const { user } = render(
        <TaskModal {...defaultProps} mode="edit" task={mockTask} onDelete={mockOnDelete} />
      )
      
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
      
      const deleteButton = screen.getByText('Delete Task')
      await user.click(deleteButton)
      
      expect(mockOnDelete).not.toHaveBeenCalled()
      
      confirmSpy.mockRestore()
    })
  })

  describe('View Mode', () => {
    const mockTask = createMockTask({
      id: 1,
      title: 'View Task',
      description: 'Task description for viewing',
      priority: 'high',
      status: 'done',
      assignedTo: 'John Doe',
      tags: ['urgent', 'bug'],
      dependencies: [2, 3],
    })

    it('displays task details in read-only mode', () => {
      render(<TaskModal {...defaultProps} mode="view" task={mockTask} />)
      
      expect(screen.getByText('View Task')).toBeInTheDocument()
      expect(screen.getByText('Task description for viewing')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
      expect(screen.getByText('Done')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('urgent')).toBeInTheDocument()
      expect(screen.getByText('bug')).toBeInTheDocument()
    })

    it('shows edit button in view mode when onEdit is provided', () => {
      render(<TaskModal {...defaultProps} mode="view" task={mockTask} onEdit={mockOnEdit} />)
      
      expect(screen.getByText('Edit Task')).toBeInTheDocument()
    })

    it('calls onEdit when edit button is clicked', async () => {
      const { user } = render(
        <TaskModal {...defaultProps} mode="view" task={mockTask} onEdit={mockOnEdit} />
      )
      
      const editButton = screen.getByText('Edit Task')
      await user.click(editButton)
      
      expect(mockOnEdit).toHaveBeenCalled()
    })
  })

  describe('Modal Interactions', () => {
    it('closes modal when close button is clicked', async () => {
      const { user } = render(<TaskModal {...defaultProps} />)
      
      const closeButton = screen.getByLabelText('Close modal')
      await user.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('closes modal when clicking backdrop', async () => {
      const { user } = render(<TaskModal {...defaultProps} />)
      
      const backdrop = screen.getByRole('dialog').parentElement
      if (backdrop) {
        await user.click(backdrop)
      }
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('does not close modal when clicking inside', async () => {
      const { user } = render(<TaskModal {...defaultProps} />)
      
      const modalContent = screen.getByRole('dialog')
      await user.click(modalContent)
      
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('closes modal when cancel button is clicked', async () => {
      const { user } = render(<TaskModal {...defaultProps} />)
      
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Form Validation', () => {
    it('validates title length', async () => {
      const { user } = render(<TaskModal {...defaultProps} mode="create" />)
      
      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Hi')
      
      const saveButton = screen.getByText('Create Task')
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText('Title must be at least 3 characters long')).toBeInTheDocument()
      })
    })

    it('validates description length', async () => {
      const { user } = render(<TaskModal {...defaultProps} mode="create" />)
      
      const descriptionInput = screen.getByLabelText(/description/i)
      await user.type(descriptionInput, 'Short')
      
      const saveButton = screen.getByText('Create Task')
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText('Description must be at least 10 characters long')).toBeInTheDocument()
      })
    })

    it('validates due date is not in the past', async () => {
      const { user } = render(<TaskModal {...defaultProps} mode="create" />)
      
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const dateString = yesterday.toISOString().split('T')[0]
      
      const dueDateInput = screen.getByLabelText(/due date/i)
      await user.type(dueDateInput, dateString)
      
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      await user.type(titleInput, 'Valid Title')
      await user.type(descriptionInput, 'Valid description that is long enough')
      
      const saveButton = screen.getByText('Create Task')
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText('Due date cannot be in the past')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error when save fails', async () => {
      const errorMessage = 'Failed to save task'
      mockOnSave.mockRejectedValueOnce(new Error(errorMessage))
      
      const { user } = render(<TaskModal {...defaultProps} mode="create" />)
      
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      
      await user.type(titleInput, 'Valid Title')
      await user.type(descriptionInput, 'Valid description that is long enough')
      
      const saveButton = screen.getByText('Create Task')
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('allows dismissing error message', async () => {
      const errorMessage = 'Failed to save task'
      mockOnSave.mockRejectedValueOnce(new Error(errorMessage))
      
      const { user } = render(<TaskModal {...defaultProps} mode="create" />)
      
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      
      await user.type(titleInput, 'Valid Title')
      await user.type(descriptionInput, 'Valid description that is long enough')
      
      const saveButton = screen.getByText('Create Task')
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
      
      const dismissButton = screen.getByLabelText('Dismiss error')
      await user.click(dismissButton)
      
      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('disables form during submission', async () => {
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      const { user } = render(<TaskModal {...defaultProps} mode="create" />)
      
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      
      await user.type(titleInput, 'Valid Title')
      await user.type(descriptionInput, 'Valid description that is long enough')
      
      const saveButton = screen.getByText('Create Task')
      await user.click(saveButton)
      
      expect(saveButton).toBeDisabled()
      expect(screen.getByText('Creating...')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled()
      })
    })

    it('shows correct loading text for edit mode', async () => {
      const task = createMockTask()
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      const { user } = render(<TaskModal {...defaultProps} mode="edit" task={task} />)
      
      const saveButton = screen.getByText('Save Changes')
      await user.click(saveButton)
      
      expect(screen.getByText('Saving...')).toBeInTheDocument()
    })
  })
})