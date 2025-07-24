import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, createMockTask, mockHandlers } from '../../../test-utils'
import { TaskCard } from '../TaskCard'

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

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn()
    const { user } = render(<TaskCard task={defaultTask} onClick={handleClick} />)
    
    await user.click(screen.getByRole('article'))
    expect(handleClick).toHaveBeenCalledWith(defaultTask)
  })

  it('calls onEdit handler when edit button is clicked', async () => {
    const handleEdit = vi.fn()
    const { user } = render(<TaskCard task={defaultTask} onEdit={handleEdit} />)
    
    // Hover to show edit button
    const card = screen.getByRole('article')
    await user.hover(card)
    
    const editButton = screen.getByTitle('Edit task')
    await user.click(editButton)
    
    expect(handleEdit).toHaveBeenCalledWith(defaultTask, expect.any(Object))
  })

  it('prevents click handler when dragging', () => {
    const handleClick = vi.fn()
    render(<TaskCard task={defaultTask} onClick={handleClick} isDragging={true} />)
    
    fireEvent.click(screen.getByRole('article'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies dragging styles when isDragging is true', () => {
    render(<TaskCard task={defaultTask} isDragging={true} />)
    
    const card = screen.getByRole('article')
    expect(card).toHaveClass('shadow-lg', 'ring-2', 'ring-blue-500')
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
    const taskWithoutAssignee = createMockTask({ assignee: null })
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
    
    // Check that edit button becomes visible
    const editButton = screen.getByTitle('Edit task')
    expect(editButton.parentElement).toHaveClass('opacity-100')
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