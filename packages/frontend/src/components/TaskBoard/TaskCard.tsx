import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types/task';
import type { DragData } from './DragAndDropProvider';
import './TaskCard.css';

export interface TaskCardProps {
  /** Task data to display */
  task: Task;
  /** Callback when task is clicked */
  onTaskClick?: (taskId: number) => void;
  /** Additional CSS class name */
  className?: string;
  /** Whether the card is in a compact view */
  compact?: boolean;
  /** Whether to show all task details */
  showFullDetails?: boolean;
  /** Whether the card is draggable */
  isDraggable?: boolean;
}

/**
 * Task Card Component
 * 
 * Reusable card component that displays a single task with all its details.
 * Supports different display modes and handles task interaction events.
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onTaskClick,
  className = '',
  compact = false,
  showFullDetails = true,
  isDraggable = true
}) => {
  // Configure draggable behavior
  const dragData: DragData = {
    type: 'task',
    taskId: task.id,
    status: task.status
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: `task-${task.id}`,
    data: dragData,
    disabled: !isDraggable
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : isDraggable ? 'grab' : 'default'
  };

  const handleTaskClick = () => {
    if (onTaskClick && !isDragging) {
      onTaskClick(task.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTaskClick();
    }
  };

  const getPriorityIcon = (priority: string): string => {
    switch (priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#d97706';
      case 'low':
        return '#16a34a';
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'pending':
        return '📋';
      case 'in-progress':
        return '🔄';
      case 'done':
        return '✅';
      case 'blocked':
        return '🚫';
      case 'cancelled':
        return '❌';
      case 'deferred':
        return '⏸️';
      default:
        return '📋';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  const isDueSoon = task.dueDate && !isOverdue && 
    new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div
      ref={setNodeRef}
      className={`
        task-card 
        ${task.priority}-priority 
        ${compact ? 'compact' : ''} 
        ${isOverdue ? 'overdue' : ''} 
        ${isDueSoon ? 'due-soon' : ''}
        ${isDragging ? 'dragging' : ''}
        ${isDraggable ? 'draggable' : ''}
        ${className}
      `.trim()}
      onClick={handleTaskClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ 
        '--priority-color': getPriorityColor(task.priority),
        ...style
      } as React.CSSProperties}
      {...attributes}
      {...listeners}
    >
      <div className="task-card__header">
        <div className="task-title-section">
          <h4 className="task-title">{task.title}</h4>
          <div className="task-meta-row">
            <span className="task-id">#{task.id}</span>
            <span className="task-status-badge">
              <span className="status-icon">{getStatusIcon(task.status)}</span>
              <span className="status-text">{task.status}</span>
            </span>
          </div>
        </div>
        <div className="task-priority">
          <span 
            className="priority-icon" 
            title={`${task.priority} priority`}
          >
            {getPriorityIcon(task.priority)}
          </span>
        </div>
      </div>

      {showFullDetails && task.description && (
        <div className="task-card__description">
          <p className="task-description">{task.description}</p>
        </div>
      )}

      {showFullDetails && (
        <div className="task-card__metadata">
          <div className="task-metadata-row">
            {task.estimatedHours && (
              <div className="task-meta-item">
                <span className="meta-icon">⏱️</span>
                <span className="meta-value">{task.estimatedHours}h</span>
              </div>
            )}
            
            {task.complexity && (
              <div className="task-meta-item">
                <span className="meta-icon">🔧</span>
                <span className="meta-value">{task.complexity}/10</span>
              </div>
            )}
            
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="task-meta-item">
                <span className="meta-icon">📋</span>
                <span className="meta-value">
                  {task.subtasks.filter(st => st.status === 'done').length}/{task.subtasks.length}
                </span>
              </div>
            )}
          </div>
          
          {task.assignedTo && (
            <div className="task-assignee">
              <span className="assignee-icon">👤</span>
              <span className="assignee-name">{task.assignedTo}</span>
            </div>
          )}
        </div>
      )}

      {showFullDetails && task.tags && task.tags.length > 0 && (
        <div className="task-card__tags">
          {task.tags.slice(0, compact ? 2 : 3).map((tag, index) => (
            <span key={index} className="task-tag">
              {tag}
            </span>
          ))}
          {task.tags.length > (compact ? 2 : 3) && (
            <span className="task-tag more-tags">
              +{task.tags.length - (compact ? 2 : 3)}
            </span>
          )}
        </div>
      )}

      {showFullDetails && task.dueDate && (
        <div className={`task-card__due-date ${isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : ''}`}>
          <span className="due-icon">📅</span>
          <span className="due-date">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
      )}

      {showFullDetails && task.dependencies && task.dependencies.length > 0 && (
        <div className="task-card__dependencies">
          <span className="dependencies-icon">🔗</span>
          <span className="dependencies-text">
            Depends on: {task.dependencies.join(', ')}
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;