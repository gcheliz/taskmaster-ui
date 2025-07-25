import React from 'react'
import type { TaskModalMode } from '../types'

interface TaskModalHeaderProps {
  mode: TaskModalMode
  onClose: () => void
  isLoading: boolean
}

export const TaskModalHeader = ({ mode, onClose, isLoading }: TaskModalHeaderProps) => {
  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Create New Task'
      case 'edit':
        return 'Edit Task'
      case 'view':
        return 'Task Details'
      default:
        return 'Task'
    }
  }

  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <h2 id="task-modal-title" className="text-xl font-semibold text-gray-900">{getModalTitle()}</h2>
      <button
        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        onClick={onClose}
        disabled={isLoading}
        aria-label="Close modal"
      >
        ×
      </button>
    </div>
  )
}