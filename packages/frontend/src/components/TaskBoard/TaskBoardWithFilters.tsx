import React, { useState, useCallback } from 'react';
import { FilterSortControls } from './FilterSortControls';
import { useTaskFiltersIntegration } from '../../hooks/useTaskFiltersIntegration';
import type { FilterOptions, SortOptions } from './FilterSortControls';
import './TaskBoardWithFilters.css';

export interface TaskBoardWithFiltersProps {
  repositoryPath: string;
  onTasksChange?: (tasks: any[]) => void;
  onLoadingChange?: (loading: boolean) => void;
  onErrorChange?: (error: Error | null) => void;
  className?: string;
}

/**
 * Task Board with integrated filtering and sorting controls
 * 
 * This component combines the FilterSortControls with the backend API integration,
 * providing a complete filtering and sorting solution for the task board.
 */
export const TaskBoardWithFilters: React.FC<TaskBoardWithFiltersProps> = ({
  repositoryPath,
  onTasksChange,
  onLoadingChange,
  onErrorChange,
  className = ''
}) => {
  const [, setLastError] = useState<Error | null>(null);

  const integration = useTaskFiltersIntegration({
    repositoryPath,
    onTasksChange,
    onFilterChange: (filters) => {
      console.log('Filters changed:', filters);
    },
    onSortChange: (sorting) => {
      console.log('Sorting changed:', sorting);
    },
    onError: (error) => {
      setLastError(error);
      onErrorChange?.(error);
    }
  });

  const {
    tasks,
    loading,
    error,
    totalCount,
    filteredCount,
    availableAssignees,
    filters,
    sorting,
    updateFilter,
    updateSort,
    clearFilters,
    refetchTasks,
    hasActiveFilters,
    hasActiveSort
  } = integration;

  // Notify parent of loading state changes
  React.useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  // Notify parent of error state changes
  React.useEffect(() => {
    onErrorChange?.(error);
  }, [error, onErrorChange]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    Object.entries(newFilters).forEach(([key, value]) => {
      if (filters[key as keyof FilterOptions] !== value) {
        updateFilter(key as keyof FilterOptions, value);
      }
    });
  }, [filters, updateFilter]);

  // Handle sort changes
  const handleSortChange = useCallback((newSorting: SortOptions) => {
    Object.entries(newSorting).forEach(([key, value]) => {
      if (sorting[key as keyof SortOptions] !== value) {
        updateSort(key as keyof SortOptions, value);
      }
    });
  }, [sorting, updateSort]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // Handle retry after error
  const handleRetry = useCallback(async () => {
    setLastError(null);
    try {
      await refetchTasks();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refetch tasks');
      setLastError(error);
      onErrorChange?.(error);
    }
  }, [refetchTasks, onErrorChange]);

  return (
    <div className={`task-board-with-filters ${className}`}>
      {/* Filter/Sort Controls */}
      <FilterSortControls
        filters={filters}
        sorting={sorting}
        availableAssignees={availableAssignees}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        taskCount={totalCount}
        filteredCount={filteredCount}
        className="task-board-filters"
      />

      {/* Loading State */}
      {loading && (
        <div className="task-board-loading">
          <div className="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="task-board-error">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h3>Error Loading Tasks</h3>
            <p>{error.message}</p>
            <div className="error-actions">
              <button onClick={handleRetry} className="retry-button">
                Retry
              </button>
              <button 
                onClick={() => {
                  setLastError(null);
                  onErrorChange?.(null);
                }} 
                className="dismiss-button"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Results Summary */}
      {!loading && !error && (
        <div className="task-results-summary">
          <div className="results-info">
            <span className="results-count">
              {filteredCount} of {totalCount} tasks
            </span>
            {hasActiveFilters && (
              <span className="active-filters-indicator">
                Filtered
              </span>
            )}
            {hasActiveSort && (
              <span className="active-sort-indicator">
                Sorted
              </span>
            )}
          </div>
          
          {tasks.length === 0 && totalCount > 0 && (
            <div className="no-results">
              <p>No tasks match the current filters.</p>
              <button onClick={handleClearFilters} className="clear-filters-button">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Task List Container */}
      <div className="task-list-container">
        {!loading && !error && tasks.length > 0 && (
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-item">
                <div className="task-header">
                  <h4 className="task-title">{task.title}</h4>
                  <div className="task-badges">
                    <span className={`status-badge ${task.status}`}>
                      {task.status}
                    </span>
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                <div className="task-meta">
                  <span className="task-id">#{task.id}</span>
                  {task.assignee && (
                    <span className="task-assignee">
                      👤 {task.assignee}
                    </span>
                  )}
                  {task.complexity && (
                    <span className="task-complexity">
                      ⚡ {task.complexity}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && tasks.length === 0 && totalCount === 0 && (
          <div className="no-tasks">
            <div className="no-tasks-icon">📋</div>
            <h3>No Tasks Found</h3>
            <p>This repository doesn't contain any tasks yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskBoardWithFilters;