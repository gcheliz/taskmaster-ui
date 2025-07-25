import { useCallback, useState } from 'react'
import type { Task, TaskBoardData } from '../types/task'
import { taskService } from '../services/taskService'
import { ApiError } from '../services/api'

export interface UseOptimisticTaskCreationOptions {
  /** Repository path for task creation */
  repositoryPath?: string
  /** Callback when creation completes successfully */
  onCreateSuccess?: (task: Task) => void
  /** Callback when creation fails */
  onCreateError?: (error: string) => void
  /** Whether to enable optimistic updates */
  optimisticUpdates?: boolean
}

export interface UseOptimisticTaskCreationReturn {
  /** Whether a creation is in progress */
  isCreating: boolean
  /** Creation error if any */
  createError: string | null
  /** Create task with optimistic update */
  createTaskOptimistically: (
    taskData: Partial<Task>,
    currentBoardData: TaskBoardData | null
  ) => Promise<{ boardData: TaskBoardData | null; task: Task | null }>
  /** Clear creation error */
  clearCreateError: () => void
}

/**
 * Hook for managing task creation with optimistic updates
 */
export function useOptimisticTaskCreation(
  options: UseOptimisticTaskCreationOptions = {}
): UseOptimisticTaskCreationReturn {
  const { repositoryPath, onCreateSuccess, onCreateError, optimisticUpdates = true } = options

  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  /**
   * Generate a temporary ID for optimistic task
   */
  const generateTemporaryId = useCallback((): number => {
    // Use a negative timestamp to ensure uniqueness and avoid conflicts with real IDs
    return -Date.now()
  }, [])

  /**
   * Apply optimistic create to task board data
   */
  const applyOptimisticCreate = useCallback(
    (boardData: TaskBoardData | null, newTask: Task): TaskBoardData => {
      if (!boardData) {
        // Create a minimal board data structure if none exists
        return {
          columns: [
            { id: 'pending', title: 'Pending', status: 'pending', tasks: [newTask] },
            { id: 'in-progress', title: 'In Progress', status: 'in-progress', tasks: [] },
            { id: 'done', title: 'Done', status: 'done', tasks: [] },
            { id: 'blocked', title: 'Blocked', status: 'blocked', tasks: [] },
          ],
          tasks: [newTask],
          metadata: {
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          },
        }
      }

      // Find the column for the new task's status
      const targetColumn = boardData.columns.find((col) => col.status === newTask.status)
      
      if (targetColumn) {
        // Add task to the appropriate column
        const newColumns = boardData.columns.map((column) => {
          if (column.status === newTask.status) {
            return {
              ...column,
              tasks: [...column.tasks, newTask],
            }
          }
          return column
        })

        return {
          ...boardData,
          columns: newColumns,
          tasks: [...boardData.tasks, newTask],
          metadata: {
            ...boardData.metadata,
            updated: new Date().toISOString(),
          },
        }
      }

      // Fallback: just add to tasks array if column not found
      return {
        ...boardData,
        tasks: [...boardData.tasks, newTask],
        metadata: {
          ...boardData.metadata,
          updated: new Date().toISOString(),
        },
      }
    },
    []
  )

  /**
   * Remove optimistic task in case of error
   */
  const removeOptimisticTask = useCallback(
    (boardData: TaskBoardData, temporaryId: number): TaskBoardData => {
      const newColumns = boardData.columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== temporaryId),
      }))

      return {
        ...boardData,
        columns: newColumns,
        tasks: boardData.tasks.filter((task) => task.id !== temporaryId),
        metadata: {
          ...boardData.metadata,
          updated: new Date().toISOString(),
        },
      }
    },
    []
  )

  /**
   * Replace temporary task with real task from server
   */
  const replaceTemporaryTask = useCallback(
    (boardData: TaskBoardData, temporaryId: number, realTask: Task): TaskBoardData => {
      const newColumns = boardData.columns.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) => (task.id === temporaryId ? realTask : task)),
      }))

      return {
        ...boardData,
        columns: newColumns,
        tasks: boardData.tasks.map((task) => (task.id === temporaryId ? realTask : task)),
        metadata: {
          ...boardData.metadata,
          updated: new Date().toISOString(),
        },
      }
    },
    []
  )

  /**
   * Create task with optimistic update
   */
  const createTaskOptimistically = useCallback(
    async (
      taskData: Partial<Task>,
      currentBoardData: TaskBoardData | null
    ): Promise<{ boardData: TaskBoardData | null; task: Task | null }> => {
      const temporaryId = generateTemporaryId()
      
      // Create optimistic task with temporary ID
      const optimisticTask: Task = {
        id: temporaryId,
        title: taskData.title || 'New Task',
        description: taskData.description || '',
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        tags: taskData.tags || [],
        dependencies: taskData.dependencies || [],
        subtasks: [],
        assignedTo: taskData.assignedTo,
        dueDate: taskData.dueDate,
        estimatedHours: taskData.estimatedHours,
        details: taskData.details,
        testStrategy: taskData.testStrategy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Add a flag to indicate this is an optimistic task
        _optimistic: true,
      } as Task & { _optimistic: boolean }

      let optimisticBoardData = currentBoardData

      // Apply optimistic update if enabled
      if (optimisticUpdates && currentBoardData) {
        optimisticBoardData = applyOptimisticCreate(currentBoardData, optimisticTask)
      }

      setIsCreating(true)
      setCreateError(null)

      try {
        // Create task on server
        const createdTask = await taskService.createTask(taskData, repositoryPath)

        // Success callback
        onCreateSuccess?.(createdTask)

        if (optimisticUpdates && optimisticBoardData) {
          // Replace temporary task with real task
          const finalBoardData = replaceTemporaryTask(
            optimisticBoardData,
            temporaryId,
            createdTask
          )
          return { boardData: finalBoardData, task: createdTask }
        }

        // If not using optimistic updates, return the created task
        return { boardData: null, task: createdTask }
      } catch (error) {
        const errorMessage =
          error instanceof ApiError ? error.message : 'Failed to create task'
        setCreateError(errorMessage)
        onCreateError?.(errorMessage)

        // Remove optimistic task on error
        if (optimisticUpdates && optimisticBoardData) {
          const revertedBoardData = removeOptimisticTask(optimisticBoardData, temporaryId)
          return { boardData: revertedBoardData, task: null }
        }

        return { boardData: null, task: null }
      } finally {
        setIsCreating(false)
      }
    },
    [
      repositoryPath,
      optimisticUpdates,
      generateTemporaryId,
      applyOptimisticCreate,
      replaceTemporaryTask,
      removeOptimisticTask,
      onCreateSuccess,
      onCreateError,
    ]
  )

  /**
   * Clear creation error
   */
  const clearCreateError = useCallback(() => {
    setCreateError(null)
  }, [])

  return {
    isCreating,
    createError,
    createTaskOptimistically,
    clearCreateError,
  }
}