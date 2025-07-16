import { useEffect, useCallback } from 'react';
import { useTaskBoard } from './useTaskBoard';
import type { FilterOptions, SortOptions } from '../components/TaskBoard/FilterSortControls';

export interface TaskFiltersIntegrationOptions {
  repositoryPath: string;
  onTasksChange?: (tasks: any[]) => void;
  onFilterChange?: (filters: FilterOptions) => void;
  onSortChange?: (sorting: SortOptions) => void;
  onError?: (error: Error) => void;
}

export interface TaskFiltersIntegrationReturn {
  // Task board state
  tasks: any[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  filteredCount: number;
  availableAssignees: string[];
  
  // Filter state
  filters: FilterOptions;
  sorting: SortOptions;
  
  // Actions
  updateFilter: (key: keyof FilterOptions, value: string) => void;
  updateSort: (key: keyof SortOptions, value: string) => void;
  clearFilters: () => void;
  refetchTasks: () => Promise<void>;
  
  // Computed values
  hasActiveFilters: boolean;
  hasActiveSort: boolean;
}

/**
 * Integration hook that connects FilterSortControls with backend API
 * 
 * Provides a complete integration between the UI controls and the backend API,
 * automatically triggering API calls when filters/sort options change.
 */
export const useTaskFiltersIntegration = (
  options: TaskFiltersIntegrationOptions
): TaskFiltersIntegrationReturn => {
  const {
    repositoryPath,
    onTasksChange,
    onFilterChange,
    onSortChange,
    onError
  } = options;

  const taskBoard = useTaskBoard({
    repositoryPath,
    autoRefetch: true,
    debounceMs: 300,
    pageSize: 100,
    onError,
    onDataChange: (data) => {
      onTasksChange?.(data.tasks);
    }
  });

  const {
    data,
    loading,
    error,
    filtersState,
    filtersActions,
    hasActiveFilters,
    hasActiveSort,
    refetch
  } = taskBoard;

  // Update filter and notify parent
  const updateFilter = useCallback((key: keyof FilterOptions, value: string) => {
    filtersActions.updateFilter(key, value);
    onFilterChange?.(filtersState.filters);
  }, [filtersActions, filtersState.filters, onFilterChange]);

  // Update sort and notify parent
  const updateSort = useCallback((key: keyof SortOptions, value: string) => {
    filtersActions.updateSort(key, value);
    onSortChange?.(filtersState.sorting);
  }, [filtersActions, filtersState.sorting, onSortChange]);

  // Clear filters and notify parent
  const clearFilters = useCallback(() => {
    filtersActions.clearFilters();
    onFilterChange?.(filtersState.filters);
  }, [filtersActions, filtersState.filters, onFilterChange]);

  // Refetch tasks wrapper
  const refetchTasks = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Notify parent components of changes
  useEffect(() => {
    if (data?.tasks) {
      onTasksChange?.(data.tasks);
    }
  }, [data?.tasks, onTasksChange]);

  useEffect(() => {
    onFilterChange?.(filtersState.filters);
  }, [filtersState.filters, onFilterChange]);

  useEffect(() => {
    onSortChange?.(filtersState.sorting);
  }, [filtersState.sorting, onSortChange]);

  return {
    // Task board state
    tasks: data?.tasks || [],
    loading,
    error,
    totalCount: data?.totalCount || 0,
    filteredCount: data?.filteredCount || 0,
    availableAssignees: data?.availableAssignees || [],
    
    // Filter state
    filters: filtersState.filters,
    sorting: filtersState.sorting,
    
    // Actions
    updateFilter,
    updateSort,
    clearFilters,
    refetchTasks,
    
    // Computed values
    hasActiveFilters,
    hasActiveSort
  };
};

export default useTaskFiltersIntegration;