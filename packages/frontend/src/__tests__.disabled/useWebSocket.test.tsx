/**
 * WebSocket React Hooks Tests
 * Tests for WebSocket integration hooks
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useWebSocket, useTaskCollaboration } from '../hooks/useWebSocket';
import { WebSocketState, WebSocketEventType } from '../types/websocket';
import type { Task } from '../types/websocket';

// Mock WebSocket service
jest.mock('../services/websocket', () => ({
  webSocketService: {
    connect: jest.fn().mockResolvedValue(Promise.resolve()),
    disconnect: jest.fn(),
    send: jest.fn(),
    subscribe: jest.fn().mockReturnValue(jest.fn()),
    getState: jest.fn().mockReturnValue(WebSocketState.DISCONNECTED),
    isConnected: jest.fn().mockReturnValue(false),
    getConnectedUsers: jest.fn().mockReturnValue([]),
    getCurrentUser: jest.fn().mockReturnValue(null),
    setCurrentUser: jest.fn(),
  },
}));

describe('useWebSocket Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useWebSocket());

    expect(result.current.state).toBe(WebSocketState.DISCONNECTED);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.connectedUsers).toEqual([]);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.send).toBe('function');
    expect(typeof result.current.subscribe).toBe('function');
    expect(typeof result.current.reconnect).toBe('function');
  });

  it('should not auto-connect when autoConnect is false', () => {
    const { webSocketService } = require('../services/websocket');
    
    renderHook(() => useWebSocket({
      url: 'ws://localhost:8080',
      autoConnect: false,
    }));

    expect(webSocketService.connect).not.toHaveBeenCalled();
  });

  it('should handle send function correctly', () => {
    const { webSocketService } = require('../services/websocket');
    const { result } = renderHook(() => useWebSocket());

    const message = {
      type: WebSocketEventType.CONNECT,
      payload: { data: 'test' },
      timestamp: new Date().toISOString(),
    };

    act(() => {
      result.current.send(message);
    });

    expect(webSocketService.send).toHaveBeenCalledWith(message);
  });

  it('should handle send errors', () => {
    const { webSocketService } = require('../services/websocket');
    webSocketService.send.mockImplementation(() => {
      throw new Error('Send failed');
    });

    const { result } = renderHook(() => useWebSocket());

    const message = {
      type: WebSocketEventType.CONNECT,
      payload: { data: 'test' },
      timestamp: new Date().toISOString(),
    };

    act(() => {
      result.current.send(message);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Send failed');
  });
});

describe('useTaskCollaboration Hook', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 'medium',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      position: 0,
      column: 'pending',
      tags: ['test'],
      complexity: 3,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with provided tasks', () => {
    const { result } = renderHook(() => useTaskCollaboration(mockTasks));

    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.connectedUsers).toEqual([]);
    expect(result.current.lastUpdate).toBe(null);
  });

  it('should provide task manipulation functions', () => {
    const { result } = renderHook(() => useTaskCollaboration(mockTasks));

    expect(typeof result.current.updateTask).toBe('function');
    expect(typeof result.current.moveTask).toBe('function');
    expect(typeof result.current.createTask).toBe('function');
    expect(typeof result.current.deleteTask).toBe('function');
  });

  it('should handle updateTask correctly', () => {
    const { webSocketService } = require('../services/websocket');
    webSocketService.isConnected.mockReturnValue(true);
    webSocketService.getCurrentUser.mockReturnValue({ id: 'user-1', name: 'Test User' });

    const { result } = renderHook(() => useTaskCollaboration(mockTasks));

    act(() => {
      result.current.updateTask('task-1', { title: 'Updated Task' });
    });

    // Task should be updated locally
    expect(result.current.tasks[0].title).toBe('Updated Task');
    
    // Should send update to WebSocket
    expect(webSocketService.send).toHaveBeenCalled();
  });

  it('should handle moveTask correctly', () => {
    const { webSocketService } = require('../services/websocket');
    webSocketService.isConnected.mockReturnValue(true);
    webSocketService.getCurrentUser.mockReturnValue({ id: 'user-1', name: 'Test User' });

    const { result } = renderHook(() => useTaskCollaboration(mockTasks));

    act(() => {
      result.current.moveTask('task-1', 'in-progress', 1);
    });

    // Task should be moved locally
    expect(result.current.tasks[0].status).toBe('in-progress');
    expect(result.current.tasks[0].position).toBe(1);
    
    // Should send move event to WebSocket
    expect(webSocketService.send).toHaveBeenCalled();
  });

  it('should handle createTask correctly', () => {
    const { webSocketService } = require('../services/websocket');
    webSocketService.isConnected.mockReturnValue(true);
    webSocketService.getCurrentUser.mockReturnValue({ id: 'user-1', name: 'Test User' });

    const { result } = renderHook(() => useTaskCollaboration([]));

    const newTaskData = {
      title: 'New Task',
      description: 'New Description',
      status: 'pending' as const,
      priority: 'high' as const,
      position: 0,
      column: 'pending',
      tags: ['new'],
      complexity: 5,
    };

    act(() => {
      result.current.createTask(newTaskData);
    });

    // Task should be added locally
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('New Task');
    
    // Should send create event to WebSocket
    expect(webSocketService.send).toHaveBeenCalled();
  });

  it('should handle deleteTask correctly', () => {
    const { webSocketService } = require('../services/websocket');
    webSocketService.isConnected.mockReturnValue(true);
    webSocketService.getCurrentUser.mockReturnValue({ id: 'user-1', name: 'Test User' });

    const { result } = renderHook(() => useTaskCollaboration(mockTasks));

    act(() => {
      result.current.deleteTask('task-1');
    });

    // Task should be removed locally
    expect(result.current.tasks).toHaveLength(0);
    
    // Should send delete event to WebSocket
    expect(webSocketService.send).toHaveBeenCalled();
  });

  it('should handle errors when not connected', () => {
    const { webSocketService } = require('../services/websocket');
    webSocketService.isConnected.mockReturnValue(false);

    const { result } = renderHook(() => useTaskCollaboration(mockTasks));

    act(() => {
      result.current.updateTask('task-1', { title: 'Updated Task' });
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Not connected to WebSocket');
  });
});

describe('Hook Integration', () => {
  it('should work together in a realistic scenario', () => {
    const { webSocketService } = require('../services/websocket');
    webSocketService.isConnected.mockReturnValue(true);
    webSocketService.getCurrentUser.mockReturnValue({ id: 'user-1', name: 'Test User' });

    const mockTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Integration Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        position: 0,
        column: 'pending',
        tags: ['integration'],
        complexity: 4,
      },
    ];

    const { result: webSocketResult } = renderHook(() => useWebSocket({
      url: 'ws://localhost:8080',
      autoConnect: false,
    }));

    const { result: taskResult } = renderHook(() => useTaskCollaboration(mockTasks));

    // Should be able to use both hooks together
    expect(webSocketResult.current.isConnected).toBe(false);
    expect(taskResult.current.tasks).toHaveLength(1);

    // Should be able to interact with tasks
    act(() => {
      taskResult.current.updateTask('task-1', { title: 'Updated via Integration' });
    });

    expect(taskResult.current.tasks[0].title).toBe('Updated via Integration');
  });
});