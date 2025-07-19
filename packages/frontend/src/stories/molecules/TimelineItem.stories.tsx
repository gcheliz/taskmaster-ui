import type { Meta, StoryObj } from '@storybook/react';
import { TimelineItem } from '../../components/ui/molecules/TimelineItem';

const meta: Meta<typeof TimelineItem> = {
  title: 'UI/Molecules/TimelineItem',
  component: TimelineItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['commit', 'task_update', 'project_update'],
    },
    showAvatar: { control: 'boolean' },
    showTimestamp: { control: 'boolean' },
    isLast: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleActivity = {
  id: 'activity-1',
  type: 'commit' as const,
  timestamp: new Date().toISOString(),
  message: 'Added new authentication middleware and updated user permissions',
  author: 'John Doe',
  details: {
    branch: 'feature/auth-update',
    files: 5,
    additions: 42,
    deletions: 13,
  },
};

export const Default: Story = {
  args: {
    ...sampleActivity,
  },
};

export const CommitActivity: Story = {
  args: {
    ...sampleActivity,
    type: 'commit',
    message: 'Fix: Resolved authentication token expiration bug',
    details: {
      sha: 'a1b2c3d4',
      branch: 'hotfix/auth-token',
      files: 3,
      additions: 18,
      deletions: 7,
    },
  },
};

export const TaskUpdateActivity: Story = {
  args: {
    ...sampleActivity,
    type: 'task_update',
    message: 'Task completed: Implement user profile settings page',
    details: {
      taskId: 'TASK-123',
      status: 'completed',
      priority: 'high',
      assignee: 'Jane Smith',
    },
  },
};

export const ProjectUpdateActivity: Story = {
  args: {
    ...sampleActivity,
    type: 'project_update',
    message: 'Project milestone reached: Frontend refactoring complete',
    details: {
      milestone: 'Q1 2024',
      completion: '85%',
      nextPhase: 'Testing & QA',
    },
  },
};

export const WithoutAvatar: Story = {
  args: {
    ...sampleActivity,
    showAvatar: false,
  },
};

export const WithoutTimestamp: Story = {
  args: {
    ...sampleActivity,
    showTimestamp: false,
  },
};

export const WithoutAuthor: Story = {
  args: {
    ...sampleActivity,
    author: undefined,
  },
};

export const WithoutDetails: Story = {
  args: {
    ...sampleActivity,
    details: undefined,
  },
};

export const LongMessage: Story = {
  args: {
    ...sampleActivity,
    message:
      'This is a very long commit message that should be truncated when it exceeds the maximum length limit to ensure proper display in the timeline component without breaking the layout',
  },
};

export const LastItem: Story = {
  args: {
    ...sampleActivity,
    isLast: true,
  },
};

export const RecentActivity: Story = {
  args: {
    ...sampleActivity,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
  },
};

export const OldActivity: Story = {
  args: {
    ...sampleActivity,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
};
