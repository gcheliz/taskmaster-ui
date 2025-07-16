"use strict";
// File Watcher Service for TaskMaster
// Monitors tasks.json files for changes and triggers WebSocket notifications
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileWatcherService = exports.FileWatcherService = void 0;
const chokidar_1 = __importDefault(require("chokidar"));
const events_1 = require("events");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class FileWatcherService extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.watchers = new Map();
        this.debounceTimers = new Map();
        this.isInitialized = false;
        this.config = {
            debounceMs: 500,
            ignoreInitial: true,
            persistent: true,
            usePolling: false,
            interval: 100,
            ...config
        };
    }
    /**
     * Initialize the file watcher service
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('FileWatcherService already initialized');
            return;
        }
        console.log('🔍 Initializing FileWatcherService...');
        this.isInitialized = true;
        // Set up error handling
        this.setupErrorHandling();
        console.log('✅ FileWatcherService initialized successfully');
    }
    /**
     * Watch a specific tasks.json file for changes
     */
    watchTasksFile(repositoryPath) {
        if (!repositoryPath || typeof repositoryPath !== 'string') {
            throw new Error('Repository path is required and must be a string');
        }
        const tasksFilePath = path_1.default.join(repositoryPath, '.taskmaster', 'tasks', 'tasks.json');
        // Check if file exists
        if (!(0, fs_1.existsSync)(tasksFilePath)) {
            console.warn(`⚠️  Tasks file not found: ${tasksFilePath}`);
            return;
        }
        // Don't watch the same file twice
        if (this.watchers.has(repositoryPath)) {
            console.log(`📂 Already watching tasks file for: ${repositoryPath}`);
            return;
        }
        console.log(`🔍 Starting to watch tasks file: ${tasksFilePath}`);
        // Create watcher
        const watcher = chokidar_1.default.watch(tasksFilePath, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            ignoreInitial: this.config.ignoreInitial,
            persistent: this.config.persistent,
            usePolling: this.config.usePolling,
            interval: this.config.interval
        });
        // Set up event handlers
        watcher
            .on('add', (filePath) => this.handleFileEvent('add', filePath, repositoryPath))
            .on('change', (filePath) => this.handleFileEvent('change', filePath, repositoryPath))
            .on('unlink', (filePath) => this.handleFileEvent('unlink', filePath, repositoryPath))
            .on('error', (error) => {
            console.error(`❌ Watcher error for ${repositoryPath}:`, error);
            this.emit('error', { repositoryPath, error });
        })
            .on('ready', () => {
            console.log(`✅ File watcher ready for: ${repositoryPath}`);
            this.emit('ready', { repositoryPath });
        });
        // Store watcher
        this.watchers.set(repositoryPath, watcher);
    }
    /**
     * Stop watching a specific repository
     */
    async unwatchRepository(repositoryPath) {
        const watcher = this.watchers.get(repositoryPath);
        if (!watcher) {
            console.log(`⚠️  No watcher found for: ${repositoryPath}`);
            return;
        }
        console.log(`🛑 Stopping watcher for: ${repositoryPath}`);
        // Clear any pending debounce timers
        const timer = this.debounceTimers.get(repositoryPath);
        if (timer) {
            clearTimeout(timer);
            this.debounceTimers.delete(repositoryPath);
        }
        // Close watcher
        await watcher.close();
        this.watchers.delete(repositoryPath);
        console.log(`✅ Watcher stopped for: ${repositoryPath}`);
    }
    /**
     * Get list of currently watched repositories
     */
    getWatchedRepositories() {
        return Array.from(this.watchers.keys());
    }
    /**
     * Check if a repository is being watched
     */
    isWatching(repositoryPath) {
        return this.watchers.has(repositoryPath);
    }
    /**
     * Get watcher statistics
     */
    getStats() {
        return {
            watchedRepositories: this.watchers.size,
            activeWatchers: this.watchers.size,
            pendingDebounces: this.debounceTimers.size
        };
    }
    /**
     * Shutdown all watchers
     */
    async shutdown() {
        console.log('🛑 Shutting down FileWatcherService...');
        // Clear all debounce timers
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
        // Close all watchers
        const shutdownPromises = Array.from(this.watchers.entries()).map(async ([repositoryPath, watcher]) => {
            try {
                await watcher.close();
                console.log(`✅ Closed watcher for: ${repositoryPath}`);
            }
            catch (error) {
                console.error(`❌ Error closing watcher for ${repositoryPath}:`, error);
            }
        });
        await Promise.all(shutdownPromises);
        this.watchers.clear();
        console.log('✅ FileWatcherService shutdown complete');
    }
    /**
     * Handle file events with debouncing
     */
    handleFileEvent(type, filePath, repositoryPath) {
        const watchKey = `${repositoryPath}:${type}`;
        // Clear existing debounce timer
        const existingTimer = this.debounceTimers.get(watchKey);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }
        // Set new debounce timer
        const timer = setTimeout(() => {
            this.processFileEvent(type, filePath, repositoryPath);
            this.debounceTimers.delete(watchKey);
        }, this.config.debounceMs);
        this.debounceTimers.set(watchKey, timer);
    }
    /**
     * Process the actual file event
     */
    processFileEvent(type, filePath, repositoryPath) {
        console.log(`📁 File ${type} event detected: ${filePath}`);
        let content;
        // Read file content for add/change events
        if (type === 'add' || type === 'change') {
            try {
                if ((0, fs_1.existsSync)(filePath)) {
                    const fileContent = (0, fs_1.readFileSync)(filePath, 'utf-8');
                    content = JSON.parse(fileContent);
                }
            }
            catch (error) {
                console.error(`❌ Error reading tasks file ${filePath}:`, error);
                // Still emit the event but without content
            }
        }
        // Create event object
        const event = {
            type,
            filePath,
            repositoryPath,
            timestamp: new Date(),
            content
        };
        // Emit the event
        this.emit('fileChanged', event);
        // Log the event
        console.log(`📢 Emitted fileChanged event for: ${repositoryPath} (${type})`);
    }
    /**
     * Setup error handling
     */
    setupErrorHandling() {
        this.on('error', (error) => {
            console.error('❌ FileWatcherService error:', error);
        });
        // Handle process events (only in non-test environments)
        if (process.env.NODE_ENV !== 'test') {
            process.on('SIGINT', () => {
                console.log('🛑 Received SIGINT, shutting down FileWatcherService...');
                this.shutdown().catch(console.error);
            });
            process.on('SIGTERM', () => {
                console.log('🛑 Received SIGTERM, shutting down FileWatcherService...');
                this.shutdown().catch(console.error);
            });
        }
    }
}
exports.FileWatcherService = FileWatcherService;
// Export singleton instance
exports.fileWatcherService = new FileWatcherService();
//# sourceMappingURL=fileWatcherService.js.map