import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TaskBoard } from '../TaskBoard';
import type { TaskBoardData } from '../../../types/task';
import { vi } from 'vitest';

// Mock task data for testing
const mockTaskBoardData: TaskBoardData = {
  columns: [
    {
      id: 'pending',
      title: 'To Do',
      status: 'pending',
      color: '#6b7280',
      tasks: [
        {
          id: 1,
          title: 'Test Task 1',
          description: 'This is a test task',
          status: 'pending',
          priority: 'high',
          complexity: 5,
          estimatedHours: 8,
          tags: ['frontend', 'testing'],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ]
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      status: 'in-progress',
      color: '#3b82f6',
      tasks: [
        {
          id: 2,
          title: 'Test Task 2',
          description: 'Another test task',
          status: 'in-progress',
          priority: 'medium',
          complexity: 3,
          estimatedHours: 4,
          assignedTo: 'john.doe@example.com',
          tags: ['backend'],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ]
    },
    {
      id: 'done',
      title: 'Done',
      status: 'done',
      color: '#10b981',
      tasks: [
        {
          id: 3,
          title: 'Test Task 3',
          description: 'Completed test task',
          status: 'done',
          priority: 'low',
          complexity: 2,
          estimatedHours: 2,
          tags: ['documentation'],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ]
    },
    {
      id: 'blocked',
      title: 'Blocked',
      status: 'blocked',
      color: '#ef4444',
      tasks: []
    },
    {
      id: 'deferred',
      title: 'Deferred',
      status: 'deferred',
      color: '#f59e0b',
      tasks: []
    }
  ],
  tasks: [
    {
      id: 1,
      title: 'Test Task 1',
      description: 'This is a test task',
      status: 'pending',
      priority: 'high',
      complexity: 5,
      estimatedHours: 8,
      tags: ['frontend', 'testing'],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 2,
      title: 'Test Task 2',
      description: 'Another test task',
      status: 'in-progress',
      priority: 'medium',
      complexity: 3,
      estimatedHours: 4,
      assignedTo: 'john.doe@example.com',
      tags: ['backend'],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 3,
      title: 'Test Task 3',
      description: 'Completed test task',
      status: 'done',
      priority: 'low',
      complexity: 2,
      estimatedHours: 2,
      tags: ['documentation'],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    }
  ],
  metadata: {
    created: '2025-01-01T00:00:00Z',
    updated: '2025-01-01T00:00:00Z',
    description: 'Test task board data',
    projectName: 'Test Project'
  }
};

describe('TaskBoard Integration', () => {
  test('renders task board with sample data', async () => {
    const mockOnTaskClick = vi.fn();
    const mockOnTaskMove = vi.fn();
    const mockOnCreateTask = vi.fn();

    render(
      <TaskBoard
        data={mockTaskBoardData}
        isLoading={false}
        error={null}
        onTaskClick={mockOnTaskClick}
        onTaskMove={mockOnTaskMove}
        onCreateTask={mockOnCreateTask}
        showCreateButton={true}
      />
    );

    // Verify task board renders
    expect(screen.getByText('Task Board')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();

    // Verify statistics are displayed
    expect(screen.getByText('3')).toBeInTheDocument(); // total tasks
    expect(screen.getByText('1')).toBeInTheDocument(); // in progress
    expect(screen.getByText('1')).toBeInTheDocument(); // completed
    expect(screen.getByText('33%')).toBeInTheDocument(); // completion rate

    // Verify columns are rendered
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
    expect(screen.getByText('Deferred')).toBeInTheDocument();

    // Verify tasks are rendered in correct columns
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    expect(screen.getByText('Test Task 3')).toBeInTheDocument();

    // Verify task details are displayed
    expect(screen.getByText('This is a test task')).toBeInTheDocument();
    expect(screen.getByText('Another test task')).toBeInTheDocument();
    expect(screen.getByText('Completed test task')).toBeInTheDocument();

    // Verify task metadata is displayed
    expect(screen.getByText('8h')).toBeInTheDocument(); // estimated hours
    expect(screen.getByText('5/10')).toBeInTheDocument(); // complexity
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument(); // assignee

    // Verify task tags are displayed
    expect(screen.getByText('frontend')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument();
    expect(screen.getByText('backend')).toBeInTheDocument();
    expect(screen.getByText('documentation')).toBeInTheDocument();
  });

  test('renders loading state', () => {
    render(
      <TaskBoard
        data={undefined}
        isLoading={true}
        error={null}
      />
    );

    expect(screen.getByText('Task Board')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getAllByText(/skeleton/i)).toHaveLength(0); // No skeleton text should be visible
  });

  test('renders error state', () => {
    const errorMessage = 'Failed to load tasks';
    
    render(
      <TaskBoard
        data={undefined}
        isLoading={false}
        error={errorMessage}
      />
    );

    expect(screen.getByText('Task Board')).toBeInTheDocument();
    expect(screen.getByText('Failed to Load Task Board')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  test('renders empty state', () => {
    render(
      <TaskBoard
        data={undefined}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText('Task Board')).toBeInTheDocument();
    expect(screen.getByText('No Task Data Available')).toBeInTheDocument();
    expect(screen.getByText('Connect a repository with task-master project to view tasks.')).toBeInTheDocument();
  });

  test('handles task click events', async () => {
    const mockOnTaskClick = vi.fn();

    render(
      <TaskBoard
        data={mockTaskBoardData}
        isLoading={false}
        error={null}
        onTaskClick={mockOnTaskClick}
      />
    );

    // Click on a task
    const taskCard = screen.getByText('Test Task 1').closest('.task-card');
    expect(taskCard).toBeInTheDocument();
    
    if (taskCard) {
      taskCard.click();
      await waitFor(() => {
        expect(mockOnTaskClick).toHaveBeenCalledWith(1);
      });
    }
  });

  test('handles create task events', async () => {
    const mockOnCreateTask = vi.fn();

    render(
      <TaskBoard
        data={mockTaskBoardData}
        isLoading={false}
        error={null}
        onCreateTask={mockOnCreateTask}
        showCreateButton={true}
      />
    );

    // Click on main create button
    const createButton = screen.getByText('New Task');
    createButton.click();
    
    await waitFor(() => {
      expect(mockOnCreateTask).toHaveBeenCalledWith('pending');
    });
  });

  test('displays task counts correctly', () => {
    render(
      <TaskBoard
        data={mockTaskBoardData}
        isLoading={false}
        error={null}
      />
    );

    // Check column counts
    const pendingColumn = screen.getByText('To Do').closest('.task-column');
    const inProgressColumn = screen.getByText('In Progress').closest('.task-column');
    const doneColumn = screen.getByText('Done').closest('.task-column');
    const blockedColumn = screen.getByText('Blocked').closest('.task-column');
    const deferredColumn = screen.getByText('Deferred').closest('.task-column');

    expect(pendingColumn).toBeInTheDocument();
    expect(inProgressColumn).toBeInTheDocument();
    expect(doneColumn).toBeInTheDocument();
    expect(blockedColumn).toBeInTheDocument();
    expect(deferredColumn).toBeInTheDocument();

    // Verify tasks are in correct columns
    expect(pendingColumn).toHaveTextContent('Test Task 1');
    expect(inProgressColumn).toHaveTextContent('Test Task 2');
    expect(doneColumn).toHaveTextContent('Test Task 3');
  });
});