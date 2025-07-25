import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { TaskBoardManager } from '../TaskBoardManager'
import { NotificationProvider } from '../../../contexts/NotificationContext'
import { AuthProvider } from '../../../contexts/AuthContext'
import { BrowserRouter } from "react-router-dom"
import type { Task } from '../../../types/task'

// Mock server setup
const server = setupServer(
  // Mock GET tasks endpoint
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.json({
        'test-project': {
          tasks: [
            {
              id: 1,
              title: 'Existing Task',
              description: 'This task already exists',
              status: 'pending',
              priority: 'medium',
              tags: [],
              dependencies: [],
              subtasks: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          metadata: {
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          },
        },
      })
    )
  }),

  // Mock POST tasks endpoint
  rest.post('/api/tasks', async (req, res, ctx) => {
    const body = await req.json()
    const newTask: Task = {
      id: Math.floor(Math.random() * 1000) + 100,
      title: body.title,
      description: body.description,
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      tags: body.tags || [],
      dependencies: body.dependencies || [],
      subtasks: [],
      assignedTo: body.assignedTo,
      dueDate: body.dueDate,
      estimatedHours: body.estimatedHours,
      details: body.details,
      testStrategy: body.testStrategy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return res(
      ctx.json({
        task: newTask,
        metadata: {
          createdAt: newTask.createdAt,
          createdBy: 'test-user',
          taskNumber: newTask.id.toString(),
        },
      })
    )
  })
)

// Enable API mocking before tests
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
)

