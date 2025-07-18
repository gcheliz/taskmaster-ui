/**
 * Hook for Task Search and Filtering
 * Manages search query, filters, and filtered results
 */

import { useState, useMemo, useCallback } from 'react';
import type { Task, TaskFilters } from '../types/task';
import { filterTasks } from '../types/task';

interface UseTaskSearchOptions {
  /** All available tasks */
  tasks: Task[];
  /** Initial search query */
  initialSearch?: string;
  /** Initial filters */
  initialFilters?: TaskFilters;
  /** Debounce delay for search in milliseconds */
  debounceMs?: number;
}

interface UseTaskSearchReturn {
  /** Current search query */
  searchQuery: string;
  /** Update search query */
  setSearchQuery: (query: string) => void;
  /** Current filters */
  filters: TaskFilters;
  /** Update filters */
  setFilters: (filters: TaskFilters) => void;
  /** Filtered tasks based on search and filters */
  filteredTasks: Task[];
  /** Number of tasks matching the filters */
  filteredCount: number;
  /** Total number of tasks */
  totalCount: number;
  /** Whether any filters are active */
  hasActiveFilters: boolean;
  /** Whether search is active */
  hasActiveSearch: boolean;
  /** Clear all filters and search */
  clearAll: () => void;
  /** Reset to initial state */
  reset: () => void;
}

export const useTaskSearch = ({
  tasks,
  initialSearch = '',
  initialFilters = {},
  debounceMs = 300,
}: UseTaskSearchOptions): UseTaskSearchReturn => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filters, setFilters] = useState<TaskFilters>(initialFilters);

  // Memoized filtered tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(task => {
        const searchableText = [
          task.title,
          task.description,
          task.details,
          ...(task.tags || []),
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchableText.includes(searchTerm);
      });
    }

    // Apply other filters
    if (Object.keys(filters).length > 0) {
      filtered = filterTasks(filtered, {
        ...filters,
        search: undefined, // Don't double-apply search
      });
    }

    return filtered;
  }, [tasks, searchQuery, filters]);

  const filteredCount = filteredTasks.length;
  const totalCount = tasks.length;

  const hasActiveSearch = searchQuery.trim().length > 0;
  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined
  );

  const clearAll = useCallback(() => {
    setSearchQuery('');
    setFilters({});
  }, []);

  const reset = useCallback(() => {
    setSearchQuery(initialSearch);
    setFilters(initialFilters);
  }, [initialSearch, initialFilters]);

  return {
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
    reset,
  };
};