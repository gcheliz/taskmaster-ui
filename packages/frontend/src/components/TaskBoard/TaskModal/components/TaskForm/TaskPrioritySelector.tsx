import React from 'react'
import type { TaskPriority } from '../../../../../types/task'
import { TASK_PRIORITIES } from '../../constants'

interface TaskPrioritySelectorProps {
  value: TaskPriority
  onChange: (value: TaskPriority) => void
  error?: string
  disabled?: boolean
  readOnly?: boolean
}

export const TaskPrioritySelector: React.FC<TaskPrioritySelectorProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  readOnly = false,
}) => {
  const getPriorityColor = (priority: TaskPriority) => {
    return TASK_PRIORITIES.find((p) => p.value === priority)?.color || '#6b7280'
  }

  return (
    <div className="space-y-2">
      <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700">
        Priority *
      </label>
      <select
        id="task-priority"
        value={value || 'medium'}
        onChange={(e) => onChange(e.target.value as TaskPriority)}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
        }`}
        disabled={disabled || readOnly}
        data-testid="task-priority-select"
      >
        {TASK_PRIORITIES.map((priority) => (
          <option key={priority.value} value={priority.value}>
            {priority.label}
          </option>
        ))}
      </select>
      {error && <span className="text-sm text-red-600">{error}</span>}
      {value && (
        <div className="flex items-center gap-2 mt-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: getPriorityColor(value),
            }}
          />
          <span className="text-sm text-gray-600">
            {TASK_PRIORITIES.find((p) => p.value === value)?.label}
          </span>
        </div>
      )}
    </div>
  )
}