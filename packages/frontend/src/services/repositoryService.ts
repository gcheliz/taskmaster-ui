import type {
  RepositoryMetadataData,
  BranchInfo,
} from '../components/Repository';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

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

export interface RepositoryHealthMetrics {
  score: number; // 0-100 health score
  issues: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: 'security' | 'performance' | 'quality' | 'maintenance';
    message: string;
    file?: string;
    line?: number;
  }>;
  metrics: {
    codeQuality: {
      score: number;
      complexity: number;
      duplication: number;
      maintainabilityIndex: number;
    };
    security: {
      score: number;
      vulnerabilities: number;
      outdatedDependencies: number;
    };
    performance: {
      score: number;
      bundleSize: number;
      buildTime: number;
    };
    testing: {
      score: number;
      coverage: number;
      testsCount: number;
      passRate: number;
    };
  };
  trends: {
    period: string;
    data: Array<{
      date: string;
      score: number;
      commits: number;
      contributors: number;
    }>;
  };
}

export interface RepositoryStatistics {
  commits: {
    total: number;
    thisWeek: number;
    thisMonth: number;
    byAuthor: Array<{
      author: string;
      count: number;
      percentage: number;
    }>;
    byDay: Array<{
      date: string;
      count: number;
    }>;
  };
  contributors: {
    total: number;
    active: number;
    list: Array<{
      name: string;
      email: string;
      commits: number;
      linesAdded: number;
      linesRemoved: number;
      lastActivity: string;
    }>;
  };
  files: {
    total: number;
    byExtension: Array<{
      extension: string;
      count: number;
      size: number;
    }>;
    largest: Array<{
      path: string;
      size: number;
      lines: number;
    }>;
  };
  activity: {
    frequency: 'high' | 'medium' | 'low';
    lastPush: string;
    averageCommitsPerWeek: number;
    peakHour: number;
    peakDay: string;
  };
}

