import type { Meta, StoryObj } from '@storybook/react';
import { KanbanColumn } from '../../components/ui/molecules/KanbanColumn';

const meta: Meta<typeof KanbanColumn> = {
  title: 'Molecules/KanbanColumn',
  component: KanbanColumn,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['pending', 'in-progress', 'done', 'blocked', 'cancelled', 'deferred'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error'],
    },
    limit: {
      control: { type: 'range', min: 1, max: 50, step: 1 },
    },
    showAddButton: {
      control: 'boolean',
    },
    onTaskClick: { action: 'task-clicked' },
    onAddTask: { action: 'add-task' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample tasks for stories
const sampleTasks = [
  {
    id: 1,
    title: 'Implement user authentication',
    description: 'Add login and registration functionality with JWT tokens',
    status: 'in-progress' as const,
    priority: 'high' as const,
    complexity: 7,
    estimatedHours: 12,
    assignedTo: 'John Doe',
    tags: ['authentication', 'security'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-18T14:45:00Z',
    dueDate: '2024-01-25T23:59:59Z',
    subtasks: [
      { id: 1, title: 'Design login form', status: 'done' as const },
      { id: 2, title: 'Implement JWT service', status: 'in-progress' as const },
      { id: 3, title: 'Add registration endpoint', status: 'pending' as const },
    ],
  },
  {
    id: 2,
    title: 'Fix responsive design issues',
    description: 'Ensure mobile compatibility across all pages',
    status: 'in-progress' as const,
    priority: 'medium' as const,
    complexity: 4,
    estimatedHours: 6,
    assignedTo: 'Jane Smith',
    tags: ['ui', 'responsive'],
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
    dueDate: '2024-01-22T23:59:59Z',
  },
  {
    id: 3,
    title: 'Database optimization',
    description: 'Improve query performance for large datasets',
    status: 'in-progress' as const,
    priority: 'urgent' as const,
    complexity: 8,
    estimatedHours: 16,
    assignedTo: 'Bob Johnson',
    tags: ['database', 'performance'],
    createdAt: '2024-01-17T14:30:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    dueDate: '2024-01-20T23:59:59Z',
  },
];

export const Default: Story = {
  args: {
    id: 'in-progress',
    title: 'In Progress',
    status: 'in-progress',
    tasks: sampleTasks,
    color: 'primary',
    limit: 5,
    showAddButton: true,
  },
};

export const EmptyColumn: Story = {
  args: {
    id: 'todo',
    title: 'To Do',
    status: 'pending',
    tasks: [],
    color: 'secondary',
    limit: 10,
    showAddButton: true,
  },
};

export const TodoColumn: Story = {
  args: {
    id: 'todo',
    title: 'To Do',
    status: 'pending',
    tasks: [
      {
        id: 4,
        title: 'Write unit tests',
        description: 'Add comprehensive test coverage for authentication module',
        status: 'pending' as const,
        priority: 'medium' as const,
        complexity: 5,
        estimatedHours: 8,
        assignedTo: 'Alice Brown',
        tags: ['testing', 'unit-tests'],
        createdAt: '2024-01-18T10:00:00Z',
        updatedAt: '2024-01-18T10:00:00Z',
        dueDate: '2024-01-30T23:59:59Z',
      },
      {
        id: 5,
        title: 'Code review',
        description: 'Review pull requests from team members',
        status: 'pending' as const,
        priority: 'low' as const,
        complexity: 2,
        estimatedHours: 3,
        assignedTo: 'John Doe',
        tags: ['review', 'code-quality'],
        createdAt: '2024-01-18T11:00:00Z',
        updatedAt: '2024-01-18T11:00:00Z',
        dueDate: '2024-01-24T23:59:59Z',
      },
    ],
    color: 'secondary',
    limit: 20,
    showAddButton: true,
  },
};

export const DoneColumn: Story = {
  args: {
    id: 'done',
    title: 'Done',
    status: 'done',
    tasks: [
      {
        id: 6,
        title: 'Setup CI/CD pipeline',
        description: 'Configure automated testing and deployment',
        status: 'done' as const,
        priority: 'high' as const,
        complexity: 6,
        estimatedHours: 10,
        assignedTo: 'Bob Johnson',
        tags: ['devops', 'ci-cd'],
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-01-15T17:30:00Z',
        dueDate: '2024-01-15T23:59:59Z',
        subtasks: [
          { id: 1, title: 'Setup GitHub Actions', status: 'done' as const },
          { id: 2, title: 'Configure testing pipeline', status: 'done' as const },
          { id: 3, title: 'Setup deployment pipeline', status: 'done' as const },
        ],
      },
      {
        id: 7,
        title: 'Update documentation',
        description: 'Refresh API documentation with latest changes',
        status: 'done' as const,
        priority: 'low' as const,
        complexity: 3,
        estimatedHours: 4,
        assignedTo: 'Alice Brown',
        tags: ['documentation', 'api'],
        createdAt: '2024-01-12T13:00:00Z',
        updatedAt: '2024-01-17T16:00:00Z',
        dueDate: '2024-01-18T23:59:59Z',
      },
    ],
    color: 'success',
    showAddButton: true,
  },
};

export const BlockedColumn: Story = {
  args: {
    id: 'blocked',
    title: 'Blocked',
    status: 'blocked',
    tasks: [
      {
        id: 8,
        title: 'Third-party API integration',
        description: 'Cannot proceed until API keys are provided by vendor',
        status: 'blocked' as const,
        priority: 'urgent' as const,
        complexity: 7,
        estimatedHours: 12,
        assignedTo: 'Jane Smith',
        tags: ['integration', 'api'],
        createdAt: '2024-01-14T09:00:00Z',
        updatedAt: '2024-01-18T14:00:00Z',
        dueDate: '2024-01-21T23:59:59Z',
      },
    ],
    color: 'error',
    limit: 5,
    showAddButton: false,
  },
};

export const OverLimitColumn: Story = {
  args: {
    id: 'review',
    title: 'Review',
    status: 'done',
    tasks: [
      ...Array.from({ length: 8 }, (_, i) => ({
        id: i + 10,
        title: `Task ${i + 1} awaiting review`,
        description: `Review task number ${i + 1}`,
        status: 'done' as const,
        priority: 'medium' as const,
        complexity: 3,
        estimatedHours: 2,
        assignedTo: `User ${i + 1}`,
        tags: ['review'],
        createdAt: '2024-01-18T10:00:00Z',
        updatedAt: '2024-01-18T10:00:00Z',
        dueDate: '2024-01-25T23:59:59Z',
      })),
    ],
    color: 'warning',
    limit: 5, // Less than the number of tasks to show over-limit state
    showAddButton: true,
  },
};

export const NoAddButton: Story = {
  args: {
    id: 'done',
    title: 'Done',
    status: 'done',
    tasks: sampleTasks,
    color: 'success',
    showAddButton: false,
  },
};

export const CustomColor: Story = {
  args: {
    id: 'testing',
    title: 'Testing',
    status: 'done',
    tasks: sampleTasks,
    color: 'warning',
    limit: 8,
    showAddButton: true,
  },
};

export const Interactive: Story = {
  args: {
    id: 'interactive',
    title: 'Interactive Column',
    status: 'in-progress',
    tasks: sampleTasks,
    color: 'primary',
    limit: 10,
    showAddButton: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Click on tasks or the add button to see interactions.',
      },
    },
  },
};