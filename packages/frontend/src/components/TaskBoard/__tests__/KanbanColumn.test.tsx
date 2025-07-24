import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, createMockTask, setupCommonMocks } from '../../../test-utils'
import { KanbanColumn } from '../../ui/molecules/KanbanColumn'
import { DndContext, DragEndEvent } from '@dnd-kit/core'

describe('KanbanColumn', () => {
  const mockTasks = [
    createMockTask({ id: '1', title: 'Task 1', position: 0 }),
    createMockTask({ id: '2', title: 'Task 2', position: 1 }),
    createMockTask({ id: '3', title: 'Task 3', position: 2 }),
  ]

  const defaultProps = {
    id: 'todo',
    title: 'To Do',
    tasks: mockTasks,
    color: 'bg-gray-500',
    onTaskClick: vi.fn(),
    onTaskEdit: vi.fn(),
    onAddTask: vi.fn(),
  }

  beforeEach(() => {
    setupCommonMocks()
    vi.clearAllMocks()
  })

  it('renders column with title and task count', () => {
    render(<KanbanColumn {...defaultProps} />)
    
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument() // Task count badge
  })

  it('renders all tasks in the column', () => {
    render(<KanbanColumn {...defaultProps} />)
    
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    expect(screen.getByText('Task 3')).toBeInTheDocument()
  })

  it('displays empty state when no tasks', () => {
    render(<KanbanColumn {...defaultProps} tasks={[]} />)
    
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    expect(screen.getByText('Drop tasks here or create a new one')).toBeInTheDocument()
  })

  it('calls onAddTask when add button is clicked', async () => {
    const { user } = render(<KanbanColumn {...defaultProps} />)
    
    const addButton = screen.getByLabelText(`Add task to ${defaultProps.title}`)
    await user.click(addButton)
    
    expect(defaultProps.onAddTask).toHaveBeenCalledWith('todo')
  })

  it('applies correct color styling to column header', () => {
    render(<KanbanColumn {...defaultProps} color="bg-blue-600" />)
    
    const colorIndicator = screen.getByText('To Do').parentElement?.querySelector('.rounded-full')
    expect(colorIndicator).toHaveClass('bg-blue-600')
  })

  it('highlights column when dragging over', () => {
    const { rerender } = render(<KanbanColumn {...defaultProps} />)
    
    // Simulate dragging over
    rerender(<KanbanColumn {...defaultProps} isOver={true} />)
    
    const dropZone = screen.getByRole('region', { name: 'To Do column drop zone' })
    expect(dropZone).toHaveClass('ring-2', 'ring-blue-400', 'bg-blue-50/50')
  })

  it('shows drop indicator when item can be dropped', () => {
    const { rerender } = render(<KanbanColumn {...defaultProps} />)
    
    // Simulate can drop state
    rerender(<KanbanColumn {...defaultProps} isOver={true} canDrop={true} />)
    
    const dropIndicator = screen.getByText('Drop here')
    expect(dropIndicator).toBeInTheDocument()
    expect(dropIndicator.parentElement).toHaveClass('bg-blue-100', 'border-blue-400')
  })

  it('passes task click handler to child tasks', async () => {
    const handleTaskClick = vi.fn()
    const { user } = render(
      <KanbanColumn {...defaultProps} onTaskClick={handleTaskClick} />
    )
    
    // Click on first task
    const firstTask = screen.getByText('Task 1').closest('[role="article"]')
    if (firstTask) {
      await user.click(firstTask)
    }
    
    expect(handleTaskClick).toHaveBeenCalledWith(mockTasks[0])
  })

  it('handles custom column actions through dropdown menu', async () => {
    const customActions = [
      { label: 'Clear Column', onClick: vi.fn() },
      { label: 'Archive Tasks', onClick: vi.fn() },
    ]
    
    const { user } = render(
      <KanbanColumn {...defaultProps} customActions={customActions} />
    )
    
    // Click menu button
    const menuButton = screen.getByLabelText('Column options')
    await user.click(menuButton)
    
    // Click first action
    const clearAction = screen.getByText('Clear Column')
    await user.click(clearAction)
    
    expect(customActions[0].onClick).toHaveBeenCalledWith('todo')
  })

  it('limits height and shows scroll for many tasks', () => {
    const manyTasks = Array.from({ length: 20 }, (_, i) => 
      createMockTask({ id: `task-${i}`, title: `Task ${i}` })
    )
    
    render(<KanbanColumn {...defaultProps} tasks={manyTasks} />)
    
    const taskContainer = screen.getByRole('region', { name: 'To Do column drop zone' })
    expect(taskContainer).toHaveClass('overflow-y-auto')
    expect(taskContainer).toHaveStyle({ maxHeight: '600px' })
  })

  it('displays task limit warning when specified', () => {
    const tasks = Array.from({ length: 10 }, (_, i) => 
      createMockTask({ id: `task-${i}` })
    )
    
    render(<KanbanColumn {...defaultProps} tasks={tasks} taskLimit={8} />)
    
    expect(screen.getByText('Task limit exceeded (10/8)')).toBeInTheDocument()
    const warning = screen.getByText('Task limit exceeded (10/8)')
    expect(warning).toHaveClass('text-amber-600')
  })

  it('prevents adding tasks when column is full', async () => {
    const tasks = Array.from({ length: 5 }, (_, i) => 
      createMockTask({ id: `task-${i}` })
    )
    
    const { user } = render(
      <KanbanColumn {...defaultProps} tasks={tasks} taskLimit={5} />
    )
    
    const addButton = screen.getByLabelText(`Add task to ${defaultProps.title}`)
    expect(addButton).toBeDisabled()
    
    // Hover for tooltip
    await user.hover(addButton)
    expect(screen.getByText('Column is at task limit')).toBeInTheDocument()
  })

  it('integrates with drag and drop context', () => {
    const handleDragEnd = vi.fn()
    
    render(
      <DndContext onDragEnd={handleDragEnd}>
        <KanbanColumn {...defaultProps} />
      </DndContext>
    )
    
    // Verify droppable elements are rendered
    const dropZone = screen.getByRole('region', { name: 'To Do column drop zone' })
    expect(dropZone).toHaveAttribute('data-droppable-id', 'todo')
  })
})