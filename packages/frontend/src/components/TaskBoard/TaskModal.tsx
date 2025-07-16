import React, { useState, useEffect } from 'react';
import type { Task, TaskStatus, TaskPriority } from '../../types/task';
import './TaskModal.css';

export type TaskModalMode = 'create' | 'edit' | 'view';

export interface TaskModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Modal mode: create, edit, or view */
  mode: TaskModalMode;
  /** Task data (for edit/view modes) */
  task?: Task;
  /** Available tasks for dependency selection */
  availableTasks?: Task[];
  /** Callback when modal should be closed */
  onClose: () => void;
  /** Callback when task should be saved */
  onSave: (task: Partial<Task>) => Promise<void>;
  /** Callback when task should be deleted */
  onDelete?: (taskId: number) => Promise<void>;
  /** Callback when switching to edit mode */
  onEdit?: () => void;
  /** Additional CSS class name */
  className?: string;
}

const DEFAULT_TASK_VALUES: Partial<Task> = {
  title: '',
  description: '',
  details: '',
  testStrategy: '',
  priority: 'medium',
  status: 'pending',
  dependencies: [],
  tags: [],
  estimatedHours: undefined,
  assignedTo: '',
  dueDate: undefined,
};

const TASK_STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'To Do', color: '#6b7280' },
  { value: 'in-progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'done', label: 'Done', color: '#10b981' },
  { value: 'blocked', label: 'Blocked', color: '#ef4444' },
  { value: 'deferred', label: 'Deferred', color: '#f59e0b' },
  { value: 'cancelled', label: 'Cancelled', color: '#6b7280' },
];

