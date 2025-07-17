"use strict";
// Real-time Task Synchronization Service
// Integrates file watcher with WebSocket server for real-time task updates
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeTaskSyncService = void 0;
exports.createRealtimeTaskSyncService = createRealtimeTaskSyncService;
exports.getRealtimeTaskSyncService = getRealtimeTaskSyncService;
const fileWatcherService_1 = require("./fileWatcherService");
class RealtimeTaskSyncService {
    constructor(webSocketService, config = {}) {
        this.isInitialized = false;
        this.watchedRepositories = new Set();
        this.webSocketService = webSocketService;
        this.config = {
            enabled: true,
            debounceMs: 500,
            maxRepositories: 10,
            ...config
        };
        // Create file watcher with appropriate config
        this.fileWatcher = new fileWatcherService_1.FileWatcherService({
            debounceMs: this.config.debounceMs,
            ignoreInitial: true,
            persistent: true
        });
    }
    /**
     * Initialize the real-time sync service
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('RealtimeTaskSyncService already initialized');
            return;
        }
        if (!this.config.enabled) {
            console.log('📡 RealtimeTaskSyncService disabled by configuration');
            return;
        }
        console.log('📡 Initializing RealtimeTaskSyncService...');
        // Initialize file watcher
        await this.fileWatcher.initialize();
        // Set up event listeners
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('✅ RealtimeTaskSyncService initialized successfully');
    }
    /**
     * Add a repository for real-time monitoring
     */
    addRepository(repositoryPath) {
        if (!this.isInitialized) {
            throw new Error('RealtimeTaskSyncService not initialized');
        }
        if (!repositoryPath || typeof repositoryPath !== 'string') {
            throw new Error('Repository path is required and must be a string');
        }
        // Check repository limit
        if (this.watchedRepositories.size >= this.config.maxRepositories) {
            console.warn(`⚠️  Maximum repositories limit (${this.config.maxRepositories}) reached. Cannot add ${repositoryPath}`);
            return;
        }
        if (this.watchedRepositories.has(repositoryPath)) {
            console.log(`📂 Repository already being monitored: ${repositoryPath}`);
            return;
        }
        try {
            // Start watching the repository
            this.fileWatcher.watchTasksFile(repositoryPath);
            this.watchedRepositories.add(repositoryPath);
            console.log(`📡 Started real-time monitoring for: ${repositoryPath}`);
            // Notify clients about new repository
            this.broadcastMessage({
                event: 'REPOSITORY_ADDED',
                repositoryPath,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error(`❌ Failed to add repository for monitoring: ${repositoryPath}`, error);
            throw error;
        }
    }
    /**
     * Remove a repository from real-time monitoring
     */
    async removeRepository(repositoryPath) {
        if (!this.watchedRepositories.has(repositoryPath)) {
            console.log(`⚠️  Repository not being monitored: ${repositoryPath}`);
            return;
        }
        try {
            await this.fileWatcher.unwatchRepository(repositoryPath);
            this.watchedRepositories.delete(repositoryPath);
            console.log(`🛑 Stopped real-time monitoring for: ${repositoryPath}`);
            // Notify clients about repository removal
            this.broadcastMessage({
                event: 'REPOSITORY_REMOVED',
                repositoryPath,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error(`❌ Failed to remove repository from monitoring: ${repositoryPath}`, error);
            throw error;
        }
    }
    /**
     * Get list of monitored repositories
     */
    getMonitoredRepositories() {
        return Array.from(this.watchedRepositories);
    }
    /**
     * Get service statistics
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            enabled: this.config.enabled || false,
            monitoredRepositories: this.watchedRepositories.size,
            watcherStats: this.fileWatcher.getStats(),
            connectedClients: this.webSocketService.getClientCount()
        };
    }
    /**
     * Shutdown the service
     */
    async shutdown() {
        console.log('🛑 Shutting down RealtimeTaskSyncService...');
        try {
            // Stop watching all repositories
            const repositoriesToUnwatch = Array.from(this.watchedRepositories);
            for (const repoPath of repositoriesToUnwatch) {
                await this.removeRepository(repoPath);
            }
            // Shutdown file watcher
            await this.fileWatcher.shutdown();
            this.watchedRepositories.clear();
            this.isInitialized = false;
            console.log('✅ RealtimeTaskSyncService shutdown complete');
        }
        catch (error) {
            console.error('❌ Error during RealtimeTaskSyncService shutdown:', error);
            throw error;
        }
    }
    /**
     * Setup event listeners for file watcher
     */
    setupEventListeners() {
        // Handle file change events
        this.fileWatcher.on('fileChanged', (event) => {
            this.handleFileChanged(event);
        });
        // Handle file watcher errors
        this.fileWatcher.on('error', (error) => {
            console.error('❌ File watcher error:', error);
            // Broadcast error to clients
            this.broadcastMessage({
                event: 'TASKS_ERROR',
                repositoryPath: error.repositoryPath || 'unknown',
                timestamp: new Date().toISOString(),
                payload: {
                    error: error.error?.message || 'Unknown file watcher error'
                }
            });
        });
        // Handle file watcher ready events
        this.fileWatcher.on('ready', (data) => {
            console.log(`✅ File watcher ready for: ${data.repositoryPath}`);
        });
    }
    /**
     * Handle file change events from the file watcher
     */
    handleFileChanged(event) {
        console.log(`📁 Task file ${event.type} detected for: ${event.repositoryPath}`);
        // Prepare the message for WebSocket clients
        const message = {
            event: 'TASKS_UPDATED',
            repositoryPath: event.repositoryPath,
            timestamp: event.timestamp.toISOString(),
            payload: {
                changeType: event.type,
                filePath: event.filePath,
                tasks: event.content
            }
        };
        // Broadcast to all connected clients
        this.broadcastMessage(message);
    }
    /**
     * Broadcast a message to all WebSocket clients
     */
    broadcastMessage(message) {
        try {
            console.log(`📢 Broadcasting ${message.event} for: ${message.repositoryPath}`);
            // Use the WebSocket service to broadcast
            this.webSocketService.broadcast({
                event: message.event,
                data: message
            });
        }
        catch (error) {
            console.error('❌ Failed to broadcast message:', error);
        }
    }
}
exports.RealtimeTaskSyncService = RealtimeTaskSyncService;
// Export singleton factory
let realtimeTaskSyncService = null;
function createRealtimeTaskSyncService(webSocketService, config) {
    if (!realtimeTaskSyncService) {
        realtimeTaskSyncService = new RealtimeTaskSyncService(webSocketService, config);
    }
    return realtimeTaskSyncService;
}
function getRealtimeTaskSyncService() {
    return realtimeTaskSyncService;
}
//# sourceMappingURL=realtimeTaskSyncService.js.map