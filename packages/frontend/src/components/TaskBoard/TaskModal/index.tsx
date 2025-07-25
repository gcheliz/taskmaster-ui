import React, { useEffect } from 'react'
import type { Task } from '../../../types/task'
import type { TaskModalMode } from './types'
import { useTaskForm } from './hooks/useTaskForm'
import { TaskForm } from './components/TaskForm'
import { TaskDetails } from './components/TaskDetails'
import { TaskModalHeader } from './components/TaskModalHeader'
import { TaskModalFooter } from './components/TaskModalFooter'
import { ErrorAlert } from './components/common/ErrorAlert'
import { convertTaskToCSV } from './utils/taskExport'

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

  if (!isOpen) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <TaskModalHeader mode={mode} onClose={handleClose} isLoading={isLoading} />

        <div className="flex-1 overflow-y-auto scrollbar-modal p-6">
          {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

          {isReadOnly && task ? (
            <TaskDetails 
              task={task} 
              availableTasks={availableTasks}
              onStatusChange={async (taskId, status) => {
                await onSave({ ...task, id: taskId, status })
              }}
              onComplete={async (taskId) => {
                await onSave({ ...task, id: taskId, status: 'done' })
              }}
              onDuplicate={async (taskToDuplicate) => {
                // Close current modal and trigger create with duplicated data
                const { id, createdAt, updatedAt, ...duplicateData } = taskToDuplicate
                await onSave({
                  ...duplicateData,
                  title: `${duplicateData.title} (Copy)`,
                  status: 'pending'
                })
              }}
              onExport={(taskToExport, format) => {
                // Export task data
                const dataStr = format === 'json' 
                  ? JSON.stringify(taskToExport, null, 2)
                  : convertTaskToCSV(taskToExport)
                const dataUri = `data:text/${format === 'json' ? 'json' : 'csv'};charset=utf-8,${encodeURIComponent(dataStr)}`
                const exportFileDefaultName = `task-${taskToExport.id}.${format || 'json'}`
                
                const linkElement = document.createElement('a')
                linkElement.setAttribute('href', dataUri)
                linkElement.setAttribute('download', exportFileDefaultName)
                linkElement.click()
              }}
              onArchive={async (taskId) => {
                if (onDelete) {
                  await onDelete(taskId)
                }
              }}
              canEdit={!!onEdit}
              canDelete={!!onDelete}
            />
          ) : (
            <TaskForm
              formData={formData}
              validationErrors={validationErrors}
              isLoading={isLoading}
              isReadOnly={isReadOnly}
              availableTasks={availableTasks}
              onFieldChange={updateField}
              onSubmit={handleSubmit}
            />
          )}
        </div>

        <TaskModalFooter
          mode={mode}
          task={task}
          isLoading={isLoading}
          onClose={handleClose}
          onEdit={onEdit}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}

export { TaskModal }
export default TaskModal
export type { TaskModalProps }
export type { TaskModalMode } from './types'