export interface RepositoryIntegrationStatus {
  ci: {
    provider: string | null;
    status: 'passing' | 'failing' | 'pending' | 'unknown';
    lastRun: string | null;
    branch: string | null;
    buildNumber: string | null;
    url: string | null;
  };
  deployment: {
    environment: string | null;
    status: 'deployed' | 'deploying' | 'failed' | 'unknown';
    version: string | null;
    lastDeploy: string | null;
    url: string | null;
  };
  codeQuality: {
    provider: string | null;
    score: number | null;
    grade: string | null;
    coverage: number | null;
    lastScan: string | null;
    url: string | null;
  };
  security: {
    provider: string | null;
    vulnerabilities: number | null;
    lastScan: string | null;
    score: number | null;
    url: string | null;
  };
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
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        return {
          success: false,
          error:
            errorData.error ||
            `HTTP ${response.status}: ${response.statusText}`,
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
  static async validateRepository(
    path: string
  ): Promise<ApiResponse<{ isValid: boolean; message?: string }>> {
    return this.fetchApi('/api/repositories/validate', {
      method: 'POST',
      body: JSON.stringify({ path }),
    });
  }

  /**
   * Add a repository to the system
   */
  static async addRepository(
    path: string
  ): Promise<ApiResponse<{ id: string; path: string }>> {
    return this.fetchApi('/api/repositories', {
      method: 'POST',
      body: JSON.stringify({ path }),
    });
  }

  /**
   * Get all connected repositories
   */
  static async getRepositories(): Promise<
    ApiResponse<Array<{ id: string; path: string; name: string }>>
  > {
    return this.fetchApi('/api/repositories');
  }

  /**
   * Remove a repository from the system
   */
  static async removeRepository(
    id: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.fetchApi(`/api/repositories/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get detailed repository information including metadata and branches
   */
  static async getRepositoryDetails(
    repositoryId: string
  ): Promise<ApiResponse<RepositoryDetailsResponse>> {
    return this.fetchApi(`/api/repositories/${repositoryId}/details`);
  }

  /**
   * Extract repository metadata from detailed response
   */
  static extractRepositoryMetadata(
    details: RepositoryDetailsResponse
  ): RepositoryMetadataData {
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
    return this.fetchApi(
      `/api/repositories/${repositoryId}/branches/${encodeURIComponent(branchName)}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ force }),
      }
    );
  }

  /**
   * Fetch the latest changes from remote
   */
  static async fetchRepository(
    repositoryId: string
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.fetchApi(`/api/repositories/${repositoryId}/fetch`, {
      method: 'POST',
    });
  }

  /**
   * Pull changes from remote branch
   */
  static async pullRepository(
    repositoryId: string
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
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
  ): Promise<
    ApiResponse<
      Array<{
        hash: string;
        date: string;
        message: string;
        author: {
          name: string;
          email: string;
        };
      }>
    >
  > {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(branchName && { branch: branchName }),
    });

    return this.fetchApi(`/api/repositories/${repositoryId}/commits?${params}`);
  }

  /**
   * Get file changes in working directory
   */
  static async getFileChanges(repositoryId: string): Promise<
    ApiResponse<{
      staged: Array<{ path: string; status: string }>;
      unstaged: Array<{ path: string; status: string }>;
      untracked: Array<{ path: string }>;
      conflicted: Array<{ path: string }>;
    }>
  > {
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

  // Enhanced Git API methods for advanced repository management

  /**
   * Get repository health metrics including code quality, security, and performance scores
   */
  static async getRepositoryHealth(
    repositoryId: string
  ): Promise<ApiResponse<RepositoryHealthMetrics>> {
    return this.fetchApi(`/api/repositories/${repositoryId}/health`);
  }

  /**
   * Get detailed repository statistics including commits, contributors, and activity data
   */
  static async getRepositoryStatistics(
    repositoryId: string,
    period: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<ApiResponse<RepositoryStatistics>> {
    return this.fetchApi(
      `/api/repositories/${repositoryId}/statistics?period=${period}`
    );
  }

  /**
   * Get integration status for CI/CD, deployment, code quality, and security tools
   */
  static async getRepositoryIntegrations(
    repositoryId: string
  ): Promise<ApiResponse<RepositoryIntegrationStatus>> {
    return this.fetchApi(`/api/repositories/${repositoryId}/integrations`);
  }

  /**
   * Refresh repository data and trigger re-analysis
   */
  static async refreshRepository(
    repositoryId: string,
    includeAnalysis: boolean = true
  ): Promise<
    ApiResponse<{ success: boolean; message: string; updatedAt: string }>
  > {
    return this.fetchApi(`/api/repositories/${repositoryId}/refresh`, {
      method: 'POST',
      body: JSON.stringify({ includeAnalysis }),
    });
  }

  /**
   * Get repository tags with metadata
   */
  static async getRepositoryTags(
    repositoryId: string,
    limit: number = 20
  ): Promise<
    ApiResponse<
      Array<{
        name: string;
        hash: string;
        date: string;
        author: {
          name: string;
          email: string;
        };
        message: string;
        isAnnotated: boolean;
      }>
    >
  > {
    return this.fetchApi(
      `/api/repositories/${repositoryId}/tags?limit=${limit}`
    );
  }

  /**
   * Get repository file tree structure
   */
  static async getRepositoryTree(
    repositoryId: string,
    branch?: string,
    path?: string
  ): Promise<
    ApiResponse<{
      tree: Array<{
        path: string;
        type: 'file' | 'directory';
        size: number;
        lastModified: string;
        permissions: string;
      }>;
      branch: string;
      path: string;
    }>
  > {
    const params = new URLSearchParams();
    if (branch) params.append('branch', branch);
    if (path) params.append('path', path);

    return this.fetchApi(`/api/repositories/${repositoryId}/tree?${params}`);
  }

  /**
   * Get file content from repository
   */
  static async getFileContent(
    repositoryId: string,
    filePath: string,
    branch?: string
  ): Promise<
    ApiResponse<{
      content: string;
      encoding: string;
      size: number;
      path: string;
      branch: string;
    }>
  > {
    const params = new URLSearchParams({ path: filePath });
    if (branch) params.append('branch', branch);

    return this.fetchApi(`/api/repositories/${repositoryId}/file?${params}`);
  }

  /**
   * Search code within repository
   */
  static async searchCode(
    repositoryId: string,
    query: string,
    options: {
      branch?: string;
      fileType?: string;
      caseSensitive?: boolean;
      wholeWord?: boolean;
      regex?: boolean;
      maxResults?: number;
    } = {}
  ): Promise<
    ApiResponse<{
      results: Array<{
        file: string;
        line: number;
        column: number;
        match: string;
        context: string;
      }>;
      query: string;
      totalMatches: number;
      searchTime: number;
    }>
  > {
    return this.fetchApi(`/api/repositories/${repositoryId}/search`, {
      method: 'POST',
      body: JSON.stringify({ query, ...options }),
    });
  }

  /**
   * Get repository diff between branches or commits
   */
  static async getRepositoryDiff(
    repositoryId: string,
    base: string,
    head: string,
    options: {
      context?: number;
      ignoreWhitespace?: boolean;
      wordDiff?: boolean;
    } = {}
  ): Promise<
    ApiResponse<{
      diff: string;
      stats: {
        additions: number;
        deletions: number;
        files: number;
      };
      files: Array<{
        path: string;
        status: 'added' | 'modified' | 'deleted' | 'renamed';
        additions: number;
        deletions: number;
        patch: string;
      }>;
    }>
  > {
    return this.fetchApi(`/api/repositories/${repositoryId}/diff`, {
      method: 'POST',
      body: JSON.stringify({ base, head, ...options }),
    });
  }

  /**
   * Get blame information for a file
   */
  static async getFileBlame(
    repositoryId: string,
    filePath: string,
    branch?: string
  ): Promise<
    ApiResponse<{
      lines: Array<{
        lineNumber: number;
        content: string;
        commit: {
          hash: string;
          author: {
            name: string;
            email: string;
          };
          date: string;
          message: string;
        };
      }>;
      file: string;
      branch: string;
    }>
  > {
    const params = new URLSearchParams({ path: filePath });
    if (branch) params.append('branch', branch);

    return this.fetchApi(`/api/repositories/${repositoryId}/blame?${params}`);
  }

  /**
   * Watch repository for real-time updates via WebSocket
   */
  static watchRepository(
    repositoryId: string,
    onUpdate: (data: {
      type: 'commit' | 'branch' | 'status' | 'health';
      repository: string;
      data: unknown;
      timestamp: string;
    }) => void,
    onError?: (error: Error) => void
  ): () => void {
    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/api/repositories/${repositoryId}/watch`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch (_error) {
        onError?.(new Error('Failed to parse WebSocket message'));
      }
    };

    ws.onerror = () => {
      onError?.(new Error('WebSocket connection error'));
    };

    ws.onclose = () => {
      console.log('Repository watch connection closed');
    };

    // Return cleanup function
    return () => {
      ws.close();
    };
  }

  /**
   * Get repository insights and recommendations
   */
  static async getRepositoryInsights(repositoryId: string): Promise<
    ApiResponse<{
      recommendations: Array<{
        type: 'performance' | 'security' | 'quality' | 'maintenance';
        priority: 'low' | 'medium' | 'high' | 'critical';
        title: string;
        description: string;
        actionable: boolean;
        estimatedImpact: string;
        resources: Array<{
          title: string;
          url: string;
          type: 'documentation' | 'tool' | 'tutorial';
        }>;
      }>;
      trends: {
        activity: 'increasing' | 'stable' | 'decreasing';
        quality: 'improving' | 'stable' | 'declining';
        security: 'improving' | 'stable' | 'declining';
      };
      milestones: Array<{
        type: 'commit' | 'release' | 'contributor' | 'issue';
        title: string;
        description: string;
        date: string;
        significant: boolean;
      }>;
    }>
  > {
    return this.fetchApi(`/api/repositories/${repositoryId}/insights`);
  }
}

// Types are already exported above with their interface declarations

export default RepositoryService;
