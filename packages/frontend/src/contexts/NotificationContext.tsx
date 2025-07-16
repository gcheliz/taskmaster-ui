import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';

// Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationState {
  notifications: Notification[];
}

export type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' };

// Initial state
const initialState: NotificationState = {
  notifications: [],
};

// Reducer
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };

    default:
      return state;
  }
}

// Context
export interface NotificationContextType {
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
  // Convenience methods
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  // Helper methods for common notification types
  showSuccess: (title: string, message?: string, options?: Partial<Notification>) => void;
  showError: (title: string, message?: string, options?: Partial<Notification>) => void;
  showWarning: (title: string, message?: string, options?: Partial<Notification>) => void;
  showInfo: (title: string, message?: string, options?: Partial<Notification>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
export interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const generateId = useCallback((): string => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      id: generateId(),
      duration: 5000, // Default 5 seconds
      dismissible: true, // Default dismissible
      ...notification,
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    // Auto-remove after duration if specified and > 0
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: newNotification.id });
      }, newNotification.duration);
    }
  }, [generateId]);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, []);

  // Helper methods for common notification types
  const showSuccess = useCallback((
    title: string,
    message?: string,
    options: Partial<Notification> = {}
  ) => {
    addNotification({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const showError = useCallback((
    title: string,
    message?: string,
    options: Partial<Notification> = {}
  ) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // Errors stay longer by default
      ...options,
    });
  }, [addNotification]);

  const showWarning = useCallback((
    title: string,
    message?: string,
    options: Partial<Notification> = {}
  ) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration: 6000, // Warnings stay a bit longer
      ...options,
    });
  }, [addNotification]);

  const showInfo = useCallback((
    title: string,
    message?: string,
    options: Partial<Notification> = {}
  ) => {
    addNotification({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const contextValue: NotificationContextType = {
    state,
    dispatch,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use the context
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};