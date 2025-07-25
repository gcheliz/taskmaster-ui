import React, { useEffect } from 'react'
import type { Task } from '../../../types/task'
import type { TaskModalMode } from './types'
import { useTaskForm } from './hooks/useTaskForm'
import { TaskForm } from './components/TaskForm'
import { ErrorAlert } from './components/common/ErrorAlert'

export interface TaskModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Modal mode: create, edit, or view */
  mode: TaskModalMode
  /** Task data (for edit/view modes) */
  task?: Task
  /** Available tasks for dependency selection */
  availableTasks?: Task[]
  /** Callback when modal should be closed */
  onClose: () => void
  /** Callback when task should be saved */
  onSave: (task: Partial<Task>) => Promise<void>
  /** Callback when task should be deleted */
  onDelete?: (taskId: number) => Promise<void>
  /** Callback when switching to edit mode */
  onEdit?: () => void
  /** Additional CSS class name */
  className?: string
}

/**
 * Task Modal Component
 *
 * Provides a modal interface for creating, editing, and viewing tasks.
 * Supports full CRUD operations and dependency management.
 */
export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  mode,
  task,
  availableTasks = [],
  onClose,
  onSave,
  onDelete,
  onEdit,
  className = '',
}) => {
  const isReadOnly = mode === 'view'
  const isCreateMode = mode === 'create'
  const isEditMode = mode === 'edit'

  const {
    formData,
    setFormData,
    validationErrors,
    isLoading,
    error,
    updateField,
    handleSubmit,
    resetForm,
    setError,
  } = useTaskForm({
    initialData: task,
    onSubmit: async (data) => {
      await onSave(data)
      onClose()
    },
  })

  // Reset form when modal opens or task changes
  useEffect(() => {
    if (isOpen) {
      if (task && (isEditMode || mode === 'view')) {
        setFormData({
          ...task,
          dependencies: task.dependencies || [],
          tags: task.tags || [],
        })
      } else {
        resetForm()
      }
      setError(null)
    }
  }, [isOpen, task, mode, isEditMode, setFormData, resetForm, setError])

  const handleDelete = async () => {
    if (!onDelete || !task?.id) return

    const confirmed = window.confirm(
      `Are you sure you want to delete task "${task.title}"? This action cannot be undone.`
    )

    if (!confirmed) return

    setError(null)

    try {
      await onDelete(task.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

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

  if (!isOpen) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{getModalTitle()}</h2>
          <button
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-modal p-6">
          {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

          <TaskForm
            formData={formData}
            validationErrors={validationErrors}
            isLoading={isLoading}
            isReadOnly={isReadOnly}
            availableTasks={availableTasks}
            onFieldChange={updateField}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={handleClose}
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
              onClick={handleSubmit}
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
                <>{isCreateMode ? 'Create Task' : 'Save Changes'}</>
              )}
            </button>
          )}

          {isEditMode && onDelete && task?.id && (
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              onClick={handleDelete}
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
      </div>
    </div>
  )
}

export default TaskModal