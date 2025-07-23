import { useState, useEffect, useCallback } from 'react'
import { useTerminal } from './useTerminal'
import {
  terminalSessionManager,
  type PersistedTerminalSession,
} from '../services/terminalSessionManager'
import { useNotification } from '../contexts/NotificationContext'
import { USE_MOCK_DATA, MOCK_DELAY } from '../config/mockConfig'
import { mockTerminalSessions, simulateDelay } from '../services/mockData'

export interface TerminalSessionInfo {
  id: string
  title: string
  repositoryPath: string
  workingDirectory: string
  isActive: boolean
  createdAt: string
  lastActivity: string
  settings: PersistedTerminalSession['settings']
}

export interface UseTerminalSessionsOptions {
  /** Whether to auto-restore sessions on mount */
  autoRestore?: boolean
  /** Whether to show notifications */
  showNotifications?: boolean
  /** Maximum number of concurrent sessions */
  maxSessions?: number
}

export interface UseTerminalSessionsReturn {
  /** List of terminal sessions */
  sessions: TerminalSessionInfo[]
  /** Currently active session ID */
  activeSessionId: string | null
  /** Whether sessions are loading */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Statistics about sessions */
  statistics: {
    total: number
    active: number
    inactive: number
    repositories: string[]
  }
  /** Create a new terminal session */
  createSession: (
    repositoryPath: string,
    workingDirectory?: string,
    title?: string
  ) => Promise<string>
  /** Close a terminal session */
  closeSession: (sessionId: string) => Promise<void>
  /** Switch to a different session */
  switchToSession: (sessionId: string) => void
  /** Update session settings */
  updateSessionSettings: (
    sessionId: string,
    settings: Partial<PersistedTerminalSession['settings']>
  ) => void
  /** Restore sessions from persistence */
  restoreSessions: () => Promise<void>
  /** Clear all sessions */
  clearAllSessions: () => void
  /** Get recent sessions */
  getRecentSessions: (limit?: number) => TerminalSessionInfo[]
  /** Get sessions for a specific repository */
  getRepositorySessions: (repositoryPath: string) => TerminalSessionInfo[]
  /** Update session activity */
  updateSessionActivity: (sessionId: string) => void
  /** Get terminal hook for active session */
  getTerminalHook: () => ReturnType<typeof useTerminal> | null
}