describe('Task Creation Integration Tests', () => {
  describe('Happy Path', () => {
    it('should create a task successfully with optimistic updates', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskBoardManager repositoryPath="/test/repo" projectTag="test-project" />
        </TestWrapper>
      )

      // Wait for initial data to load
      await waitFor(() => {
        expect(screen.getByText('Existing Task')).toBeInTheDocument()
      })

      // Click the Add Task button
      const addButton = screen.getByRole('button', { name: /add task/i })
      await user.click(addButton)

      // Modal should open
      expect(screen.getByText('Create New Task')).toBeInTheDocument()

      // Fill in the form
      const titleInput = screen.getByLabelText(/title/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      const prioritySelect = screen.getByLabelText(/priority/i)

      await user.type(titleInput, 'New Integration Test Task')
      await user.type(descriptionInput, 'This is a task created during integration testing')
      await user.selectOptions(prioritySelect, 'high')

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      // Task should appear immediately with optimistic update
      const newTaskCard = await screen.findByText('New Integration Test Task')
      expect(newTaskCard).toBeInTheDocument()

      // Check for optimistic update indicators
      const taskElement = newTaskCard.closest('[class*="bg-gradient"]')
      expect(taskElement).toHaveClass('animate-pulse')
      expect(screen.getByText('Saving...')).toBeInTheDocument()

      // Wait for server response and update
      await waitFor(() => {
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
      }, { timeout: 2000 })

      // Task should still be visible but without optimistic indicators
      expect(screen.getByText('New Integration Test Task')).toBeInTheDocument()
      
      // Success notification should appear
      expect(screen.getByText(/task.*created successfully/i)).toBeInTheDocument()

      // Modal should be closed
      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument()
    })

    it('should handle multiple task creations in quick succession', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskBoardManager repositoryPath="/test/repo" projectTag="test-project" />
        </TestWrapper>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Existing Task')).toBeInTheDocument()
      })

      // Create first task
      const addButton = screen.getByRole('button', { name: /add task/i })
      await user.click(addButton)

      await user.type(screen.getByLabelText(/title/i), 'First Task')
      await user.type(screen.getByLabelText(/description/i), 'First task description with enough characters')
      await user.click(screen.getByRole('button', { name: /create task/i }))

      // Immediately create second task
      await user.click(addButton)
      await user.type(screen.getByLabelText(/title/i), 'Second Task')
      await user.type(screen.getByLabelText(/description/i), 'Second task description with enough characters')
      await user.click(screen.getByRole('button', { name: /create task/i }))

      // Both tasks should appear with optimistic updates
      expect(await screen.findByText('First Task')).toBeInTheDocument()
      expect(await screen.findByText('Second Task')).toBeInTheDocument()

      // Wait for both to complete
      await waitFor(() => {
        expect(screen.queryAllByText('Saving...').length).toBe(0)
      }, { timeout: 3000 })

      // Both tasks should remain visible
      expect(screen.getByText('First Task')).toBeInTheDocument()
      expect(screen.getByText('Second Task')).toBeInTheDocument()
    })
  })

  describe('Error Scenarios', () => {
    it('should rollback optimistic update on server error', async () => {
      // Override the handler to return an error
      server.use(
        rest.post('/api/tasks', (_req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Task title already exists',
              },
            })
          )
        })
      )

      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskBoardManager repositoryPath="/test/repo" projectTag="test-project" />
        </TestWrapper>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Existing Task')).toBeInTheDocument()
      })

      // Create a task
      const addButton = screen.getByRole('button', { name: /add task/i })
      await user.click(addButton)

      await user.type(screen.getByLabelText(/title/i), 'Duplicate Task')
      await user.type(screen.getByLabelText(/description/i), 'This task will fail to create on the server')
      await user.click(screen.getByRole('button', { name: /create task/i }))

      // Task should appear optimistically
      expect(await screen.findByText('Duplicate Task')).toBeInTheDocument()
      expect(screen.getByText('Saving...')).toBeInTheDocument()

      // Wait for error and rollback
      await waitFor(() => {
        expect(screen.queryByText('Duplicate Task')).not.toBeInTheDocument()
      }, { timeout: 2000 })

      // Error notification should appear
      expect(screen.getByText(/task title already exists/i)).toBeInTheDocument()

      // Modal should remain open for retry
      expect(screen.getByText('Create New Task')).toBeInTheDocument()
      
      // Form data should be preserved
      expect(screen.getByLabelText(/title/i)).toHaveValue('Duplicate Task')
    })

    it('should handle network errors gracefully', async () => {
      // Override to simulate network error
      server.use(
        rest.post('/api/tasks', (_req, res, _ctx) => {
          return res.networkError('Failed to connect')
        })
      )

      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskBoardManager repositoryPath="/test/repo" projectTag="test-project" />
        </TestWrapper>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Existing Task')).toBeInTheDocument()
      })

      // Create a task
      const addButton = screen.getByRole('button', { name: /add task/i })
      await user.click(addButton)

      await user.type(screen.getByLabelText(/title/i), 'Network Error Task')
      await user.type(screen.getByLabelText(/description/i), 'This task will fail due to network error')
      await user.click(screen.getByRole('button', { name: /create task/i }))

      // Task should appear optimistically
      expect(await screen.findByText('Network Error Task')).toBeInTheDocument()

      // Wait for error and rollback
      await waitFor(() => {
        expect(screen.queryByText('Network Error Task')).not.toBeInTheDocument()
      }, { timeout: 2000 })

      // Error notification should appear
      expect(screen.getByText(/failed to create task/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should validate required fields before submission', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskBoardManager repositoryPath="/test/repo" projectTag="test-project" />
        </TestWrapper>
      )

      // Open modal
      const addButton = screen.getByRole('button', { name: /add task/i })
      await user.click(addButton)

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)

      // Validation errors should appear
      expect(await screen.findByText('Title is required')).toBeInTheDocument()
      expect(screen.getByText('Description is required')).toBeInTheDocument()

      // No optimistic task should be created
      expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
    })

    it('should validate field constraints', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskBoardManager repositoryPath="/test/repo" projectTag="test-project" />
        </TestWrapper>
      )

      // Open modal
      const addButton = screen.getByRole('button', { name: /add task/i })
      await user.click(addButton)

      // Enter invalid data
      await user.type(screen.getByLabelText(/title/i), 'AB') // Too short
      await user.type(screen.getByLabelText(/description/i), 'Too short') // Less than 10 chars
      
      // Try to submit
      await user.click(screen.getByRole('button', { name: /create task/i }))

      // Validation errors should appear
      expect(await screen.findByText(/title must be at least 3 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument()
    })
  })

  describe('Task Board Updates', () => {
    it('should place new tasks in correct column based on status', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskBoardManager repositoryPath="/test/repo" projectTag="test-project" />
        </TestWrapper>
      )

      // Wait for board to load
      await waitFor(() => {
        expect(screen.getByText('Existing Task')).toBeInTheDocument()
      })

      // Create task with in-progress status
      const addButton = screen.getByRole('button', { name: /add task/i })
      await user.click(addButton)

      await user.type(screen.getByLabelText(/title/i), 'In Progress Task')
      await user.type(screen.getByLabelText(/description/i), 'This task should appear in the In Progress column')
      await user.selectOptions(screen.getByLabelText(/status/i), 'in-progress')
      await user.click(screen.getByRole('button', { name: /create task/i }))

      // Find the In Progress column
      const inProgressColumn = screen.getByText('In Progress').closest('[class*="kanban-column"]')
      expect(inProgressColumn).toBeTruthy()

      // Task should appear in the correct column
      await waitFor(() => {
        const taskInColumn = within(inProgressColumn!).getByText('In Progress Task')
        expect(taskInColumn).toBeInTheDocument()
      })
    })

    it('should update task count after creation', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TaskBoardManager repositoryPath="/test/repo" projectTag="test-project" showDevTools={true} />
        </TestWrapper>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Existing Task')).toBeInTheDocument()
      })

      // Check initial task count
      const devTools = screen.getByText(/Tasks:/i).parentElement
      expect(devTools?.textContent).toContain('Tasks: 1')

      // Create a new task
      const addButton = screen.getByRole('button', { name: /add task/i })
      await user.click(addButton)

      await user.type(screen.getByLabelText(/title/i), 'Task Count Test')
      await user.type(screen.getByLabelText(/description/i), 'Testing if task count updates correctly')
      await user.click(screen.getByRole('button', { name: /create task/i }))

      // Wait for task creation to complete
      await waitFor(() => {
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
      }, { timeout: 2000 })

      // Task count should be updated
      expect(devTools?.textContent).toContain('Tasks: 2')
    })
  })
})