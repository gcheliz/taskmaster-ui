import { useState, useEffect, useCallback, useRef } from 'react';
import type { TasksData, TaskBoardData, TaskFilters, TaskSortOptions } from '../types/task';
import { taskService } from '../services/taskService';
import { ApiError } from '../services/api';
import { useWebSocketTaskUpdates, type TaskUpdateHandler } from './useWebSocketTaskUpdates';
import { useNotification } from '../contexts/NotificationContext';

export interface UseRealtimeTaskDataOptions {
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
  /** Polling interval for auto-refresh (in ms) - disabled when WebSocket is active */
  pollingInterval?: number;
  /** Whether to enable real-time WebSocket updates */
  enableRealtime?: boolean;
  /** Whether to show notifications for real-time updates */
  showUpdateNotifications?: boolean;
  /** Custom notification messages for real-time updates */
  notificationMessages?: {
    tasksUpdated?: string;
    repositoryAdded?: string;
    repositoryRemoved?: string;
    tasksError?: string;
  };
}

export interface UseRealtimeTaskDataReturn {
  /** Raw tasks data */
  tasksData: TasksData | null;
  /** Formatted task board data */
  taskBoardData: TaskBoardData | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Whether real-time updates are active */
  isRealtimeActive: boolean;
  /** WebSocket connection state */
  connectionState: string;
  /** Last real-time update timestamp */
  lastUpdateTime: string | null;
  /** Number of real-time updates received */
  updateCount: number;
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
  /** Request manual refresh via WebSocket */
  requestRealtimeRefresh: () => void;
  /** Toggle real-time updates */
  toggleRealtime: () => void;
}

/**
 * React hook for managing task data with real-time WebSocket updates
 * 
 * This hook combines traditional task loading with WebSocket-based real-time updates.
 * When real-time is enabled, it will automatically refresh tasks when changes are
 * detected on the backend.
 */
