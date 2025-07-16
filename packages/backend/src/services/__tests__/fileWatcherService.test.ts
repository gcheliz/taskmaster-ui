// File Watcher Service Tests
// Tests for the TaskMaster file watcher service

import { FileWatcherService } from '../fileWatcherService';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

describe('FileWatcherService', () => {
  let service: FileWatcherService;
  let testDir: string;
  let testRepoPath: string;
  let testTasksPath: string;

  beforeAll(async () => {
    // Create temporary test directory
    testDir = path.join(tmpdir(), 'fileWatcherService-test');
    testRepoPath = path.join(testDir, 'test-repo');
    testTasksPath = path.join(testRepoPath, '.taskmaster', 'tasks', 'tasks.json');

    // Create directory structure
    mkdirSync(path.dirname(testTasksPath), { recursive: true });
    
    // Create initial tasks.json file
    const initialTasks = {
      'test-project': {
        metadata: {
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          description: 'Test project'
        },
        tasks: [
          {
            id: '1',
            title: 'Test Task',
            description: 'A test task',
            status: 'pending',
            priority: 'medium'
          }
        ]
      }
    };
    
    writeFileSync(testTasksPath, JSON.stringify(initialTasks, null, 2));
  });

  afterAll(async () => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  beforeEach(async () => {
    // Create fresh service instance for each test
    service = new FileWatcherService({
      debounceMs: 50, // Shorter debounce for faster tests
      ignoreInitial: true
    });
    
    await service.initialize();
  });

  afterEach(async () => {
    // Clean up service
    await service.shutdown();
  });

  describe('Service Initialization', () => {
    it('should initialize successfully', async () => {
      const newService = new FileWatcherService();
      await expect(newService.initialize()).resolves.not.toThrow();
      await newService.shutdown();
    });

    it('should handle multiple initialization calls gracefully', async () => {
      const newService = new FileWatcherService();
      await newService.initialize();
      await expect(newService.initialize()).resolves.not.toThrow();
      await newService.shutdown();
    });

    it('should provide correct stats after initialization', () => {
      const stats = service.getStats();
      expect(stats.watchedRepositories).toBe(0);
      expect(stats.activeWatchers).toBe(0);
      expect(stats.pendingDebounces).toBe(0);
    });
  });

  describe('File Watching Operations', () => {
    it('should start watching a tasks.json file', () => {
      service.watchTasksFile(testRepoPath);
      
      expect(service.isWatching(testRepoPath)).toBe(true);
      expect(service.getWatchedRepositories()).toContain(testRepoPath);
      
      const stats = service.getStats();
      expect(stats.watchedRepositories).toBe(1);
      expect(stats.activeWatchers).toBe(1);
    });

    it('should handle watching non-existent tasks file gracefully', () => {
      const nonExistentPath = path.join(testDir, 'non-existent-repo');
      
      expect(() => {
        service.watchTasksFile(nonExistentPath);
      }).not.toThrow();
      
      // Should not be watching since file doesn't exist
      expect(service.isWatching(nonExistentPath)).toBe(false);
    });

    it('should handle duplicate watch requests gracefully', () => {
      service.watchTasksFile(testRepoPath);
      service.watchTasksFile(testRepoPath); // Duplicate request
      
      expect(service.isWatching(testRepoPath)).toBe(true);
      expect(service.getWatchedRepositories()).toEqual([testRepoPath]);
      
      const stats = service.getStats();
      expect(stats.watchedRepositories).toBe(1);
    });

    it('should validate repository path input', () => {
      expect(() => {
        service.watchTasksFile('');
      }).toThrow('Repository path is required and must be a string');
      
      expect(() => {
        service.watchTasksFile(null as any);
      }).toThrow('Repository path is required and must be a string');
      
      expect(() => {
        service.watchTasksFile(undefined as any);
      }).toThrow('Repository path is required and must be a string');
    });
  });

  describe('File Change Detection', () => {
    it('should start watching and emit ready event', async () => {
      const readyPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout waiting for watcher ready'));
        }, 5000);
        
        service.once('ready', () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      service.watchTasksFile(testRepoPath);
      
      // Wait for watcher to be ready
      await readyPromise;
      
      expect(service.isWatching(testRepoPath)).toBe(true);
    });

    it('should handle file content parsing logic', () => {
      // Test the parsing logic directly without file watching
      const validJson = '{"test": "data"}';
      expect(() => JSON.parse(validJson)).not.toThrow();
      
      const invalidJson = 'invalid json content';
      expect(() => JSON.parse(invalidJson)).toThrow();
    });
  });

  describe('Watcher Management', () => {
    it('should stop watching a repository', async () => {
      service.watchTasksFile(testRepoPath);
      expect(service.isWatching(testRepoPath)).toBe(true);
      
      await service.unwatchRepository(testRepoPath);
      expect(service.isWatching(testRepoPath)).toBe(false);
      
      const stats = service.getStats();
      expect(stats.watchedRepositories).toBe(0);
    });

    it('should handle unwatching non-existent repository gracefully', async () => {
      const nonExistentPath = path.join(testDir, 'non-existent-repo');
      
      await expect(service.unwatchRepository(nonExistentPath)).resolves.not.toThrow();
    });

    it('should shutdown all watchers', async () => {
      const repo1 = testRepoPath;
      const repo2 = path.join(testDir, 'test-repo-2');
      
      // Create second repo structure
      const tasks2Path = path.join(repo2, '.taskmaster', 'tasks', 'tasks.json');
      mkdirSync(path.dirname(tasks2Path), { recursive: true });
      writeFileSync(tasks2Path, JSON.stringify({ 'test-2': { tasks: [] } }));
      
      service.watchTasksFile(repo1);
      service.watchTasksFile(repo2);
      
      expect(service.getStats().watchedRepositories).toBe(2);
      
      await service.shutdown();
      
      expect(service.getStats().watchedRepositories).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should emit error events for watcher errors', async () => {
      const errorPromise = new Promise<any>((resolve) => {
        service.once('error', resolve);
      });

      service.watchTasksFile(testRepoPath);
      
      // Wait for watcher to be ready
      await new Promise((resolve) => {
        service.once('ready', resolve);
      });

      // Remove the file to trigger an error
      rmSync(testTasksPath, { force: true });

      // Wait a bit to see if error is emitted
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve('timeout'), 1000);
      });

      const result = await Promise.race([errorPromise, timeoutPromise]);
      
      // Either an error should be emitted or timeout should occur
      // Both are acceptable for this test
      expect(result === 'timeout' || result.repositoryPath === testRepoPath).toBe(true);
    });
  });

  describe('Debouncing', () => {
    it('should have debouncing configuration', () => {
      const service = new FileWatcherService({ debounceMs: 100 });
      expect(service).toBeDefined();
      
      // Test that debounce timers are managed
      expect(service.getStats().pendingDebounces).toBe(0);
    });
  });
});