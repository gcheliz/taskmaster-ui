import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../contexts/AuthContext'
import TaskBoard from '../../pages/TaskBoard'

// Mock API responses
const mockCreateTask = vi.fn()
const mockGetTasks = vi.fn()
const mockGetRepositories = vi.fn()

vi.mock('../../services/api', () => ({
  api: {
    tasks: {
      create: () => mockCreateTask(),
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

describe('Task Creation Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    queryClient.clear()
    
    // Set auth token
    localStorage.setItem('auth_token', 'test-token')
    
    // Mock initial data
    mockGetTasks.mockResolvedValue([])
    mockGetRepositories.mockResolvedValue([
      { id: 1, name: 'Test Repo', url: 'https://github.com/test/repo' }
    ])
  })

  it('should create a new task through the modal', async () => {
    const user = userEvent.setup()
    
    // Mock successful task creation
    const newTask = {
      id: 1,
      title: 'New Test Task',
      description: 'This is a test task description',
      status: 'pending',
      priority: 'medium',
      complexity: 5,
      repositoryId: 1,
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    mockCreateTask.mockResolvedValueOnce(newTask)
    mockGetTasks.mockResolvedValueOnce([newTask])

    render(<TestApp />)

    // Wait for board to load
    await waitFor(() => {
      expect(screen.getByText('Add Task')).toBeInTheDocument()
    })

    // Click add task button
    const addButton = screen.getByText('Add Task')
    await user.click(addButton)

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    // Fill in task details
    const titleInput = screen.getByLabelText(/title/i)
    const descriptionInput = screen.getByLabelText(/description/i)
    const prioritySelect = screen.getByLabelText(/priority/i)
    const complexityInput = screen.getByLabelText(/complexity/i)

    await user.type(titleInput, 'New Test Task')
    await user.type(descriptionInput, 'This is a test task description')
    await user.selectOptions(prioritySelect, 'medium')
    await user.clear(complexityInput)
    await user.type(complexityInput, '5')

    // Submit the form
    const createButton = screen.getByRole('button', { name: /create task/i })
    await user.click(createButton)

    // Verify API was called with correct data
    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith({
        title: 'New Test Task',
        description: 'This is a test task description',
        status: 'pending',
        priority: 'medium',
        complexity: 5,
        repositoryId: 1,
      })
    })

    // Verify task appears in the board
    await waitFor(() => {
      expect(screen.getByText('New Test Task')).toBeInTheDocument()
    })
  })

  it('should handle validation errors during task creation', async () => {
    const user = userEvent.setup()

    render(<TestApp />)

    // Wait for board to load
    await waitFor(() => {
      expect(screen.getByText('Add Task')).toBeInTheDocument()
    })

    // Click add task button
    const addButton = screen.getByText('Add Task')
    await user.click(addButton)

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    // Try to submit without filling required fields
    const createButton = screen.getByRole('button', { name: /create task/i })
    await user.click(createButton)

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    })

    // Verify API was not called
    expect(mockCreateTask).not.toHaveBeenCalled()
  })

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock API error
    mockCreateTask.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Failed to create task',
        },
      },
    })

    render(<TestApp />)

    // Wait for board to load
    await waitFor(() => {
      expect(screen.getByText('Add Task')).toBeInTheDocument()
    })

    // Click add task button
    const addButton = screen.getByText('Add Task')
    await user.click(addButton)

    // Fill in task details
    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'Test Task')

    // Submit the form
    const createButton = screen.getByRole('button', { name: /create task/i })
    await user.click(createButton)

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to create task/i)).toBeInTheDocument()
    })
  })

  it('should allow canceling task creation', async () => {
    const user = userEvent.setup()

    render(<TestApp />)

    // Wait for board to load
    await waitFor(() => {
      expect(screen.getByText('Add Task')).toBeInTheDocument()
    })

    // Click add task button
    const addButton = screen.getByText('Add Task')
    await user.click(addButton)

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    // Fill in some data
    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'Test Task')

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument()
    })

    // Verify API was not called
    expect(mockCreateTask).not.toHaveBeenCalled()
  })
})