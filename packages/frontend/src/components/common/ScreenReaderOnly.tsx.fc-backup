import React from 'react'
import { cn } from '../../utils/cn'

export interface ScreenReaderOnlyProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The content to be read by screen readers
   */
  children: React.ReactNode
  /**
   * Whether to show the content visually when focused
   * @default false
   */
  focusable?: boolean
}

/**
 * ScreenReaderOnly Component
 * 
 * Renders content that is only visible to screen readers.
 * Optionally can become visible when focused for keyboard navigation.
 */
export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({
  children,
  focusable = false,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        focusable ? 'sr-only focus:not-sr-only' : 'sr-only',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default ScreenReaderOnly