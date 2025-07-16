import { useState, useCallback, useMemo } from 'react';
import type { FilterOptions, SortOptions } from '../components/TaskBoard/FilterSortControls';

export interface TaskFiltersState {
  filters: FilterOptions;
  sorting: SortOptions;
  searchTerm: string;
}

export interface TaskFiltersActions {
  updateFilter: (key: keyof FilterOptions, value: string) => void;
  updateSort: (key: keyof SortOptions, value: string) => void;
  updateSearchTerm: (term: string) => void;
  clearFilters: () => void;
  clearSort: () => void;
  resetAll: () => void;
}

export interface UseTaskFiltersReturn {
  state: TaskFiltersState;
  actions: TaskFiltersActions;
  hasActiveFilters: boolean;
  hasActiveSort: boolean;
  isDefaultState: boolean;
  getApiFilters: () => ApiFilters;
  getApiSorting: () => ApiSorting;
}

export interface ApiFilters {
  status?: string[];
  priority?: string[];
  complexity?: string[];
  assignee?: string[];
  search?: string;
}

export interface ApiSorting {
  field: string;
  direction: 'asc' | 'desc';
}

const defaultFilters: FilterOptions = {
  priority: 'all',
  status: 'all',
  assignee: 'all',
  complexity: 'all'
};

const defaultSorting: SortOptions = {
  sortBy: 'created',
  sortOrder: 'desc'
};

const defaultState: TaskFiltersState = {
  filters: defaultFilters,
  sorting: defaultSorting,
  searchTerm: ''
};

/**
 * Custom hook for managing task filtering and sorting state
 * 
 * Provides comprehensive state management for task filters, sorting options,
 * and search functionality. Includes utilities for converting to API format
 * and detecting active filters/sorts.
 */
export const useTaskFilters = (initialState?: Partial<TaskFiltersState>): UseTaskFiltersReturn => {
  const [state, setState] = useState<TaskFiltersState>({
    ...defaultState,
    ...initialState
  });

  // Update individual filter
  const updateFilter = useCallback((key: keyof FilterOptions, value: string) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value
      }
    }));
  }, []);

  // Update sorting option
  const updateSort = useCallback((key: keyof SortOptions, value: string) => {
    setState(prev => ({
      ...prev,
      sorting: {
        ...prev.sorting,
        [key]: value
      }
    }));
  }, []);

  // Update search term
  const updateSearchTerm = useCallback((term: string) => {
    setState(prev => ({
      ...prev,
      searchTerm: term
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: defaultFilters,
      searchTerm: ''
    }));
  }, []);

  // Clear sorting
  const clearSort = useCallback(() => {
    setState(prev => ({
      ...prev,
      sorting: defaultSorting
    }));
  }, []);

  // Reset everything to defaults
  const resetAll = useCallback(() => {
    setState(defaultState);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      state.filters.priority !== 'all' ||
      state.filters.status !== 'all' ||
      state.filters.assignee !== 'all' ||
      state.filters.complexity !== 'all' ||
      state.searchTerm.trim() !== ''
    );
  }, [state]);

  // Check if sorting is different from default
  const hasActiveSort = useMemo(() => {
    return (
      state.sorting.sortBy !== defaultSorting.sortBy ||
      state.sorting.sortOrder !== defaultSorting.sortOrder
    );
  }, [state.sorting]);

  // Check if state is completely default
  const isDefaultState = useMemo(() => {
    return !hasActiveFilters && !hasActiveSort;
  }, [hasActiveFilters, hasActiveSort]);

  // Convert filters to API format
  const getApiFilters = useCallback((): ApiFilters => {
    const apiFilters: ApiFilters = {};

    if (state.filters.status !== 'all') {
      apiFilters.status = [state.filters.status];
    }

    if (state.filters.priority !== 'all') {
      apiFilters.priority = [state.filters.priority];
    }

    if (state.filters.complexity !== 'all') {
      apiFilters.complexity = [state.filters.complexity];
    }

    if (state.filters.assignee !== 'all') {
      apiFilters.assignee = [state.filters.assignee];
    }

    if (state.searchTerm.trim() !== '') {
      apiFilters.search = state.searchTerm.trim();
    }

    return apiFilters;
  }, [state]);

  // Convert sorting to API format
  const getApiSorting = useCallback((): ApiSorting => {
    return {
      field: state.sorting.sortBy,
      direction: state.sorting.sortOrder
    };
  }, [state.sorting]);

  const actions: TaskFiltersActions = {
    updateFilter,
    updateSort,
    updateSearchTerm,
    clearFilters,
    clearSort,
    resetAll
  };

  return {
    state,
    actions,
    hasActiveFilters,
    hasActiveSort,
    isDefaultState,
    getApiFilters,
    getApiSorting
  };
};

export default useTaskFilters;