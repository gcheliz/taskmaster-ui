import React from 'react'
import type { Task } from '../../../../../types/task'
import type { ValidationErrors } from '../../types'
import { TaskTitleField } from './TaskTitleField'
import { TaskDescriptionField } from './TaskDescriptionField'
import { TaskPrioritySelector } from './TaskPrioritySelector'
import { TaskStatusSelector } from './TaskStatusSelector'

interface TaskFormProps {
  formData: Partial<Task>
  validationErrors: ValidationErrors
  isLoading: boolean
  isReadOnly: boolean
  availableTasks?: Task[]
  onFieldChange: (field: keyof Task, value: any) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export const TaskForm = ({
  formData,
  validationErrors,
  isLoading,
  isReadOnly,
  availableTasks = [],
  onFieldChange,
  onSubmit,
}: TaskFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Title */}
      <TaskTitleField
        value={formData.title || ''}
        onChange={(value) => onFieldChange('title', value)}
        error={validationErrors.title}
        disabled={isLoading}
        readOnly={isReadOnly}
      />

      {/* Description */}
      <TaskDescriptionField
        value={formData.description || ''}
        onChange={(value) => onFieldChange('description', value)}
        error={validationErrors.description}
        disabled={isLoading}
        readOnly={isReadOnly}
      />

      {/* Priority and Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TaskPrioritySelector
          value={formData.priority || 'medium'}
          onChange={(value) => onFieldChange('priority', value)}
          error={validationErrors.priority}
          disabled={isLoading}
          readOnly={isReadOnly}
        />

        <TaskStatusSelector
          value={formData.status || 'pending'}
          onChange={(value) => onFieldChange('status', value)}
          error={validationErrors.status}
          disabled={isLoading}
          readOnly={isReadOnly}
        />
      </div>

      {/* Details */}
      <div className="space-y-2">
        <label htmlFor="task-details" className="block text-sm font-medium text-gray-700">
          Details
        </label>
        <textarea
          id="task-details"
          value={formData.details || ''}
          onChange={(e) => onFieldChange('details', e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          placeholder="Enter additional task details..."
          disabled={isLoading || isReadOnly}
          rows={3}
          data-testid="task-details-input"
        />
        <div className="text-sm text-gray-600 mt-1">
          Optional detailed information about the task implementation.
        </div>
      </div>

      {/* Test Strategy */}
      <div className="space-y-2">
        <label htmlFor="task-test-strategy" className="block text-sm font-medium text-gray-700">
          Test Strategy
        </label>
        <textarea
          id="task-test-strategy"
          value={formData.testStrategy || ''}
          onChange={(e) => onFieldChange('testStrategy', e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          placeholder="Enter test strategy..."
          disabled={isLoading || isReadOnly}
          rows={3}
          data-testid="task-test-strategy-input"
        />
        <div className="text-sm text-gray-600 mt-1">How this task should be tested and validated.</div>
      </div>

      {/* Assignment and Due Date Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="task-assigned-to" className="block text-sm font-medium text-gray-700">
            Assigned To
          </label>
          <input
            id="task-assigned-to"
            type="text"
            value={formData.assignedTo || ''}
            onChange={(e) => onFieldChange('assignedTo', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter assignee name..."
            disabled={isLoading || isReadOnly}
            data-testid="task-assigned-to-input"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            id="task-due-date"
            type="date"
            value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
            onChange={(e) =>
              onFieldChange(
                'dueDate',
                e.target.value ? new Date(e.target.value).toISOString() : undefined
              )
            }
            className={`block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.dueDate ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
            }`}
            disabled={isLoading || isReadOnly}
            data-testid="task-due-date-input"
          />
          {validationErrors.dueDate && (
            <span className="text-sm text-red-600">{validationErrors.dueDate}</span>
          )}
        </div>
      </div>

      {/* Estimated Hours */}
      <div className="space-y-2">
        <label htmlFor="task-estimated-hours" className="block text-sm font-medium text-gray-700">
          Estimated Hours
        </label>
        <input
          id="task-estimated-hours"
          type="number"
          value={formData.estimatedHours || ''}
          onChange={(e) =>
            onFieldChange(
              'estimatedHours',
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className="block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter estimated hours..."
          disabled={isLoading || isReadOnly}
          min="0"
          step="0.5"
          data-testid="task-estimated-hours-input"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label htmlFor="task-tags" className="block text-sm font-medium text-gray-700">
          Tags
        </label>
        <input
          id="task-tags"
          type="text"
          value={formData.tags?.join(', ') || ''}
          onChange={(e) =>
            onFieldChange(
              'tags',
              e.target.value
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag)
            )
          }
          className="block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter tags separated by commas..."
          disabled={isLoading || isReadOnly}
          data-testid="task-tags-input"
        />
        <div className="text-sm text-gray-600 mt-1">Separate multiple tags with commas.</div>
      </div>
    </form>
  )
}