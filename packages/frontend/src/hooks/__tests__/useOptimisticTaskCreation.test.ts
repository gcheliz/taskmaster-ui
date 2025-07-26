import { renderHook, act } from '@testing-library/react'
import { useOptimisticTaskCreation } from '../useOptimisticTaskCreation'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { Task, TaskBoardData } from '../../types/task'

// Mock the task service
vi.mock('../../services/taskService', () => ({
  taskService: {
    createTask: vi.fn(),
  }
}))

// Import after mocking
import { taskService } from '../../services/taskService'

describe('useOptimisticTaskCreation', () => {
  const mockTaskService = taskService

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockTaskData: Partial<Task> = {
    title: 'Test Task',
    description: 'Test task description',
    status: 'pending',
    priority: 'medium',
    tags: ['test'],
    dependencies: [],
  }

  const mockBoardData: TaskBoardData = {
    columns: [
      { id: 'pending', title: 'Pending', status: 'pending', tasks: [] },
      { id: 'in-progress', title: 'In Progress', status: 'in-progress', tasks: [] },
      { id: 'done', title: 'Done', status: 'done', tasks: [] },
      { id: 'blocked', title: 'Blocked', status: 'blocked', tasks: [] },
    ],
    tasks: [],
    metadata: {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
  }

  describe('Optimistic Updates', () => {
    it('should create task with temporary negative ID', async () => {
      const onCreateSuccess = vi.fn()
      const { result } = renderHook(() =>
        useOptimisticTaskCreation({
          repositoryPath: '/test/repo',
          onCreateSuccess,
          optimisticUpdates: true,
        })
      )

      // Mock successful creation
      const serverTask: Task = {
        id: 123,
        ...mockTaskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Task

      vi.mocked(mockTaskService.createTask).mockResolvedValue(serverTask)

      let createdBoardData: TaskBoardData | null = null

      await act(async () => {
        const { boardData } = await result.current.createTaskOptimistically(
          mockTaskData,
          mockBoardData
        )
        createdBoardData = boardData
      })

      // After server response, the board should have the server task
      expect(createdBoardData).toBeTruthy()
      expect(createdBoardData!.tasks).toHaveLength(1)
      
      const finalTask = createdBoardData!.tasks[0]
      expect(finalTask.id).toBe(123) // Server ID after replacement
      expect(finalTask.title).toBe('Test Task')
      expect(!('_optimistic' in finalTask)).toBe(true) // No longer optimistic

      // Check task was added to correct column
      const pendingColumn = createdBoardData!.columns.find(col => col.status === 'pending')
      expect(pendingColumn!.tasks).toHaveLength(1)
      expect(pendingColumn!.tasks[0].id).toBe(finalTask.id)
    })

    it('should replace temporary task with server response', async () => {
      const { result } = renderHook(() =>
        useOptimisticTaskCreation({
          repositoryPath: '/test/repo',
          optimisticUpdates: true,
        })
      )

      const serverTask: Task = {
        id: 456,
        ...mockTaskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Task

      vi.mocked(mockTaskService.createTask).mockResolvedValue(serverTask)

      let finalBoardData: TaskBoardData | null = null
      let returnedTask: Task | null = null

      await act(async () => {
        const { boardData, task } = await result.current.createTaskOptimistically(
          mockTaskData,
          mockBoardData
        )
        finalBoardData = boardData
        returnedTask = task
      })

      // Server task should be returned
      expect(returnedTask).toEqual(serverTask)
      expect(returnedTask!.id).toBe(456)

      // Board should have the real task, not the temporary one
      expect(finalBoardData!.tasks).toHaveLength(1)
      expect(finalBoardData!.tasks[0].id).toBe(456)
      expect('_optimistic' in finalBoardData!.tasks[0] ? finalBoardData!.tasks[0]._optimistic : undefined).toBeUndefined()
    })

    it('should remove optimistic task on error', async () => {
      const onCreateError = vi.fn()
      const { result } = renderHook(() =>
        useOptimisticTaskCreation({
          repositoryPath: '/test/repo',
          onCreateError,
          optimisticUpdates: true,
        })
      )

      vi.mocked(mockTaskService.createTask).mockRejectedValue(new Error('Failed to create task'))

      let finalBoardData: TaskBoardData | null = null
      let returnedTask: Task | null = null

      await act(async () => {
        const { boardData, task } = await result.current.createTaskOptimistically(
          mockTaskData,
          mockBoardData
        )
        finalBoardData = boardData
        returnedTask = task
      })

      // Task creation should fail
      expect(returnedTask).toBeNull()
      expect(onCreateError).toHaveBeenCalledWith('Failed to create task')

      // Board should be empty (optimistic task removed)
      expect(finalBoardData!.tasks).toHaveLength(0)
      expect(finalBoardData!.columns[0].tasks).toHaveLength(0)
    })

    it('should handle null board data', async () => {
      const { result } = renderHook(() =>
        useOptimisticTaskCreation({
          repositoryPath: '/test/repo',
          optimisticUpdates: true,
        })
      )

      const serverTask: Task = {
        id: 789,
        ...mockTaskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Task

      vi.mocked(mockTaskService.createTask).mockResolvedValue(serverTask)

      let createdBoardData: TaskBoardData | null = null

      await act(async () => {
        const { boardData } = await result.current.createTaskOptimistically(
          mockTaskData,
          null // No existing board data
        )
        createdBoardData = boardData
      })

      // Should create minimal board structure
      expect(createdBoardData).toBeTruthy()
      expect(createdBoardData!.columns).toHaveLength(4)
      expect(createdBoardData!.tasks).toHaveLength(1)
      expect(createdBoardData!.tasks[0].id).toBe(789)
    })
  })

  describe('Non-Optimistic Mode', () => {
    it('should not update board when optimistic updates disabled', async () => {
      const { result } = renderHook(() =>
        useOptimisticTaskCreation({
          repositoryPath: '/test/repo',
          optimisticUpdates: false,
        })
      )

      const serverTask: Task = {
        id: 999,
        ...mockTaskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Task

      vi.mocked(mockTaskService.createTask).mockResolvedValue(serverTask)

      let returnedBoardData: TaskBoardData | null = null
      let returnedTask: Task | null = null

      await act(async () => {
        const { boardData, task } = await result.current.createTaskOptimistically(
          mockTaskData,
          mockBoardData
        )
        returnedBoardData = boardData
        returnedTask = task
      })

      // Should return null board data (no optimistic update)
      expect(returnedBoardData).toBeNull()
      // But should return the created task
      expect(returnedTask).toEqual(serverTask)
    })
  })

  describe('Error Handling', () => {
    it('should set and clear error state', async () => {
      const { result } = renderHook(() =>
        useOptimisticTaskCreation({
          repositoryPath: '/test/repo',
        })
      )

      vi.mocked(mockTaskService.createTask).mockRejectedValue(new Error('Failed to create task'))

      // Initial state
      expect(result.current.createError).toBeNull()
      expect(result.current.isCreating).toBe(false)

      await act(async () => {
        await result.current.createTaskOptimistically(mockTaskData, mockBoardData)
      })

      // Error state
      expect(result.current.createError).toBe('Failed to create task')
      expect(result.current.isCreating).toBe(false)

      // Clear error
      act(() => {
        result.current.clearCreateError()
      })

      expect(result.current.createError).toBeNull()
    })

    it('should handle API error objects', async () => {
      const { result } = renderHook(() =>
        useOptimisticTaskCreation({
          repositoryPath: '/test/repo',
        })
      )

      const apiError = {
        code: 'VALIDATION_ERROR',
        message: 'Title already exists',
        status: 400,
      }

      vi.mocked(mockTaskService.createTask).mockRejectedValue(apiError)

      await act(async () => {
        await result.current.createTaskOptimistically(mockTaskData, mockBoardData)
      })

      expect(result.current.createError).toBe('Failed to create task')
    })
  })

  describe('Loading State', () => {
    it('should manage loading state correctly', async () => {
      const { result } = renderHook(() =>
        useOptimisticTaskCreation({
          repositoryPath: '/test/repo',
        })
      )

      const serverTask: Task = {
        id: 111,
        ...mockTaskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Task

      // Add delay to observe loading state
      vi.mocked(mockTaskService.createTask).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(serverTask), 100))
      )

      expect(result.current.isCreating).toBe(false)

      await act(async () => {
        await result.current.createTaskOptimistically(mockTaskData, mockBoardData)
      })

      // After completion, should not be creating anymore
      expect(result.current.isCreating).toBe(false)
    })
  })

  describe('Task Placement', () => {
    it('should place task in correct column based on status', async () => {
      const { result } = renderHook(() =>
        useOptimisticTaskCreation({
          repositoryPath: '/test/repo',
          optimisticUpdates: true,
        })
      )

      const inProgressTask: Partial<Task> = {
        ...mockTaskData,
        status: 'in-progress',
      }

      const serverTask: Task = {
        id: 222,
        ...inProgressTask,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Task

      vi.mocked(mockTaskService.createTask).mockResolvedValue(serverTask)

      let createdBoardData: TaskBoardData | null = null

      await act(async () => {
        const { boardData } = await result.current.createTaskOptimistically(
          inProgressTask,
          mockBoardData
        )
        createdBoardData = boardData
      })

      // Task should be in the in-progress column
      const inProgressColumn = createdBoardData!.columns.find(col => col.status === 'in-progress')
      expect(inProgressColumn!.tasks).toHaveLength(1)
      expect(inProgressColumn!.tasks[0].status).toBe('in-progress')

      // Other columns should be empty
      const pendingColumn = createdBoardData!.columns.find(col => col.status === 'pending')
      expect(pendingColumn!.tasks).toHaveLength(0)
    })
  })

  describe('Callbacks', () => {
    it('should call onCreateSuccess with created task', async () => {
      const onCreateSuccess = vi.fn()
      const { result } = renderHook(() =>
        useOptimisticTaskCreation({
          repositoryPath: '/test/repo',
          onCreateSuccess,
        })
      )

      const serverTask: Task = {
        id: 333,
        ...mockTaskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Task

      vi.mocked(mockTaskService.createTask).mockResolvedValue(serverTask)

      await act(async () => {
        await result.current.createTaskOptimistically(mockTaskData, mockBoardData)
      })

      expect(onCreateSuccess).toHaveBeenCalledTimes(1)
      expect(onCreateSuccess).toHaveBeenCalledWith(serverTask)
    })

    it('should call onCreateError with error message', async () => {
      const onCreateError = vi.fn()
      const { result } = renderHook(() =>
        useOptimisticTaskCreation({
          repositoryPath: '/test/repo',
          onCreateError,
        })
      )

      vi.mocked(mockTaskService.createTask).mockRejectedValue(new Error('Failed to create task'))

      await act(async () => {
        await result.current.createTaskOptimistically(mockTaskData, mockBoardData)
      })

      expect(onCreateError).toHaveBeenCalledTimes(1)
      expect(onCreateError).toHaveBeenCalledWith('Failed to create task')
    })
  })
})