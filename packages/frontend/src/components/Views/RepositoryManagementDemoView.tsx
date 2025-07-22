import React from 'react';
import { EnhancedRepositoryView } from './EnhancedRepositoryView';
import type { RepositoryCardProps } from '../Repository/RepositoryCard';

// Mock repository data to showcase all features
const mockRepositories: RepositoryCardProps['repository'][] = [
  {
    id: 'repo-1',
    name: 'taskmaster-ui',
    description: 'Advanced task management UI with React and TypeScript. Features include real-time updates, drag-and-drop functionality, and comprehensive Git integration.',
    path: '/Users/developer/projects/taskmaster-ui',
    currentBranch: 'main',
    lastCommit: {
      hash: 'a1b2c3d4e5f6',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      message: 'feat: implement repository management interface with atomic components',
      author: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@taskmaster.dev',
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
    url: 'https://github.com/taskmaster/taskmaster-ui',
    starCount: 256,
    forkCount: 42,
    language: 'TypeScript',
    isPrivate: false,
    size: 15360, // 15MB
  },
  {
    id: 'repo-2',
    name: 'api-gateway',
    description: 'Microservices API gateway with authentication, rate limiting, and monitoring capabilities.',
    path: '/Users/developer/projects/api-gateway',
    currentBranch: 'develop',
    lastCommit: {
      hash: 'f6e5d4c3b2a1',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      message: 'fix: resolve memory leak in websocket connections',
      author: {
        name: 'Alex Chen',
        email: 'alex.chen@taskmaster.dev',
      },
    },
    status: {
      isClean: false,
      staged: 3,
      unstaged: 7,
      untracked: 2,
      conflicted: 0,
      ahead: 0,
      behind: 1,
    },
    url: 'https://github.com/taskmaster/api-gateway',
    starCount: 89,
    forkCount: 16,
    language: 'Go',
    isPrivate: true,
    size: 8192, // 8MB
  },
  {
    id: 'repo-3',
    name: 'mobile-app',
    description: 'Cross-platform mobile application for task management on iOS and Android devices.',
    path: '/Users/developer/projects/mobile-app',
    currentBranch: 'feature/offline-sync',
    lastCommit: {
      hash: '9z8y7x6w5v4u',
      date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      message: 'wip: implementing offline data synchronization',
      author: {
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@taskmaster.dev',
      },
    },
    status: {
      isClean: false,
      staged: 12,
      unstaged: 4,
      untracked: 8,
      conflicted: 1,
      ahead: 5,
      behind: 2,
    },
    url: 'https://github.com/taskmaster/mobile-app',
    starCount: 134,
    forkCount: 28,
    language: 'Dart',
    isPrivate: false,
    size: 25600, // 25MB
  },
  {
    id: 'repo-4',
    name: 'analytics-engine',
    description: 'Data analytics and reporting engine for task performance metrics and team productivity insights.',
    path: '/Users/developer/projects/analytics-engine',
    currentBranch: 'main',
    lastCommit: {
      hash: 'q1w2e3r4t5y6',
      date: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      message: 'perf: optimize query performance for large datasets',
      author: {
        name: 'David Kumar',
        email: 'david.kumar@taskmaster.dev',
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
    url: 'https://github.com/taskmaster/analytics-engine',
    starCount: 67,
    forkCount: 12,
    language: 'Python',
    isPrivate: true,
    size: 12288, // 12MB
  },
  {
    id: 'repo-5',
    name: 'cli-tools',
    description: 'Command-line interface tools and utilities for developers working with TaskMaster ecosystem.',
    path: '/Users/developer/projects/cli-tools',
    currentBranch: 'main',
    lastCommit: {
      hash: 'i9o8p7q6r5s4',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      message: 'docs: update installation guide and usage examples',
      author: {
        name: 'Emma Wilson',
        email: 'emma.wilson@taskmaster.dev',
      },
    },
    status: {
      isClean: true,
      staged: 0,
      unstaged: 0,
      untracked: 0,
      conflicted: 0,
      ahead: 0,
      behind: 3,
    },
    url: 'https://github.com/taskmaster/cli-tools',
    starCount: 45,
    forkCount: 8,
    language: 'Rust',
    isPrivate: false,
    size: 4096, // 4MB
  },
  {
    id: 'repo-6',
    name: 'documentation',
    description: 'Comprehensive documentation site with user guides, API references, and developer resources.',
    path: '/Users/developer/projects/documentation',
    currentBranch: 'content/api-v2',
    lastCommit: {
      hash: 'x5c6v7b8n9m0',
      date: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      message: 'content: add API v2 endpoint documentation',
      author: {
        name: 'John Smith',
        email: 'john.smith@taskmaster.dev',
      },
    },
    status: {
      isClean: false,
      staged: 8,
      unstaged: 2,
      untracked: 15,
      conflicted: 0,
      ahead: 12,
      behind: 0,
    },
    language: 'Markdown',
    isPrivate: false,
    size: 2048, // 2MB
  },
];

export interface RepositoryManagementDemoViewProps {
  className?: string;
}

export const RepositoryManagementDemoView: React.FC<RepositoryManagementDemoViewProps> = ({ 
  className 
}) => {
  const handleRepositoryClick = (repository: RepositoryCardProps['repository']) => {
    console.log('Repository clicked:', repository.name);
  };

  const handleRepositoryRefresh = (repositoryId: string) => {
    console.log('Refreshing repository:', repositoryId);
  };

  const handleRepositoryDetails = (repositoryId: string) => {
    console.log('Viewing repository details:', repositoryId);
  };

  const handleRepositoryManage = (repositoryId: string) => {
    console.log('Managing repository:', repositoryId);
  };

  const handleRefreshAll = () => {
    console.log('Refreshing all repositories');
  };

  return (
    <EnhancedRepositoryView
      repositories={mockRepositories}
      isLoading={false}
      error={null}
      showEnhanced={true}
      enableRealtime={true}
      onRepositoryClick={handleRepositoryClick}
      onRepositoryRefresh={handleRepositoryRefresh}
      onRepositoryDetails={handleRepositoryDetails}
      onRepositoryManage={handleRepositoryManage}
      onRefreshAll={handleRefreshAll}
      className={className}
    />
  );
};

export default RepositoryManagementDemoView;