import type { Meta, StoryObj } from '@storybook/react';
import { TaskBoardWithSearch } from '../../components/TaskBoard/TaskBoardWithSearch';
import type { TaskBoardData } from '../../types/task';

// Mock task data for demonstration
const mockTasks = [
  {
    id: 1,
    title: 'Implement user authentication',
    description: 'Create login and registration forms with proper validation',
    status: 'pending' as const,
    priority: 'high' as const,
    assignedTo: 'John Doe',
    tags: ['frontend', 'security'],
    complexity: 8,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    title: 'Setup database schema',
    description: 'Design and implement the database structure for the application',
    status: 'in-progress' as const,
    priority: 'high' as const,
    assignedTo: 'Jane Smith',
    tags: ['backend', 'database'],
    complexity: 6,
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
  },
  {
    id: 3,
    title: 'Create UI components',
    description: 'Build reusable React components for the design system',
    status: 'done' as const,
    priority: 'medium' as const,
    assignedTo: 'Mike Wilson',
    tags: ['frontend', 'components'],
    complexity: 5,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-12T16:00:00Z',
  },
  {
    id: 4,
    title: 'Write API documentation',
    description: 'Document all API endpoints with examples and response schemas',
    status: 'pending' as const,
    priority: 'low' as const,
    assignedTo: 'Sarah Johnson',
    tags: ['documentation', 'api'],
    complexity: 3,
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z',
  },
  {
    id: 5,
    title: 'Fix database performance issues',
    description: 'Optimize slow queries and improve database performance',
    status: 'blocked' as const,
    priority: 'urgent' as const,
    assignedTo: 'John Doe',
    tags: ['backend', 'performance'],
    complexity: 9,
    createdAt: '2024-01-13T15:00:00Z',
    updatedAt: '2024-01-17T09:00:00Z',
  },
  {
    id: 6,
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment workflows',
    status: 'in-progress' as const,
    priority: 'medium' as const,
    assignedTo: 'Mike Wilson',
    tags: ['devops', 'automation'],
    complexity: 7,
    createdAt: '2024-01-11T13:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
  {
    id: 7,
    title: 'Design mobile responsive layouts',
    description: 'Ensure the application works well on mobile devices',
    status: 'pending' as const,
    priority: 'medium' as const,
    assignedTo: 'Jane Smith',
    tags: ['frontend', 'mobile', 'design'],
    complexity: 4,
    createdAt: '2024-01-17T12:00:00Z',
    updatedAt: '2024-01-17T12:00:00Z',
  },
  {
    id: 8,
    title: 'Implement search functionality',
    description: 'Add search and filter capabilities to the task board',
    status: 'done' as const,
    priority: 'high' as const,
    assignedTo: 'Sarah Johnson',
    tags: ['frontend', 'search'],
    complexity: 6,
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-16T18:00:00Z',
  },
];

const mockTaskBoardData: TaskBoardData = {
  columns: [
    {
      id: 'pending',
      title: 'To Do',
      status: 'pending',
      tasks: mockTasks.filter(task => task.status === 'pending'),
      color: '#6b7280',
      limit: 10,
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      status: 'in-progress',
      tasks: mockTasks.filter(task => task.status === 'in-progress'),
      color: '#3b82f6',
      limit: 5,
    },
    {
      id: 'done',
      title: 'Done',
      status: 'done',
      tasks: mockTasks.filter(task => task.status === 'done'),
      color: '#10b981',
      limit: 20,
    },
    {
      id: 'blocked',
      title: 'Blocked',
      status: 'blocked',
      tasks: mockTasks.filter(task => task.status === 'blocked'),
      color: '#ef4444',
      limit: 5,
    },
  ],
  tasks: mockTasks,
  metadata: {
    projectName: 'TaskMaster Development',
    created: '2024-01-10T00:00:00Z',
    updated: '2024-01-17T12:00:00Z',
    description: 'Development tasks for TaskMaster project',
  },
};

const meta: Meta<typeof TaskBoardWithSearch> = {
  title: 'Components/TaskBoardWithSearch',
  component: TaskBoardWithSearch,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#020617' },
      ],
    },
  },
  args: {
    data: mockTaskBoardData,
    showSearchAndFilter: true,
  },
  argTypes: {
    showSearchAndFilter: {
      control: { type: 'boolean' },
      description: 'Whether to show search and filter controls',
    },
    compact: {
      control: { type: 'boolean' },
      description: 'Whether to use compact mode',
    },
    initialSearch: {
      control: { type: 'text' },
      description: 'Initial search query',
    },
    onSearchFilterChange: {
      action: 'searchFilterChange',
      description: 'Callback when search or filters change',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithInitialSearch: Story = {
  args: {
    initialSearch: 'authentication',
  },
};

export const WithInitialFilters: Story = {
  args: {
    initialFilters: {
      priority: ['high', 'urgent'],
      status: ['pending', 'in-progress'],
    },
  },
};

export const CompactMode: Story = {
  args: {
    compact: true,
  },
};

export const WithoutSearchAndFilter: Story = {
  args: {
    showSearchAndFilter: false,
  },
};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile2',
    },
  },
  args: {
    compact: true,
  },
};

export const LoadingState: Story = {
  args: {
    isLoading: true,
  },
};

export const ErrorState: Story = {
  args: {
    error: 'Failed to load tasks. Please try again.',
  },
};

export const EmptyBoard: Story = {
  args: {
    data: {
      ...mockTaskBoardData,
      tasks: [],
      columns: mockTaskBoardData.columns.map(col => ({
        ...col,
        tasks: [],
      })),
    },
  },
};

export const FilteredEmptyState: Story = {
  args: {
    initialSearch: 'nonexistent task',
  },
  play: async () => {
    // This story demonstrates what happens when filters result in no matches
  },
};

export const HighPriorityTasksOnly: Story = {
  args: {
    initialFilters: {
      priority: ['high', 'urgent'],
    },
  },
};

export const BackendTasksOnly: Story = {
  args: {
    initialFilters: {
      tags: ['backend'],
    },
  },
};

export const JohnDoeTasks: Story = {
  args: {
    initialFilters: {
      assignedTo: ['John Doe'],
    },
  },
};

export const InteractiveDemo: Story = {
  render: (args) => (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            TaskBoard with Search & Filter
          </h1>
          <p className="text-slate-400">
            Try searching for tasks or applying filters to see the board update in real-time
          </p>
        </div>
        <TaskBoardWithSearch {...args} />
      </div>
    </div>
  ),
  args: {},
};

export const DarkTheme: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: (args) => (
    <div className="min-h-screen bg-slate-950 p-6">
      <TaskBoardWithSearch {...args} />
    </div>
  ),
  args: {},
};