import React from 'react'

interface TaskTitleFieldProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  readOnly?: boolean
}

export const TaskTitleField = ({
  value,
  onChange,
  error,
  disabled = false,
  readOnly = false,
}: TaskTitleFieldProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="task-title" className="block text-sm font-medium text-gray-700">
        Title *
      </label>
      <input
        id="task-title"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
        }`}
        placeholder="Enter task title..."
        disabled={disabled || readOnly}
        maxLength={100}
        data-testid="task-title-input"
      />
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}