import React from 'react'
import { KanbanTaskCard } from '../molecules/KanbanTaskCard'
import type { KanbanTask } from '../molecules/KanbanColumn'

export interface KanbanDragOverlayProps {
  /** The task being dragged */
  task: KanbanTask | null
  /** Whether the overlay is active */
  isActive: boolean
  /** Additional CSS class name */
  className?: string
}

/**
 * Drag Overlay Component for Kanban Board
 *
 * Provides visual feedback during drag operations by showing a ghost version
 * of the task card being dragged. The overlay follows the cursor and provides
 * clear visual indication of the drag state.
 */
export const KanbanDragOverlay = ({
  task,
  isActive,
  className = '',
}) => {
  if (!task || !isActive) {
    return null
  }

  return (
    <div
      className={`kanban-drag-overlay ${className}`}
      style={{
        transform: 'rotate(5deg)',
        opacity: 0.8,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <KanbanTaskCard
        id={task.id}
        title={task.title}
        description={task.description}
        status={task.status}
        priority={task.priority}
        complexity={task.complexity}
        estimatedHours={task.estimatedHours}
        assignedTo={task.assignedTo}
        tags={task.tags}
        createdAt={task.createdAt}
        updatedAt={task.updatedAt}
        dueDate={task.dueDate}
        subtasks={task.subtasks}
        isDragging={true}
        isDraggable={false}
        className="shadow-2xl border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20"
      />
    </div>
  )
}

export default KanbanDragOverlay
