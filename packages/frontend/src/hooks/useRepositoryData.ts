import { useState, useEffect, useCallback } from 'react'
import { RepositoryService } from '../services/repositoryService'
import type { RepositoryMetadataData, BranchInfo } from '../components/Repository'
import type {
  RepositoryHealthMetrics,
  RepositoryStatistics,
  RepositoryIntegrationStatus,
} from '../services/repositoryService'

export interface UseRepositoryDataOptions {
  /** Repository ID to fetch data for */
  repositoryId: string
  /** Auto-refresh interval in milliseconds (0 to disable) */
  refreshInterval?: number
  /** Whether to fetch data immediately on mount */
  autoFetch?: boolean
}

export interface UseRepositoryDataReturn {
  /** Repository metadata */
  metadata: RepositoryMetadataData | null
  /** Branch information */
  branches: BranchInfo[]
  /** Loading state */
  isLoading: boolean
  /** Error message */
  error: string | null
  /** Whether data is currently being refreshed */
  isRefreshing: boolean
  /** Manually refresh data */
  refresh: () => Promise<void>
  /** Clear error state */
  clearError: () => void
  /** Last successful fetch timestamp */
  lastFetch: Date | null
}

/**
 * Hook for managing repository data
 *
 * Provides automatic data fetching, refresh capabilities, and state management
 * for repository metadata and branch information.
 */
