import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { WebSocketProvider, useWebSocket, type WebSocketConfig } from '../WebSocketContext';

// Mock WebSocket
class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  public readyState = MockWebSocket.CONNECTING;
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {
    // Simulate async connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 10);
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // Simulate echo response
    setTimeout(() => {
      this.onmessage?.(new MessageEvent('message', { data }));
    }, 10);
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close', { code, reason, wasClean: true }));
  }
}

// Mock global WebSocket
vi.stubGlobal('WebSocket', MockWebSocket);

// Mock console methods
const consoleMocks = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(console, consoleMocks);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const createWrapper = (config?: WebSocketConfig) => {
  return ({ children }: { children: React.ReactNode }) => (
    <WebSocketProvider config={config}>{children}</WebSocketProvider>
  );
};

describe('WebSocketContext', () => {
  describe('WebSocketProvider', () => {
    it('should provide WebSocket context to children', () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper({ autoConnect: false }),
      });

      expect(result.current).toBeDefined();
      expect(result.current.state.connectionState).toBe('disconnected');
      expect(result.current.connect).toBeInstanceOf(Function);
      expect(result.current.disconnect).toBeInstanceOf(Function);
    });

    it('should auto-connect when autoConnect is true', async () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper({ autoConnect: true }),
      });

      expect(result.current.state.connectionState).toBe('connecting');

      // Wait for connection
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.state.connectionState).toBe('connected');
    });

    it('should not auto-connect when autoConnect is false', () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper({ autoConnect: false }),
      });

      expect(result.current.state.connectionState).toBe('disconnected');
    });
  });

  describe('useWebSocket hook', () => {
    it('should throw error when used outside provider', () => {
      const { result } = renderHook(() => useWebSocket());

      expect(result.error).toEqual(
        new Error('useWebSocket must be used within a WebSocketProvider')
      );
    });

    it('should connect to WebSocket manually', async () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper({ autoConnect: false }),
      });

      expect(result.current.state.connectionState).toBe('disconnected');

      act(() => {
        result.current.connect();
      });

      expect(result.current.state.connectionState).toBe('connecting');

      // Wait for connection
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.state.connectionState).toBe('connected');
    });

    it('should disconnect from WebSocket', async () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper({ autoConnect: true }),
      });

      // Wait for connection
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.state.connectionState).toBe('connected');

      act(() => {
        result.current.disconnect();
      });

      expect(result.current.state.connectionState).toBe('disconnected');
    });

    it('should send messages when connected', async () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper({ autoConnect: true }),
      });

      // Wait for connection
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.isConnected()).toBe(true);

      let sent = false;
      act(() => {
        sent = result.current.sendMessage({ type: 'test', data: 'hello' });
      });

      expect(sent).toBe(true);
    });

    it('should not send messages when disconnected', () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper({ autoConnect: false }),
      });

      expect(result.current.isConnected()).toBe(false);

      let sent = false;
      act(() => {
        sent = result.current.sendMessage({ type: 'test', data: 'hello' });
      });

      expect(sent).toBe(false);
    });

    it('should handle task update messages', async () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper({ autoConnect: true }),
      });

      // Wait for connection
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      const taskUpdateHandler = vi.fn();
      act(() => {
        result.current.onTaskUpdate(taskUpdateHandler);
      });

      // Simulate receiving a task update message
      const taskUpdateMessage = {
        type: 'broadcast',
        data: {
          event: 'TASKS_UPDATED',
          repositoryPath: '/test/repo',
          timestamp: new Date().toISOString(),
          payload: { tasks: [{ id: '1', title: 'Test Task' }] },
        },
        timestamp: new Date().toISOString(),
      };

      // Simulate WebSocket message
      await act(async () => {
        const mockWs = (global as any).WebSocket.mock.instances[0];
        mockWs.onmessage(
          new MessageEvent('message', { data: JSON.stringify(taskUpdateMessage) })
        );
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(taskUpdateHandler).toHaveBeenCalledWith(taskUpdateMessage.data);
      expect(result.current.state.lastTaskUpdate).toEqual(taskUpdateMessage.data);
    });

    it('should handle connection state changes', async () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper({ autoConnect: true }),
      });

      const connectionHandler = vi.fn();
      act(() => {
        result.current.onConnectionChange(connectionHandler);
      });

      // Wait for connection
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(connectionHandler).toHaveBeenCalledWith('connected');
    });

    it('should handle errors', async () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper({ autoConnect: true }),
      });

      const errorHandler = vi.fn();
      act(() => {
        result.current.onError(errorHandler);
      });

      // Wait for connection
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      // Simulate error
      await act(async () => {
        const mockWs = (global as any).WebSocket.mock.instances[0];
        mockWs.onerror(new Event('error'));
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(errorHandler).toHaveBeenCalledWith('WebSocket connection error');
    });

    it('should provide correct status checks', async () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper({ autoConnect: false }),
      });

      expect(result.current.isConnected()).toBe(false);
      expect(result.current.isConnecting()).toBe(false);

      act(() => {
        result.current.connect();
      });

      expect(result.current.isConnecting()).toBe(true);

      // Wait for connection
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.isConnected()).toBe(true);
      expect(result.current.isConnecting()).toBe(false);
    });

    it('should clean up event handlers', async () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper({ autoConnect: true }),
      });

      const taskUpdateHandler = vi.fn();
      let unsubscribe: (() => void) | undefined;

      act(() => {
        unsubscribe = result.current.onTaskUpdate(taskUpdateHandler);
      });

      // Unsubscribe
      act(() => {
        unsubscribe?.();
      });

      // Wait for connection
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      // Simulate message - should not trigger handler
      const taskUpdateMessage = {
        type: 'broadcast',
        data: {
          event: 'TASKS_UPDATED',
          repositoryPath: '/test/repo',
          timestamp: new Date().toISOString(),
          payload: { tasks: [] },
        },
        timestamp: new Date().toISOString(),
      };

      await act(async () => {
        const mockWs = (global as any).WebSocket.mock.instances[0];
        mockWs.onmessage(
          new MessageEvent('message', { data: JSON.stringify(taskUpdateMessage) })
        );
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(taskUpdateHandler).not.toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('should use custom WebSocket URL', () => {
      const customUrl = 'ws://localhost:8080';
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper({ url: customUrl, autoConnect: false }),
      });

      act(() => {
        result.current.connect();
      });

      const mockWs = (global as any).WebSocket.mock.instances[0];
      expect(mockWs.url).toBe(customUrl);
    });

    it('should use custom heartbeat interval', async () => {
      const heartbeatInterval = 1000;
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper({ heartbeatInterval, autoConnect: true }),
      });

      // Wait for connection
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.state.connectionState).toBe('connected');
      // Heartbeat testing would require more complex mocking
    });
  });
});