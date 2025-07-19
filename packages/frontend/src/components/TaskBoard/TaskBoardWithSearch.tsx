/**
 * Enhanced TaskBoard with Search and Filter Functionality
 * Combines the base TaskBoard with search and filter capabilities
 */

import React, { useMemo } from 'react';
import { TaskBoard, type TaskBoardProps } from './TaskBoard';
import { TaskBoardSearchAndFilter } from './TaskBoardSearchAndFilter';
import { useTaskSearch } from '../../hooks/useTaskSearch';
import { Badge } from '../ui/atoms/Badge';
import { Icon } from '../ui/atoms/Icon';
import { cn } from '../../utils/cn';
import type { TaskBoardData, TaskFilters, Task } from '../../types/task';

interface TaskBoardWithSearchProps extends Omit<TaskBoardProps, 'data'> {
  /** Task board data containing columns and tasks */
  data?: TaskBoardData;
  /** Whether to show search and filter controls */
  showSearchAndFilter?: boolean;
  /** Initial search query */
  initialSearch?: string;
  /** Initial filters */
  initialFilters?: TaskFilters;
  /** Whether to show the search/filter in compact mode */
  compact?: boolean;
  /** Callback when search or filters change */
  onSearchFilterChange?: (search: string, filters: TaskFilters) => void;
}

export const TaskBoardWithSearch: React.FC<TaskBoardWithSearchProps> = ({
  data,
  showSearchAndFilter = true,
  initialSearch = '',
  initialFilters = {},
  compact = false,
  onSearchFilterChange,
  className,
  ...taskBoardProps
}) => {
  // Extract all tasks from the board data
  const allTasks = useMemo(() => {
    if (!data) return [];
    return data.tasks || [];
  }, [data]);

  // Use search and filter hook
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredTasks,
    filteredCount,
    totalCount,
    hasActiveFilters,
    hasActiveSearch,
    clearAll,
  } = useTaskSearch({
    tasks: allTasks,
    initialSearch,
    initialFilters,
  });

  // Handle search change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearchFilterChange?.(query, filters);
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
    onSearchFilterChange?.(searchQuery, newFilters);
  };

  // Create filtered board data
  const filteredBoardData = useMemo(() => {
    if (!data) return undefined;

    // Group filtered tasks by status
    const tasksByStatus = filteredTasks.reduce(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      },
      {} as Record<string, Task[]>
    );

    // Update columns with filtered tasks
    const updatedColumns = data.columns.map(column => ({
      ...column,
      tasks: tasksByStatus[column.status] || [],
    }));

    return {
      ...data,
      columns: updatedColumns,
      tasks: filteredTasks,
    };
  }, [data, filteredTasks]);

  const hasAnyActive = hasActiveSearch || hasActiveFilters;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search and Filter Controls */}
      {showSearchAndFilter && (
        <div className="space-y-4">
          <TaskBoardSearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            allTasks={allTasks}
            compact={compact}
          />

          {/* Results Summary */}
          {hasAnyActive && (
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-3">
                <Icon
                  icon={SearchResultIcon}
                  size="sm"
                  className="text-slate-400"
                />
                <div className="text-sm">
                  <span className="text-slate-300">
                    Showing{' '}
                    <span className="font-medium text-white">
                      {filteredCount}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-white">{totalCount}</span>{' '}
                    tasks
                  </span>
                  {filteredCount !== totalCount && (
                    <span className="text-slate-400 ml-2">
                      ({totalCount - filteredCount} hidden)
                    </span>
                  )}
                </div>
              </div>

              {hasAnyActive && (
                <button
                  onClick={clearAll}
                  className={cn(
                    'flex items-center space-x-1 px-3 py-1.5 text-sm',
                    'text-slate-400 hover:text-slate-300',
                    'hover:bg-slate-800 rounded-md transition-colors'
                  )}
                >
                  <Icon icon={XMarkIcon} size="sm" />
                  <span>Clear all</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Task Board */}
      <div className="relative">
        {filteredCount === 0 && hasAnyActive ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 opacity-25">
              <Icon
                icon={MagnifyingGlassIcon}
                size="2xl"
                className="text-slate-400"
              />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              No tasks found
            </h3>
            <p className="text-slate-500 mb-4">
              No tasks match your search criteria. Try adjusting your filters or
              search terms.
            </p>
            <button
              onClick={clearAll}
              className={cn(
                'inline-flex items-center space-x-2 px-4 py-2',
                'bg-accent-primary hover:bg-accent-primary/90',
                'text-white rounded-lg transition-colors'
              )}
            >
              <Icon icon={XMarkIcon} size="sm" />
              <span>Clear filters</span>
            </button>
          </div>
        ) : (
          <TaskBoard
            {...taskBoardProps}
            data={filteredBoardData}
            className={cn(hasAnyActive && 'opacity-95', className)}
          />
        )}
      </div>
    </div>
  );
};

// Search result icon SVG
const SearchResultIcon = () => (
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
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
    />
  </svg>
);

// Magnifying glass icon SVG
const MagnifyingGlassIcon = () => (
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
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

// X mark icon SVG
const XMarkIcon = () => (
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
      d="M6 18 18 6M6 6l12 12"
    />
  </svg>
);

export default TaskBoardWithSearch;
