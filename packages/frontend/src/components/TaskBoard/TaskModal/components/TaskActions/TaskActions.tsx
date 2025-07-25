import React from 'react'
import type { Task, TaskStatus } from '../../../../../types/task'

interface TaskActionsProps {
  /** The task to perform actions on */
  task: Task
  /** Whether actions are currently loading */
  isLoading?: boolean
  /** Whether user has edit permissions */
  canEdit?: boolean
  /** Whether user has delete permissions */
  canDelete?: boolean
  /** Callback for status change */
  onStatusChange?: (taskId: number, status: TaskStatus) => Promise<void>
  /** Callback for task completion */
  onComplete?: (taskId: number) => Promise<void>
  /** Callback for task archiving */
  onArchive?: (taskId: number) => Promise<void>
  /** Callback for task duplication */
  onDuplicate?: (task: Task) => Promise<void>
  /** Callback for task export */
  onExport?: (task: Task) => void
  /** Additional CSS class */
  className?: string
}

/**
 * TaskActions Component
 * 
 * Provides a set of quick actions for tasks like complete, archive, duplicate, etc.
 * Can be used in task cards, task details view, or as a dropdown menu.
 */
export const TaskActions = ({
  task,
  isLoading = false,
  canEdit = true,
  canDelete = true,
  onStatusChange,
  onComplete,
  onArchive,
  onDuplicate,
  onExport,
  className = '',
}: TaskActionsProps) => {
  const isCompleted = task.status === 'done'
  const isBlocked = task.status === 'blocked'
  const isInProgress = task.status === 'in-progress'

  const handleComplete = async () => {
    if (onComplete && !isCompleted) {
      await onComplete(task.id)
    } else if (onStatusChange && !isCompleted) {
      await onStatusChange(task.id, 'done')
    }
  }

  const handleToggleBlock = async () => {
    if (onStatusChange) {
      const newStatus = isBlocked ? 'pending' : 'blocked'
      await onStatusChange(task.id, newStatus)
    }
  }

  const handleStartProgress = async () => {
    if (onStatusChange && !isInProgress && !isCompleted) {
      await onStatusChange(task.id, 'in-progress')
    }
  }

  const handleDuplicate = async () => {
    if (onDuplicate) {
      await onDuplicate(task)
    }
  }

  const handleArchive = async () => {
    if (onArchive && canDelete) {
      const confirmed = window.confirm(
        `Are you sure you want to archive "${task.title}"? This action can be undone from the archive view.`
      )
      if (confirmed) {
        await onArchive(task.id)
      }
    }
  }

  const handleExport = () => {
    if (onExport) {
      onExport(task)
    }
  }

  return (
    <div className={`task-actions flex items-center gap-2 ${className}`}>
      {/* Complete/Uncomplete Action */}
      {onComplete || onStatusChange ? (
        <button
          type="button"
          className={`task-action-btn ${
            isCompleted
              ? 'text-green-600 hover:text-green-700'
              : 'text-gray-500 hover:text-gray-700'
          } disabled:opacity-50`}
          onClick={handleComplete}
          disabled={isLoading}
          title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          aria-label={isCompleted ? 'Mark task as incomplete' : 'Mark task as complete'}
        >
          <span className="text-lg" aria-hidden="true">
            {isCompleted ? '✓' : '○'}
          </span>
        </button>
      ) : null}

      {/* Start/In Progress Action */}
      {onStatusChange && !isCompleted && !isInProgress ? (
        <button
          type="button"
          className="task-action-btn text-blue-500 hover:text-blue-700 disabled:opacity-50"
          onClick={handleStartProgress}
          disabled={isLoading}
          title="Start working on this task"
          aria-label="Start working on this task"
        >
          <span className="text-lg" aria-hidden="true">
            ▶
          </span>
        </button>
      ) : null}

      {/* Block/Unblock Action */}
      {onStatusChange && canEdit ? (
        <button
          type="button"
          className={`task-action-btn ${
            isBlocked
              ? 'text-red-600 hover:text-red-700'
              : 'text-gray-500 hover:text-gray-700'
          } disabled:opacity-50`}
          onClick={handleToggleBlock}
          disabled={isLoading}
          title={isBlocked ? 'Unblock task' : 'Mark as blocked'}
          aria-label={isBlocked ? 'Unblock task' : 'Mark task as blocked'}
        >
          <span className="text-lg" aria-hidden="true">
            {isBlocked ? '⚠' : '🚫'}
          </span>
        </button>
      ) : null}

      {/* Duplicate Action */}
      {onDuplicate && canEdit ? (
        <button
          type="button"
          className="task-action-btn text-gray-500 hover:text-gray-700 disabled:opacity-50"
          onClick={handleDuplicate}
          disabled={isLoading}
          title="Duplicate task"
          aria-label="Duplicate this task"
        >
          <span className="text-lg" aria-hidden="true">
            📋
          </span>
        </button>
      ) : null}

      {/* Export Action */}
      {onExport ? (
        <button
          type="button"
          className="task-action-btn text-gray-500 hover:text-gray-700 disabled:opacity-50"
          onClick={handleExport}
          disabled={isLoading}
          title="Export task"
          aria-label="Export task data"
        >
          <span className="text-lg" aria-hidden="true">
            ⬇
          </span>
        </button>
      ) : null}

      {/* Archive Action */}
      {onArchive && canDelete ? (
        <button
          type="button"
          className="task-action-btn text-gray-500 hover:text-red-600 disabled:opacity-50"
          onClick={handleArchive}
          disabled={isLoading}
          title="Archive task"
          aria-label="Archive this task"
        >
          <span className="text-lg" aria-hidden="true">
            📁
          </span>
        </button>
      ) : null}
    </div>
  )
}

export default TaskActions