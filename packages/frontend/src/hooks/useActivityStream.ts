import { useState, useEffect, useCallback } from 'react'
import type { ActivityItem } from '../components/dashboard'
import { useWebSocket } from './useWebSocket'
import { WebSocketEventType } from '../types/websocket'

interface UseActivityStreamOptions {
  maxItems?: number
  initialActivities?: ActivityItem[]
}

export const useActivityStream = ({
  maxItems = 50,
  initialActivities = [],
}: UseActivityStreamOptions = {}) => {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities)
  const { isConnected, subscribe } = useWebSocket({
    autoConnect: false, // We'll use the existing connection from the provider
  })

  const addActivity = useCallback(
    (newActivity: ActivityItem) => {
      setActivities((prev) => {
        const updated = [newActivity, ...prev]
        return updated.slice(0, maxItems)
      })
    },
    [maxItems]
  )

  useEffect(() => {
    if (!isConnected) return

    const unsubscribers: (() => void)[] = []

    // Subscribe to task events
    const handleTaskActivity = (message: any) => {
      if (
        message.type === WebSocketEventType.TASK_UPDATED ||
        message.type === WebSocketEventType.TASK_CREATED ||
        message.type === WebSocketEventType.TASK_MOVED
      ) {
        const activity: ActivityItem = {
          id: `activity-${Date.now()}-${Math.random()}`,
          type: 'task',
          title: message.payload.title || 'Task activity',
          description: message.payload.description,
          user: message.payload.user || { name: 'System' },
          timestamp: new Date(message.timestamp || Date.now()),
          meta: { taskId: message.payload.taskId, status: message.payload.status },
        }
        addActivity(activity)
      }
    }

    unsubscribers.push(
      subscribe(WebSocketEventType.TASK_UPDATED, handleTaskActivity),
      subscribe(WebSocketEventType.TASK_CREATED, handleTaskActivity),
      subscribe(WebSocketEventType.TASK_MOVED, handleTaskActivity)
    )

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [isConnected, subscribe, addActivity])

  return {
    activities,
    addActivity,
    isConnected,
  }
}
