import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Icon, TimeIcon } from '../atoms/Icon';
import type { TaskStatus, TaskPriority } from '../../../types/task';

export interface DragData {
  type: 'task';
  taskId: number;
  status: TaskStatus;
}

export interface KanbanTaskCardProps {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  complexity?: number;
  estimatedHours?: number;
  assignedTo?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
  subtasks?: Array<{
    id: number;
    title: string;
    status: TaskStatus;
  }>;
  onClick?: (taskId: number) => void;
  isDragging?: boolean;
  isDraggable?: boolean;
  className?: string;
}

const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({
  id,
  title,
  description,
  status,
  priority,
  complexity,
  estimatedHours,
  assignedTo,
  tags,
  createdAt: _createdAt,
  updatedAt,
  dueDate,
  subtasks,
  onClick,
  isDragging = false,
  isDraggable = true,
  className = ''
}) => {
  // Configure draggable behavior
  const dragData: DragData = {
    type: 'task',
    taskId: id,
    status: status,
  };

  const { attributes, listeners, setNodeRef, transform, isDragging: dndIsDragging } =
    useDraggable({
      id: `task-${id}`,
      data: dragData,
      disabled: !isDraggable,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const isCurrentlyDragging = isDragging || dndIsDragging;
  const getPriorityColor = (taskPriority: TaskPriority) => {
    switch (taskPriority) {
      case 'urgent':
        return 'border-l-error-500 bg-error-50/50 dark:bg-error-900/20';
      case 'high':
        return 'border-l-warning-500 bg-warning-50/50 dark:bg-warning-900/20';
      case 'medium':
        return 'border-l-primary-500 bg-primary-50/50 dark:bg-primary-900/20';
      case 'low':
        return 'border-l-secondary-500 bg-secondary-50/50 dark:bg-secondary-900/20';
      default:
        return 'border-l-secondary-500 bg-secondary-50/50 dark:bg-secondary-900/20';
    }
  };

  const getPriorityBadgeVariant = (taskPriority: TaskPriority): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    switch (taskPriority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'primary';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (taskStatus: TaskStatus): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    switch (taskStatus) {
      case 'pending':
        return 'secondary';
      case 'in-progress':
        return 'primary';
      case 'done':
        return 'success';
      case 'blocked':
        return 'error';
      case 'cancelled':
        return 'error';
      case 'deferred':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const formatStatusText = (taskStatus: TaskStatus) => {
    return taskStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getSubtaskProgress = () => {
    if (!subtasks || subtasks.length === 0) return null;
    const completedCount = subtasks.filter(subtask => subtask.status === 'done').length;
    const totalCount = subtasks.length;
    const percentage = (completedCount / totalCount) * 100;
    return { completed: completedCount, total: totalCount, percentage };
  };

  const subtaskProgress = getSubtaskProgress();

  const isOverdue = dueDate && new Date(dueDate) < new Date();

  const handleClick = () => {
    if (onClick && !isCurrentlyDragging) {
      onClick(id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Merge accessibility attributes with DnD attributes
  const mergedAttributes = {
    ...attributes,
    role: 'button',
    tabIndex: isDraggable ? 0 : -1,
    'aria-label': `Task ${title}, priority ${priority}, status ${status}. ${isDraggable ? 'Press space to drag.' : ''}`,
    'aria-describedby': description ? `task-${id}-description` : undefined,
    'aria-grabbed': isCurrentlyDragging,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-task-card ${className}`}
      {...mergedAttributes}
      {...listeners}
      onKeyDown={handleKeyDown}
    >
      <Card
        variant="elevated"
        className={`
          cursor-pointer transition-all duration-200 border-l-4
          ${getPriorityColor(priority)}
          ${isCurrentlyDragging ? 'shadow-2xl scale-105 rotate-2 opacity-50' : 'hover:shadow-lg hover:scale-[1.02]'}
          ${isOverdue ? 'ring-2 ring-error-500/50' : ''}
          ${isDraggable ? 'cursor-grab' : ''}
          ${isCurrentlyDragging ? 'cursor-grabbing' : ''}
        `}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 line-clamp-2 mb-1">
                  {title}
                </h3>
                <p className="text-xs text-secondary-600 dark:text-secondary-400 line-clamp-2">
                  {description}
                </p>
              </div>
              <Badge variant="secondary" size="sm" className="ml-2 flex-shrink-0">
                #{id}
              </Badge>
            </div>

            {/* Metadata Row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Badge variant={getPriorityBadgeVariant(priority)} size="sm">
                  {priority}
                </Badge>
                {complexity && (
                  <Badge variant="secondary" size="sm">
                    C{complexity}
                  </Badge>
                )}
                {estimatedHours && (
                  <div className="flex items-center space-x-1 text-secondary-500 dark:text-secondary-500">
                    <Icon icon={TimeIcon} size="xs" />
                    <span>{estimatedHours}h</span>
                  </div>
                )}
              </div>

              {/* Assignee Avatar */}
              {assignedTo && (
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-medium text-primary-800 dark:text-primary-200">
                    {assignedTo.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar (Subtasks) */}
            {subtaskProgress && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-secondary-600 dark:text-secondary-400">
                    Subtasks ({subtaskProgress.completed}/{subtaskProgress.total})
                  </span>
                  <span className="text-secondary-600 dark:text-secondary-400">
                    {Math.round(subtaskProgress.percentage)}%
                  </span>
                </div>
                <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-1.5">
                  <div
                    className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${subtaskProgress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" size="sm" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Badge variant="secondary" size="sm" className="text-xs">
                    +{tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-secondary-500 dark:text-secondary-500">
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusBadgeVariant(status)} size="sm">
                  {formatStatusText(status)}
                </Badge>
                {isOverdue && (
                  <Badge variant="error" size="sm">
                    Overdue
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {updatedAt && (
                  <span>
                    Updated {formatDate(updatedAt)}
                  </span>
                )}
                {dueDate && !isOverdue && (
                  <span>
                    Due {formatDate(dueDate)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { KanbanTaskCard };