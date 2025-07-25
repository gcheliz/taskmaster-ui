import { useState, useCallback, useMemo } from 'react'
import type { Task } from '../../../../types/task'

export interface UseTaskDependenciesOptions {
  availableTasks: Task[]
  currentTaskId?: number
}

export interface UseTaskDependenciesReturn {
  dependencies: number[]
  availableForDependency: Task[]
  addDependency: (taskId: number) => void
  removeDependency: (taskId: number) => void
  toggleDependency: (taskId: number) => void
  setDependencies: (dependencies: number[]) => void
  validateDependencies: () => string | undefined
  hasCyclicDependency: (taskId: number) => boolean
}

/**
 * Hook for managing task dependencies
 * Handles dependency selection, validation, and cycle detection
 */
export function useTaskDependencies({
  availableTasks,
  currentTaskId,
}: UseTaskDependenciesOptions): UseTaskDependenciesReturn {
  const [dependencies, setDependencies] = useState<number[]>([])

  // Filter out tasks that cannot be dependencies
  const availableForDependency = useMemo(() => {
    return availableTasks.filter((task) => {
      // Cannot depend on itself
      if (task.id === currentTaskId) return false
      
      // Cannot depend on completed tasks (optional rule)
      // if (task.status === 'done') return false
      
      // Cannot create circular dependencies
      if (currentTaskId && wouldCreateCycle(task.id, currentTaskId, availableTasks)) {
        return false
      }
      
      return true
    })
  }, [availableTasks, currentTaskId])

  const addDependency = useCallback((taskId: number) => {
    setDependencies((prev) => {
      if (prev.includes(taskId)) return prev
      return [...prev, taskId]
    })
  }, [])

  const removeDependency = useCallback((taskId: number) => {
    setDependencies((prev) => prev.filter((id) => id !== taskId))
  }, [])

  const toggleDependency = useCallback((taskId: number) => {
    setDependencies((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId)
      }
      return [...prev, taskId]
    })
  }, [])

  const hasCyclicDependency = useCallback(
    (taskId: number): boolean => {
      if (!currentTaskId) return false
      return wouldCreateCycle(taskId, currentTaskId, availableTasks)
    },
    [currentTaskId, availableTasks]
  )

  const validateDependencies = useCallback((): string | undefined => {
    // Check if all dependencies still exist
    const missingDeps = dependencies.filter(
      (depId) => !availableTasks.some((task) => task.id === depId)
    )
    
    if (missingDeps.length > 0) {
      return `Some dependencies no longer exist: ${missingDeps.join(', ')}`
    }

    // Check for circular dependencies
    if (currentTaskId) {
      for (const depId of dependencies) {
        if (wouldCreateCycle(depId, currentTaskId, availableTasks)) {
          return 'Circular dependency detected'
        }
      }
    }

    return undefined
  }, [dependencies, availableTasks, currentTaskId])

  return {
    dependencies,
    availableForDependency,
    addDependency,
    removeDependency,
    toggleDependency,
    setDependencies,
    validateDependencies,
    hasCyclicDependency,
  }
}

/**
 * Check if adding a dependency would create a cycle
 */
function wouldCreateCycle(
  dependencyId: number,
  taskId: number,
  allTasks: Task[]
): boolean {
  const visited = new Set<number>()
  const recursionStack = new Set<number>()

  function hasCycle(currentId: number): boolean {
    visited.add(currentId)
    recursionStack.add(currentId)

    const currentTask = allTasks.find((t) => t.id === currentId)
    const dependencies = currentTask?.dependencies || []

    // If we're checking if taskId can depend on dependencyId,
    // simulate that dependency
    if (currentId === dependencyId) {
      dependencies.push(taskId)
    }

    for (const depId of dependencies) {
      if (!visited.has(depId)) {
        if (hasCycle(depId)) return true
      } else if (recursionStack.has(depId)) {
        return true
      }
    }

    recursionStack.delete(currentId)
    return false
  }

  return hasCycle(dependencyId)
}