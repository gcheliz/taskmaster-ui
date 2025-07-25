import React from 'react'
import type { Task, TaskStatus } from '../../../../../types/task'
import { TASK_STATUSES, TASK_PRIORITIES } from '../../constants'
import { TaskActionsBar } from '../TaskActions/TaskActionsBar'

interface TaskDetailsProps {
  task: Task
  availableTasks?: Task[]
  onStatusChange?: (taskId: number, status: TaskStatus) => Promise<void>
  onComplete?: (taskId: number) => Promise<void>
  onDuplicate?: (task: Task) => Promise<void>
  onExport?: (task: Task, format?: 'json' | 'csv') => void
  onArchive?: (taskId: number) => Promise<void>
  canEdit?: boolean
  canDelete?: boolean
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({ 
  task, 
  availableTasks = [],
  onStatusChange,
  onComplete,
  onDuplicate,
  onExport,
  onArchive,
  canEdit = true,
  canDelete = true
}) => {
  const getStatusColor = (status: string) => {
    return TASK_STATUSES.find((s) => s.value === status)?.color || '#6b7280'
  }

  const getPriorityColor = (priority: string) => {
    return TASK_PRIORITIES.find((p) => p.value === priority)?.color || '#6b7280'
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Not set'
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Task Actions Bar */}
      {(onStatusChange || onComplete || onDuplicate || onExport || onArchive) && (
        <TaskActionsBar
          task={task}
          showInlineActions={true}
          showDropdown={true}
          canEdit={canEdit}
          canDelete={canDelete}
          onStatusChange={onStatusChange}
          onComplete={onComplete}
          onDuplicate={onDuplicate}
          onExport={onExport}
          onArchive={onArchive}
          className="mb-6"
        />
      )}

      {/* Title and Description */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Title</h3>
          <p className="text-gray-900">{task.title}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
          <p className="text-gray-900 whitespace-pre-wrap">{task.description}</p>
        </div>
      </div>

      {/* Priority and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Priority</h3>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            />
            <span className="text-gray-900">
              {TASK_PRIORITIES.find((p) => p.value === task.priority)?.label || task.priority}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getStatusColor(task.status) }}
            />
            <span className="text-gray-900">
              {TASK_STATUSES.find((s) => s.value === task.status)?.label || task.status}
            </span>
          </div>
        </div>
      </div>

      {/* Details and Test Strategy */}
      {(task.details || task.testStrategy) && (
        <div className="space-y-4">
          {task.details && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Details</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{task.details}</p>
            </div>
          )}

          {task.testStrategy && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Test Strategy</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{task.testStrategy}</p>
            </div>
          )}
        </div>
      )}

      {/* Assignment and Due Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Assigned To</h3>
          <p className="text-gray-900">{task.assignedTo || 'Unassigned'}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Due Date</h3>
          <p className="text-gray-900">{formatDate(task.dueDate)}</p>
        </div>
      </div>

      {/* Estimated Hours */}
      {task.estimatedHours !== undefined && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Estimated Hours</h3>
          <p className="text-gray-900">{task.estimatedHours} hours</p>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dependencies */}
      {task.dependencies && task.dependencies.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Dependencies ({task.dependencies.length})
          </h3>
          <div className="space-y-2">
            {task.dependencies.map((depId) => {
              const depTask = availableTasks.find((t) => t.id === depId)
              if (!depTask) return null

              return (
                <div
                  key={depId}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">#{depTask.id}</span>
                    <span className="text-sm text-gray-900">{depTask.title}</span>
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{
                      color: getStatusColor(depTask.status),
                      backgroundColor: `${getStatusColor(depTask.status)}20`,
                    }}
                  >
                    {TASK_STATUSES.find((s) => s.value === depTask.status)?.label || depTask.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Created/Updated Dates */}
      <div className="pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
          <div>
            <span className="font-medium">Created:</span> {formatDate(task.createdAt)}
          </div>
          <div>
            <span className="font-medium">Updated:</span> {formatDate(task.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  )
}