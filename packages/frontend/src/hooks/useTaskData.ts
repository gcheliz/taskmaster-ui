import { useState, useEffect, useCallback } from 'react';
import type { TasksData, TaskBoardData, TaskFilters, TaskSortOptions } from '../types/task';
import { taskService } from '../services/taskService';
import { ApiError } from '../services/api';

export interface UseTaskDataOptions {
  /** Repository path to load tasks from */
  repositoryPath?: string;
  /** Project tag to filter tasks */
  projectTag?: string;
  /** Project ID to load tasks from */
  projectId?: string;
  /** File path to load tasks from */
  filePath?: string;
  /** Whether to auto-load tasks on mount */
  autoLoad?: boolean;
  /** Filters to apply to tasks */
  filters?: TaskFilters;
  /** Sort options for tasks */
  sortOptions?: TaskSortOptions;
  /** Polling interval for auto-refresh (in ms) */
  pollingInterval?: number;
}

export interface UseTaskDataReturn {
  /** Raw tasks data */
  tasksData: TasksData | null;
  /** Formatted task board data */
  taskBoardData: TaskBoardData | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Refresh function */
  refresh: () => Promise<void>;
  /** Load tasks from repository */
  loadFromRepository: (repositoryPath: string, projectTag?: string) => Promise<void>;
  /** Load tasks from file */
  loadFromFile: (filePath: string) => Promise<void>;
  /** Load tasks from project */
  loadFromProject: (projectId: string) => Promise<void>;
  /** Load sample tasks */
  loadSampleTasks: () => Promise<void>;
  /** Update filters */
  updateFilters: (filters: TaskFilters) => void;
  /** Update sort options */
  updateSortOptions: (sortOptions: TaskSortOptions) => void;
  /** Clear all data */
  clear: () => void;
}

/**
 * React hook for managing task data loading and state
 */
export function useTaskData(options: UseTaskDataOptions = {}): UseTaskDataReturn {
  const [tasksData, setTasksData] = useState<TasksData | null>(null);
  const [taskBoardData, setTaskBoardData] = useState<TaskBoardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters | undefined>(options.filters);
  const [sortOptions, setSortOptions] = useState<TaskSortOptions | undefined>(options.sortOptions);

  const {
    repositoryPath,
    projectTag,
    projectId,
    filePath,
    autoLoad = true,
    pollingInterval
  } = options;

  // Update task board data when tasks or filters change
  useEffect(() => {
    if (tasksData) {
      const boardData = taskService.createTaskBoard(tasksData, filters, sortOptions);
      setTaskBoardData(boardData);
    } else {
      setTaskBoardData(null);
    }
  }, [tasksData, filters, sortOptions]);

  // Generic load function
  const loadTasks = useCallback(async (loadFunction: () => Promise<TasksData>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await loadFunction();
      setTasksData(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : err instanceof Error 
          ? err.message 
          : 'Failed to load tasks';
      
      setError(errorMessage);
      setTasksData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load from repository
  const loadFromRepository = useCallback(async (repoPath: string, projectTag?: string) => {
    await loadTasks(() => taskService.loadTasksFromRepository(repoPath, projectTag));
  }, [loadTasks]);

  // Load from file
  const loadFromFile = useCallback(async (filePath: string) => {
    await loadTasks(() => taskService.loadTasksFromFile(filePath));
  }, [loadTasks]);

  // Load from project
  const loadFromProject = useCallback(async (projectId: string) => {
    await loadTasks(() => taskService.loadTasksFromProject(projectId));
  }, [loadTasks]);

  // Load sample tasks
  const loadSampleTasks = useCallback(async () => {
    await loadTasks(() => taskService.loadSampleTasks());
  }, [loadTasks]);

  // Auto-load based on options
  const autoLoadTasks = useCallback(async () => {
    if (filePath) {
      await loadFromFile(filePath);
    } else if (repositoryPath) {
      await loadFromRepository(repositoryPath, projectTag);
    } else if (projectId) {
      await loadFromProject(projectId);
    } else {
      await loadSampleTasks();
    }
  }, [filePath, repositoryPath, projectTag, projectId, loadFromFile, loadFromRepository, loadFromProject, loadSampleTasks]);

  // Refresh current data source
  const refresh = useCallback(async () => {
    if (tasksData) {
      await autoLoadTasks();
    }
  }, [tasksData, autoLoadTasks]);

  // Update filters
  const updateFilters = useCallback((newFilters: TaskFilters) => {
    setFilters(newFilters);
  }, []);

  // Update sort options
  const updateSortOptions = useCallback((newSortOptions: TaskSortOptions) => {
    setSortOptions(newSortOptions);
  }, []);

  // Clear all data
  const clear = useCallback(() => {
    setTasksData(null);
    setTaskBoardData(null);
    setError(null);
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      autoLoadTasks();
    }
  }, [autoLoad, autoLoadTasks]);

  // Polling for auto-refresh
  useEffect(() => {
    if (pollingInterval && pollingInterval > 0) {
      const interval = setInterval(() => {
        if (tasksData && !isLoading) {
          refresh();
        }
      }, pollingInterval);

      return () => clearInterval(interval);
    }
  }, [pollingInterval, tasksData, isLoading, refresh]);

  return {
    tasksData,
    taskBoardData,
    isLoading,
    error,
    refresh,
    loadFromRepository,
    loadFromFile,
    loadFromProject,
    loadSampleTasks,
    updateFilters,
    updateSortOptions,
    clear
  };
}

export default useTaskData;