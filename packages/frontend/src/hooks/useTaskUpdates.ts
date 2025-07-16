import { useCallback, useState } from 'react';
import type { Task, TaskStatus, TaskBoardData } from '../types/task';
import { taskService } from '../services/taskService';
import { ApiError } from '../services/api';

export interface UseTaskUpdatesOptions {
  /** Project ID for task updates */
  projectId?: string;
  /** Callback when update completes successfully */
  onUpdateSuccess?: (task: Task) => void;
  /** Callback when update fails */
  onUpdateError?: (error: string) => void;
  /** Whether to enable optimistic updates */
  optimisticUpdates?: boolean;
}

export interface UseTaskUpdatesReturn {
  /** Whether an update is in progress */
  isUpdating: boolean;
  /** Update error if any */
  updateError: string | null;
  /** Update task status with optimistic update */
  updateTaskStatus: (
    taskId: number,
    newStatus: TaskStatus,
    currentBoardData: TaskBoardData
  ) => Promise<TaskBoardData | null>;
  /** Update task with optimistic update */
  updateTask: (
    taskId: number,
    updates: Partial<Task>,
    currentBoardData: TaskBoardData
  ) => Promise<TaskBoardData | null>;
  /** Clear update error */
  clearUpdateError: () => void;
}

/**
 * Hook for managing task updates with optimistic updates
 */
export function useTaskUpdates(options: UseTaskUpdatesOptions = {}): UseTaskUpdatesReturn {
  const {
    projectId,
    onUpdateSuccess,
    onUpdateError,
    optimisticUpdates = true
  } = options;

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  /**
   * Apply optimistic update to task board data
   */
  const applyOptimisticUpdate = useCallback((
    boardData: TaskBoardData,
    taskId: number,
    updates: Partial<Task>
  ): TaskBoardData => {
    const newColumns = boardData.columns.map(column => {
      const newTasks = column.tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, ...updates, updatedAt: new Date().toISOString() };
        }
        return task;
      });
      return { ...column, tasks: newTasks };
    });

    // If status changed, move task between columns
    if (updates.status) {
      const sourceColumn = newColumns.find(col => 
        col.tasks.some(task => task.id === taskId)
      );
      const targetColumn = newColumns.find(col => col.status === updates.status);
      
      if (sourceColumn && targetColumn && sourceColumn !== targetColumn) {
        // Remove from source column
        sourceColumn.tasks = sourceColumn.tasks.filter(task => task.id !== taskId);
        
        // Add to target column
        const taskToMove = boardData.tasks.find(task => task.id === taskId);
        if (taskToMove) {
          const updatedTask = { ...taskToMove, ...updates, updatedAt: new Date().toISOString() };
          targetColumn.tasks.push(updatedTask);
        }
      }
    }

    // Update the global tasks array
    const newTasks = boardData.tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, ...updates, updatedAt: new Date().toISOString() };
      }
      return task;
    });

    return {
      ...boardData,
      columns: newColumns,
      tasks: newTasks,
      metadata: {
        ...boardData.metadata,
        updated: new Date().toISOString()
      }
    };
  }, []);

  /**
   * Revert optimistic update in case of error
   */
  const revertOptimisticUpdate = useCallback((
    originalBoardData: TaskBoardData
  ): TaskBoardData => {
    // For now, just return the original data
    // In a more sophisticated implementation, we could store the previous state
    return originalBoardData;
  }, []);

  /**
   * Update task status
   */
  const updateTaskStatus = useCallback(async (
    taskId: number,
    newStatus: TaskStatus,
    currentBoardData: TaskBoardData
  ): Promise<TaskBoardData | null> => {
    const originalBoardData = currentBoardData;
    let optimisticBoardData = currentBoardData;

    // Apply optimistic update if enabled
    if (optimisticUpdates) {
      optimisticBoardData = applyOptimisticUpdate(currentBoardData, taskId, {
        status: newStatus
      });
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const updatedTask = await taskService.updateTaskStatus(taskId, newStatus, projectId);
      
      // Success callback
      onUpdateSuccess?.(updatedTask);
      
      // Return the optimistic update or create a new board data with the server response
      if (optimisticUpdates) {
        return optimisticBoardData;
      } else {
        return applyOptimisticUpdate(currentBoardData, taskId, updatedTask);
      }
      
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to update task status';
      setUpdateError(errorMessage);
      onUpdateError?.(errorMessage);
      
      // Revert optimistic update on error
      if (optimisticUpdates) {
        return revertOptimisticUpdate(originalBoardData);
      }
      
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [projectId, optimisticUpdates, applyOptimisticUpdate, revertOptimisticUpdate, onUpdateSuccess, onUpdateError]);

  /**
   * Update task
   */
  const updateTask = useCallback(async (
    taskId: number,
    updates: Partial<Task>,
    currentBoardData: TaskBoardData
  ): Promise<TaskBoardData | null> => {
    const originalBoardData = currentBoardData;
    let optimisticBoardData = currentBoardData;

    // Apply optimistic update if enabled
    if (optimisticUpdates) {
      optimisticBoardData = applyOptimisticUpdate(currentBoardData, taskId, updates);
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const updatedTask = await taskService.updateTask(taskId, updates, projectId);
      
      // Success callback
      onUpdateSuccess?.(updatedTask);
      
      // Return the optimistic update or create a new board data with the server response
      if (optimisticUpdates) {
        return optimisticBoardData;
      } else {
        return applyOptimisticUpdate(currentBoardData, taskId, updatedTask);
      }
      
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to update task';
      setUpdateError(errorMessage);
      onUpdateError?.(errorMessage);
      
      // Revert optimistic update on error
      if (optimisticUpdates) {
        return revertOptimisticUpdate(originalBoardData);
      }
      
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [projectId, optimisticUpdates, applyOptimisticUpdate, revertOptimisticUpdate, onUpdateSuccess, onUpdateError]);

  /**
   * Clear update error
   */
  const clearUpdateError = useCallback(() => {
    setUpdateError(null);
  }, []);

  return {
    isUpdating,
    updateError,
    updateTaskStatus,
    updateTask,
    clearUpdateError
  };
}