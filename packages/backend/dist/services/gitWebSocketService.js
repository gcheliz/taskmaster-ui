"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitWebSocketService = void 0;
const gitMonitorService_1 = require("./gitMonitorService");
const gitDataService_1 = require("./gitDataService");
const repositoryService_1 = require("./repositoryService");
const logger_1 = require("../utils/logger");
class GitWebSocketService {
    constructor(config) {
        this.config = {
            autoAddRepositories: true,
            syncInterval: 30000, // 30 seconds
        };
        this.syncIntervals = new Map();
        this.monitoredRepositories = new Set();
        this.broadcastCallback = null;
        if (config) {
            this.config = { ...this.config, ...config };
        }
    }
    initialize(broadcastCallback) {
        this.broadcastCallback = broadcastCallback;
        // Set up Git event listener
        gitMonitorService_1.gitMonitorService.on('git-event', this.handleGitEvent.bind(this));
        // Auto-add existing repositories if configured
        if (this.config.autoAddRepositories) {
            this.initializeRepositoryMonitoring();
        }
        logger_1.logger.info('Git WebSocket service initialized');
    }
    async handleWebSocketMessage(clientId, message) {
        try {
            const { type, repositoryId, data } = message;
            switch (type) {
                case 'subscribe-repository':
                    if (repositoryId) {
                        await this.subscribeToRepository(clientId, repositoryId);
                        return {
                            type: 'repository-state',
                            repositoryId,
                            data: { subscribed: true },
                            timestamp: new Date().toISOString(),
                        };
                    }
                    break;
                case 'unsubscribe-repository':
                    if (repositoryId) {
                        await this.unsubscribeFromRepository(clientId, repositoryId);
                        return {
                            type: 'repository-state',
                            repositoryId,
                            data: { subscribed: false },
                            timestamp: new Date().toISOString(),
                        };
                    }
                    break;
                case 'refresh-repository':
                    if (repositoryId) {
                        await this.refreshRepository(repositoryId);
                        return {
                            type: 'repository-state',
                            repositoryId,
                            data: { refreshed: true },
                            timestamp: new Date().toISOString(),
                        };
                    }
                    break;
                case 'get-repository-state':
                    if (repositoryId) {
                        const state = await this.getRepositoryState(repositoryId);
                        return {
                            type: 'repository-state',
                            repositoryId,
                            data: state,
                            timestamp: new Date().toISOString(),
                        };
                    }
                    break;
            }
            return null;
        }
        catch (error) {
            logger_1.logger.error('Error handling WebSocket message:', error);
            return {
                type: 'repository-error',
                repositoryId: message.repositoryId,
                data: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                },
                timestamp: new Date().toISOString(),
            };
        }
    }
    async subscribeToRepository(clientId, repositoryId) {
        const repository = await repositoryService_1.repositoryService.getRepositoryById(repositoryId);
        if (repository && repository.path) {
            await this.startMonitoringRepository(repository.path);
        }
    }
    async unsubscribeFromRepository(clientId, repositoryId) {
        // In this simple implementation, we keep monitoring even if no clients are subscribed
        // In a production system, you might want to stop monitoring when no clients are interested
    }
    async refreshRepository(repositoryId) {
        const repository = await repositoryService_1.repositoryService.getRepositoryById(repositoryId);
        if (repository && repository.path) {
            // Remove and re-add to trigger immediate check
            await gitMonitorService_1.gitMonitorService.removeRepository(repository.path);
            await gitMonitorService_1.gitMonitorService.addRepository(repository.path);
        }
    }
    async getRepositoryState(repositoryId) {
        const repository = await repositoryService_1.repositoryService.getRepositoryById(repositoryId);
        if (repository && repository.path) {
            const metadata = await gitDataService_1.gitDataService.getRepositoryMetadata(repository.path);
            return metadata;
        }
        return null;
    }
    async initializeRepositoryMonitoring() {
        try {
            const repositories = await repositoryService_1.repositoryService.getAllRepositories();
            for (const repo of repositories) {
                if (repo.path) {
                    await this.startMonitoringRepository(repo.path);
                }
            }
            logger_1.logger.info(`Started monitoring ${repositories.length} repositories`);
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize repository monitoring:', error);
        }
    }
    async startMonitoringRepository(repositoryPath) {
        if (this.monitoredRepositories.has(repositoryPath)) {
            return;
        }
        try {
            await gitMonitorService_1.gitMonitorService.addRepository(repositoryPath);
            this.monitoredRepositories.add(repositoryPath);
            // Set up periodic sync
            if (!this.syncIntervals.has(repositoryPath)) {
                const interval = setInterval(() => this.syncRepository(repositoryPath), this.config.syncInterval);
                this.syncIntervals.set(repositoryPath, interval);
            }
        }
        catch (error) {
            logger_1.logger.error(`Failed to start monitoring repository ${repositoryPath}:`, error);
        }
    }
    async syncRepository(repositoryPath) {
        try {
            // Find repository ID by path
            const repositories = await repositoryService_1.repositoryService.getAllRepositories();
            const repository = repositories.find(r => r.path === repositoryPath);
            if (repository && this.broadcastCallback) {
                // Emit sync event
                this.broadcastCallback({
                    type: 'repository-sync',
                    repositoryId: repository.id,
                    data: {
                        status: 'syncing',
                    },
                    timestamp: new Date().toISOString(),
                });
                // The actual sync is handled by gitMonitorService
                // which will emit events when changes are detected
                this.broadcastCallback({
                    type: 'repository-sync',
                    repositoryId: repository.id,
                    data: {
                        status: 'synced',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
        }
        catch (error) {
            logger_1.logger.error(`Failed to sync repository ${repositoryPath}:`, error);
        }
    }
    async handleGitEvent(event) {
        if (!this.broadcastCallback)
            return;
        try {
            // Find repository ID by path
            const repositories = await repositoryService_1.repositoryService.getAllRepositories();
            const repository = repositories.find(r => r.path === event.repository);
            if (repository) {
                // Broadcast the Git event
                this.broadcastCallback({
                    type: 'git-event',
                    repositoryId: repository.id,
                    event: event.type,
                    data: event.data,
                    timestamp: event.data.timestamp,
                });
                logger_1.logger.debug('Broadcasted Git event', {
                    repositoryId: repository.id,
                    type: event.type,
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to handle Git event:', error);
        }
    }
    async shutdown() {
        // Stop all sync intervals
        for (const interval of this.syncIntervals.values()) {
            clearInterval(interval);
        }
        this.syncIntervals.clear();
        // Stop monitoring
        await gitMonitorService_1.gitMonitorService.shutdown();
        this.monitoredRepositories.clear();
        logger_1.logger.info('Git WebSocket service shut down');
    }
}
exports.gitWebSocketService = new GitWebSocketService();
//# sourceMappingURL=gitWebSocketService.js.map