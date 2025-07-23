/**
 * User Presence Components for Real-Time Collaboration
 * Shows connected users and their status indicators
 */

import React from 'react'
import { Badge } from '../ui/atoms/Badge'
import { Icon, CheckIcon } from '../ui/atoms/Icon'
import { useUserPresence } from '../../hooks/useWebSocket'
import type { User } from '../../types/websocket'
import { cn } from '../../utils/cn'

interface UserAvatarProps {
  user: User
  isActive?: boolean
  size?: 'sm' | 'md' | 'lg'
  showStatus?: boolean
  className?: string
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  isActive = false,
  size = 'md',
  showStatus = true,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const statusSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserColor = (userId: string): string => {
    const colors = [
      'bg-accent-primary',
      'bg-accent-success',
      'bg-accent-warning',
      'bg-accent-error',
      'bg-accent-secondary',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ]
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[index % colors.length]
  }

  return (
    <div className={cn('relative', className)}>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className={cn(
            'rounded-full object-cover ring-2 ring-slate-800',
            sizeClasses[size],
            isActive ? 'ring-accent-success' : 'ring-slate-600'
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-slate-800',
            sizeClasses[size],
            getUserColor(user.id),
            isActive ? 'ring-accent-success' : 'ring-slate-600'
          )}
        >
          {getInitials(user.name)}
        </div>
      )}

      {showStatus && (
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-slate-800',
            statusSizes[size],
            isActive ? 'bg-accent-success' : 'bg-slate-500'
          )}
          title={isActive ? 'Online' : 'Offline'}
        />
      )}
    </div>
  )
}

interface ConnectedUsersProps {
  maxVisible?: number
  className?: string
}

export const ConnectedUsers: React.FC<ConnectedUsersProps> = ({ maxVisible = 5, className }) => {
  const { connectedUsers, isUserActive } = useUserPresence()

  if (connectedUsers.length === 0) {
    return null
  }

  const visibleUsers = connectedUsers.slice(0, maxVisible)
  const hiddenUsersCount = Math.max(0, connectedUsers.length - maxVisible)

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="flex -space-x-2">
        {visibleUsers.map((user) => (
          <UserAvatar
            key={user.id}
            user={user}
            isActive={isUserActive(user.id)}
            size="sm"
            className="hover:z-10 transition-all duration-200 hover:scale-110"
          />
        ))}

        {hiddenUsersCount > 0 && (
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-semibold text-slate-300 ring-2 ring-slate-800">
            +{hiddenUsersCount}
          </div>
        )}
      </div>

      <div className="text-sm text-slate-400">{connectedUsers.length} online</div>
    </div>
  )
}

interface UserPresenceIndicatorProps {
  userId: string
  className?: string
}

export const UserPresenceIndicator: React.FC<UserPresenceIndicatorProps> = ({
  userId,
  className,
}) => {
  const { connectedUsers, isUserActive } = useUserPresence()
  const user = connectedUsers.find((u) => u.id === userId)

  if (!user) {
    return null
  }

  const isActive = isUserActive(userId)

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <UserAvatar user={user} isActive={isActive} size="sm" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-200">{user.name}</span>
        <div className="flex items-center space-x-1">
          <Badge
            variant={isActive ? 'success' : 'secondary'}
            size="sm"
            icon={isActive ? <Icon icon={CheckIcon} size="xs" /> : undefined}
          >
            {isActive ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>
    </div>
  )
}

interface UserCursorProps {
  userId: string
  className?: string
}

export const UserCursor: React.FC<UserCursorProps> = ({ userId, className }) => {
  const { connectedUsers, getUserCursor } = useUserPresence()
  const user = connectedUsers.find((u) => u.id === userId)
  const cursor = getUserCursor(userId)

  if (!user || !cursor) {
    return null
  }

  return (
    <div
      className={cn('fixed pointer-events-none z-50 transition-all duration-100', className)}
      style={{
        left: cursor.x,
        top: cursor.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="relative">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
          <path
            d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
            fill={user.color || '#3B82F6'}
            stroke="white"
            strokeWidth="1"
          />
        </svg>

        <div
          className="absolute top-6 left-2 px-2 py-1 rounded text-xs font-medium text-white shadow-lg"
          style={{ backgroundColor: user.color || '#3B82F6' }}
        >
          {user.name}
        </div>
      </div>
    </div>
  )
}

interface CollaborationStatusProps {
  className?: string
}

export const CollaborationStatus: React.FC<CollaborationStatusProps> = ({ className }) => {
  const { connectedUsers } = useUserPresence()
  const activeUsers = connectedUsers.length

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-accent-success rounded-full animate-pulse" />
        <span className="text-sm text-slate-300">Live</span>
      </div>

      <ConnectedUsers maxVisible={3} />

      {activeUsers > 0 && (
        <Badge variant="success" size="sm">
          {activeUsers} collaborating
        </Badge>
      )}
    </div>
  )
}

export default {
  UserAvatar,
  ConnectedUsers,
  UserPresenceIndicator,
  UserCursor,
  CollaborationStatus,
}
