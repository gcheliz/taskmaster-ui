/**
 * React Hooks for WebSocket Integration
 * Provides easy-to-use hooks for real-time collaboration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketState, WebSocketEventType } from '../types/websocket';
import type {
  WebSocketMessage,
  User,
  Task,
  TaskMovedPayload,
  TaskUpdatedPayload,
  TaskCreatedPayload,
  TaskDeletedPayload,
  UseWebSocketReturn,
  UseTaskCollaborationReturn,
  UseUserPresenceReturn,
  UserPresence,
} from '../types/websocket';
import { webSocketService } from '../services/websocket';

/**
 * Main WebSocket hook for connection management
 */
export const useWebSocket = (config?: {
  url?: string;
  autoConnect?: boolean;
  user?: User;
}): UseWebSocketReturn => {
  const [state, setState] = useState<WebSocketState>(
    WebSocketState.DISCONNECTED
  );
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const isInitialized = useRef(false);

  // Initialize WebSocket connection
  useEffect(() => {
    if (config?.autoConnect && !isInitialized.current && config.url) {
      isInitialized.current = true;

      if (config.user) {
        webSocketService.setCurrentUser(config.user);
      }

      webSocketService
        .connect({
          url: config.url,
          options: {
            heartbeatInterval: 30000,
            reconnectDelay: 1000,
            maxReconnectAttempts: 5,
            timeout: 5000,
          },
        })
        .catch(err => {
          setError(err);
          console.error('WebSocket connection failed:', err);
        });
    }

    return () => {
      if (isInitialized.current) {
        webSocketService.disconnect();
        isInitialized.current = false;
      }
    };
  }, [config?.autoConnect, config?.url, config?.user]);

  // Subscribe to connection state changes
  useEffect(() => {
    const unsubscribe = webSocketService.subscribe(
      WebSocketEventType.CONNECT,
      (payload: any) => {
        setState(webSocketService.getState());
        if (payload.connectedUsers) {
          setConnectedUsers(payload.connectedUsers);
        }
      }
    );

    // Subscribe to user presence updates
    const unsubscribeUserJoined = webSocketService.subscribe(
      WebSocketEventType.USER_JOINED,
      (payload: any) => {
        setConnectedUsers(webSocketService.getConnectedUsers());
      }
    );

    const unsubscribeUserLeft = webSocketService.subscribe(
      WebSocketEventType.USER_LEFT,
      (payload: any) => {
        setConnectedUsers(webSocketService.getConnectedUsers());
      }
    );

    // Subscribe to errors
    const unsubscribeError = webSocketService.subscribe(
      WebSocketEventType.ERROR,
      (payload: any) => {
        setError(payload.error);
      }
    );

    return () => {
      unsubscribe();
      unsubscribeUserJoined();
      unsubscribeUserLeft();
      unsubscribeError();
    };
  }, []);

  const send = useCallback(<T>(message: WebSocketMessage<T>) => {
    try {
      webSocketService.send(message);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const subscribe = useCallback(
    <T>(eventType: WebSocketEventType, callback: (payload: T) => void) => {
      return webSocketService.subscribe(eventType, callback);
    },
    []
  );

  const reconnect = useCallback(() => {
    if (config?.url) {
      webSocketService
        .connect({
          url: config.url,
          options: {
            heartbeatInterval: 30000,
            reconnectDelay: 1000,
            maxReconnectAttempts: 5,
            timeout: 5000,
          },
        })
        .catch(err => {
          setError(err);
        });
    }
  }, [config?.url]);

  return {
    state,
    isConnected: state === WebSocketState.CONNECTED,
    connectedUsers,
    send,
    subscribe,
    error,
    reconnect,
  };
};

/**
 * Hook for real-time task collaboration
 */
export const useTaskCollaboration = (
  initialTasks: Task[] = []
): UseTaskCollaborationReturn => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const { connectedUsers, send, subscribe, isConnected } = useWebSocket();

  // Subscribe to task events
  useEffect(() => {
    const unsubscribeCreated = subscribe<TaskCreatedPayload>(
      WebSocketEventType.TASK_CREATED,
      payload => {
        setTasks(prev => [...prev, payload.task]);
        setLastUpdate(new Date().toISOString());
      }
    );

    const unsubscribeUpdated = subscribe<TaskUpdatedPayload>(
      WebSocketEventType.TASK_UPDATED,
      payload => {
        setTasks(prev =>
          prev.map(task => (task.id === payload.task.id ? payload.task : task))
        );
        setLastUpdate(new Date().toISOString());
      }
    );

    const unsubscribeDeleted = subscribe<TaskDeletedPayload>(
      WebSocketEventType.TASK_DELETED,
      payload => {
        setTasks(prev => prev.filter(task => task.id !== payload.taskId));
        setLastUpdate(new Date().toISOString());
      }
    );

    const unsubscribeMoved = subscribe<TaskMovedPayload>(
      WebSocketEventType.TASK_MOVED,
      payload => {
        setTasks(prev =>
          prev.map(task => {
            if (task.id === payload.taskId) {
              return {
                ...task,
                status: payload.toColumn as Task['status'],
                position: payload.toPosition,
                column: payload.toColumn,
                updatedAt: new Date().toISOString(),
              };
            }
            return task;
          })
        );
        setLastUpdate(new Date().toISOString());
      }
    );

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
      unsubscribeMoved();
    };
  }, [subscribe]);

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      if (!isConnected) {
        setError(new Error('Not connected to WebSocket'));
        return;
      }

      setIsLoading(true);

      // Optimistically update local state
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        )
      );

      // Send update to server
      send({
        type: WebSocketEventType.TASK_UPDATED,
        payload: {
          taskId,
          updates,
        },
        timestamp: new Date().toISOString(),
      });

      setIsLoading(false);
    },
    [isConnected, send]
  );

  const moveTask = useCallback(
    (taskId: string, toColumn: string, toPosition: number) => {
      if (!isConnected) {
        setError(new Error('Not connected to WebSocket'));
        return;
      }

      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        setError(new Error('Task not found'));
        return;
      }

      setIsLoading(true);

      // Optimistically update local state
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? {
                ...t,
                status: toColumn as Task['status'],
                position: toPosition,
                column: toColumn,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );

      // Send move event to server
      send({
        type: WebSocketEventType.TASK_MOVED,
        payload: {
          taskId,
          fromColumn: task.column,
          toColumn,
          fromPosition: task.position,
          toPosition,
          movedBy: webSocketService.getCurrentUser()!,
        },
        timestamp: new Date().toISOString(),
      });

      setIsLoading(false);
    },
    [isConnected, send, tasks]
  );

  const createTask = useCallback(
    (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!isConnected) {
        setError(new Error('Not connected to WebSocket'));
        return;
      }

      setIsLoading(true);

      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically add to local state
      setTasks(prev => [...prev, newTask]);

      // Send creation event to server
      send({
        type: WebSocketEventType.TASK_CREATED,
        payload: {
          task: newTask,
          createdBy: webSocketService.getCurrentUser()!,
        },
        timestamp: new Date().toISOString(),
      });

      setIsLoading(false);
    },
    [isConnected, send]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      if (!isConnected) {
        setError(new Error('Not connected to WebSocket'));
        return;
      }

      setIsLoading(true);

      // Optimistically remove from local state
      setTasks(prev => prev.filter(task => task.id !== taskId));

      // Send deletion event to server
      send({
        type: WebSocketEventType.TASK_DELETED,
        payload: {
          taskId,
          deletedBy: webSocketService.getCurrentUser()!,
        },
        timestamp: new Date().toISOString(),
      });

      setIsLoading(false);
    },
    [isConnected, send]
  );

  return {
    tasks,
    updateTask,
    moveTask,
    createTask,
    deleteTask,
    isLoading,
    error,
    connectedUsers,
    lastUpdate,
  };
};