export function useRealtimeTaskData(options: UseRealtimeTaskDataOptions = {}): UseRealtimeTaskDataReturn {
  const [tasksData, setTasksData] = useState<TasksData | null>(null);
  const [taskBoardData, setTaskBoardData] = useState<TaskBoardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters | undefined>(options.filters);
  const [sortOptions, setSortOptions] = useState<TaskSortOptions | undefined>(options.sortOptions);
  const [isRealtimeActive, setIsRealtimeActive] = useState(options.enableRealtime ?? true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  const { showSuccess, showError, showInfo } = useNotification();

  // Refs to track the current data source for refreshing
  const currentDataSourceRef = useRef<{
    type: 'repository' | 'file' | 'project' | 'sample';
    repositoryPath?: string;
    projectTag?: string;
    projectId?: string;
    filePath?: string;
  } | null>(null);

  const {
    repositoryPath,
    projectTag,
    projectId,
    filePath,
    autoLoad = true,
    pollingInterval,
    showUpdateNotifications = true,
    notificationMessages = {}
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
      setLastUpdateTime(new Date().toISOString());
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : err instanceof Error 
          ? err.message 
          : 'Failed to load tasks';
      
      setError(errorMessage);
      setTasksData(null);
      
      if (showUpdateNotifications) {
        showError('Failed to Load Tasks', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [showUpdateNotifications, showError]);

  // Load from repository
  const loadFromRepository = useCallback(async (repoPath: string, projectTag?: string) => {
    currentDataSourceRef.current = { type: 'repository', repositoryPath: repoPath, projectTag };
    await loadTasks(() => taskService.loadTasksFromRepository(repoPath, projectTag));
  }, [loadTasks]);

  // Load from file
  const loadFromFile = useCallback(async (filePath: string) => {
    currentDataSourceRef.current = { type: 'file', filePath };
    await loadTasks(() => taskService.loadTasksFromFile(filePath));
  }, [loadTasks]);

  // Load from project
  const loadFromProject = useCallback(async (projectId: string) => {
    currentDataSourceRef.current = { type: 'project', projectId };
    await loadTasks(() => taskService.loadTasksFromProject(projectId));
  }, [loadTasks]);

  // Load sample tasks
  const loadSampleTasks = useCallback(async () => {
    currentDataSourceRef.current = { type: 'sample' };
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
    const currentSource = currentDataSourceRef.current;
    if (!currentSource) {
      await autoLoadTasks();
      return;
    }

    switch (currentSource.type) {
      case 'repository':
        if (currentSource.repositoryPath) {
          await loadFromRepository(currentSource.repositoryPath, currentSource.projectTag);
        }
        break;
      case 'file':
        if (currentSource.filePath) {
          await loadFromFile(currentSource.filePath);
        }
        break;
      case 'project':
        if (currentSource.projectId) {
          await loadFromProject(currentSource.projectId);
        }
        break;
      case 'sample':
        await loadSampleTasks();
        break;
    }
  }, [autoLoadTasks, loadFromRepository, loadFromFile, loadFromProject, loadSampleTasks]);

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
    setLastUpdateTime(null);
    setUpdateCount(0);
    currentDataSourceRef.current = null;
  }, []);

  // Toggle real-time updates
  const toggleRealtime = useCallback(() => {
    setIsRealtimeActive(prev => !prev);
  }, []);

  // WebSocket event handlers
  const webSocketHandlers: TaskUpdateHandler = {
    onTasksUpdated: useCallback((repoPath: string, tasks: any) => {
      console.log('📋 Real-time task update received:', { repoPath, tasks });
      
      // Check if this update is for our current repository
      const currentSource = currentDataSourceRef.current;
      if (currentSource?.type === 'repository' && currentSource.repositoryPath === repoPath) {
        // Update tasks data directly from WebSocket payload
        if (tasks) {
          setTasksData(tasks);
          setLastUpdateTime(new Date().toISOString());
          setUpdateCount(prev => prev + 1);
          
          if (showUpdateNotifications) {
            showSuccess(
              'Tasks Updated',
              notificationMessages.tasksUpdated || 'Task board refreshed with latest changes',
              { duration: 3000 }
            );
          }
        } else {
          // If no tasks in payload, refresh from the backend
          refresh();
        }
      }
    }, [refresh, showUpdateNotifications, showSuccess, notificationMessages.tasksUpdated]),

    onRepositoryAdded: useCallback((repoPath: string) => {
      console.log('📂 Repository added to monitoring:', repoPath);
      
      if (showUpdateNotifications) {
        showInfo(
          'Repository Added',
          notificationMessages.repositoryAdded || `Now monitoring ${repoPath}`,
          { duration: 4000 }
        );
      }
    }, [showUpdateNotifications, showInfo, notificationMessages.repositoryAdded]),

    onRepositoryRemoved: useCallback((repoPath: string) => {
      console.log('📂 Repository removed from monitoring:', repoPath);
      
      if (showUpdateNotifications) {
        showInfo(
          'Repository Removed',
          notificationMessages.repositoryRemoved || `Stopped monitoring ${repoPath}`,
          { duration: 4000 }
        );
      }
    }, [showUpdateNotifications, showInfo, notificationMessages.repositoryRemoved]),

    onTasksError: useCallback((repoPath: string, error: string) => {
      console.error('❌ Real-time task error:', { repoPath, error });
      
      if (showUpdateNotifications) {
        showError(
          'Tasks Error',
          notificationMessages.tasksError || `Error updating tasks for ${repoPath}: ${error}`,
          { duration: 6000 }
        );
      }
    }, [showUpdateNotifications, showError, notificationMessages.tasksError])
  };

  // Use WebSocket for real-time updates
  const {
    isConnected,
    connectionState,
    requestRefresh: requestRealtimeRefresh,
  } = useWebSocketTaskUpdates(
    webSocketHandlers,
    {
      repositoryPath: isRealtimeActive ? repositoryPath : undefined,
      showNotifications: false, // We handle notifications ourselves
      enableLogging: true,
    }
  );

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      autoLoadTasks();
    }
  }, [autoLoad, autoLoadTasks]);

  // Polling for auto-refresh (disabled when WebSocket is active)
  useEffect(() => {
    if (pollingInterval && pollingInterval > 0 && (!isRealtimeActive || !isConnected)) {
      const interval = setInterval(() => {
        if (tasksData && !isLoading) {
          console.log('🔄 Polling refresh (WebSocket inactive)');
          refresh();
        }
      }, pollingInterval);

      return () => clearInterval(interval);
    }
  }, [pollingInterval, tasksData, isLoading, refresh, isRealtimeActive, isConnected]);

  return {
    tasksData,
    taskBoardData,
    isLoading,
    error,
    isRealtimeActive,
    connectionState,
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
    toggleRealtime
  };
}

export default useRealtimeTaskData;