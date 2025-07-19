import type { Meta, StoryObj } from '@storybook/react';
import { RepositoryGrid } from '../../components/Repository/RepositoryGrid';
import type { RepositoryGridProps } from '../../components/Repository/RepositoryGrid';

const meta: Meta<typeof RepositoryGrid> = {
  title: 'Components/Repository/RepositoryGrid',
  component: RepositoryGrid,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive repository grid component with search, filtering, sorting, and multiple layout options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'select',
      options: ['grid', 'list', 'compact'],
      description: 'Grid layout type',
    },
    showEnhanced: {
      control: 'boolean',
      description: 'Whether to show enhanced features',
    },
    enableRealtime: {
      control: 'boolean',
      description: 'Whether to enable real-time updates',
    },
    searchable: {
      control: 'boolean',
      description: 'Whether to show search functionality',
    },
    filterable: {
      control: 'boolean',
      description: 'Whether to show filter options',
    },
    sortable: {
      control: 'boolean',
      description: 'Whether to show sort options',
    },
    isLoading: {
      control: 'boolean',
      description: 'Loading state',
    },
    onRepositoryClick: { action: 'repository clicked' },
    onRepositoryRefresh: { action: 'repository refresh' },
    onRepositoryDetails: { action: 'view details' },
    onRepositoryCommits: { action: 'view commits' },
    onRepositoryManage: { action: 'manage repository' },
    onRefreshAll: { action: 'refresh all' },
  },
};

export default meta;
type Story = StoryObj<typeof RepositoryGrid>;

