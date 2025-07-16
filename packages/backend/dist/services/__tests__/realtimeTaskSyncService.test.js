"use strict";
// Real-time Task Sync Service Tests
// Tests for the integration between file watcher and WebSocket service
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const realtimeTaskSyncService_1 = require("../realtimeTaskSyncService");
const websocket_1 = require("../websocket");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const os_1 = require("os");
const http_1 = require("http");
// Mock WebSocket service for testing
class MockWebSocketService extends websocket_1.WebSocketService {
    constructor() {
        super(...arguments);
        this.broadcastMessages = [];
    }
    broadcast(message) {
        this.broadcastMessages.push(message);
        console.log('Mock broadcast:', message);
    }
    getBroadcastMessages() {
        return this.broadcastMessages;
    }
    clearBroadcastMessages() {
        this.broadcastMessages = [];
    }
    getClientCount() {
        return 1; // Mock client count
    }
}
describe('RealtimeTaskSyncService', () => {
    let service;
    let mockWebSocketService;
    let testDir;
    let testRepoPath;
    let testTasksPath;
    let server;
    beforeAll(async () => {
        // Create HTTP server for WebSocket service
        server = (0, http_1.createServer)();
        // Create temporary test directory
        testDir = path_1.default.join((0, os_1.tmpdir)(), 'realtimeTaskSyncService-test');
        testRepoPath = path_1.default.join(testDir, 'test-repo');
        testTasksPath = path_1.default.join(testRepoPath, '.taskmaster', 'tasks', 'tasks.json');
        // Create directory structure
        (0, fs_1.mkdirSync)(path_1.default.dirname(testTasksPath), { recursive: true });
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
        (0, fs_1.writeFileSync)(testTasksPath, JSON.stringify(initialTasks, null, 2));
    });
    afterAll(async () => {
        // Clean up test directory
        if ((0, fs_1.existsSync)(testDir)) {
            (0, fs_1.rmSync)(testDir, { recursive: true, force: true });
        }
        // Close server
        server.close();
    });
    beforeEach(async () => {
        // Create mock WebSocket service
        mockWebSocketService = new MockWebSocketService();
        // Create service instance
        service = new realtimeTaskSyncService_1.RealtimeTaskSyncService(mockWebSocketService, {
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
            const newService = new realtimeTaskSyncService_1.RealtimeTaskSyncService(mockWebSocketService);
            await expect(newService.initialize()).resolves.not.toThrow();
            await newService.shutdown();
        });
        it('should handle multiple initialization calls gracefully', async () => {
            const newService = new realtimeTaskSyncService_1.RealtimeTaskSyncService(mockWebSocketService);
            await newService.initialize();
            await expect(newService.initialize()).resolves.not.toThrow();
            await newService.shutdown();
        });
        it('should respect disabled configuration', async () => {
            const disabledService = new realtimeTaskSyncService_1.RealtimeTaskSyncService(mockWebSocketService, {
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
                service.addRepository(null);
            }).toThrow('Repository path is required and must be a string');
        });
        it('should respect maximum repositories limit', async () => {
            const limitedService = new realtimeTaskSyncService_1.RealtimeTaskSyncService(mockWebSocketService, {
                maxRepositories: 1
            });
            await limitedService.initialize();
            // This should work
            limitedService.addRepository(testRepoPath);
            expect(limitedService.getMonitoredRepositories().length).toBe(1);
            // This should be ignored due to limit
            const secondRepo = path_1.default.join(testDir, 'repo2');
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
            const nonExistentPath = path_1.default.join(testDir, 'non-existent');
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
            const uninitializedService = new realtimeTaskSyncService_1.RealtimeTaskSyncService(mockWebSocketService);
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
//# sourceMappingURL=realtimeTaskSyncService.test.js.map