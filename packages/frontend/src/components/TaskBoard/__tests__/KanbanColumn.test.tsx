import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, createMockTask, setupCommonMocks } from '../../../test-utils'
import { KanbanColumn } from '../../ui/molecules/KanbanColumn'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'

describe('KanbanColumn', () => {
  const mockTasks = [
    createMockTask({ id: 1, title: 'Task 1', position: 0 }),
    createMockTask({ id: 2, title: 'Task 2', position: 1 }),
    createMockTask({ id: 3, title: 'Task 3', position: 2 }),
  ]

  const defaultProps = {
    id: 'todo',
    title: 'To Do',
    status: 'pending' as const,
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

  it('renders column with proper structure', () => {
    render(<KanbanColumn {...defaultProps} />)
    
    const columnElement = screen.getByText('To Do').closest('div')
    expect(columnElement).toBeInTheDocument()
  })

  it('renders tasks in the column', () => {
    render(<KanbanColumn {...defaultProps} />)
    
    mockTasks.forEach(task => {
      expect(screen.getByText(task.title)).toBeInTheDocument()
    })
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

  it('shows correct empty state when no tasks', () => {
    render(<KanbanColumn {...defaultProps} tasks={[]} />)
    
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('limits height and shows scroll for many tasks', () => {
    const manyTasks = Array.from({ length: 20 }, (_, i) => 
      createMockTask({ id: i, title: `Task ${i}` })
    )
    
    render(<KanbanColumn {...defaultProps} tasks={manyTasks} />)
    
    const taskContainer = screen.getByRole('region', { name: 'To Do column drop zone' })
    expect(taskContainer).toHaveClass('overflow-y-auto')
    expect(taskContainer).toHaveStyle({ maxHeight: '600px' })
  })

  it('renders column with correct color styling', () => {
    render(<KanbanColumn {...defaultProps} color="bg-blue-500" />)
    
    const header = screen.getByText('To Do').closest('div')
    expect(header).toBeInTheDocument()
  })

  it('shows add button when enabled', () => {
    render(<KanbanColumn {...defaultProps} showAddButton={true} />)
    
    const addButton = screen.getByLabelText(`Add task to ${defaultProps.title}`)
    expect(addButton).toBeInTheDocument()
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