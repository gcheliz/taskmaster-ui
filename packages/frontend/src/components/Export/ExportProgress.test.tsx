import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { ExportProgress } from './ExportProgress'
import { vi } from 'vitest'
import * as exportService from '../../services/exportService'

// Mock the export service
vi.mock('../../services/exportService')

describe('ExportProgress', () => {
  const mockCheckExportProgress = vi.mocked(exportService.checkExportProgress)
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows processing state initially', async () => {
    mockCheckExportProgress.mockResolvedValue({
      status: 'processing',
      progress: 0.5,
    })

    render(
      <ExportProgress 
        exportId="test-123"
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Processing export/)).toBeInTheDocument()
      expect(screen.getByText(/50%/)).toBeInTheDocument()
    })
  })

  it('shows completed state with download button', async () => {
    mockCheckExportProgress.mockResolvedValue({
      status: 'completed',
      progress: 1,
      downloadUrl: 'http://example.com/export.csv'
    })

    const onComplete = vi.fn()
    render(
      <ExportProgress 
        exportId="test-123"
        onClose={vi.fn()}
        onComplete={onComplete}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Export completed!')).toBeInTheDocument()
      expect(screen.getByText('Download File')).toBeInTheDocument()
    })

    expect(onComplete).toHaveBeenCalledWith('http://example.com/export.csv')
  })

  it('shows failed state with error message', async () => {
    mockCheckExportProgress.mockResolvedValue({
      status: 'failed',
      progress: 0.3,
      error: 'Out of memory'
    })

    render(
      <ExportProgress 
        exportId="test-123"
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Export failed')).toBeInTheDocument()
      expect(screen.getByText('Out of memory')).toBeInTheDocument()
    })
  })

  it('polls for progress updates', async () => {
    mockCheckExportProgress
      .mockResolvedValueOnce({
        status: 'processing',
        progress: 0.3,
      })
      .mockResolvedValueOnce({
        status: 'processing',
        progress: 0.6,
      })
      .mockResolvedValueOnce({
        status: 'completed',
        progress: 1,
        downloadUrl: 'http://example.com/export.csv'
      })

    render(
      <ExportProgress 
        exportId="test-123"
        onClose={vi.fn()}
      />
    )

    // First check
    await waitFor(() => {
      expect(screen.getByText(/30%/)).toBeInTheDocument()
    })

    // Wait for polling interval and second check
    await waitFor(() => {
      expect(screen.getByText(/60%/)).toBeInTheDocument()
    }, { timeout: 3000 })

    // Final check
    await waitFor(() => {
      expect(screen.getByText('Export completed!')).toBeInTheDocument()
    }, { timeout: 3000 })

    expect(mockCheckExportProgress).toHaveBeenCalledTimes(4) // Initial + 3 updates
  })

  it('allows closing the progress tracker', async () => {
    mockCheckExportProgress.mockResolvedValue({
      status: 'processing',
      progress: 0.5,
    })

    const onClose = vi.fn()
    render(
      <ExportProgress 
        exportId="test-123"
        onClose={onClose}
      />
    )

    const closeButton = await screen.findByRole('button', { name: /close export progress/i })
    closeButton.click()

    expect(onClose).toHaveBeenCalled()
  })
})