import React from 'react'

interface TaskDescriptionFieldProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  readOnly?: boolean
}

export const TaskDescriptionField: React.FC<TaskDescriptionFieldProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  readOnly = false,
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor="task-description" className="block text-sm font-medium text-gray-700">
        Description *
      </label>
      <textarea
        id="task-description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
        }`}
        placeholder="Enter task description..."
        disabled={disabled || readOnly}
        rows={4}
        maxLength={500}
        data-testid="task-description-input"
      />
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}