const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
  { value: 'urgent', label: 'Urgent', color: '#dc2626' },
];

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
  const [formData, setFormData] = useState<Partial<Task>>(DEFAULT_TASK_VALUES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    dueDate?: string;
  }>({});

  const isReadOnly = mode === 'view';
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';

  // Reset form when modal opens or task changes
  useEffect(() => {
    if (isOpen) {
      if (task && (isEditMode || mode === 'view')) {
        setFormData({
          ...task,
          dependencies: task.dependencies || [],
          tags: task.tags || [],
        });
      } else {
        setFormData(DEFAULT_TASK_VALUES);
      }
      setError(null);
      setValidationErrors({});
    }
  }, [isOpen, task, mode, isEditMode]);

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Title validation
    if (!formData.title?.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    } else if (formData.title.trim().length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }

    // Description validation
    if (!formData.description?.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    } else if (formData.description.trim().length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    // Priority validation
    if (!formData.priority) {
      errors.priority = 'Priority is required';
    }

    // Status validation
    if (!formData.status) {
      errors.status = 'Status is required';
    }

    // Due date validation
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isReadOnly) return;

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const taskData = {
        ...formData,
        title: formData.title?.trim(),
        description: formData.description?.trim(),
        details: formData.details?.trim() || undefined,
        testStrategy: formData.testStrategy?.trim() || undefined,
        assignedTo: formData.assignedTo?.trim() || undefined,
        dependencies: formData.dependencies?.filter(dep => dep !== undefined) || [],
        tags: formData.tags?.filter(tag => tag.trim() !== '') || [],
      };

      await onSave(taskData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !task?.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete task "${task.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsLoading(true);
    setError(null);

    try {
      await onDelete(task.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const updateFormData = (field: keyof Task, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Create New Task';
      case 'edit':
        return 'Edit Task';
      case 'view':
        return 'Task Details';
      default:
        return 'Task';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    return TASK_PRIORITIES.find(p => p.value === priority)?.color || '#6b7280';
  };

  const getStatusColor = (status: TaskStatus) => {
    return TASK_STATUSES.find(s => s.value === status)?.color || '#6b7280';
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`task-modal ${className}`} onClick={handleBackdropClick}>
      <div className="task-modal__content">
        <div className="task-modal__header">
          <h2 className="modal-title">{getModalTitle()}</h2>
          <button
            className="modal-close-button"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="task-modal__body">
          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span className="error-message">{error}</span>
              <button 
                className="error-dismiss"
                onClick={() => setError(null)}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="task-form">
            {/* Title */}
            <div className="form-group">
              <label htmlFor="task-title" className="form-label">
                Title *
              </label>
              <input
                id="task-title"
                type="text"
                value={formData.title || ''}
                onChange={(e) => updateFormData('title', e.target.value)}
                className={`form-input ${validationErrors.title ? 'error' : ''}`}
                placeholder="Enter task title..."
                disabled={isLoading || isReadOnly}
                maxLength={100}
                data-testid="task-title-input"
              />
              {validationErrors.title && (
                <span className="form-error">{validationErrors.title}</span>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="task-description" className="form-label">
                Description *
              </label>
              <textarea
                id="task-description"
                value={formData.description || ''}
                onChange={(e) => updateFormData('description', e.target.value)}
                className={`form-textarea ${validationErrors.description ? 'error' : ''}`}
                placeholder="Enter task description..."
                disabled={isLoading || isReadOnly}
                rows={4}
                maxLength={500}
                data-testid="task-description-input"
              />
              {validationErrors.description && (
                <span className="form-error">{validationErrors.description}</span>
              )}
            </div>

            {/* Priority and Status Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-priority" className="form-label">
                  Priority *
                </label>
                <select
                  id="task-priority"
                  value={formData.priority || 'medium'}
                  onChange={(e) => updateFormData('priority', e.target.value)}
                  className={`form-select ${validationErrors.priority ? 'error' : ''}`}
                  disabled={isLoading || isReadOnly}
                  data-testid="task-priority-select"
                >
                  {TASK_PRIORITIES.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
                {validationErrors.priority && (
                  <span className="form-error">{validationErrors.priority}</span>
                )}
                {formData.priority && (
                  <div className="priority-indicator">
                    <span 
                      className="priority-dot" 
                      style={{ backgroundColor: getPriorityColor(formData.priority) }}
                    />
                    <span className="priority-label">
                      {TASK_PRIORITIES.find(p => p.value === formData.priority)?.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="task-status" className="form-label">
                  Status *
                </label>
                <select
                  id="task-status"
                  value={formData.status || 'pending'}
                  onChange={(e) => updateFormData('status', e.target.value)}
                  className={`form-select ${validationErrors.status ? 'error' : ''}`}
                  disabled={isLoading || isReadOnly}
                  data-testid="task-status-select"
                >
                  {TASK_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {validationErrors.status && (
                  <span className="form-error">{validationErrors.status}</span>
                )}
                {formData.status && (
                  <div className="status-indicator">
                    <span 
                      className="status-dot" 
                      style={{ backgroundColor: getStatusColor(formData.status) }}
                    />
                    <span className="status-label">
                      {TASK_STATUSES.find(s => s.value === formData.status)?.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="form-group">
              <label htmlFor="task-details" className="form-label">
                Details
              </label>
              <textarea
                id="task-details"
                value={formData.details || ''}
                onChange={(e) => updateFormData('details', e.target.value)}
                className="form-textarea"
                placeholder="Enter additional task details..."
                disabled={isLoading || isReadOnly}
                rows={3}
                data-testid="task-details-input"
              />
              <div className="form-help">
                Optional detailed information about the task implementation.
              </div>
            </div>

            {/* Test Strategy */}
            <div className="form-group">
              <label htmlFor="task-test-strategy" className="form-label">
                Test Strategy
              </label>
              <textarea
                id="task-test-strategy"
                value={formData.testStrategy || ''}
                onChange={(e) => updateFormData('testStrategy', e.target.value)}
                className="form-textarea"
                placeholder="Enter test strategy..."
                disabled={isLoading || isReadOnly}
                rows={3}
                data-testid="task-test-strategy-input"
              />
              <div className="form-help">
                How this task should be tested and validated.
              </div>
            </div>

            {/* Assignment and Due Date Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-assigned-to" className="form-label">
                  Assigned To
                </label>
                <input
                  id="task-assigned-to"
                  type="text"
                  value={formData.assignedTo || ''}
                  onChange={(e) => updateFormData('assignedTo', e.target.value)}
                  className="form-input"
                  placeholder="Enter assignee name..."
                  disabled={isLoading || isReadOnly}
                  data-testid="task-assigned-to-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="task-due-date" className="form-label">
                  Due Date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
                  onChange={(e) => updateFormData('dueDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                  className={`form-input ${validationErrors.dueDate ? 'error' : ''}`}
                  disabled={isLoading || isReadOnly}
                  data-testid="task-due-date-input"
                />
                {validationErrors.dueDate && (
                  <span className="form-error">{validationErrors.dueDate}</span>
                )}
              </div>
            </div>

            {/* Estimated Hours */}
            <div className="form-group">
              <label htmlFor="task-estimated-hours" className="form-label">
                Estimated Hours
              </label>
              <input
                id="task-estimated-hours"
                type="number"
                value={formData.estimatedHours || ''}
                onChange={(e) => updateFormData('estimatedHours', e.target.value ? Number(e.target.value) : undefined)}
                className="form-input"
                placeholder="Enter estimated hours..."
                disabled={isLoading || isReadOnly}
                min="0"
                step="0.5"
                data-testid="task-estimated-hours-input"
              />
            </div>

            {/* Tags */}
            <div className="form-group">
              <label htmlFor="task-tags" className="form-label">
                Tags
              </label>
              <input
                id="task-tags"
                type="text"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => updateFormData('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                className="form-input"
                placeholder="Enter tags separated by commas..."
                disabled={isLoading || isReadOnly}
                data-testid="task-tags-input"
              />
              <div className="form-help">
                Separate multiple tags with commas.
              </div>
            </div>

            {/* Dependencies */}
            {availableTasks.length > 0 && (
              <div className="form-group">
                <label className="form-label">
                  Dependencies
                </label>
                <div className="dependencies-container">
                  {/* Selected Dependencies */}
                  {formData.dependencies && formData.dependencies.length > 0 && (
                    <div className="selected-dependencies">
                      <div className="selected-dependencies-header">
                        <span className="dependencies-count">
                          {formData.dependencies.length} dependenc{formData.dependencies.length === 1 ? 'y' : 'ies'}
                        </span>
                      </div>
                      <div className="selected-dependencies-list">
                        {formData.dependencies.map((depId) => {
                          const depTask = availableTasks.find(t => t.id === depId);
                          if (!depTask) return null;
                          
                          return (
                            <div key={depId} className="dependency-item">
                              <div className="dependency-info">
                                <span className="dependency-id">#{depTask.id}</span>
                                <span className="dependency-title">{depTask.title}</span>
                                <span className="dependency-status" style={{ 
                                  color: getStatusColor(depTask.status),
                                  backgroundColor: `${getStatusColor(depTask.status)}20`,
                                }}>
                                  {TASK_STATUSES.find(s => s.value === depTask.status)?.label || depTask.status}
                                </span>
                              </div>
                              {!isReadOnly && (
                                <button
                                  type="button"
                                  className="remove-dependency-button"
                                  onClick={() => {
                                    const newDeps = formData.dependencies?.filter(id => id !== depId) || [];
                                    updateFormData('dependencies', newDeps);
                                  }}
                                  title="Remove dependency"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Add Dependencies */}
                  {!isReadOnly && (
                    <div className="add-dependencies">
                      <select
                        className="form-select dependency-select"
                        value=""
                        onChange={(e) => {
                          const selectedId = Number(e.target.value);
                          if (selectedId && !formData.dependencies?.includes(selectedId)) {
                            const newDeps = [...(formData.dependencies || []), selectedId];
                            updateFormData('dependencies', newDeps);
                          }
                        }}
                        disabled={isLoading}
                      >
                        <option value="">Select a task to add as dependency...</option>
                        {availableTasks
                          .filter(t => 
                            t.id !== task?.id && // Don't allow self-dependency
                            !formData.dependencies?.includes(t.id) // Don't show already selected
                          )
                          .sort((a, b) => a.id - b.id)
                          .map(t => (
                            <option key={t.id} value={t.id}>
                              #{t.id} - {t.title} ({TASK_STATUSES.find(s => s.value === t.status)?.label || t.status})
                            </option>
                          ))}
                      </select>
                      <div className="form-help">
                        Select tasks that must be completed before this task can be worked on.
                      </div>
                    </div>
                  )}
                  
                  {/* Empty state */}
                  {(!formData.dependencies || formData.dependencies.length === 0) && (
                    <div className="dependencies-empty">
                      <span className="empty-icon">🔗</span>
                      <span className="empty-text">
                        {isReadOnly ? 'No dependencies' : 'No dependencies set. Select tasks above to add dependencies.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="task-modal__footer">
          <button
            type="button"
            className="button button--secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            {isReadOnly ? 'Close' : 'Cancel'}
          </button>
          
          {isReadOnly && onEdit && (
            <button
              type="button"
              className="button button--primary"
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
              className="button button--primary"
              onClick={handleSubmit}
              disabled={isLoading}
              data-testid="task-save-button"
            >
              {isLoading ? (
                <>
                  <span className="button-spinner">⏳</span>
                  {isCreateMode ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>
                  {isCreateMode ? 'Create Task' : 'Save Changes'}
                </>
              )}
            </button>
          )}
          
          {isEditMode && onDelete && task?.id && (
            <button
              type="button"
              className="button button--danger"
              onClick={handleDelete}
              disabled={isLoading}
              data-testid="task-delete-button"
            >
              {isLoading ? (
                <>
                  <span className="button-spinner">⏳</span>
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
  );
};

export default TaskModal;