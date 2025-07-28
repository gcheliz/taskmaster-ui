import React from 'react'
import { CheckCircle, Play, Archive, Copy, Download, MoreVertical } from 'lucide-react'
import { Button } from '../../../ui/atoms/Button'
import type { Task } from '../../../../types/task'

interface TaskActionsProps {
  task: Task
  onStatusChange?: (taskId: number, status: Task['status']) => void
  onComplete?: (taskId: number) => void
  onArchive?: (taskId: number) => void
  onDuplicate?: (taskId: number) => void
  onExport?: (taskId: number) => void
  isLoading?: boolean
}

export const TaskActions: React.FC<TaskActionsProps> = ({
  task,
  onStatusChange,
  onComplete,
  onArchive,
  onDuplicate,
  onExport,
  isLoading = false,
}) => {
  const handleComplete = () => {
    if (onComplete) {
      onComplete(task.id)
    } else if (onStatusChange) {
      onStatusChange(task.id, 'completed')
    }
  }

  const handleIncomplete = () => {
    if (onStatusChange) {
      onStatusChange(task.id, 'pending')
    }
  }

  const handleStart = () => {
    if (onStatusChange) {
      onStatusChange(task.id, 'in-progress')
    }
  }

  const handleArchive = () => {
    const confirmed = window.confirm('Are you sure you want to archive this task?')
    if (confirmed && onArchive) {
      onArchive(task.id)
    }
  }

  return (
    <div className="flex gap-2">
      {task.status === 'done' ? (
        <Button
          size="sm"
          variant="outline"
          onClick={handleIncomplete}
          disabled={isLoading}
          aria-label="Mark task as incomplete"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Incomplete
        </Button>
      ) : (
        <Button
          size="sm"
          variant={task.status === 'pending' ? 'outline' : 'default'}
          onClick={handleComplete}
          disabled={isLoading}
          aria-label="Mark task as complete"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Complete
        </Button>
      )}

      {task.status === 'pending' && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleStart}
          disabled={isLoading}
          aria-label="Start working on this task"
        >
          <Play className="w-4 h-4 mr-1" />
          Start
        </Button>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={handleArchive}
        disabled={isLoading}
        aria-label="Archive this task"
      >
        <Archive className="w-4 h-4" />
      </Button>

      {onDuplicate && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDuplicate(task.id)}
          disabled={isLoading}
          aria-label="Duplicate task"
        >
          <Copy className="w-4 h-4" />
        </Button>
      )}

      {onExport && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onExport(task.id)}
          disabled={isLoading}
          aria-label="Export task"
        >
          <Download className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}

export const TaskActionsDropdown: React.FC<TaskActionsProps> = ({
  task,
  onStatusChange,
  onComplete,
  onArchive,
  onDuplicate,
  onExport,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        aria-label="Task actions menu"
      >
        <MoreVertical className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
          <div className="py-1">
            {task.status !== 'done' && (
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => handleAction(() => onComplete?.(task.id))}
              >
                Mark as Complete
              </button>
            )}
            {task.status === 'pending' && (
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => handleAction(() => onStatusChange?.(task.id, 'in-progress'))}
              >
                Start Progress
              </button>
            )}
            {onArchive && (
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => handleAction(() => {
                  if (window.confirm('Are you sure you want to archive this task?')) {
                    onArchive(task.id)
                  }
                })}
              >
                Archive
              </button>
            )}
            {onDuplicate && (
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => handleAction(() => onDuplicate(task.id))}
              >
                Duplicate
              </button>
            )}
            {onExport && (
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => handleAction(() => onExport(task.id))}
              >
                Export
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface TaskActionsBarProps extends TaskActionsProps {
  className?: string
  compact?: boolean
}

export const TaskActionsBar: React.FC<TaskActionsBarProps> = ({
  className = '',
  compact = false,
  ...props
}) => {
  return (
    <div 
      className={`flex items-center space-x-2 ${className}`}
      data-testid="task-actions-bar"
    >
      <TaskActions {...props} />
    </div>
  )
}