import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Card, type CardProps } from './Card'
import { cn } from '../../../utils/cn'

export interface DraggableCardProps extends Omit<CardProps, 'draggable'> {
  /**
   * Unique identifier for the draggable card
   */
  id: string
  /**
   * Data to pass when dragging
   */
  data?: Record<string, any>
  /**
   * Disable drag functionality
   * @default false
   */
  disabled?: boolean
  /**
   * Custom handle element selector (optional)
   */
  handle?: string
}

const DraggableCard = React.forwardRef<HTMLDivElement, DraggableCardProps>(
  ({ id, data, disabled = false, handle, className, children, style, ...props }, ref) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id,
      data,
      disabled,
    })

    const dragStyle = {
      transform: CSS.Translate.toString(transform),
      ...style,
    }

    const dragAttributes = handle
      ? {} // If handle is specified, don't add listeners to the card itself
      : { ...listeners, ...attributes }

    return (
      <Card
        ref={(node) => {
          setNodeRef(node)
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        className={cn(
          'transition-all duration-200 ease-in-out',
          isDragging && [
            'opacity-50',
            'shadow-2xl',
            'scale-105',
            'z-50',
            'rotate-2',
            'ring-2',
            'ring-primary-500',
            'dark:ring-primary-400',
          ],
          !disabled && ['cursor-grab', 'hover:shadow-lg', 'active:cursor-grabbing'],
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        style={dragStyle}
        draggable={false} // Let @dnd-kit handle dragging
        {...dragAttributes}
        {...props}
      >
        {children}
      </Card>
    )
  }
)

DraggableCard.displayName = 'DraggableCard'

export { DraggableCard }
