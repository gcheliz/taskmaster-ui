import React, { useEffect, useState } from 'react';
import type { Notification } from '../../contexts/NotificationContext';
import './NotificationCard.css';

export interface NotificationCardProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for exit animation before removing
    setTimeout(() => onDismiss(notification.id), 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <div 
      className={`notification-card ${notification.type} ${isVisible ? 'visible' : ''}`}
      role="alert"
      aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="notification-icon">
        {getIcon()}
      </div>
      
      <div className="notification-content">
        <div className="notification-title">
          {notification.title}
        </div>
        {notification.message && (
          <div className="notification-message">
            {notification.message}
          </div>
        )}
        {notification.action && (
          <button 
            className="notification-action"
            onClick={notification.action.onClick}
          >
            {notification.action.label}
          </button>
        )}
      </div>

      {notification.dismissible && (
        <button 
          className="notification-dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      )}
    </div>
  );
};