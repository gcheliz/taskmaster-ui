import { render, screen, waitFor, act } from '@testing-library/react'
import { TaskBoardView } from '../TaskBoardView'
import { vi, beforeEach, afterEach } from 'vitest'

// Mock the hooks and components that TaskBoardView uses
vi.mock('../../hooks/useTaskData', () => ({
  useTaskData: () => ({
    taskBoardData: { tasks: [] },
    isLoading: false,
    error: null,
    refresh: vi.fn(),
    loadSampleTasks: vi.fn(),
  }),
}))

vi.mock('../ui/organisms/KanbanBoard', () => ({
  KanbanBoard: ({ loading }: { loading?: boolean }) => (
    <div data-testid="kanban-board">
      {loading ? 'Loading...' : 'Kanban Board'}
    </div>
  ),
}))

vi.mock('../TaskBoard/TaskBoardWithFilters', () => ({
  TaskBoardWithFilters: () => <div data-testid="task-board-with-filters">Task Board with Filters</div>,
}))

describe('TaskBoardView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('renders the Kanban board view', async () => {
    render(<TaskBoardView />)
    
    await waitFor(() => {
      // The component renders the actual KanbanBoard component which shows loading state
      expect(screen.getByText('Loading Kanban Board')).toBeInTheDocument()
    })
  })

  it('shows toggle button when filtering is enabled', async () => {
    render(<TaskBoardView enableFiltering={true} />)
    
    await waitFor(() => {
      expect(screen.getByText('📋 Board View')).toBeInTheDocument()
    })
  })

  it('shows filtered view when repository path is provided', async () => {
    render(<TaskBoardView enableFiltering={true} repositoryPath="/test/path" />)
    
    await waitFor(() => {
      const toggleButton = screen.getByText('📋 Board View')
      expect(toggleButton).toBeInTheDocument()
    })
    
    // When repositoryPath is provided and showFilters is true (default), it shows TaskBoardWithFilters
    // We can check for elements specific to the filtered view
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument()
  })

  it('has correct CSS class structure', () => {
    const { container } = render(<TaskBoardView />)

    // Check for main view container
    const viewElement = container.querySelector('.task-board-view')
    expect(viewElement).toBeInTheDocument()

    // Check for content section
    const contentElement = container.querySelector('.view-content')
    expect(contentElement).toBeInTheDocument()
  })

  it('accepts and applies custom className', () => {
    const { container } = render(<TaskBoardView className="custom-task-view" />)
    const viewElement = container.querySelector('.task-board-view')
    expect(viewElement).toHaveClass('task-board-view', 'custom-task-view')
  })

  it('shows loading state when data is loading', () => {
    vi.mocked(vi.importActual('../../hooks/useTaskData') as any).useTaskData = () => ({
      taskBoardData: null,
      isLoading: true,
      error: null,
      refresh: vi.fn(),
      loadSampleTasks: vi.fn(),
    })
    
    render(<TaskBoardView />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('hides toggle button when filtering is disabled', () => {
    render(<TaskBoardView enableFiltering={false} />)
    expect(screen.queryByText('📋 Board View')).not.toBeInTheDocument()
    expect(screen.queryByText('🔍 Filtered View')).not.toBeInTheDocument()
  })
})
