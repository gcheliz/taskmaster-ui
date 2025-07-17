"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitDataService = exports.GitDataService = void 0;
const simple_git_1 = require("simple-git");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
/**
 * Service for retrieving Git repository data using simple-git
 */
class GitDataService {
    constructor(options = {}) {
        this.timeout = options.timeout || 30000; // 30 seconds default
    }
    /**
     * Get comprehensive repository metadata
     */
    async getRepositoryMetadata(repositoryPath) {
        await this.validateRepositoryPath(repositoryPath);
        const git = this.createGitInstance(repositoryPath);
        // Run Git operations in parallel for performance
        const [currentBranch, lastCommit, status, branches] = await Promise.all([
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
    async getCurrentBranch(git) {
        try {
            const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
            return branch.trim();
        }
        catch (error) {
            // Fallback for repositories without commits
            try {
                const status = await git.status();
                return status.current || 'main';
            }
            catch {
                return 'main';
            }
        }
    }
    /**
     * Get last commit information
     */
    async getLastCommit(git) {
        try {
            const log = await git.log(['-1']);
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
        }
        catch (error) {
            throw new Error(`Failed to get last commit: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get repository working directory status
     */
    async getRepositoryStatus(git) {
        try {
            const status = await git.status();
            const gitStatus = {
                isClean: status.isClean(),
                staged: status.staged.length,
                unstaged: status.modified.length + status.deleted.length,
                untracked: status.not_added.length,
                conflicted: status.conflicted.length,
                ahead: status.ahead,
                behind: status.behind
            };
            return gitStatus;
        }
        catch (error) {
            throw new Error(`Failed to get repository status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get all branches (local and remote)
     */
    async getAllBranches(git) {
        try {
            // Get local branches with tracking info
            const localBranches = await git.branch(['-vv']);
            const remoteBranches = await git.branch(['-r']);
            const branches = [];
            // Process local branches
            for (const [name, branch] of Object.entries(localBranches.branches)) {
                if (name.startsWith('remotes/'))
                    continue;
                branches.push({
                    name,
                    type: 'local',
                    current: branch.current,
                    tracking: branch.tracking || undefined,
                    ahead: branch.ahead || undefined,
                    behind: branch.behind || undefined
                });
            }
            // Process remote branches
            for (const [name, branch] of Object.entries(remoteBranches.branches)) {
                const remoteName = name.replace('remotes/', '');
                // Skip HEAD references
                if (remoteName.includes('HEAD'))
                    continue;
                branches.push({
                    name: remoteName,
                    type: 'remote',
                    current: false
                });
            }
            return branches;
        }
        catch (error) {
            throw new Error(`Failed to get branches: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Check if repository has uncommitted changes
     */
    async hasUncommittedChanges(repositoryPath) {
        const git = this.createGitInstance(repositoryPath);
        const status = await this.getRepositoryStatus(git);
        return !status.isClean;
    }
    /**
     * Get remote information
     */
    async getRemotes(repositoryPath) {
        const git = this.createGitInstance(repositoryPath);
        try {
            const remotes = await git.getRemotes(true);
            return remotes.map(remote => `${remote.name}: ${remote.refs.fetch}`);
        }
        catch (error) {
            throw new Error(`Failed to get remotes: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Validate that the path exists and is a Git repository
     */
    async validateRepositoryPath(repositoryPath) {
        try {
            const stats = await fs_1.promises.stat(repositoryPath);
            if (!stats.isDirectory()) {
                throw new Error('Path is not a directory');
            }
        }
        catch (error) {
            throw new Error(`Invalid repository path: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        // Check if it's a Git repository
        const gitDir = path_1.default.join(repositoryPath, '.git');
        try {
            await fs_1.promises.access(gitDir);
        }
        catch {
            throw new Error('Directory is not a Git repository (no .git directory found)');
        }
    }
    /**
     * Create a configured simple-git instance
     */
    createGitInstance(repositoryPath) {
        return (0, simple_git_1.simpleGit)({
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
    extractRepositoryName(repositoryPath) {
        return path_1.default.basename(repositoryPath);
    }
}
exports.GitDataService = GitDataService;
// Export singleton instance
exports.gitDataService = new GitDataService();
//# sourceMappingURL=gitDataService.js.map