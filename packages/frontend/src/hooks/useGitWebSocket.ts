import { useEffect, useCallback, useState } from 'react'
import { useWebSocket } from './useWebSocket'

export interface GitEvent {
  type: 
    | 'branch-changed'
    | 'commit-added'
    | 'status-changed'
    | 'remote-updated'
    | 'merge-conflict'
    | 'stash-changed'
  repositoryId: string
  data: {
    previousValue?: unknown
    currentValue?: unknown
    changes?: unknown
    timestamp: string
  }
}

export interface GitWebSocketMessage {
  type: 
    | 'git-event'
    | 'repository-state'
    | 'repository-sync'
    | 'repository-error'
  repositoryId?: string
  event?: string
  data?: unknown
  timestamp: string
}

export interface UseGitWebSocketOptions {
  repositoryId: string
  onGitEvent?: (event: GitEvent) => void
  onSyncStatusChange?: (status: 'syncing' | 'synced' | 'error') => void
  onError?: (error: string) => void
  autoSubscribe?: boolean
}

export interface UseGitWebSocketReturn {
  isConnected: boolean
  isSubscribed: boolean
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error'
  lastEvent: GitEvent | null
  subscribe: () => void
  unsubscribe: () => void
  refresh: () => void
  getRepositoryState: () => void
}

export const useGitWebSocket = ({
  repositoryId,
  onGitEvent,
  onSyncStatusChange,
  onError,
  autoSubscribe = true,
}: UseGitWebSocketOptions): UseGitWebSocketReturn => {
  const { isConnected, send } = useWebSocket()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle')
  const [lastEvent, setLastEvent] = useState<GitEvent | null>(null)

  // Subscribe to repository
  const subscribe = useCallback(() => {
    if (isConnected && !isSubscribed) {
      send({
        type: 'subscribe-repository' as any,
        payload: { repositoryId },
        timestamp: new Date().toISOString(),
      })
      setIsSubscribed(true)
    }
  }, [isConnected, isSubscribed, repositoryId, send])

  // Unsubscribe from repository
  const unsubscribe = useCallback(() => {
    if (isConnected && isSubscribed) {
      send({
        type: 'unsubscribe-repository' as any,
        payload: { repositoryId },
        timestamp: new Date().toISOString(),
      })
      setIsSubscribed(false)
    }
  }, [isConnected, isSubscribed, repositoryId, send])

  // Refresh repository
  const refresh = useCallback(() => {
    if (isConnected) {
      send({
        type: 'refresh-repository' as any,
        payload: { repositoryId },
        timestamp: new Date().toISOString(),
      })
    }
  }, [isConnected, repositoryId, send])

  // Get repository state
  const getRepositoryState = useCallback(() => {
    if (isConnected) {
      send({
        type: 'get-repository-state' as any,
        payload: { repositoryId },
        timestamp: new Date().toISOString(),
      })
    }
  }, [isConnected, repositoryId, send])

  // Handle incoming WebSocket messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const message: GitWebSocketMessage = JSON.parse(event.data)
        
        // Filter messages for this repository
        if (message.repositoryId !== repositoryId) {
          return
        }

        switch (message.type) {
          case 'git-event': {
            const gitEvent: GitEvent = {
              type: message.event as GitEvent['type'],
              repositoryId: message.repositoryId,
              data: message.data as GitEvent['data'],
            }
            setLastEvent(gitEvent)
            onGitEvent?.(gitEvent)
            break
          }

          case 'repository-sync': {
            const syncData = message.data as { status: string }
            if (syncData.status === 'syncing') {
              setSyncStatus('syncing')
              onSyncStatusChange?.('syncing')
            } else if (syncData.status === 'synced') {
              setSyncStatus('synced')
              onSyncStatusChange?.('synced')
            }
            break
          }

          case 'repository-error': {
            setSyncStatus('error')
            onSyncStatusChange?.('error')
            const errorData = message.data as { error: string }
            onError?.(errorData.error)
            break
          }

          case 'repository-state': {
            // Handle repository state updates
            const stateData = message.data as { subscribed?: boolean; refreshed?: boolean }
            if (stateData.subscribed !== undefined) {
              setIsSubscribed(stateData.subscribed)
            }
            break
          }
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    // Get WebSocket instance from the global or context
    const ws = (window as any).__webSocket
    if (ws) {
      ws.addEventListener('message', handleMessage)
      return () => {
        ws.removeEventListener('message', handleMessage)
      }
    }
  }, [repositoryId, onGitEvent, onSyncStatusChange, onError])

  // Auto-subscribe when connected
  useEffect(() => {
    if (autoSubscribe && isConnected && !isSubscribed) {
      subscribe()
    }
  }, [autoSubscribe, isConnected, isSubscribed, subscribe])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSubscribed) {
        unsubscribe()
      }
    }
  }, [isSubscribed, unsubscribe])

  return {
    isConnected,
    isSubscribed,
    syncStatus,
    lastEvent,
    subscribe,
    unsubscribe,
    refresh,
    getRepositoryState,
  }
}