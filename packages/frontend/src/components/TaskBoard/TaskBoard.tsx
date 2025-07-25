import React, { useRef, useEffect, useState } from 'react'
import type { TaskBoardData, TaskStatus } from '../../types/task'
import { TaskColumn } from './TaskColumn'
import { TaskCard } from './TaskCard'
import { DragAndDropProvider } from './DragAndDropProvider'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { AriaLiveRegion } from '../common/AriaLiveRegion'
import { useAriaAnnouncements } from '../../hooks/useAriaAnnouncements'
import { ExportButton } from '../Export/ExportButton'
import { ProfilerWrapper } from '../../utils/profiler'

export interface TaskBoardProps {
  /** Task board data containing columns and tasks */
  data?: TaskBoardData
  /** Whether the board is in a loading state */
  isLoading?: boolean
  /** Error message to display */
  error?: string | null
  /** Additional CSS class name */
  className?: string
  /** Callback when a task is clicked */
  onTaskClick?: (taskId: number) => void
  /** Callback when a task is moved between columns */
  onTaskMove?: (taskId: number, fromStatus: TaskStatus, toStatus: TaskStatus) => void
  /** Whether to show the create task button */
  showCreateButton?: boolean
  /** Callback when create task is clicked */
  onCreateTask?: (status: TaskStatus) => void
  /** Whether to show the export button */
  showExportButton?: boolean
  /** Project ID for export functionality */
  projectId?: string
}

/**
 * Task Board Component
 *
 * Main Kanban-style board component that displays tasks organized by status columns.
 * Supports drag-and-drop functionality and task management operations.
 */
