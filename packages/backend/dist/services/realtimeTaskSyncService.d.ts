import { WebSocketService } from './websocket';
export interface TaskSyncMessage {
    event: 'TASKS_UPDATED' | 'TASKS_ERROR' | 'REPOSITORY_ADDED' | 'REPOSITORY_REMOVED';
    repositoryPath: string;
    timestamp: string;
    payload?: any;
}
export interface RealtimeTaskSyncConfig {
    enabled?: boolean;
    debounceMs?: number;
    maxRepositories?: number;
}
export declare class RealtimeTaskSyncService {
    private fileWatcher;
    private webSocketService;
    private config;
    private isInitialized;
    private watchedRepositories;
    constructor(webSocketService: WebSocketService, config?: RealtimeTaskSyncConfig);
    /**
     * Initialize the real-time sync service
     */
    initialize(): Promise<void>;
    /**
     * Add a repository for real-time monitoring
     */
    addRepository(repositoryPath: string): void;
    /**
     * Remove a repository from real-time monitoring
     */
    removeRepository(repositoryPath: string): Promise<void>;
    /**
     * Get list of monitored repositories
     */
    getMonitoredRepositories(): string[];
    /**
     * Get service statistics
     */
    getStats(): {
        isInitialized: boolean;
        enabled: boolean;
        monitoredRepositories: number;
        watcherStats: any;
        connectedClients: number;
    };
    /**
     * Shutdown the service
     */
    shutdown(): Promise<void>;
    /**
     * Setup event listeners for file watcher
     */
    private setupEventListeners;
    /**
     * Handle file change events from the file watcher
     */
    private handleFileChanged;
    /**
     * Broadcast a message to all WebSocket clients
     */
    private broadcastMessage;
}
export declare function createRealtimeTaskSyncService(webSocketService: WebSocketService, config?: RealtimeTaskSyncConfig): RealtimeTaskSyncService;
export declare function getRealtimeTaskSyncService(): RealtimeTaskSyncService | null;
//# sourceMappingURL=realtimeTaskSyncService.d.ts.map