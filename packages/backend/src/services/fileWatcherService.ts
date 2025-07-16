// File Watcher Service for TaskMaster
// Monitors tasks.json files for changes and triggers WebSocket notifications

import chokidar from 'chokidar';
import { EventEmitter } from 'events';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

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

export class FileWatcherService extends EventEmitter {
  private watchers: Map<string, chokidar.FSWatcher> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private config: FileWatcherConfig;
  private isInitialized = false;

  constructor(config: FileWatcherConfig = {}) {
    super();
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
  async initialize(): Promise<void> {
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
  watchTasksFile(repositoryPath: string): void {
    if (!repositoryPath || typeof repositoryPath !== 'string') {
      throw new Error('Repository path is required and must be a string');
    }

    const tasksFilePath = path.join(repositoryPath, '.taskmaster', 'tasks', 'tasks.json');
    
    // Check if file exists
    if (!existsSync(tasksFilePath)) {
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
    const watcher = chokidar.watch(tasksFilePath, {
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
  async unwatchRepository(repositoryPath: string): Promise<void> {
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
  getWatchedRepositories(): string[] {
    return Array.from(this.watchers.keys());
  }

  /**
   * Check if a repository is being watched
   */
  isWatching(repositoryPath: string): boolean {
    return this.watchers.has(repositoryPath);
  }

  /**
   * Get watcher statistics
   */
  getStats(): {
    watchedRepositories: number;
    activeWatchers: number;
    pendingDebounces: number;
  } {
    return {
      watchedRepositories: this.watchers.size,
      activeWatchers: this.watchers.size,
      pendingDebounces: this.debounceTimers.size
    };
  }

  /**
   * Shutdown all watchers
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down FileWatcherService...');
    
    // Clear all debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    // Close all watchers
    const shutdownPromises = Array.from(this.watchers.entries()).map(
      async ([repositoryPath, watcher]) => {
        try {
          await watcher.close();
          console.log(`✅ Closed watcher for: ${repositoryPath}`);
        } catch (error) {
          console.error(`❌ Error closing watcher for ${repositoryPath}:`, error);
        }
      }
    );

    await Promise.all(shutdownPromises);
    this.watchers.clear();
    
    console.log('✅ FileWatcherService shutdown complete');
  }

  /**
   * Handle file events with debouncing
   */
  private handleFileEvent(type: FileChangeEvent['type'], filePath: string, repositoryPath: string): void {
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
  private processFileEvent(type: FileChangeEvent['type'], filePath: string, repositoryPath: string): void {
    console.log(`📁 File ${type} event detected: ${filePath}`);
    
    let content: any;
    
    // Read file content for add/change events
    if (type === 'add' || type === 'change') {
      try {
        if (existsSync(filePath)) {
          const fileContent = readFileSync(filePath, 'utf-8');
          content = JSON.parse(fileContent);
        }
      } catch (error) {
        console.error(`❌ Error reading tasks file ${filePath}:`, error);
        // Still emit the event but without content
      }
    }

    // Create event object
    const event: FileChangeEvent = {
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
  private setupErrorHandling(): void {
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

// Export singleton instance
export const fileWatcherService = new FileWatcherService();