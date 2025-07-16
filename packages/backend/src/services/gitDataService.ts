import { simpleGit, SimpleGit, BranchSummary, LogResult, StatusResult } from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';

export interface CommitInfo {
  hash: string;
  date: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
}

export interface BranchInfo {
  name: string;
  type: 'local' | 'remote';
  current: boolean;
  tracking?: string;
  ahead?: number;
  behind?: number;
}

export interface GitStatus {
  isClean: boolean;
  staged: number;
  unstaged: number;
  untracked: number;
  conflicted: number;
  ahead?: number;
  behind?: number;
}

export interface RepositoryMetadata {
  name: string;
  path: string;
  currentBranch: string;
  lastCommit: CommitInfo;
  status: GitStatus;
  branches: BranchInfo[];
}

export interface GitDataServiceOptions {
  timeout?: number;
}

/**
 * Service for retrieving Git repository data using simple-git
 */
export class GitDataService {
  private readonly timeout: number;

  constructor(options: GitDataServiceOptions = {}) {
    this.timeout = options.timeout || 30000; // 30 seconds default
  }

  /**
   * Get comprehensive repository metadata
   */
  async getRepositoryMetadata(repositoryPath: string): Promise<RepositoryMetadata> {
    await this.validateRepositoryPath(repositoryPath);
    
    const git = this.createGitInstance(repositoryPath);
    
    // Run Git operations in parallel for performance
    const [
      currentBranch,
      lastCommit,
      status,
      branches
    ] = await Promise.all([
      this.getCurrentBranch(git),
      this.getLastCommit(git),
      this.getRepositoryStatus(git),
      this.getAllBranches(git)
    ]);

    const repositoryName = this.extractRepositoryName(repositoryPath);

    return {
      name: repositoryName,
      path: repositoryPath,
      currentBranch,
      lastCommit,
      status,
      branches
    };
  }

  /**
   * Get current branch name
   */
  async getCurrentBranch(git: SimpleGit): Promise<string> {
    try {
      const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
      return branch.trim();
    } catch (error) {
      // Fallback for repositories without commits
      try {
        const status = await git.status();
        return status.current || 'main';
      } catch {
        return 'main';
      }
    }
  }

  /**
   * Get last commit information
   */
  async getLastCommit(git: SimpleGit): Promise<CommitInfo> {
    try {
      const log: LogResult = await git.log(['-1']);
      
      if (!log.latest) {
        throw new Error('No commits found in repository');
      }

      const commit = log.latest;
      
      return {
        hash: commit.hash,
        date: commit.date,
        message: commit.message,
        author: {
          name: commit.author_name,
          email: commit.author_email
        }
      };
    } catch (error) {
      throw new Error(`Failed to get last commit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get repository working directory status
   */
  async getRepositoryStatus(git: SimpleGit): Promise<GitStatus> {
    try {
      const status: StatusResult = await git.status();
      
      const gitStatus: GitStatus = {
        isClean: status.isClean(),
        staged: status.staged.length,
        unstaged: status.modified.length + status.deleted.length,
        untracked: status.not_added.length,
        conflicted: status.conflicted.length,
        ahead: status.ahead,
        behind: status.behind
      };

      return gitStatus;
    } catch (error) {
      throw new Error(`Failed to get repository status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all branches (local and remote)
   */
  async getAllBranches(git: SimpleGit): Promise<BranchInfo[]> {
    try {
      // Get local branches with tracking info
      const localBranches = await git.branch(['-vv']);
      const remoteBranches = await git.branch(['-r']);
      
      const branches: BranchInfo[] = [];

      // Process local branches
      for (const [name, branch] of Object.entries(localBranches.branches)) {
        if (name.startsWith('remotes/')) continue;

        branches.push({
          name,
          type: 'local',
          current: branch.current,
          tracking: (branch as any).tracking || undefined,
          ahead: (branch as any).ahead || undefined,
          behind: (branch as any).behind || undefined
        });
      }

      // Process remote branches
      for (const [name, branch] of Object.entries(remoteBranches.branches)) {
        const remoteName = name.replace('remotes/', '');
        // Skip HEAD references
        if (remoteName.includes('HEAD')) continue;

        branches.push({
          name: remoteName,
          type: 'remote',
          current: false
        });
      }

      return branches;
    } catch (error) {
      throw new Error(`Failed to get branches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if repository has uncommitted changes
   */
  async hasUncommittedChanges(repositoryPath: string): Promise<boolean> {
    const git = this.createGitInstance(repositoryPath);
    const status = await this.getRepositoryStatus(git);
    return !status.isClean;
  }

  /**
   * Get remote information
   */
  async getRemotes(repositoryPath: string): Promise<string[]> {
    const git = this.createGitInstance(repositoryPath);
    
    try {
      const remotes = await git.getRemotes(true);
      return remotes.map(remote => `${remote.name}: ${remote.refs.fetch}`);
    } catch (error) {
      throw new Error(`Failed to get remotes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate that the path exists and is a Git repository
   */
  private async validateRepositoryPath(repositoryPath: string): Promise<void> {
    try {
      const stats = await fs.stat(repositoryPath);
      if (!stats.isDirectory()) {
        throw new Error('Path is not a directory');
      }
    } catch (error) {
      throw new Error(`Invalid repository path: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check if it's a Git repository
    const gitDir = path.join(repositoryPath, '.git');
    try {
      await fs.access(gitDir);
    } catch {
      throw new Error('Directory is not a Git repository (no .git directory found)');
    }
  }

  /**
   * Create a configured simple-git instance
   */
  private createGitInstance(repositoryPath: string): SimpleGit {
    return simpleGit({
      baseDir: repositoryPath,
      timeout: {
        block: this.timeout
      },
      config: []
    });
  }

  /**
   * Extract repository name from path
   */
  private extractRepositoryName(repositoryPath: string): string {
    return path.basename(repositoryPath);
  }
}

// Export singleton instance
export const gitDataService = new GitDataService();