import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { NotificationCard } from './NotificationCard';
import './NotificationContainer.css';

export interface NotificationContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  position = 'top-right',
  className = '',
}) => {
  const { state, removeNotification } = useNotification();

  if (state.notifications.length === 0) {
    return null;
  }

  return (
    <div 
      className={`notification-container ${position} ${className}`.trim()}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
    >
      {state.notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  );
};