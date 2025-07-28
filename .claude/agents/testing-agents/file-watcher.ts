/**
 * File Watcher System
 * 
 * Monitors file changes and automatically triggers appropriate tests
 * with intelligent detection and caching
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import * as chokidar from 'chokidar';
import { backendTestingAgent } from './backend-testing-core';
import { frontendTestingAgent } from './frontend-testing-core';
import { intelligentTestSystem } from './intelligent-test-system';

export interface FileWatcherOptions {
  paths: string[];
  ignore?: string[];
  testOnStartup?: boolean;
  debounceDelay?: number;
  concurrency?: number;
  cacheEnabled?: boolean;
}

export interface FileChange {
  path: string;
  type: 'add' | 'change' | 'unlink';
  timestamp: number;
}

export interface TestTrigger {
  files: string[];
  testType: 'unit' | 'integration' | 'e2e' | 'all';
  agent: 'backend' | 'frontend' | 'intelligent';
  priority: number;
}

export interface TestResult {
  file: string;
  passed: boolean;
  coverage?: CoverageResult;
  duration: number;
  errors?: string[];
}

export interface CoverageResult {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export class FileWatcher extends EventEmitter {
  private watcher?: chokidar.FSWatcher;
  private changeQueue: FileChange[] = [];
  private testQueue: TestTrigger[] = [];
  private processing = false;
  private cache = new Map<string, TestResult>();
  private debounceTimer?: NodeJS.Timeout;
  private fileHashes = new Map<string, string>();

  constructor(private options: FileWatcherOptions) {
    super();
    this.options = {
      debounceDelay: 500,
      concurrency: 2,
      cacheEnabled: true,
      ...options,
    };
  }

  /**
   * Start watching files
   */
  async start(): Promise<void> {
    if (this.watcher) {
      throw new Error('File watcher already started');
    }

    this.watcher = chokidar.watch(this.options.paths, {
      ignored: this.options.ignore || [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/*.test.*',
        '**/*.spec.*',
      ],
      persistent: true,
      ignoreInitial: !this.options.testOnStartup,
    });

    this.watcher
      .on('add', path => this.handleFileChange(path, 'add'))
      .on('change', path => this.handleFileChange(path, 'change'))
      .on('unlink', path => this.handleFileChange(path, 'unlink'))
      .on('error', error => this.emit('error', error));

    this.emit('started', { paths: this.options.paths });
  }

  /**
   * Stop watching files
   */
  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = undefined;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }

    this.changeQueue = [];
    this.testQueue = [];
    this.processing = false;

    this.emit('stopped');
  }

  /**
   * Handle file change
   */
  private handleFileChange(filePath: string, type: FileChange['type']): void {
    const change: FileChange = {
      path: filePath,
      type,
      timestamp: Date.now(),
    };

    this.changeQueue.push(change);
    this.emit('change', change);

    // Debounce processing
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processChanges();
    }, this.options.debounceDelay);
  }

  /**
   * Process queued changes
   */
  private async processChanges(): Promise<void> {
    if (this.processing || this.changeQueue.length === 0) {
      return;
    }

    this.processing = true;
    const changes = [...this.changeQueue];
    this.changeQueue = [];

    try {
      // Group changes by type and location
      const triggers = this.createTestTriggers(changes);
      
      // Add to test queue
      this.testQueue.push(...triggers);
      
      // Process test queue
      await this.processTestQueue();
    } catch (error) {
      this.emit('error', error);
    } finally {
      this.processing = false;
    }
  }

  /**
   * Create test triggers from file changes
   */
  private createTestTriggers(changes: FileChange[]): TestTrigger[] {
    const triggers: TestTrigger[] = [];
    const processedFiles = new Set<string>();

    for (const change of changes) {
      if (processedFiles.has(change.path)) continue;
      processedFiles.add(change.path);

      const trigger = this.determineTestTrigger(change);
      if (trigger) {
        // Check if we can merge with existing trigger
        const existing = triggers.find(t => 
          t.agent === trigger.agent && 
          t.testType === trigger.testType
        );

        if (existing) {
          existing.files.push(...trigger.files);
        } else {
          triggers.push(trigger);
        }
      }
    }

    return triggers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Determine test trigger for a file change
   */
  private determineTestTrigger(change: FileChange): TestTrigger | null {
    const ext = path.extname(change.path);
    const dir = path.dirname(change.path);
    
    // Skip test files themselves
    if (change.path.includes('.test.') || change.path.includes('.spec.')) {
      return null;
    }

    // Backend files
    if (dir.includes('backend') || dir.includes('server') || dir.includes('api')) {
      if (['.ts', '.js'].includes(ext)) {
        return {
          files: [change.path],
          testType: this.isIntegrationFile(change.path) ? 'integration' : 'unit',
          agent: 'backend',
          priority: this.calculatePriority(change),
        };
      }
    }

    // Frontend files
    if (dir.includes('frontend') || dir.includes('client') || dir.includes('components')) {
      if (['.tsx', '.jsx', '.ts', '.js'].includes(ext)) {
        return {
          files: [change.path],
          testType: this.isE2EFile(change.path) ? 'e2e' : 'unit',
          agent: 'frontend',
          priority: this.calculatePriority(change),
        };
      }
    }

    // Configuration files - run all tests
    if (this.isConfigFile(change.path)) {
      return {
        files: [change.path],
        testType: 'all',
        agent: 'intelligent',
        priority: 10,
      };
    }

    return null;
  }

  /**
   * Check if file is integration-related
   */
  private isIntegrationFile(filePath: string): boolean {
    const integrationPatterns = [
      'controller', 'route', 'handler',
      'service', 'repository', 'model',
    ];
    
    return integrationPatterns.some(pattern => 
      filePath.toLowerCase().includes(pattern)
    );
  }

  /**
   * Check if file is E2E-related
   */
  private isE2EFile(filePath: string): boolean {
    const e2ePatterns = [
      'page', 'view', 'screen',
      'layout', 'app', 'root',
    ];
    
    return e2ePatterns.some(pattern => 
      filePath.toLowerCase().includes(pattern)
    );
  }

  /**
   * Check if file is configuration
   */
  private isConfigFile(filePath: string): boolean {
    const configFiles = [
      'package.json', 'tsconfig.json', 'vite.config',
      'jest.config', 'vitest.config', '.env',
    ];
    
    return configFiles.some(config => 
      filePath.includes(config)
    );
  }

  /**
   * Calculate priority for test trigger
   */
  private calculatePriority(change: FileChange): number {
    let priority = 5;

    // Higher priority for frequently changed files
    if (this.isHotFile(change.path)) {
      priority += 3;
    }

    // Higher priority for core files
    if (this.isCoreFile(change.path)) {
      priority += 2;
    }

    // Lower priority for documentation
    if (change.path.includes('docs') || change.path.endsWith('.md')) {
      priority -= 2;
    }

    return Math.max(1, Math.min(10, priority));
  }

  /**
   * Check if file is frequently changed
   */
  private isHotFile(filePath: string): boolean {
    // In practice, this would track change frequency
    // For now, use simple heuristics
    return filePath.includes('utils') || 
           filePath.includes('helpers') ||
           filePath.includes('common');
  }

  /**
   * Check if file is core functionality
   */
  private isCoreFile(filePath: string): boolean {
    return filePath.includes('core') || 
           filePath.includes('main') ||
           filePath.includes('index');
  }

  /**
   * Process test queue
   */
  private async processTestQueue(): Promise<void> {
    const concurrency = this.options.concurrency || 2;
    const running: Promise<void>[] = [];

    while (this.testQueue.length > 0 || running.length > 0) {
      // Start new tests up to concurrency limit
      while (running.length < concurrency && this.testQueue.length > 0) {
        const trigger = this.testQueue.shift()!;
        running.push(this.runTests(trigger));
      }

      // Wait for at least one to complete
      if (running.length > 0) {
        await Promise.race(running);
        // Remove completed promises
        for (let i = running.length - 1; i >= 0; i--) {
          if (await this.isPromiseResolved(running[i])) {
            running.splice(i, 1);
          }
        }
      }
    }
  }

  /**
   * Check if promise is resolved
   */
  private async isPromiseResolved(promise: Promise<void>): Promise<boolean> {
    return Promise.race([
      promise.then(() => true),
      Promise.resolve(false),
    ]);
  }

  /**
   * Run tests for a trigger
   */
  private async runTests(trigger: TestTrigger): Promise<void> {
    this.emit('test:start', trigger);

    try {
      const results: TestResult[] = [];

      for (const file of trigger.files) {
        // Check cache
        if (this.options.cacheEnabled && this.isCacheValid(file)) {
          const cached = this.cache.get(file);
          if (cached) {
            results.push(cached);
            continue;
          }
        }

        // Run appropriate tests
        const result = await this.runTestForFile(file, trigger);
        results.push(result);

        // Update cache
        if (this.options.cacheEnabled) {
          this.updateCache(file, result);
        }
      }

      // Check coverage requirements
      const coverageOk = this.checkCoverageRequirements(results);
      
      this.emit('test:complete', {
        trigger,
        results,
        coverageOk,
      });

      // If coverage failed, emit warning
      if (!coverageOk) {
        this.emit('coverage:failed', {
          files: trigger.files,
          results,
        });
      }
    } catch (error) {
      this.emit('test:error', {
        trigger,
        error,
      });
    }
  }

  /**
   * Run test for a specific file
   */
  private async runTestForFile(
    file: string,
    trigger: TestTrigger
  ): Promise<TestResult> {
    const start = Date.now();
    
    try {
      let result: any;

      switch (trigger.agent) {
        case 'backend':
          result = await backendTestingAgent.generateTests({
            targetFile: file,
            testType: trigger.testType as any,
            coverage: {
              statements: 80,
              branches: 80,
              functions: 80,
              lines: 80,
            },
          });
          break;

        case 'frontend':
          result = await frontendTestingAgent.generateTests({
            targetFile: file,
            testType: trigger.testType as any,
            framework: 'react',
          });
          break;

        case 'intelligent':
          result = await intelligentTestSystem.generateIntelligentTests({
            targetFile: file,
            testType: trigger.testType as any,
            framework: 'vitest',
            coverage: {
              statements: 90,
              branches: 85,
              functions: 95,
              lines: 90,
            },
          });
          break;
      }

      return {
        file,
        passed: result.coverage?.passed || true,
        coverage: result.coverage,
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        file,
        passed: false,
        duration: Date.now() - start,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Check if cache is valid for file
   */
  private isCacheValid(file: string): boolean {
    try {
      const stats = fs.statSync(file);
      const currentHash = stats.mtime.getTime().toString();
      const cachedHash = this.fileHashes.get(file);
      
      return currentHash === cachedHash;
    } catch {
      return false;
    }
  }

  /**
   * Update cache for file
   */
  private updateCache(file: string, result: TestResult): void {
    this.cache.set(file, result);
    
    try {
      const stats = fs.statSync(file);
      this.fileHashes.set(file, stats.mtime.getTime().toString());
    } catch {
      // Ignore errors
    }
  }

  /**
   * Check coverage requirements
   */
  private checkCoverageRequirements(results: TestResult[]): boolean {
    const requirements = {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    };

    for (const result of results) {
      if (!result.coverage) continue;

      for (const [metric, requirement] of Object.entries(requirements)) {
        const value = (result.coverage as any)[metric];
        if (value < requirement) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.fileHashes.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hits: number;
    misses: number;
  } {
    return {
      size: this.cache.size,
      hits: 0, // Would track in production
      misses: 0, // Would track in production
    };
  }
}

// Export singleton instance with default configuration
export const fileWatcher = new FileWatcher({
  paths: [
    'packages/backend/src',
    'packages/frontend/src',
    '.claude/agents',
  ],
  ignore: [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/__tests__/**',
    '**/__mocks__/**',
  ],
  testOnStartup: false,
  debounceDelay: 500,
  concurrency: 2,
  cacheEnabled: true,
});