// Sample repository data
const sampleRepositories: RepositoryGridProps['repositories'] = [
  {
    id: 'repo-1',
    name: 'taskmaster-ui',
    description: 'A modern task management interface built with React and TypeScript',
    path: '/Users/user/projects/taskmaster-ui',
    currentBranch: 'main',
    lastCommit: {
      hash: 'a1b2c3d',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      message: 'Add repository card components with enhanced Git integration',
      author: { name: 'John Doe', email: 'john@example.com' },
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
    url: 'https://github.com/company/taskmaster-ui',
    starCount: 127,
    forkCount: 23,
    language: 'TypeScript',
    isPrivate: false,
    size: 2048,
  },
  {
    id: 'repo-2',
    name: 'internal-tools',
    description: 'Internal development tools and utilities for the engineering team',
    path: '/Users/user/projects/internal-tools',
    currentBranch: 'develop',
    lastCommit: {
      hash: 'b2c3d4e',
      date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      message: 'Update deployment scripts and add monitoring',
      author: { name: 'Jane Smith', email: 'jane@example.com' },
    },
    status: {
      isClean: false,
      staged: 3,
      unstaged: 2,
      untracked: 1,
      conflicted: 0,
      ahead: 2,
      behind: 0,
    },
    url: 'https://github.com/company/internal-tools',
    starCount: 8,
    forkCount: 2,
    language: 'Python',
    isPrivate: true,
    size: 1536,
  },
  {
    id: 'repo-3',
    name: 'api-gateway',
    description: 'Microservices API gateway with authentication and rate limiting',
    path: '/Users/user/projects/api-gateway',
    currentBranch: 'main',
    lastCommit: {
      hash: 'c3d4e5f',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      message: 'Implement OAuth2 flow and refresh token handling',
      author: { name: 'Mike Johnson', email: 'mike@example.com' },
    },
    status: {
      isClean: true,
      staged: 0,
      unstaged: 0,
      untracked: 0,
      conflicted: 0,
      ahead: 0,
      behind: 1,
    },
    url: 'https://github.com/company/api-gateway',
    starCount: 89,
    forkCount: 15,
    language: 'Go',
    isPrivate: false,
    size: 512,
  },
  {
    id: 'repo-4',
    name: 'legacy-system',
    description: 'Legacy system requiring maintenance and gradual modernization',
    path: '/Users/user/projects/legacy-system',
    currentBranch: 'master',
    lastCommit: {
      hash: 'd4e5f6g',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      message: 'Fix critical security vulnerability in user authentication',
      author: { name: 'Sarah Wilson', email: 'sarah@example.com' },
    },
    status: {
      isClean: true,
      staged: 0,
      unstaged: 0,
      untracked: 0,
      conflicted: 0,
      ahead: 0,
      behind: 5,
    },
    url: 'https://github.com/company/legacy-system',
    starCount: 45,
    forkCount: 12,
    language: 'JavaScript',
    isPrivate: false,
    size: 4096,
  },
  {
    id: 'repo-5',
    name: 'mobile-app',
    description: 'Cross-platform mobile application built with React Native',
    path: '/Users/user/projects/mobile-app',
    currentBranch: 'feature/user-profiles',
    lastCommit: {
      hash: 'e5f6g7h',
      date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      message: 'Add user profile editing and avatar upload functionality',
      author: { name: 'David Brown', email: 'david@example.com' },
    },
    status: {
      isClean: false,
      staged: 1,
      unstaged: 3,
      untracked: 2,
      conflicted: 0,
      ahead: 5,
      behind: 0,
    },
    url: 'https://github.com/company/mobile-app',
    starCount: 203,
    forkCount: 34,
    language: 'JavaScript',
    isPrivate: true,
    size: 8192,
  },
  {
    id: 'repo-6',
    name: 'data-pipeline',
    description: 'ETL data pipeline for processing and analyzing user metrics',
    path: '/Users/user/projects/data-pipeline',
    currentBranch: 'main',
    lastCommit: {
      hash: 'f6g7h8i',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      message: 'Optimize query performance and add data validation',
      author: { name: 'Emma Davis', email: 'emma@example.com' },
    },
    status: {
      isClean: true,
      staged: 0,
      unstaged: 0,
      untracked: 0,
      conflicted: 0,
      ahead: 1,
      behind: 0,
    },
    starCount: 67,
    forkCount: 8,
    language: 'Python',
    isPrivate: false,
    size: 1024,
  },
];

export const Default: Story = {
  args: {
    repositories: sampleRepositories,
    layout: 'grid',
    showEnhanced: false,
    enableRealtime: false,
    searchable: true,
    filterable: true,
    sortable: true,
    isLoading: false,
    error: null,
  },
};

export const GridLayout: Story = {
  args: {
    repositories: sampleRepositories,
    layout: 'grid',
    showEnhanced: true,
    enableRealtime: false,
    searchable: true,
    filterable: true,
    sortable: true,
    isLoading: false,
  },
};

export const ListLayout: Story = {
  args: {
    repositories: sampleRepositories,
    layout: 'list',
    showEnhanced: true,
    enableRealtime: false,
    searchable: true,
    filterable: true,
    sortable: true,
    isLoading: false,
  },
};

export const CompactLayout: Story = {
  args: {
    repositories: sampleRepositories,
    layout: 'compact',
    showEnhanced: false,
    enableRealtime: false,
    searchable: true,
    filterable: true,
    sortable: true,
    isLoading: false,
  },
};

export const EnhancedFeatures: Story = {
  args: {
    repositories: sampleRepositories,
    layout: 'grid',
    showEnhanced: true,
    enableRealtime: true,
    searchable: true,
    filterable: true,
    sortable: true,
    isLoading: false,
  },
};

export const LoadingState: Story = {
  args: {
    repositories: [],
    layout: 'grid',
    showEnhanced: false,
    enableRealtime: false,
    searchable: true,
    filterable: true,
    sortable: true,
    isLoading: true,
  },
};

export const EmptyState: Story = {
  args: {
    repositories: [],
    layout: 'grid',
    showEnhanced: false,
    enableRealtime: false,
    searchable: true,
    filterable: true,
    sortable: true,
    isLoading: false,
  },
};

export const ErrorState: Story = {
  args: {
    repositories: [],
    layout: 'grid',
    showEnhanced: false,
    enableRealtime: false,
    searchable: true,
    filterable: true,
    sortable: true,
    isLoading: false,
    error: 'Failed to connect to Git service. Please check your connection and try again.',
  },
};

export const WithPagination: Story = {
  args: {
    repositories: sampleRepositories,
    layout: 'grid',
    showEnhanced: true,
    enableRealtime: false,
    searchable: true,
    filterable: true,
    sortable: true,
    isLoading: false,
    pagination: {
      currentPage: 1,
      totalPages: 3,
      pageSize: 6,
      onPageChange: (page: number) => console.log('Page changed to:', page),
    },
  },
};

export const MinimalFeatures: Story = {
  args: {
    repositories: sampleRepositories,
    layout: 'compact',
    showEnhanced: false,
    enableRealtime: false,
    searchable: false,
    filterable: false,
    sortable: false,
    isLoading: false,
  },
};

export const InteractiveExample: Story = {
  args: {
    repositories: sampleRepositories,
    layout: 'grid',
    showEnhanced: true,
    enableRealtime: true,
    searchable: true,
    filterable: true,
    sortable: true,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'An interactive repository grid with all features enabled. Try searching, filtering, and clicking on repositories.',
      },
    },
  },
};