import React, { useState, useRef, useEffect, cloneElement } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/cn'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  placement?: 'top' | 'right' | 'bottom' | 'left'
  delay?: number
  className?: string
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 200,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const targetRef = useRef<HTMLElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const calculatePosition = () => {
    if (!targetRef.current || !tooltipRef.current) return

    const targetRect = targetRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const spacing = 8

    let top = 0
    let left = 0

    switch (placement) {
      case 'top':
        top = targetRect.top - tooltipRect.height - spacing
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2
        break
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2
        left = targetRect.right + spacing
        break
      case 'bottom':
        top = targetRect.bottom + spacing
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2
        break
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2
        left = targetRect.left - tooltipRect.width - spacing
        break
    }

    // Ensure tooltip stays within viewport
    const padding = 8
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding))
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding))

    setPosition({ top, left })
  }

  useEffect(() => {
    if (isVisible) {
      calculatePosition()
      window.addEventListener('resize', calculatePosition)
      window.addEventListener('scroll', calculatePosition)

      return () => {
        window.removeEventListener('resize', calculatePosition)
        window.removeEventListener('scroll', calculatePosition)
      }
    }
  }, [isVisible])

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const clonedChild = cloneElement(children, {
    ref: targetRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    'aria-describedby': isVisible ? 'tooltip' : undefined,
  } as any)

  return (
    <>
      {clonedChild}
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            id="tooltip"
            role="tooltip"
            className={cn(
              'fixed z-tooltip px-3 py-2 text-xs font-medium text-white bg-secondary-900 rounded-md shadow-md',
              'animate-fade-in pointer-events-none',
              className
            )}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            {content}
            <div
              className={cn(
                'absolute w-2 h-2 bg-secondary-900 rotate-45',
                placement === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
                placement === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2',
                placement === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
                placement === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2'
              )}
            />
          </div>,
          document.body
        )}
    </>
  )
}
