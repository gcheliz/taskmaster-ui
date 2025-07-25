import React, { useRef, useEffect } from 'react'
import { TaskCard } from './TaskCard'
import type { TaskCardProps } from './TaskCard'
import { useFocusRestore } from '../../hooks/useFocusManagement'
import type { Task } from '../../types/task'

export interface FocusableTaskCardProps extends Omit<TaskCardProps, 'onTaskClick'> {
  /** Whether this card is currently being dragged */
  isDragging?: boolean
  /** Whether this card should restore focus after drag */
  shouldRestoreFocus?: boolean
  /** Callback when task is selected */
  onSelect?: (task: Task) => void
}

/**
 * Enhanced TaskCard with focus management for drag and drop
 */
export const FocusableTaskCard = ({
  isDragging,
  shouldRestoreFocus = true,
  onSelect,
  task,
  ...props
}: FocusableTaskCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const { saveFocus, restoreFocus } = useFocusRestore()

  // Save focus when dragging starts
  useEffect(() => {
    if (isDragging) {
      saveFocus()
    }
  }, [isDragging, saveFocus])

  // Restore focus when dragging ends
  useEffect(() => {
    if (!isDragging && shouldRestoreFocus) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        restoreFocus()
      }, 100)
    }
  }, [isDragging, shouldRestoreFocus, restoreFocus])

  const handleSelect = () => {
    // Focus the card when selected
    if (cardRef.current) {
      cardRef.current.focus()
    }
    onSelect?.(task)
  }

  return (
    <div
      ref={cardRef}
      tabIndex={0}
      role="button"
      aria-pressed={false}
      aria-label={`Task: ${task.title}. Status: ${task.status}. Priority: ${task.priority}.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleSelect()
        }
      }}
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg"
    >
      <TaskCard
        task={task}
        onTaskClick={() => handleSelect()}
        {...props}
      />
    </div>
  )
}

/**
 * Hook to manage focus in drag and drop operations
 */
export const useDragDropFocus = () => {
  const draggedElementRef = useRef<HTMLElement | null>(null)
  const { saveFocus, restoreFocus } = useFocusRestore()

  const onDragStart = (element: HTMLElement) => {
    draggedElementRef.current = element
    saveFocus()
    
    // Announce drag start to screen readers
    const announcement = `Started dragging ${element.getAttribute('aria-label') || 'item'}`
    const liveRegion = document.querySelector('[aria-live="assertive"]')
    if (liveRegion) {
      liveRegion.textContent = announcement
    }
  }

  const onDragEnd = (success: boolean, targetDescription?: string) => {
    if (draggedElementRef.current) {
      // Announce drag result
      const itemLabel = draggedElementRef.current.getAttribute('aria-label') || 'item'
      const announcement = success
        ? `${itemLabel} moved to ${targetDescription || 'new position'}`
        : `${itemLabel} drag cancelled`
      
      const liveRegion = document.querySelector('[aria-live="assertive"]')
      if (liveRegion) {
        liveRegion.textContent = announcement
      }
      
      // Restore focus
      setTimeout(() => {
        restoreFocus()
      }, 100)
      
      draggedElementRef.current = null
    }
  }

  return {
    onDragStart,
    onDragEnd,
  }
}