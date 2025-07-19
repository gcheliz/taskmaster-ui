import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../../utils/cn';

export interface DroppableAreaProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Unique identifier for the droppable area
   */
  id: string;
  /**
   * Data to pass when something is dropped
   */
  data?: Record<string, any>;
  /**
   * Disable drop functionality
   * @default false
   */
  disabled?: boolean;
  /**
   * Content to display when area is empty
   */
  placeholder?: React.ReactNode;
  /**
   * Custom styling for different drop states
   */
  variant?: 'default' | 'highlighted' | 'minimal';
  /**
   * Size of the droppable area
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const DroppableArea = React.forwardRef<HTMLDivElement, DroppableAreaProps>(
  (
    {
      id,
      data,
      disabled = false,
      placeholder,
      variant = 'default',
      size = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isOver, setNodeRef } = useDroppable({
      id,
      data,
      disabled,
    });

    const baseStyles = cn(
      'rounded-lg border-2 border-dashed transition-all duration-200 ease-in-out',
      {
        // Variant styles
        'border-secondary-300 bg-secondary-50/50 dark:border-surface-600 dark:bg-surface-800/50':
          variant === 'default',
        'border-primary-300 bg-primary-50/50 dark:border-primary-600 dark:bg-primary-900/20':
          variant === 'highlighted',
        'border-transparent bg-transparent dark:bg-transparent':
          variant === 'minimal',
        // Size styles
        'min-h-[80px] p-4': size === 'sm',
        'min-h-[120px] p-6': size === 'md',
        'min-h-[160px] p-8': size === 'lg',
        'min-h-[200px] p-10': size === 'xl',
        // Hover/drop states
        'border-primary-400 bg-primary-100/50 dark:border-primary-500 dark:bg-primary-900/30':
          isOver && variant === 'default',
        'border-primary-500 bg-primary-200/50 dark:border-primary-400 dark:bg-primary-800/40':
          isOver && variant === 'highlighted',
        'border-primary-400 bg-primary-50/30 dark:border-primary-500 dark:bg-primary-900/20':
          isOver && variant === 'minimal',
        // Disabled state
        'opacity-50 cursor-not-allowed': disabled,
      },
      className
    );

    const hasContent = children || placeholder;

    return (
      <div
        ref={node => {
          setNodeRef(node);
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={baseStyles}
        {...props}
      >
        {hasContent ? (
          children || (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                {typeof placeholder === 'string' ? (
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    {placeholder}
                  </p>
                ) : (
                  placeholder
                )}
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="mb-2">
                <svg
                  className="mx-auto h-8 w-8 text-secondary-400 dark:text-secondary-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </div>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                Drop items here
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

DroppableArea.displayName = 'DroppableArea';

export { DroppableArea };
