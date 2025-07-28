import chokidar from 'chokidar';
import path from 'path';
import { AgentCommandRouter } from './command-router';
import { logger } from '../packages/backend/src/utils/winston-adapter';

interface WatcherConfig {
  workspacePath: string;
  enabled: boolean;
  ignoredPaths: string[];
  triggers: {
    [pattern: string]: {
      agent: string;
      action: string;
      debounce?: number;
    };
  };
}

export class AgentFileWatcher {
  private watcher?: chokidar.FSWatcher;
  private config: WatcherConfig;
  private router: AgentCommandRouter;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: WatcherConfig) {
    this.config = config;
    this.router = new AgentCommandRouter({
      workspacePath: config.workspacePath,
      environment: 'development',
      user: 'file-watcher',
    });
  }

  /**
   * Start watching files
   */
  start(): void {
    if (!this.config.enabled) {
      logger.info('File watcher is disabled');
      return;
    }

    const watchPaths = [
      path.join(this.config.workspacePath, 'packages', 'backend', 'src'),
      path.join(this.config.workspacePath, 'packages', 'frontend', 'src'),
      path.join(this.config.workspacePath, 'packages', 'backend', 'prisma'),
    ];

    this.watcher = chokidar.watch(watchPaths, {
      ignored: [
        ...this.config.ignoredPaths,
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/*.log',
        '**/.DS_Store',
      ],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100,
      },
    });

    this.watcher
      .on('add', (filePath) => this.handleFileEvent('add', filePath))
      .on('change', (filePath) => this.handleFileEvent('change', filePath))
      .on('unlink', (filePath) => this.handleFileEvent('unlink', filePath))
      .on('error', (error) => logger.error('Watcher error:', error));

    logger.info('File watcher started', { paths: watchPaths });
  }

  /**
   * Stop watching files
   */
  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = undefined;
      
      // Clear all debounce timers
      this.debounceTimers.forEach(timer => clearTimeout(timer));
      this.debounceTimers.clear();
      
      logger.info('File watcher stopped');
    }
  }

  /**
   * Handle file events
   */
  private handleFileEvent(event: 'add' | 'change' | 'unlink', filePath: string): void {
    const relativePath = path.relative(this.config.workspacePath, filePath);
    
    // Check each trigger pattern
    for (const [pattern, trigger] of Object.entries(this.config.triggers)) {
      const regex = new RegExp(pattern);
      if (regex.test(relativePath)) {
        this.scheduleTrigger(event, filePath, relativePath, trigger);
        break; // Only trigger once per file
      }
    }
  }

  /**
   * Schedule trigger with debouncing
   */
  private scheduleTrigger(
    event: string,
    filePath: string,
    relativePath: string,
    trigger: { agent: string; action: string; debounce?: number }
  ): void {
    const key = `${trigger.agent}:${trigger.action}:${filePath}`;
    
    // Clear existing timer
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new timer
    const timer = setTimeout(async () => {
      this.debounceTimers.delete(key);
      await this.executeTrigger(event, filePath, relativePath, trigger);
    }, trigger.debounce || 2000);
    
    this.debounceTimers.set(key, timer);
  }

  /**
   * Execute trigger action
   */
  private async executeTrigger(
    event: string,
    filePath: string,
    relativePath: string,
    trigger: { agent: string; action: string }
  ): Promise<void> {
    logger.info(`File trigger activated: ${event} ${relativePath}`, {
      agent: trigger.agent,
      action: trigger.action,
    });
    
    try {
      switch (trigger.agent) {
        case 'api-development':
          await this.handleAPIDevelopmentTrigger(event, filePath, trigger.action);
          break;
        
        case 'database-management':
          await this.handleDatabaseTrigger(event, filePath, trigger.action);
          break;
        
        case 'testing':
          await this.handleTestingTrigger(event, filePath, trigger.action);
          break;
        
        case 'code-review':
          await this.handleCodeReviewTrigger(event, filePath, trigger.action);
          break;
        
        default:
          logger.warn(`Unknown agent for trigger: ${trigger.agent}`);
      }
    } catch (error) {
      logger.error(`Trigger execution failed: ${trigger.agent}:${trigger.action}`, error);
    }
  }

  /**
   * Handle API development triggers
   */
  private async handleAPIDevelopmentTrigger(event: string, filePath: string, action: string): Promise<void> {
    if (action === 'validate-route' && event === 'change') {
      const result = await this.router.executeCommand('/api-validate', { path: filePath });
      if (!result.success) {
        logger.warn(`Route validation failed: ${filePath}`, result.error);
      }
    }
  }

  /**
   * Handle database triggers
   */
  private async handleDatabaseTrigger(event: string, filePath: string, action: string): Promise<void> {
    if (action === 'suggest-migration' && event === 'change') {
      logger.info('Schema change detected. Run the following to create a migration:');
      logger.info('task-master /db-migrate --name="your-migration-name" --description="Description of changes"');
    }
  }

  /**
   * Handle testing triggers
   */
  private async handleTestingTrigger(event: string, filePath: string, action: string): Promise<void> {
    if (action === 'run-related-tests' && event === 'change') {
      // Extract the source file path from test file
      const sourcePath = filePath.replace('/__tests__/', '/').replace('.test.ts', '.ts');
      logger.info(`Consider running tests for: ${sourcePath}`);
    }
  }

  /**
   * Handle code review triggers
   */
  private async handleCodeReviewTrigger(event: string, filePath: string, action: string): Promise<void> {
    if (action === 'review-changes' && (event === 'add' || event === 'change')) {
      logger.info(`Code review suggested for: ${filePath}`);
      // Could auto-run review in the future
    }
  }
}

/**
 * Default file watcher configuration
 */
export const defaultWatcherConfig: WatcherConfig = {
  workspacePath: process.cwd(),
  enabled: true,
  ignoredPaths: [
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/coverage/**',
    '**/tmp/**',
    '**/.claude/**',
  ],
  triggers: {
    // API route changes
    'packages/backend/src/routes/.*\\.ts$': {
      agent: 'api-development',
      action: 'validate-route',
      debounce: 3000,
    },
    
    // Prisma schema changes
    'packages/backend/prisma/schema\\.prisma$': {
      agent: 'database-management',
      action: 'suggest-migration',
      debounce: 5000,
    },
    
    // Test file changes
    'packages/.*/src/.*/__tests__/.*\\.test\\.ts$': {
      agent: 'testing',
      action: 'run-related-tests',
      debounce: 2000,
    },
    
    // New TypeScript files
    'packages/.*/src/.*\\.ts$': {
      agent: 'code-review',
      action: 'review-changes',
      debounce: 10000,
    },
  },
};