/**
 * Hook for user presence management
 */
export const useUserPresence = (): UseUserPresenceReturn => {
  const [userPresence, setUserPresence] = useState<
    Record<string, UserPresence>
  >({});
  const { connectedUsers, send, subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribePresence = subscribe<UserPresence>(
      WebSocketEventType.USER_PRESENCE_UPDATE,
      payload => {
        setUserPresence(prev => ({
          ...prev,
          [payload.userId]: payload,
        }));
      }
    );

    const unsubscribeCursor = subscribe<{
      userId: string;
      cursor: { x: number; y: number };
    }>(WebSocketEventType.USER_CURSOR_MOVE, payload => {
      setUserPresence(prev => ({
        ...prev,
        [payload.userId]: {
          ...prev[payload.userId],
          cursor: payload.cursor,
        },
      }));
    });

    const unsubscribeUserLeft = subscribe<{ userId: string }>(
      WebSocketEventType.USER_LEFT,
      payload => {
        setUserPresence(prev => {
          const updated = { ...prev };
          delete updated[payload.userId];
          return updated;
        });
      }
    );

    return () => {
      unsubscribePresence();
      unsubscribeCursor();
      unsubscribeUserLeft();
    };
  }, [subscribe]);

  const updatePresence = useCallback(
    (presence: Partial<UserPresence>) => {
      const currentUser = webSocketService.getCurrentUser();
      if (!currentUser) return;

      const updatedPresence = {
        userId: currentUser.id,
        user: currentUser,
        lastSeen: new Date().toISOString(),
        isActive: true,
        ...presence,
      };

      setUserPresence(prev => ({
        ...prev,
        [currentUser.id]: updatedPresence,
      }));

      send({
        type: WebSocketEventType.USER_PRESENCE_UPDATE,
        payload: updatedPresence,
        timestamp: new Date().toISOString(),
      });
    },
    [send]
  );

  const isUserActive = useCallback(
    (userId: string) => {
      const presence = userPresence[userId];
      if (!presence) return false;

      const lastSeen = new Date(presence.lastSeen);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);

      return diffMinutes < 5; // Consider user active if seen within 5 minutes
    },
    [userPresence]
  );

  const getUserCursor = useCallback(
    (userId: string) => {
      return userPresence[userId]?.cursor || null;
    },
    [userPresence]
  );

  return {
    connectedUsers,
    userPresence,
    updatePresence,
    isUserActive,
    getUserCursor,
  };
};
