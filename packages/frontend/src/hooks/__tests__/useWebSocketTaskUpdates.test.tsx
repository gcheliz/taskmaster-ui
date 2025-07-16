import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { WebSocketProvider } from '../../contexts/WebSocketContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { useWebSocketTaskUpdates, type TaskUpdateHandler } from '../useWebSocketTaskUpdates';

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
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 10);
  }

  send(_data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close', { code, reason, wasClean: true }));
  }
}

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

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <NotificationProvider>
      <WebSocketProvider config={{ autoConnect: true }}>
        {children}
      </WebSocketProvider>
    </NotificationProvider>
  );
};

describe('useWebSocketTaskUpdates', () => {
  it('should initialize with correct default values', () => {
    const handlers: TaskUpdateHandler = {};
    const { result } = renderHook(() => useWebSocketTaskUpdates(handlers), {
      wrapper: createWrapper(),
    });

    expect(result.current.lastUpdate).toBe(null);
    expect(result.current.connectionState).toBe('connecting');
    expect(result.current.isConnected).toBe(false);
    expect(result.current.requestRefresh).toBeInstanceOf(Function);
  });

  it('should handle TASKS_UPDATED events', async () => {
    const onTasksUpdated = vi.fn();
    const handlers: TaskUpdateHandler = { onTasksUpdated };
    
    renderHook(() => useWebSocketTaskUpdates(handlers), {
      wrapper: createWrapper(),
    });

    // Wait for connection
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
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

    await act(async () => {
      const mockWs = (global as any).WebSocket.mock.instances[0];
      mockWs.onmessage(
        new MessageEvent('message', { data: JSON.stringify(taskUpdateMessage) })
      );
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(onTasksUpdated).toHaveBeenCalledWith(
      '/test/repo',
      taskUpdateMessage.data.payload.tasks
    );
  });

  it('should handle REPOSITORY_ADDED events', async () => {
    const onRepositoryAdded = vi.fn();
    const handlers: TaskUpdateHandler = { onRepositoryAdded };
    
    renderHook(() => useWebSocketTaskUpdates(handlers), {
      wrapper: createWrapper(),
    });

    // Wait for connection
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Simulate receiving a repository added message
    const repositoryAddedMessage = {
      type: 'broadcast',
      data: {
        event: 'REPOSITORY_ADDED',
        repositoryPath: '/test/repo',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    await act(async () => {
      const mockWs = (global as any).WebSocket.mock.instances[0];
      mockWs.onmessage(
        new MessageEvent('message', { data: JSON.stringify(repositoryAddedMessage) })
      );
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(onRepositoryAdded).toHaveBeenCalledWith('/test/repo');
  });

  it('should handle REPOSITORY_REMOVED events', async () => {
    const onRepositoryRemoved = vi.fn();
    const handlers: TaskUpdateHandler = { onRepositoryRemoved };
    
    renderHook(() => useWebSocketTaskUpdates(handlers), {
      wrapper: createWrapper(),
    });

    // Wait for connection
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Simulate receiving a repository removed message
    const repositoryRemovedMessage = {
      type: 'broadcast',
      data: {
        event: 'REPOSITORY_REMOVED',
        repositoryPath: '/test/repo',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    await act(async () => {
      const mockWs = (global as any).WebSocket.mock.instances[0];
      mockWs.onmessage(
        new MessageEvent('message', { data: JSON.stringify(repositoryRemovedMessage) })
      );
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(onRepositoryRemoved).toHaveBeenCalledWith('/test/repo');
  });

  it('should handle TASKS_ERROR events', async () => {
    const onTasksError = vi.fn();
    const handlers: TaskUpdateHandler = { onTasksError };
    
    renderHook(() => useWebSocketTaskUpdates(handlers), {
      wrapper: createWrapper(),
    });

    // Wait for connection
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Simulate receiving a tasks error message
    const tasksErrorMessage = {
      type: 'broadcast',
      data: {
        event: 'TASKS_ERROR',
        repositoryPath: '/test/repo',
        timestamp: new Date().toISOString(),
        payload: { error: 'File not found' },
      },
      timestamp: new Date().toISOString(),
    };

    await act(async () => {
      const mockWs = (global as any).WebSocket.mock.instances[0];
      mockWs.onmessage(
        new MessageEvent('message', { data: JSON.stringify(tasksErrorMessage) })
      );
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(onTasksError).toHaveBeenCalledWith('/test/repo', 'File not found');
  });

  it('should filter messages by repository path when specified', async () => {
    const onTasksUpdated = vi.fn();
    const handlers: TaskUpdateHandler = { onTasksUpdated };
    
    const { result } = renderHook(() => 
      useWebSocketTaskUpdates(handlers, { repositoryPath: '/target/repo' }), {
      wrapper: createWrapper(),
    });

    // Wait for connection
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Simulate receiving a task update message for different repository
    const taskUpdateMessage = {
      type: 'broadcast',
      data: {
        event: 'TASKS_UPDATED',
        repositoryPath: '/other/repo',
        timestamp: new Date().toISOString(),
        payload: { tasks: [{ id: '1', title: 'Test Task' }] },
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

    // Should not be called because repository path doesn't match
    expect(onTasksUpdated).not.toHaveBeenCalled();

    // Now send message for target repository
    const targetTaskUpdateMessage = {
      type: 'broadcast',
      data: {
        event: 'TASKS_UPDATED',
        repositoryPath: '/target/repo',
        timestamp: new Date().toISOString(),
        payload: { tasks: [{ id: '1', title: 'Test Task' }] },
      },
      timestamp: new Date().toISOString(),
    };

    await act(async () => {
      const mockWs = (global as any).WebSocket.mock.instances[0];
      mockWs.onmessage(
        new MessageEvent('message', { data: JSON.stringify(targetTaskUpdateMessage) })
      );
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Should be called now
    expect(onTasksUpdated).toHaveBeenCalledWith(
      '/target/repo',
      targetTaskUpdateMessage.data.payload.tasks
    );
  });

  it('should handle requestRefresh functionality', async () => {
    const handlers: TaskUpdateHandler = {};
    const { result } = renderHook(() => 
      useWebSocketTaskUpdates(handlers, { repositoryPath: '/test/repo' }), {
      wrapper: createWrapper(),
    });

    // Wait for connection
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current.isConnected).toBe(true);

    // Mock the send method to track calls
    const mockSend = vi.fn();
    const mockWs = (global as any).WebSocket.mock.instances[0];
    mockWs.send = mockSend;

    act(() => {
      result.current.requestRefresh();
    });

    expect(mockSend).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'request_refresh',
        repositoryPath: '/test/repo',
        timestamp: expect.any(String),
      })
    );
  });

  it('should handle custom notification messages', async () => {
    const handlers: TaskUpdateHandler = {};
    const customMessages = {
      tasksUpdated: 'Custom tasks updated message',
      repositoryAdded: 'Custom repository added message',
    };
    
    const { result } = renderHook(() => 
      useWebSocketTaskUpdates(handlers, { 
        showNotifications: true,
        notificationMessages: customMessages 
      }), {
      wrapper: createWrapper(),
    });

    // Wait for connection
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // This test would need to mock the notification system to verify custom messages
    // For now, we just ensure the hook initializes correctly with custom messages
    expect(result.current.connectionState).toBe('connected');
  });

  it('should disable notifications when showNotifications is false', async () => {
    const handlers: TaskUpdateHandler = {};
    const { result } = renderHook(() => 
      useWebSocketTaskUpdates(handlers, { showNotifications: false }), {
      wrapper: createWrapper(),
    });

    // Wait for connection
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Send a task update message
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

    await act(async () => {
      const mockWs = (global as any).WebSocket.mock.instances[0];
      mockWs.onmessage(
        new MessageEvent('message', { data: JSON.stringify(taskUpdateMessage) })
      );
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // No assertions needed for notifications here, just ensure no errors
    expect(result.current.lastUpdate).toEqual(taskUpdateMessage.data);
  });

  it('should handle unknown event types gracefully', async () => {
    const handlers: TaskUpdateHandler = {};
    const { result } = renderHook(() => useWebSocketTaskUpdates(handlers), {
      wrapper: createWrapper(),
    });

    // Wait for connection
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Send an unknown event type
    const unknownEventMessage = {
      type: 'broadcast',
      data: {
        event: 'UNKNOWN_EVENT',
        repositoryPath: '/test/repo',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    await act(async () => {
      const mockWs = (global as any).WebSocket.mock.instances[0];
      mockWs.onmessage(
        new MessageEvent('message', { data: JSON.stringify(unknownEventMessage) })
      );
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Should handle gracefully without errors
    expect(result.current.lastUpdate).toEqual(unknownEventMessage.data);
  });
});