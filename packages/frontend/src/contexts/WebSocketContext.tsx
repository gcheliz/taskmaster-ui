import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

// Types for WebSocket messages
export interface TaskSyncMessage {
  event: 'TASKS_UPDATED' | 'TASKS_ERROR' | 'REPOSITORY_ADDED' | 'REPOSITORY_REMOVED';
  repositoryPath: string;
  timestamp: string;
  payload?: any;
}

export interface WebSocketMessage {
  type: 'connection' | 'echo' | 'broadcast' | 'error';
  data?: TaskSyncMessage;
  message?: string;
  timestamp: string;
}

// WebSocket connection states
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface WebSocketState {
  connectionState: ConnectionState;
  lastMessage: WebSocketMessage | null;
  lastTaskUpdate: TaskSyncMessage | null;
  error: string | null;
  reconnectAttempts: number;
  connectedAt: string | null;
}

export type WebSocketAction =
  | { type: 'SET_CONNECTION_STATE'; payload: ConnectionState }
  | { type: 'SET_MESSAGE'; payload: WebSocketMessage }
  | { type: 'SET_TASK_UPDATE'; payload: TaskSyncMessage }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'INCREMENT_RECONNECT_ATTEMPTS' }
  | { type: 'RESET_RECONNECT_ATTEMPTS' }
  | { type: 'SET_CONNECTED_AT'; payload: string | null };

// WebSocket configuration
export interface WebSocketConfig {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  autoConnect?: boolean;
}

// Initial state
const initialState: WebSocketState = {
  connectionState: 'disconnected',
  lastMessage: null,
  lastTaskUpdate: null,
  error: null,
  reconnectAttempts: 0,
  connectedAt: null,
};

// Reducer
function webSocketReducer(state: WebSocketState, action: WebSocketAction): WebSocketState {
  switch (action.type) {
    case 'SET_CONNECTION_STATE':
      return {
        ...state,
        connectionState: action.payload,
        error: action.payload === 'connected' ? null : state.error,
      };

    case 'SET_MESSAGE':
      return {
        ...state,
        lastMessage: action.payload,
      };

    case 'SET_TASK_UPDATE':
      return {
        ...state,
        lastTaskUpdate: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        connectionState: action.payload ? 'error' : state.connectionState,
      };

    case 'INCREMENT_RECONNECT_ATTEMPTS':
      return {
        ...state,
        reconnectAttempts: state.reconnectAttempts + 1,
      };

    case 'RESET_RECONNECT_ATTEMPTS':
      return {
        ...state,
        reconnectAttempts: 0,
      };

    case 'SET_CONNECTED_AT':
      return {
        ...state,
        connectedAt: action.payload,
      };

    default:
      return state;
  }
}

// Context type
export interface WebSocketContextType {
  state: WebSocketState;
  dispatch: React.Dispatch<WebSocketAction>;
  
  // Connection methods
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  
  // Message sending
  sendMessage: (message: any) => boolean;
  
  // Event handlers
  onTaskUpdate: (handler: (update: TaskSyncMessage) => void) => () => void;
  onConnectionChange: (handler: (state: ConnectionState) => void) => () => void;
  onError: (handler: (error: string) => void) => () => void;
  
