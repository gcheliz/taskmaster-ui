import { ApiError } from './api';

export interface TerminalSession {
  id: string;
  workingDirectory: string;
  repositoryPath?: string;
  shell: string;
  isActive: boolean;
  createdAt: string;
  lastActivity: string;
}

export interface TerminalWebSocketMessage {
  type: 'command' | 'input' | 'kill' | 'resize' | 'create-session' | 'close-session';
  sessionId?: string;
  data?: any;
}

export interface TerminalWebSocketResponse {
  type: 'output' | 'session-created' | 'session-closed' | 'error';
  sessionId?: string;
  data?: any;
}

export interface CreateTerminalSessionRequest {
  workingDirectory?: string;
  repositoryPath?: string;
}

export interface CreateTerminalSessionResponse {
  sessionId: string;
  message: string;
}

export interface ExecuteCommandRequest {
  command: string;
}

export interface SendInputRequest {
  input: string;
}

export interface ChangeDirectoryRequest {
  directory: string;
}

export class TerminalService {
  private baseUrl: string;
  private websocketUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.websocketUrl = this.getWebSocketUrl();
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/terminal-ws`;
  }

  /**
   * Create a new terminal session
   */
  async createSession(request: CreateTerminalSessionRequest): Promise<CreateTerminalSessionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/terminal/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new ApiError('TERMINAL_ERROR', `Failed to create session: ${response.statusText}`, response.status);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('NETWORK_ERROR', 'Failed to create terminal session', 500);
    }
  }

  /**
   * Get terminal session information
   */
  async getSession(sessionId: string): Promise<TerminalSession> {
    try {
      const response = await fetch(`${this.baseUrl}/terminal/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new ApiError('TERMINAL_ERROR', `Failed to get session: ${response.statusText}`, response.status);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('NETWORK_ERROR', 'Failed to get terminal session', 500);
    }
  }

  /**
   * Get all active terminal sessions
   */
  async getActiveSessions(): Promise<{ sessions: TerminalSession[]; count: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/terminal/sessions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new ApiError('TERMINAL_ERROR', `Failed to get sessions: ${response.statusText}`, response.status);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('NETWORK_ERROR', 'Failed to get active sessions', 500);
    }
  }

  /**
   * Execute a command in a terminal session
   */
  async executeCommand(sessionId: string, request: ExecuteCommandRequest): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/terminal/sessions/${sessionId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new ApiError('TERMINAL_ERROR', `Failed to execute command: ${response.statusText}`, response.status);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('NETWORK_ERROR', 'Failed to execute command', 500);
    }
  }

  /**
   * Send input to a running process
   */
  async sendInput(sessionId: string, request: SendInputRequest): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/terminal/sessions/${sessionId}/input`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new ApiError('TERMINAL_ERROR', `Failed to send input: ${response.statusText}`, response.status);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('NETWORK_ERROR', 'Failed to send input', 500);
    }
  }

  /**
   * Kill a running process in a session
   */
  async killProcess(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/terminal/sessions/${sessionId}/kill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new ApiError('TERMINAL_ERROR', `Failed to kill process: ${response.statusText}`, response.status);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('NETWORK_ERROR', 'Failed to kill process', 500);
    }
  }

  /**
   * Change working directory for a session
   */
  async changeDirectory(sessionId: string, request: ChangeDirectoryRequest): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/terminal/sessions/${sessionId}/cd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new ApiError('TERMINAL_ERROR', `Failed to change directory: ${response.statusText}`, response.status);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('NETWORK_ERROR', 'Failed to change directory', 500);
    }
  }

  /**
   * Close a terminal session
   */
  async closeSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/terminal/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new ApiError('TERMINAL_ERROR', `Failed to close session: ${response.statusText}`, response.status);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('NETWORK_ERROR', 'Failed to close session', 500);
    }
  }

  /**
   * Create a WebSocket connection for terminal communication
   */
  createWebSocket(): WebSocket {
    return new WebSocket(this.websocketUrl);
  }

  /**
   * Send a message through WebSocket
   */
  sendWebSocketMessage(ws: WebSocket, message: TerminalWebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket is not open');
    }
  }

  /**
   * Create a terminal session through WebSocket
   */
  createWebSocketSession(ws: WebSocket, workingDirectory?: string, repositoryPath?: string): void {
    this.sendWebSocketMessage(ws, {
      type: 'create-session',
      data: {
        workingDirectory,
        repositoryPath
      }
    });
  }

  /**
   * Execute a command through WebSocket
   */
  executeWebSocketCommand(ws: WebSocket, sessionId: string, command: string): void {
    this.sendWebSocketMessage(ws, {
      type: 'command',
      sessionId,
      data: { command }
    });
  }

  /**
   * Send input through WebSocket
   */
  sendWebSocketInput(ws: WebSocket, sessionId: string, input: string): void {
    this.sendWebSocketMessage(ws, {
      type: 'input',
      sessionId,
      data: { input }
    });
  }

  /**
   * Kill process through WebSocket
   */
  killWebSocketProcess(ws: WebSocket, sessionId: string): void {
    this.sendWebSocketMessage(ws, {
      type: 'kill',
      sessionId
    });
  }

  /**
   * Resize terminal through WebSocket
   */
  resizeWebSocketTerminal(ws: WebSocket, sessionId: string, cols: number, rows: number): void {
    this.sendWebSocketMessage(ws, {
      type: 'resize',
      sessionId,
      data: { cols, rows }
    });
  }

  /**
   * Close session through WebSocket
   */
  closeWebSocketSession(ws: WebSocket, sessionId: string): void {
    this.sendWebSocketMessage(ws, {
      type: 'close-session',
      sessionId
    });
  }
}

// Export singleton instance
export const terminalService = new TerminalService();