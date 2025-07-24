import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useRealtimeTaskData } from '../useRealtimeTaskData'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock socket.io-client
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  connected: true,
}

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}))

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useRealtimeTaskData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useRealtimeTaskData(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.tasks).toEqual([])
    expect(result.current.isConnected).toBe(false)
  })

  it('establishes socket connection on mount', () => {
    renderHook(() => useRealtimeTaskData(), {
      wrapper: createWrapper(),
    })

    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('task:created', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('task:updated', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('task:deleted', expect.any(Function))
  })

  it('updates connection status on connect/disconnect', () => {
    const { result } = renderHook(() => useRealtimeTaskData(), {
      wrapper: createWrapper(),
    })

    // Simulate connection
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1]
    act(() => {
      connectHandler?.()
    })

    expect(result.current.isConnected).toBe(true)

    // Simulate disconnection
    const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')?.[1]
    act(() => {
      disconnectHandler?.()
    })

    expect(result.current.isConnected).toBe(false)
  })

  it('handles task creation events', async () => {
    const { result } = renderHook(() => useRealtimeTaskData(), {
      wrapper: createWrapper(),
    })

    const newTask = {
      id: '1',
      title: 'New Task',
      column: 'todo',
      priority: 'high',
    }

    // Get the task:created handler
    const createHandler = mockSocket.on.mock.calls.find(call => call[0] === 'task:created')?.[1]
    
    act(() => {
      createHandler?.(newTask)
    })

    await waitFor(() => {
      expect(result.current.tasks).toContainEqual(expect.objectContaining(newTask))
    })
  })

  it('handles task update events', async () => {
    const { result } = renderHook(() => useRealtimeTaskData(), {
      wrapper: createWrapper(),
    })

    const initialTask = {
      id: '1',
      title: 'Initial Task',
      column: 'todo',
      priority: 'medium',
    }

    // Add initial task
    const createHandler = mockSocket.on.mock.calls.find(call => call[0] === 'task:created')?.[1]
    act(() => {
      createHandler?.(initialTask)
    })

    // Update task
    const updatedTask = { ...initialTask, title: 'Updated Task', column: 'in-progress' }
    const updateHandler = mockSocket.on.mock.calls.find(call => call[0] === 'task:updated')?.[1]
    
    act(() => {
      updateHandler?.(updatedTask)
    })

    await waitFor(() => {
      const task = result.current.tasks.find(t => t.id === '1')
      expect(task?.title).toBe('Updated Task')
      expect(task?.column).toBe('in-progress')
    })
  })

  it('handles task deletion events', async () => {
    const { result } = renderHook(() => useRealtimeTaskData(), {
      wrapper: createWrapper(),
    })

    const task = {
      id: '1',
      title: 'Task to Delete',
      column: 'todo',
    }

    // Add task
    const createHandler = mockSocket.on.mock.calls.find(call => call[0] === 'task:created')?.[1]
    act(() => {
      createHandler?.(task)
    })

    // Delete task
    const deleteHandler = mockSocket.on.mock.calls.find(call => call[0] === 'task:deleted')?.[1]
    act(() => {
      deleteHandler?.({ id: '1' })
    })

    await waitFor(() => {
      expect(result.current.tasks).not.toContainEqual(expect.objectContaining({ id: '1' }))
    })
  })

  it('emits events when updating tasks', () => {
    const { result } = renderHook(() => useRealtimeTaskData(), {
      wrapper: createWrapper(),
    })

    const taskUpdate = {
      id: '1',
      column: 'done',
    }

    act(() => {
      result.current.updateTask('1', taskUpdate)
    })

    expect(mockSocket.emit).toHaveBeenCalledWith('task:update', {
      id: '1',
      updates: taskUpdate,
    })
  })

  it('emits events when creating tasks', () => {
    const { result } = renderHook(() => useRealtimeTaskData(), {
      wrapper: createWrapper(),
    })

    const newTask = {
      title: 'New Task',
      column: 'todo',
      priority: 'high',
    }

    act(() => {
      result.current.createTask(newTask)
    })

    expect(mockSocket.emit).toHaveBeenCalledWith('task:create', newTask)
  })

  it('emits events when deleting tasks', () => {
    const { result } = renderHook(() => useRealtimeTaskData(), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.deleteTask('1')
    })

    expect(mockSocket.emit).toHaveBeenCalledWith('task:delete', { id: '1' })
  })

  it('cleans up socket listeners on unmount', () => {
    const { unmount } = renderHook(() => useRealtimeTaskData(), {
      wrapper: createWrapper(),
    })

    unmount()

    expect(mockSocket.off).toHaveBeenCalledWith('connect', expect.any(Function))
    expect(mockSocket.off).toHaveBeenCalledWith('disconnect', expect.any(Function))
    expect(mockSocket.off).toHaveBeenCalledWith('task:created', expect.any(Function))
    expect(mockSocket.off).toHaveBeenCalledWith('task:updated', expect.any(Function))
    expect(mockSocket.off).toHaveBeenCalledWith('task:deleted', expect.any(Function))
    expect(mockSocket.disconnect).toHaveBeenCalled()
  })

  it('handles connection errors gracefully', async () => {
    const { result } = renderHook(() => useRealtimeTaskData(), {
      wrapper: createWrapper(),
    })

    // Simulate connection error
    const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error')?.[1]
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    act(() => {
      errorHandler?.(new Error('Connection failed'))
    })

    expect(result.current.isConnected).toBe(false)
    expect(consoleErrorSpy).toHaveBeenCalledWith('Socket connection error:', expect.any(Error))
    
    consoleErrorSpy.mockRestore()
  })
})