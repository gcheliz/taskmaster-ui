import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types/task';
import type { DragData } from './DragAndDropProvider';

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
  isDraggable = true,
}) => {
  // Configure draggable behavior
  const dragData: DragData = {
    type: 'task',
    taskId: task.id,
    status: task.status,
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `task-${task.id}`,
      data: dragData,
      disabled: !isDraggable,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : isDraggable ? 'grab' : 'default',
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

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'done';
  const isDueSoon =
    task.dueDate &&
    !isOverdue &&
    new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Merge accessibility attributes with DnD attributes
  const mergedAttributes = {
    ...attributes,
    role: 'button',
    tabIndex: 0,
    'aria-label': `Task ${task.title}, priority ${task.priority}, status ${task.status}. Press Enter or Space to open details.`,
    'aria-describedby': task.description
      ? `task-${task.id}-description`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing
        ${task.priority === 'urgent' ? 'border-l-4 border-l-red-500' : ''}
        ${task.priority === 'high' ? 'border-l-4 border-l-orange-500' : ''}
        ${task.priority === 'medium' ? 'border-l-4 border-l-yellow-500' : ''}
        ${task.priority === 'low' ? 'border-l-4 border-l-green-500' : ''}
        ${compact ? 'p-2' : ''} 
        ${isOverdue ? 'bg-red-50 border-red-300' : ''} 
        ${isDueSoon ? 'bg-yellow-50 border-yellow-300' : ''}
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isDraggable ? 'cursor-grab hover:cursor-grab' : 'cursor-default'}
        ${className}
      `.trim()}
      onClick={handleTaskClick}
      onKeyDown={handleKeyDown}
      style={
        {
          '--priority-color': getPriorityColor(task.priority),
          ...style,
        } as React.CSSProperties
      }
      {...mergedAttributes}
      {...listeners}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">
            {task.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 font-mono">#{task.id}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
              <span className="text-xs" aria-hidden="true">
                {getStatusIcon(task.status)}
              </span>
              <span className="font-medium">{task.status}</span>
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 ml-2">
          <span className="text-lg" title={`${task.priority} priority`}>
            {getPriorityIcon(task.priority)}
          </span>
        </div>
      </div>

      {showFullDetails && task.description && (
        <div className="mb-3">
          <p
            id={`task-${task.id}-description`}
            className="text-sm text-gray-600 leading-relaxed"
          >
            {task.description}
          </p>
        </div>
      )}

      {showFullDetails && (
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            {task.estimatedHours && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="text-xs" aria-hidden="true">
                  ⏱️
                </span>
                <span className="font-medium">{task.estimatedHours}h</span>
              </div>
            )}

            {task.complexity && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="text-xs" aria-hidden="true">
                  🔧
                </span>
                <span className="font-medium">{task.complexity}/10</span>
              </div>
            )}

            {task.subtasks && task.subtasks.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="text-xs" aria-hidden="true">
                  📋
                </span>
                <span className="font-medium">
                  {task.subtasks.filter(st => st.status === 'done').length}/
                  {task.subtasks.length}
                </span>
              </div>
            )}
          </div>

          {task.assignedTo && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="text-xs" aria-hidden="true">
                👤
              </span>
              <span className="font-medium">{task.assignedTo}</span>
            </div>
          )}
        </div>
      )}

      {showFullDetails && task.tags && task.tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap mb-2">
          {task.tags.slice(0, compact ? 2 : 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-md"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > (compact ? 2 : 3) && (
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
              +{task.tags.length - (compact ? 2 : 3)}
            </span>
          )}
        </div>
      )}

      {showFullDetails && task.dueDate && (
        <div
          className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600 font-semibold' : isDueSoon ? 'text-yellow-600 font-semibold' : 'text-gray-500'}`}
        >
          <span className="text-xs" aria-hidden="true">
            📅
          </span>
          <span className="font-medium">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
      )}

      {showFullDetails && task.dependencies && task.dependencies.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span className="text-xs" aria-hidden="true">
            🔗
          </span>
          <span className="font-medium">
            Depends on: {task.dependencies.join(', ')}
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
