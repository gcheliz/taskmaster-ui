"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitMonitorService = void 0;
const events_1 = require("events");
const chokidar = __importStar(require("chokidar"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const gitDataService_1 = require("./gitDataService");
const logger_1 = require("../utils/logger");
const lodash_1 = require("lodash");
class GitMonitorService extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.watchers = new Map();
        this.repositoryStates = new Map();
        this.pollingIntervals = new Map();
        this.options = {
            pollingInterval: 10000, // 10 seconds
            debounceDelay: 1000, // 1 second
            watchGitDir: true,
            detectRemoteChanges: true,
        };
        if (options) {
            this.options = { ...this.options, ...options };
        }
        logger_1.logger.info('GitMonitorService initialized', { options: this.options });
    }
    async addRepository(repositoryPath) {
        if (this.watchers.has(repositoryPath)) {
            logger_1.logger.warn(`Repository already being monitored: ${repositoryPath}`);
            return;
        }
        try {
            // Initialize repository state
            const initialState = await this.getRepositoryState(repositoryPath);
            this.repositoryStates.set(repositoryPath, initialState);
            // Watch .git directory for changes
            if (this.options.watchGitDir) {
                const gitPath = path.join(repositoryPath, '.git');
                const watcher = chokidar.watch(gitPath, {
                    ignored: [
                        '**/COMMIT_EDITMSG',
                        '**/index.lock',
                        '**/config.lock',
                        '**/*.lock',
                        '**/logs/**',
                    ],
                    persistent: true,
                    ignoreInitial: true,
                    depth: 3,
                });
                const debouncedHandler = (0, lodash_1.debounce)(() => this.handleGitChange(repositoryPath), this.options.debounceDelay);
                watcher
                    .on('add', debouncedHandler)
                    .on('change', debouncedHandler)
                    .on('unlink', debouncedHandler)
                    .on('error', (error) => {
                    logger_1.logger.error(`Git watcher error for ${repositoryPath}:`, error);
                });
                this.watchers.set(repositoryPath, watcher);
            }
            // Start polling for remote changes
            if (this.options.detectRemoteChanges) {
                const interval = setInterval(() => this.checkRemoteChanges(repositoryPath), this.options.pollingInterval);
                this.pollingIntervals.set(repositoryPath, interval);
            }
            logger_1.logger.info(`Started monitoring repository: ${repositoryPath}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to add repository for monitoring: ${repositoryPath}`, error);
            throw error;
        }
    }
    async removeRepository(repositoryPath) {
        // Stop file watcher
        const watcher = this.watchers.get(repositoryPath);
        if (watcher) {
            await watcher.close();
            this.watchers.delete(repositoryPath);
        }
        // Stop polling interval
        const interval = this.pollingIntervals.get(repositoryPath);
        if (interval) {
            clearInterval(interval);
            this.pollingIntervals.delete(repositoryPath);
        }
        // Remove state
        this.repositoryStates.delete(repositoryPath);
        logger_1.logger.info(`Stopped monitoring repository: ${repositoryPath}`);
    }
    async getRepositoryState(repositoryPath) {
        const metadata = await gitDataService_1.gitDataService.getRepositoryMetadata(repositoryPath);
        const stashCount = await this.getStashCount(repositoryPath);
        const state = {
            branch: metadata.currentBranch || 'unknown',
            lastCommit: metadata.lastCommit?.hash || '',
            status: {
                staged: metadata.status?.staged ? ['staged'] : [],
                unstaged: metadata.status?.unstaged ? ['unstaged'] : [],
                untracked: metadata.status?.untracked ? ['untracked'] : [],
            },
            stashCount,
        };
        // Get remote status if available
        if (this.options.detectRemoteChanges) {
            try {
                const remoteStatus = await this.getRemoteStatus(repositoryPath);
                state.remoteStatus = remoteStatus;
            }
            catch (error) {
                logger_1.logger.debug(`Could not get remote status for ${repositoryPath}:`, error);
            }
        }
        return state;
    }
    async handleGitChange(repositoryPath) {
        try {
            const previousState = this.repositoryStates.get(repositoryPath);
            if (!previousState)
                return;
            const currentState = await this.getRepositoryState(repositoryPath);
            this.repositoryStates.set(repositoryPath, currentState);
            // Detect branch change
            if (previousState.branch !== currentState.branch) {
                this.emitGitEvent({
                    type: 'branch-changed',
                    repository: repositoryPath,
                    data: {
                        previousValue: previousState.branch,
                        currentValue: currentState.branch,
                        timestamp: new Date().toISOString(),
                    },
                });
            }
            // Detect new commit
            if (previousState.lastCommit !== currentState.lastCommit) {
                this.emitGitEvent({
                    type: 'commit-added',
                    repository: repositoryPath,
                    data: {
                        previousValue: previousState.lastCommit,
                        currentValue: currentState.lastCommit,
                        timestamp: new Date().toISOString(),
                    },
                });
            }
            // Detect status changes
            if (this.hasStatusChanged(previousState.status, currentState.status)) {
                this.emitGitEvent({
                    type: 'status-changed',
                    repository: repositoryPath,
                    data: {
                        previousValue: previousState.status,
                        currentValue: currentState.status,
                        timestamp: new Date().toISOString(),
                    },
                });
            }
            // Detect stash changes
            if (previousState.stashCount !== currentState.stashCount) {
                this.emitGitEvent({
                    type: 'stash-changed',
                    repository: repositoryPath,
                    data: {
                        previousValue: previousState.stashCount,
                        currentValue: currentState.stashCount,
                        timestamp: new Date().toISOString(),
                    },
                });
            }
        }
        catch (error) {
            logger_1.logger.error(`Error handling Git change for ${repositoryPath}:`, error);
        }
    }
    async checkRemoteChanges(repositoryPath) {
        try {
            const previousState = this.repositoryStates.get(repositoryPath);
            if (!previousState)
                return;
            // Fetch remote changes (without merging)
            await gitDataService_1.gitDataService.fetch(repositoryPath);
            const remoteStatus = await this.getRemoteStatus(repositoryPath);
            if (!previousState.remoteStatus ||
                previousState.remoteStatus.ahead !== remoteStatus.ahead ||
                previousState.remoteStatus.behind !== remoteStatus.behind) {
                const currentState = await this.getRepositoryState(repositoryPath);
                this.repositoryStates.set(repositoryPath, currentState);
                this.emitGitEvent({
                    type: 'remote-updated',
                    repository: repositoryPath,
                    data: {
                        previousValue: previousState.remoteStatus,
                        currentValue: remoteStatus,
                        timestamp: new Date().toISOString(),
                    },
                });
            }
        }
        catch (error) {
            logger_1.logger.debug(`Error checking remote changes for ${repositoryPath}:`, error);
        }
    }
    async getRemoteStatus(repositoryPath) {
        const metadata = await gitDataService_1.gitDataService.getRepositoryMetadata(repositoryPath);
        const currentBranchData = metadata.branches?.find(b => b.current);
        if (!currentBranchData || !currentBranchData.tracking) {
            return { ahead: 0, behind: 0 };
        }
        return {
            ahead: currentBranchData.ahead || 0,
            behind: currentBranchData.behind || 0,
        };
    }
    async getStashCount(repositoryPath) {
        try {
            const stashFile = path.join(repositoryPath, '.git', 'refs', 'stash');
            await fs.access(stashFile);
            // If file exists, there's at least one stash
            // For accurate count, we'd need to parse the stash log
            return 1;
        }
        catch {
            return 0;
        }
    }
    hasStatusChanged(prev, curr) {
        return (!this.arraysEqual(prev.staged, curr.staged) ||
            !this.arraysEqual(prev.unstaged, curr.unstaged) ||
            !this.arraysEqual(prev.untracked, curr.untracked));
    }
    arraysEqual(a, b) {
        if (a.length !== b.length)
            return false;
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        return sortedA.every((val, index) => val === sortedB[index]);
    }
    emitGitEvent(event) {
        this.emit('git-event', event);
        logger_1.logger.debug('Git event emitted:', {
            type: event.type,
            repository: event.repository,
        });
    }
    async shutdown() {
        const repositories = Array.from(this.watchers.keys());
        await Promise.all(repositories.map(repo => this.removeRepository(repo)));
        logger_1.logger.info('GitMonitorService shut down');
    }
}
exports.gitMonitorService = new GitMonitorService();
//# sourceMappingURL=gitMonitorService.js.map