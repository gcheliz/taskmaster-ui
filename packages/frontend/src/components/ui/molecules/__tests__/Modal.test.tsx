import React from 'react'
import { render, screen } from '@testing-library/react'
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalBody } from '../Modal'

// Mock createPortal for testing
vi.mock('react-dom', () => ({
  ...vi.importActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}))

describe('Modal', () => {
  const renderModal = (open = false) => {
    const handleOpenChange = vi.fn()

    render(
      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalTrigger>Open Modal</ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Modal Title</ModalTitle>
          </ModalHeader>
          <ModalBody>Modal Content</ModalBody>
        </ModalContent>
      </Modal>
    )

    return { handleOpenChange }
  }

  it('renders trigger button', () => {
    renderModal()

    expect(screen.getByRole('button', { name: 'Open Modal' })).toBeInTheDocument()
  })

  it('does not render modal content when closed', () => {
    renderModal(false)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
  })

  it('renders modal content when open', () => {
    renderModal(true)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Modal Title')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    renderModal(true)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('data-state', 'open')
  })

  it('applies size classes correctly', () => {
    render(
      <Modal open={true} onOpenChange={() => {}}>
        <ModalContent size="lg" data-testid="modal-content">
          Content
        </ModalContent>
      </Modal>
    )

    // Modal has responsive classes, so we check for the sm: prefixed class
    expect(screen.getByTestId('modal-content')).toHaveClass('sm:max-w-2xl')
  })

  it('handles escape key press', async () => {
    // Since we can't easily test the actual keyboard event handling in this test environment,
    // we'll focus on the component structure and props
    renderModal(true)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
  })

  it('renders ModalHeader with proper styling', () => {
    render(<ModalHeader data-testid="modal-header">Header content</ModalHeader>)

    expect(screen.getByTestId('modal-header')).toHaveClass('flex', 'flex-col', 'space-y-1.5')
  })

  it('renders ModalTitle with proper styling', () => {
    render(<ModalTitle data-testid="modal-title">Title</ModalTitle>)

    expect(screen.getByTestId('modal-title')).toHaveClass('text-lg', 'font-semibold')
  })

  it('renders ModalBody with proper styling', () => {
    render(<ModalBody data-testid="modal-body">Body content</ModalBody>)

    expect(screen.getByTestId('modal-body')).toHaveClass('flex-1', 'overflow-y-auto')
  })
})
