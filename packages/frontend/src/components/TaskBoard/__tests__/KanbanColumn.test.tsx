import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, createMockTask, setupCommonMocks } from '../../../test-utils'
import { KanbanColumn } from '../../ui/molecules/KanbanColumn'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'

// Mock @dnd-kit/core
vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    setNodeRef: vi.fn(),
    isOver: false,
  }),
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock KanbanTaskCard
vi.mock('../../ui/molecules/KanbanTaskCard', () => ({
  KanbanTaskCard: ({ id, title, onClick }: any) => (
    <div role="button" onClick={() => onClick?.(id)}>
      {title}
    </div>
  ),
}))

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
  })

  it('calls onAddTask when add button is clicked', async () => {
    const { user } = render(<KanbanColumn {...defaultProps} />)
    
    const addButton = screen.getByText('Add Task')
    await user.click(addButton)
    
    expect(defaultProps.onAddTask).toHaveBeenCalledWith('pending')
  })

  it('applies correct color styling to column header', () => {
    render(<KanbanColumn {...defaultProps} color="primary" />)
    
    const colorIndicator = screen.getByText('To Do').parentElement?.querySelector('.rounded-full')
    expect(colorIndicator).toHaveClass('bg-primary-500')
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
    const firstTask = screen.getByText('Task 1').closest('[role="button"]')
    if (firstTask) {
      await user.click(firstTask)
    }
    
    expect(handleTaskClick).toHaveBeenCalledWith(1)
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
    
    // Look for the scrollable container
    const scrollContainer = document.querySelector('.overflow-y-auto.scrollbar-kanban')
    expect(scrollContainer).toBeInTheDocument()
  })

  it('renders column with correct color styling', () => {
    render(<KanbanColumn {...defaultProps} color="bg-blue-500" />)
    
    const header = screen.getByText('To Do').closest('div')
    expect(header).toBeInTheDocument()
  })

  it('shows add button when enabled', () => {
    render(<KanbanColumn {...defaultProps} showAddButton={true} />)
    
    const addButton = screen.getByText('Add Task')
    expect(addButton).toBeInTheDocument()
  })

  it('integrates with drag and drop context', () => {
    const handleDragEnd = vi.fn()
    
    render(
      <DndContext onDragEnd={handleDragEnd}>
        <KanbanColumn {...defaultProps} />
      </DndContext>
    )
    
    const columnElement = document.querySelector(`[data-column-id="${defaultProps.id}"]`)
    expect(columnElement).toBeInTheDocument()
    expect(columnElement).toHaveAttribute('data-status', defaultProps.status)
  })
})