export const useRepositoryData = ({
  repositoryId,
  refreshInterval = 30000, // 30 seconds default
  autoFetch = true,
}: UseRepositoryDataOptions): UseRepositoryDataReturn => {
  const [metadata, setMetadata] = useState<RepositoryMetadataData | null>(null)
  const [branches, setBranches] = useState<BranchInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      setError(null)

      try {
        const response = await RepositoryService.getRepositoryDetails(repositoryId)

        if (response.success && response.data) {
          const repositoryMetadata = RepositoryService.extractRepositoryMetadata(response.data)
          const branchInfo = RepositoryService.extractBranchInfo(response.data)

          setMetadata(repositoryMetadata)
          setBranches(branchInfo)
          setLastFetch(new Date())
        } else {
          setError(response.error || 'Failed to fetch repository data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [repositoryId]
  )

  const refresh = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initial fetch
  useEffect(() => {
    if (autoFetch && repositoryId) {
      fetchData()
    }
  }, [fetchData, autoFetch, repositoryId])

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval > 0 && repositoryId) {
      const interval = setInterval(() => {
        fetchData(true)
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [fetchData, refreshInterval, repositoryId])

  return {
    metadata,
    branches,
    isLoading,
    error,
    isRefreshing,
    refresh,
    clearError,
    lastFetch,
  }
}

export interface UseRepositoryActionsOptions {
  /** Repository ID */
  repositoryId: string
  /** Callback when action completes successfully */
  onSuccess?: (message: string) => void
  /** Callback when action fails */
  onError?: (error: string) => void
}

export interface UseRepositoryActionsReturn {
  /** Checkout a branch */
  checkoutBranch: (branchName: string) => Promise<void>
  /** Create a new branch */
  createBranch: (branchName: string, fromBranch?: string) => Promise<void>
  /** Delete a branch */
  deleteBranch: (branchName: string, force?: boolean) => Promise<void>
  /** Fetch from remote */
  fetchRemote: () => Promise<void>
  /** Pull from remote */
  pullFromRemote: () => Promise<void>
  /** Push to remote */
  pushToRemote: (branchName?: string, setUpstream?: boolean) => Promise<void>
  /** Whether any action is in progress */
  isActionLoading: boolean
  /** Current action being performed */
  currentAction: string | null
}

/**
 * Hook for repository actions
 *
 * Provides functions for performing Git operations on repositories
 * with loading state management and error handling.
 */
export const useRepositoryActions = ({
  repositoryId,
  onSuccess,
  onError,
}: UseRepositoryActionsOptions): UseRepositoryActionsReturn => {
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [currentAction, setCurrentAction] = useState<string | null>(null)

  const executeAction = useCallback(
    async (
      actionName: string,
      action: () => Promise<{
        success: boolean
        message?: string
        error?: string
      }>
    ) => {
      setIsActionLoading(true)
      setCurrentAction(actionName)

      try {
        const result = await action()

        if (result.success) {
          onSuccess?.(result.message || `${actionName} completed successfully`)
        } else {
          onError?.(result.error || `${actionName} failed`)
        }
      } catch (err) {
        onError?.(err instanceof Error ? err.message : `${actionName} failed`)
      } finally {
        setIsActionLoading(false)
        setCurrentAction(null)
      }
    },
    [onSuccess, onError]
  )

  const checkoutBranch = useCallback(
    async (branchName: string) => {
      await executeAction('Checkout branch', async () => {
        const response = await RepositoryService.checkoutBranch(repositoryId, branchName)
        return {
          success: response.success,
          message: response.data?.message,
          error: response.error,
        }
      })
    },
    [repositoryId, executeAction]
  )

  const createBranch = useCallback(
    async (branchName: string, fromBranch?: string) => {
      await executeAction('Create branch', async () => {
        const response = await RepositoryService.createBranch(repositoryId, branchName, fromBranch)
        return {
          success: response.success,
          message: response.data?.message,
          error: response.error,
        }
      })
    },
    [repositoryId, executeAction]
  )

  const deleteBranch = useCallback(
    async (branchName: string, force: boolean = false) => {
      await executeAction('Delete branch', async () => {
        const response = await RepositoryService.deleteBranch(repositoryId, branchName, force)
        return {
          success: response.success,
          message: response.data?.message,
          error: response.error,
        }
      })
    },
    [repositoryId, executeAction]
  )

  const fetchRemote = useCallback(async () => {
    await executeAction('Fetch remote', async () => {
      const response = await RepositoryService.fetchRepository(repositoryId)
      return {
        success: response.success,
        message: response.data?.message,
        error: response.error,
      }
    })
  }, [repositoryId, executeAction])

  const pullFromRemote = useCallback(async () => {
    await executeAction('Pull from remote', async () => {
      const response = await RepositoryService.pullRepository(repositoryId)
      return {
        success: response.success,
        message: response.data?.message,
        error: response.error,
      }
    })
  }, [repositoryId, executeAction])

  const pushToRemote = useCallback(
    async (branchName?: string, setUpstream: boolean = false) => {
      await executeAction('Push to remote', async () => {
        const response = await RepositoryService.pushRepository(
          repositoryId,
          branchName,
          setUpstream
        )
        return {
          success: response.success,
          message: response.data?.message,
          error: response.error,
        }
      })
    },
    [repositoryId, executeAction]
  )

  return {
    checkoutBranch,
    createBranch,
    deleteBranch,
    fetchRemote,
    pullFromRemote,
    pushToRemote,
    isActionLoading,
    currentAction,
  }
}

// Enhanced Repository Management Hooks

export interface UseRepositoryHealthOptions {
  /** Repository ID */
  repositoryId: string
  /** Auto-refresh interval in milliseconds (0 to disable) */
  refreshInterval?: number
  /** Whether to fetch data immediately on mount */
  autoFetch?: boolean
}

export interface UseRepositoryHealthReturn {
  /** Repository health metrics */
  health: RepositoryHealthMetrics | null
  /** Loading state */
  isLoading: boolean
  /** Error message */
  error: string | null
  /** Whether data is currently being refreshed */
  isRefreshing: boolean
  /** Manually refresh health data */
  refresh: () => Promise<void>
  /** Clear error state */
  clearError: () => void
  /** Last successful fetch timestamp */
  lastFetch: Date | null
}

/**
 * Hook for managing repository health metrics
 */
export const useRepositoryHealth = ({
  repositoryId,
  refreshInterval = 300000, // 5 minutes default for health checks
  autoFetch = true,
}: UseRepositoryHealthOptions): UseRepositoryHealthReturn => {
  const [health, setHealth] = useState<RepositoryHealthMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchHealth = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      setError(null)

      try {
        const response = await RepositoryService.getRepositoryHealth(repositoryId)

        if (response.success && response.data) {
          setHealth(response.data)
          setLastFetch(new Date())
        } else {
          setError(response.error || 'Failed to fetch repository health')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [repositoryId]
  )

  const refresh = useCallback(async () => {
    await fetchHealth(true)
  }, [fetchHealth])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    if (autoFetch && repositoryId) {
      fetchHealth()
    }
  }, [fetchHealth, autoFetch, repositoryId])

  useEffect(() => {
    if (refreshInterval > 0 && repositoryId) {
      const interval = setInterval(() => {
        fetchHealth(true)
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [fetchHealth, refreshInterval, repositoryId])

  return {
    health,
    isLoading,
    error,
    isRefreshing,
    refresh,
    clearError,
    lastFetch,
  }
}

export interface UseRepositoryStatisticsOptions {
  /** Repository ID */
  repositoryId: string
  /** Statistics period */
  period?: '7d' | '30d' | '90d' | '1y'
  /** Auto-refresh interval in milliseconds (0 to disable) */
  refreshInterval?: number
  /** Whether to fetch data immediately on mount */
  autoFetch?: boolean
}

export interface UseRepositoryStatisticsReturn {
  /** Repository statistics */
  statistics: RepositoryStatistics | null
  /** Loading state */
  isLoading: boolean
  /** Error message */
  error: string | null
  /** Whether data is currently being refreshed */
  isRefreshing: boolean
  /** Change the statistics period */
  setPeriod: (period: '7d' | '30d' | '90d' | '1y') => void
  /** Manually refresh statistics */
  refresh: () => Promise<void>
  /** Clear error state */
  clearError: () => void
  /** Last successful fetch timestamp */
  lastFetch: Date | null
}

/**
 * Hook for managing repository statistics
 */
export const useRepositoryStatistics = ({
  repositoryId,
  period = '30d',
  refreshInterval = 600000, // 10 minutes default for statistics
  autoFetch = true,
}: UseRepositoryStatisticsOptions): UseRepositoryStatisticsReturn => {
  const [statistics, setStatistics] = useState<RepositoryStatistics | null>(null)
  const [currentPeriod, setCurrentPeriod] = useState(period)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchStatistics = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      setError(null)

      try {
        const response = await RepositoryService.getRepositoryStatistics(
          repositoryId,
          currentPeriod
        )

        if (response.success && response.data) {
          setStatistics(response.data)
          setLastFetch(new Date())
        } else {
          setError(response.error || 'Failed to fetch repository statistics')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [repositoryId, currentPeriod]
  )

  const setPeriod = useCallback((newPeriod: '7d' | '30d' | '90d' | '1y') => {
    setCurrentPeriod(newPeriod)
  }, [])

  const refresh = useCallback(async () => {
    await fetchStatistics(true)
  }, [fetchStatistics])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    if (autoFetch && repositoryId) {
      fetchStatistics()
    }
  }, [fetchStatistics, autoFetch, repositoryId])

  useEffect(() => {
    if (refreshInterval > 0 && repositoryId) {
      const interval = setInterval(() => {
        fetchStatistics(true)
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [fetchStatistics, refreshInterval, repositoryId])

  return {
    statistics,
    isLoading,
    error,
    isRefreshing,
    setPeriod,
    refresh,
    clearError,
    lastFetch,
  }
}

export interface UseRepositoryIntegrationsOptions {
  /** Repository ID */
  repositoryId: string
  /** Auto-refresh interval in milliseconds (0 to disable) */
  refreshInterval?: number
  /** Whether to fetch data immediately on mount */
  autoFetch?: boolean
}

export interface UseRepositoryIntegrationsReturn {
  /** Repository integration status */
  integrations: RepositoryIntegrationStatus | null
  /** Loading state */
  isLoading: boolean
  /** Error message */
  error: string | null
  /** Whether data is currently being refreshed */
  isRefreshing: boolean
  /** Manually refresh integration status */
  refresh: () => Promise<void>
  /** Clear error state */
  clearError: () => void
  /** Last successful fetch timestamp */
  lastFetch: Date | null
}

/**
 * Hook for managing repository integration status
 */
export const useRepositoryIntegrations = ({
  repositoryId,
  refreshInterval = 120000, // 2 minutes default for integrations
  autoFetch = true,
}: UseRepositoryIntegrationsOptions): UseRepositoryIntegrationsReturn => {
  const [integrations, setIntegrations] = useState<RepositoryIntegrationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchIntegrations = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      setError(null)

      try {
        const response = await RepositoryService.getRepositoryIntegrations(repositoryId)

        if (response.success && response.data) {
          setIntegrations(response.data)
          setLastFetch(new Date())
        } else {
          setError(response.error || 'Failed to fetch repository integrations')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [repositoryId]
  )

  const refresh = useCallback(async () => {
    await fetchIntegrations(true)
  }, [fetchIntegrations])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    if (autoFetch && repositoryId) {
      fetchIntegrations()
    }
  }, [fetchIntegrations, autoFetch, repositoryId])

  useEffect(() => {
    if (refreshInterval > 0 && repositoryId) {
      const interval = setInterval(() => {
        fetchIntegrations(true)
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [fetchIntegrations, refreshInterval, repositoryId])

  return {
    integrations,
    isLoading,
    error,
    isRefreshing,
    refresh,
    clearError,
    lastFetch,
  }
}

export interface UseRepositoryRealtimeOptions {
  /** Repository ID */
  repositoryId: string
  /** Whether to start watching immediately */
  autoWatch?: boolean
  /** Callback for repository updates */
  onUpdate?: (data: {
    type: 'commit' | 'branch' | 'status' | 'health'
    repository: string
    data: unknown
    timestamp: string
  }) => void
  /** Callback for errors */
  onError?: (error: Error) => void
}

export interface UseRepositoryRealtimeReturn {
  /** Whether the WebSocket connection is active */
  isConnected: boolean
  /** Connection error */
  connectionError: string | null
  /** Start watching repository updates */
  startWatching: () => void
  /** Stop watching repository updates */
  stopWatching: () => void
  /** Latest update received */
  latestUpdate: unknown
  /** Connection status */
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
}

/**
 * Hook for real-time repository updates via WebSocket
 */
export const useRepositoryRealtime = ({
  repositoryId,
  autoWatch = true,
  onUpdate,
  onError,
}: UseRepositoryRealtimeOptions): UseRepositoryRealtimeReturn => {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [latestUpdate, setLatestUpdate] = useState<unknown>(null)
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected')
  const [cleanup, setCleanup] = useState<(() => void) | null>(null)

  const startWatching = useCallback(() => {
    if (cleanup) {
      cleanup()
    }

    setConnectionStatus('connecting')
    setConnectionError(null)

    const cleanupFn = RepositoryService.watchRepository(
      repositoryId,
      (data) => {
        setLatestUpdate(data)
        setIsConnected(true)
        setConnectionStatus('connected')
        onUpdate?.(data)
      },
      (error) => {
        setConnectionError(error.message)
        setIsConnected(false)
        setConnectionStatus('error')
        onError?.(error)
      }
    )

    setCleanup(() => cleanupFn)
  }, [repositoryId, onUpdate, onError, cleanup])

  const stopWatching = useCallback(() => {
    if (cleanup) {
      cleanup()
      setCleanup(null)
    }
    setIsConnected(false)
    setConnectionStatus('disconnected')
    setConnectionError(null)
  }, [cleanup])

  useEffect(() => {
    if (autoWatch && repositoryId) {
      startWatching()
    }

    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [autoWatch, repositoryId, startWatching, cleanup])

  return {
    isConnected,
    connectionError,
    startWatching,
    stopWatching,
    latestUpdate,
    connectionStatus,
  }
}

// Branch-related hooks
export interface BranchInfo {
  name: string
  isDefault: boolean
  isProtected: boolean
  lastCommit: {
    sha: string
    message: string
    author: string
    date: string
  }
  ahead: number
  behind: number
  hasConflicts: boolean
  pullRequests: {
    open: number
    merged: number
    closed: number
  }
}

export interface UseRepositoryBranchesOptions {
  repositoryId: string
  autoFetch?: boolean
}

export interface UseRepositoryBranchesReturn {
  branches: BranchInfo[] | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export const useRepositoryBranches = ({
  repositoryId,
  autoFetch = true,
}: UseRepositoryBranchesOptions): UseRepositoryBranchesReturn => {
  const [branches, setBranches] = useState<BranchInfo[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBranches = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Mock data for now - replace with actual API call
      const mockBranches: BranchInfo[] = [
        {
          name: 'main',
          isDefault: true,
          isProtected: true,
          lastCommit: {
            sha: 'abc123',
            message: 'feat: Add new dashboard components',
            author: 'John Doe',
            date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          ahead: 0,
          behind: 0,
          hasConflicts: false,
          pullRequests: { open: 2, merged: 15, closed: 3 },
        },
        {
          name: 'feature/user-auth',
          isDefault: false,
          isProtected: false,
          lastCommit: {
            sha: 'def456',
            message: 'wip: Implement OAuth integration',
            author: 'Jane Smith',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          ahead: 5,
          behind: 2,
          hasConflicts: false,
          pullRequests: { open: 1, merged: 0, closed: 0 },
        },
        {
          name: 'fix/navigation-bug',
          isDefault: false,
          isProtected: false,
          lastCommit: {
            sha: 'ghi789',
            message: 'fix: Resolve navigation state issue',
            author: 'Bob Johnson',
            date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          },
          ahead: 2,
          behind: 15,
          hasConflicts: true,
          pullRequests: { open: 0, merged: 0, closed: 1 },
        },
      ]

      setBranches(mockBranches)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch branches')
    } finally {
      setIsLoading(false)
    }
  }, [repositoryId])

  useEffect(() => {
    if (autoFetch && repositoryId) {
      fetchBranches()
    }
  }, [autoFetch, repositoryId, fetchBranches])

  return {
    branches,
    isLoading,
    error,
    refresh: fetchBranches,
  }
}

// Pull Request hooks
export interface PullRequestInfo {
  id: string
  number: number
  title: string
  author: {
    name: string
    avatar?: string
  }
  state: 'open' | 'merged' | 'closed'
  draft: boolean
  createdAt: string
  updatedAt: string
  mergeable: boolean
  reviews: {
    approved: number
    changesRequested: number
    commented: number
    pending: number
  }
  checks: {
    passed: number
    failed: number
    pending: number
    total: number
  }
  comments: number
  additions: number
  deletions: number
  changedFiles: number
  labels: Array<{
    name: string
    color: string
  }>
}

export interface UseRepositoryPullRequestsOptions {
  repositoryId: string
  state?: 'open' | 'closed' | 'all'
  autoFetch?: boolean
}

export interface UseRepositoryPullRequestsReturn {
  pullRequests: PullRequestInfo[] | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export const useRepositoryPullRequests = ({
  repositoryId,
  state = 'all',
  autoFetch = true,
}: UseRepositoryPullRequestsOptions): UseRepositoryPullRequestsReturn => {
  const [pullRequests, setPullRequests] = useState<PullRequestInfo[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPullRequests = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Mock data for now - replace with actual API call
      const mockPRs: PullRequestInfo[] = [
        {
          id: '1',
          number: 42,
          title: 'feat: Add user authentication system',
          author: { name: 'John Doe' },
          state: 'open',
          draft: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          mergeable: true,
          reviews: { approved: 2, changesRequested: 0, commented: 1, pending: 0 },
          checks: { passed: 5, failed: 0, pending: 1, total: 6 },
          comments: 8,
          additions: 245,
          deletions: 32,
          changedFiles: 12,
          labels: [
            { name: 'feature', color: '0366d6' },
            { name: 'ready-to-merge', color: '28a745' },
          ],
        },
        {
          id: '2',
          number: 41,
          title: 'fix: Resolve memory leak in WebSocket connection',
          author: { name: 'Jane Smith' },
          state: 'merged',
          draft: false,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          mergeable: true,
          reviews: { approved: 1, changesRequested: 0, commented: 2, pending: 0 },
          checks: { passed: 6, failed: 0, pending: 0, total: 6 },
          comments: 5,
          additions: 45,
          deletions: 78,
          changedFiles: 3,
          labels: [
            { name: 'bug', color: 'd73a4a' },
            { name: 'high-priority', color: 'e99695' },
          ],
        },
        {
          id: '3',
          number: 40,
          title: 'docs: Update API documentation',
          author: { name: 'Bob Johnson' },
          state: 'open',
          draft: true,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          mergeable: true,
          reviews: { approved: 0, changesRequested: 0, commented: 0, pending: 1 },
          checks: { passed: 0, failed: 0, pending: 0, total: 0 },
          comments: 2,
          additions: 156,
          deletions: 22,
          changedFiles: 8,
          labels: [
            { name: 'documentation', color: '0075ca' },
          ],
        },
      ]

      const filtered = state === 'all' 
        ? mockPRs 
        : mockPRs.filter(pr => 
            state === 'open' ? pr.state === 'open' : pr.state !== 'open'
          )

      setPullRequests(filtered)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pull requests')
    } finally {
      setIsLoading(false)
    }
  }, [repositoryId, state])

  useEffect(() => {
    if (autoFetch && repositoryId) {
      fetchPullRequests()
    }
  }, [autoFetch, repositoryId, fetchPullRequests])

  return {
    pullRequests,
    isLoading,
    error,
    refresh: fetchPullRequests,
  }
}

export default useRepositoryData
