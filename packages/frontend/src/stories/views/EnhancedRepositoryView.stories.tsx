import type { Meta, StoryObj } from '@storybook/react';
import { EnhancedRepositoryView } from '../../components/Views/EnhancedRepositoryView';
import type { RepositoryCardProps } from '../../components/Repository/RepositoryCard';

// Mock repository data for Storybook
const mockRepositories: RepositoryCardProps['repository'][] = [
  {
    id: 'repo-1',
    name: 'taskmaster-ui',
    description:
      'Modern React application for task management with Git integration',
    path: '/Users/dev/projects/taskmaster-ui',
    currentBranch: 'main',
    lastCommit: {
      hash: 'a1b2c3d4e5f6789012345678901234567890abcd',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      message:
        'Implement detailed commit history view with search and pagination',
      author: {
        name: 'John Developer',
        email: 'john@example.com',
      },
    },
    status: {
      isClean: true,
      staged: 0,
      unstaged: 0,
      untracked: 0,
      conflicted: 0,
      ahead: 2,
      behind: 0,
    },
    url: 'https://github.com/company/taskmaster-ui',
    starCount: 156,
    forkCount: 23,
    language: 'TypeScript',
    isPrivate: false,
    size: 2048,
  },
  {
    id: 'repo-2',
    name: 'api-service',
    description: 'Backend API service with authentication and data management',
    path: '/Users/dev/projects/api-service',
    currentBranch: 'develop',
    lastCommit: {
      hash: 'b2c3d4e5f67890123456789012345678901abcde',
      date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      message: 'Add new authentication endpoints',
      author: {
        name: 'Jane Backend',
        email: 'jane@example.com',
      },
    },
    status: {
      isClean: false,
      staged: 3,
      unstaged: 1,
      untracked: 2,
      conflicted: 0,
      ahead: 0,
      behind: 1,
    },
    url: 'https://github.com/company/api-service',
    starCount: 89,
    forkCount: 12,
    language: 'Python',
    isPrivate: true,
    size: 1536,
  },
  {
    id: 'repo-3',
    name: 'mobile-app',
    description: 'Cross-platform mobile application built with React Native',
    path: '/Users/dev/projects/mobile-app',
    currentBranch: 'feature/push-notifications',
    lastCommit: {
      hash: 'c3d4e5f678901234567890123456789012abcdef',
      date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      message: 'Implement push notification system',
      author: {
        name: 'Bob Mobile',
        email: 'bob@example.com',
      },
    },
    status: {
      isClean: true,
      staged: 0,
      unstaged: 0,
      untracked: 0,
      conflicted: 0,
      ahead: 5,
      behind: 0,
    },
    url: 'https://github.com/company/mobile-app',
    starCount: 234,
    forkCount: 45,
    language: 'JavaScript',
    isPrivate: false,
    size: 3072,
  },
  {
    id: 'repo-4',
    name: 'documentation',
    description: 'Comprehensive project documentation and guides',
    path: '/Users/dev/projects/docs',
    currentBranch: 'main',
    lastCommit: {
      hash: 'd4e5f67890123456789012345678901abcdef234',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      message: 'Update API documentation with new endpoints',
      author: {
        name: 'Alice Writer',
        email: 'alice@example.com',
      },
    },
    status: {
      isClean: false,
      staged: 0,
      unstaged: 4,
      untracked: 1,
      conflicted: 0,
      ahead: 0,
      behind: 0,
    },
    starCount: 45,
    forkCount: 8,
    language: 'Markdown',
    isPrivate: false,
    size: 128,
  },
  {
    id: 'repo-5',
    name: 'analytics-engine',
    description: 'Real-time data processing and analytics platform',
    path: '/Users/dev/projects/analytics',
    currentBranch: 'main',
    lastCommit: {
      hash: 'e5f67890123456789012345678901abcdef23456',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      message: 'Optimize query performance for large datasets',
      author: {
        name: 'Charlie Data',
        email: 'charlie@example.com',
      },
    },
    status: {
      isClean: true,
      staged: 0,
      unstaged: 0,
      untracked: 0,
      conflicted: 0,
      ahead: 0,
      behind: 0,
    },
    url: 'https://github.com/company/analytics-engine',
    starCount: 312,
    forkCount: 67,
    language: 'Go',
    isPrivate: true,
    size: 4096,
  },
];

