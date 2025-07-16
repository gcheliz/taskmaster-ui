// E2E Test for Real-time Task Synchronization
// Tests the complete flow from file changes to WebSocket notifications

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { WebSocketService } from '../services/websocket';
import { RealtimeTaskSyncService } from '../services/realtimeTaskSyncService';
import { FileWatcherService } from '../services/fileWatcherService';
import { Server } from 'http';
import { WebSocket } from 'ws';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import path from 'path';

const TEST_REPOSITORY_PATH = path.join(__dirname, 'test-repo');
const TASKS_FILE_PATH = path.join(TEST_REPOSITORY_PATH, '.taskmaster', 'tasks', 'tasks.json');

describe('E2E Real-time Task Synchronization', () => {
  let server: Server;
  let webSocketService: WebSocketService;
  let realtimeService: RealtimeTaskSyncService;
  let clientWebSocket: WebSocket;
  let receivedMessages: any[] = [];

  beforeEach(async () => {
    // Clean up any existing test directory
    if (existsSync(TEST_REPOSITORY_PATH)) {
      rmSync(TEST_REPOSITORY_PATH, { recursive: true, force: true });
    }

    // Create test repository structure
    mkdirSync(path.join(TEST_REPOSITORY_PATH, '.taskmaster', 'tasks'), { recursive: true });
    
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
    
    writeFileSync(TASKS_FILE_PATH, JSON.stringify(initialTasks, null, 2));

    // Create HTTP server
    server = new Server();
    
    // Initialize WebSocket service
    webSocketService = new WebSocketService();
    webSocketService.initialize(server);
    
    // Initialize real-time service with faster debouncing for testing
    realtimeService = new RealtimeTaskSyncService(webSocketService, {
      enabled: true,
      debounceMs: 100, // Faster for testing
      maxRepositories: 5
    });
    
    await realtimeService.initialize();

    // Start server
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        const port = typeof address === 'string' ? 0 : address?.port || 0;
        
        // Create client WebSocket connection
        clientWebSocket = new WebSocket(`ws://localhost:${port}`);
        
        clientWebSocket.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            receivedMessages.push(message);
            console.log('📨 Received message:', message);
          } catch (error) {
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

  afterEach(async () => {
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
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }

    // Clean up test directory
    if (existsSync(TEST_REPOSITORY_PATH)) {
      rmSync(TEST_REPOSITORY_PATH, { recursive: true, force: true });
    }
  });

  it('should establish WebSocket connection and receive welcome message', async () => {
    // Wait for initial connection message
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(receivedMessages.length).toBeGreaterThan(0);
    const connectionMessage = receivedMessages.find(msg => msg.type === 'connection');
    expect(connectionMessage).toMatchObject({
      type: 'connection',
      message: 'Connected to TaskMaster UI'
    });
  });

  it('should monitor repository and receive REPOSITORY_ADDED event', async () => {
    // Add repository for monitoring
    realtimeService.addRepository(TEST_REPOSITORY_PATH);
    
    // Wait for repository added message
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Find the repository added message
    const repositoryAddedMessage = receivedMessages.find(msg => 
      msg.type === 'broadcast' && msg.data?.event === 'REPOSITORY_ADDED'
    );
    
    expect(repositoryAddedMessage).toBeDefined();
    expect(repositoryAddedMessage.data.data).toMatchObject({
      event: 'REPOSITORY_ADDED',
      repositoryPath: TEST_REPOSITORY_PATH
    });
  });

  it('should detect file changes and broadcast TASKS_UPDATED event', async () => {
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
    
    writeFileSync(TASKS_FILE_PATH, JSON.stringify(updatedTasks, null, 2));
    
    // Wait for file change to be detected and debounced
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find the tasks updated message
    const tasksUpdatedMessage = receivedMessages.find(msg => 
      msg.type === 'broadcast' && msg.data?.event === 'TASKS_UPDATED'
    );
    
    expect(tasksUpdatedMessage).toBeDefined();
    expect(tasksUpdatedMessage.data.data).toMatchObject({
      event: 'TASKS_UPDATED',
      repositoryPath: TEST_REPOSITORY_PATH,
      payload: {
        changeType: 'change',
        tasks: updatedTasks
      }
    });
  });

  it('should handle multiple rapid file changes with debouncing', async () => {
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
      
      writeFileSync(TASKS_FILE_PATH, JSON.stringify(rapidTasks, null, 2));
      
      // Small delay between changes
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    
    // Wait for debouncing to complete
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Should receive only one TASKS_UPDATED message due to debouncing
    const tasksUpdatedMessages = receivedMessages.filter(msg => 
      msg.type === 'broadcast' && msg.data?.event === 'TASKS_UPDATED'
    );
    
    expect(tasksUpdatedMessages).toHaveLength(1);
    expect(tasksUpdatedMessages[0].data.data.payload.tasks['test-project'].tasks[0].title).toBe('Rapid Update 4');
  });

  it('should handle repository removal and send REPOSITORY_REMOVED event', async () => {
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
    const repositoryRemovedMessage = receivedMessages.find(msg => 
      msg.type === 'broadcast' && msg.data?.event === 'REPOSITORY_REMOVED'
    );
    
    expect(repositoryRemovedMessage).toBeDefined();
    expect(repositoryRemovedMessage.data.data).toMatchObject({
      event: 'REPOSITORY_REMOVED',
      repositoryPath: TEST_REPOSITORY_PATH
    });
  });

  it('should provide accurate service statistics', async () => {
    // Add repository for monitoring
    realtimeService.addRepository(TEST_REPOSITORY_PATH);
    
    // Wait for repository to be added
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Get service statistics
    const stats = realtimeService.getStats();
    
    expect(stats).toMatchObject({
      isInitialized: true,
      enabled: true,
      monitoredRepositories: 1,
      connectedClients: 1
    });
    
    expect(stats.watcherStats).toMatchObject({
      watchedRepositories: 1,
      activeWatchers: 1
    });
  });

  it('should handle WebSocket client disconnection gracefully', async () => {
    // Add repository for monitoring
    realtimeService.addRepository(TEST_REPOSITORY_PATH);
    
    // Wait for repository to be added
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Get initial client count
    const initialStats = realtimeService.getStats();
    expect(initialStats.connectedClients).toBe(1);
    
    // Close client connection
    clientWebSocket.close();
    
    // Wait for disconnection to be processed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get updated client count
    const updatedStats = realtimeService.getStats();
    expect(updatedStats.connectedClients).toBe(0);
  });

  it('should handle errors gracefully and broadcast error messages', async () => {
    // Add repository for monitoring
    realtimeService.addRepository(TEST_REPOSITORY_PATH);
    
    // Wait for repository to be added
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Clear messages received so far
    receivedMessages.length = 0;
    
    // Create invalid JSON file to trigger error
    writeFileSync(TASKS_FILE_PATH, 'invalid json content');
    
    // Wait for error to be processed
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Should still receive a TASKS_UPDATED message but without content
    const tasksUpdatedMessage = receivedMessages.find(msg => 
      msg.type === 'broadcast' && msg.data?.event === 'TASKS_UPDATED'
    );
    
    expect(tasksUpdatedMessage).toBeDefined();
    expect(tasksUpdatedMessage.data.data.payload.tasks).toBeUndefined();
  });
});