  // Status checks
  isConnected: () => boolean;
  isConnecting: () => boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Provider component
export interface WebSocketProviderProps {
  children: ReactNode;
  config?: WebSocketConfig;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children, 
  config = {} 
}) => {
  const {
    url = `ws://${window.location.hostname}:3001`,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000,
    autoConnect = true,
  } = config;

  const [state, dispatch] = useReducer(webSocketReducer, initialState);
  
  // Refs for managing WebSocket and cleanup
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const eventHandlersRef = useRef({
    taskUpdate: new Set<(update: TaskSyncMessage) => void>(),
    connectionChange: new Set<(state: ConnectionState) => void>(),
    error: new Set<(error: string) => void>(),
  });

  // Clear timeouts helper
  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('🔌 WebSocket already connected');
      return;
    }

    console.log('🔌 Connecting to WebSocket:', url);
    dispatch({ type: 'SET_CONNECTION_STATE', payload: 'connecting' });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        dispatch({ type: 'SET_CONNECTION_STATE', payload: 'connected' });
        dispatch({ type: 'SET_CONNECTED_AT', payload: new Date().toISOString() });
        dispatch({ type: 'RESET_RECONNECT_ATTEMPTS' });
        
        // Notify connection change handlers
        eventHandlersRef.current.connectionChange.forEach(handler => {
          try {
            handler('connected');
          } catch (error) {
            console.error('Error in connection change handler:', error);
          }
        });

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
          }
        }, heartbeatInterval);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', message);
          
          dispatch({ type: 'SET_MESSAGE', payload: message });

          // Handle task updates specifically
          if (message.type === 'broadcast' && message.data) {
            const taskUpdate = message.data;
            console.log('📋 Task update received:', taskUpdate);
            
            dispatch({ type: 'SET_TASK_UPDATE', payload: taskUpdate });
            
            // Notify task update handlers
            eventHandlersRef.current.taskUpdate.forEach(handler => {
              try {
                handler(taskUpdate);
              } catch (error) {
                console.error('Error in task update handler:', error);
              }
            });
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Failed to parse incoming message' });
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason);
        clearTimeouts();
        dispatch({ type: 'SET_CONNECTED_AT', payload: null });
        
        if (event.wasClean) {
          dispatch({ type: 'SET_CONNECTION_STATE', payload: 'disconnected' });
        } else {
          // Attempt to reconnect if it wasn't a clean close
          handleReconnect();
        }
        
        // Notify connection change handlers
        eventHandlersRef.current.connectionChange.forEach(handler => {
          try {
            handler('disconnected');
          } catch (error) {
            console.error('Error in connection change handler:', error);
          }
        });
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        const errorMessage = 'WebSocket connection error';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        
        // Notify error handlers
        eventHandlersRef.current.error.forEach(handler => {
          try {
            handler(errorMessage);
          } catch (error) {
            console.error('Error in error handler:', error);
          }
        });
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create WebSocket connection' });
      dispatch({ type: 'SET_CONNECTION_STATE', payload: 'error' });
    }
  }, [url, heartbeatInterval]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket...');
    clearTimeouts();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnecting');
      wsRef.current = null;
    }
    
    dispatch({ type: 'SET_CONNECTION_STATE', payload: 'disconnected' });
    dispatch({ type: 'SET_CONNECTED_AT', payload: null });
  }, [clearTimeouts]);

  // Handle reconnection logic
  const handleReconnect = useCallback(() => {
    if (state.reconnectAttempts >= maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      dispatch({ type: 'SET_CONNECTION_STATE', payload: 'error' });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reconnect after maximum attempts' });
      return;
    }

    dispatch({ type: 'SET_CONNECTION_STATE', payload: 'reconnecting' });
    dispatch({ type: 'INCREMENT_RECONNECT_ATTEMPTS' });

    console.log(`🔄 Attempting to reconnect (${state.reconnectAttempts + 1}/${maxReconnectAttempts})...`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, reconnectInterval);
  }, [state.reconnectAttempts, maxReconnectAttempts, reconnectInterval, connect]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    disconnect();
    dispatch({ type: 'RESET_RECONNECT_ATTEMPTS' });
    setTimeout(connect, 100);
  }, [disconnect, connect]);

  // Send message
  const sendMessage = useCallback((message: any): boolean => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ Cannot send message: WebSocket not connected');
      return false;
    }

    try {
      wsRef.current.send(JSON.stringify(message));
      console.log('📤 Message sent:', message);
      return true;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
      return false;
    }
  }, []);

  // Event handler registration
  const onTaskUpdate = useCallback((handler: (update: TaskSyncMessage) => void) => {
    eventHandlersRef.current.taskUpdate.add(handler);
    return () => {
      eventHandlersRef.current.taskUpdate.delete(handler);
    };
  }, []);

  const onConnectionChange = useCallback((handler: (state: ConnectionState) => void) => {
    eventHandlersRef.current.connectionChange.add(handler);
    return () => {
      eventHandlersRef.current.connectionChange.delete(handler);
    };
  }, []);

  const onError = useCallback((handler: (error: string) => void) => {
    eventHandlersRef.current.error.add(handler);
    return () => {
      eventHandlersRef.current.error.delete(handler);
    };
  }, []);

  // Status checks
  const isConnected = useCallback(() => {
    return state.connectionState === 'connected';
  }, [state.connectionState]);

  const isConnecting = useCallback(() => {
    return state.connectionState === 'connecting' || state.connectionState === 'reconnecting';
  }, [state.connectionState]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      clearTimeouts();
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [autoConnect, connect, clearTimeouts]);

  // Context value
  const contextValue: WebSocketContextType = {
    state,
    dispatch,
    connect,
    disconnect,
    reconnect,
    sendMessage,
    onTaskUpdate,
    onConnectionChange,
    onError,
    isConnected,
    isConnecting,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to use the context
export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};