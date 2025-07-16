import React from 'react';
import type { TaskBoardData, TaskStatus } from '../../types/task';
import { TaskColumn } from './TaskColumn';
import './TaskBoard.css';

export interface TaskBoardProps {
  /** Task board data containing columns and tasks */
  data?: TaskBoardData;
  /** Whether the board is in a loading state */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Additional CSS class name */
  className?: string;
  /** Callback when a task is clicked */
  onTaskClick?: (taskId: number) => void;
  /** Callback when a task is moved between columns */
  onTaskMove?: (taskId: number, fromStatus: TaskStatus, toStatus: TaskStatus) => void;
  /** Whether to show the create task button */
  showCreateButton?: boolean;
  /** Callback when create task is clicked */
  onCreateTask?: (status: TaskStatus) => void;
}

/**
 * Task Board Component
 * 
 * Main Kanban-style board component that displays tasks organized by status columns.
 * Supports drag-and-drop functionality and task management operations.
 */
export const TaskBoard: React.FC<TaskBoardProps> = ({
  data,
  isLoading = false,
  error = null,
  className = '',
  onTaskClick,
  onTaskMove,
  showCreateButton = true,
  onCreateTask
}) => {
  if (isLoading) {
    return (
      <div className={`task-board loading ${className}`}>
        <div className="task-board__header">
          <h2 className="task-board__title">Task Board</h2>
          <div className="task-board__stats">
            <span className="stat-item skeleton">Loading...</span>
          </div>
        </div>
        <div className="task-board__columns">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="task-column__skeleton">
              <div className="column-header__skeleton">
                <div className="skeleton-line column-title"></div>
                <div className="skeleton-line column-count"></div>
              </div>
              <div className="column-content__skeleton">
                {Array.from({ length: 2 }).map((_, cardIndex) => (
                  <div key={cardIndex} className="task-card__skeleton">
                    <div className="skeleton-line skeleton-title"></div>
                    <div className="skeleton-line skeleton-description"></div>
                    <div className="skeleton-line skeleton-meta"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`task-board error ${className}`}>
        <div className="task-board__header">
          <h2 className="task-board__title">Task Board</h2>
        </div>
        <div className="task-board__error">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <h3 className="error-title">Failed to Load Task Board</h3>
            <p className="error-message">{error}</p>
            <button 
              className="error-retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no data is provided, show empty state
  if (!data) {
    return (
      <div className={`task-board empty ${className}`}>
        <div className="task-board__header">
          <h2 className="task-board__title">Task Board</h2>
        </div>
        <div className="task-board__empty">
          <div className="empty-content">
            <span className="empty-icon">📋</span>
            <h3 className="empty-title">No Task Data Available</h3>
            <p className="empty-message">
              Connect a repository with task-master project to view tasks.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { columns, tasks, metadata } = data;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className={`task-board ${className}`}>
      <div className="task-board__header">
        <div className="header-main">
          <h2 className="task-board__title">
            Task Board
            {metadata?.projectName && (
              <span className="project-name"> - {metadata.projectName}</span>
            )}
          </h2>
          <div className="task-board__stats">
            <div className="stat-item">
              <span className="stat-icon">📊</span>
              <span className="stat-value">{totalTasks}</span>
              <span className="stat-label">total tasks</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🔄</span>
              <span className="stat-value">{inProgressTasks}</span>
              <span className="stat-label">in progress</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">✅</span>
              <span className="stat-value">{completedTasks}</span>
              <span className="stat-label">completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📈</span>
              <span className="stat-value">{completionRate}%</span>
              <span className="stat-label">completion</span>
            </div>
          </div>
        </div>
        
        {showCreateButton && (
          <div className="header-actions">
            <button 
              className="create-task-button"
              onClick={() => onCreateTask?.('pending')}
              title="Create new task"
            >
              <span className="button-icon">➕</span>
              New Task
            </button>
          </div>
        )}
      </div>

      <div className="task-board__columns">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            column={column}
            onTaskClick={onTaskClick}
            onTaskMove={onTaskMove}
            showCreateButton={showCreateButton}
            onCreateTask={onCreateTask}
          />
        ))}
      </div>

      {metadata?.updated && (
        <div className="task-board__footer">
          <span className="last-updated">
            Last updated: {new Date(metadata.updated).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;