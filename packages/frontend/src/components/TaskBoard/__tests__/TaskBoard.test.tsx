import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, createMockTask, setupCommonMocks } from '../../../test-utils'
import TaskBoard from '../../../pages/TaskBoard'

// Mock the TaskModal component
vi.mock('../TaskModal', () => ({
  TaskModal: vi.fn(({ isOpen, onClose, children }) => 
    isOpen ? <div data-testid="task-modal">{children}</div> : null
  ),
}))

describe('TaskBoard', () => {
  beforeEach(() => {
    setupCommonMocks()
    vi.clearAllMocks()
  })

  it('renders the task board with all columns', async () => {
    render(<TaskBoard />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument()
    })
    
    // Check all columns are rendered
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
    expect(screen.getByText('Testing')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('displays loading skeleton initially', () => {
    render(<TaskBoard />)
    
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument()
    // Check for skeleton columns
    const skeletons = screen.getAllByTestId(/skeleton/i)
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows filter dropdown and allows filtering', async () => {
    const { user } = render(<TaskBoard />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument()
    })
    
    // Click filter button
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)
    
    // Check filter menu is open
    expect(screen.getByText('Filter by Priority')).toBeInTheDocument()
    expect(screen.getByText('Filter by Assignee')).toBeInTheDocument()
    expect(screen.getByText('Filter by Column')).toBeInTheDocument()
  })

  it('filters tasks by priority', async () => {
    const { user } = render(<TaskBoard />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument()
    })
    
    // Open filter menu
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)
    
    // Click high priority filter
    const highPriorityCheckbox = screen.getByLabelText('High')
    await user.click(highPriorityCheckbox)
    
    // Verify filter is applied (button should show active state)
    expect(filterButton).toHaveClass('bg-blue-100', 'text-blue-700')
  })

  it('shows sort dropdown and allows sorting', async () => {
    const { user } = render(<TaskBoard />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument()
    })
    
    // Click sort button
    const sortButton = screen.getByRole('button', { name: /sort/i })
    await user.click(sortButton)
    
    // Check sort options
    expect(screen.getByText('Priority (High to Low)')).toBeInTheDocument()
    expect(screen.getByText('Priority (Low to High)')).toBeInTheDocument()
    expect(screen.getByText('Newest First')).toBeInTheDocument()
    expect(screen.getByText('Oldest First')).toBeInTheDocument()
  })

  it('opens task modal when clicking add task button', async () => {
    const { user } = render(<TaskBoard />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument()
    })
    
    // Click add task button
    const addButton = screen.getByRole('button', { name: /add task/i })
    await user.click(addButton)
    
    // Check modal is open
    expect(screen.getByTestId('task-modal')).toBeInTheDocument()
  })

  it('displays board statistics', async () => {
    render(<TaskBoard />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument()
    })
    
    // Check for stats in the board
    expect(screen.getByText(/active tasks/i)).toBeInTheDocument()
    expect(screen.getByText(/completed today/i)).toBeInTheDocument()
  })

  it('allows toggling between board and list view', async () => {
    const { user } = render(<TaskBoard />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument()
    })
    
    // Find view toggle button
    const viewToggle = screen.getByRole('button', { name: /view/i })
    await user.click(viewToggle)
    
    // Should show view options
    expect(screen.getByText('Board View')).toBeInTheDocument()
    expect(screen.getByText('List View')).toBeInTheDocument()
  })

  it('resets all filters when clear filters is clicked', async () => {
    const { user } = render(<TaskBoard />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument()
    })
    
    // Apply some filters first
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)
    
    const highPriorityCheckbox = screen.getByLabelText('High')
    await user.click(highPriorityCheckbox)
    
    // Click outside to close menu
    await user.click(document.body)
    
    // Clear filters
    const clearButton = screen.getByRole('button', { name: /clear filters/i })
    await user.click(clearButton)
    
    // Filter button should return to default state
    expect(filterButton).not.toHaveClass('bg-blue-100')
  })

  it('shows search functionality', async () => {
    const { user } = render(<TaskBoard />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument()
    })
    
    // Find search input
    const searchInput = screen.getByPlaceholderText(/search tasks/i)
    expect(searchInput).toBeInTheDocument()
    
    // Type in search
    await user.type(searchInput, 'bug fix')
    expect(searchInput).toHaveValue('bug fix')
  })

  it('displays quick commands section', async () => {
    render(<TaskBoard />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument()
    })
    
    // Check for quick commands
    expect(screen.getByText('Quick Commands')).toBeInTheDocument()
    
    // Common task commands should be visible
    expect(screen.getByRole('button', { name: /task-master next/i })).toBeInTheDocument()
  })

  it('handles keyboard navigation', async () => {
    const { user } = render(<TaskBoard />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument()
    })
    
    // Tab through interactive elements
    await user.tab()
    expect(document.activeElement?.tagName).toBe('BUTTON')
    
    // Press arrow keys for navigation
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowUp}')
  })

  it('shows connection status indicator', async () => {
    render(<TaskBoard />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument()
    })
    
    // Look for connection status in header or board
    const connectionIndicator = screen.getByLabelText(/connection status/i)
    expect(connectionIndicator).toBeInTheDocument()
  })
})