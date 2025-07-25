import React from 'react'
import type { Task, TaskStatus } from '../../../../../types/task'
import { TaskActions } from './TaskActions'
import { TaskActionsDropdown } from './TaskActionsDropdown'

interface TaskActionsBarProps {
  /** The task to perform actions on */
  task: Task
  /** Whether to show inline actions */
  showInlineActions?: boolean
  /** Whether to show dropdown menu */
  showDropdown?: boolean
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
  /** Callback for task assignment */
  onAssign?: (taskId: number, assignee: string) => Promise<void>
  /** Callback for task duplication */
  onDuplicate?: (task: Task) => Promise<void>
  /** Callback for task export */
  onExport?: (task: Task, format?: 'json' | 'csv') => void
  /** Callback for task archiving */
  onArchive?: (taskId: number) => Promise<void>
  /** Callback for moving to another project */
  onMoveToProject?: (taskId: number, projectId: string) => Promise<void>
  /** Callback for converting to subtask */
  onConvertToSubtask?: (taskId: number, parentId: number) => Promise<void>
  /** Additional CSS class */
  className?: string
}

/**
 * TaskActionsBar Component
 * 
 * Combines inline quick actions with a dropdown menu for advanced actions.
 * Provides a complete action toolbar for task management.
 */
export const TaskActionsBar: React.FC<TaskActionsBarProps> = ({
  task,
  showInlineActions = true,
  showDropdown = true,
  isLoading = false,
  canEdit = true,
  canDelete = true,
  onStatusChange,
  onComplete,
  onAssign,
  onDuplicate,
  onExport,
  onArchive,
  onMoveToProject,
  onConvertToSubtask,
  className = '',
}) => {
  const handleExport = (format?: 'json' | 'csv') => {
    if (onExport) {
      onExport(task, format || 'json')
    }
  }

  return (
    <div className={`task-actions-bar flex items-center justify-between gap-4 ${className}`}>
      {showInlineActions && (
        <TaskActions
          task={task}
          isLoading={isLoading}
          canEdit={canEdit}
          canDelete={canDelete}
          onStatusChange={onStatusChange}
          onComplete={onComplete}
          onArchive={onArchive}
          onDuplicate={onDuplicate}
          onExport={handleExport}
        />
      )}

      {showDropdown && (
        <TaskActionsDropdown
          task={task}
          isLoading={isLoading}
          canEdit={canEdit}
          canDelete={canDelete}
          onStatusChange={onStatusChange}
          onAssign={onAssign}
          onDuplicate={onDuplicate}
          onExport={onExport}
          onMoveToProject={onMoveToProject}
          onConvertToSubtask={onConvertToSubtask}
          onArchive={onArchive}
        />
      )}
    </div>
  )
}

export default TaskActionsBar