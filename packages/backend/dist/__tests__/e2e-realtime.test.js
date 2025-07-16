"use strict";
// E2E Test for Real-time Task Synchronization
// Tests the complete flow from file changes to WebSocket notifications
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const websocket_1 = require("../services/websocket");
const realtimeTaskSyncService_1 = require("../services/realtimeTaskSyncService");
const http_1 = require("http");
const ws_1 = require("ws");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const TEST_REPOSITORY_PATH = path_1.default.join(__dirname, 'test-repo');
const TASKS_FILE_PATH = path_1.default.join(TEST_REPOSITORY_PATH, '.taskmaster', 'tasks', 'tasks.json');
(0, globals_1.describe)('E2E Real-time Task Synchronization', () => {
    let server;
    let webSocketService;
    let realtimeService;
    let clientWebSocket;
    let receivedMessages = [];
    (0, globals_1.beforeEach)(async () => {
        // Clean up any existing test directory
        if ((0, fs_1.existsSync)(TEST_REPOSITORY_PATH)) {
            (0, fs_1.rmSync)(TEST_REPOSITORY_PATH, { recursive: true, force: true });
        }
        // Create test repository structure
        (0, fs_1.mkdirSync)(path_1.default.join(TEST_REPOSITORY_PATH, '.taskmaster', 'tasks'), { recursive: true });
        // Create initial tasks.json file
        const initialTasks = {
            'test-project': {
                tasks: [
                    {
                        id: 1,
                        title: 'Test Task',
                        description: 'Initial test task',
                        status: 'pending',
                        priority: 'medium'
                    }
                ]
            }
        };
        (0, fs_1.writeFileSync)(TASKS_FILE_PATH, JSON.stringify(initialTasks, null, 2));
        // Create HTTP server
        server = new http_1.Server();
        // Initialize WebSocket service
        webSocketService = new websocket_1.WebSocketService();
        webSocketService.initialize(server);
        // Initialize real-time service with faster debouncing for testing
        realtimeService = new realtimeTaskSyncService_1.RealtimeTaskSyncService(webSocketService, {
            enabled: true,
            debounceMs: 100, // Faster for testing
            maxRepositories: 5
        });
        await realtimeService.initialize();
        // Start server
        await new Promise((resolve) => {
            server.listen(0, () => {
                const address = server.address();
                const port = typeof address === 'string' ? 0 : address?.port || 0;
                // Create client WebSocket connection
                clientWebSocket = new ws_1.WebSocket(`ws://localhost:${port}`);
                clientWebSocket.on('message', (data) => {
                    try {
                        const message = JSON.parse(data.toString());
                        receivedMessages.push(message);
                        console.log('📨 Received message:', message);
                    }
                    catch (error) {
                        console.error('❌ Error parsing message:', error);
                    }
                });
                clientWebSocket.on('open', () => {
                    console.log('✅ Client WebSocket connected');
                    resolve();
                });
                clientWebSocket.on('error', (error) => {
                    console.error('❌ Client WebSocket error:', error);
                });
            });
        });
        // Clear received messages
        receivedMessages = [];
    });
    (0, globals_1.afterEach)(async () => {
        // Close client WebSocket
        if (clientWebSocket) {
            clientWebSocket.close();
        }
        // Shutdown services
        if (realtimeService) {
            await realtimeService.shutdown();
        }
        if (webSocketService) {
            webSocketService.close();
        }
        // Close server
        if (server) {
            await new Promise((resolve) => {
                server.close(() => resolve());
            });
        }
        // Clean up test directory
        if ((0, fs_1.existsSync)(TEST_REPOSITORY_PATH)) {
            (0, fs_1.rmSync)(TEST_REPOSITORY_PATH, { recursive: true, force: true });
        }
    });
    (0, globals_1.it)('should establish WebSocket connection and receive welcome message', async () => {
        // Wait for initial connection message
        await new Promise(resolve => setTimeout(resolve, 100));
        (0, globals_1.expect)(receivedMessages.length).toBeGreaterThan(0);
        const connectionMessage = receivedMessages.find(msg => msg.type === 'connection');
        (0, globals_1.expect)(connectionMessage).toMatchObject({
            type: 'connection',
            message: 'Connected to TaskMaster UI'
        });
    });
    (0, globals_1.it)('should monitor repository and receive REPOSITORY_ADDED event', async () => {
        // Add repository for monitoring
        realtimeService.addRepository(TEST_REPOSITORY_PATH);
        // Wait for repository added message
        await new Promise(resolve => setTimeout(resolve, 200));
        // Find the repository added message
        const repositoryAddedMessage = receivedMessages.find(msg => msg.type === 'broadcast' && msg.data?.event === 'REPOSITORY_ADDED');
        (0, globals_1.expect)(repositoryAddedMessage).toBeDefined();
        (0, globals_1.expect)(repositoryAddedMessage.data.data).toMatchObject({
            event: 'REPOSITORY_ADDED',
            repositoryPath: TEST_REPOSITORY_PATH
        });
    });
    (0, globals_1.it)('should detect file changes and broadcast TASKS_UPDATED event', async () => {
        // Add repository for monitoring
        realtimeService.addRepository(TEST_REPOSITORY_PATH);
        // Wait for repository to be added
        await new Promise(resolve => setTimeout(resolve, 200));
        // Clear messages received so far
        receivedMessages.length = 0;
        // Modify tasks.json file
        const updatedTasks = {
            'test-project': {
                tasks: [
                    {
                        id: 1,
                        title: 'Updated Test Task',
                        description: 'Task has been updated',
                        status: 'in-progress',
                        priority: 'high'
                    },
                    {
                        id: 2,
                        title: 'New Task',
                        description: 'Newly added task',
                        status: 'pending',
                        priority: 'medium'
                    }
                ]
            }
        };
        (0, fs_1.writeFileSync)(TASKS_FILE_PATH, JSON.stringify(updatedTasks, null, 2));
        // Wait for file change to be detected and debounced
        await new Promise(resolve => setTimeout(resolve, 300));
        // Find the tasks updated message
        const tasksUpdatedMessage = receivedMessages.find(msg => msg.type === 'broadcast' && msg.data?.event === 'TASKS_UPDATED');
        (0, globals_1.expect)(tasksUpdatedMessage).toBeDefined();
        (0, globals_1.expect)(tasksUpdatedMessage.data.data).toMatchObject({
            event: 'TASKS_UPDATED',
            repositoryPath: TEST_REPOSITORY_PATH,
            payload: {
                changeType: 'change',
                tasks: updatedTasks
            }
        });
    });
    (0, globals_1.it)('should handle multiple rapid file changes with debouncing', async () => {
        // Add repository for monitoring
        realtimeService.addRepository(TEST_REPOSITORY_PATH);
        // Wait for repository to be added
        await new Promise(resolve => setTimeout(resolve, 200));
        // Clear messages received so far
        receivedMessages.length = 0;
        // Make multiple rapid changes
        for (let i = 0; i < 5; i++) {
            const rapidTasks = {
                'test-project': {
                    tasks: [
                        {
                            id: 1,
                            title: `Rapid Update ${i}`,
                            description: `Rapid change number ${i}`,
                            status: 'pending',
                            priority: 'medium'
                        }
                    ]
                }
            };
            (0, fs_1.writeFileSync)(TASKS_FILE_PATH, JSON.stringify(rapidTasks, null, 2));
            // Small delay between changes
            await new Promise(resolve => setTimeout(resolve, 20));
        }
        // Wait for debouncing to complete
        await new Promise(resolve => setTimeout(resolve, 300));
        // Should receive only one TASKS_UPDATED message due to debouncing
        const tasksUpdatedMessages = receivedMessages.filter(msg => msg.type === 'broadcast' && msg.data?.event === 'TASKS_UPDATED');
        (0, globals_1.expect)(tasksUpdatedMessages).toHaveLength(1);
        (0, globals_1.expect)(tasksUpdatedMessages[0].data.data.payload.tasks['test-project'].tasks[0].title).toBe('Rapid Update 4');
    });
    (0, globals_1.it)('should handle repository removal and send REPOSITORY_REMOVED event', async () => {
        // Add repository for monitoring
        realtimeService.addRepository(TEST_REPOSITORY_PATH);
        // Wait for repository to be added
        await new Promise(resolve => setTimeout(resolve, 200));
        // Clear messages received so far
        receivedMessages.length = 0;
        // Remove repository from monitoring
        await realtimeService.removeRepository(TEST_REPOSITORY_PATH);
        // Wait for removal message
        await new Promise(resolve => setTimeout(resolve, 200));
        // Find the repository removed message
        const repositoryRemovedMessage = receivedMessages.find(msg => msg.type === 'broadcast' && msg.data?.event === 'REPOSITORY_REMOVED');
        (0, globals_1.expect)(repositoryRemovedMessage).toBeDefined();
        (0, globals_1.expect)(repositoryRemovedMessage.data.data).toMatchObject({
            event: 'REPOSITORY_REMOVED',
            repositoryPath: TEST_REPOSITORY_PATH
        });
    });
    (0, globals_1.it)('should provide accurate service statistics', async () => {
        // Add repository for monitoring
        realtimeService.addRepository(TEST_REPOSITORY_PATH);
        // Wait for repository to be added
        await new Promise(resolve => setTimeout(resolve, 200));
        // Get service statistics
        const stats = realtimeService.getStats();
        (0, globals_1.expect)(stats).toMatchObject({
            isInitialized: true,
            enabled: true,
            monitoredRepositories: 1,
            connectedClients: 1
        });
        (0, globals_1.expect)(stats.watcherStats).toMatchObject({
            watchedRepositories: 1,
            activeWatchers: 1
        });
    });
    (0, globals_1.it)('should handle WebSocket client disconnection gracefully', async () => {
        // Add repository for monitoring
        realtimeService.addRepository(TEST_REPOSITORY_PATH);
        // Wait for repository to be added
        await new Promise(resolve => setTimeout(resolve, 200));
        // Get initial client count
        const initialStats = realtimeService.getStats();
        (0, globals_1.expect)(initialStats.connectedClients).toBe(1);
        // Close client connection
        clientWebSocket.close();
        // Wait for disconnection to be processed
        await new Promise(resolve => setTimeout(resolve, 100));
        // Get updated client count
        const updatedStats = realtimeService.getStats();
        (0, globals_1.expect)(updatedStats.connectedClients).toBe(0);
    });
    (0, globals_1.it)('should handle errors gracefully and broadcast error messages', async () => {
        // Add repository for monitoring
        realtimeService.addRepository(TEST_REPOSITORY_PATH);
        // Wait for repository to be added
        await new Promise(resolve => setTimeout(resolve, 200));
        // Clear messages received so far
        receivedMessages.length = 0;
        // Create invalid JSON file to trigger error
        (0, fs_1.writeFileSync)(TASKS_FILE_PATH, 'invalid json content');
        // Wait for error to be processed
        await new Promise(resolve => setTimeout(resolve, 300));
        // Should still receive a TASKS_UPDATED message but without content
        const tasksUpdatedMessage = receivedMessages.find(msg => msg.type === 'broadcast' && msg.data?.event === 'TASKS_UPDATED');
        (0, globals_1.expect)(tasksUpdatedMessage).toBeDefined();
        (0, globals_1.expect)(tasksUpdatedMessage.data.data.payload.tasks).toBeUndefined();
    });
});
//# sourceMappingURL=e2e-realtime.test.js.map