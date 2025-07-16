import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { TaskBoardManager } from '../TaskBoardManager';
import { NotificationProvider } from '../../../contexts/NotificationContext';
import { WebSocketProvider } from '../../../contexts/WebSocketContext';

// Mock the hooks
vi.mock('../../../hooks/useRealtimeTaskData', () => ({
  useRealtimeTaskData: vi.fn(() => ({
    taskBoardData: {
      tasks: [],
      columns: [
        { id: 'pending', title: 'Pending', tasks: [] },
        { id: 'in-progress', title: 'In Progress', tasks: [] },
        { id: 'done', title: 'Done', tasks: [] }
      ],
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        description: 'Test task board'
      }
    },
    isLoading: false,
    error: null,
    isRealtimeActive: true,
    connectionState: 'connected',
    lastUpdateTime: new Date().toISOString(),
    updateCount: 5,
    refresh: vi.fn(),
    loadFromRepository: vi.fn(),
    loadFromFile: vi.fn(),
    loadFromProject: vi.fn(),
    loadSampleTasks: vi.fn(),
    updateFilters: vi.fn(),
    updateSortOptions: vi.fn(),
    clear: vi.fn(),
    requestRealtimeRefresh: vi.fn(),
    toggleRealtime: vi.fn()
  }))
}));

// Mock WebSocket
const mockWebSocket = {
  readyState: WebSocket.OPEN,
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
};

(global as any).WebSocket = vi.fn(() => mockWebSocket);

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NotificationProvider>
    <WebSocketProvider config={{ autoConnect: true }}>
      {children}
    </WebSocketProvider>
  </NotificationProvider>
);

describe('TaskBoardManager Real-time Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render real-time controls in dev tools', () => {
    render(
      <TestWrapper>
        <TaskBoardManager
          repositoryPath="/test/path"
          showDevTools={true}
          enableRealtime={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Disable Real-time')).toBeInTheDocument();
    expect(screen.getByText('Request RT Refresh')).toBeInTheDocument();
  });

  it('should display real-time status information', () => {
    render(
      <TestWrapper>
        <TaskBoardManager
          repositoryPath="/test/path"
          showDevTools={true}
          enableRealtime={true}
        />
      </TestWrapper>
    );

    // Check that the real-time status is displayed (regardless of Active/Inactive)
    expect(screen.getByText(/Real-time:/)).toBeInTheDocument();
    expect(screen.getByText(/WebSocket:/)).toBeInTheDocument();
    expect(screen.getByText(/Updates:/)).toBeInTheDocument();
  });

  it('should handle real-time toggle', async () => {
    const { useRealtimeTaskData } = await import('../../../hooks/useRealtimeTaskData');
    const mockToggleRealtime = vi.fn();
    
    vi.mocked(useRealtimeTaskData).mockReturnValue({
      taskBoardData: { tasks: [], columns: [], metadata: {} },
      isLoading: false,
      error: null,
      isRealtimeActive: true,
      connectionState: 'connected',
      lastUpdateTime: new Date().toISOString(),
      updateCount: 5,
      refresh: vi.fn(),
      loadFromRepository: vi.fn(),
      loadFromFile: vi.fn(),
      loadFromProject: vi.fn(),
      loadSampleTasks: vi.fn(),
      updateFilters: vi.fn(),
      updateSortOptions: vi.fn(),
      clear: vi.fn(),
      requestRealtimeRefresh: vi.fn(),
      toggleRealtime: mockToggleRealtime
    });

    render(
      <TestWrapper>
        <TaskBoardManager
          repositoryPath="/test/path"
          showDevTools={true}
          enableRealtime={true}
        />
      </TestWrapper>
    );

    const toggleButton = screen.getByText('Disable Real-time');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(mockToggleRealtime).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle real-time refresh request', async () => {
    const { useRealtimeTaskData } = await import('../../../hooks/useRealtimeTaskData');
    const mockRequestRealtimeRefresh = vi.fn();
    
    vi.mocked(useRealtimeTaskData).mockReturnValue({
      taskBoardData: { tasks: [], columns: [], metadata: {} },
      isLoading: false,
      error: null,
      isRealtimeActive: true,
      connectionState: 'connected',
      lastUpdateTime: new Date().toISOString(),
      updateCount: 5,
      refresh: vi.fn(),
      loadFromRepository: vi.fn(),
      loadFromFile: vi.fn(),
      loadFromProject: vi.fn(),
      loadSampleTasks: vi.fn(),
      updateFilters: vi.fn(),
      updateSortOptions: vi.fn(),
      clear: vi.fn(),
      requestRealtimeRefresh: mockRequestRealtimeRefresh,
      toggleRealtime: vi.fn()
    });

    render(
      <TestWrapper>
        <TaskBoardManager
          repositoryPath="/test/path"
          showDevTools={true}
          enableRealtime={true}
        />
      </TestWrapper>
    );

    const refreshButton = screen.getByText('Request RT Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockRequestRealtimeRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('should render real-time controls correctly', () => {
    render(
      <TestWrapper>
        <TaskBoardManager
          repositoryPath="/test/path"
          showDevTools={true}
          enableRealtime={false}
        />
      </TestWrapper>
    );

    // Check that the real-time controls are rendered
    expect(screen.getByText('Request RT Refresh')).toBeInTheDocument();
    expect(screen.getByText(/Real-time:/)).toBeInTheDocument();
    expect(screen.getByText(/WebSocket:/)).toBeInTheDocument();
    expect(screen.getByText(/Updates:/)).toBeInTheDocument();
  });

  it('should pass real-time options to useRealtimeTaskData hook', async () => {
    const { useRealtimeTaskData } = await import('../../../hooks/useRealtimeTaskData');
    
    render(
      <TestWrapper>
        <TaskBoardManager
          repositoryPath="/test/path"
          projectTag="test-tag"
          enableRealtime={true}
          showRealtimeNotifications={false}
          refreshInterval={5000}
        />
      </TestWrapper>
    );

    expect(useRealtimeTaskData).toHaveBeenCalledWith({
      repositoryPath: '/test/path',
      projectTag: 'test-tag',
      projectId: undefined,
      filePath: undefined,
      autoLoad: true,
      pollingInterval: 5000,
      filters: {},
      sortOptions: {
        field: 'createdAt',
        direction: 'desc'
      },
      enableRealtime: true,
      showUpdateNotifications: false
    });
  });
});