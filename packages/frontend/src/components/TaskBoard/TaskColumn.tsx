import React from 'react';
import type { TaskColumn as TaskColumnType, TaskStatus } from '../../types/task';
import { TaskCard } from './TaskCard';
import './TaskColumn.css';

export interface TaskColumnProps {
  /** Column data including title, status, and tasks */
  column: TaskColumnType;
  /** Callback when a task is clicked */
  onTaskClick?: (taskId: number) => void;
  /** Callback when a task is moved between columns */
  onTaskMove?: (taskId: number, fromStatus: TaskStatus, toStatus: TaskStatus) => void;
  /** Whether to show the create task button */
  showCreateButton?: boolean;
  /** Callback when create task is clicked */
  onCreateTask?: (status: TaskStatus) => void;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Task Column Component
 * 
 * Represents a single column in the Kanban board for a specific task status.
 * Contains task cards and handles column-specific operations.
 */
export const TaskColumn: React.FC<TaskColumnProps> = ({
  column,
  onTaskClick,
  onTaskMove: _onTaskMove,
  showCreateButton = true,
  onCreateTask,
  className = ''
}) => {
  const { title, status, tasks, color, limit } = column;
  const taskCount = tasks.length;
  const isOverLimit = limit && taskCount > limit;

  const handleTaskClick = (taskId: number) => {
    if (onTaskClick) {
      onTaskClick(taskId);
    }
  };

  const handleCreateTask = () => {
    if (onCreateTask) {
      onCreateTask(status);
    }
  };

  const getStatusIcon = (status: TaskStatus): string => {
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


  return (
    <div 
      className={`task-column ${className}`}
      style={{ '--column-color': color } as React.CSSProperties}
    >
      <div className="task-column__header">
        <div className="column-title-section">
          <h3 className="column-title">
            <span className="column-icon">{getStatusIcon(status)}</span>
            {title}
          </h3>
          <div className={`column-count ${isOverLimit ? 'over-limit' : ''}`}>
            {taskCount}
            {limit && (
              <span className="column-limit">/{limit}</span>
            )}
          </div>
        </div>
        
        {showCreateButton && (
          <button 
            className="column-create-button"
            onClick={handleCreateTask}
            title={`Create task in ${title}`}
          >
            <span className="button-icon">➕</span>
          </button>
        )}
      </div>

      <div className="task-column__content">
        {tasks.length === 0 ? (
          <div className="column-empty">
            <div className="empty-message">
              <span className="empty-icon">{getStatusIcon(status)}</span>
              <span className="empty-text">No {title.toLowerCase()} tasks</span>
            </div>
            {showCreateButton && (
              <button 
                className="empty-create-button"
                onClick={handleCreateTask}
              >
                Create First Task
              </button>
            )}
          </div>
        ) : (
          <div className="task-cards">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onTaskClick={handleTaskClick}
                showFullDetails={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;