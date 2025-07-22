import { ApiError } from './api';

export interface TaskMasterTerminalSession {
  id: string;
  workingDirectory: string;
  repositoryPath?: string;
  projectTag?: string;
  shell: string;
  isActive: boolean;
  taskMasterIntegrated: boolean;
  createdAt: string;
  lastActivity: string;
  commandHistoryLength: number;
  environment?: string[];
}

export interface TaskMasterTerminalWebSocketMessage {
  type: 'create-session' | 'command' | 'input' | 'resize' | 'kill' | 'close-session';
  sessionId?: string;
  data?: any;
}

export interface TaskMasterTerminalWebSocketResponse {
  type: 'session-created' | 'output' | 'session-closed' | 'error' | 'suggestions';
  sessionId?: string;
  data?: any;
}

export interface CreateTaskMasterTerminalSessionRequest {
  workingDirectory?: string;
  repositoryPath?: string;
  projectTag?: string;
}

export interface CreateTaskMasterTerminalSessionResponse {
  sessionId: string;
  message: string;
}

export interface ExecuteTaskMasterCommandRequest {
  command: string;
}

export interface TaskMasterCommandSuggestionsRequest {
  partialCommand: string;
}

export interface TaskMasterCommandSuggestionsResponse {
  suggestions: string[];
  count: number;
  partialCommand: string;
}

export interface TaskMasterCommandHistoryResponse {
  history: string[];
  totalCount: number;
  limit: number;
  offset: number;
}

/**
 * TaskMaster Terminal Service
 * 
 * Frontend service for TaskMaster terminal integration with enhanced CLI features.
 * Provides both REST API and WebSocket communication for real-time terminal interaction.
 */
