/**
 * TaskBoard Search and Filter Container
 * Combines search and filter functionality with responsive layout
 */

import React, { useState, useMemo, useCallback } from 'react';
import { TaskBoardSearch } from './TaskBoardSearch';
import { TaskBoardFilters } from './TaskBoardFilters';
import { Badge } from '../ui/atoms/Badge';
import { Icon } from '../ui/atoms/Icon';
import { cn } from '../../utils/cn';
import type { TaskFilters, Task } from '../../types/task';

interface TaskBoardSearchAndFilterProps {
  /** Current search query */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
  /** Current filter values */
  filters: TaskFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: TaskFilters) => void;
  /** All available tasks for extracting filter options */
  allTasks?: Task[];
  /** Additional CSS class name */
  className?: string;
  /** Whether to show the filter panel by default */
  showFilters?: boolean;
  /** Compact mode for smaller screens */
  compact?: boolean;
}

export const TaskBoardSearchAndFilter: React.FC<TaskBoardSearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  allTasks = [],
  className,
  showFilters = true,
  compact = false,
}) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(!compact);

  // Extract unique assignees from all tasks
  const availableAssignees = useMemo(() => {
    const assignees = new Set<string>();
    allTasks.forEach(task => {
      if (task.assignedTo) {
        assignees.add(task.assignedTo);
      }
    });
    return Array.from(assignees).sort();
  }, [allTasks]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status?.length) count += filters.status.length;
    if (filters.priority?.length) count += filters.priority.length;
    if (filters.assignedTo?.length) count += filters.assignedTo.length;
    if (filters.tags?.length) count += filters.tags.length;
    return count;
  }, [filters]);

  // Check if any filters or search are active
  const hasActiveSearch = searchQuery.trim().length > 0;
  const hasActiveFilters = activeFilterCount > 0;
  const hasAnyActive = hasActiveSearch || hasActiveFilters;

  const handleClearAll = useCallback(() => {
    onSearchChange('');
    onFiltersChange({});
  }, [onSearchChange, onFiltersChange]);

  const handleToggleFilters = useCallback(() => {
    setIsFiltersExpanded(!isFiltersExpanded);
  }, [isFiltersExpanded]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Controls Row */}
      <div className={cn(
        'flex flex-col space-y-3',
        'sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4'
      )}>
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <TaskBoardSearch
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search tasks by title or description..."
          />
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Active Indicators */}
          {hasActiveSearch && (
            <Badge variant="secondary" size="sm">
              Search: "{searchQuery.length > 20 ? searchQuery.slice(0, 20) + '...' : searchQuery}"
            </Badge>
          )}
          
          {hasActiveFilters && (
            <Badge variant="primary" size="sm">
              {activeFilterCount} {activeFilterCount === 1 ? 'Filter' : 'Filters'}
            </Badge>
          )}

          {/* Clear All */}
          {hasAnyActive && (
            <button
              onClick={handleClearAll}
              className={cn(
                'text-xs text-slate-400 hover:text-slate-300 transition-colors',
                'px-2 py-1 rounded hover:bg-slate-800'
              )}
            >
              Clear all
            </button>
          )}

          {/* Filter Toggle */}
          {showFilters && (
            <button
              onClick={handleToggleFilters}
              className={cn(
                'flex items-center space-x-1 px-3 py-1.5 text-sm',
                'bg-slate-800 hover:bg-slate-700 text-slate-300',
                'border border-slate-700 rounded-md transition-colors',
                isFiltersExpanded && 'bg-slate-700 border-slate-600'
              )}
              aria-label={isFiltersExpanded ? 'Hide filters' : 'Show filters'}
            >
              <Icon icon={FunnelIcon} size="sm" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <Badge variant="primary" size="sm" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && isFiltersExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          <TaskBoardFilters
            filters={filters}
            onChange={onFiltersChange}
            availableAssignees={availableAssignees}
            isCollapsed={false}
          />
        </div>
      )}

      {/* Active Filters Summary (Mobile) */}
      {(hasActiveSearch || hasActiveFilters) && compact && (
        <div className="sm:hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">Active Filters</span>
              <button
                onClick={handleClearAll}
                className="text-xs text-slate-400 hover:text-slate-300"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {hasActiveSearch && (
                <Badge variant="secondary" size="sm">
                  Search
                </Badge>
              )}
              {filters.status?.map(status => (
                <Badge key={status} variant="pending" size="sm">
                  {status}
                </Badge>
              ))}
              {filters.priority?.map(priority => (
                <Badge key={priority} variant="warning" size="sm">
                  {priority}
                </Badge>
              ))}
              {filters.assignedTo?.map(assignee => (
                <Badge key={assignee} variant="outline" size="sm">
                  {assignee}
                </Badge>
              ))}
            </div>
          </div>
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

export default TaskBoardSearchAndFilter;