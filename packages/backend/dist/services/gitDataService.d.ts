import { SimpleGit } from 'simple-git';
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
export declare class GitDataService {
    private readonly timeout;
    constructor(options?: GitDataServiceOptions);
    /**
     * Get comprehensive repository metadata
     */
    getRepositoryMetadata(repositoryPath: string): Promise<RepositoryMetadata>;
    /**
     * Get current branch name
     */
    getCurrentBranch(git: SimpleGit): Promise<string>;
    /**
     * Get last commit information
     */
    getLastCommit(git: SimpleGit): Promise<CommitInfo>;
    /**
     * Get repository working directory status
     */
    getRepositoryStatus(git: SimpleGit): Promise<GitStatus>;
    /**
     * Get all branches (local and remote)
     */
    getAllBranches(git: SimpleGit): Promise<BranchInfo[]>;
    /**
     * Check if repository has uncommitted changes
     */
    hasUncommittedChanges(repositoryPath: string): Promise<boolean>;
    /**
     * Get remote information
     */
    getRemotes(repositoryPath: string): Promise<string[]>;
    /**
     * Validate that the path exists and is a Git repository
     */
    private validateRepositoryPath;
    /**
     * Create a configured simple-git instance
     */
    private createGitInstance;
    /**
     * Extract repository name from path
     */
    private extractRepositoryName;
}
export declare const gitDataService: GitDataService;
//# sourceMappingURL=gitDataService.d.ts.map