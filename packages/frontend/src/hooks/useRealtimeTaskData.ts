import { useState, useEffect, useCallback, useRef } from 'react'
import type { TasksData, TaskBoardData, TaskFilters, TaskSortOptions, TaskStatus } from '../types/task'
import { taskService } from '../services/taskService'
import { ApiError } from '../services/api'
import { useWebSocketTaskUpdates, type TaskUpdateHandler } from './useWebSocketTaskUpdates'
import { useNotification } from '../contexts/NotificationContext'

export interface UseRealtimeTaskDataOptions {
  /** Repository path to load tasks from */
  repositoryPath?: string
  /** Project tag to filter tasks */
  projectTag?: string
  /** Initial filters to apply */
  initialFilters?: TaskFilters
  /** Initial sort options */
  initialSort?: TaskSortOptions
  /** Enable real-time updates via WebSocket */
  enableRealtime?: boolean
  /** Auto-load tasks on mount */
  autoLoad?: boolean
  /** Show notifications for real-time updates */
  showNotifications?: boolean
}

export interface UseRealtimeTaskDataReturn {
  /** Task board data organized by columns */
  boardData: TaskBoardData | null
  /** Raw tasks data */
  tasksData: TasksData | null
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: ApiError | null
  /** WebSocket connection state */
  isConnected: boolean
  /** Current filters */
  filters: TaskFilters
  /** Current sort options */
  sortOptions: TaskSortOptions
  /** Refresh tasks from server */
  refresh: () => Promise<void>
  /** Update filters */
  setFilters: (filters: TaskFilters) => void
  /** Update sort options */
  setSortOptions: (sort: TaskSortOptions) => void
  /** Create a new task */
  createTask: (task: any) => Promise<void>
  /** Update a task */
  updateTask: (taskId: string, updates: any) => Promise<void>
  /** Delete a task */
  deleteTask: (taskId: string) => Promise<void>
  /** Move task to different column/position */
  moveTask: (taskId: string, targetColumn: string, targetIndex: number) => Promise<void>
}

export function useRealtimeTaskData(
  options: UseRealtimeTaskDataOptions = {}
): UseRealtimeTaskDataReturn {
  const {
    repositoryPath,
    projectTag,
    initialFilters = {},
    initialSort = { field: 'priority', direction: 'desc' },
    enableRealtime = true,
    autoLoad = true,
    showNotifications = true,
  } = options

  const { showError } = useNotification()

  // State
  const [boardData, setBoardData] = useState<TaskBoardData | null>(null)
  const [tasksData, setTasksData] = useState<TasksData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [filters, setFilters] = useState<TaskFilters>(initialFilters)
  const [sortOptions, setSortOptions] = useState<TaskSortOptions>(initialSort)

  // Refs
  const isMountedRef = useRef(true)

  // Load tasks from server
  const loadTasks = useCallback(async () => {
    if (!repositoryPath) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await taskService.loadTasksFromRepository(repositoryPath, projectTag)

      if (isMountedRef.current) {
        setTasksData(data)

        // Convert to board data
        const board = taskService.createTaskBoard(data, filters, sortOptions)
        setBoardData(board)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const apiError = err as ApiError
        setError(apiError)
        showError(apiError.message || 'Failed to load tasks')
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [repositoryPath, projectTag, filters, sortOptions, showError])

  // WebSocket handlers
  const taskUpdateHandlers: TaskUpdateHandler = {
    onTasksUpdated: useCallback(
      (repoPath: string, tasks: any) => {
        if (repoPath === repositoryPath && isMountedRef.current) {
          setTasksData(tasks)
          const board = taskService.createTaskBoard(tasks, filters, sortOptions)
          setBoardData(board)
        }
      },
      [repositoryPath, filters, sortOptions]
    ),
    onTasksError: useCallback(
      (repoPath: string, errorMsg: string) => {
        if (repoPath === repositoryPath) {
          showError(`Task sync error: ${errorMsg}`)
        }
      },
      [repositoryPath, showError]
    ),
  }

  // Setup WebSocket connection
  const { isConnected } = useWebSocketTaskUpdates(taskUpdateHandlers, {
    repositoryPath,
    showNotifications,
    enableLogging: process.env.NODE_ENV === 'development',
  })

  // Auto-load tasks on mount or when key props change
  useEffect(() => {
    if (autoLoad && repositoryPath) {
      loadTasks()
    }
  }, [autoLoad, repositoryPath, loadTasks])

  // Apply filters/sort when they change
  useEffect(() => {
    if (tasksData) {
      const board = taskService.createTaskBoard(tasksData, filters, sortOptions)
      setBoardData(board)
    }
  }, [tasksData, filters, sortOptions])

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Task operations
  const createTask = useCallback(
    async (task: any) => {
      if (!repositoryPath) return

      try {
        await taskService.createTask(task, projectTag)
        if (!enableRealtime) {
          await loadTasks()
        }
      } catch (err) {
        const apiError = err as ApiError
        showError(apiError.message || 'Failed to create task')
        throw err
      }
    },
    [repositoryPath, enableRealtime, loadTasks, showError]
  )

  const updateTask = useCallback(
    async (taskId: string, updates: any) => {
      if (!repositoryPath) return

      try {
        await taskService.updateTask(parseInt(taskId), updates, projectTag)
        if (!enableRealtime) {
          await loadTasks()
        }
      } catch (err) {
        const apiError = err as ApiError
        showError(apiError.message || 'Failed to update task')
        throw err
      }
    },
    [repositoryPath, enableRealtime, loadTasks, showError]
  )

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!repositoryPath) return

      try {
        await taskService.deleteTask(parseInt(taskId), projectTag)
        if (!enableRealtime) {
          await loadTasks()
        }
      } catch (err) {
        const apiError = err as ApiError
        showError(apiError.message || 'Failed to delete task')
        throw err
      }
    },
    [repositoryPath, enableRealtime, loadTasks, showError]
  )

  const moveTask = useCallback(
    async (taskId: string, targetColumn: string, targetIndex: number) => {
      if (!repositoryPath) return

      try {
        // Update task status based on target column
        await taskService.updateTaskStatus(parseInt(taskId), targetColumn as TaskStatus, projectTag)
        if (!enableRealtime) {
          await loadTasks()
        }
      } catch (err) {
        const apiError = err as ApiError
        showError(apiError.message || 'Failed to move task')
        throw err
      }
    },
    [repositoryPath, enableRealtime, loadTasks, showError]
  )

  return {
    boardData,
    tasksData,
    isLoading,
    error,
    isConnected: enableRealtime ? isConnected : false,
    filters,
    sortOptions,
    refresh: loadTasks,
    setFilters,
    setSortOptions,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  }
}
