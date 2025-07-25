import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../utils/cn'
import { Button } from '../atoms/Button'
import { Icon, XMarkIcon } from '../atoms/Icon'
import { FocusTrap } from '../../../utils/keyboard'

const modalOverlayVariants = cva(
  'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
)

const modalContentVariants = cva(
  'fixed left-1/2 top-1/2 z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-secondary-200 bg-white shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg p-4 sm:p-6 m-4 sm:m-0',
  {
    variants: {
      size: {
        sm: 'max-w-sm sm:max-w-md max-h-[90vh] sm:max-h-[95vh]',
        md: 'max-w-md sm:max-w-lg max-h-[90vh] sm:max-h-[95vh]',
        lg: 'max-w-lg sm:max-w-2xl max-h-[90vh] sm:max-h-[95vh]',
        xl: 'max-w-xl sm:max-w-4xl max-h-[90vh] sm:max-h-[95vh]',
        full: 'max-w-[calc(100vw-2rem)] sm:max-w-[95vw] max-h-[90vh] sm:max-h-[95vh]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const modalHeaderVariants = cva('flex flex-col space-y-1.5 text-center sm:text-left')

const modalTitleVariants = cva('text-lg font-semibold leading-none tracking-tight text-gray-900')

const modalDescriptionVariants = cva('text-sm text-secondary-600')

const modalBodyVariants = cva('flex-1 overflow-y-auto scrollbar-modal')

const modalFooterVariants = cva(
  'flex flex-col space-y-2 sm:flex-row-reverse sm:space-y-0 sm:space-x-2 sm:space-x-reverse sm:justify-start pt-4 border-t border-secondary-100'
)

export interface ModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean
  /**
   * Callback when the modal open state changes
   */
  onOpenChange: (open: boolean) => void
  /**
   * Modal content
   */
  children: React.ReactNode
}

export interface ModalContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalContentVariants> {
  /**
   * Callback when Escape key is pressed
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  /**
   * Callback when clicking outside the modal
   */
  onPointerDownOutside?: (event: PointerEvent) => void
  /**
   * Size of the modal
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export interface ModalHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalHeaderVariants> {}

export interface ModalTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof modalTitleVariants> {}

export interface ModalDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof modalDescriptionVariants> {}

export interface ModalBodyProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalBodyVariants> {}

export interface ModalFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalFooterVariants> {}

// Context for managing modal state
const ModalContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
} | null>(null)

const useModalContext = () => {
  const context = React.useContext(ModalContext)
  if (!context) {
    throw new Error('Modal components must be used within a Modal')
  }
  return context
}

const Modal: React.FC<ModalProps> = ({ open, onOpenChange, children }) => {
  return <ModalContext.Provider value={{ open, onOpenChange }}>{children}</ModalContext.Provider>
}

export interface ModalTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon'
}

const ModalTrigger = React.forwardRef<HTMLButtonElement, ModalTriggerProps>(
  ({ children, onClick, variant, size, ...props }, ref) => {
    const { onOpenChange } = useModalContext()

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        onClick={(event) => {
          onOpenChange(true)
          onClick?.(event)
        }}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
ModalTrigger.displayName = 'ModalTrigger'

const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, size, onEscapeKeyDown, onPointerDownOutside, children, ...props }, ref) => {
    const { open, onOpenChange } = useModalContext()
    const contentRef = useRef<HTMLDivElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)
    const focusTrapRef = useRef<FocusTrap | null>(null)

    // Focus management with FocusTrap utility
    useEffect(() => {
      if (!open || !contentRef.current) return

      // Initialize focus trap
      focusTrapRef.current = new FocusTrap(contentRef.current)
      focusTrapRef.current.activate()

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          onEscapeKeyDown?.(event)
          onOpenChange(false)
        }
      }

      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        focusTrapRef.current?.deactivate()
        focusTrapRef.current = null
      }
    }, [open, onEscapeKeyDown, onOpenChange])

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }

      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [open])

    if (!open) return null

    const handleOverlayClick = (event: React.MouseEvent) => {
      if (event.target === overlayRef.current) {
        const pointerEvent = new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
        })
        onPointerDownOutside?.(pointerEvent)
        onOpenChange(false)
      }
    }

    const modalElement = (
      <div
        ref={overlayRef}
        className={modalOverlayVariants()}
        data-state={open ? 'open' : 'closed'}
        onClick={handleOverlayClick}
      >
        <div
          ref={ref || contentRef}
          role="dialog"
          aria-modal="true"
          data-state={open ? 'open' : 'closed'}
          className={cn(modalContentVariants({ size, className }))}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
        </div>
      </div>
    )

    return createPortal(modalElement, document.body)
  }
)
ModalContent.displayName = 'ModalContent'

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(modalHeaderVariants({ className }))} {...props} />
  )
)
ModalHeader.displayName = 'ModalHeader'

const ModalTitle = React.forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn(modalTitleVariants({ className }))} {...props} />
  )
)
ModalTitle.displayName = 'ModalTitle'

const ModalDescription = React.forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn(modalDescriptionVariants({ className }))} {...props} />
  )
)
ModalDescription.displayName = 'ModalDescription'

const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(modalBodyVariants({ className }))} {...props} />
  )
)
ModalBody.displayName = 'ModalBody'

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(modalFooterVariants({ className }))} {...props} />
  )
)
ModalFooter.displayName = 'ModalFooter'

const ModalClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const { onOpenChange } = useModalContext()

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      className="absolute right-2 top-2 sm:right-4 sm:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground touch-target"
      onClick={(event) => {
        onOpenChange(false)
        onClick?.(event)
      }}
      {...props}
    >
      {children || <Icon icon={XMarkIcon} size="sm" />}
      <span className="sr-only">Close</span>
    </Button>
  )
})
ModalClose.displayName = 'ModalClose'

// Create compound component
const ModalComponent = Object.assign(Modal, {
  Trigger: ModalTrigger,
  Content: ModalContent,
  Header: ModalHeader,
  Title: ModalTitle,
  Description: ModalDescription,
  Body: ModalBody,
  Footer: ModalFooter,
  Close: ModalClose,
})

export {
  ModalComponent as Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
  modalOverlayVariants,
  modalContentVariants,
  modalHeaderVariants,
  modalTitleVariants,
  modalDescriptionVariants,
  modalBodyVariants,
  modalFooterVariants,
}
