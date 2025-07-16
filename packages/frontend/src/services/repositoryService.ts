import type { RepositoryMetadataData, BranchInfo } from '../components/Repository';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RepositoryDetailsResponse {
  name: string;
  path: string;
  currentBranch: string;
  lastCommit: {
    hash: string;
    date: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
  };
  status: {
    isClean: boolean;
    staged: number;
    unstaged: number;
    untracked: number;
    conflicted: number;
    ahead?: number;
    behind?: number;
  };
  remotes: Array<{
    name: string;
    url: string;
  }>;
  branches: Array<{
    name: string;
    isLocal: boolean;
    isRemote: boolean;
    isCurrent: boolean;
    lastCommit: {
      hash: string;
      date: string;
      message: string;
      author: {
        name: string;
        email: string;
      };
    };
    tracking?: {
      remote: string;
      ahead?: number;
      behind?: number;
    };
  }>;
}

/**
 * Repository Service
 * 
 * Provides API functions for:
 * - Fetching repository metadata and details
 * - Managing repository connections
 * - Git operations (branch checkout, etc.)
 */
export class RepositoryService {
  private static async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Validate a repository path
   */
  static async validateRepository(path: string): Promise<ApiResponse<{ isValid: boolean; message?: string }>> {
    return this.fetchApi('/api/repositories/validate', {
      method: 'POST',
      body: JSON.stringify({ path }),
    });
  }

  /**
   * Add a repository to the system
   */
  static async addRepository(path: string): Promise<ApiResponse<{ id: string; path: string }>> {
    return this.fetchApi('/api/repositories', {
      method: 'POST',
      body: JSON.stringify({ path }),
    });
  }

  /**
   * Get all connected repositories
   */
  static async getRepositories(): Promise<ApiResponse<Array<{ id: string; path: string; name: string }>>> {
    return this.fetchApi('/api/repositories');
  }

  /**
   * Remove a repository from the system
   */
  static async removeRepository(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.fetchApi(`/api/repositories/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get detailed repository information including metadata and branches
   */
  static async getRepositoryDetails(repositoryId: string): Promise<ApiResponse<RepositoryDetailsResponse>> {
    return this.fetchApi(`/api/repositories/${repositoryId}/details`);
  }

  /**
   * Extract repository metadata from detailed response
   */
  static extractRepositoryMetadata(details: RepositoryDetailsResponse): RepositoryMetadataData {
    return {
      name: details.name,
      path: details.path,
      currentBranch: details.currentBranch,
      lastCommit: details.lastCommit,
      status: details.status,
    };
  }

  /**
   * Extract branch information from detailed response
   */
  static extractBranchInfo(details: RepositoryDetailsResponse): BranchInfo[] {
    return details.branches.map(branch => ({
      name: branch.name,
      isLocal: branch.isLocal,
      isRemote: branch.isRemote,
      isCurrent: branch.isCurrent,
      lastCommit: branch.lastCommit,
      tracking: branch.tracking,
    }));
  }

  /**
   * Checkout a branch in the repository
   */
  static async checkoutBranch(
    repositoryId: string,
    branchName: string
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.fetchApi(`/api/repositories/${repositoryId}/checkout`, {
      method: 'POST',
      body: JSON.stringify({ branchName }),
    });
  }

  /**
   * Create a new branch in the repository
   */
  static async createBranch(
    repositoryId: string,
    branchName: string,
    fromBranch?: string
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.fetchApi(`/api/repositories/${repositoryId}/branches`, {
      method: 'POST',
      body: JSON.stringify({ branchName, fromBranch }),
    });
  }

  /**
   * Delete a branch from the repository
   */
  static async deleteBranch(
    repositoryId: string,
    branchName: string,
    force: boolean = false
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.fetchApi(`/api/repositories/${repositoryId}/branches/${encodeURIComponent(branchName)}`, {
      method: 'DELETE',
      body: JSON.stringify({ force }),
    });
  }

  /**
   * Fetch the latest changes from remote
   */
  static async fetchRepository(repositoryId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.fetchApi(`/api/repositories/${repositoryId}/fetch`, {
      method: 'POST',
    });
  }

  /**
   * Pull changes from remote branch
   */
  static async pullRepository(repositoryId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.fetchApi(`/api/repositories/${repositoryId}/pull`, {
      method: 'POST',
    });
  }

  /**
   * Push changes to remote branch
   */
  static async pushRepository(
    repositoryId: string,
    branchName?: string,
    setUpstream: boolean = false
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.fetchApi(`/api/repositories/${repositoryId}/push`, {
      method: 'POST',
      body: JSON.stringify({ branchName, setUpstream }),
    });
  }

  /**
   * Get commit history for a repository
   */
  static async getCommitHistory(
    repositoryId: string,
    limit: number = 50,
    branchName?: string
  ): Promise<ApiResponse<Array<{
    hash: string;
    date: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
  }>>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(branchName && { branch: branchName }),
    });

    return this.fetchApi(`/api/repositories/${repositoryId}/commits?${params}`);
  }

  /**
   * Get file changes in working directory
   */
  static async getFileChanges(repositoryId: string): Promise<ApiResponse<{
    staged: Array<{ path: string; status: string }>;
    unstaged: Array<{ path: string; status: string }>;
    untracked: Array<{ path: string }>;
    conflicted: Array<{ path: string }>;
  }>> {
    return this.fetchApi(`/api/repositories/${repositoryId}/changes`);
  }

  /**
   * Stage files for commit
   */
  static async stageFiles(
    repositoryId: string,
    filePaths: string[]
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.fetchApi(`/api/repositories/${repositoryId}/stage`, {
      method: 'POST',
      body: JSON.stringify({ filePaths }),
    });
  }

  /**
   * Unstage files
   */
  static async unstageFiles(
    repositoryId: string,
    filePaths: string[]
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.fetchApi(`/api/repositories/${repositoryId}/unstage`, {
      method: 'POST',
      body: JSON.stringify({ filePaths }),
    });
  }

  /**
   * Create a commit
   */
  static async createCommit(
    repositoryId: string,
    message: string,
    author?: { name: string; email: string }
  ): Promise<ApiResponse<{ success: boolean; hash: string; message: string }>> {
    return this.fetchApi(`/api/repositories/${repositoryId}/commit`, {
      method: 'POST',
      body: JSON.stringify({ message, author }),
    });
  }
}

export default RepositoryService;