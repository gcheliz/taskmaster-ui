import type { Meta, StoryObj } from '@storybook/react';
import { ActivityTimeline } from '../../components/ui/organisms/ActivityTimeline';
import type { ActivityItem } from '../../components/ui/organisms/ActivityTimeline';

const meta: Meta<typeof ActivityTimeline> = {
  title: 'Organisms/ActivityTimeline',
  component: ActivityTimeline,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive activity timeline organism that assembles multiple molecules and atoms to display project activity feeds. Combines avatar atoms, text molecules, and filtering components to create a complete activity tracking interface. Built with atomic design principles for consistent user experience across activity displays.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    showFilters: { control: 'boolean' },
    showAvatar: { control: 'boolean' },
    showTimestamp: { control: 'boolean' },
    groupByDate: { control: 'boolean' },
    maxItems: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleActivities: ActivityItem[] = [
  {
    id: 'activity-1',
    type: 'commit',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    message: 'Fix: Resolved authentication token expiration bug',
    author: 'John Doe',
    details: {
      sha: 'a1b2c3d4',
      branch: 'hotfix/auth-token',
      files: 3,
      additions: 18,
      deletions: 7,
    },
  },
  {
    id: 'activity-2',
    type: 'task_update',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    message: 'Task completed: Implement user profile settings page',
    author: 'Jane Smith',
    details: {
      taskId: 'TASK-123',
      status: 'completed',
      priority: 'high',
      assignee: 'Jane Smith',
    },
  },
  {
    id: 'activity-3',
    type: 'project_update',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    message: 'Project milestone reached: Frontend refactoring complete',
    author: 'Mike Johnson',
    details: {
      milestone: 'Q1 2024',
      completion: '85%',
      nextPhase: 'Testing & QA',
    },
  },
  {
    id: 'activity-4',
    type: 'commit',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    message: 'Added new authentication middleware and updated user permissions',
    author: 'Sarah Wilson',
    details: {
      sha: 'e5f6g7h8',
      branch: 'feature/auth-update',
      files: 5,
      additions: 42,
      deletions: 13,
    },
  },
  {
    id: 'activity-5',
    type: 'task_update',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    message: 'Task started: Design system component library',
    author: 'Alex Chen',
    details: {
      taskId: 'TASK-456',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Alex Chen',
    },
  },
  {
    id: 'activity-6',
    type: 'project_update',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    message: 'Sprint planning completed for upcoming release',
    author: 'Emily Davis',
    details: {
      sprint: 'Sprint 23',
      tasks: 15,
      storyPoints: 89,
      duration: '2 weeks',
    },
  },
];

export const Default: Story = {
  args: {
    activities: sampleActivities,
  },
};

export const Loading: Story = {
  args: {
    activities: [],
    loading: true,
  },
};

export const Error: Story = {
  args: {
    activities: [],
    error: 'Failed to load activity data. Please try again later.',
  },
};

export const Empty: Story = {
  args: {
    activities: [],
  },
};

export const WithFilters: Story = {
  args: {
    activities: sampleActivities,
    showFilters: true,
  },
};

export const WithoutFilters: Story = {
  args: {
    activities: sampleActivities,
    showFilters: false,
  },
};

export const WithoutAvatars: Story = {
  args: {
    activities: sampleActivities,
    showAvatar: false,
  },
};

export const WithoutTimestamps: Story = {
  args: {
    activities: sampleActivities,
    showTimestamp: false,
  },
};

export const GroupedByDate: Story = {
  args: {
    activities: sampleActivities,
    groupByDate: true,
  },
};

export const LimitedItems: Story = {
  args: {
    activities: sampleActivities,
    maxItems: 3,
  },
};

export const OnlyCommits: Story = {
  args: {
    activities: sampleActivities.filter(activity => activity.type === 'commit'),
  },
};

export const OnlyTaskUpdates: Story = {
  args: {
    activities: sampleActivities.filter(
      activity => activity.type === 'task_update'
    ),
  },
};

export const OnlyProjectUpdates: Story = {
  args: {
    activities: sampleActivities.filter(
      activity => activity.type === 'project_update'
    ),
  },
};

export const WithRefreshCallback: Story = {
  args: {
    activities: sampleActivities,
    onRefresh: () => {
      console.log('Refresh clicked');
      // Simulate refresh delay
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
};

export const WithViewAllCallback: Story = {
  args: {
    activities: sampleActivities,
    maxItems: 3,
    onViewAll: () => {
      console.log('View all clicked');
    },
  },
};

export const MixedContent: Story = {
  args: {
    activities: [
      ...sampleActivities,
      {
        id: 'activity-7',
        type: 'commit',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        message: 'Initial commit: Project setup and configuration',
        author: 'System',
        details: {
          sha: 'i9j0k1l2',
          branch: 'main',
          files: 12,
          additions: 247,
          deletions: 0,
        },
      },
    ],
    maxItems: 8,
  },
};
