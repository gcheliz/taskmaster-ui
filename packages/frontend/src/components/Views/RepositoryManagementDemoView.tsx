import React, { useCallback } from 'react';
import { EnhancedRepositoryView } from './EnhancedRepositoryView';
import {
  useRepositoryList,
  useRepositoryDetails,
} from '../../hooks/useRepositoryList';
import { Spinner } from '../ui/atoms/Spinner';
import { Alert } from '../ui/molecules/Alert';
import type { RepositoryCardProps } from '../Repository/RepositoryCard';
import { cn } from '../../utils/cn';

// Transform repository list item to full repository data
const transformToRepositoryData = (
  listItem: { id: string; path: string; name: string },
  details?: any
): RepositoryCardProps['repository'] => {
  // Create base repository data with fallbacks for when details aren't loaded
  const baseData: RepositoryCardProps['repository'] = {
    id: listItem.id,
    name: listItem.name,
    path: listItem.path,
    description: `Repository at ${listItem.path}`,
    currentBranch: 'main', // Default fallback
    lastCommit: {
      hash: 'loading...',
      date: new Date().toISOString(),
      message: 'Loading commit information...',
      author: {
        name: 'Loading...',
        email: 'loading@example.com',
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
    language: 'Unknown',
    isPrivate: false,
    size: 0,
  };

  // If we have detailed data, merge it in
  if (details) {
    return {
      ...baseData,
      currentBranch: details.currentBranch || baseData.currentBranch,
      lastCommit: details.lastCommit || baseData.lastCommit,
      status: details.status || baseData.status,
      description: details.description || baseData.description,
      // Add any additional properties from details
      ...details,
    };
  }

  return baseData;
};

// Mock data fallback for when no repositories are connected
const mockRepositories: RepositoryCardProps['repository'][] = [
  {
    id: 'repo-1',
    name: 'taskmaster-ui',
    description:
      'Advanced task management UI with React and TypeScript. Features include real-time updates, drag-and-drop functionality, and comprehensive Git integration.',
    path: '/Users/developer/projects/taskmaster-ui',
    currentBranch: 'main',
    lastCommit: {
      hash: 'a1b2c3d4e5f6',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      message:
        'feat: implement repository management interface with atomic components',
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
    description:
      'Microservices API gateway with authentication, rate limiting, and monitoring capabilities.',
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
    description:
      'Cross-platform mobile application for task management on iOS and Android devices.',
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
    description:
      'Data analytics and reporting engine for task performance metrics and team productivity insights.',
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
    description:
      'Command-line interface tools and utilities for developers working with TaskMaster ecosystem.',
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
    description:
      'Comprehensive documentation site with user guides, API references, and developer resources.',
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

export const RepositoryManagementDemoView: React.FC<
  RepositoryManagementDemoViewProps
> = ({ className }) => {
  // Fetch the list of repositories using React Query
  const {
    repositories: repositoryList,
    isLoading: isLoadingList,
    error: listError,
    refetch: refetchList,
  } = useRepositoryList({
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  });

  // For demonstration purposes, we'll fetch details for up to 6 repositories
  const limitedRepositoryList = repositoryList.slice(0, 6);

  const repositoryDetailsQueries = limitedRepositoryList.map(repo => ({
    id: repo.id,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    details: useRepositoryDetails(repo.id, {
      enabled: limitedRepositoryList.length > 0,
      refetchInterval: 60000, // Refresh details every minute
    }),
  }));

  const handleRepositoryClick = useCallback(
    (repository: RepositoryCardProps['repository']) => {
      console.log('Repository clicked:', repository.name);
    },
    []
  );

  const handleRepositoryRefresh = useCallback(
    async (repositoryId: string) => {
      console.log('Refreshing repository:', repositoryId);
      // Find the specific repository details query and refetch it
      const query = repositoryDetailsQueries.find(q => q.id === repositoryId);
      if (query?.details) {
        await query.details.refetch();
      }
    },
    [repositoryDetailsQueries]
  );

  const handleRepositoryDetails = useCallback((repositoryId: string) => {
    console.log('Viewing repository details:', repositoryId);
  }, []);

  const handleRepositoryManage = useCallback((repositoryId: string) => {
    console.log('Managing repository:', repositoryId);
  }, []);

  const handleRefreshAll = useCallback(async () => {
    console.log('Refreshing all repositories');
    await refetchList();
    // Refresh all detail queries
    for (const query of repositoryDetailsQueries) {
      if (query.details) {
        await query.details.refetch();
      }
    }
  }, [refetchList, repositoryDetailsQueries]);

  // Transform repository list items to full repository data
  const repositories: RepositoryCardProps['repository'][] =
    limitedRepositoryList.length > 0
      ? limitedRepositoryList.map(listItem => {
          const detailsQuery = repositoryDetailsQueries.find(
            q => q.id === listItem.id
          );
          const details = detailsQuery?.details.data;
          return transformToRepositoryData(listItem, details);
        })
      : mockRepositories; // Fallback to mock data for demo purposes when no real repositories

  // Determine overall loading state
  const isLoadingDetails = repositoryDetailsQueries.some(
    q => q.details.isLoading
  );
  const isLoading =
    isLoadingList || (limitedRepositoryList.length > 0 && isLoadingDetails);

  // Determine error state
  const detailsErrors = repositoryDetailsQueries
    .map(q => q.details.error)
    .filter(Boolean);
  const error =
    listError || (detailsErrors.length > 0 ? detailsErrors[0]?.message : null);

  // Show loading spinner while initially loading the repository list
  if (
    isLoadingList &&
    limitedRepositoryList.length === 0 &&
    repositoryList.length === 0
  ) {
    return (
      <div className={cn('repository-management-demo-view', className)}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600">Loading repositories...</p>
            <p className="text-sm text-gray-500 mt-2">
              Checking for connected repositories or falling back to demo data
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show a notice if we're using mock data
  const usingMockData = repositoryList.length === 0;

  return (
    <div className={cn('repository-management-demo-view', className)}>
      {usingMockData && (
        <div className="mb-4">
          <Alert variant="info">
            <p className="font-medium">Demo Mode</p>
            <p className="mt-1 text-sm">
              No connected repositories found. Showing demo data to showcase the
              interface features. Connect some repositories to see real data
              here.
            </p>
          </Alert>
        </div>
      )}

      <EnhancedRepositoryView
        repositories={repositories}
        isLoading={isLoading && !usingMockData}
        error={error}
        showEnhanced={true}
        enableRealtime={!usingMockData}
        onRepositoryClick={handleRepositoryClick}
        onRepositoryRefresh={handleRepositoryRefresh}
        onRepositoryDetails={handleRepositoryDetails}
        onRepositoryManage={handleRepositoryManage}
        onRefreshAll={handleRefreshAll}
        className={className}
      />
    </div>
  );
};

export default RepositoryManagementDemoView;
