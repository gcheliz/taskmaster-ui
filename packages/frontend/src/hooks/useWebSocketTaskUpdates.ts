import { useEffect, useCallback, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useWebSocket } from './useWebSocket';
import { WebSocketState } from '../types/websocket';

interface TaskSyncMessage {
  type: string;
  event?: string;
  repositoryPath?: string;
  payload: {
    repositoryPath?: string;
    tasks?: any;
    error?: string;
  };
}

export interface TaskUpdateHandler {
  onTasksUpdated?: (repositoryPath: string, tasks: any) => void;
  onRepositoryAdded?: (repositoryPath: string) => void;
  onRepositoryRemoved?: (repositoryPath: string) => void;
  onTasksError?: (repositoryPath: string, error: string) => void;
}

export interface UseWebSocketTaskUpdatesOptions {
  repositoryPath?: string;
  showNotifications?: boolean;
  notificationMessages?: CustomNotificationMessages;
  enableLogging?: boolean;
}

export interface CustomNotificationMessages {
  taskAdded?: string;
  taskUpdated?: string;
  taskDeleted?: string;
  taskMoved?: string;
  repositoryAdded?: string;
  repositoryRemoved?: string;
  connectionLost?: string;
  connectionRestored?: string;
  error?: string;
}

export interface UseWebSocketTaskUpdatesResult {
  isConnected: boolean;
  state: WebSocketState;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  subscribeToRepository: (repositoryPath: string) => void;
  unsubscribeFromRepository: (repositoryPath: string) => void;
}

export const useWebSocketTaskUpdates = (
  handlers: TaskUpdateHandler = {},
  options: UseWebSocketTaskUpdatesOptions = {}
): UseWebSocketTaskUpdatesResult => {
  const {
    repositoryPath,
    showNotifications = true,
    notificationMessages = {},
    enableLogging = true,
  } = options;

  // Use the modern WebSocket hook
  const { state, isConnected, subscribe, send } = useWebSocket({
    autoConnect: false
  });

  const { showSuccess, showError, showInfo } = useNotification();

  // Ref to store handlers to avoid stale closures
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  // Log helper
  const log = useCallback(
    (message: string, data?: any) => {
      if (enableLogging) {
        console.log(`📋 [TaskUpdates] ${message}`, data || '');
      }
    },
    [enableLogging]
  );

  // Handle task update messages
  const handleTaskUpdate = useCallback(
    (update: TaskSyncMessage) => {
      const repoPath = update.repositoryPath || update.payload?.repositoryPath;
      log(`Received ${update.event || update.type} for repository: ${repoPath}`);

      // Filter by repository if specified
      if (repositoryPath && repoPath !== repositoryPath) {
        log(
          `Ignoring update for ${repoPath} (listening to ${repositoryPath})`
        );
        return;
      }

      const { event = update.type } = update;

      switch (event) {
        case 'repository:tasks_updated':
        case 'tasks:updated':
          if (handlersRef.current.onTasksUpdated && update.payload.tasks) {
            handlersRef.current.onTasksUpdated(
              repoPath || '',
              update.payload.tasks
            );
            if (showNotifications) {
              showInfo(
                notificationMessages.taskUpdated ||
                  `Tasks updated for ${repoPath}`
              );
            }
          }
          break;

        case 'repository:added':
          if (handlersRef.current.onRepositoryAdded) {
            handlersRef.current.onRepositoryAdded(repoPath || '');
            if (showNotifications) {
              showSuccess(
                notificationMessages.repositoryAdded ||
                  `Repository ${repoPath} connected`
              );
            }
          }
          break;

        case 'repository:removed':
          if (handlersRef.current.onRepositoryRemoved) {
            handlersRef.current.onRepositoryRemoved(repoPath || '');
            if (showNotifications) {
              showInfo(
                notificationMessages.repositoryRemoved ||
                  `Repository ${repoPath} disconnected`
              );
            }
          }
          break;

        case 'tasks:error':
        case 'repository:error':
          if (handlersRef.current.onTasksError && update.payload.error) {
            handlersRef.current.onTasksError(
              repoPath || '',
              update.payload.error
            );
            if (showNotifications) {
              showError(
                notificationMessages.error ||
                  `Error with ${repoPath}: ${update.payload.error}`
              );
            }
          }
          break;

        default:
          log(`Unhandled event type: ${event}`, update);
      }
    },
    [
      repositoryPath,
      showNotifications,
      notificationMessages,
      showInfo,
      showSuccess,
      showError,
      log,
    ]
  );

  // Subscribe to task updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe('task-update', handleTaskUpdate);
    
    log('Subscribed to task updates');

    return () => {
      unsubscribe();
      log('Unsubscribed from task updates');
    };
  }, [isConnected, subscribe, handleTaskUpdate, log]);

  // Subscribe to specific repository if provided
  const subscribeToRepository = useCallback(
    (repoPath: string) => {
      if (isConnected) {
        send({
          type: 'repository:subscribe',
          payload: { repositoryPath: repoPath },
        });
        log(`Subscribed to repository: ${repoPath}`);
      }
    },
    [isConnected, send, log]
  );

  const unsubscribeFromRepository = useCallback(
    (repoPath: string) => {
      if (isConnected) {
        send({
          type: 'repository:unsubscribe',
          payload: { repositoryPath: repoPath },
        });
        log(`Unsubscribed from repository: ${repoPath}`);
      }
    },
    [isConnected, send, log]
  );

  // Auto-subscribe to repository if provided
  useEffect(() => {
    if (repositoryPath && isConnected) {
      subscribeToRepository(repositoryPath);
      return () => {
        unsubscribeFromRepository(repositoryPath);
      };
    }
  }, [repositoryPath, isConnected, subscribeToRepository, unsubscribeFromRepository]);

  // Stub methods for compatibility
  const connect = useCallback(() => {
    log('Connect method called (no-op in new implementation)');
  }, [log]);

  const disconnect = useCallback(() => {
    log('Disconnect method called (no-op in new implementation)');
  }, [log]);

  const reconnect = useCallback(() => {
    log('Reconnect method called (no-op in new implementation)');
  }, [log]);

  return {
    isConnected,
    state: state as WebSocketState,
    connect,
    disconnect,
    reconnect,
    subscribeToRepository,
    unsubscribeFromRepository,
  };
};