import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, createMockTask } from '../../../../test-utils'
import { TaskDetails } from '../components/TaskDetails'

describe('TaskDetails', () => {
  const mockOnStatusChange = vi.fn()
  const mockOnComplete = vi.fn()
  const mockOnDuplicate = vi.fn()
  const mockOnExport = vi.fn()
  const mockOnArchive = vi.fn()

  const defaultTask = createMockTask({
    id: 1,
    title: 'Test Task',
    description: 'This is a test task description',
    priority: 'high',
    status: 'in-progress',
    assignedTo: 'John Doe',
    dueDate: '2024-12-31',
    estimatedHours: 8,
    tags: ['bug', 'urgent'],
    details: 'Additional task details',
    testStrategy: 'Test strategy description',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  })

  const availableTasks = [
    createMockTask({ id: 2, title: 'Dependency 1', status: 'done' }),
    createMockTask({ id: 3, title: 'Dependency 2', status: 'in-progress' }),
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Information Display', () => {
    it('displays task title and description', () => {
      render(<TaskDetails task={defaultTask} />)
      
      expect(screen.getByText('Test Task')).toBeInTheDocument()
      expect(screen.getByText('This is a test task description')).toBeInTheDocument()
    })

    it('displays priority with correct styling', () => {
      render(<TaskDetails task={defaultTask} />)
      
      expect(screen.getByText('High')).toBeInTheDocument()
      const priorityIndicator = screen.getByText('High').previousElementSibling
      expect(priorityIndicator).toHaveStyle({ backgroundColor: '#ef4444' })
    })

    it('displays status with correct styling', () => {
      render(<TaskDetails task={defaultTask} />)
      
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      const statusIndicator = screen.getByText('In Progress').previousElementSibling
      expect(statusIndicator).toHaveStyle({ backgroundColor: '#3b82f6' })
    })

    it('displays assigned to information', () => {
      render(<TaskDetails task={defaultTask} />)
      
      expect(screen.getByText('Assigned To')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('displays due date', () => {
      render(<TaskDetails task={defaultTask} />)
      
      expect(screen.getByText('Due Date')).toBeInTheDocument()
      expect(screen.getByText('12/31/2024')).toBeInTheDocument()
    })

    it('displays estimated hours', () => {
      render(<TaskDetails task={defaultTask} />)
      
      expect(screen.getByText('Estimated Hours')).toBeInTheDocument()
      expect(screen.getByText('8 hours')).toBeInTheDocument()
    })

    it('shows "Unassigned" when no assignee', () => {
      const unassignedTask = { ...defaultTask, assignedTo: undefined }
      render(<TaskDetails task={unassignedTask} />)
      
      expect(screen.getByText('Unassigned')).toBeInTheDocument()
    })

    it('shows "Not set" when no due date', () => {
      const noDueDateTask = { ...defaultTask, dueDate: undefined }
      render(<TaskDetails task={noDueDateTask} />)
      
      expect(screen.getByText('Not set')).toBeInTheDocument()
    })
  })

  describe('Additional Details Display', () => {
    it('displays details section when present', () => {
      render(<TaskDetails task={defaultTask} />)
      
      expect(screen.getByText('Details')).toBeInTheDocument()
      expect(screen.getByText('Additional task details')).toBeInTheDocument()
    })

    it('displays test strategy when present', () => {
      render(<TaskDetails task={defaultTask} />)
      
      expect(screen.getByText('Test Strategy')).toBeInTheDocument()
      expect(screen.getByText('Test strategy description')).toBeInTheDocument()
    })

    it('hides details section when not present', () => {
      const noDetailsTask = { ...defaultTask, details: undefined, testStrategy: undefined }
      render(<TaskDetails task={noDetailsTask} />)
      
      expect(screen.queryByText('Details')).not.toBeInTheDocument()
      expect(screen.queryByText('Test Strategy')).not.toBeInTheDocument()
    })
  })

  describe('Tags Display', () => {
    it('displays all tags', () => {
      render(<TaskDetails task={defaultTask} />)
      
      expect(screen.getByText('Tags')).toBeInTheDocument()
      expect(screen.getByText('bug')).toBeInTheDocument()
      expect(screen.getByText('urgent')).toBeInTheDocument()
    })

    it('hides tags section when no tags', () => {
      const noTagsTask = { ...defaultTask, tags: [] }
      render(<TaskDetails task={noTagsTask} />)
      
      expect(screen.queryByText('Tags')).not.toBeInTheDocument()
    })
  })

  describe('Dependencies Display', () => {
    it('displays dependencies with their details', () => {
      const taskWithDeps = { ...defaultTask, dependencies: [2, 3] }
      render(<TaskDetails task={taskWithDeps} availableTasks={availableTasks} />)
      
      expect(screen.getByText('Dependencies (2)')).toBeInTheDocument()
      expect(screen.getByText('Dependency 1')).toBeInTheDocument()
      expect(screen.getByText('Dependency 2')).toBeInTheDocument()
      expect(screen.getByText('#2')).toBeInTheDocument()
      expect(screen.getByText('#3')).toBeInTheDocument()
    })

    it('shows dependency status', () => {
      const taskWithDeps = { ...defaultTask, dependencies: [2, 3] }
      render(<TaskDetails task={taskWithDeps} availableTasks={availableTasks} />)
      
      expect(screen.getByText('Done')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
    })

    it('hides dependencies section when no dependencies', () => {
      const noDepsTask = { ...defaultTask, dependencies: [] }
      render(<TaskDetails task={noDepsTask} availableTasks={availableTasks} />)
      
      expect(screen.queryByText(/Dependencies/)).not.toBeInTheDocument()
    })
  })

  describe('Timestamps Display', () => {
    it('displays created and updated dates', () => {
      render(<TaskDetails task={defaultTask} />)
      
      expect(screen.getByText('Created:')).toBeInTheDocument()
      expect(screen.getByText('1/1/2024')).toBeInTheDocument()
      expect(screen.getByText('Updated:')).toBeInTheDocument()
      expect(screen.getByText('1/15/2024')).toBeInTheDocument()
    })
  })

  describe('Task Actions Integration', () => {
    it('renders TaskActionsBar when action handlers are provided', () => {
      render(
        <TaskDetails 
          task={defaultTask}
          onStatusChange={mockOnStatusChange}
          onComplete={mockOnComplete}
        />
      )
      
      expect(screen.getByLabelText('Mark task as complete')).toBeInTheDocument()
      expect(screen.getByLabelText('Task actions menu')).toBeInTheDocument()
    })

    it('does not render TaskActionsBar when no handlers provided', () => {
      render(<TaskDetails task={defaultTask} />)
      
      expect(screen.queryByLabelText('Mark task as complete')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Task actions menu')).not.toBeInTheDocument()
    })

    it('passes correct props to TaskActionsBar', async () => {
      const { user } = render(
        <TaskDetails 
          task={defaultTask}
          onStatusChange={mockOnStatusChange}
          onComplete={mockOnComplete}
          onDuplicate={mockOnDuplicate}
          onExport={mockOnExport}
          onArchive={mockOnArchive}
          canEdit={true}
          canDelete={true}
        />
      )
      
      const completeButton = screen.getByLabelText('Mark task as complete')
      await user.click(completeButton)
      
      expect(mockOnComplete).toHaveBeenCalledWith(1)
    })

    it('respects permission props', () => {
      render(
        <TaskDetails 
          task={defaultTask}
          onStatusChange={mockOnStatusChange}
          canEdit={false}
          canDelete={false}
        />
      )
      
      expect(screen.queryByLabelText('Archive this task')).not.toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('uses grid layout for certain sections', () => {
      render(<TaskDetails task={defaultTask} />)
      
      const gridSections = screen.getAllByText((content, element) => {
        return element?.className?.includes('grid') || false
      })
      
      expect(gridSections.length).toBeGreaterThan(0)
    })
  })
})