const TaskBoardComponent = ({
  data,
  isLoading = false,
  error = null,
  className = '',
  onTaskClick,
  onTaskMove,
  showCreateButton = true,
  onCreateTask,
  showExportButton = true,
  projectId,
}: TaskBoardProps) => {
  const boardRef = useRef<HTMLDivElement>(null)
  const currentColumnRef = useRef<number>(0)
  const currentCardRef = useRef<number>(0)
  const { announcement, politeness, announceTaskMove, announceLoading } = useAriaAnnouncements()
  
  // Find the currently dragged task for the overlay - must be declared before any returns
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null)

  // Keyboard navigation for columns and cards
  const navigateColumns = (direction: 'left' | 'right') => {
    if (!data || !boardRef.current) return

    const columns = boardRef.current.querySelectorAll('[data-status]')
    const totalColumns = columns.length

    if (direction === 'left') {
      currentColumnRef.current = Math.max(0, currentColumnRef.current - 1)
    } else {
      currentColumnRef.current = Math.min(totalColumns - 1, currentColumnRef.current + 1)
    }

    const targetColumn = columns[currentColumnRef.current] as HTMLElement
    if (targetColumn) {
      // Focus first task card in the column
      const firstCard = targetColumn.querySelector('[role="button"][tabindex="0"]') as HTMLElement
      if (firstCard) {
        firstCard.focus()
        currentCardRef.current = 0
      } else {
        targetColumn.focus()
      }
    }
  }

  const navigateCards = (direction: 'up' | 'down') => {
    if (!data || !boardRef.current) return

    const columns = boardRef.current.querySelectorAll('[data-status]')
    const currentColumn = columns[currentColumnRef.current] as HTMLElement
    if (!currentColumn) return

    const cards = currentColumn.querySelectorAll('[role="button"][tabindex="0"]')
    const totalCards = cards.length

    if (totalCards === 0) return

    if (direction === 'up') {
      currentCardRef.current = Math.max(0, currentCardRef.current - 1)
    } else {
      currentCardRef.current = Math.min(totalCards - 1, currentCardRef.current + 1)
    }

    const targetCard = cards[currentCardRef.current] as HTMLElement
    if (targetCard) {
      targetCard.focus()
    }
  }

  // Set up keyboard shortcuts for navigation
  useKeyboardShortcuts([
    {
      key: 'ArrowLeft',
      description: 'Navigate to previous column',
      handler: () => navigateColumns('left'),
    },
    {
      key: 'ArrowRight',
      description: 'Navigate to next column',
      handler: () => navigateColumns('right'),
    },
    {
      key: 'ArrowUp',
      description: 'Navigate to previous task',
      handler: () => navigateCards('up'),
    },
    {
      key: 'ArrowDown',
      description: 'Navigate to next task',
      handler: () => navigateCards('down'),
    },
  ])

  // Reset navigation indices when data changes
  useEffect(() => {
    currentColumnRef.current = 0
    currentCardRef.current = 0
  }, [data])

  // Announce loading state changes
  useEffect(() => {
    if (isLoading) {
      announceLoading(true, 'task board')
    }
  }, [isLoading, announceLoading])
  if (isLoading) {
    return (
      <main className={`task-board loading ${className}`} role="main" aria-label="Task Board">
        <header className="task-board__header">
          <h2 className="task-board__title">Task Board</h2>
          <div className="task-board__stats" role="status" aria-live="polite">
            <span className="stat-item skeleton">Loading...</span>
          </div>
        </header>
        <div className="task-board__columns" role="group" aria-label="Task columns">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="task-column__skeleton"
              role="status"
              aria-label={`Loading column ${index + 1}`}
            >
              <div className="column-header__skeleton">
                <div className="skeleton-line column-title" aria-hidden="true" />
                <div className="skeleton-line column-count" aria-hidden="true" />
              </div>
              <div className="column-content__skeleton">
                {Array.from({ length: 2 }).map((_, cardIndex) => (
                  <div key={cardIndex} className="task-card__skeleton" aria-hidden="true">
                    <div className="skeleton-line skeleton-title" />
                    <div className="skeleton-line skeleton-description" />
                    <div className="skeleton-line skeleton-meta" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className={`task-board error ${className}`} role="main" aria-label="Task Board">
        <header className="task-board__header">
          <h2 className="task-board__title">Task Board</h2>
        </header>
        <div className="task-board__error" role="alert">
          <div className="error-content">
            <span className="error-icon" aria-hidden="true">
              ⚠️
            </span>
            <h3 className="error-title">Failed to Load Task Board</h3>
            <p className="error-message">{error}</p>
            <button
              className="error-retry-button"
              onClick={() => window.location.reload()}
              aria-label="Retry loading the task board"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    )
  }

  // If no data is provided, show empty state
  if (!data) {
    return (
      <main className={`task-board empty ${className}`} role="main" aria-label="Task Board">
        <header className="task-board__header">
          <h2 className="task-board__title">Task Board</h2>
        </header>
        <div className="task-board__empty" role="status">
          <div className="empty-content">
            <span className="empty-icon" aria-hidden="true">
              📋
            </span>
            <h3 className="empty-title">No Task Data Available</h3>
            <p className="empty-message">
              Connect a repository with task-master project to view tasks.
            </p>
          </div>
        </div>
      </main>
    )
  }

  const { columns, tasks, metadata } = data
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === 'done').length
  const inProgressTasks = tasks.filter((task) => task.status === 'in-progress').length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Create enhanced onTaskMove handler with announcements
  const handleTaskMove = (taskId: number, fromStatus: TaskStatus, toStatus: TaskStatus) => {
    const task = data.tasks.find(t => t.id === taskId)
    if (task) {
      announceTaskMove(task.title, fromStatus, toStatus)
    }
    onTaskMove?.(taskId, fromStatus, toStatus)
  }

  // Find the currently dragged task for the overlay
  const draggedTask = draggedTaskId
    ? Object.values(columns)
        .flatMap(col => col.tasks)
        .find(task => task.id === draggedTaskId)
    : null

  return (
    <ProfilerWrapper id="TaskBoard">
      <DragAndDropProvider 
        onTaskMove={handleTaskMove} 
        onDragStart={setDraggedTaskId}
        onDragEnd={() => setDraggedTaskId(null)}
        dragOverlay={
        draggedTask ? (
          <TaskCard
            task={draggedTask}
            isDraggable={false}
            compact={true}
          />
        ) : null
      }
      className={className}
    >
      <main className={`task-board ${className}`} role="main" aria-label="Task Board">
        <AriaLiveRegion message={announcement} politeness={politeness} />
        <header className="task-board__header">
          <div className="header-main">
            <h2 className="task-board__title">
              Task Board
              {metadata?.projectName && (
                <span className="project-name"> - {metadata.projectName}</span>
              )}
            </h2>
            <div className="task-board__stats" role="region" aria-label="Task statistics">
              <div className="stat-item" role="img" aria-label={`${totalTasks} total tasks`}>
                <span className="stat-icon" aria-hidden="true">
                  📊
                </span>
                <span className="stat-value">{totalTasks}</span>
                <span className="stat-label">total tasks</span>
              </div>
              <div
                className="stat-item"
                role="img"
                aria-label={`${inProgressTasks} tasks in progress`}
              >
                <span className="stat-icon" aria-hidden="true">
                  🔄
                </span>
                <span className="stat-value">{inProgressTasks}</span>
                <span className="stat-label">in progress</span>
              </div>
              <div
                className="stat-item"
                role="img"
                aria-label={`${completedTasks} completed tasks`}
              >
                <span className="stat-icon" aria-hidden="true">
                  ✅
                </span>
                <span className="stat-value">{completedTasks}</span>
                <span className="stat-label">completed</span>
              </div>
              <div
                className="stat-item"
                role="img"
                aria-label={`${completionRate}% completion rate`}
              >
                <span className="stat-icon" aria-hidden="true">
                  📈
                </span>
                <span className="stat-value">{completionRate}%</span>
                <span className="stat-label">completion</span>
              </div>
            </div>
          </div>

          {(showCreateButton || showExportButton) && (
            <div className="header-actions">
              {showCreateButton && (
                <button
                  className="create-task-button"
                  onClick={() => onCreateTask?.('pending')}
                  aria-label="Create new task"
                  title="Create new task"
                >
                  <span className="button-icon" aria-hidden="true">
                    ➕
                  </span>
                  New Task
                </button>
              )}
              {showExportButton && (
                <ExportButton
                  projectId={projectId}
                  currentFilters={{}}
                />
              )}
            </div>
          )}
        </header>

        <div ref={boardRef} className="task-board__columns" role="group" aria-label="Kanban board columns">
          <div className="sr-only" role="note">
            Use arrow keys to navigate between columns and tasks. Press Enter or Space to select a task.
          </div>
          {columns.map((column) => (
            <TaskColumn
              key={column.id}
              column={column}
              onTaskClick={onTaskClick}
              onTaskMove={onTaskMove}
              showCreateButton={showCreateButton}
              onCreateTask={onCreateTask}
            />
          ))}
        </div>

        {metadata?.updated && (
          <footer className="task-board__footer">
            <span className="last-updated" role="status" aria-live="polite">
              Last updated: {new Date(metadata.updated).toLocaleString()}
            </span>
          </footer>
        )}

        {/* Live region for announcing task movements and updates */}
        <div
          id="task-board-announcements"
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
         />
      </main>
    </DragAndDropProvider>
    </ProfilerWrapper>
  )
}

// Memoize TaskBoard to prevent unnecessary re-renders
export const TaskBoard = React.memo(TaskBoardComponent, (prevProps, nextProps) => {
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.error === nextProps.error &&
    prevProps.className === nextProps.className &&
    prevProps.showCreateButton === nextProps.showCreateButton &&
    prevProps.showExportButton === nextProps.showExportButton &&
    prevProps.projectId === nextProps.projectId &&
    prevProps.onTaskClick === nextProps.onTaskClick &&
    prevProps.onTaskMove === nextProps.onTaskMove &&
    prevProps.onCreateTask === nextProps.onCreateTask &&
    // Deep comparison of task board data
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  )
})

TaskBoard.displayName = 'TaskBoard'

export default TaskBoard
