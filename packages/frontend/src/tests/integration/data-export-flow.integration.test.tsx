import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotificationProvider } from '../../contexts/NotificationContext'
import { ExportButton } from '../../components/Export/ExportButton'

// Mock API responses
const mockExportTasks = vi.fn()
const mockInitiateAsyncExport = vi.fn()

vi.mock('../../services/exportService', () => ({
  exportTasks: (options: any) => mockExportTasks(options),
  initiateAsyncExport: (options: any) => mockInitiateAsyncExport(options),
}))

// Mock file download
const mockCreateObjectURL = vi.fn()
const mockRevokeObjectURL = vi.fn()
const mockCreateElement = document.createElement.bind(document)
const mockClick = vi.fn()

// Override createElement to capture download link clicks
document.createElement = vi.fn((tagName: string) => {
  const element = mockCreateElement(tagName)
  if (tagName === 'a') {
    element.click = mockClick
  }
  return element
})

Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  writable: true,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <NotificationProvider>
      {children}
    </NotificationProvider>
  </QueryClientProvider>
)

describe('Data Export Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateObjectURL.mockReturnValue('blob:mock-url')
    mockClick.mockClear()
  })

  it('should export tasks in JSON format', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <ExportButton />
      </TestWrapper>
    )

    // Click export button
    const exportButton = screen.getByLabelText('Export tasks')
    await user.click(exportButton)

    // Wait for dropdown to appear
    await waitFor(() => {
      expect(screen.getByText(/export as json/i)).toBeInTheDocument()
    })

    // Click JSON export option
    const jsonOption = screen.getByText(/export as json/i)
    await user.click(jsonOption)

    // Verify API was called with correct format
    await waitFor(() => {
      expect(mockExportTasks).toHaveBeenCalledWith({
        format: 'json',
        type: 'tasks',
      })
    })

    // Verify success notification
    await waitFor(() => {
      expect(screen.getByText(/tasks exported successfully as JSON/i)).toBeInTheDocument()
    })
  })

  it('should export tasks in CSV format', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <ExportButton />
      </TestWrapper>
    )

    // Click export button
    const exportButton = screen.getByLabelText('Export tasks')
    await user.click(exportButton)

    // Click CSV export option
    const csvOption = screen.getByText(/export as csv/i)
    await user.click(csvOption)

    // Verify API was called with correct format
    await waitFor(() => {
      expect(mockExportTasks).toHaveBeenCalledWith({
        format: 'csv',
        type: 'tasks',
      })
    })

    // Verify success notification
    await waitFor(() => {
      expect(screen.getByText(/tasks exported successfully as CSV/i)).toBeInTheDocument()
    })
  })

  it('should handle export with filters', async () => {
    const user = userEvent.setup()
    
    const filters = {
      status: ['completed'],
      priority: ['high'],
    }
    
    render(
      <TestWrapper>
        <ExportButton currentFilters={filters} projectId="project-1" />
      </TestWrapper>
    )

    // Click export button
    const exportButton = screen.getByLabelText('Export tasks')
    await user.click(exportButton)

    // Click JSON export option
    const jsonOption = screen.getByText(/export as json/i)
    await user.click(jsonOption)

    // Verify API was called with filters
    await waitFor(() => {
      expect(mockExportTasks).toHaveBeenCalledWith({
        format: 'json',
        type: 'tasks',
        projectId: 'project-1',
        status: ['completed'],
        priority: ['high'],
      })
    })
  })

  it('should show loading state during export', async () => {
    const user = userEvent.setup()
    
    // Mock delayed response
    mockExportTasks.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    render(
      <TestWrapper>
        <ExportButton />
      </TestWrapper>
    )

    // Click export button
    const exportButton = screen.getByLabelText('Export tasks')
    await user.click(exportButton)

    // Click JSON export option
    const jsonOption = screen.getByText(/export as json/i)
    await user.click(jsonOption)

    // Check for loading state
    expect(screen.getByText(/exporting/i)).toBeInTheDocument()

    // Wait for export to complete
    await waitFor(() => {
      expect(screen.queryByText(/exporting/i)).not.toBeInTheDocument()
    })
  })

  it('should handle export errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock API error
    mockExportTasks.mockRejectedValueOnce(new Error('Export failed due to server error'))

    render(
      <TestWrapper>
        <ExportButton />
      </TestWrapper>
    )

    // Click export button
    const exportButton = screen.getByLabelText('Export tasks')
    await user.click(exportButton)

    // Click JSON export option
    const jsonOption = screen.getByText(/export as json/i)
    await user.click(jsonOption)

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/export failed due to server error/i)).toBeInTheDocument()
    })
  })

  it('should show large export dialog for unfiltered exports', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <ExportButton />
      </TestWrapper>
    )

    // Click export button
    const exportButton = screen.getByLabelText('Export tasks')
    await user.click(exportButton)

    // Click JSON export option
    const jsonOption = screen.getByText(/export as json/i)
    await user.click(jsonOption)

    // Check for large export dialog
    await waitFor(() => {
      expect(screen.getByText(/large export detected/i)).toBeInTheDocument()
    })

    // Check dialog options
    expect(screen.getByText(/process in background/i)).toBeInTheDocument()
    expect(screen.getByText(/export now/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument()
  })

  it('should handle background export with email notification', async () => {
    const user = userEvent.setup()
    
    mockInitiateAsyncExport.mockResolvedValueOnce({
      exportId: 'export-123',
      estimatedTime: 30,
    })

    render(
      <TestWrapper>
        <ExportButton />
      </TestWrapper>
    )

    // Click export button
    const exportButton = screen.getByLabelText('Export tasks')
    await user.click(exportButton)

    // Click JSON export option
    const jsonOption = screen.getByText(/export as json/i)
    await user.click(jsonOption)

    // Wait for large export dialog
    await waitFor(() => {
      expect(screen.getByText(/large export detected/i)).toBeInTheDocument()
    })

    // Enter email
    const emailInput = screen.getByPlaceholderText(/your@email.com/i)
    await user.type(emailInput, 'test@example.com')

    // Click process in background
    const backgroundButton = screen.getByText(/process in background/i)
    await user.click(backgroundButton)

    // Verify async export was initiated
    await waitFor(() => {
      expect(mockInitiateAsyncExport).toHaveBeenCalledWith({
        type: 'tasks',
        format: 'json',
        filters: {},
        notifyEmail: 'test@example.com',
      })
    })

    // Verify info notification
    await waitFor(() => {
      expect(screen.getByText(/export started.*estimated time: 30 seconds/i)).toBeInTheDocument()
    })
  })

  it('should close dropdown when clicking outside', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <ExportButton />
      </TestWrapper>
    )

    // Click export button to open dropdown
    const exportButton = screen.getByLabelText('Export tasks')
    await user.click(exportButton)

    // Verify dropdown is open
    expect(screen.getByText(/export as json/i)).toBeInTheDocument()

    // Click outside
    await user.click(document.body)

    // Verify dropdown is closed
    await waitFor(() => {
      expect(screen.queryByText(/export as json/i)).not.toBeInTheDocument()
    })
  })

  it('should disable export button during export', async () => {
    const user = userEvent.setup()
    
    // Mock slow export
    mockExportTasks.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    render(
      <TestWrapper>
        <ExportButton />
      </TestWrapper>
    )

    // Click export button
    const exportButton = screen.getByLabelText('Export tasks')
    await user.click(exportButton)

    // Click JSON export option
    const jsonOption = screen.getByText(/export as json/i)
    await user.click(jsonOption)

    // Verify button is disabled during export
    expect(exportButton).toBeDisabled()

    // Wait for export to complete
    await waitFor(() => {
      expect(exportButton).not.toBeDisabled()
    })
  })
})