import { EventEmitter } from 'events';
export interface FileWatcherConfig {
    debounceMs?: number;
    ignoreInitial?: boolean;
    persistent?: boolean;
    usePolling?: boolean;
    interval?: number;
}
export interface FileChangeEvent {
    type: 'add' | 'change' | 'unlink';
    filePath: string;
    repositoryPath: string;
    timestamp: Date;
    content?: any;
}
export declare class FileWatcherService extends EventEmitter {
    private watchers;
    private debounceTimers;
    private config;
    private isInitialized;
    constructor(config?: FileWatcherConfig);
    /**
     * Initialize the file watcher service
     */
    initialize(): Promise<void>;
    /**
     * Watch a specific tasks.json file for changes
     */
    watchTasksFile(repositoryPath: string): void;
    /**
     * Stop watching a specific repository
     */
    unwatchRepository(repositoryPath: string): Promise<void>;
    /**
     * Get list of currently watched repositories
     */
    getWatchedRepositories(): string[];
    /**
     * Check if a repository is being watched
     */
    isWatching(repositoryPath: string): boolean;
    /**
     * Get watcher statistics
     */
    getStats(): {
        watchedRepositories: number;
        activeWatchers: number;
        pendingDebounces: number;
    };
    /**
     * Shutdown all watchers
     */
    shutdown(): Promise<void>;
    /**
     * Handle file events with debouncing
     */
    private handleFileEvent;
    /**
     * Process the actual file event
     */
    private processFileEvent;
    /**
     * Setup error handling
     */
    private setupErrorHandling;
}
export declare const fileWatcherService: FileWatcherService;
//# sourceMappingURL=fileWatcherService.d.ts.map