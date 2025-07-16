import { useState, useEffect, useCallback } from 'react';
import { useTaskFilters } from './useTaskFilters';
import type { TaskFiltersState, ApiFilters, ApiSorting } from './useTaskFilters';
import { apiService } from '../services/api';

export interface TaskBoardOptions {
  repositoryPath: string;
  autoRefetch?: boolean;
  debounceMs?: number;
  pageSize?: number;
  onError?: (error: Error) => void;
  onDataChange?: (data: TaskBoardData) => void;
}

export interface TaskBoardData {
  tasks: Task[];
  totalCount: number;
  filteredCount: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  availableAssignees: string[];
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'done' | 'blocked' | 'deferred';
  priority: 'high' | 'medium' | 'low';
  complexity?: number;
  assignee?: string;
  description?: string;
  created?: string;
  updated?: string;
  dependencies?: string[];
}

export interface UseTaskBoardReturn {
  // Data
  data: TaskBoardData | null;
  loading: boolean;
  error: Error | null;
  
  // Filter/Sort state
  filtersState: TaskFiltersState;
  filtersActions: ReturnType<typeof useTaskFilters>['actions'];
  
  // Computed values
  hasActiveFilters: boolean;
  hasActiveSort: boolean;
  isDefaultState: boolean;
  
  // Actions
  refetch: () => Promise<void>;
  clearError: () => void;
  
  // Pagination
  currentPage: number;
  setPage: (page: number) => void;
  
  // Utility
  getFilteredTasks: (filters?: ApiFilters, sorting?: ApiSorting) => Task[];
}

/**
 * Comprehensive hook for task board functionality
 * 
 * Combines task filtering, sorting, pagination, and API integration
 * with automatic debouncing and error handling.
 */
export const useTaskBoard = (options: TaskBoardOptions): UseTaskBoardReturn => {
  const {
    repositoryPath,
    autoRefetch = true,
    debounceMs = 300,
    pageSize = 50,
    onError,
    onDataChange
  } = options;

  const [data, setData] = useState<TaskBoardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  // Initialize filter/sort state
  const filtersHook = useTaskFilters();
  const { state: filtersState, actions: filtersActions } = filtersHook;

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(filtersState.searchTerm);

  // Debounce search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(filtersState.searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filtersState.searchTerm, debounceMs]);

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, use the existing getTasksFromRepository method
      // This will be enhanced once the full API integration is complete
      const response = await apiService.getTasksFromRepository(repositoryPath);
      
      // Transform the response to match our expected format
      const tasks = response.tasks || [];
      const totalCount = tasks.length;
      
      // Extract unique assignees for filter dropdown
      const assignees = Array.from(new Set(
        tasks
          .map((task: any) => task.assignee)
          .filter(Boolean)
      )) as string[];

      const taskBoardData: TaskBoardData = {
        tasks,
        totalCount,
        filteredCount: tasks.length,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        },
        availableAssignees: assignees
      };

      setData(taskBoardData);
      setAllTasks(tasks);
      onDataChange?.(taskBoardData);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch tasks');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [
    repositoryPath,
    currentPage,
    pageSize,
    debouncedSearchTerm,
    filtersState.filters,
    filtersState.sorting,
    filtersHook,
    onError,
    onDataChange
  ]);

  // Auto-refetch when filters/sorting change
  useEffect(() => {
    if (autoRefetch) {
      fetchTasks();
    }
  }, [
    filtersState.filters,
    filtersState.sorting,
    debouncedSearchTerm,
    currentPage,
    autoRefetch,
    fetchTasks
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filtersState.filters, filtersState.sorting, debouncedSearchTerm]);

  // Client-side filtering for immediate feedback
  const getFilteredTasks = useCallback((
    customFilters?: ApiFilters,
    customSorting?: ApiSorting
  ): Task[] => {
    if (!allTasks.length) return [];

    const filters = customFilters || filtersHook.getApiFilters();
    const sorting = customSorting || filtersHook.getApiSorting();

    let filtered = [...allTasks];

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status!.includes(task.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority!.includes(task.priority));
    }

    if (filters.complexity && filters.complexity.length > 0) {
      filtered = filtered.filter(task => {
        const complexity = task.complexity || 1;
        const level = complexity >= 7 ? 'high' : complexity >= 4 ? 'medium' : 'low';
        return filters.complexity!.includes(level);
      });
    }

    if (filters.assignee && filters.assignee.length > 0) {
      filtered = filtered.filter(task => {
        const assignee = task.assignee || 'unassigned';
        return filters.assignee!.includes(assignee);
      });
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = (a as any)[sorting.field];
      let bValue = (b as any)[sorting.field];

      if (sorting.field === 'priority') {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        aValue = priorityOrder[aValue as keyof typeof priorityOrder] || 0;
        bValue = priorityOrder[bValue as keyof typeof priorityOrder] || 0;
      }

      if (sorting.field === 'status') {
        const statusOrder = { 'pending': 1, 'in-progress': 2, 'done': 3, 'blocked': 4, 'deferred': 5 };
        aValue = statusOrder[aValue as keyof typeof statusOrder] || 0;
        bValue = statusOrder[bValue as keyof typeof statusOrder] || 0;
      }

      if (sorting.field === 'created' || sorting.field === 'updated') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      if (sorting.direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [allTasks, filtersHook]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Manual refetch
  const refetch = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  // Set page with bounds checking
  const setPage = useCallback((page: number) => {
    const maxPage = data?.pagination.totalPages || 1;
    const validPage = Math.max(1, Math.min(page, maxPage));
    setCurrentPage(validPage);
  }, [data]);

  return {
    // Data
    data,
    loading,
    error,
    
    // Filter/Sort state
    filtersState,
    filtersActions,
    
    // Computed values
    hasActiveFilters: filtersHook.hasActiveFilters,
    hasActiveSort: filtersHook.hasActiveSort,
    isDefaultState: filtersHook.isDefaultState,
    
    // Actions
    refetch,
    clearError,
    
    // Pagination
    currentPage,
    setPage,
    
    // Utility
    getFilteredTasks
  };
};

export default useTaskBoard;