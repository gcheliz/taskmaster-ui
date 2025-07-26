import React from 'react'
import { Bell, BellOff } from 'lucide-react'

export interface Notification {
  id: string
  type: 'email' | 'push' | 'in-app'
  enabled: boolean
  label: string
  description?: string
}

export interface NotificationListProps {
  notifications: Notification[]
  onToggle: (id: string) => void
  className?: string
}

export const NotificationList = ({ 
  notifications, 
  onToggle, 
  className = '' 
}: NotificationListProps) => {
  return (
    <div className={`space-y-4 ${className}`} data-testid="notification-list">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {notification.label}
            </h3>
            {notification.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {notification.description}
              </p>
            )}
          </div>
          <button
            onClick={() => onToggle(notification.id)}
            className={`ml-4 p-2 rounded-lg transition-colors ${
              notification.enabled 
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            aria-label={`${notification.enabled ? 'Disable' : 'Enable'} ${notification.label}`}
          >
            {notification.enabled ? (
              <Bell className="w-5 h-5" />
            ) : (
              <BellOff className="w-5 h-5" />
            )}
          </button>
        </div>
      ))}
    </div>
  )
}