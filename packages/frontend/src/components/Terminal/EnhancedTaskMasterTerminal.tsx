import React, { useState, useCallback, useMemo } from 'react'
import { TaskMasterTerminal, type TaskMasterTerminalProps } from './TaskMasterTerminal'
import { cn } from '../../utils/cn'
import { Icon } from '../ui/IconWrapper'
import { Button } from '../ui/atoms/Button'
import { Tooltip } from '../ui/Tooltip'

export interface QuickCommand {
  id: string
  label: string
  command: string
  description?: string
  icon?: string
  hotkey?: string
}

export interface EnhancedTaskMasterTerminalProps extends TaskMasterTerminalProps {
  /** Quick commands to display in the shortcuts bar */
  quickCommands?: QuickCommand[]
  /** Whether to show window controls */
  showWindowControls?: boolean
  /** Whether to show quick commands bar */
  showQuickCommands?: boolean
  /** Callback when window is maximized */
  onMaximize?: () => void
  /** Callback when window is minimized */
  onMinimize?: () => void
  /** Whether the terminal is maximized */
  isMaximized?: boolean
}

const defaultQuickCommands: QuickCommand[] = [
  {
    id: 'list',
    label: 'List Tasks',
    command: 'task-master list',
    description: 'Show all tasks with current status',
    icon: 'list',
    hotkey: 'Cmd+L',
  },
  {
    id: 'next',
    label: 'Next Task',
    command: 'task-master next',
    description: 'Get the next available task',
    icon: 'arrow-right',
    hotkey: 'Cmd+N',
  },
  {
    id: 'status',
    label: 'Update Status',
    command: 'task-master set-status --id= --status=',
    description: 'Update task status',
    icon: 'check-circle',
    hotkey: 'Cmd+S',
  },
  {
    id: 'add',
    label: 'Add Task',
    command: 'task-master add-task --prompt=""',
    description: 'Add a new task',
    icon: 'plus',
    hotkey: 'Cmd+A',
  },
  {
    id: 'show',
    label: 'Show Task',
    command: 'task-master show --id=',
    description: 'Show task details',
    icon: 'eye',
    hotkey: 'Cmd+D',
  },
  {
    id: 'expand',
    label: 'Expand Task',
    command: 'task-master expand --id= --research',
    description: 'Break task into subtasks',
    icon: 'chevron-down',
  },
]

/**
 * Enhanced TaskMaster Terminal with Quick Commands and Window Controls
 * 
 * Adds:
 * - Quick command shortcuts bar
 * - macOS-style window controls
 * - Keyboard shortcuts
 * - Full screen mode
 */
export const EnhancedTaskMasterTerminal = ({
  quickCommands = defaultQuickCommands,
  showWindowControls = true,
  showQuickCommands = true,
  showHeader = true,
  onMaximize,
  onMinimize,
  onClose,
  isMaximized = false,
  className,
  title = 'TaskMaster Terminal',
  projectTag,
  ...terminalProps
}: EnhancedTaskMasterTerminalProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Handle quick command execution
  const handleQuickCommand = useCallback(
    (command: string) => {
      // For now, just copy the command to clipboard
      // TODO: Implement direct command execution when TaskMasterTerminal exposes methods via ref
      navigator.clipboard.writeText(command).then(() => {
        // Show a temporary notification that command was copied
        const notification = document.createElement('div')
        notification.textContent = 'Command copied to clipboard! Paste it in the terminal.'
        notification.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #4a5568; color: white; padding: 12px 24px; border-radius: 6px; z-index: 1000; animation: fadeInOut 3s ease-in-out;'
        document.body.appendChild(notification)
        setTimeout(() => notification.remove(), 3000)
      })
    },
    []
  )

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Cmd (Mac) or Ctrl (Windows/Linux) is pressed
      const modifierKey = e.metaKey || e.ctrlKey

      if (!modifierKey) return

      // Find matching quick command by hotkey
      const matchingCommand = quickCommands.find(
        (cmd) => cmd.hotkey && cmd.hotkey.toLowerCase().endsWith(e.key.toLowerCase())
      )

      if (matchingCommand) {
        e.preventDefault()
        handleQuickCommand(matchingCommand.command)
      }

      // Handle fullscreen toggle
      if (e.key === 'f') {
        e.preventDefault()
        setIsFullscreen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [quickCommands, handleQuickCommand])

  // Enhanced title with indicators
  const enhancedTitle = useMemo(() => {
    const parts = [title]
    if (projectTag) parts.push(`[${projectTag}]`)
    if (isFullscreen) parts.push('(Fullscreen)')
    return parts.join(' ')
  }, [title, projectTag, isFullscreen])

  return (
    <div
      className={cn(
        'taskmaster-terminal-container',
        isFullscreen && 'fixed inset-0 z-50',
        isMaximized && 'maximized',
        className
      )}
    >
      {/* Custom Header with Window Controls */}
      {showHeader && (
        <div className="terminal-header">
          <div className="flex items-center gap-4">
            {/* Window Controls */}
            {showWindowControls && (
              <div className="window-controls">
                <button
                  className="window-control close"
                  onClick={onClose}
                  aria-label="Close terminal"
                />
                <button
                  className="window-control minimize"
                  onClick={onMinimize}
                  aria-label="Minimize terminal"
                />
                <button
                  className="window-control maximize"
                  onClick={onMaximize || (() => setIsFullscreen(!isFullscreen))}
                  aria-label="Maximize terminal"
                />
              </div>
            )}

            {/* Terminal Title */}
            <div className="terminal-title">
              <Icon name="terminal" className="w-4 h-4" />
              <span>{enhancedTitle}</span>
            </div>
          </div>

          {/* Terminal Controls */}
          <div className="terminal-controls">
            <Tooltip content="Toggle Fullscreen (Cmd+F)">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1"
              >
                <Icon
                  name={isFullscreen ? 'minimize' : 'maximize'}
                  className="w-4 h-4"
                />
              </Button>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Quick Commands Bar */}
      {showQuickCommands && (
        <div className="quick-commands">
          {quickCommands.map((cmd) => (
            <Tooltip
              key={cmd.id}
              content={
                <div>
                  <div className="font-medium">{cmd.description}</div>
                  {cmd.hotkey && (
                    <div className="text-xs opacity-70 mt-1">{cmd.hotkey}</div>
                  )}
                </div>
              }
            >
              <button
                className="quick-command-btn"
                onClick={() => handleQuickCommand(cmd.command)}
              >
                {cmd.icon && <Icon name={cmd.icon as any} className="w-3 h-3 mr-1" />}
                <span>{cmd.label}</span>
              </button>
            </Tooltip>
          ))}
        </div>
      )}

      {/* Terminal Content */}
      <div className="terminal-content">
        <TaskMasterTerminal
          {...terminalProps}
          // ref={terminalRef} // TODO: Add ref support to TaskMasterTerminal
          showHeader={false} // We're providing our own header
          title={title}
          projectTag={projectTag}
          onClose={onClose}
          className="h-full"
        />
      </div>

      {/* Status Indicators */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        {/* Connection Status */}
        <div className="terminal-status">
          <div className="status-dot connected" />
          <span className="text-xs">Connected</span>
        </div>

        {/* Tab Hint */}
        <div className="tab-hint visible">
          Press Tab for autocomplete
        </div>
      </div>
    </div>
  )
}

export default EnhancedTaskMasterTerminal