import type { Meta, StoryObj } from '@storybook/react';
import { CollaborativeTaskBoard } from '../../components/TaskBoard/CollaborativeTaskBoard';
import { WebSocketProvider } from '../../providers/WebSocketProvider';
import type { Task, User } from '../../types/websocket';

const meta: Meta<typeof CollaborativeTaskBoard> = {
  title: 'Components/CollaborativeTaskBoard',
  component: CollaborativeTaskBoard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A collaborative task board with real-time WebSocket integration. Features live updates, user presence indicators, and real-time task movements.',
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#020617' },
        { name: 'slate-900', value: '#0f172a' },
      ],
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <WebSocketProvider
        wsUrl="ws://localhost:8080"
        autoConnect={false}
        user={{
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          color: '#3B82F6',
        }}
      >
        <div className="dark min-h-screen bg-slate-950 p-6">
          <Story />
        </div>
      </WebSocketProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Implement user authentication',
    description: 'Add login and registration functionality with JWT tokens',
    status: 'in-progress',
    priority: 'high',
    assignee: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      color: '#3B82F6',
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    position: 0,
    column: 'in-progress',
    complexity: 8,
    tags: ['frontend', 'security'],
  },
  {
    id: 'task-2',
    title: 'Design database schema',
    description: 'Create tables for users, tasks, and projects',
    status: 'done',
    priority: 'medium',
    assignee: {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      color: '#10B981',
    },
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
    position: 0,
    column: 'done',
    complexity: 5,
    tags: ['backend', 'database'],
  },
  {
    id: 'task-3',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    status: 'pending',
    priority: 'medium',
    assignee: {
      id: 'user-3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      color: '#F59E0B',
    },
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z',
    position: 0,
    column: 'pending',
    complexity: 6,
    tags: ['devops', 'automation'],
  },
  {
    id: 'task-4',
    title: 'Fix responsive design issues',
    description: 'Ensure the application works well on mobile devices',
    status: 'blocked',
    priority: 'high',
    assignee: {
      id: 'user-4',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      color: '#EF4444',
    },
    createdAt: '2024-01-13T11:00:00Z',
    updatedAt: '2024-01-16T10:15:00Z',
    position: 0,
    column: 'blocked',
    complexity: 4,
    tags: ['frontend', 'ui'],
  },
  {
    id: 'task-5',
    title: 'Write API documentation',
    description: 'Document all REST endpoints with OpenAPI specification',
    status: 'pending',
    priority: 'low',
    assignee: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      color: '#3B82F6',
    },
    createdAt: '2024-01-17T09:30:00Z',
    updatedAt: '2024-01-17T09:30:00Z',
    position: 1,
    column: 'pending',
    complexity: 3,
    tags: ['documentation', 'api'],
  },
];

export const Default: Story = {
  args: {
    initialTasks: mockTasks,
    boardId: 'demo-board',
    showCollaboration: true,
    showUserCursors: true,
  },
};

export const WithoutCollaboration: Story = {
  args: {
    initialTasks: mockTasks,
    boardId: 'demo-board',
    showCollaboration: false,
    showUserCursors: false,
  },
};

export const EmptyBoard: Story = {
  args: {
    initialTasks: [],
    boardId: 'empty-board',
    showCollaboration: true,
    showUserCursors: true,
  },
};

export const LoadingState: Story = {
  args: {
    initialTasks: [],
    boardId: 'loading-board',
    isLoading: true,
    showCollaboration: true,
  },
};

export const ErrorState: Story = {
  args: {
    initialTasks: [],
    boardId: 'error-board',
    error: 'Failed to connect to WebSocket server',
    showCollaboration: true,
  },
};

export const HighActivityBoard: Story = {
  args: {
    initialTasks: [
      ...mockTasks,
      ...Array.from({ length: 15 }, (_, i) => ({
        id: `task-${i + 6}`,
        title: `Task ${i + 6}`,
        description: `Description for task ${i + 6}`,
        status: ['pending', 'in-progress', 'done', 'blocked'][i % 4] as Task['status'],
        priority: ['low', 'medium', 'high'][i % 3] as Task['priority'],
        assignee: {
          id: `user-${(i % 4) + 1}`,
          name: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'][i % 4],
          email: ['john@example.com', 'jane@example.com', 'mike@example.com', 'sarah@example.com'][i % 4],
          color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][i % 4],
        },
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        position: Math.floor(i / 4),
        column: ['pending', 'in-progress', 'done', 'blocked'][i % 4],
        complexity: Math.floor(Math.random() * 10) + 1,
        tags: [
          ['frontend', 'ui'],
          ['backend', 'api'],
          ['devops', 'testing'],
          ['documentation', 'review'],
        ][i % 4],
      })),
    ],
    boardId: 'high-activity-board',
    showCollaboration: true,
    showUserCursors: true,
  },
};

export const InteractiveDemo: Story = {
  args: {
    initialTasks: mockTasks,
    boardId: 'interactive-demo',
    showCollaboration: true,
    showUserCursors: true,
  },
  play: async ({ canvasElement, step }) => {
    // This would be used for interactive testing
    console.log('Interactive demo started');
  },
};