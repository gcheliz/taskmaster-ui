import { useEffect, useCallback, useRef } from 'react';
import { useWebSocket, type TaskSyncMessage } from '../contexts/WebSocketContext';
import { useNotification } from '../contexts/NotificationContext';

export interface TaskUpdateHandler {
  onTasksUpdated?: (repositoryPath: string, tasks: any) => void;
  onRepositoryAdded?: (repositoryPath: string) => void;
  onRepositoryRemoved?: (repositoryPath: string) => void;
  onTasksError?: (repositoryPath: string, error: string) => void;
}

export interface UseWebSocketTaskUpdatesOptions {
  // Repository to monitor (if specified, only updates for this repo will be handled)
  repositoryPath?: string;
  
  // Whether to show notifications for updates
  showNotifications?: boolean;
  
  // Custom notification messages
  notificationMessages?: {
    tasksUpdated?: string;
    repositoryAdded?: string;
    repositoryRemoved?: string;
    tasksError?: string;
  };
  
  // Whether to log update events to console
  enableLogging?: boolean;
}

export interface UseWebSocketTaskUpdatesResult {
  // Current state
  lastUpdate: TaskSyncMessage | null;
  isConnected: boolean;
  connectionState: string;
  
  // Manual refresh trigger
  requestRefresh: (repositoryPath?: string) => void;
  
  // Connection management
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

export const useWebSocketTaskUpdates = (
  handlers: TaskUpdateHandler,
  options: UseWebSocketTaskUpdatesOptions = {}
): UseWebSocketTaskUpdatesResult => {
  const {
    repositoryPath,
    showNotifications = true,
    notificationMessages = {},
    enableLogging = true,
  } = options;

  const {
    state,
    connect,
    disconnect,
    reconnect,
    sendMessage,
    onTaskUpdate,
    isConnected,
  } = useWebSocket();

  const { showSuccess, showError, showInfo } = useNotification();
  
  // Ref to store handlers to avoid stale closures
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  // Log helper
  const log = useCallback((message: string, data?: any) => {
    if (enableLogging) {
      console.log(`📋 [TaskUpdates] ${message}`, data || '');
    }
  }, [enableLogging]);

  // Handle task update messages
  const handleTaskUpdate = useCallback((update: TaskSyncMessage) => {
    log(`Received ${update.event} for repository: ${update.repositoryPath}`);
    
    // Filter by repository if specified
    if (repositoryPath && update.repositoryPath !== repositoryPath) {
      log(`Ignoring update for ${update.repositoryPath} (monitoring ${repositoryPath})`);
      return;
    }

    const currentHandlers = handlersRef.current;

    try {
      switch (update.event) {
        case 'TASKS_UPDATED':
          log('Processing tasks updated event', update.payload);
          
          if (currentHandlers.onTasksUpdated) {
            currentHandlers.onTasksUpdated(update.repositoryPath, update.payload?.tasks);
          }
          
          if (showNotifications) {
            showSuccess(
              'Tasks Updated',
              notificationMessages.tasksUpdated || `Tasks refreshed for ${update.repositoryPath}`,
              { duration: 3000 }
            );
          }
          break;

        case 'REPOSITORY_ADDED':
          log('Processing repository added event');
          
          if (currentHandlers.onRepositoryAdded) {
            currentHandlers.onRepositoryAdded(update.repositoryPath);
          }
          
          if (showNotifications) {
            showInfo(
              'Repository Added',
              notificationMessages.repositoryAdded || `Now monitoring ${update.repositoryPath}`,
              { duration: 4000 }
            );
          }
          break;

        case 'REPOSITORY_REMOVED':
          log('Processing repository removed event');
          
          if (currentHandlers.onRepositoryRemoved) {
            currentHandlers.onRepositoryRemoved(update.repositoryPath);
          }
          
          if (showNotifications) {
            showInfo(
              'Repository Removed',
              notificationMessages.repositoryRemoved || `Stopped monitoring ${update.repositoryPath}`,
              { duration: 4000 }
            );
          }
          break;

        case 'TASKS_ERROR':
          log('Processing tasks error event', update.payload);
          
          if (currentHandlers.onTasksError) {
            currentHandlers.onTasksError(
              update.repositoryPath,
              update.payload?.error || 'Unknown error occurred'
            );
          }
          
          if (showNotifications) {
            showError(
              'Tasks Error',
              notificationMessages.tasksError || `Error updating tasks for ${update.repositoryPath}`,
              { duration: 6000 }
            );
          }
          break;

        default:
          log(`Unknown event type: ${update.event}`);
      }
    } catch (error) {
      console.error('❌ Error handling task update:', error);
      if (showNotifications) {
        showError(
          'Update Handler Error',
          'Failed to process task update',
          { duration: 5000 }
        );
      }
    }
  }, [
    repositoryPath,
    showNotifications,
    notificationMessages,
    showSuccess,
    showError,
    showInfo,
    log,
  ]);

  // Request manual refresh
  const requestRefresh = useCallback((targetRepository?: string) => {
    const target = targetRepository || repositoryPath;
    
    if (target && isConnected()) {
      log(`Requesting refresh for repository: ${target}`);
      
      const success = sendMessage({
        type: 'request_refresh',
        repositoryPath: target,
        timestamp: new Date().toISOString(),
      });
      
      if (!success) {
        log('Failed to send refresh request');
        if (showNotifications) {
          showError(
            'Refresh Failed',
            'Unable to request task refresh - connection issue',
            { duration: 4000 }
          );
        }
      }
    } else {
      log('Cannot request refresh - no repository specified or not connected');
      if (showNotifications) {
        showError(
          'Refresh Failed',
          'Cannot refresh: not connected to server',
          { duration: 4000 }
        );
      }
    }
  }, [repositoryPath, isConnected, sendMessage, log, showNotifications, showError]);

  // Set up task update listener
  useEffect(() => {
    log('Setting up task update listener');
    const unsubscribe = onTaskUpdate(handleTaskUpdate);
    
    return () => {
      log('Cleaning up task update listener');
      unsubscribe();
    };
  }, [onTaskUpdate, handleTaskUpdate, log]);

  // Log connection state changes
  useEffect(() => {
    if (enableLogging) {
      log(`Connection state changed: ${state.connectionState}`);
    }
  }, [state.connectionState, log, enableLogging]);

  // Log when monitoring specific repository
  useEffect(() => {
    if (repositoryPath) {
      log(`Monitoring repository: ${repositoryPath}`);
    } else {
      log('Monitoring all repositories');
    }
  }, [repositoryPath, log]);

  return {
    lastUpdate: state.lastTaskUpdate,
    isConnected: isConnected(),
    connectionState: state.connectionState,
    requestRefresh,
    connect,
    disconnect,
    reconnect,
  };
};