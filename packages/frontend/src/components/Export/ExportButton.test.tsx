import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExportButton } from './ExportButton'
import { vi } from 'vitest'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Download: () => <span>Download Icon</span>,
  FileDown: () => <span>FileDown Icon</span>,
  FileJson: () => <span>FileJson Icon</span>
}))

// Mock the export service
vi.mock('../../services/exportService', () => ({
  exportTasks: vi.fn().mockResolvedValue({ filename: 'export.csv', data: new Blob() })
}))

// Mock notification context
vi.mock('../../contexts/NotificationContext', () => ({
  useNotification: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn()
  })
}))

describe('ExportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders export button', () => {
    render(<ExportButton />)
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
  })

  it('shows format options on click', async () => {
    render(<ExportButton />)
    
    const button = screen.getByRole('button', { name: /export/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument()
      expect(screen.getByText('Export as JSON')).toBeInTheDocument()
    })
  })

  it('closes dropdown when clicking outside', async () => {
    render(<ExportButton />)
    
    const button = screen.getByRole('button', { name: /export/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument()
    })
    
    // Click outside - trigger mousedown instead of click
    fireEvent.mouseDown(document.body)
    
    await waitFor(() => {
      expect(screen.queryByText('Export as CSV')).not.toBeInTheDocument()
    })
  })
})