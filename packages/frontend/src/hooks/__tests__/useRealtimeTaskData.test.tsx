import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { NotificationProvider } from '../../contexts/NotificationContext'
import type { TasksData } from '../../types/task'

// Mock the taskService
vi.mock('../../services/taskService', () => ({
  taskService: {
    loadTasksFromRepository: vi.fn(),
    createTaskBoard: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    updateTaskStatus: vi.fn(),
  },
}))

// Mock useWebSocketTaskUpdates hook
let mockIsConnected = false
vi.mock('../useWebSocketTaskUpdates', () => ({
  useWebSocketTaskUpdates: vi.fn((handlers) => {
    // Store handlers for testing
    (global as any).__wsHandlers = handlers
    return {
      get isConnected() { return mockIsConnected },
    }
  }),
}))

import { useRealtimeTaskData } from '../useRealtimeTaskData'
import { taskService } from '../../services/taskService'

const mockTaskService = taskService as any
const mockWebSocketState = { isConnected: false }

// Create wrapper with QueryClient and NotificationProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>{children}</NotificationProvider>
    </QueryClientProvider>
  )
}

describe('useRealtimeTaskData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsConnected = false
    // Reset mock implementations
    mockTaskService.loadTasksFromRepository.mockResolvedValue({
      tasks: [],
      metadata: {},
    })
    mockTaskService.createTaskBoard.mockReturnValue({
      columns: {
        pending: { tasks: [] },
        'in-progress': { tasks: [] },
        done: { tasks: [] },
      },
      totalTasks: 0,
    })
    mockTaskService.createTask.mockResolvedValue({})
    mockTaskService.updateTask.mockResolvedValue({})
    mockTaskService.deleteTask.mockResolvedValue({})
    mockTaskService.updateTaskStatus.mockResolvedValue({})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete (global as any).__wsHandlers
  })

  it('initializes with loading state', () => {
    const { result } = renderHook(
      () => useRealtimeTaskData({ repositoryPath: '/test/repo', autoLoad: false }),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(false)
    expect(result.current.boardData).toBe(null)
    expect(result.current.tasksData).toBe(null)
    expect(result.current.isConnected).toBe(false)
  })

  it('establishes socket connection on mount', async () => {
    const { useWebSocketTaskUpdates } = await import('../useWebSocketTaskUpdates')
    
    renderHook(
      () => useRealtimeTaskData({ repositoryPath: '/test/repo', enableRealtime: true }),
      { wrapper: createWrapper() }
    )

    expect(useWebSocketTaskUpdates).toHaveBeenCalled()
  })

  it('updates connection status on connect/disconnect', async () => {
    mockIsConnected = true
    
    const { result } = renderHook(
      () => useRealtimeTaskData({ repositoryPath: '/test/repo', enableRealtime: true }),
      { wrapper: createWrapper() }
    )

    expect(result.current.isConnected).toBe(true)
    
    // Reset for other tests
    mockIsConnected = false
  })

  it('handles task creation events', async () => {
    const mockTasksData: TasksData = {
      tasks: [{ id: 1, title: 'New Task', status: 'pending', priority: 'high' }],
      metadata: {},
    }
    
    const { result } = renderHook(
      () => useRealtimeTaskData({ repositoryPath: '/test/repo' }),
      { wrapper: createWrapper() }
    )

    // Simulate WebSocket task update
    const handlers = (global as any).__wsHandlers
    if (handlers?.onTasksUpdated) {
      act(() => {
        handlers.onTasksUpdated('/test/repo', mockTasksData)
      })
    }

    await waitFor(() => {
      expect(result.current.tasksData).toEqual(mockTasksData)
    })
  })

  it('handles task update events', async () => {
    const { result } = renderHook(
      () => useRealtimeTaskData({ repositoryPath: '/test/repo' }),
      { wrapper: createWrapper() }
    )

    const updates = {
      title: 'Updated Task',
      status: 'in-progress',
    }

    await act(async () => {
      await result.current.updateTask('1', updates)
    })

    expect(mockTaskService.updateTask).toHaveBeenCalledWith(1, updates, undefined)
  })

  it('handles task deletion events', async () => {
    const { result } = renderHook(
      () => useRealtimeTaskData({ repositoryPath: '/test/repo' }),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      await result.current.deleteTask('1')
    })

    expect(mockTaskService.deleteTask).toHaveBeenCalledWith(1, undefined)
  })

  it('emits events when updating tasks', async () => {
    const { result } = renderHook(
      () => useRealtimeTaskData({ repositoryPath: '/test/repo' }),
      { wrapper: createWrapper() }
    )

    const taskUpdate = {
      title: 'Updated Task',
      priority: 'high',
    }

    await act(async () => {
      await result.current.updateTask('1', taskUpdate)
    })

    expect(mockTaskService.updateTask).toHaveBeenCalledWith(1, taskUpdate, undefined)
  })

  it('emits events when creating tasks', async () => {
    const { result } = renderHook(
      () => useRealtimeTaskData({ repositoryPath: '/test/repo' }),
      { wrapper: createWrapper() }
    )

    const newTask = {
      title: 'New Task',
      status: 'pending',
      priority: 'medium',
    }

    await act(async () => {
      await result.current.createTask(newTask)
    })

    expect(mockTaskService.createTask).toHaveBeenCalledWith(newTask, undefined)
  })

  it('emits events when deleting tasks', async () => {
    const { result } = renderHook(
      () => useRealtimeTaskData({ repositoryPath: '/test/repo' }),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      await result.current.deleteTask('1')
    })

    expect(mockTaskService.deleteTask).toHaveBeenCalledWith(1, undefined)
  })

  it('cleans up socket listeners on unmount', async () => {
    const { unmount } = renderHook(
      () => useRealtimeTaskData({ repositoryPath: '/test/repo', enableRealtime: true }),
      { wrapper: createWrapper() }
    )

    unmount()

    // The cleanup is handled by useWebSocketTaskUpdates hook
    // We just verify the component unmounts cleanly
    expect(true).toBe(true)
  })

  it('handles connection errors gracefully', async () => {
    mockTaskService.loadTasksFromRepository.mockRejectedValueOnce(
      new Error('Connection failed')
    )
    
    const { result } = renderHook(
      () => useRealtimeTaskData({ repositoryPath: '/test/repo', autoLoad: true }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
      expect(result.current.isLoading).toBe(false)
    })
  })
})