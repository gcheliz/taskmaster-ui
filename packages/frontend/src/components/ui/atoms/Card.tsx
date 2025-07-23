import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../utils/cn'

const cardVariants = cva(
  // Base styles with enhanced dark theme support and micro-interactions
  'relative rounded-lg border transition-all duration-200 ease-in-out transform-gpu hover:shadow-lg focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-surface-100 dark:focus-within:ring-offset-surface-900',
  {
    variants: {
      variant: {
        default:
          'bg-white border-secondary-200 hover:border-secondary-300 focus-within:ring-primary-500 dark:bg-surface-800 dark:border-surface-700 dark:hover:border-surface-600 dark:focus-within:ring-primary-400 hover:shadow-secondary-500/10 dark:hover:shadow-primary-400/10',
        elevated:
          'bg-white border-secondary-200 shadow-sm hover:shadow-md focus-within:ring-primary-500 dark:bg-surface-800 dark:border-surface-700 dark:shadow-surface-900/20 dark:hover:shadow-surface-900/40 dark:focus-within:ring-primary-400 hover:shadow-secondary-500/15 dark:hover:shadow-primary-400/15',
        outline:
          'bg-transparent border-secondary-300 hover:bg-secondary-50 focus-within:ring-secondary-500 dark:border-surface-600 dark:hover:bg-surface-800/50 dark:focus-within:ring-secondary-400 hover:shadow-secondary-500/10 dark:hover:shadow-secondary-400/10',
        ghost:
          'bg-transparent border-transparent hover:bg-secondary-50 focus-within:ring-secondary-500 dark:hover:bg-surface-800/50 dark:focus-within:ring-secondary-400 hover:shadow-secondary-500/10 dark:hover:shadow-secondary-400/10',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      interactive: {
        true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        false: '',
      },
      draggable: {
        true: 'cursor-grab active:cursor-grabbing',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
      draggable: false,
    },
  }
)

const cardHeaderVariants = cva('flex items-center justify-between space-x-2', {
  variants: {
    size: {
      sm: 'mb-3',
      md: 'mb-4',
      lg: 'mb-5',
      xl: 'mb-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const cardTitleVariants = cva(
  'font-semibold leading-none tracking-tight text-secondary-900 dark:text-secondary-100',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const cardDescriptionVariants = cva('text-secondary-600 dark:text-secondary-400', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const cardContentVariants = cva('text-secondary-700 dark:text-secondary-300', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const cardFooterVariants = cva('flex items-center justify-between space-x-2', {
  variants: {
    size: {
      sm: 'mt-3',
      md: 'mt-4',
      lg: 'mt-5',
      xl: 'mt-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Makes the card clickable with hover and focus states
   * @default false
   */
  interactive?: boolean
  /**
   * Enables drag-and-drop functionality
   * @default false
   */
  draggable?: boolean
  /**
   * Callback fired when the card is clicked (only when interactive is true)
   */
  onCardClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  /**
   * Callback fired when drag starts (only when draggable is true)
   */
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void
  /**
   * Callback fired when drag ends (only when draggable is true)
   */
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void
  /**
   * Data to pass when dragging (only when draggable is true)
   */
  dragData?: string
  /**
   * Accessible label for the card
   */
  'aria-label'?: string
}

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Pick<VariantProps<typeof cardHeaderVariants>, 'size'> {}

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    Pick<VariantProps<typeof cardTitleVariants>, 'size'> {}

export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    Pick<VariantProps<typeof cardDescriptionVariants>, 'size'> {}

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Pick<VariantProps<typeof cardContentVariants>, 'size'> {}

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Pick<VariantProps<typeof cardFooterVariants>, 'size'> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      size,
      interactive = false,
      draggable = false,
      onCardClick,
      onDragStart,
      onDragEnd,
      dragData,
      'aria-label': ariaLabel,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (interactive && onCardClick) {
        onCardClick(event)
      }
      if (onClick) {
        onClick(event)
      }
    }

    const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
      if (draggable && dragData) {
        event.dataTransfer.setData('text/plain', dragData)
        event.dataTransfer.effectAllowed = 'move'
      }
      if (onDragStart) {
        onDragStart(event)
      }
    }

    const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
      if (onDragEnd) {
        onDragEnd(event)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, interactive, draggable, className }))}
        onClick={interactive ? handleClick : onClick}
        onDragStart={draggable ? handleDragStart : undefined}
        onDragEnd={draggable ? handleDragEnd : undefined}
        draggable={draggable}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={ariaLabel}
        {...props}
      />
    )
  }
)

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size, ...props }, ref) => (
    <div ref={ref} className={cn(cardHeaderVariants({ size, className }))} {...props} />
  )
)

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size, ...props }, ref) => (
    <h3 ref={ref} className={cn(cardTitleVariants({ size, className }))} {...props} />
  )
)

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, size, ...props }, ref) => (
    <p ref={ref} className={cn(cardDescriptionVariants({ size, className }))} {...props} />
  )
)

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, size, ...props }, ref) => (
    <div ref={ref} className={cn(cardContentVariants({ size, className }))} {...props} />
  )
)

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, size, ...props }, ref) => (
    <div ref={ref} className={cn(cardFooterVariants({ size, className }))} {...props} />
  )
)

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardTitle.displayName = 'CardTitle'
CardDescription.displayName = 'CardDescription'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
  cardHeaderVariants,
  cardTitleVariants,
  cardDescriptionVariants,
  cardContentVariants,
  cardFooterVariants,
}