export function useTerminalSessions(
  options: UseTerminalSessionsOptions = {}
): UseTerminalSessionsReturn {
  const { autoRestore = true, showNotifications = true, maxSessions = 10 } = options

  const [sessions, setSessions] = useState<TerminalSessionInfo[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { showSuccess, showError } = useNotification()

  // Get terminal hook for active session
  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const terminalHook = useTerminal({
    workingDirectory: activeSession?.workingDirectory,
    repositoryPath: activeSession?.repositoryPath,
    autoCreate: !!activeSession,
    autoConnect: !!activeSession,
    showNotifications,
  })

  // Load sessions from persistence
  const loadSessions = useCallback(async () => {
    try {
      if (USE_MOCK_DATA) {
        await simulateDelay(MOCK_DELAY)
        
        // Transform mock sessions to TerminalSessionInfo format
        const sessionInfos: TerminalSessionInfo[] = mockTerminalSessions.map((mock, index) => ({
          id: mock.id,
          title: mock.name,
          repositoryPath: index === 0 
            ? '/Users/gonzalo/workspace/taskmaster-ui/packages/frontend'
            : index === 1 
              ? '/Users/gonzalo/workspace/taskmaster-ui/packages/backend'
              : '/Users/gonzalo/workspace/taskmaster-ui',
          workingDirectory: '/Users/gonzalo/workspace/taskmaster-ui',
          isActive: mock.status === 'active',
          createdAt: new Date(Date.now() - (index + 1) * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date().toISOString(),
          settings: {
            fontSize: 14,
            theme: 'dark',
            cursorStyle: 'block',
            scrollback: 1000,
          },
        }))

        setSessions(sessionInfos)

        // Set active session if none is set
        if (!activeSessionId && sessionInfos.length > 0) {
          const activeSession = sessionInfos.find((s) => s.isActive) || sessionInfos[0]
          setActiveSessionId(activeSession.id)
        }
        return
      }

      const persistedSessions = terminalSessionManager.getPersistedSessions()
      const sessionInfos: TerminalSessionInfo[] = persistedSessions.map((session) => ({
        id: session.id,
        title: session.title,
        repositoryPath: session.repositoryPath,
        workingDirectory: session.workingDirectory,
        isActive: session.isActive,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        settings: session.settings,
      }))

      setSessions(sessionInfos)

      // Set active session if none is set
      if (!activeSessionId && sessionInfos.length > 0) {
        const activeSession = sessionInfos.find((s) => s.isActive) || sessionInfos[0]
        setActiveSessionId(activeSession.id)
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
      setError('Failed to load terminal sessions')
    }
  }, [activeSessionId])

  // Create a new terminal session
  const createSession = useCallback(
    async (repositoryPath: string, workingDirectory?: string, title?: string): Promise<string> => {
      try {
        setIsLoading(true)
        setError(null)

        // Check session limit
        if (sessions.length >= maxSessions) {
          throw new Error(`Maximum of ${maxSessions} sessions allowed`)
        }

        if (USE_MOCK_DATA) {
          await simulateDelay(MOCK_DELAY)
          
          // Generate session ID for mock
          const sessionId = `mock-session-${Date.now()}`
          const workingDir = workingDirectory || repositoryPath
          const sessionTitle = title || `Terminal - ${repositoryPath.split('/').pop()}`

          // Create session info
          const sessionInfo: TerminalSessionInfo = {
            id: sessionId,
            title: sessionTitle,
            repositoryPath,
            workingDirectory: workingDir,
            isActive: true,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            settings: {
              fontSize: 14,
              theme: 'dark',
              cursorStyle: 'block',
              scrollback: 1000,
            },
          }

          // Update state
          setSessions((prev) => [sessionInfo, ...prev])
          setActiveSessionId(sessionId)

          if (showNotifications) {
            showSuccess('Terminal Session Created', `Created mock session for ${repositoryPath}`)
          }

          return sessionId
        }

        // Generate session ID and create backend session
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const workingDir = workingDirectory || repositoryPath
        const sessionTitle = title || `Terminal - ${repositoryPath.split('/').pop()}`

        // Create persisted session
        const persistedSession = terminalSessionManager.createPersistedSession(
          sessionId,
          repositoryPath,
          workingDir,
          sessionTitle
        )

        // Save to persistence
        terminalSessionManager.saveSession(persistedSession)

        // Create session info
        const sessionInfo: TerminalSessionInfo = {
          id: sessionId,
          title: sessionTitle,
          repositoryPath,
          workingDirectory: workingDir,
          isActive: true,
          createdAt: persistedSession.createdAt,
          lastActivity: persistedSession.lastActivity,
          settings: persistedSession.settings,
        }

        // Update state
        setSessions((prev) => [sessionInfo, ...prev])
        setActiveSessionId(sessionId)

        if (showNotifications) {
          showSuccess('Terminal Session Created', `Created session for ${repositoryPath}`)
        }

        return sessionId
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create session'
        setError(errorMessage)
        if (showNotifications) {
          showError('Session Creation Failed', errorMessage)
        }
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [sessions.length, maxSessions, showNotifications, showSuccess, showError]
  )

  // Close a terminal session
  const closeSession = useCallback(
    async (sessionId: string): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)

        if (USE_MOCK_DATA) {
          await simulateDelay(MOCK_DELAY / 2)
          
          // Update state
          setSessions((prev) => prev.filter((s) => s.id !== sessionId))

          // Switch to another session if this was active
          if (activeSessionId === sessionId) {
            const remainingSessions = sessions.filter((s) => s.id !== sessionId)
            setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null)
          }

          if (showNotifications) {
            showSuccess('Terminal Session Closed', 'Mock session closed successfully')
          }
          return
        }

        // Remove from persistence
        terminalSessionManager.removeSession(sessionId)

        // Update state
        setSessions((prev) => prev.filter((s) => s.id !== sessionId))

        // Switch to another session if this was active
        if (activeSessionId === sessionId) {
          const remainingSessions = sessions.filter((s) => s.id !== sessionId)
          setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null)
        }

        if (showNotifications) {
          showSuccess('Terminal Session Closed', 'Session closed successfully')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to close session'
        setError(errorMessage)
        if (showNotifications) {
          showError('Session Close Failed', errorMessage)
        }
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [activeSessionId, sessions, showNotifications, showSuccess, showError]
  )

  // Switch to a different session
  const switchToSession = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId)
      if (session) {
        setActiveSessionId(sessionId)
        terminalSessionManager.markSessionAsActive(sessionId)
        terminalSessionManager.updateSessionActivity(sessionId)
      }
    },
    [sessions]
  )

  // Update session settings
  const updateSessionSettings = useCallback(
    (sessionId: string, settings: Partial<PersistedTerminalSession['settings']>) => {
      terminalSessionManager.updateSessionSettings(sessionId, settings)

      // Update local state
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, settings: { ...session.settings, ...settings } }
            : session
        )
      )
    },
    []
  )

  // Restore sessions from persistence
  const restoreSessions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Restore active sessions from backend
      const restoredSessions = await terminalSessionManager.restoreActiveSessions()

      // Load all sessions from persistence
      loadSessions()

      if (showNotifications && restoredSessions.length > 0) {
        showSuccess('Sessions Restored', `Restored ${restoredSessions.length} active sessions`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to restore sessions'
      setError(errorMessage)
      if (showNotifications) {
        showError('Session Restore Failed', errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [loadSessions, showNotifications, showSuccess, showError])

  // Clear all sessions
  const clearAllSessions = useCallback(() => {
    terminalSessionManager.clearAllSessions()
    setSessions([])
    setActiveSessionId(null)

    if (showNotifications) {
      showSuccess('Sessions Cleared', 'All terminal sessions have been cleared')
    }
  }, [showNotifications, showSuccess])

  // Get recent sessions
  const getRecentSessions = useCallback((limit: number = 5) => {
    const persistedSessions = terminalSessionManager.getRecentSessions(limit)
    return persistedSessions.map((session) => ({
      id: session.id,
      title: session.title,
      repositoryPath: session.repositoryPath,
      workingDirectory: session.workingDirectory,
      isActive: session.isActive,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      settings: session.settings,
    }))
  }, [])

  // Get sessions for a specific repository
  const getRepositorySessions = useCallback((repositoryPath: string) => {
    const persistedSessions = terminalSessionManager.getSessionsByRepository(repositoryPath)
    return persistedSessions.map((session) => ({
      id: session.id,
      title: session.title,
      repositoryPath: session.repositoryPath,
      workingDirectory: session.workingDirectory,
      isActive: session.isActive,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      settings: session.settings,
    }))
  }, [])

  // Update session activity
  const updateSessionActivity = useCallback((sessionId: string) => {
    terminalSessionManager.updateSessionActivity(sessionId)

    // Update local state
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, lastActivity: new Date().toISOString() } : session
      )
    )
  }, [])

  // Get terminal hook for active session
  const getTerminalHook = useCallback(() => {
    return activeSession ? terminalHook : null
  }, [activeSession, terminalHook])

  // Get statistics
  const statistics = USE_MOCK_DATA 
    ? {
        total: sessions.length,
        active: sessions.filter(s => s.isActive).length,
        inactive: sessions.filter(s => !s.isActive).length,
        repositories: [...new Set(sessions.map(s => s.repositoryPath))],
      }
    : terminalSessionManager.getSessionStatistics()

  // Load sessions on mount
  useEffect(() => {
    loadSessions()

    // Cleanup old sessions
    terminalSessionManager.cleanupOldSessions()
  }, [loadSessions])

  // Auto-restore sessions
  useEffect(() => {
    if (autoRestore) {
      restoreSessions()
    }
  }, [autoRestore, restoreSessions])

  return {
    sessions,
    activeSessionId,
    isLoading,
    error,
    statistics,
    createSession,
    closeSession,
    switchToSession,
    updateSessionSettings,
    restoreSessions,
    clearAllSessions,
    getRecentSessions,
    getRepositorySessions,
    updateSessionActivity,
    getTerminalHook,
  }
}