export class TaskMasterTerminalService {
  private baseUrl: string;
  private websocketUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.websocketUrl = this.getWebSocketUrl();
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/taskmaster-terminal-ws`;
  }

  /**
   * Create a new TaskMaster terminal session
   */
  async createSession(
    request: CreateTaskMasterTerminalSessionRequest
  ): Promise<CreateTaskMasterTerminalSessionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/taskmaster-terminal/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new ApiError(
          'TASKMASTER_TERMINAL_ERROR',
          `Failed to create TaskMaster terminal session: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'NETWORK_ERROR',
        'Failed to create TaskMaster terminal session',
        500
      );
    }
  }

  /**
   * Get TaskMaster terminal session information
   */
  async getSession(sessionId: string): Promise<TaskMasterTerminalSession> {
    try {
      const response = await fetch(
        `${this.baseUrl}/taskmaster-terminal/sessions/${sessionId}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new ApiError(
          'TASKMASTER_TERMINAL_ERROR',
          `Failed to get TaskMaster terminal session: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'NETWORK_ERROR',
        'Failed to get TaskMaster terminal session',
        500
      );
    }
  }

  /**
   * Get all active TaskMaster terminal sessions
   */
  async getActiveSessions(): Promise<TaskMasterTerminalSession[]> {
    try {
      const response = await fetch(`${this.baseUrl}/taskmaster-terminal/sessions`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new ApiError(
          'TASKMASTER_TERMINAL_ERROR',
          `Failed to get active TaskMaster terminal sessions: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      return data.data.sessions || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'NETWORK_ERROR',
        'Failed to get active TaskMaster terminal sessions',
        500
      );
    }
  }

  /**
   * Execute a command in a TaskMaster terminal session
   */
  async executeCommand(
    sessionId: string,
    request: ExecuteTaskMasterCommandRequest
  ): Promise<{ message: string; isTaskMasterCommand: boolean }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/taskmaster-terminal/sessions/${sessionId}/commands`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new ApiError(
          'TASKMASTER_TERMINAL_ERROR',
          `Failed to execute command: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'NETWORK_ERROR',
        'Failed to execute command',
        500
      );
    }
  }

  /**
   * Get TaskMaster command suggestions
   */
  async getCommandSuggestions(
    sessionId: string,
    request: TaskMasterCommandSuggestionsRequest
  ): Promise<TaskMasterCommandSuggestionsResponse> {
    try {
      const params = new URLSearchParams({
        partialCommand: request.partialCommand,
      });

      const response = await fetch(
        `${this.baseUrl}/taskmaster-terminal/sessions/${sessionId}/suggestions?${params}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new ApiError(
          'TASKMASTER_TERMINAL_ERROR',
          `Failed to get command suggestions: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'NETWORK_ERROR',
        'Failed to get command suggestions',
        500
      );
    }
  }

  /**
   * Get command history for a session
   */
  async getCommandHistory(
    sessionId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<TaskMasterCommandHistoryResponse> {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());

      const response = await fetch(
        `${this.baseUrl}/taskmaster-terminal/sessions/${sessionId}/history?${params}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new ApiError(
          'TASKMASTER_TERMINAL_ERROR',
          `Failed to get command history: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'NETWORK_ERROR',
        'Failed to get command history',
        500
      );
    }
  }

  /**
   * Send input to a running process
   */
  async sendInput(sessionId: string, input: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/taskmaster-terminal/sessions/${sessionId}/input`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input }),
        }
      );

      if (!response.ok) {
        throw new ApiError(
          'TASKMASTER_TERMINAL_ERROR',
          `Failed to send input: ${response.statusText}`,
          response.status
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'NETWORK_ERROR',
        'Failed to send input',
        500
      );
    }
  }

  /**
   * Kill a running process
   */
  async killProcess(sessionId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/taskmaster-terminal/sessions/${sessionId}/kill`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new ApiError(
          'TASKMASTER_TERMINAL_ERROR',
          `Failed to kill process: ${response.statusText}`,
          response.status
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'NETWORK_ERROR',
        'Failed to kill process',
        500
      );
    }
  }

  /**
   * Resize terminal
   */
  async resizeTerminal(
    sessionId: string,
    cols: number,
    rows: number
  ): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/taskmaster-terminal/sessions/${sessionId}/resize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cols, rows }),
        }
      );

      if (!response.ok) {
        throw new ApiError(
          'TASKMASTER_TERMINAL_ERROR',
          `Failed to resize terminal: ${response.statusText}`,
          response.status
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'NETWORK_ERROR',
        'Failed to resize terminal',
        500
      );
    }
  }

  /**
   * Get environment information
   */
  async getEnvironment(sessionId: string): Promise<{
    environment: Record<string, string>;
    workingDirectory: string;
    projectTag?: string;
    taskMasterIntegrated: boolean;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/taskmaster-terminal/sessions/${sessionId}/environment`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new ApiError(
          'TASKMASTER_TERMINAL_ERROR',
          `Failed to get environment: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'NETWORK_ERROR',
        'Failed to get environment',
        500
      );
    }
  }

  /**
   * Close a TaskMaster terminal session
   */
  async closeSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/taskmaster-terminal/sessions/${sessionId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new ApiError(
          'TASKMASTER_TERMINAL_ERROR',
          `Failed to close session: ${response.statusText}`,
          response.status
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'NETWORK_ERROR',
        'Failed to close session',
        500
      );
    }
  }

  /**
   * Create WebSocket connection for real-time communication
   */
  createWebSocket(token?: string): WebSocket {
    const url = token 
      ? `${this.websocketUrl}?token=${encodeURIComponent(token)}`
      : this.websocketUrl;
    
    return new WebSocket(url);
  }

  /**
   * Send WebSocket message to create session
   */
  createWebSocketSession(
    ws: WebSocket,
    workingDirectory?: string,
    repositoryPath?: string,
    projectTag?: string
  ): void {
    const message: TaskMasterTerminalWebSocketMessage = {
      type: 'create-session',
      data: {
        workingDirectory,
        repositoryPath,
        projectTag,
      },
    };
    
    ws.send(JSON.stringify(message));
  }

  /**
   * Execute command via WebSocket
   */
  executeWebSocketCommand(
    ws: WebSocket,
    sessionId: string,
    command: string
  ): void {
    const message: TaskMasterTerminalWebSocketMessage = {
      type: 'command',
      sessionId,
      data: { command },
    };
    
    ws.send(JSON.stringify(message));
  }

  /**
   * Send input via WebSocket
   */
  sendWebSocketInput(
    ws: WebSocket,
    sessionId: string,
    input: string
  ): void {
    const message: TaskMasterTerminalWebSocketMessage = {
      type: 'input',
      sessionId,
      data: { input },
    };
    
    ws.send(JSON.stringify(message));
  }

  /**
   * Resize terminal via WebSocket
   */
  resizeWebSocketTerminal(
    ws: WebSocket,
    sessionId: string,
    cols: number,
    rows: number
  ): void {
    const message: TaskMasterTerminalWebSocketMessage = {
      type: 'resize',
      sessionId,
      data: { cols, rows },
    };
    
    ws.send(JSON.stringify(message));
  }

  /**
   * Kill process via WebSocket
   */
  killWebSocketProcess(ws: WebSocket, sessionId: string): void {
    const message: TaskMasterTerminalWebSocketMessage = {
      type: 'kill',
      sessionId,
    };
    
    ws.send(JSON.stringify(message));
  }

  /**
   * Close session via WebSocket
   */
  closeWebSocketSession(ws: WebSocket, sessionId: string): void {
    const message: TaskMasterTerminalWebSocketMessage = {
      type: 'close-session',
      sessionId,
    };
    
    ws.send(JSON.stringify(message));
  }
}

// Singleton instance
export const taskMasterTerminalService = new TaskMasterTerminalService();