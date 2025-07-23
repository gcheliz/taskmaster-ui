import React, { forwardRef, useEffect, useRef } from 'react'
import type { HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const modalVariants = cva(
  'relative bg-white rounded-xl shadow-modal',
  {
    variants: {
      size: {
        sm: 'w-full max-w-sm',
        md: 'w-full max-w-md',
        lg: 'w-full max-w-lg',
        xl: 'w-full max-w-xl',
        full: 'w-full max-w-full m-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface ModalProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants> {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    className, 
    size,
    isOpen,
    onClose,
    title,
    description,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    children,
    ...props 
  }, ref) => {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (closeOnEscape && event.key === 'Escape') {
          onClose()
        }
      }

      if (isOpen) {
        document.addEventListener('keydown', handleEscape)
        document.body.style.overflow = 'hidden'
      }

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    }, [isOpen, onClose, closeOnEscape])

    if (!isOpen) return null

    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && event.target === overlayRef.current) {
        onClose()
      }
    }

    return createPortal(
      <div
        ref={overlayRef}
        className="fixed inset-0 z-modal-backdrop bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleOverlayClick}
        aria-modal="true"
        role="dialog"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        <div
          ref={ref}
          className={cn(modalVariants({ size, className }))}
          {...props}
        >
          {(title || description) && (
            <div className="px-6 pt-6">
              {title && (
                <h2 id="modal-title" className="text-xl font-semibold text-secondary-900">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-2 text-sm text-secondary-600">
                  {description}
                </p>
              )}
            </div>
          )}
          <div className="p-6">
            {children}
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md p-1 text-secondary-400 hover:text-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Close modal"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>,
      document.body
    )
  }
)

Modal.displayName = 'Modal'

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {}

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end space-x-2 border-t border-secondary-200 px-6 py-4',
          className
        )}
        {...props}
      />
    )
  }
)

ModalFooter.displayName = 'ModalFooter'

export { Modal, ModalFooter, modalVariants }