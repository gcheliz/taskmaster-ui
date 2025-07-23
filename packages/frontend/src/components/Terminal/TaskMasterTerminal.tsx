import React, { useState, useCallback, useMemo } from 'react'
import { Terminal as XTerminal } from '@xterm/xterm'
import { Terminal } from './Terminal'
import { useTerminal } from '../../hooks/useTerminal'
import { taskMasterTerminalService } from '../../services/taskMasterTerminalService'
import './TaskMasterTerminal.css'

export interface TaskMasterTerminalProps {
  /** Working directory for the terminal */
  workingDirectory?: string
  /** Repository path if terminal is scoped to a repository */
  repositoryPath?: string
  /** Terminal display mode */
  mode?: 'embedded' | 'popup' | 'fullscreen'
  /** Whether to show the terminal header */
  showHeader?: boolean
  /** Whether to show the status bar */
  showStatusBar?: boolean
  /** Terminal title */
  title?: string
  /** Terminal theme */
  theme?: 'dark' | 'light'
  /** Initial size */
  initialSize?: { cols: number; rows: number }
  /** Callback when terminal is closed */
  onClose?: () => void
  /** Additional CSS class */
  className?: string
  /** Project tag for TaskMaster CLI commands */
  projectTag?: string
  /** Whether to enable TaskMaster command suggestions */
  enableTaskMasterSuggestions?: boolean
  /** Whether to enable command history */
  enableCommandHistory?: boolean
  /** Maximum number of command history entries */
  maxHistoryEntries?: number
}

// TaskMaster CLI commands and their descriptions
const TASKMASTER_COMMANDS = {
  'task-master init': 'Initialize TaskMaster in current directory',
  'task-master list': 'List all tasks with status',
  'task-master next': 'Get next available task to work on',
  'task-master show': 'View detailed task information (e.g., task-master show 1.2)',
  'task-master set-status':
    'Mark task complete (e.g., task-master set-status --id=1 --status=done)',
  'task-master add-task': 'Add new task with AI assistance',
  'task-master expand': 'Break task into subtasks',
  'task-master update-task': 'Update specific task',
  'task-master update-subtask': 'Add implementation notes to subtask',
  'task-master analyze-complexity': 'Analyze task complexity',
  'task-master complexity-report': 'View complexity analysis',
  'task-master add-dependency': 'Add task dependency',
  'task-master move': 'Reorganize task hierarchy',
  'task-master validate-dependencies': 'Check for dependency issues',
  'task-master generate': 'Update task markdown files',
  'task-master models': 'Configure AI models interactively',
  'task-master parse-prd': 'Generate tasks from PRD document',
} as const

// Common task management patterns
const TASKMASTER_PATTERNS = {
  '--id=': 'Task ID (e.g., --id=1 or --id=1.2 for subtasks)',
  '--status=': 'Task status: pending, in-progress, done',
  '--tag=': 'Project tag to filter tasks',
  '--prompt=': 'Description or prompt text',
  '--research': 'Enable AI research assistance',
  '--force': 'Force operation without confirmation',
  '--from=': 'Starting task ID for range operations',
  '--to=': 'Ending task ID for range operations',
  '--depends-on=': 'Task dependency ID',
} as const

/**
 * TaskMaster Terminal Component
 *
 * Enhanced terminal specifically designed for TaskMaster CLI integration with:
 * - Command recognition and highlighting
 * - TaskMaster-specific autocomplete
 * - Command history with TaskMaster command tracking
 * - Integration with TaskMaster command validation
 */
export const TaskMasterTerminal: React.FC<TaskMasterTerminalProps> = ({
  workingDirectory,
  repositoryPath,
  mode = 'embedded',
  showHeader = true,
  showStatusBar = true,
  title = 'TaskMaster Terminal',
  theme = 'dark',
  initialSize = { cols: 80, rows: 24 },
  onClose,
  className = '',
  projectTag,
  enableTaskMasterSuggestions = true,
  enableCommandHistory = true,
  maxHistoryEntries = 100,
}) => {
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [currentInput, setCurrentInput] = useState('')
  const [originalInput, setOriginalInput] = useState('')
  const [suggestionIndex, setSuggestionIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isTabCompleting, setIsTabCompleting] = useState(false)
  const [tabCompletionOptions, setTabCompletionOptions] = useState<string[]>([])
  const [tabCompletionIndex, setTabCompletionIndex] = useState(-1)

  // Use the existing terminal hook with TaskMaster-specific configuration
  const {
    session,
    websocket,
    isLoading,
    error,
    currentDirectory,
    executeCommand: baseExecuteCommand,
    sendInput,
    closeSession,
    resizeTerminal,
    setTerminal,
  } = useTerminal({
    workingDirectory,
    repositoryPath,
    autoCreate: true,
    autoConnect: true,
    showNotifications: true,
    notificationMessages: {
      sessionCreated: 'TaskMaster terminal session created',
      sessionClosed: 'TaskMaster terminal session closed',
      connectionError: 'Failed to connect to TaskMaster terminal service',
    },
  })

  // Fetch command history when session is created
  React.useEffect(() => {
    if (session?.id && enableCommandHistory) {
      const loadCommandHistory = async () => {
        try {
          const historyResponse = await taskMasterTerminalService.getCommandHistory(session.id, {
            limit: maxHistoryEntries,
          })
          setCommandHistory(historyResponse.history)
        } catch (error) {
          console.warn('Failed to load command history from backend:', error)
        }
      }

      loadCommandHistory()
    }
  }, [session?.id, enableCommandHistory, maxHistoryEntries])

  // Enhanced backend suggestions integration
  const [backendSuggestions, setBackendSuggestions] = useState<string[]>([])

  // Helper function to find common prefix of strings
  const findCommonPrefix = useCallback((strings: string[]): string => {
    if (strings.length === 0) return ''
    if (strings.length === 1) return strings[0]

    let prefix = strings[0]
    for (let i = 1; i < strings.length; i++) {
      while (strings[i].indexOf(prefix) !== 0) {
        prefix = prefix.substring(0, prefix.length - 1)
        if (prefix === '') return ''
      }
    }
    return prefix
  }, [])

  // Helper function to get completions for current input
  const getCompletions = useCallback(
    (input: string): string[] => {
      const words = input.split(' ')
      const currentWord = words[words.length - 1] || ''
      const completions: string[] = []

      // Get backend suggestions first (highest priority)
      backendSuggestions.forEach((suggestion) => {
        if (!completions.includes(suggestion)) {
          completions.push(suggestion)
        }
      })

      // Get TaskMaster command completions
      Object.keys(TASKMASTER_COMMANDS).forEach((command) => {
        if (command.toLowerCase().startsWith(currentWord.toLowerCase())) {
          if (!completions.includes(command)) {
            completions.push(command)
          }
        }
      })

      // Get pattern completions for TaskMaster commands
      if (input.startsWith('task-master ')) {
        Object.keys(TASKMASTER_PATTERNS).forEach((pattern) => {
          if (pattern.toLowerCase().startsWith(currentWord.toLowerCase())) {
            if (!completions.includes(pattern)) {
              completions.push(pattern)
            }
          }
        })
      }

      // Get recent command completions
      if (enableCommandHistory) {
        commandHistory
          .filter((cmd) => cmd.toLowerCase().startsWith(input.toLowerCase()))
          .slice(0, 5)
          .forEach((cmd) => {
            if (!completions.includes(cmd)) {
              completions.push(cmd)
            }
          })
      }

      return completions.sort()
    },
    [commandHistory, enableCommandHistory, backendSuggestions]
  )

  // Generate TaskMaster command suggestions based on current input
  const suggestions = useMemo(() => {
    if (!enableTaskMasterSuggestions || !currentInput.trim()) {
      return []
    }

    const input = currentInput.toLowerCase()
    const allSuggestions: Array<{
      command: string
      description: string
      type: 'command' | 'pattern'
    }> = []

    // Add command suggestions
    Object.entries(TASKMASTER_COMMANDS).forEach(([command, description]) => {
      if (command.toLowerCase().includes(input)) {
        allSuggestions.push({ command, description, type: 'command' })
      }
    })

    // Add pattern suggestions for partial commands
    if (input.startsWith('task-master ')) {
      Object.entries(TASKMASTER_PATTERNS).forEach(([pattern, description]) => {
        if (pattern.toLowerCase().includes(input.split(' ').pop() || '')) {
          allSuggestions.push({
            command: pattern,
            description,
            type: 'pattern',
          })
        }
      })
    }

    // Add recent command history suggestions
    if (enableCommandHistory) {
      commandHistory
        .filter((cmd) => cmd.toLowerCase().includes(input))
        .slice(-5) // Last 5 matching commands
        .forEach((cmd) => {
          if (!allSuggestions.some((s) => s.command === cmd)) {
            allSuggestions.push({
              command: cmd,
              description: 'Recent command',
              type: 'command',
            })
          }
        })
    }

    return allSuggestions.slice(0, 10) // Limit to 10 suggestions
  }, [currentInput, enableTaskMasterSuggestions, enableCommandHistory, commandHistory])

  // Fetch backend suggestions for TaskMaster commands
  const fetchBackendSuggestions = useCallback(
    async (partialCommand: string) => {
      if (!session?.id || !partialCommand.startsWith('task-master')) {
        setBackendSuggestions([])
        return
      }

      try {
        const response = await taskMasterTerminalService.getCommandSuggestions(session.id, {
          partialCommand,
        })

        setBackendSuggestions(response.suggestions || [])
      } catch (error) {
        console.warn('Failed to fetch backend suggestions:', error)
        setBackendSuggestions([])
      }
    },
    [session?.id]
  )

  // Debounced backend suggestions fetching
  React.useEffect(() => {
    if (currentInput.startsWith('task-master') && currentInput.length > 12) {
      const timeoutId = setTimeout(() => {
        fetchBackendSuggestions(currentInput)
      }, 300) // 300ms debounce

      return () => clearTimeout(timeoutId)
    } else {
      setBackendSuggestions([])
    }
  }, [currentInput, fetchBackendSuggestions])

  // Enhanced execute command with TaskMaster-specific features
  const executeCommand = useCallback(
    async (command: string) => {
      try {
        // Add to command history if it's a new command
        if (enableCommandHistory && command.trim()) {
          setCommandHistory((prev) => {
            const newHistory = [command, ...prev.filter((c) => c !== command)]
            return newHistory.slice(0, maxHistoryEntries)
          })
        }

        // Reset history navigation state after command execution
        setHistoryIndex(-1)
        setOriginalInput('')

        // Add project tag to TaskMaster commands if specified
        let enhancedCommand = command
        if (
          projectTag &&
          command.trim().startsWith('task-master ') &&
          !command.includes('--tag=')
        ) {
          enhancedCommand = `${command} --tag=${projectTag}`
        }

        await baseExecuteCommand(enhancedCommand)
      } catch (error) {
        console.error('Failed to execute TaskMaster command:', error)
        throw error
      }
    },
    [baseExecuteCommand, projectTag, enableCommandHistory, maxHistoryEntries]
  )

  // Handle terminal ready with TaskMaster-specific setup
  const handleTerminalReady = useCallback(
    (terminalInstance: XTerminal) => {
      setTerminal(terminalInstance)

      // Write TaskMaster welcome message
      if (terminalInstance && projectTag) {
        terminalInstance.writeln(`\x1b[32m✓ TaskMaster CLI ready for project: ${projectTag}\x1b[0m`)
        terminalInstance.writeln(
          '\x1b[36mTip: Use Tab for command completion, ↑↓ for history\x1b[0m'
        )
        terminalInstance.writeln('')
      }
    },
    [setTerminal, projectTag]
  )

  // Handle data input with TaskMaster-specific features
  const handleData = useCallback(
    (data: string) => {
      // Handle special key sequences for TaskMaster features
      if (data === '\t') {
        // Tab key for intelligent autocompletion
        const completions = getCompletions(currentInput)

        if (completions.length === 0) {
          // No completions available
          return
        } else if (completions.length === 1) {
          // Single completion - complete it directly
          setCurrentInput(completions[0])
          setIsTabCompleting(false)
          setTabCompletionOptions([])
          setTabCompletionIndex(-1)
          setShowSuggestions(false)
        } else {
          // Multiple completions available
          if (!isTabCompleting) {
            // First tab - show common prefix and list options
            const commonPrefix = findCommonPrefix(completions)
            if (commonPrefix.length > currentInput.length) {
              // Complete to common prefix
              setCurrentInput(commonPrefix)
            }

            // Set up tab completion cycle
            setIsTabCompleting(true)
            setTabCompletionOptions(completions)
            setTabCompletionIndex(0)
            setShowSuggestions(true)
          } else {
            // Subsequent tabs - cycle through completions
            const nextIndex = (tabCompletionIndex + 1) % completions.length
            setTabCompletionIndex(nextIndex)
            setCurrentInput(completions[nextIndex])
          }
        }

        // Reset history navigation when using tab completion
        setHistoryIndex(-1)
        setOriginalInput('')
        return // Don't pass tab to terminal
      } else if (data === '\x1b[A') {
        // Up arrow for history navigation
        if (enableCommandHistory && commandHistory.length > 0) {
          // Save current input as original if we're starting history navigation
          if (historyIndex === -1) {
            setOriginalInput(currentInput)
          }

          const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1)
          setHistoryIndex(newIndex)
          setCurrentInput(commandHistory[newIndex])
          setShowSuggestions(false)
        }
        return
      } else if (data === '\x1b[B') {
        // Down arrow for history navigation
        if (enableCommandHistory && commandHistory.length > 0) {
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1
            setHistoryIndex(newIndex)
            setCurrentInput(commandHistory[newIndex])
          } else if (historyIndex === 0) {
            // Go back to original input
            setHistoryIndex(-1)
            setCurrentInput(originalInput)
          }
          setShowSuggestions(false)
        }
        return
      } else if (data === '\x1b') {
        // Escape key to cancel navigation states
        if (isTabCompleting) {
          // Cancel tab completion
          setIsTabCompleting(false)
          setTabCompletionOptions([])
          setTabCompletionIndex(-1)
          setShowSuggestions(false)
          return
        } else if (historyIndex >= 0) {
          // Cancel history navigation
          setHistoryIndex(-1)
          setCurrentInput(originalInput)
          setShowSuggestions(false)
          return
        }
      } else if (data === '\r') {
        // Enter key
        if (currentInput.trim()) {
          executeCommand(currentInput)
        }
        setCurrentInput('')
        setShowSuggestions(false)
        setSuggestionIndex(-1)
        // Reset all completion states
        setIsTabCompleting(false)
        setTabCompletionOptions([])
        setTabCompletionIndex(-1)
      } else if (data === '\x7f') {
        // Backspace
        setCurrentInput((prev) => prev.slice(0, -1))
        // Reset navigation states when manually editing
        setHistoryIndex(-1)
        setOriginalInput('')
        setIsTabCompleting(false)
        setTabCompletionOptions([])
        setTabCompletionIndex(-1)
      } else if (data.length === 1 && data.charCodeAt(0) >= 32) {
        // Printable characters
        const newInput = currentInput + data
        setCurrentInput(newInput)
        setShowSuggestions(enableTaskMasterSuggestions && newInput.length > 2)
        // Reset navigation states when manually typing
        setHistoryIndex(-1)
        setOriginalInput('')
        setIsTabCompleting(false)
        setTabCompletionOptions([])
        setTabCompletionIndex(-1)
      }

      // Pass data to the terminal
      if (websocket && session) {
        sendInput(data)
      }
    },
    [
      currentInput,
      suggestions,
      suggestionIndex,
      commandHistory,
      historyIndex,
      originalInput,
      enableCommandHistory,
      websocket,
      session,
      sendInput,
      executeCommand,
      enableTaskMasterSuggestions,
      getCompletions,
      findCommonPrefix,
      isTabCompleting,
      tabCompletionOptions,
      tabCompletionIndex,
    ]
  )

  const handleClose = useCallback(async () => {
    await closeSession()
    onClose?.()
  }, [closeSession, onClose])

  const handleResize = useCallback(
    (cols: number, rows: number) => {
      resizeTerminal(cols, rows)
    },
    [resizeTerminal]
  )

  // Enhance terminal title with project info
  const enhancedTitle = useMemo(() => {
    if (projectTag) {
      return `${title} - ${projectTag}`
    }
    return title
  }, [title, projectTag])

  return (
    <div className={`taskmaster-terminal-wrapper ${className}`}>
      <Terminal
        sessionId={session?.id}
        workingDirectory={currentDirectory}
        repositoryPath={repositoryPath}
        mode={mode}
        showHeader={showHeader}
        showStatusBar={showStatusBar}
        title={enhancedTitle}
        theme={theme}
        initialSize={initialSize}
        onReady={handleTerminalReady}
        onClose={handleClose}
        onData={handleData}
        onResize={handleResize}
        websocket={websocket || undefined}
        isLoading={isLoading}
        error={error}
        enableWebLinks={true}
        enableClipboard={true}
        className="taskmaster-terminal"
      />

      {/* TaskMaster Command Suggestions Overlay */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="taskmaster-suggestions">
          <div className="suggestions-header">
            <span className="suggestions-title">TaskMaster Commands</span>
            <span className="suggestions-hint">Tab to complete, ↑↓ to navigate</span>
          </div>
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.command}-${index}`}
                className={`suggestion-item ${index === suggestionIndex ? 'selected' : ''}`}
                onClick={() => {
                  setCurrentInput(suggestion.command)
                  setShowSuggestions(false)
                  setSuggestionIndex(-1)
                  setHistoryIndex(-1)
                  setOriginalInput('')
                  // Reset tab completion state
                  setIsTabCompleting(false)
                  setTabCompletionOptions([])
                  setTabCompletionIndex(-1)
                }}
              >
                <div className="suggestion-command">
                  <span className={`command-type ${suggestion.type}`}>
                    {suggestion.type === 'command' ? '⚡' : '🔧'}
                  </span>
                  <code>{suggestion.command}</code>
                </div>
                <div className="suggestion-description">{suggestion.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Command History Status Indicator */}
      {enableCommandHistory && historyIndex >= 0 && commandHistory.length > 0 && (
        <div className="command-history-indicator">
          <div className="history-status">
            <span className="history-icon">📚</span>
            <span className="history-text">
              History: {historyIndex + 1} of {commandHistory.length}
            </span>
            <span className="history-hint">↑↓ navigate • Esc to cancel</span>
          </div>
        </div>
      )}

      {/* Tab Completion Status Indicator */}
      {isTabCompleting && tabCompletionOptions.length > 1 && (
        <div className="tab-completion-indicator">
          <div className="completion-status">
            <span className="completion-icon">⇥</span>
            <span className="completion-text">
              Completion: {tabCompletionIndex + 1} of {tabCompletionOptions.length}
            </span>
            <span className="completion-hint">Tab to cycle • Esc to cancel</span>
          </div>
          <div className="completion-options">
            {tabCompletionOptions.map((option, index) => (
              <span
                key={option}
                className={`completion-option ${index === tabCompletionIndex ? 'active' : ''}`}
                onClick={() => {
                  setCurrentInput(option)
                  setIsTabCompleting(false)
                  setTabCompletionOptions([])
                  setTabCompletionIndex(-1)
                  setShowSuggestions(false)
                }}
              >
                {option}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskMasterTerminal
