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
            } else if (command === 'ls' || command === 'ls -la' || command === 'ls -l') {
              if (command.includes('-l')) {
                terminal.writeln('total 96')
                terminal.writeln('drwxr-xr-x  12 gonzalo  staff   384 Jan 23 10:15 .')
                terminal.writeln('drwxr-xr-x  15 gonzalo  staff   480 Jan 23 09:30 ..')
                terminal.writeln('-rw-r--r--   1 gonzalo  staff   215 Jan 23 08:45 .gitignore')
                terminal.writeln('drwxr-xr-x   7 gonzalo  staff   224 Jan 23 10:00 .taskmaster')
                terminal.writeln('-rw-r--r--   1 gonzalo  staff  1234 Jan 23 09:15 CLAUDE.md')
                terminal.writeln('-rw-r--r--   1 gonzalo  staff  2048 Jan 23 08:30 README.md')
                terminal.writeln('drwxr-xr-x  24 gonzalo  staff   768 Jan 23 10:10 dist')
                terminal.writeln('drwxr-xr-x 450 gonzalo  staff 14400 Jan 23 09:45 node_modules')
                terminal.writeln('-rw-r--r--   1 gonzalo  staff  3456 Jan 23 10:05 package.json')
                terminal.writeln('-rw-r--r--   1 gonzalo  staff 89012 Jan 23 10:05 pnpm-lock.yaml')
                terminal.writeln('drwxr-xr-x  18 gonzalo  staff   576 Jan 23 10:15 src')
                terminal.writeln('-rw-r--r--   1 gonzalo  staff   789 Jan 23 08:30 vite.config.ts')
              } else {
                terminal.writeln('CLAUDE.md       README.md       dist/           package.json    src/')
                terminal.writeln('.gitignore      .taskmaster/    node_modules/   pnpm-lock.yaml  vite.config.ts')
              }
            } else if (command === 'git status') {
              terminal.writeln('On branch main')
              terminal.writeln('Your branch is up to date with \'origin/main\'.')
              terminal.writeln('')
              terminal.writeln('Changes not staged for commit:')
              terminal.writeln('  (use "git add <file>..." to update what will be committed)')
              terminal.writeln('  (use "git restore <file>..." to discard changes in working directory)')
              terminal.writeln('\tmodified:   src/hooks/useTerminal.ts')
              terminal.writeln('\tmodified:   src/hooks/useTaskData.ts')
              terminal.writeln('\tmodified:   src/services/mockData.ts')
              terminal.writeln('')
              terminal.writeln('no changes added to commit (use "git add" and/or "git commit -a")')
            } else if (command === 'git log' || command === 'git log --oneline') {
              if (command.includes('--oneline')) {
                terminal.writeln('a1b2c3d (HEAD -> main) feat: Add repository search functionality')
                terminal.writeln('d4e5f6g feat: Implement task board with mock data')
                terminal.writeln('h7i8j9k fix: Terminal command execution in mock mode')
                terminal.writeln('l0m1n2o refactor: Update dashboard to project planning view')
                terminal.writeln('p3q4r5s docs: Update README with setup instructions')
              } else {
                terminal.writeln('commit a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6')
                terminal.writeln('Author: Gonzalo Martinez <gonzalo@example.com>')
                terminal.writeln('Date:   Thu Jan 23 10:15:00 2025 -0500')
                terminal.writeln('')
                terminal.writeln('    feat: Add repository search functionality')
                terminal.writeln('')
                terminal.writeln('commit d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9')
                terminal.writeln('Author: Sarah Chen <sarah@example.com>')
                terminal.writeln('Date:   Thu Jan 23 09:30:00 2025 -0500')
                terminal.writeln('')
                terminal.writeln('    feat: Implement task board with mock data')
              }
            } else if (command.startsWith('git')) {
              // Handle other git commands
              if (command === 'git branch') {
                terminal.writeln('* main')
                terminal.writeln('  develop')
                terminal.writeln('  feature/dashboard-redesign')
                terminal.writeln('  fix/auth-bug')
              } else if (command === 'git diff') {
                terminal.writeln('diff --git a/src/services/mockData.ts b/src/services/mockData.ts')
                terminal.writeln('index abc123..def456 100644')
                terminal.writeln('--- a/src/services/mockData.ts')
                terminal.writeln('+++ b/src/services/mockData.ts')
                terminal.writeln('@@ -254,7 +254,7 @@')
                terminal.writeln('     title: \'Write API documentation\',')
                terminal.writeln('     description: \'Document all REST endpoints with examples\',')
                terminal.writeln('-    status: \'todo\',')
                terminal.writeln('+    status: \'pending\',')
                terminal.writeln('     priority: \'low\',')
              } else {
                terminal.writeln(`git: '${command.substring(4)}' is not a git command in mock mode`)
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
