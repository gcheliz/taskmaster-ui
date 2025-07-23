import { useState, useEffect, useCallback, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import {
  terminalService,
  type TerminalSession,
  type TerminalWebSocketResponse,
} from '../services/terminalService'
import { useNotification } from '../contexts/NotificationContext'
import { USE_MOCK_DATA, MOCK_DELAY } from '../config/mockConfig'
import { mockTerminalSessions, simulateDelay } from '../services/mockData'

export interface UseTerminalOptions {
  /** Working directory for the terminal */
  workingDirectory?: string
  /** Repository path if terminal is scoped to a repository */
  repositoryPath?: string
  /** Whether to auto-create a session on mount */
  autoCreate?: boolean
  /** Whether to auto-connect WebSocket */
  autoConnect?: boolean
  /** Whether to show notifications */
  showNotifications?: boolean
  /** Custom notification messages */
  notificationMessages?: {
    sessionCreated?: string
    sessionClosed?: string
    connectionError?: string
  }
}

export interface UseTerminalReturn {
  /** Terminal session information */
  session: TerminalSession | null
  /** WebSocket connection */
  websocket: WebSocket | null
  /** Terminal instance */
  terminal: Terminal | null
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: string | null
  /** Connection state */
  connectionState: 'disconnected' | 'connecting' | 'connected'
  /** Whether a command is running */
  isCommandRunning: boolean
  /** Command history */
  commandHistory: string[]
  /** Current directory */
  currentDirectory: string
  /** Create a new terminal session */
  createSession: (workingDirectory?: string, repositoryPath?: string) => Promise<void>
  /** Connect to WebSocket */
  connectWebSocket: () => void
  /** Disconnect from WebSocket */
  disconnectWebSocket: () => void
  /** Execute a command */
  executeCommand: (command: string) => Promise<void>
  /** Send input to running process */
  sendInput: (input: string) => void
  /** Kill running process */
  killProcess: () => void
  /** Change directory */
  changeDirectory: (directory: string) => Promise<void>
  /** Clear terminal */
  clearTerminal: () => void
  /** Close session */
  closeSession: () => Promise<void>
  /** Resize terminal */
  resizeTerminal: (cols: number, rows: number) => void
  /** Set terminal instance */
  setTerminal: (terminal: Terminal | null) => void
  /** Clear error */
  clearError: () => void
}

export function useTerminal(options: UseTerminalOptions = {}): UseTerminalReturn {
  const {
    workingDirectory = process.cwd(),
    repositoryPath,
    autoCreate = true,
    autoConnect = true,
    showNotifications = true,
    notificationMessages = {},
  } = options

  const [session, setSession] = useState<TerminalSession | null>(null)
  const [websocket, setWebsocket] = useState<WebSocket | null>(null)
  const [terminal, setTerminal] = useState<Terminal | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<
    'disconnected' | 'connecting' | 'connected'
  >('disconnected')
  const [isCommandRunning, setIsCommandRunning] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [currentDirectory, setCurrentDirectory] = useState(workingDirectory)

  const { showSuccess, showError, showInfo } = useNotification()
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  // Create terminal session
  const createSession = useCallback(
    async (wd?: string, repo?: string) => {
      try {
        setIsLoading(true)
        setError(null)

        if (USE_MOCK_DATA) {
          await simulateDelay(MOCK_DELAY)
          
          // Create a mock session
          const mockSession: TerminalSession = {
            id: `mock-session-${Date.now()}`,
            workingDirectory: wd || workingDirectory,
            repositoryPath: repo || repositoryPath,
            shell: '/bin/bash',
            isActive: true,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
          }
          
          setSession(mockSession)
          setCurrentDirectory(mockSession.workingDirectory)
          
          // Simulate terminal output
          if (terminal) {
            terminal.writeln(`[Mock Terminal Session ${mockSession.id}]`)
            terminal.writeln(`Working directory: ${mockSession.workingDirectory}`)
            terminal.writeln('')
            terminal.write('$ ')
          }
          
          if (showNotifications) {
            showSuccess(
              'Terminal Session Created',
              notificationMessages.sessionCreated ||
                `Mock session ${mockSession.id} created successfully`
            )
          }
          
          return
        }

        const response = await terminalService.createSession({
          workingDirectory: wd || workingDirectory,
          repositoryPath: repo || repositoryPath,
        })

        // Note: The actual session will be set when WebSocket receives session-created message
        if (showNotifications) {
          showSuccess(
            'Terminal Session Created',
            notificationMessages.sessionCreated ||
              `Session ${response.sessionId} created successfully`
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create terminal session'
        setError(errorMessage)

        if (showNotifications) {
          showError('Session Creation Failed', errorMessage)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [
      workingDirectory,
      repositoryPath,
      showNotifications,
      showSuccess,
      showError,
      notificationMessages,
      terminal,
    ]
  )

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (USE_MOCK_DATA) {
      // Skip WebSocket connection in mock mode
      setConnectionState('connected')
      
      // Create mock session if autoCreate is enabled
      if (autoCreate && !session) {
        createSession(workingDirectory, repositoryPath)
      }
      return
    }

    if (websocket?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      setConnectionState('connecting')
      setError(null)

      const ws = terminalService.createWebSocket()

      ws.onopen = () => {
        setConnectionState('connected')
        reconnectAttempts.current = 0

        // Create session if needed
        if (autoCreate && !session) {
          terminalService.createWebSocketSession(ws, workingDirectory, repositoryPath)
        }
      }

      ws.onmessage = (event) => {
        try {
          const message: TerminalWebSocketResponse = JSON.parse(event.data)

          switch (message.type) {
            case 'session-created':
              if (message.data && message.sessionId) {
                setSession({
                  id: message.sessionId,
                  workingDirectory: message.data.workingDirectory || workingDirectory,
                  repositoryPath: repositoryPath,
                  shell: '/bin/bash',
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  lastActivity: new Date().toISOString(),
                })
                setCurrentDirectory(message.data.workingDirectory || workingDirectory)
              }
              break

            case 'session-closed':
              setSession(null)
              setIsCommandRunning(false)
              if (showNotifications) {
                showInfo(
                  'Terminal Session Closed',
                  notificationMessages.sessionClosed || 'Terminal session was closed'
                )
              }
              break

            case 'output':
              // Terminal output is handled by the Terminal component
              if (message.data?.type === 'exit') {
                setIsCommandRunning(false)
              }
              break

            case 'error': {
              const errorMsg = message.data?.message || 'Terminal error occurred'
              setError(errorMsg)
              setIsCommandRunning(false)
              if (showNotifications) {
                showError('Terminal Error', errorMsg)
              }
              break
            }
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onclose = () => {
        setConnectionState('disconnected')
        setWebsocket(null)

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket()
          }, delay)
        } else {
          const errorMsg = 'Failed to connect to terminal service after multiple attempts'
          setError(errorMsg)
          if (showNotifications) {
            showError('Connection Failed', notificationMessages.connectionError || errorMsg)
          }
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionState('disconnected')
        const errorMsg = 'WebSocket connection error'
        setError(errorMsg)
        if (showNotifications) {
          showError('Connection Error', errorMsg)
        }
      }

      setWebsocket(ws)
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to create WebSocket connection'
      setError(errorMsg)
      setConnectionState('disconnected')
      if (showNotifications) {
        showError('Connection Error', errorMsg)
      }
    }
  }, [
    websocket,
    autoCreate,
    session,
    workingDirectory,
    repositoryPath,
    showNotifications,
    showSuccess,
    showError,
    showInfo,
    notificationMessages,
    createSession,
  ])

  // Disconnect from WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (websocket) {
      websocket.close()
      setWebsocket(null)
    }

    setConnectionState('disconnected')
    reconnectAttempts.current = 0
  }, [websocket])

  // Execute command
  const executeCommand = useCallback(
    async (command: string) => {
      if (USE_MOCK_DATA) {
        if (!session) {
          throw new Error('No active terminal session')
        }

        try {
          setIsCommandRunning(true)
          setCommandHistory((prev) => [...prev, command])

          // Simulate command execution in terminal
          if (terminal) {
            terminal.writeln(command)
            
            // Simulate command output based on the command
            await simulateDelay(300)
            
            if (command.startsWith('cd ')) {
              const newDir = command.substring(3).trim()
              setCurrentDirectory(newDir || workingDirectory)
              terminal.writeln(`Changed directory to: ${newDir || workingDirectory}`)
            } else if (command === 'pwd') {
              terminal.writeln(currentDirectory)
            } else if (command === 'ls') {
              terminal.writeln('src/  package.json  README.md  node_modules/  dist/')
            } else if (command.startsWith('git')) {
              const mockGitOutput = mockTerminalSessions.find(s => s.name === 'Git Operations')
              if (mockGitOutput) {
                terminal.writeln(mockGitOutput.output)
              } else {
                terminal.writeln('git: command not found')
              }
            } else if (command === 'npm run dev' || command === 'pnpm run dev') {
              const mockDevOutput = mockTerminalSessions.find(s => s.name === 'Frontend Dev')
              if (mockDevOutput) {
                terminal.writeln(mockDevOutput.output)
              }
            } else if (command === 'clear') {
              terminal.clear()
            } else {
              // Generic command output
              terminal.writeln(`[Mock] Executing: ${command}`)
              terminal.writeln(`[Mock] Command completed successfully`)
            }
            
            terminal.write('$ ')
          }

          setIsCommandRunning(false)
          return
        } catch (error) {
          setIsCommandRunning(false)
          throw error
        }
      }

      if (!websocket || !session) {
        throw new Error('No active terminal session')
      }

      try {
        setIsCommandRunning(true)
        setCommandHistory((prev) => [...prev, command])

        terminalService.executeWebSocketCommand(websocket, session.id, command)
      } catch (error) {
        setIsCommandRunning(false)
        throw error
      }
    },
    [websocket, session, terminal, currentDirectory, workingDirectory]
  )

  // Send input
  const sendInput = useCallback(
    (input: string) => {
      if (!websocket || !session) {
        throw new Error('No active terminal session')
      }

      terminalService.sendWebSocketInput(websocket, session.id, input)
    },
    [websocket, session]
  )

  // Kill process
  const killProcess = useCallback(() => {
    if (!websocket || !session) {
      return
    }

    terminalService.killWebSocketProcess(websocket, session.id)
    setIsCommandRunning(false)
  }, [websocket, session])

  // Change directory
  const changeDirectory = useCallback(
    async (directory: string) => {
      if (!session) {
        throw new Error('No active terminal session')
      }

      await terminalService.changeDirectory(session.id, { directory })
      setCurrentDirectory(directory)
    },
    [session]
  )

  // Clear terminal
  const clearTerminal = useCallback(() => {
    if (terminal) {
      terminal.clear()
    }
  }, [terminal])

  // Close session
  const closeSession = useCallback(async () => {
    if (!session) {
      return
    }

    try {
      if (websocket) {
        terminalService.closeWebSocketSession(websocket, session.id)
      } else {
        await terminalService.closeSession(session.id)
      }

      setSession(null)
      setIsCommandRunning(false)
      setCommandHistory([])
    } catch (error) {
      console.error('Failed to close session:', error)
    }
  }, [session, websocket])

  // Resize terminal
  const resizeTerminal = useCallback(
    (cols: number, rows: number) => {
      if (!websocket || !session) {
        return
      }

      terminalService.resizeWebSocketTerminal(websocket, session.id, cols, rows)
    },
    [websocket, session]
  )

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connectWebSocket()
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [autoConnect, connectWebSocket])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (websocket) {
        websocket.close()
      }
    }
  }, [websocket])

  return {
    session,
    websocket,
    terminal,
    isLoading,
    error,
    connectionState,
    isCommandRunning,
    commandHistory,
    currentDirectory,
    createSession,
    connectWebSocket,
    disconnectWebSocket,
    executeCommand,
    sendInput,
    killProcess,
    changeDirectory,
    clearTerminal,
    closeSession,
    resizeTerminal,
    setTerminal,
    clearError,
  }
}
