import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, createMockTask, mockHandlers } from '../../../test-utils'
import { TaskCard } from '../TaskCard'

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

// Mock @dnd-kit/utilities
vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
    Translate: {
      toString: () => '',
    },
  },
}))

describe('TaskCard', () => {
  const defaultTask = createMockTask()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders task information correctly', () => {
    render(<TaskCard task={defaultTask} />)
    
    expect(screen.getByText(defaultTask.title)).toBeInTheDocument()
    expect(screen.getByText(defaultTask.description)).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument() // Priority badge
    expect(screen.getByText('JD')).toBeInTheDocument() // Assignee initials
  })

  it('displays high priority with correct styling', () => {
    const highPriorityTask = createMockTask({ priority: 'high' })
    render(<TaskCard task={highPriorityTask} />)
    
    const priorityBadge = screen.getByText('High')
    expect(priorityBadge).toHaveClass('bg-red-100', 'text-red-700')
  })

  it('displays low priority with correct styling', () => {
    const lowPriorityTask = createMockTask({ priority: 'low' })
    render(<TaskCard task={lowPriorityTask} />)
    
    const priorityBadge = screen.getByText('Low')
    expect(priorityBadge).toHaveClass('bg-gray-100', 'text-gray-700')
  })

  it('calls onTaskClick handler when clicked', async () => {
    const handleClick = vi.fn()
    const { user } = render(<TaskCard task={defaultTask} onTaskClick={handleClick} />)
    
    await user.click(screen.getByRole('article'))
    expect(handleClick).toHaveBeenCalledWith(defaultTask.id)
  })

  it('renders with compact view when specified', () => {
    render(<TaskCard task={defaultTask} compact={true} />)
    
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    // In compact view, some details might not be shown
    const card = screen.getByRole('article')
    expect(card).toHaveClass('p-3') // Compact padding
  })

  it('allows click when draggable is disabled', async () => {
    const handleClick = vi.fn()
    const { user } = render(<TaskCard task={defaultTask} onTaskClick={handleClick} isDraggable={false} />)
    
    await user.click(screen.getByRole('article'))
    expect(handleClick).toHaveBeenCalledWith(defaultTask.id)
  })

  it('renders with draggable state when enabled', () => {
    render(<TaskCard task={defaultTask} isDraggable={true} />)
    
    const card = screen.getByRole('article')
    expect(card).toBeInTheDocument()
  })

  it('displays complexity dots correctly', () => {
    const complexTask = createMockTask({ complexity: 5 })
    render(<TaskCard task={complexTask} />)
    
    const complexityContainer = screen.getByText('Complexity:').parentElement
    const dots = complexityContainer?.querySelectorAll('.w-2.h-2.rounded-full')
    expect(dots).toHaveLength(5)
    
    // Check that all dots are filled (blue)
    dots?.forEach(dot => {
      expect(dot).toHaveClass('bg-blue-600')
    })
  })

  it('displays partial complexity correctly', () => {
    const complexTask = createMockTask({ complexity: 3 })
    render(<TaskCard task={complexTask} />)
    
    const complexityContainer = screen.getByText('Complexity:').parentElement
    const dots = complexityContainer?.querySelectorAll('.w-2.h-2.rounded-full')
    expect(dots).toHaveLength(5)
    
    // First 3 should be filled, last 2 should be empty
    dots?.forEach((dot, index) => {
      if (index < 3) {
        expect(dot).toHaveClass('bg-blue-600')
      } else {
        expect(dot).toHaveClass('bg-gray-300')
      }
    })
  })

  it('handles tasks without assignee', () => {
    const taskWithoutAssignee = createMockTask({ assignedTo: null })
    render(<TaskCard task={taskWithoutAssignee} />)
    
    expect(screen.queryByText('JD')).not.toBeInTheDocument()
  })

  it('displays custom data attributes for drag and drop', () => {
    const attributes = {
      'data-testid': 'drag-handle',
      'aria-describedby': 'drag-instructions',
    }
    
    render(<TaskCard task={defaultTask} attributes={attributes} />)
    
    const card = screen.getByRole('article')
    expect(card).toHaveAttribute('data-testid', 'drag-handle')
    expect(card).toHaveAttribute('aria-describedby', 'drag-instructions')
  })

  it('applies hover effects on mouse enter', async () => {
    const { user } = render(<TaskCard task={defaultTask} />)
    
    const card = screen.getByRole('article')
    await user.hover(card)
    
    // Check that edit button has hover classes (group-hover:opacity-100)
    const editButton = screen.getByTitle('Edit task')
    expect(editButton).toHaveClass('group-hover:opacity-100')
  })

  it('truncates long titles appropriately', () => {
    const longTitleTask = createMockTask({
      title: 'This is a very long task title that should be truncated in the UI to prevent layout issues'
    })
    render(<TaskCard task={longTitleTask} />)
    
    const title = screen.getByText(longTitleTask.title)
    expect(title).toHaveClass('line-clamp-2')
  })

  it('truncates long descriptions appropriately', () => {
    const longDescTask = createMockTask({
      description: 'This is a very long description that goes on and on and should be truncated after a certain number of lines to maintain a consistent card height'
    })
    render(<TaskCard task={longDescTask} />)
    
    const description = screen.getByText(longDescTask.description)
    expect(description).toHaveClass('line-clamp-3')
  })
})