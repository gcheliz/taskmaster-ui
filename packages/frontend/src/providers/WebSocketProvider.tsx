/**
 * WebSocket Provider for Global State Management
 * Provides WebSocket context to the entire application
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  WebSocketState,
  WebSocketEventType,
} from '../types/websocket';
import type { User, WebSocketConfig } from '../types/websocket';

interface WebSocketContextType {
  state: WebSocketState;
  isConnected: boolean;
  connectedUsers: User[];
  currentUser: User | null;
  error: Error | null;
  connect: (config: WebSocketConfig, user: User) => Promise<void>;
  disconnect: () => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
  wsUrl?: string;
  autoConnect?: boolean;
  user?: User | null;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080',
  autoConnect = true,
  user,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(user || null);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    state,
    isConnected,
    connectedUsers,
    send,
    subscribe,
    error,
    reconnect,
  } = useWebSocket({
    url: wsUrl,
    autoConnect: autoConnect && !!currentUser,
    user: currentUser || undefined,
  });

  // Initialize user from localStorage if not provided
  useEffect(() => {
    if (!currentUser && autoConnect) {
      const savedUser = localStorage.getItem('taskmaster-user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setCurrentUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse saved user:', error);
        }
      }
    }
  }, [currentUser, autoConnect]);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('taskmaster-user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Handle connection events
  useEffect(() => {
    if (!isInitialized && isConnected) {
      setIsInitialized(true);
      
      // Send initial presence update
      if (currentUser) {
        send({
          type: WebSocketEventType.USER_JOINED,
          payload: {
            user: currentUser,
            presence: {
              userId: currentUser.id,
              user: currentUser,
              lastSeen: new Date().toISOString(),
              isActive: true,
              currentPage: window.location.pathname,
            },
          },
          timestamp: new Date().toISOString(),
        });
      }
    }

    return () => {
      if (isInitialized && currentUser) {
        // Send leave event when component unmounts
        send({
          type: WebSocketEventType.USER_LEFT,
          payload: {
            userId: currentUser.id,
            leftAt: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });
      }
    };
  }, [isConnected, isInitialized, currentUser, send]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (currentUser && isConnected) {
        send({
          type: WebSocketEventType.USER_PRESENCE_UPDATE,
          payload: {
            userId: currentUser.id,
            presence: {
              userId: currentUser.id,
              user: currentUser,
              lastSeen: new Date().toISOString(),
              isActive: !document.hidden,
              currentPage: window.location.pathname,
            },
          },
          timestamp: new Date().toISOString(),
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser, isConnected, send]);

  // Handle mouse movement for cursor tracking
  useEffect(() => {
    let mouseMoveTimer: NodeJS.Timeout;
    
    const handleMouseMove = (event: MouseEvent) => {
      if (currentUser && isConnected) {
        // Throttle cursor updates to avoid overwhelming the server
        clearTimeout(mouseMoveTimer);
        mouseMoveTimer = setTimeout(() => {
          send({
            type: WebSocketEventType.USER_CURSOR_MOVE,
            payload: {
              userId: currentUser.id,
              cursor: {
                x: event.clientX,
                y: event.clientY,
              },
            },
            timestamp: new Date().toISOString(),
          });
        }, 100); // Throttle to 10 updates per second
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(mouseMoveTimer);
    };
  }, [currentUser, isConnected, send]);

  const connect = async (config: WebSocketConfig, user: User) => {
    setCurrentUser(user);
    // The useWebSocket hook will handle the actual connection
  };

  const disconnect = () => {
    if (currentUser) {
      send({
        type: WebSocketEventType.USER_LEFT,
        payload: {
          userId: currentUser.id,
          leftAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    }
    setCurrentUser(null);
    setIsInitialized(false);
  };

  const contextValue: WebSocketContextType = {
    state,
    isConnected,
    connectedUsers,
    currentUser,
    error,
    connect,
    disconnect,
    reconnect,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketProvider;