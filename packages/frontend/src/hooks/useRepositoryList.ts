import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  RepositoryService,
  type ApiResponse,
} from '../services/repositoryService';

export interface RepositoryListItem {
  id: string;
  path: string;
  name: string;
}

export interface UseRepositoryListOptions {
  /** Auto-refresh interval in milliseconds (0 to disable) */
  refetchInterval?: number;
  /** Whether to fetch on window focus */
  refetchOnWindowFocus?: boolean;
  /** Whether to fetch immediately on mount */
  enabled?: boolean;
}

export interface UseRepositoryListReturn {
  /** List of repositories */
  repositories: RepositoryListItem[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Whether data is currently being refetched */
  isFetching: boolean;
  /** Whether the query has been fetched at least once */
  isFetched: boolean;
  /** Manually refetch the list */
  refetch: () => Promise<any>;
  /** Invalidate the query cache */
  invalidate: () => Promise<void>;
  /** Last successful fetch timestamp */
  dataUpdatedAt: number;
}

// Query key factory for repository list
export const repositoryListKeys = {
  all: ['repositories'] as const,
  list: () => [...repositoryListKeys.all, 'list'] as const,
};

/**
 * Hook for fetching and managing the list of all repositories
 *
 * Uses React Query for caching, background updates, and optimistic updates.
 * Provides automatic refetching on window focus and configurable intervals.
 */
export const useRepositoryList = ({
  refetchInterval = 30000, // 30 seconds default
  refetchOnWindowFocus = true,
  enabled = true,
}: UseRepositoryListOptions = {}): UseRepositoryListReturn => {
  const queryClient = useQueryClient();

  const {
    data: apiResponse,
    isLoading,
    error,
    isFetching,
    isFetched,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: repositoryListKeys.list(),
    queryFn: async (): Promise<ApiResponse<RepositoryListItem[]>> => {
      const response = await RepositoryService.getRepositories();
      return response;
    },
    enabled,
    refetchInterval,
    refetchOnWindowFocus,
    staleTime: 10000, // Consider data stale after 10 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes after component unmount
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors, but not for 404s
      if (failureCount >= 3) return false;
      if (error instanceof Error && error.message.includes('404')) return false;
      return true;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const invalidate = async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: repositoryListKeys.all,
    });
  };

  // Extract repositories from API response or provide empty array
  const repositories: RepositoryListItem[] =
    apiResponse?.success && apiResponse.data ? apiResponse.data : [];

  // Extract error message from API response or network error
  const errorMessage: string | null =
    apiResponse?.success === false
      ? apiResponse.error || 'Failed to fetch repositories'
      : error
        ? error instanceof Error
          ? error.message
          : 'An unexpected error occurred'
        : null;

  return {
    repositories,
    isLoading,
    error: errorMessage,
    isFetching,
    isFetched,
    refetch,
    invalidate,
    dataUpdatedAt,
  };
};

/**
 * Hook for getting detailed repository data with React Query
 *
 * Fetches individual repository details and integrates with the repository list cache.
 */
export const useRepositoryDetails = (
  repositoryId: string,
  options: {
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
) => {
  const { enabled = true, refetchInterval = 60000 } = options;

  return useQuery({
    queryKey: ['repository', repositoryId, 'details'],
    queryFn: async () => {
      const response =
        await RepositoryService.getRepositoryDetails(repositoryId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch repository details');
      }
      return response.data;
    },
    enabled: enabled && !!repositoryId,
    refetchInterval,
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (failureCount >= 3) return false;
      if (error instanceof Error && error.message.includes('404')) return false;
      return true;
    },
  });
};

export default useRepositoryList;
