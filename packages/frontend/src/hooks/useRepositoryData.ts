import { useState, useEffect, useCallback } from 'react';
import { RepositoryService } from '../services/repositoryService';
import type { RepositoryMetadataData, BranchInfo } from '../components/Repository';

export interface UseRepositoryDataOptions {
  /** Repository ID to fetch data for */
  repositoryId: string;
  /** Auto-refresh interval in milliseconds (0 to disable) */
  refreshInterval?: number;
  /** Whether to fetch data immediately on mount */
  autoFetch?: boolean;
}

export interface UseRepositoryDataReturn {
  /** Repository metadata */
  metadata: RepositoryMetadataData | null;
  /** Branch information */
  branches: BranchInfo[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Whether data is currently being refreshed */
  isRefreshing: boolean;
  /** Manually refresh data */
  refresh: () => Promise<void>;
  /** Clear error state */
  clearError: () => void;
  /** Last successful fetch timestamp */
  lastFetch: Date | null;
}

/**
 * Hook for managing repository data
 * 
 * Provides automatic data fetching, refresh capabilities, and state management
 * for repository metadata and branch information.
 */
export const useRepositoryData = ({
  repositoryId,
  refreshInterval = 30000, // 30 seconds default
  autoFetch = true,
}: UseRepositoryDataOptions): UseRepositoryDataReturn => {
  const [metadata, setMetadata] = useState<RepositoryMetadataData | null>(null);
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    setError(null);

    try {
      const response = await RepositoryService.getRepositoryDetails(repositoryId);
      
      if (response.success && response.data) {
        const repositoryMetadata = RepositoryService.extractRepositoryMetadata(response.data);
        const branchInfo = RepositoryService.extractBranchInfo(response.data);
        
        setMetadata(repositoryMetadata);
        setBranches(branchInfo);
        setLastFetch(new Date());
      } else {
        setError(response.error || 'Failed to fetch repository data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [repositoryId]);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (autoFetch && repositoryId) {
      fetchData();
    }
  }, [fetchData, autoFetch, repositoryId]);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval > 0 && repositoryId) {
      const interval = setInterval(() => {
        fetchData(true);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval, repositoryId]);

  return {
    metadata,
    branches,
    isLoading,
    error,
    isRefreshing,
    refresh,
    clearError,
    lastFetch,
  };
};

export interface UseRepositoryActionsOptions {
  /** Repository ID */
  repositoryId: string;
  /** Callback when action completes successfully */
  onSuccess?: (message: string) => void;
  /** Callback when action fails */
  onError?: (error: string) => void;
}

export interface UseRepositoryActionsReturn {
  /** Checkout a branch */
  checkoutBranch: (branchName: string) => Promise<void>;
  /** Create a new branch */
  createBranch: (branchName: string, fromBranch?: string) => Promise<void>;
  /** Delete a branch */
  deleteBranch: (branchName: string, force?: boolean) => Promise<void>;
  /** Fetch from remote */
  fetchRemote: () => Promise<void>;
  /** Pull from remote */
  pullFromRemote: () => Promise<void>;
  /** Push to remote */
  pushToRemote: (branchName?: string, setUpstream?: boolean) => Promise<void>;
  /** Whether any action is in progress */
  isActionLoading: boolean;
  /** Current action being performed */
  currentAction: string | null;
}

/**
 * Hook for repository actions
 * 
 * Provides functions for performing Git operations on repositories
 * with loading state management and error handling.
 */
export const useRepositoryActions = ({
  repositoryId,
  onSuccess,
  onError,
}: UseRepositoryActionsOptions): UseRepositoryActionsReturn => {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  const executeAction = useCallback(async (
    actionName: string,
    action: () => Promise<{ success: boolean; message?: string; error?: string }>
  ) => {
    setIsActionLoading(true);
    setCurrentAction(actionName);

    try {
      const result = await action();
      
      if (result.success) {
        onSuccess?.(result.message || `${actionName} completed successfully`);
      } else {
        onError?.(result.error || `${actionName} failed`);
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : `${actionName} failed`);
    } finally {
      setIsActionLoading(false);
      setCurrentAction(null);
    }
  }, [onSuccess, onError]);

  const checkoutBranch = useCallback(async (branchName: string) => {
    await executeAction('Checkout branch', async () => {
      const response = await RepositoryService.checkoutBranch(repositoryId, branchName);
      return {
        success: response.success,
        message: response.data?.message,
        error: response.error,
      };
    });
  }, [repositoryId, executeAction]);

  const createBranch = useCallback(async (branchName: string, fromBranch?: string) => {
    await executeAction('Create branch', async () => {
      const response = await RepositoryService.createBranch(repositoryId, branchName, fromBranch);
      return {
        success: response.success,
        message: response.data?.message,
        error: response.error,
      };
    });
  }, [repositoryId, executeAction]);

  const deleteBranch = useCallback(async (branchName: string, force: boolean = false) => {
    await executeAction('Delete branch', async () => {
      const response = await RepositoryService.deleteBranch(repositoryId, branchName, force);
      return {
        success: response.success,
        message: response.data?.message,
        error: response.error,
      };
    });
  }, [repositoryId, executeAction]);

  const fetchRemote = useCallback(async () => {
    await executeAction('Fetch remote', async () => {
      const response = await RepositoryService.fetchRepository(repositoryId);
      return {
        success: response.success,
        message: response.data?.message,
        error: response.error,
      };
    });
  }, [repositoryId, executeAction]);

  const pullFromRemote = useCallback(async () => {
    await executeAction('Pull from remote', async () => {
      const response = await RepositoryService.pullRepository(repositoryId);
      return {
        success: response.success,
        message: response.data?.message,
        error: response.error,
      };
    });
  }, [repositoryId, executeAction]);

  const pushToRemote = useCallback(async (branchName?: string, setUpstream: boolean = false) => {
    await executeAction('Push to remote', async () => {
      const response = await RepositoryService.pushRepository(repositoryId, branchName, setUpstream);
      return {
        success: response.success,
        message: response.data?.message,
        error: response.error,
      };
    });
  }, [repositoryId, executeAction]);

  return {
    checkoutBranch,
    createBranch,
    deleteBranch,
    fetchRemote,
    pullFromRemote,
    pushToRemote,
    isActionLoading,
    currentAction,
  };
};

export default useRepositoryData;