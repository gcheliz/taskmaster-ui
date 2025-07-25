import React from 'react'
import { Card, CardContent } from '../atoms/Card'
import { Badge } from '../atoms/Badge'
import { Icon, TaskIcon, TimeIcon } from '../atoms/Icon'

export interface TimelineItemProps {
  id?: string
  type: 'commit' | 'task_update' | 'project_update'
  timestamp: string
  message: string
  author?: string
  details?: Record<string, unknown>
  showAvatar?: boolean
  showTimestamp?: boolean
  isLast?: boolean
  className?: string
}

const TimelineItem = ({
  id: _id,
  type,
  timestamp,
  message,
  author,
  details,
  showAvatar = true,
  showTimestamp = true,
  isLast = false,
  className = '',
}: TimelineItemProps) => {
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'commit':
        return TaskIcon // Using TaskIcon for commits
      case 'task_update':
        return TaskIcon
      case 'project_update':
        return TaskIcon // Using TaskIcon for project updates
      default:
        return TaskIcon
    }
  }

  const getActivityColor = (
    activityType: string
  ): 'success' | 'primary' | 'warning' | 'error' | 'secondary' => {
    switch (activityType) {
      case 'commit':
        return 'success'
      case 'task_update':
        return 'primary'
      case 'project_update':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const getBadgeVariant = (
    activityType: string
  ): 'success' | 'primary' | 'warning' | 'error' | 'secondary' => {
    switch (activityType) {
      case 'commit':
        return 'success'
      case 'task_update':
        return 'primary'
      case 'project_update':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const formatTimestamp = (timestampStr: string) => {
    const date = new Date(timestampStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  const getAuthorInitials = (authorName?: string) => {
    if (!authorName) return '?'
    return authorName
      .split(' ')
      .map((name) => name.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  const truncateMessage = (msg: string, maxLength: number = 80) => {
    if (msg.length <= maxLength) return msg
    return msg.substring(0, maxLength) + '...'
  }

  const formatActivityType = (activityType: string) => {
    return activityType.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className={`relative flex items-start space-x-4 ${className}`}>
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700">
          <Icon icon={getActivityIcon(type)} size="sm" color={getActivityColor(type)} />
        </div>
        {!isLast && <div className="w-0.5 h-6 bg-surface-200 dark:bg-surface-700 mt-2" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Card variant="outline" className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Message */}
                <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                  {truncateMessage(message)}
                </p>

                {/* Metadata */}
                <div className="flex items-center space-x-3 text-xs text-secondary-600 dark:text-secondary-400">
                  {/* Author */}
                  {author && (
                    <div className="flex items-center space-x-2">
                      {showAvatar && (
                        <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-medium text-primary-800 dark:text-primary-200">
                          {getAuthorInitials(author)}
                        </div>
                      )}
                      <span className="font-medium">{author}</span>
                    </div>
                  )}

                  {/* Activity type badge */}
                  <Badge variant={getBadgeVariant(type)} size="sm">
                    {formatActivityType(type)}
                  </Badge>

                  {/* Timestamp */}
                  {showTimestamp && (
                    <div className="flex items-center space-x-1">
                      <Icon icon={TimeIcon} size="xs" color="muted" />
                      <span>{formatTimestamp(timestamp)}</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                {details && Object.keys(details).length > 0 && (
                  <div className="mt-3 pt-2 border-t border-surface-200 dark:border-surface-700">
                    <div className="text-xs text-secondary-500 dark:text-secondary-500 space-y-1">
                      {Object.entries(details)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <span className="font-medium capitalize">{key}:</span>
                            <span className="font-mono">{String(value)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { TimelineItem }
