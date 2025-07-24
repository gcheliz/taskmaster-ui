import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../utils/cn'
import { motion } from 'framer-motion'

const buttonVariants = cva(
  // Base styles with enhanced dark theme support and micro-interactions
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-offset-surface-100 dark:focus-visible:ring-offset-surface-900 will-change-transform',
  {
    variants: {
      variant: {
        primary:
          'btn-primary hover:bg-primary-600 focus-visible:ring-primary-500 dark:hover:bg-primary-400 dark:focus-visible:ring-primary-400 hover:shadow-primary-500/25 dark:hover:shadow-primary-400/25',
        secondary:
          'btn-secondary hover:bg-secondary-100 focus-visible:ring-secondary-500 dark:hover:bg-secondary-700 dark:focus-visible:ring-secondary-400 hover:shadow-secondary-500/25 dark:hover:shadow-secondary-400/25',
        outline:
          'border border-secondary-300 bg-transparent hover:bg-secondary-50 focus-visible:ring-secondary-500 dark:border-secondary-600 dark:hover:bg-secondary-800 dark:focus-visible:ring-secondary-400 hover:shadow-secondary-500/25 dark:hover:shadow-secondary-400/25',
        ghost:
          'hover:bg-secondary-100 hover:text-secondary-900 focus-visible:ring-secondary-500 dark:hover:bg-secondary-800 dark:hover:text-secondary-100 dark:focus-visible:ring-secondary-400 hover:shadow-secondary-500/25 dark:hover:shadow-secondary-400/25',
        link: 'text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-500 dark:text-primary-400 dark:focus-visible:ring-primary-400 hover:text-primary-700 dark:hover:text-primary-300',
        destructive:
          'bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-500 dark:bg-error-700 dark:hover:bg-error-600 dark:focus-visible:ring-error-400 hover:shadow-error-500/25 dark:hover:shadow-error-400/25',
      },
      size: {
        sm: 'h-9 sm:h-8 rounded-md px-3 text-xs min-w-[3rem] sm:min-w-[2rem] touch-target',
        md: 'h-11 sm:h-10 px-4 py-2 min-w-[3.5rem] sm:min-w-[2.5rem] touch-target',
        lg: 'h-12 sm:h-11 rounded-md px-8 min-w-[4rem] sm:min-w-[3rem] touch-target',
        xl: 'h-14 sm:h-12 rounded-md px-10 text-base min-w-[4.5rem] sm:min-w-[3.5rem] touch-target',
        icon: 'h-11 w-11 sm:h-10 sm:w-10 min-w-[2.75rem] sm:min-w-[2.5rem] touch-target',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Shows loading spinner and disables the button
   * @default false
   */
  loading?: boolean
  /**
   * Icon to display on the left side of the button text
   */
  leftIcon?: React.ReactNode
  /**
   * Icon to display on the right side of the button text
   */
  rightIcon?: React.ReactNode
  /**
   * The visual style variant of the button
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'
  /**
   * The size of the button
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props },
    ref
  ) => {
    const isDisabled = disabled || loading
    const isIconOnly = size === 'icon' && !children

    // Ensure icon-only buttons have proper ARIA labels
    if (isIconOnly && !props['aria-label']) {
      console.warn('Icon-only button is missing aria-label attribute')
    }

    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        whileHover={!isDisabled ? { 
          scale: 1.02, 
          y: -1,
          transform: 'translateY(-1px) scale(1.02) translateZ(0)'
        } : undefined}
        whileTap={!isDisabled ? { 
          scale: 0.98,
          transform: 'scale(0.98) translateZ(0)'
        } : undefined}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17
        }}
        {...props}
      >
        {loading && (
          <>
            <span className="sr-only">Loading...</span>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
            </svg>
          </>
        )}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
