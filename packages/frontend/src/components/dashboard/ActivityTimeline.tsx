import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'

export interface ActivityItem {
  id: string
  type: 'task' | 'commit' | 'comment' | 'deploy' | 'review'
  title: string
  description?: string
  user: {
    name: string
    avatar?: string
  }
  timestamp: Date
  meta?: Record<string, any>
}

interface ActivityTimelineProps {
  activities: ActivityItem[]
  loading?: boolean
  className?: string
  showLiveIndicator?: boolean
}

const ActivityIcon: React.FC<{ type: ActivityItem['type'] }> = ({ type }) => {
  const icons = {
    task: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    commit: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    comment: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    deploy: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    review: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  }

  return icons[type] || icons.task
}

const getActivityColor = (type: ActivityItem['type']) => {
  const colors = {
    task: 'text-blue-600 bg-blue-100',
    commit: 'text-green-600 bg-green-100',
    comment: 'text-purple-600 bg-purple-100',
    deploy: 'text-orange-600 bg-orange-100',
    review: 'text-pink-600 bg-pink-100',
  }
  return colors[type] || colors.task
}

const formatTimestamp = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString()
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  loading = false,
  className,
  showLiveIndicator = false,
}) => {
  const [liveIndicatorVisible, setLiveIndicatorVisible] = useState(showLiveIndicator)

  useEffect(() => {
    if (showLiveIndicator) {
      setLiveIndicatorVisible(true)
      const timer = setTimeout(() => setLiveIndicatorVisible(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [activities.length, showLiveIndicator])
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 bg-secondary-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary-200 rounded w-3/4" />
                  <div className="h-3 bg-secondary-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <AnimatePresence>
            {liveIndicatorVisible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-semantic-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-semantic-success"></span>
                </span>
                <span className="text-xs text-semantic-success font-medium">Live</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-secondary-200" />
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex gap-4"
              >
                <div className={cn(
                  'relative z-10 w-10 h-10 rounded-lg flex items-center justify-center',
                  getActivityColor(activity.type)
                )}>
                  <ActivityIcon type={activity.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">
                        {activity.title}
                      </p>
                      {activity.description && (
                        <p className="text-sm text-secondary-600 mt-1">
                          {activity.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-2">
                          {activity.user.avatar ? (
                            <img
                              src={activity.user.avatar}
                              alt={activity.user.name}
                              className="w-5 h-5 rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-secondary-300 flex items-center justify-center">
                              <span className="text-xs font-medium text-secondary-700">
                                {activity.user.name[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-secondary-600">
                            {activity.user.name}
                          </span>
                        </div>
                        <span className="text-sm text-secondary-500">
                          • {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    {activity.meta?.status && (
                      <Badge variant={
                        activity.meta.status === 'completed' ? 'success' :
                        activity.meta.status === 'in-progress' ? 'warning' :
                        'secondary'
                      }>
                        {activity.meta.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}