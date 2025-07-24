import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { TaskColumn as TaskColumnType, TaskStatus } from '../../types/task'
import { TaskCard } from './TaskCard'
import type { DropData } from './DragAndDropProvider'

export interface TaskColumnProps {
  /** Column data including title, status, and tasks */
  column: TaskColumnType
  /** Callback when a task is clicked */
  onTaskClick?: (taskId: number) => void
  /** Callback when a task is moved between columns */
  onTaskMove?: (taskId: number, fromStatus: TaskStatus, toStatus: TaskStatus) => void
  /** Whether to show the create task button */
  showCreateButton?: boolean
  /** Callback when create task is clicked */
  onCreateTask?: (status: TaskStatus) => void
  /** Additional CSS class name */
  className?: string
}

/**
 * Task Column Component
 *
 * Represents a single column in the Kanban board for a specific task status.
 * Contains task cards and handles column-specific operations.
 */
export const TaskColumn: React.FC<TaskColumnProps> = ({
  column,
  onTaskClick,
  onTaskMove: _onTaskMove,
  showCreateButton = true,
  onCreateTask,
  className = '',
}) => {
  const { title, status, tasks, color, limit } = column
  const taskCount = tasks.length
  const isOverLimit = limit && taskCount > limit

  // Configure droppable behavior
  const dropData: DropData = {
    type: 'column',
    status: status,
  }

  const { isOver, setNodeRef } = useDroppable({
    id: `column-${status}`,
    data: dropData,
  })

  const handleTaskClick = (taskId: number) => {
    if (onTaskClick) {
      onTaskClick(taskId)
    }
  }

  const handleCreateTask = () => {
    if (onCreateTask) {
      onCreateTask(status)
    }
  }

  const getStatusIcon = (status: TaskStatus): string => {
    switch (status) {
      case 'pending':
        return '📋'
      case 'in-progress':
        return '🔄'
      case 'done':
        return '✅'
      case 'blocked':
        return '🚫'
      case 'cancelled':
        return '❌'
      case 'deferred':
        return '⏸️'
      default:
        return '📋'
    }
  }

  return (
    <section
      ref={setNodeRef}
      className={`bg-gray-50 rounded-lg p-4 min-h-96 flex flex-col ${isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : 'border border-gray-200'} ${className}`}
      style={{ '--column-color': color } as React.CSSProperties}
      role="region"
      aria-labelledby={`column-title-${status}`}
      aria-describedby={`column-count-${status}`}
      data-status={status}
    >
      <header className="mb-4">
        <div className="flex items-center justify-between">
          <h3
            id={`column-title-${status}`}
            className="font-semibold text-gray-900 text-lg flex items-center gap-2"
          >
            <span className="text-xl" aria-hidden="true">
              {getStatusIcon(status)}
            </span>
            {title}
          </h3>
          <div
            id={`column-count-${status}`}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${isOverLimit ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}
            aria-label={`${taskCount} task${taskCount !== 1 ? 's' : ''} in ${title.toLowerCase()}${limit ? `, limit ${limit}` : ''}`}
          >
            <span aria-hidden="true">{taskCount}</span>
            {limit && (
              <span className="text-gray-500" aria-hidden="true">
                /{limit}
              </span>
            )}
            <span className="sr-only">
              {taskCount} task{taskCount !== 1 ? 's' : ''} in {title.toLowerCase()}
              {limit && `, limit ${limit}`}
              {isOverLimit && ', over limit'}
            </span>
          </div>
        </div>

        {showCreateButton && (
          <button
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            onClick={handleCreateTask}
            aria-label={`Create new task in ${title.toLowerCase()}`}
            title={`Create task in ${title}`}
          >
            <span className="text-sm" aria-hidden="true">
              ➕
            </span>
            <span className="sr-only">Create task</span>
          </button>
        )}
      </header>

      <div
        className="flex-1 overflow-y-auto scrollbar-kanban"
        role="group"
        aria-labelledby={`column-title-${status}`}
      >
        {tasks.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-32 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-2 mb-4">
              <span className="text-3xl opacity-50" aria-hidden="true">
                {getStatusIcon(status)}
              </span>
              <span className="text-sm text-gray-500">No {title.toLowerCase()} tasks</span>
            </div>
            {showCreateButton && (
              <button
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                onClick={handleCreateTask}
                aria-label={`Create first task in ${title.toLowerCase()}`}
              >
                Create First Task
              </button>
            )}
          </div>
        ) : (
          <div
            className="space-y-3 overflow-y-auto scrollbar-kanban"
            role="group"
            aria-label={`${taskCount} task${taskCount !== 1 ? 's' : ''} in ${title.toLowerCase()}`}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onTaskClick={handleTaskClick}
                showFullDetails={true}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default TaskColumn
