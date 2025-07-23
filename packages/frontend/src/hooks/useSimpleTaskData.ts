import { useState, useEffect, useCallback } from 'react';
import type {
  TasksData,
  TaskBoardData,
  TaskFilters,
  TaskSortOptions,
} from '../types/task';
import { taskService } from '../services/taskService';
import { ApiError } from '../services/api';

export interface UseSimpleTaskDataOptions {
  repositoryPath?: string;
  projectTag?: string;
  projectId?: string;
  filePath?: string;
  autoLoad?: boolean;
  pollingInterval?: number;
  filters?: TaskFilters;
  sortOptions?: TaskSortOptions;
  enableRealtime?: boolean;
  showUpdateNotifications?: boolean;
}

export interface UseSimpleTaskDataReturn {
  taskBoardData: TaskBoardData | null;
  isLoading: boolean;
  error: string | ApiError | null;
  isRealtimeActive: boolean;
  connectionState: 'connected' | 'disconnected' | 'connecting';
  lastUpdateTime: Date | null;
  updateCount: number;
  refresh: () => Promise<void>;
  loadFromRepository: (path: string, tag?: string) => Promise<void>;
  loadFromFile: (path: string) => Promise<void>;
  loadFromProject: (id: string) => Promise<void>;
  loadSampleTasks: () => Promise<void>;
  updateFilters: (filters: TaskFilters) => void;
  updateSortOptions: (sort: TaskSortOptions) => void;
  clear: () => void;
  requestRealtimeRefresh: () => void;
  toggleRealtime: () => void;
}

export function useSimpleTaskData(
  options: UseSimpleTaskDataOptions = {}
): UseSimpleTaskDataReturn {
  const {
    repositoryPath,
    projectTag,
    projectId,
    filePath,
    autoLoad = true,
    filters = {},
    sortOptions = { field: 'createdAt', direction: 'desc' },
  } = options;

  const [tasksData, setTasksData] = useState<TasksData | null>(null);
  const [taskBoardData, setTaskBoardData] = useState<TaskBoardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | ApiError | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<TaskFilters>(filters);
  const [currentSort, setCurrentSort] = useState<TaskSortOptions>(sortOptions);

  // Transform tasks data to board data
  const updateBoardData = useCallback((data: TasksData | null) => {
    if (!data) {
      setTaskBoardData(null);
      return;
    }

    const boardData = taskService.createTaskBoard(data, currentFilters, currentSort);
    setTaskBoardData(boardData);
  }, [currentFilters, currentSort]);

  // Load tasks from repository
  const loadFromRepository = useCallback(async (path: string, tag?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await taskService.loadTasksFromRepository(path, tag);
      setTasksData(data);
      updateBoardData(data);
      setLastUpdateTime(new Date());
      setUpdateCount(prev => prev + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [updateBoardData]);

  // Load tasks from file
  const loadFromFile = useCallback(async (path: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await taskService.loadTasksFromFile(path);
      setTasksData(data);
      updateBoardData(data);
      setLastUpdateTime(new Date());
      setUpdateCount(prev => prev + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [updateBoardData]);

  // Load tasks from project
  const loadFromProject = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await taskService.loadTasksFromProject(id);
      setTasksData(data);
      updateBoardData(data);
      setLastUpdateTime(new Date());
      setUpdateCount(prev => prev + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [updateBoardData]);

  // Load sample tasks
  const loadSampleTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await taskService.loadSampleTasks();
      setTasksData(data);
      updateBoardData(data);
      setLastUpdateTime(new Date());
      setUpdateCount(prev => prev + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [updateBoardData]);

  // Refresh current data source
  const refresh = useCallback(async () => {
    if (repositoryPath) {
      await loadFromRepository(repositoryPath, projectTag);
    } else if (filePath) {
      await loadFromFile(filePath);
    } else if (projectId) {
      await loadFromProject(projectId);
    } else {
      await loadSampleTasks();
    }
  }, [repositoryPath, projectTag, filePath, projectId, loadFromRepository, loadFromFile, loadFromProject, loadSampleTasks]);

  // Update filters
  const updateFilters = useCallback((newFilters: TaskFilters) => {
    setCurrentFilters(newFilters);
    if (tasksData) {
      updateBoardData(tasksData);
    }
  }, [tasksData, updateBoardData]);

  // Update sort options
  const updateSortOptions = useCallback((newSort: TaskSortOptions) => {
    setCurrentSort(newSort);
    if (tasksData) {
      updateBoardData(tasksData);
    }
  }, [tasksData, updateBoardData]);

  // Clear data
  const clear = useCallback(() => {
    setTasksData(null);
    setTaskBoardData(null);
    setError(null);
    setLastUpdateTime(null);
    setUpdateCount(0);
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, []); // Only run on mount

  // Mock realtime functions (not implemented in this simple version)
  const requestRealtimeRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const toggleRealtime = useCallback(() => {
    // Not implemented in simple version
  }, []);

  return {
    taskBoardData,
    isLoading,
    error,
    isRealtimeActive: false,
    connectionState: 'disconnected',
    lastUpdateTime,
    updateCount,
    refresh,
    loadFromRepository,
    loadFromFile,
    loadFromProject,
    loadSampleTasks,
    updateFilters,
    updateSortOptions,
    clear,
    requestRealtimeRefresh,
    toggleRealtime,
  };
}