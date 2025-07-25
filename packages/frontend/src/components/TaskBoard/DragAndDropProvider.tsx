import React, { useState, useCallback } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { TaskStatus } from '../../types/task'
import { announceToScreenReader } from '../../utils/keyboard'

export interface DragAndDropProviderProps {
  /** Children components to wrap with drag and drop context */
  children: React.ReactNode
  /** Callback when a task is moved between columns */
  onTaskMove?: (taskId: number, fromStatus: TaskStatus, toStatus: TaskStatus) => void
  /** Callback when drag starts */
  onDragStart?: (taskId: number) => void
  /** Callback when drag ends */
  onDragEnd?: () => void
  /** Optional drag overlay component */
  dragOverlay?: React.ReactNode
  /** Additional CSS class name */
  className?: string
}

export interface DragData {
  type: 'task'
  taskId: number
  status: TaskStatus
}

export interface DropData {
  type: 'column'
  status: TaskStatus
}

/**
 * Drag and Drop Provider Component
 *
 * Provides drag and drop context for the task board using dnd-kit.
 * Handles drag events, accessibility, and provides the necessary context
 * for draggable tasks and droppable columns.
 */
export const DragAndDropProvider = ({
  children,
  onTaskMove,
  onDragStart,
  onDragEnd,
  dragOverlay,
  className = '',
}: DragAndDropProviderProps) => {
  const [activeId, setActiveId] = useState<string | null>(null)

  // Configure sensors for different input methods
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  // Handle drag start
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      setActiveId(active.id as string)

      // Add visual feedback
      document.body.style.cursor = 'grabbing'

      const activeData = active.data.current as unknown as DragData
      if (activeData && activeData.type === 'task') {
        announceToScreenReader(
          `Started moving task ${activeData.taskId} from ${activeData.status}`,
          'polite'
        )

        // Call the onDragStart callback
        if (onDragStart) {
          onDragStart(activeData.taskId)
        }
      }

      console.log('Drag started:', active.id)
    },
    [onDragStart]
  )

  // Handle drag over (for visual feedback and cross-column movement)
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event

    if (!over) {
      return
    }

    const activeData = active.data.current as unknown as DragData
    const overData = over.data.current as unknown as DropData | DragData

    // If we're over a column and it's different from the current one
    if (activeData?.type === 'task' && overData?.type === 'column') {
      const fromStatus = activeData.status
      const toStatus = overData.status

      if (fromStatus !== toStatus) {
        console.log('Dragging over different column:', { from: fromStatus, to: toStatus })
        // The visual feedback is handled by the column's isOver state
      }
    }
    
    // If we're over another task
    if (activeData?.type === 'task' && overData?.type === 'task') {
      console.log('Dragging over task:', { activeId: active.id, overId: over.id })
    }
  }, [])

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      // Clean up
      setActiveId(null)
      document.body.style.cursor = ''

      if (!over) {
        announceToScreenReader('Task move cancelled', 'polite')
        console.log('Drag ended without drop target')
        return
      }

      const activeData = active.data.current as unknown as DragData
      const overData = over.data.current as unknown as DropData

      // Validate drag data
      if (!activeData || activeData.type !== 'task') {
        announceToScreenReader('Invalid task move attempted', 'assertive')
        console.error('Invalid drag data:', activeData)
        return
      }

      // Validate drop data
      if (!overData || overData.type !== 'column') {
        announceToScreenReader('Invalid drop target', 'assertive')
        console.error('Invalid drop data:', overData)
        return
      }

      const { taskId, status: fromStatus } = activeData
      const { status: toStatus } = overData

      // Don't move if status is the same
      if (fromStatus === toStatus) {
        announceToScreenReader(`Task ${taskId} is already in ${fromStatus}`, 'polite')
        console.log('Task already in the same column')
        return
      }

      // Announce successful move
      announceToScreenReader(`Task ${taskId} moved from ${fromStatus} to ${toStatus}`, 'polite')

      // Call the onTaskMove callback
      if (onTaskMove) {
        console.log('Moving task:', { taskId, fromStatus, toStatus })
        onTaskMove(taskId, fromStatus, toStatus)
      }

      // Call the onDragEnd callback
      if (onDragEnd) {
        onDragEnd()
      }
    },
    [onTaskMove, onDragEnd]
  )

  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    document.body.style.cursor = ''
    announceToScreenReader('Task move cancelled', 'polite')
    console.log('Drag cancelled')

    // Call the onDragEnd callback
    if (onDragEnd) {
      onDragEnd()
    }
  }, [onDragEnd])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={`drag-drop-provider ${className}`}>
        {children}

        {/* Drag Overlay */}
        <DragOverlay 
          dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}>
          {activeId
            ? dragOverlay || (
                <div className="drag-overlay">
                  <div className="drag-overlay-content">
                    <span className="drag-overlay-icon">🔄</span>
                    <span className="drag-overlay-text">Moving task...</span>
                  </div>
                </div>
              )
            : null}
        </DragOverlay>
      </div>

      <style>{`
        .drag-drop-provider {
          position: relative;
          height: 100%;
          width: 100%;
        }
        
        .drag-overlay {
          background: transparent;
          border: none;
          border-radius: 8px;
          padding: 0;
          pointer-events: none;
          transform: rotate(2deg);
          opacity: 0.9;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }
        
        /* Remove default drag overlay styles */
        [data-dnd-drag-overlay] > * {
          cursor: grabbing !important;
        }
        
        
        /* Global drag state styles */
        :global(.dragging) {
          cursor: grabbing !important;
        }
        
        :global(.drag-over) {
          background-color: rgba(0, 123, 255, 0.05);
          border-color: #007bff;
        }
      `}</style>
    </DndContext>
  )
}

export default DragAndDropProvider
