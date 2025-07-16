// Real-time Task Sync Service Tests
// Tests for the integration between file watcher and WebSocket service

import { RealtimeTaskSyncService } from '../realtimeTaskSyncService';
import { WebSocketService } from '../websocket';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { Server } from 'http';
import { createServer } from 'http';

// Mock WebSocket service for testing
class MockWebSocketService extends WebSocketService {
  private broadcastMessages: any[] = [];

  public broadcast(message: any): void {
    this.broadcastMessages.push(message);
    console.log('Mock broadcast:', message);
  }

  public getBroadcastMessages(): any[] {
    return this.broadcastMessages;
  }

  public clearBroadcastMessages(): void {
    this.broadcastMessages = [];
  }

  public getClientCount(): number {
    return 1; // Mock client count
  }
}

describe('RealtimeTaskSyncService', () => {
  let service: RealtimeTaskSyncService;
  let mockWebSocketService: MockWebSocketService;
  let testDir: string;
  let testRepoPath: string;
  let testTasksPath: string;
  let server: Server;

  beforeAll(async () => {
    // Create HTTP server for WebSocket service
    server = createServer();
    
    // Create temporary test directory
    testDir = path.join(tmpdir(), 'realtimeTaskSyncService-test');
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
    
    // Close server
    server.close();
  });

  beforeEach(async () => {
    // Create mock WebSocket service
    mockWebSocketService = new MockWebSocketService();
    
    // Create service instance
    service = new RealtimeTaskSyncService(mockWebSocketService, {
      enabled: true,
      debounceMs: 50, // Shorter debounce for faster tests
      maxRepositories: 5
    });
    
    await service.initialize();
  });

  afterEach(async () => {
    // Clean up service
    await service.shutdown();
    mockWebSocketService.clearBroadcastMessages();
  });

  describe('Service Initialization', () => {
    it('should initialize successfully', async () => {
      const newService = new RealtimeTaskSyncService(mockWebSocketService);
      await expect(newService.initialize()).resolves.not.toThrow();
      await newService.shutdown();
    });

    it('should handle multiple initialization calls gracefully', async () => {
      const newService = new RealtimeTaskSyncService(mockWebSocketService);
      await newService.initialize();
      await expect(newService.initialize()).resolves.not.toThrow();
      await newService.shutdown();
    });

    it('should respect disabled configuration', async () => {
      const disabledService = new RealtimeTaskSyncService(mockWebSocketService, {
        enabled: false
      });
      
      await disabledService.initialize();
      const stats = disabledService.getStats();
      
      expect(stats.enabled).toBe(false);
      await disabledService.shutdown();
    });
  });

  describe('Repository Management', () => {
    it('should add repository for monitoring', () => {
      service.addRepository(testRepoPath);
      
      const monitoredRepos = service.getMonitoredRepositories();
      expect(monitoredRepos).toContain(testRepoPath);
      
      const stats = service.getStats();
      expect(stats.monitoredRepositories).toBe(1);
    });

    it('should handle duplicate repository additions gracefully', () => {
      service.addRepository(testRepoPath);
      service.addRepository(testRepoPath); // Duplicate
      
      const monitoredRepos = service.getMonitoredRepositories();
      expect(monitoredRepos.length).toBe(1);
      expect(monitoredRepos).toContain(testRepoPath);
    });

    it('should validate repository path input', () => {
      expect(() => {
        service.addRepository('');
      }).toThrow('Repository path is required and must be a string');
      
      expect(() => {
        service.addRepository(null as any);
      }).toThrow('Repository path is required and must be a string');
    });

    it('should respect maximum repositories limit', async () => {
      const limitedService = new RealtimeTaskSyncService(mockWebSocketService, {
        maxRepositories: 1
      });
      
      await limitedService.initialize();
      
      // This should work
      limitedService.addRepository(testRepoPath);
      expect(limitedService.getMonitoredRepositories().length).toBe(1);
      
      // This should be ignored due to limit
      const secondRepo = path.join(testDir, 'repo2');
      limitedService.addRepository(secondRepo);
      expect(limitedService.getMonitoredRepositories().length).toBe(1);
      
      await limitedService.shutdown();
    });

    it('should remove repository from monitoring', async () => {
      service.addRepository(testRepoPath);
      expect(service.getMonitoredRepositories()).toContain(testRepoPath);
      
      await service.removeRepository(testRepoPath);
      expect(service.getMonitoredRepositories()).not.toContain(testRepoPath);
    });

    it('should handle removing non-existent repository gracefully', async () => {
      const nonExistentPath = path.join(testDir, 'non-existent');
      await expect(service.removeRepository(nonExistentPath)).resolves.not.toThrow();
    });
  });

  describe('WebSocket Integration', () => {
    it('should broadcast repository addition', () => {
      service.addRepository(testRepoPath);
      
      const messages = mockWebSocketService.getBroadcastMessages();
      expect(messages.length).toBeGreaterThan(0);
      
      const addMessage = messages.find(msg => msg.event === 'REPOSITORY_ADDED');
      expect(addMessage).toBeDefined();
      expect(addMessage.data.repositoryPath).toBe(testRepoPath);
    });

    it('should broadcast repository removal', async () => {
      service.addRepository(testRepoPath);
      mockWebSocketService.clearBroadcastMessages();
      
      await service.removeRepository(testRepoPath);
      
      const messages = mockWebSocketService.getBroadcastMessages();
      expect(messages.length).toBeGreaterThan(0);
      
      const removeMessage = messages.find(msg => msg.event === 'REPOSITORY_REMOVED');
      expect(removeMessage).toBeDefined();
      expect(removeMessage.data.repositoryPath).toBe(testRepoPath);
    });
  });

  describe('Service Statistics', () => {
    it('should provide accurate statistics', () => {
      const stats = service.getStats();
      
      expect(stats).toHaveProperty('isInitialized');
      expect(stats).toHaveProperty('enabled');
      expect(stats).toHaveProperty('monitoredRepositories');
      expect(stats).toHaveProperty('watcherStats');
      expect(stats).toHaveProperty('connectedClients');
      
      expect(stats.isInitialized).toBe(true);
      expect(stats.enabled).toBe(true);
      expect(typeof stats.monitoredRepositories).toBe('number');
      expect(typeof stats.connectedClients).toBe('number');
    });

    it('should update statistics when repositories are added/removed', async () => {
      let stats = service.getStats();
      expect(stats.monitoredRepositories).toBe(0);
      
      service.addRepository(testRepoPath);
      stats = service.getStats();
      expect(stats.monitoredRepositories).toBe(1);
      
      await service.removeRepository(testRepoPath);
      stats = service.getStats();
      expect(stats.monitoredRepositories).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle service not initialized errors', () => {
      const uninitializedService = new RealtimeTaskSyncService(mockWebSocketService);
      
      expect(() => {
        uninitializedService.addRepository(testRepoPath);
      }).toThrow('RealtimeTaskSyncService not initialized');
    });

    it('should handle shutdown gracefully', async () => {
      service.addRepository(testRepoPath);
      expect(service.getMonitoredRepositories().length).toBe(1);
      
      await service.shutdown();
      
      const stats = service.getStats();
      expect(stats.isInitialized).toBe(false);
      expect(stats.monitoredRepositories).toBe(0);
    });
  });

  describe('File Watching Integration', () => {
    it('should monitor file changes when repository is added', () => {
      service.addRepository(testRepoPath);
      
      const stats = service.getStats();
      expect(stats.watcherStats.watchedRepositories).toBe(1);
    });

    it('should stop monitoring file changes when repository is removed', async () => {
      service.addRepository(testRepoPath);
      let stats = service.getStats();
      expect(stats.watcherStats.watchedRepositories).toBe(1);
      
      await service.removeRepository(testRepoPath);
      stats = service.getStats();
      expect(stats.watcherStats.watchedRepositories).toBe(0);
    });
  });
});