// Mock the RepositoryService for Storybook
const mockCommits = [
  {
    hash: 'a1b2c3d4e5f6789012345678901234567890abcd',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    message:
      'Fix: Resolve issue with repository card loading state\n\n- Added proper loading spinners\n- Fixed async data handling\n- Updated error boundaries',
    author: {
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
  },
  {
    hash: 'b2c3d4e5f67890123456789012345678901abcde',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    message: 'Feature: Add commit history modal component',
    author: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
    },
  },
  {
    hash: 'c3d4e5f678901234567890123456789012abcdef',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    message: 'Refactor: Improve repository service error handling',
    author: {
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
    },
  },
];

const mockRepositoryService = {
  getCommitHistory: async (
    repositoryId: string,
    limit: number = 50,
    branchName?: string
  ) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: mockCommits,
    };
  },
};

// Replace the actual service with our mock for Storybook
(window as any).__STORYBOOK_REPOSITORY_SERVICE__ = mockRepositoryService;

const meta: Meta<typeof EnhancedRepositoryView> = {
  title: 'Views/EnhancedRepositoryView',
  component: EnhancedRepositoryView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The EnhancedRepositoryView combines the repository grid with commit history functionality, providing a comprehensive repository management interface.

### Features

- **Repository Overview**: Key metrics and status summary
- **Advanced Grid**: Searchable, filterable, and sortable repository cards
- **Commit History**: Integrated modal showing detailed commit history
- **Real-time Updates**: Live status indicators and updates
- **Enhanced Features**: Health metrics, integrations, and statistics
- **Responsive Design**: Works across all device sizes

### Integration

The view integrates the RepositoryGrid and CommitHistoryModal components, handling their interaction and state management. When a user clicks the "Commits" button on any repository card, the commit history modal opens with the repository's commit data.
        `,
      },
    },
  },
  argTypes: {
    repositories: {
      description: 'Array of repository data objects',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the view is in a loading state',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    showEnhanced: {
      control: 'boolean',
      description: 'Whether to show enhanced features like health metrics',
    },
    enableRealtime: {
      control: 'boolean',
      description: 'Whether to enable real-time updates',
    },
  },
};

export default meta;
type Story = StoryObj<typeof EnhancedRepositoryView>;

export const Default: Story = {
  args: {
    repositories: mockRepositories,
    isLoading: false,
    error: null,
    showEnhanced: true,
    enableRealtime: true,
    onRepositoryClick: repo => console.log('Repository clicked:', repo.name),
    onRepositoryRefresh: id => console.log('Refresh repository:', id),
    onRepositoryDetails: id => console.log('View details:', id),
    onRepositoryManage: id => console.log('Manage repository:', id),
    onRefreshAll: () => console.log('Refresh all repositories'),
  },
};

export const LoadingState: Story = {
  args: {
    repositories: [],
    isLoading: true,
    error: null,
    showEnhanced: true,
    enableRealtime: true,
  },
};

export const ErrorState: Story = {
  args: {
    repositories: [],
    isLoading: false,
    error:
      'Failed to load repositories. Please check your connection and try again.',
    showEnhanced: true,
    enableRealtime: false,
  },
};

export const EmptyState: Story = {
  args: {
    repositories: [],
    isLoading: false,
    error: null,
    showEnhanced: true,
    enableRealtime: true,
  },
};

export const SingleRepository: Story = {
  args: {
    repositories: [mockRepositories[0]],
    isLoading: false,
    error: null,
    showEnhanced: true,
    enableRealtime: true,
  },
};

export const BasicFeatures: Story = {
  args: {
    repositories: mockRepositories,
    isLoading: false,
    error: null,
    showEnhanced: false,
    enableRealtime: false,
  },
};

export const MixedStates: Story = {
  args: {
    repositories: mockRepositories.map((repo, index) => ({
      ...repo,
      status: {
        ...repo.status,
        isClean: index % 2 === 0,
        staged: index % 3 === 0 ? 2 : 0,
        unstaged: index % 3 === 1 ? 1 : 0,
        untracked: index % 3 === 2 ? 3 : 0,
      },
    })),
    isLoading: false,
    error: null,
    showEnhanced: true,
    enableRealtime: true,
  },
};
