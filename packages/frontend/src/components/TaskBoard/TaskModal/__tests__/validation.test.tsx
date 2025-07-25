import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskModal } from '../index'
import type { Task } from '../../../../types/task'

describe('Task Creation Validation', () => {
  const mockOnClose = jest.fn()
  const mockOnSave = jest.fn()

  const defaultProps = {
    isOpen: true,
    mode: 'create' as const,
    onClose: mockOnClose,
    onSave: mockOnSave,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Client-side validation', () => {
    it('should validate required title field', async () => {
      const user = userEvent.setup()
      render(<TaskModal {...defaultProps} />)

      // Try to submit without title
      const submitButton = screen.getByText('Create Task')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should validate title length', async () => {
      const user = userEvent.setup()
      render(<TaskModal {...defaultProps} />)

      // Enter title that's too short
      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'AB')
      
      const submitButton = screen.getByText('Create Task')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Title must be at least 3 characters long')).toBeInTheDocument()
      })
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should validate required description field', async () => {
      const user = userEvent.setup()
      render(<TaskModal {...defaultProps} />)

      // Enter valid title but no description
      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Valid Title')
      
      const submitButton = screen.getByText('Create Task')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Description is required')).toBeInTheDocument()
      })
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should validate description length', async () => {
      const user = userEvent.setup()
      render(<TaskModal {...defaultProps} />)

      // Enter valid title but short description
      const titleInput = screen.getByLabelText(/title/i)
      const descInput = screen.getByLabelText(/description/i)
      
      await user.type(titleInput, 'Valid Title')
      await user.type(descInput, 'Too short')
      
      const submitButton = screen.getByText('Create Task')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Description must be at least 10 characters long')).toBeInTheDocument()
      })
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should validate due date is not in the past', async () => {
      const user = userEvent.setup()
      render(<TaskModal {...defaultProps} />)

      // Enter valid title and description
      const titleInput = screen.getByLabelText(/title/i)
      const descInput = screen.getByLabelText(/description/i)
      const dueDateInput = screen.getByLabelText(/due date/i)
      
      await user.type(titleInput, 'Valid Title')
      await user.type(descInput, 'Valid description that is long enough')
      
      // Set past date
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const dateStr = yesterday.toISOString().split('T')[0]
      await user.type(dueDateInput, dateStr)
      
      const submitButton = screen.getByText('Create Task')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Due date cannot be in the past')).toBeInTheDocument()
      })
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should allow valid task creation', async () => {
      const user = userEvent.setup()
      render(<TaskModal {...defaultProps} />)

      // Fill all required fields correctly
      const titleInput = screen.getByLabelText(/title/i)
      const descInput = screen.getByLabelText(/description/i)
      
      await user.type(titleInput, 'Valid Task Title')
      await user.type(descInput, 'This is a valid description that meets the minimum length requirement')
      
      // Select priority (already has default)
      const prioritySelect = screen.getByLabelText(/priority/i)
      expect(prioritySelect).toHaveValue('medium')
      
      const submitButton = screen.getByText('Create Task')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Valid Task Title',
            description: 'This is a valid description that meets the minimum length requirement',
            priority: 'medium',
            status: 'pending',
          })
        )
      })
    })
  })

  describe('Error handling', () => {
    it('should display server validation errors', async () => {
      const user = userEvent.setup()
      
      // Mock server error
      const serverError = new Error('Title already exists')
      mockOnSave.mockRejectedValueOnce(serverError)
      
      render(<TaskModal {...defaultProps} />)

      // Fill valid form
      const titleInput = screen.getByLabelText(/title/i)
      const descInput = screen.getByLabelText(/description/i)
      
      await user.type(titleInput, 'Duplicate Title')
      await user.type(descInput, 'This is a valid description that meets the minimum length requirement')
      
      const submitButton = screen.getByText('Create Task')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Title already exists')).toBeInTheDocument()
      })
    })

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock network error
      const networkError = new Error('Network request failed')
      mockOnSave.mockRejectedValueOnce(networkError)
      
      render(<TaskModal {...defaultProps} />)

      // Fill valid form
      const titleInput = screen.getByLabelText(/title/i)
      const descInput = screen.getByLabelText(/description/i)
      
      await user.type(titleInput, 'Valid Title')
      await user.type(descInput, 'This is a valid description that meets the minimum length requirement')
      
      const submitButton = screen.getByText('Create Task')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Network request failed')).toBeInTheDocument()
      })
    })

    it('should clear errors when user corrects input', async () => {
      const user = userEvent.setup()
      render(<TaskModal {...defaultProps} />)

      // Submit with empty title to trigger error
      const submitButton = screen.getByText('Create Task')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })

      // Now fill in the title
      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Valid Title')

      // Error should be cleared after typing
      await waitFor(() => {
        expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form state management', () => {
    it('should disable form during submission', async () => {
      const user = userEvent.setup()
      
      // Mock slow save operation
      mockOnSave.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      )
      
      render(<TaskModal {...defaultProps} />)

      // Fill valid form
      const titleInput = screen.getByLabelText(/title/i)
      const descInput = screen.getByLabelText(/description/i)
      
      await user.type(titleInput, 'Valid Title')
      await user.type(descInput, 'This is a valid description that meets the minimum length requirement')
      
      const submitButton = screen.getByText('Create Task')
      await user.click(submitButton)

      // Check that inputs are disabled during submission
      expect(titleInput).toBeDisabled()
      expect(descInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })

    it('should reset form when modal is closed and reopened', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<TaskModal {...defaultProps} />)

      // Fill some data
      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Some Title')

      // Close modal
      rerender(<TaskModal {...defaultProps} isOpen={false} />)

      // Reopen modal
      rerender(<TaskModal {...defaultProps} isOpen={true} />)

      // Form should be reset
      const newTitleInput = screen.getByLabelText(/title/i) as HTMLInputElement
      expect(newTitleInput.value).toBe('')
    })
  })
})