import React, { useState } from 'react'
import { cn } from '../../utils/cn'
import { useGitWebSocket } from '../../hooks/useGitWebSocket'
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  GitBranch, 
  GitCommit, 
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react'
import { Badge } from '../ui/atoms/Badge'
import { Button } from '../ui/atoms/Button'
import { formatDistanceToNow } from 'date-fns'

export interface GitSyncIndicatorProps {
  repositoryId: string
  className?: string
  showEvents?: boolean
  compact?: boolean
}

interface EventLog {
  id: string
  type: string
  message: string
  timestamp: Date
  icon: React.ReactNode
}

export const GitSyncIndicator: React.FC<GitSyncIndicatorProps> = ({
  repositoryId,
  className,
  showEvents = false,
  compact = false,
}) => {
  const [eventLog, setEventLog] = useState<EventLog[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const {
    isConnected,
    isSubscribed,
    syncStatus,
    lastEvent,
    refresh,
  } = useGitWebSocket({
    repositoryId,
    onGitEvent: (event) => {
      // Create event log entry
      const logEntry: EventLog = {
        id: `${Date.now()}-${Math.random()}`,
        type: event.type,
        message: getEventMessage(event.type, event.data),
        timestamp: new Date(event.data.timestamp),
        icon: getEventIcon(event.type),
      }
      
      setEventLog(prev => [logEntry, ...prev].slice(0, 10)) // Keep last 10 events
    },
    onError: (error) => {
      console.error('Git sync error:', error)
    },
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    refresh()
    // Simulate refresh completion
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const getEventMessage = (type: string, data: unknown): string => {
    const eventData = data as any
    switch (type) {
      case 'branch-changed':
        return `Switched to branch "${eventData.currentValue}"`
      case 'commit-added':
        return `New commit detected`
      case 'status-changed':
        return `Working directory status changed`
      case 'remote-updated': {
        const { currentValue } = eventData
        if (currentValue?.behind > 0) {
          return `Branch is ${currentValue.behind} commits behind`
        }
        if (currentValue?.ahead > 0) {
          return `Branch is ${currentValue.ahead} commits ahead`
        }
        return 'Remote status updated'
      }
      case 'merge-conflict':
        return 'Merge conflicts detected'
      case 'stash-changed':
        return `Stash ${eventData.currentValue > eventData.previousValue ? 'added' : 'popped'}`
      default:
        return `Git event: ${type}`
    }
  }

  const getEventIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'branch-changed':
        return <GitBranch className="w-3 h-3" />
      case 'commit-added':
        return <GitCommit className="w-3 h-3" />
      case 'status-changed':
        return <Activity className="w-3 h-3" />
      case 'remote-updated':
        return <Cloud className="w-3 h-3" />
      case 'merge-conflict':
        return <AlertCircle className="w-3 h-3 text-red-500" />
      case 'stash-changed':
        return <RefreshCw className="w-3 h-3" />
      default:
        return <Activity className="w-3 h-3" />
    }
  }

  const getSyncStatusIcon = () => {
    if (!isConnected) return <CloudOff className="w-4 h-4 text-slate-400" />
    if (!isSubscribed) return <Cloud className="w-4 h-4 text-slate-400" />
    
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Cloud className="w-4 h-4 text-slate-500" />
    }
  }

  const getSyncStatusText = () => {
    if (!isConnected) return 'Disconnected'
    if (!isSubscribed) return 'Not monitoring'
    
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...'
      case 'synced':
        return 'Synced'
      case 'error':
        return 'Sync error'
      default:
        return 'Idle'
    }
  }

  const getSyncStatusColor = () => {
    if (!isConnected || !isSubscribed) return 'text-slate-500'
    
    switch (syncStatus) {
      case 'syncing':
        return 'text-blue-600'
      case 'synced':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-slate-600'
    }
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {getSyncStatusIcon()}
        <span className={cn('text-sm', getSyncStatusColor())}>
          {getSyncStatusText()}
        </span>
        {isConnected && isSubscribed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1"
          >
            <RefreshCw className={cn('w-3 h-3', isRefreshing && 'animate-spin')} />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Status Header */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          {getSyncStatusIcon()}
          <div>
            <p className={cn('font-medium', getSyncStatusColor())}>
              {getSyncStatusText()}
            </p>
            <p className="text-xs text-slate-500">
              Real-time Git monitoring {isConnected && isSubscribed ? 'active' : 'inactive'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastEvent && (
            <Badge variant="secondary" size="sm">
              Last update: {formatDistanceToNow(new Date(lastEvent.data.timestamp), { addSuffix: true })}
            </Badge>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={!isConnected || !isSubscribed || isRefreshing}
          >
            <RefreshCw className={cn('w-4 h-4 mr-1', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Event Log */}
      {showEvents && eventLog.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Recent Git Events
          </h4>
          <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
            {eventLog.map(event => (
              <div
                key={event.id}
                className="flex items-start gap-2 p-2 rounded text-sm bg-slate-50 dark:bg-slate-800"
              >
                <div className="mt-0.5 text-slate-500">
                  {event.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 dark:text-slate-300">
                    {event.message}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">
            WebSocket disconnected. Real-time sync unavailable.
          </span>
        </div>
      )}
    </div>
  )
}

export default GitSyncIndicator