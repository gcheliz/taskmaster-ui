/**
 * TaskBoard Filters Component
 * Filter controls for priority, complexity, and assignee
 */

import React from 'react';
import { Badge } from '../ui/atoms/Badge';
import { Icon } from '../ui/atoms/Icon';
import { cn } from '../../utils/cn';
import type { TaskFilters, TaskPriority, TaskStatus } from '../../types/task';

interface TaskBoardFiltersProps {
  /** Current filter values */
  filters: TaskFilters;
  /** Callback when filters change */
  onChange: (filters: TaskFilters) => void;
  /** Available assignees for filtering */
  availableAssignees?: string[];
  /** Additional CSS class name */
  className?: string;
  /** Whether filters are collapsed */
  isCollapsed?: boolean;
  /** Callback when collapse state changes */
  onToggleCollapse?: (collapsed: boolean) => void;
}

const PRIORITY_OPTIONS: {
  value: TaskPriority;
  label: string;
  variant: string;
}[] = [
  { value: 'low', label: 'Low', variant: 'success' },
  { value: 'medium', label: 'Medium', variant: 'warning' },
  { value: 'high', label: 'High', variant: 'error' },
  { value: 'urgent', label: 'Urgent', variant: 'error' },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string; variant: string }[] =
  [
    { value: 'pending', label: 'To Do', variant: 'pending' },
    { value: 'in-progress', label: 'In Progress', variant: 'in-progress' },
    { value: 'done', label: 'Done', variant: 'done' },
    { value: 'blocked', label: 'Blocked', variant: 'blocked' },
    { value: 'cancelled', label: 'Cancelled', variant: 'secondary' },
    { value: 'deferred', label: 'Deferred', variant: 'deferred' },
  ];

export const TaskBoardFilters: React.FC<TaskBoardFiltersProps> = ({
  filters,
  onChange,
  availableAssignees = [],
  className,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const handlePriorityToggle = (priority: TaskPriority) => {
    const currentPriorities = filters.priority || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority];

    onChange({
      ...filters,
      priority: newPriorities.length > 0 ? newPriorities : undefined,
    });
  };

  const handleStatusToggle = (status: TaskStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];

    onChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  const handleAssigneeToggle = (assignee: string) => {
    const currentAssignees = filters.assignedTo || [];
    const newAssignees = currentAssignees.includes(assignee)
      ? currentAssignees.filter(a => a !== assignee)
      : [...currentAssignees, assignee];

    onChange({
      ...filters,
      assignedTo: newAssignees.length > 0 ? newAssignees : undefined,
    });
  };

  const clearAllFilters = () => {
    onChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value =>
    Array.isArray(value) ? value.length > 0 : value !== undefined
  );

  return (
    <div
      className={cn(
        'bg-slate-900 border border-slate-800 rounded-lg',
        className
      )}
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Icon icon={FunnelIcon} size="sm" className="text-slate-400" />
          <h3 className="text-sm font-medium text-slate-200">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" size="sm">
              Active
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              Clear all
            </button>
          )}
          {onToggleCollapse && (
            <button
              onClick={() => onToggleCollapse(!isCollapsed)}
              className="p-1 text-slate-400 hover:text-slate-300 transition-colors"
              aria-label={isCollapsed ? 'Expand filters' : 'Collapse filters'}
            >
              <Icon
                icon={ChevronDownIcon}
                size="sm"
                className={cn(
                  'transition-transform',
                  isCollapsed && 'rotate-180'
                )}
              />
            </button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {/* Priority Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map(option => {
                const isSelected =
                  filters.priority?.includes(option.value) || false;
                return (
                  <button
                    key={option.value}
                    onClick={() => handlePriorityToggle(option.value)}
                    className={cn(
                      'inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
                      isSelected
                        ? 'bg-accent-primary text-white ring-2 ring-accent-primary/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(option => {
                const isSelected =
                  filters.status?.includes(option.value) || false;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusToggle(option.value)}
                    className={cn(
                      'inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
                      isSelected
                        ? 'bg-accent-primary text-white ring-2 ring-accent-primary/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignee Filter */}
          {availableAssignees.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Assigned To
              </label>
              <div className="flex flex-wrap gap-2">
                {availableAssignees.map(assignee => {
                  const isSelected =
                    filters.assignedTo?.includes(assignee) || false;
                  return (
                    <button
                      key={assignee}
                      onClick={() => handleAssigneeToggle(assignee)}
                      className={cn(
                        'inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
                        isSelected
                          ? 'bg-accent-primary text-white ring-2 ring-accent-primary/20'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      )}
                    >
                      {assignee}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags Filter */}
          {filters.tags && filters.tags.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Active Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {filters.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    size="sm"
                    className="border-accent-primary text-accent-primary"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Filter icon SVG
const FunnelIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
    />
  </svg>
);

// Chevron down icon SVG
const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  </svg>
);

export default TaskBoardFilters;
