import React, { useState, useRef, useEffect } from 'react'
import type { Task, TaskStatus } from '../../../../../types/task'

interface TaskActionsDropdownProps {
  /** The task to perform actions on */
  task: Task
  /** Whether actions are currently loading */
  isLoading?: boolean
  /** Whether user has edit permissions */
  canEdit?: boolean
  /** Whether user has delete permissions */
  canDelete?: boolean
  /** Callback for status change */
  onStatusChange?: (taskId: number, status: TaskStatus) => Promise<void>
  /** Callback for task assignment */
  onAssign?: (taskId: number, assignee: string) => Promise<void>
  /** Callback for task duplication */
  onDuplicate?: (task: Task) => Promise<void>
  /** Callback for task export */
  onExport?: (task: Task, format: 'json' | 'csv') => void
  /** Callback for task moving to another project */
  onMoveToProject?: (taskId: number, projectId: string) => Promise<void>
  /** Callback for converting to subtask */
  onConvertToSubtask?: (taskId: number, parentId: number) => Promise<void>
  /** Callback for task archiving */
  onArchive?: (taskId: number) => Promise<void>
  /** Additional CSS class */
  className?: string
}

/**
 * TaskActionsDropdown Component
 * 
 * Provides a dropdown menu with advanced task actions.
 * Includes keyboard navigation and accessibility features.
 */
export const TaskActionsDropdown: React.FC<TaskActionsDropdownProps> = ({
  task,
  isLoading = false,
  canEdit = true,
  canDelete = true,
  onStatusChange,
  onAssign,
  onDuplicate,
  onExport,
  onMoveToProject,
  onConvertToSubtask,
  onArchive,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        setIsOpen(false)
        buttonRef.current?.focus()
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        }
        break
    }
  }

  const handleStatusAction = async (status: TaskStatus) => {
    if (onStatusChange) {
      await onStatusChange(task.id, status)
      setIsOpen(false)
    }
  }

  const handleDuplicate = async () => {
    if (onDuplicate) {
      await onDuplicate(task)
      setIsOpen(false)
    }
  }

  const handleExport = (format: 'json' | 'csv') => {
    if (onExport) {
      onExport(task, format)
      setIsOpen(false)
    }
  }

  const handleArchive = async () => {
    if (onArchive && canDelete) {
      const confirmed = window.confirm(
        `Are you sure you want to archive "${task.title}"?`
      )
      if (confirmed) {
        await onArchive(task.id)
        setIsOpen(false)
      }
    }
  }

  return (
    <div ref={dropdownRef} className={`task-actions-dropdown relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        aria-label="Task actions menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="sr-only">More actions</span>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="task-actions-menu"
        >
          <div className="py-1">
            {/* Status Actions */}
            {onStatusChange && canEdit && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Change Status
                </div>
                {task.status !== 'done' && (
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleStatusAction('done')}
                    disabled={isLoading}
                    role="menuitem"
                  >
                    <span className="mr-2">✓</span>
                    Mark as Complete
                  </button>
                )}
                {task.status !== 'in-progress' && (
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleStatusAction('in-progress')}
                    disabled={isLoading}
                    role="menuitem"
                  >
                    <span className="mr-2">▶</span>
                    Start Progress
                  </button>
                )}
                {task.status !== 'blocked' && (
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleStatusAction('blocked')}
                    disabled={isLoading}
                    role="menuitem"
                  >
                    <span className="mr-2">🚫</span>
                    Mark as Blocked
                  </button>
                )}
                {task.status !== 'deferred' && (
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleStatusAction('deferred')}
                    disabled={isLoading}
                    role="menuitem"
                  >
                    <span className="mr-2">⏸</span>
                    Defer Task
                  </button>
                )}
                <div className="border-t border-gray-100 my-1" />
              </>
            )}

            {/* Other Actions */}
            {onDuplicate && canEdit && (
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleDuplicate}
                disabled={isLoading}
                role="menuitem"
              >
                <span className="mr-2">📋</span>
                Duplicate Task
              </button>
            )}

            {onExport && (
              <>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => handleExport('json')}
                  disabled={isLoading}
                  role="menuitem"
                >
                  <span className="mr-2">⬇</span>
                  Export as JSON
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => handleExport('csv')}
                  disabled={isLoading}
                  role="menuitem"
                >
                  <span className="mr-2">⬇</span>
                  Export as CSV
                </button>
              </>
            )}

            {/* Dangerous Actions */}
            {(onArchive || onConvertToSubtask || onMoveToProject) && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Advanced
                </div>
              </>
            )}

            {onMoveToProject && canEdit && (
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  // This would open a project selector modal
                  console.log('Move to project not implemented')
                  setIsOpen(false)
                }}
                disabled={isLoading}
                role="menuitem"
              >
                <span className="mr-2">📁</span>
                Move to Project
              </button>
            )}

            {onConvertToSubtask && canEdit && (
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  // This would open a parent task selector
                  console.log('Convert to subtask not implemented')
                  setIsOpen(false)
                }}
                disabled={isLoading}
                role="menuitem"
              >
                <span className="mr-2">🔗</span>
                Convert to Subtask
              </button>
            )}

            {onArchive && canDelete && (
              <button
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={handleArchive}
                disabled={isLoading}
                role="menuitem"
              >
                <span className="mr-2">🗑</span>
                Archive Task
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskActionsDropdown