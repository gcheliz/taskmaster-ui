import React from 'react'
import type { Task } from '../../../../types/task'
import type { TaskModalMode } from '../types'

interface TaskModalFooterProps {
  mode: TaskModalMode
  task?: Task
  isLoading: boolean
  onClose: () => void
  onEdit?: () => void
  onSubmit: (e: React.FormEvent) => Promise<void>
  onDelete?: () => void
}

export const TaskModalFooter = ({
  mode,
  task,
  isLoading,
  onClose,
  onEdit,
  onSubmit,
  onDelete,
}: TaskModalFooterProps) => {
  const isReadOnly = mode === 'view'
  const isCreateMode = mode === 'create'
  const isEditMode = mode === 'edit'

  return (
    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
      <button
        type="button"
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={onClose}
        disabled={isLoading}
      >
        {isReadOnly ? 'Close' : 'Cancel'}
      </button>

      {isReadOnly && onEdit && (
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={onEdit}
          disabled={isLoading}
          data-testid="task-edit-button"
        >
          Edit Task
        </button>
      )}

      {!isReadOnly && (
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={onSubmit}
          disabled={isLoading}
          data-testid="task-save-button"
        >
          {isLoading ? (
            <>
              <span className="animate-spin" aria-hidden="true">
                ⏳
              </span>
              {isCreateMode ? 'Creating...' : 'Saving...'}
            </>
          ) : (
            isCreateMode ? 'Create Task' : 'Save Changes'
          )}
        </button>
      )}

      {isEditMode && onDelete && task?.id && (
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          onClick={onDelete}
          disabled={isLoading}
          data-testid="task-delete-button"
        >
          {isLoading ? (
            <>
              <span className="animate-spin" aria-hidden="true">
                ⏳
              </span>
              Deleting...
            </>
          ) : (
            'Delete Task'
          )}
        </button>
      )}
    </div>
  )
}