import React from 'react'
import type { TaskStatus } from '../../../../../types/task'
import { TASK_STATUSES } from '../../constants'

interface TaskStatusSelectorProps {
  value: TaskStatus
  onChange: (value: TaskStatus) => void
  error?: string
  disabled?: boolean
  readOnly?: boolean
}

export const TaskStatusSelector = ({
  value,
  onChange,
  error,
  disabled = false,
  readOnly = false,
}: TaskStatusSelectorProps) => {
  const getStatusColor = (status: TaskStatus) => {
    return TASK_STATUSES.find((s) => s.value === status)?.color || '#6b7280'
  }

  return (
    <div className="space-y-2">
      <label htmlFor="task-status" className="block text-sm font-medium text-gray-700">
        Status *
      </label>
      <select
        id="task-status"
        value={value || 'pending'}
        onChange={(e) => onChange(e.target.value as TaskStatus)}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
        }`}
        disabled={disabled || readOnly}
        data-testid="task-status-select"
      >
        {TASK_STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
      {error && <span className="text-sm text-red-600">{error}</span>}
      {value && (
        <div className="flex items-center gap-2 mt-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: getStatusColor(value),
            }}
          />
          <span className="text-sm text-gray-600">
            {TASK_STATUSES.find((s) => s.value === value)?.label}
          </span>
        </div>
      )}
    </div>
  )
}