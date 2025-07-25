import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from "react-router"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../contexts/AuthContext'
import TaskBoard from '../../pages/TaskBoard'

// Mock API responses
const mockUpdateTask = vi.fn()
const mockDeleteTask = vi.fn()
const mockGetTasks = vi.fn()
const mockGetRepositories = vi.fn()

vi.mock('../../services/api', () => ({
  api: {
    tasks: {
      update: () => mockUpdateTask(),
      delete: () => mockDeleteTask(),
      getAll: () => mockGetTasks(),
    },
    repositories: {
      getAll: () => mockGetRepositories(),
    },
  },
}))

// Mock socket.io
vi.mock('socket.io-client', () => ({
  io: () => ({
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
  }),
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const TestApp = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TaskBoard />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
)

describe('Task Editing Flow Integration Tests', () => {
  const existingTask = {
    id: 1,
    title: 'Existing Task',
    description: 'Original description',
    status: 'pending',
    priority: 'low',
    complexity: 3,
    repositoryId: 1,
    position: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    queryClient.clear()
    
    // Set auth token
    localStorage.setItem('auth_token', 'test-token')
    
    // Mock initial data
    mockGetTasks.mockResolvedValue([existingTask])
    mockGetRepositories.mockResolvedValue([
      { id: 1, name: 'Test Repo', url: 'https://github.com/test/repo' }
    ])
  })

  it('should edit an existing task through the modal', async () => {
    const user = userEvent.setup()
    
    // Mock successful task update
    const updatedTask = {
      ...existingTask,
      title: 'Updated Task Title',
      description: 'Updated description',
      priority: 'high',
      complexity: 8,
      updatedAt: new Date().toISOString(),
    }
    
    mockUpdateTask.mockResolvedValueOnce(updatedTask)
    mockGetTasks.mockResolvedValueOnce([updatedTask])

    render(<TestApp />)

    // Wait for board to load with task
    await waitFor(() => {
      expect(screen.getByText('Existing Task')).toBeInTheDocument()
    })

    // Click on the task to open modal
    const taskCard = screen.getByText('Existing Task')
    await user.click(taskCard)

    // Wait for modal to open in view mode
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit task/i })).toBeInTheDocument()
    })

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit task/i })
    await user.click(editButton)

    // Wait for form to be editable
    await waitFor(() => {
      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
      expect(titleInput.disabled).toBe(false)
    })

    // Update task details
    const titleInput = screen.getByLabelText(/title/i)
    const descriptionInput = screen.getByLabelText(/description/i)
    const prioritySelect = screen.getByLabelText(/priority/i)
    const complexityInput = screen.getByLabelText(/complexity/i)

    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Task Title')
    
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated description')
    
    await user.selectOptions(prioritySelect, 'high')
    
    await user.clear(complexityInput)
    await user.type(complexityInput, '8')

    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Verify API was called with correct data
    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith(1, {
        title: 'Updated Task Title',
        description: 'Updated description',
        status: 'pending',
        priority: 'high',
        complexity: 8,
        repositoryId: 1,
      })
    })

    // Verify task is updated in the board
    await waitFor(() => {
      expect(screen.getByText('Updated Task Title')).toBeInTheDocument()
    })
  })

  it('should handle task status changes', async () => {
    const user = userEvent.setup()
    
    const updatedTask = {
      ...existingTask,
      status: 'in_progress',
    }
    
    mockUpdateTask.mockResolvedValueOnce(updatedTask)
    mockGetTasks.mockResolvedValueOnce([updatedTask])

    render(<TestApp />)

    // Wait for board to load
    await waitFor(() => {
      expect(screen.getByText('Existing Task')).toBeInTheDocument()
    })

    // Click on the task
    const taskCard = screen.getByText('Existing Task')
    await user.click(taskCard)

    // Click edit button
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit task/i })).toBeInTheDocument()
    })
    
    const editButton = screen.getByRole('button', { name: /edit task/i })
    await user.click(editButton)

    // Change status
    const statusSelect = screen.getByLabelText(/status/i)
    await user.selectOptions(statusSelect, 'in_progress')

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Verify API was called
    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith(1, expect.objectContaining({
        status: 'in_progress',
      }))
    })
  })

  it('should handle task deletion', async () => {
    const user = userEvent.setup()
    
    mockDeleteTask.mockResolvedValueOnce({ success: true })
    mockGetTasks.mockResolvedValueOnce([])

    render(<TestApp />)

    // Wait for board to load
    await waitFor(() => {
      expect(screen.getByText('Existing Task')).toBeInTheDocument()
    })

    // Click on the task
    const taskCard = screen.getByText('Existing Task')
    await user.click(taskCard)

    // Click edit button
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit task/i })).toBeInTheDocument()
    })
    
    const editButton = screen.getByRole('button', { name: /edit task/i })
    await user.click(editButton)

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete task/i })
    await user.click(deleteButton)

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    })
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await user.click(confirmButton)

    // Verify API was called
    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith(1)
    })

    // Verify task is removed from board
    await waitFor(() => {
      expect(screen.queryByText('Existing Task')).not.toBeInTheDocument()
    })
  })

  it('should handle API errors during update', async () => {
    const user = userEvent.setup()
    
    // Mock API error
    mockUpdateTask.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Failed to update task',
        },
      },
    })

    render(<TestApp />)

    // Wait for board to load
    await waitFor(() => {
      expect(screen.getByText('Existing Task')).toBeInTheDocument()
    })

    // Click on the task
    const taskCard = screen.getByText('Existing Task')
    await user.click(taskCard)

    // Click edit button
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit task/i })).toBeInTheDocument()
    })
    
    const editButton = screen.getByRole('button', { name: /edit task/i })
    await user.click(editButton)

    // Change title
    const titleInput = screen.getByLabelText(/title/i)
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Title')

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to update task/i)).toBeInTheDocument()
    })

    // Verify task remains unchanged
    expect(screen.getByText('Existing Task')).toBeInTheDocument()
  })

  it('should allow canceling edits', async () => {
    const user = userEvent.setup()

    render(<TestApp />)

    // Wait for board to load
    await waitFor(() => {
      expect(screen.getByText('Existing Task')).toBeInTheDocument()
    })

    // Click on the task
    const taskCard = screen.getByText('Existing Task')
    await user.click(taskCard)

    // Click edit button
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit task/i })).toBeInTheDocument()
    })
    
    const editButton = screen.getByRole('button', { name: /edit task/i })
    await user.click(editButton)

    // Make some changes
    const titleInput = screen.getByLabelText(/title/i)
    await user.clear(titleInput)
    await user.type(titleInput, 'Changed Title')

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Verify API was not called
    expect(mockUpdateTask).not.toHaveBeenCalled()

    // Verify original task title is still displayed
    expect(screen.getByText('Existing Task')).toBeInTheDocument()
  })
})