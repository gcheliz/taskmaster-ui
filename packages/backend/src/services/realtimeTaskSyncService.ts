// Real-time Task Synchronization Service
// Integrates file watcher with WebSocket server for real-time task updates

import { FileWatcherService, FileChangeEvent } from './fileWatcherService';
import { WebSocketService } from './websocket';
import path from 'path';

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

export class RealtimeTaskSyncService {
  private fileWatcher: FileWatcherService;
  private webSocketService: WebSocketService;
  private config: RealtimeTaskSyncConfig;
  private isInitialized = false;
  private watchedRepositories: Set<string> = new Set();

  constructor(
    webSocketService: WebSocketService,
    config: RealtimeTaskSyncConfig = {}
  ) {
    this.webSocketService = webSocketService;
    this.config = {
      enabled: true,
      debounceMs: 500,
      maxRepositories: 10,
      ...config
    };
    
    // Create file watcher with appropriate config
    this.fileWatcher = new FileWatcherService({
      debounceMs: this.config.debounceMs,
      ignoreInitial: true,
      persistent: true
    });
  }

  /**
   * Initialize the real-time sync service
   */
  async initialize(): Promise<void> {
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
  addRepository(repositoryPath: string): void {
    if (!this.isInitialized) {
      throw new Error('RealtimeTaskSyncService not initialized');
    }

    if (!repositoryPath || typeof repositoryPath !== 'string') {
      throw new Error('Repository path is required and must be a string');
    }

    // Check repository limit
    if (this.watchedRepositories.size >= this.config.maxRepositories!) {
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
      
    } catch (error) {
      console.error(`❌ Failed to add repository for monitoring: ${repositoryPath}`, error);
      throw error;
    }
  }

  /**
   * Remove a repository from real-time monitoring
   */
  async removeRepository(repositoryPath: string): Promise<void> {
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
      
    } catch (error) {
      console.error(`❌ Failed to remove repository from monitoring: ${repositoryPath}`, error);
      throw error;
    }
  }

  /**
   * Get list of monitored repositories
   */
  getMonitoredRepositories(): string[] {
    return Array.from(this.watchedRepositories);
  }

  /**
   * Get service statistics
   */
  getStats(): {
    isInitialized: boolean;
    enabled: boolean;
    monitoredRepositories: number;
    watcherStats: any;
    connectedClients: number;
  } {
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
  async shutdown(): Promise<void> {
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
      
    } catch (error) {
      console.error('❌ Error during RealtimeTaskSyncService shutdown:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners for file watcher
   */
  private setupEventListeners(): void {
    // Handle file change events
    this.fileWatcher.on('fileChanged', (event: FileChangeEvent) => {
      this.handleFileChanged(event);
    });

    // Handle file watcher errors
    this.fileWatcher.on('error', (error: any) => {
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
    this.fileWatcher.on('ready', (data: { repositoryPath: string }) => {
      console.log(`✅ File watcher ready for: ${data.repositoryPath}`);
    });
  }

  /**
   * Handle file change events from the file watcher
   */
  private handleFileChanged(event: FileChangeEvent): void {
    console.log(`📁 Task file ${event.type} detected for: ${event.repositoryPath}`);
    
    // Prepare the message for WebSocket clients
    const message: TaskSyncMessage = {
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
  private broadcastMessage(message: TaskSyncMessage): void {
    try {
      console.log(`📢 Broadcasting ${message.event} for: ${message.repositoryPath}`);
      
      // Use the WebSocket service to broadcast
      this.webSocketService.broadcast({
        event: message.event,
        data: message
      });
      
    } catch (error) {
      console.error('❌ Failed to broadcast message:', error);
    }
  }
}

// Export singleton factory
let realtimeTaskSyncService: RealtimeTaskSyncService | null = null;

export function createRealtimeTaskSyncService(
  webSocketService: WebSocketService,
  config?: RealtimeTaskSyncConfig
): RealtimeTaskSyncService {
  if (!realtimeTaskSyncService) {
    realtimeTaskSyncService = new RealtimeTaskSyncService(webSocketService, config);
  }
  return realtimeTaskSyncService;
}

export function getRealtimeTaskSyncService(): RealtimeTaskSyncService | null {
  return realtimeTaskSyncService;
}