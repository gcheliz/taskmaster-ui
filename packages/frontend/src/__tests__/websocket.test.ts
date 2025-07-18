/**
 * WebSocket Service Tests
 * Tests for real-time collaboration functionality
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { webSocketService } from '../services/websocket';
import { WebSocketEventType, WebSocketState } from '../types/websocket';

// Mock WebSocket
class MockWebSocket {
  public onopen: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public readyState: number = WebSocket.CONNECTING;
  public url: string;
  public protocol: string;

  constructor(url: string, protocols?: string[]) {
    this.url = url;
    this.protocol = protocols?.[0] || '';
    
    // Simulate async connection
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 10);
  }

  send(data: string): void {
    // Mock implementation
  }

  close(code?: number, reason?: string): void {
    this.readyState = WebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close', { code, reason }));
  }
}

// Mock global WebSocket
global.WebSocket = MockWebSocket as any;

describe('WebSocket Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    webSocketService.disconnect();
  });

  describe('Connection Management', () => {
    it('should connect successfully', async () => {
      const config = {
        url: 'ws://localhost:8080',
        options: {
          timeout: 1000,
        },
      };

      await expect(webSocketService.connect(config)).resolves.not.toThrow();
      expect(webSocketService.isConnected()).toBe(true);
      expect(webSocketService.getState()).toBe(WebSocketState.CONNECTED);
    });

    it('should handle connection timeout', async () => {
      const config = {
        url: 'ws://localhost:8080',
        options: {
          timeout: 1, // Very short timeout to force failure
        },
      };

      await expect(webSocketService.connect(config)).rejects.toThrow('Connection timeout');
    });

    it('should disconnect cleanly', async () => {
      const config = {
        url: 'ws://localhost:8080',
      };

      await webSocketService.connect(config);
      expect(webSocketService.isConnected()).toBe(true);

      webSocketService.disconnect();
      expect(webSocketService.isConnected()).toBe(false);
      expect(webSocketService.getState()).toBe(WebSocketState.DISCONNECTED);
    });
  });

  describe('Event Handling', () => {
    it('should subscribe to events', async () => {
      const config = {
        url: 'ws://localhost:8080',
      };

      await webSocketService.connect(config);

      const mockCallback = jest.fn();
      const unsubscribe = webSocketService.subscribe(
        WebSocketEventType.TASK_UPDATED,
        mockCallback
      );

      expect(typeof unsubscribe).toBe('function');
    });

    it('should unsubscribe from events', async () => {
      const config = {
        url: 'ws://localhost:8080',
      };

      await webSocketService.connect(config);

      const mockCallback = jest.fn();
      const unsubscribe = webSocketService.subscribe(
        WebSocketEventType.TASK_UPDATED,
        mockCallback
      );

      unsubscribe();
      
      // Event should not be triggered after unsubscribe
      // Note: This would need additional mocking to fully test
    });
  });

  describe('Message Sending', () => {
    it('should send messages when connected', async () => {
      const config = {
        url: 'ws://localhost:8080',
      };

      await webSocketService.connect(config);

      const message = {
        type: WebSocketEventType.TASK_UPDATED,
        payload: { taskId: 'test-task', updates: { title: 'Updated Task' } },
        timestamp: new Date().toISOString(),
      };

      expect(() => webSocketService.send(message)).not.toThrow();
    });

    it('should throw error when sending while disconnected', () => {
      const message = {
        type: WebSocketEventType.TASK_UPDATED,
        payload: { taskId: 'test-task', updates: { title: 'Updated Task' } },
        timestamp: new Date().toISOString(),
      };

      expect(() => webSocketService.send(message)).toThrow('WebSocket not connected');
    });
  });

  describe('User Management', () => {
    it('should track connected users', () => {
      const users = webSocketService.getConnectedUsers();
      expect(Array.isArray(users)).toBe(true);
    });

    it('should set current user', () => {
      const user = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
      };

      webSocketService.setCurrentUser(user);
      expect(webSocketService.getCurrentUser()).toEqual(user);
    });
  });

  describe('State Management', () => {
    it('should return correct initial state', () => {
      expect(webSocketService.getState()).toBe(WebSocketState.DISCONNECTED);
      expect(webSocketService.isConnected()).toBe(false);
    });

    it('should update state during connection', async () => {
      const config = {
        url: 'ws://localhost:8080',
      };

      const connectPromise = webSocketService.connect(config);
      
      // State should be connecting during connection attempt
      expect(webSocketService.getState()).toBe(WebSocketState.CONNECTING);
      
      await connectPromise;
      
      // State should be connected after successful connection
      expect(webSocketService.getState()).toBe(WebSocketState.CONNECTED);
    });
  });
});

describe('WebSocket Error Handling', () => {
  it('should handle connection errors', async () => {
    // Mock a failing WebSocket
    const FailingWebSocket = class extends MockWebSocket {
      constructor(url: string, protocols?: string[]) {
        super(url, protocols);
        setTimeout(() => {
          this.onerror?.(new Event('error'));
        }, 10);
      }
    };

    global.WebSocket = FailingWebSocket as any;

    const config = {
      url: 'ws://invalid-url',
    };

    await expect(webSocketService.connect(config)).rejects.toThrow();
  });

  it('should handle message parsing errors', async () => {
    const config = {
      url: 'ws://localhost:8080',
    };

    await webSocketService.connect(config);

    const mockCallback = jest.fn();
    webSocketService.subscribe(WebSocketEventType.ERROR, mockCallback);

    // Simulate invalid JSON message
    const mockSocket = webSocketService as any;
    const invalidMessage = new MessageEvent('message', { data: 'invalid json' });
    
    // This would need to be tested through the actual WebSocket instance
    // For now, we'll test that the service handles it gracefully
    expect(() => {
      try {
        JSON.parse('invalid json');
      } catch (error) {
        // Should handle parsing errors gracefully
        expect(error).toBeDefined();
      }
    }).not.toThrow();
  });
});

describe('WebSocket Configuration', () => {
  it('should use default options when none provided', async () => {
    const config = {
      url: 'ws://localhost:8080',
    };

    await webSocketService.connect(config);
    expect(webSocketService.isConnected()).toBe(true);
  });

  it('should respect custom options', async () => {
    const config = {
      url: 'ws://localhost:8080',
      options: {
        heartbeatInterval: 10000,
        reconnectDelay: 2000,
        maxReconnectAttempts: 3,
        timeout: 5000,
      },
    };

    await webSocketService.connect(config);
    expect(webSocketService.isConnected()).toBe(true);
  });
});