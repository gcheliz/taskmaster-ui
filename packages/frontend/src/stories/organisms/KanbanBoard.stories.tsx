import type { Meta, StoryObj } from '@storybook/react-vite';
import { KanbanBoard } from '../../components/ui/organisms/KanbanBoard';

const meta: Meta<typeof KanbanBoard> = {
  title: 'Organisms/KanbanBoard',
  component: KanbanBoard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: 'boolean',
    },
    showSearch: {
      control: 'boolean',
    },
    showFilters: {
      control: 'boolean',
    },
    onTaskClick: { action: 'task-clicked' },
    onAddTask: { action: 'add-task' },
    onRefresh: { action: 'refresh' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample tasks for stories
const sampleTasks = [
  {
    id: 1,
    title: 'Implement user authentication',
    description: 'Add login and registration functionality with JWT tokens and proper session management',
    status: 'in-progress' as const,
    priority: 'high' as const,
    complexity: 7,
    estimatedHours: 12,
    assignedTo: 'John Doe',
    tags: ['authentication', 'security', 'backend'],
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
    description: 'Ensure mobile compatibility across all pages and components',
    status: 'in-progress' as const,
    priority: 'medium' as const,
    complexity: 4,
    estimatedHours: 6,
    assignedTo: 'Jane Smith',
    tags: ['ui', 'responsive', 'frontend'],
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
    dueDate: '2024-01-22T23:59:59Z',
  },
  {
    id: 3,
    title: 'Database optimization',
    description: 'Improve query performance for large datasets and add proper indexing',
    status: 'pending' as const,
    priority: 'urgent' as const,
    complexity: 8,
    estimatedHours: 16,
    assignedTo: 'Bob Johnson',
    tags: ['database', 'performance', 'backend'],
    createdAt: '2024-01-17T14:30:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    dueDate: '2024-01-20T23:59:59Z',
  },
  {
    id: 4,
    title: 'Write unit tests',
    description: 'Add comprehensive test coverage for authentication module',
    status: 'pending' as const,
    priority: 'medium' as const,
    complexity: 5,
    estimatedHours: 8,
    assignedTo: 'Alice Brown',
    tags: ['testing', 'unit-tests', 'quality'],
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
    dueDate: '2024-01-30T23:59:59Z',
  },
  {
    id: 5,
    title: 'Code review',
    description: 'Review pull requests from team members and ensure code quality',
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
  {
    id: 6,
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment with proper monitoring',
    status: 'done' as const,
    priority: 'high' as const,
    complexity: 6,
    estimatedHours: 10,
    assignedTo: 'Bob Johnson',
    tags: ['devops', 'ci-cd', 'infrastructure'],
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
    description: 'Refresh API documentation with latest changes and examples',
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
  {
    id: 8,
    title: 'Third-party API integration',
    description: 'Cannot proceed until API keys are provided by vendor',
    status: 'blocked' as const,
    priority: 'urgent' as const,
    complexity: 7,
    estimatedHours: 12,
    assignedTo: 'Jane Smith',
    tags: ['integration', 'api', 'external'],
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-18T14:00:00Z',
    dueDate: '2024-01-21T23:59:59Z',
  },
  {
    id: 9,
    title: 'Performance monitoring setup',
    description: 'Implement application performance monitoring and alerting',
    status: 'deferred' as const,
    priority: 'medium' as const,
    complexity: 6,
    estimatedHours: 8,
    assignedTo: 'Bob Johnson',
    tags: ['monitoring', 'performance', 'infrastructure'],
    createdAt: '2024-01-16T15:00:00Z',
    updatedAt: '2024-01-18T12:00:00Z',
    dueDate: '2024-02-01T23:59:59Z',
  },
];

export const Default: Story = {
  args: {
    tasks: sampleTasks,
    loading: false,
    showSearch: true,
    showFilters: true,
  },
};

export const Loading: Story = {
  args: {
    tasks: [],
    loading: true,
    showSearch: true,
    showFilters: true,
  },
};

export const Error: Story = {
  args: {
    tasks: [],
    loading: false,
    error: 'Failed to load tasks. Please check your connection and try again.',
    showSearch: true,
    showFilters: true,
  },
};

export const EmptyState: Story = {
  args: {
    tasks: [],
    loading: false,
    showSearch: true,
    showFilters: true,
  },
};

export const NoSearchOrFilters: Story = {
  args: {
    tasks: sampleTasks,
    loading: false,
    showSearch: false,
    showFilters: false,
  },
};

export const SearchOnly: Story = {
  args: {
    tasks: sampleTasks,
    loading: false,
    showSearch: true,
    showFilters: false,
  },
};

export const FiltersOnly: Story = {
  args: {
    tasks: sampleTasks,
    loading: false,
    showSearch: false,
    showFilters: true,
  },
};

export const ManyTasks: Story = {
  args: {
    tasks: [
      ...sampleTasks,
      ...Array.from({ length: 15 }, (_, i) => ({
        id: i + 100,
        title: `Generated Task ${i + 1}`,
        description: `This is a generated task for testing purposes - Task ${i + 1}`,
        status: (['pending', 'in-progress', 'done', 'blocked', 'deferred'][i % 5]) as 'pending' | 'in-progress' | 'done' | 'blocked' | 'deferred',
        priority: (['low', 'medium', 'high', 'urgent'][i % 4]) as 'low' | 'medium' | 'high' | 'urgent',
        complexity: (i % 10) + 1,
        estimatedHours: (i % 20) + 1,
        assignedTo: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown'][i % 4],
        tags: ['tag1', 'tag2', 'tag3'].slice(0, (i % 3) + 1),
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
        updatedAt: new Date(Date.now() - (i * 12 * 60 * 60 * 1000)).toISOString(),
        dueDate: new Date(Date.now() + ((i + 1) * 24 * 60 * 60 * 1000)).toISOString(),
      })),
    ],
    loading: false,
    showSearch: true,
    showFilters: true,
  },
};

export const OnlyPendingTasks: Story = {
  args: {
    tasks: sampleTasks.filter(task => task.status === 'pending'),
    loading: false,
    showSearch: true,
    showFilters: true,
  },
};

export const OnlyCompletedTasks: Story = {
  args: {
    tasks: sampleTasks.filter(task => task.status === 'done'),
    loading: false,
    showSearch: true,
    showFilters: true,
  },
};

export const HighPriorityOnly: Story = {
  args: {
    tasks: sampleTasks.filter(task => task.priority === 'high' || task.priority === 'urgent'),
    loading: false,
    showSearch: true,
    showFilters: true,
  },
};

export const WithRefreshAction: Story = {
  args: {
    tasks: sampleTasks,
    loading: false,
    showSearch: true,
    showFilters: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Includes refresh functionality - click the refresh button to see the action.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    tasks: sampleTasks,
    loading: false,
    showSearch: true,
    showFilters: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive Kanban board. Try searching, filtering, clicking tasks, and adding new tasks.',
      },
    },
  },
};

export const Mobile: Story = {
  args: {
    tasks: sampleTasks,
    loading: false,
    showSearch: true,
    showFilters: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Kanban board optimized for mobile devices with horizontal scrolling.',
      },
    },
  },
};

export const Tablet: Story = {
  args: {
    tasks: sampleTasks,
    loading: false,
    showSearch: true,
    showFilters: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Kanban board on tablet-sized screens.',
      },
    },
  },
};