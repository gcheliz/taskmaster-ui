/**
 * Collaborative Task Board Component
 * Enhanced TaskBoard with real-time collaboration features
 */

import React, { useEffect, useState, useCallback } from 'react'
import { TaskBoard, type TaskBoardProps } from './TaskBoard'
import { CollaborationStatus, UserCursor } from '../Collaboration/UserPresence'
import { useTaskCollaboration, useUserPresence } from '../../hooks/useWebSocket'
import { useWebSocketContext } from '../../providers/WebSocketProvider'
import { Toast } from '../ui/molecules/Toast'
import { Badge } from '../ui/atoms/Badge'
import { Icon, CheckIcon, XMarkIcon } from '../ui/atoms/Icon'
import type { Task, TaskStatus } from '../../types/websocket'
import { cn } from '../../utils/cn'

interface CollaborativeTaskBoardProps extends Omit<TaskBoardProps, 'data' | 'onTaskMove'> {
  /** Initial tasks to display */
  initialTasks?: Task[]
  /** Board ID for collaboration */
  boardId?: string
  /** Whether to show collaboration features */
  showCollaboration?: boolean
  /** Whether to show user cursors */
  showUserCursors?: boolean
  /** Callback when a task is moved */
  onTaskMove?: (taskId: string, fromStatus: TaskStatus, toStatus: TaskStatus) => void
  /** Callback when a task is created */
  onTaskCreate?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  /** Callback when a task is updated */
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  /** Callback when a task is deleted */
  onTaskDelete?: (taskId: string) => void
}

export const CollaborativeTaskBoard: React.FC<CollaborativeTaskBoardProps> = ({
  initialTasks = [],
  boardId = 'default',
  showCollaboration = true,
  showUserCursors = true,
  onTaskMove,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  className,
  ...props
}) => {
  const { isConnected, error: wsError } = useWebSocketContext()
  const { connectedUsers, userPresence } = useUserPresence()
  const { tasks, updateTask, moveTask, createTask, deleteTask, isLoading, error, lastUpdate } =
    useTaskCollaboration(initialTasks)

  const [notifications, setNotifications] = useState<
    Array<{
      id: string
      type: 'info' | 'success' | 'warning' | 'error'
      message: string
      timestamp: string
    }>
  >([])

  // Convert our Task type to the expected TaskBoardData format
  const taskBoardData = React.useMemo(() => {
    const columns = [
      {
        id: 'pending',
        title: 'To Do',
        status: 'pending' as TaskStatus,
        tasks: [] as any[],
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        status: 'in-progress' as TaskStatus,
        tasks: [] as any[],
      },
      {
        id: 'done',
        title: 'Done',
        status: 'done' as TaskStatus,
        tasks: [] as any[],
      },
      {
        id: 'blocked',
        title: 'Blocked',
        status: 'blocked' as TaskStatus,
        tasks: [] as any[],
      },
    ]

    const convertedTasks = tasks.map((task) => ({
      id: parseInt(task.id.replace('task-', ''), 10) || Math.random(),
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
      assignedTo: task.assignee?.name || '',
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      tags: task.tags || [],
      complexity: task.complexity || 1,
    }))

    // Group tasks by status into columns
    columns.forEach((column) => {
      column.tasks = convertedTasks.filter((task) => task.status === column.status)
    })

    return {
      columns,
      tasks: convertedTasks,
      metadata: {
        projectName: 'TaskMaster Collaboration',
        updated: lastUpdate || new Date().toISOString(),
        created: new Date().toISOString(),
        description: 'Real-time collaborative task board',
      },
    }
  }, [tasks, lastUpdate])

  // Handle task movements
  const handleTaskMove = useCallback(
    (taskId: number, fromStatus: TaskStatus, toStatus: TaskStatus) => {
      const stringTaskId = `task-${taskId}`
      const task = tasks.find((t) => t.id === stringTaskId)

      if (task) {
        const fromPosition = task.position
        const toPosition = tasks.filter((t) => t.status === toStatus).length

        moveTask(stringTaskId, toStatus, toPosition)
        onTaskMove?.(stringTaskId, fromStatus, toStatus)

        // Show notification for task movement
        addNotification({
          type: 'info',
          message: `Task "${task.title}" moved from ${fromStatus} to ${toStatus}`,
        })
      }
    },
    [tasks, moveTask, onTaskMove]
  )

  // Handle task creation
  const handleTaskCreate = useCallback(
    (status: TaskStatus) => {
      const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: 'New Task',
        description: '',
        status,
        priority: 'medium',
        position: tasks.filter((t) => t.status === status).length,
        column: status,
        tags: [],
        complexity: 1,
      }

      createTask(newTask)
      onTaskCreate?.(newTask)

      addNotification({
        type: 'success',
        message: 'New task created successfully',
      })
    },
    [tasks, createTask, onTaskCreate]
  )

  // Add notification helper
  const addNotification = useCallback(
    (notification: Omit<(typeof notifications)[0], 'id' | 'timestamp'>) => {
      const newNotification = {
        ...notification,
        id: `notification-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
      }

      setNotifications((prev) => [...prev, newNotification])

      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id))
      }, 5000)
    },
    []
  )

  // Listen for collaboration events
  useEffect(() => {
    if (lastUpdate) {
      addNotification({
        type: 'info',
        message: 'Board updated by collaborator',
      })
    }
  }, [lastUpdate, addNotification])

  // Handle WebSocket connection errors
  useEffect(() => {
    if (wsError) {
      addNotification({
        type: 'error',
        message: `Connection error: ${wsError.message}`,
      })
    }
  }, [wsError, addNotification])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <div className={cn('relative', className)}>
      {/* Collaboration Status Header */}
      {showCollaboration && (
        <div className="mb-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CollaborationStatus />

              {!isConnected && (
                <Badge variant="error" size="sm">
                  Disconnected
                </Badge>
              )}

              {isConnected && (
                <Badge variant="success" size="sm">
                  Connected
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2 text-sm text-slate-400">
              {lastUpdate && <span>Last sync: {new Date(lastUpdate).toLocaleTimeString()}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Task Board */}
      <TaskBoard
        {...props}
        data={taskBoardData}
        isLoading={isLoading}
        error={error?.message || undefined}
        onTaskMove={handleTaskMove as any}
        onCreateTask={handleTaskCreate as any}
        className={cn('collaborative-task-board', className)}
      />

      {/* User Cursors */}
      {showUserCursors && (
        <>
          {connectedUsers.map((user) => (
            <UserCursor key={user.id} userId={user.id} />
          ))}
        </>
      )}

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
            duration={5000}
          />
        ))}
      </div>

      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="flex items-center space-x-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
            <div className="w-2 h-2 bg-accent-warning rounded-full animate-pulse" />
            <span className="text-sm text-slate-300">Reconnecting...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CollaborativeTaskBoard
