import React, { useState, useCallback, useMemo } from 'react';
import { Terminal as XTerminal } from '@xterm/xterm';
import { Terminal } from './Terminal';
import { useTerminal } from '../../hooks/useTerminal';

export interface TaskMasterTerminalProps {
  /** Working directory for the terminal */
  workingDirectory?: string;
  /** Repository path if terminal is scoped to a repository */
  repositoryPath?: string;
  /** Terminal display mode */
  mode?: 'embedded' | 'popup' | 'fullscreen';
  /** Whether to show the terminal header */
  showHeader?: boolean;
  /** Whether to show the status bar */
  showStatusBar?: boolean;
  /** Terminal title */
  title?: string;
  /** Terminal theme */
  theme?: 'dark' | 'light';
  /** Initial size */
  initialSize?: { cols: number; rows: number };
  /** Callback when terminal is closed */
  onClose?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Project tag for TaskMaster CLI commands */
  projectTag?: string;
  /** Whether to enable TaskMaster command suggestions */
  enableTaskMasterSuggestions?: boolean;
  /** Whether to enable command history */
  enableCommandHistory?: boolean;
  /** Maximum number of command history entries */
  maxHistoryEntries?: number;
}

// TaskMaster CLI commands and their descriptions
const TASKMASTER_COMMANDS = {
  'task-master init': 'Initialize TaskMaster in current directory',
  'task-master list': 'List all tasks with status',
  'task-master next': 'Get next available task to work on',
  'task-master show': 'View detailed task information (e.g., task-master show 1.2)',
  'task-master set-status': 'Mark task complete (e.g., task-master set-status --id=1 --status=done)',
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
} as const;

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
} as const;

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
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
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
  });

  // Generate TaskMaster command suggestions based on current input
  const suggestions = useMemo(() => {
    if (!enableTaskMasterSuggestions || !currentInput.trim()) {
      return [];
    }

    const input = currentInput.toLowerCase();
    const allSuggestions: Array<{ command: string; description: string; type: 'command' | 'pattern' }> = [];

    // Add command suggestions
    Object.entries(TASKMASTER_COMMANDS).forEach(([command, description]) => {
      if (command.toLowerCase().includes(input)) {
        allSuggestions.push({ command, description, type: 'command' });
      }
    });

    // Add pattern suggestions for partial commands
    if (input.startsWith('task-master ')) {
      Object.entries(TASKMASTER_PATTERNS).forEach(([pattern, description]) => {
        if (pattern.toLowerCase().includes(input.split(' ').pop() || '')) {
          allSuggestions.push({ 
            command: pattern, 
            description, 
            type: 'pattern' 
          });
        }
      });
    }

    // Add recent command history suggestions
    if (enableCommandHistory) {
      commandHistory
        .filter(cmd => cmd.toLowerCase().includes(input))
        .slice(-5) // Last 5 matching commands
        .forEach(cmd => {
          if (!allSuggestions.some(s => s.command === cmd)) {
            allSuggestions.push({ 
              command: cmd, 
              description: 'Recent command', 
              type: 'command' 
            });
          }
        });
    }

    return allSuggestions.slice(0, 10); // Limit to 10 suggestions
  }, [currentInput, enableTaskMasterSuggestions, enableCommandHistory, commandHistory]);

  // Enhanced execute command with TaskMaster-specific features
  const executeCommand = useCallback(async (command: string) => {
    try {
      // Add to command history if it's a new command
      if (enableCommandHistory && command.trim()) {
        setCommandHistory(prev => {
          const newHistory = [command, ...prev.filter(c => c !== command)];
          return newHistory.slice(0, maxHistoryEntries);
        });
      }

      // Add project tag to TaskMaster commands if specified
      let enhancedCommand = command;
      if (projectTag && command.trim().startsWith('task-master ') && !command.includes('--tag=')) {
        enhancedCommand = `${command} --tag=${projectTag}`;
      }

      await baseExecuteCommand(enhancedCommand);
    } catch (error) {
      console.error('Failed to execute TaskMaster command:', error);
      throw error;
    }
  }, [baseExecuteCommand, projectTag, enableCommandHistory, maxHistoryEntries]);

  // Handle terminal ready with TaskMaster-specific setup
  const handleTerminalReady = useCallback((terminalInstance: XTerminal) => {
    setTerminal(terminalInstance);
    
    // Write TaskMaster welcome message
    if (terminalInstance && projectTag) {
      terminalInstance.writeln(`\x1b[32m✓ TaskMaster CLI ready for project: ${projectTag}\x1b[0m`);
      terminalInstance.writeln('\x1b[36mTip: Use Tab for command completion, ↑↓ for history\x1b[0m');
      terminalInstance.writeln('');
    }
  }, [setTerminal, projectTag]);

  // Handle data input with TaskMaster-specific features
  const handleData = useCallback((data: string) => {
    // Handle special key sequences for TaskMaster features
    if (data === '\t') { // Tab key for autocompletion
      if (suggestions.length > 0) {
        const suggestion = suggestions[Math.max(0, suggestionIndex)];
        setCurrentInput(suggestion.command);
        setShowSuggestions(false);
        setSuggestionIndex(-1);
      }
      return; // Don't pass tab to terminal
    } else if (data === '\x1b[A') { // Up arrow for history
      if (commandHistory.length > 0) {
        // Cycle through command history
        const nextIndex = Math.min(commandHistory.length - 1, 
          commandHistory.findIndex(cmd => cmd === currentInput) + 1);
        setCurrentInput(commandHistory[nextIndex] || commandHistory[0]);
      }
      return;
    } else if (data === '\x1b[B') { // Down arrow for history
      if (commandHistory.length > 0) {
        // Cycle through command history
        const prevIndex = Math.max(0, 
          commandHistory.findIndex(cmd => cmd === currentInput) - 1);
        setCurrentInput(commandHistory[prevIndex] || '');
      }
      return;
    } else if (data === '\r') { // Enter key
      if (currentInput.trim()) {
        executeCommand(currentInput);
      }
      setCurrentInput('');
      setShowSuggestions(false);
      setSuggestionIndex(-1);
    } else if (data === '\x7f') { // Backspace
      setCurrentInput(prev => prev.slice(0, -1));
    } else if (data.length === 1 && data.charCodeAt(0) >= 32) { // Printable characters
      const newInput = currentInput + data;
      setCurrentInput(newInput);
      setShowSuggestions(enableTaskMasterSuggestions && newInput.length > 2);
    }

    // Pass data to the terminal
    if (websocket && session) {
      sendInput(data);
    }
  }, [currentInput, suggestions, suggestionIndex, commandHistory, websocket, session, sendInput, executeCommand, enableTaskMasterSuggestions]);

  const handleClose = useCallback(async () => {
    await closeSession();
    onClose?.();
  }, [closeSession, onClose]);

  const handleResize = useCallback((cols: number, rows: number) => {
    resizeTerminal(cols, rows);
  }, [resizeTerminal]);

  // Enhance terminal title with project info
  const enhancedTitle = useMemo(() => {
    if (projectTag) {
      return `${title} - ${projectTag}`;
    }
    return title;
  }, [title, projectTag]);

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
                  setCurrentInput(suggestion.command);
                  setShowSuggestions(false);
                  setSuggestionIndex(-1);
                }}
              >
                <div className="suggestion-command">
                  <span className={`command-type ${suggestion.type}`}>
                    {suggestion.type === 'command' ? '⚡' : '🔧'}
                  </span>
                  <code>{suggestion.command}</code>
                </div>
                <div className="suggestion-description">
                  {suggestion.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskMasterTerminal;