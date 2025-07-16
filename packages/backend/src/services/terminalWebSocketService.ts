import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { terminalService, TerminalOutput } from './terminalService';
import { logger } from '../utils/logger';

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

export class TerminalWebSocketService {
  private wss: WebSocketServer;
  private connections: Map<WebSocket, string[]> = new Map(); // ws -> sessionIds

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/terminal-ws'
    });

    this.setupWebSocketServer();
    this.setupTerminalServiceListeners();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      logger.info('Terminal WebSocket connection established');
      
      // Initialize connection session tracking
      this.connections.set(ws, []);

      ws.on('message', (message: string) => {
        try {
          const data: TerminalWebSocketMessage = JSON.parse(message);
          this.handleWebSocketMessage(ws, data);
        } catch (error) {
          logger.error('Failed to parse WebSocket message:', {}, error instanceof Error ? error : new Error('Unknown error'));
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        logger.info('Terminal WebSocket connection closed');
        this.handleConnectionClose(ws);
      });

      ws.on('error', (error: Error) => {
        logger.error('Terminal WebSocket error:', {}, error);
        this.handleConnectionClose(ws);
      });
    });
  }

  private setupTerminalServiceListeners(): void {
    // Listen for terminal output
    terminalService.on('output', (output: TerminalOutput) => {
      this.broadcastToSessionSubscribers(output.sessionId, {
        type: 'output',
        sessionId: output.sessionId,
        data: {
          type: output.type,
          data: output.data,
          timestamp: output.timestamp
        }
      });
    });
  }

  private async handleWebSocketMessage(ws: WebSocket, message: TerminalWebSocketMessage): Promise<void> {
    try {
      switch (message.type) {
        case 'create-session':
          await this.handleCreateSession(ws, message);
          break;

        case 'command':
          await this.handleCommand(ws, message);
          break;

        case 'input':
          await this.handleInput(ws, message);
          break;

        case 'kill':
          await this.handleKill(ws, message);
          break;

        case 'resize':
          await this.handleResize(ws, message);
          break;

        case 'close-session':
          await this.handleCloseSession(ws, message);
          break;

        default:
          this.sendError(ws, `Unknown message type: ${message.type}`);
      }
    } catch (error) {
      logger.error('Error handling WebSocket message:', {}, error instanceof Error ? error : new Error('Unknown error'));
      this.sendError(ws, error instanceof Error ? error.message : 'Internal server error');
    }
  }

  private async handleCreateSession(ws: WebSocket, message: TerminalWebSocketMessage): Promise<void> {
    const { workingDirectory, repositoryPath } = message.data || {};
    
    try {
      const sessionId = terminalService.createSession(workingDirectory, repositoryPath);
      
      // Subscribe this connection to the session
      this.subscribeToSession(ws, sessionId);
      
      this.sendResponse(ws, {
        type: 'session-created',
        sessionId,
        data: {
          sessionId,
          workingDirectory: workingDirectory || repositoryPath || process.cwd()
        }
      });
    } catch (error) {
      this.sendError(ws, error instanceof Error ? error.message : 'Failed to create session');
    }
  }

  private async handleCommand(ws: WebSocket, message: TerminalWebSocketMessage): Promise<void> {
    const { sessionId } = message;
    const { command } = message.data || {};
    
    if (!sessionId || !command) {
      this.sendError(ws, 'Session ID and command are required');
      return;
    }

    try {
      await terminalService.executeCommand(sessionId, command);
    } catch (error) {
      this.sendError(ws, error instanceof Error ? error.message : 'Failed to execute command');
    }
  }

  private async handleInput(ws: WebSocket, message: TerminalWebSocketMessage): Promise<void> {
    const { sessionId } = message;
    const { input } = message.data || {};
    
    if (!sessionId || input === undefined) {
      this.sendError(ws, 'Session ID and input are required');
      return;
    }

    try {
      terminalService.sendInput(sessionId, input);
    } catch (error) {
      this.sendError(ws, error instanceof Error ? error.message : 'Failed to send input');
    }
  }

  private async handleKill(ws: WebSocket, message: TerminalWebSocketMessage): Promise<void> {
    const { sessionId } = message;
    
    if (!sessionId) {
      this.sendError(ws, 'Session ID is required');
      return;
    }

    try {
      terminalService.killProcess(sessionId);
    } catch (error) {
      this.sendError(ws, error instanceof Error ? error.message : 'Failed to kill process');
    }
  }

  private async handleResize(ws: WebSocket, message: TerminalWebSocketMessage): Promise<void> {
    const { sessionId } = message;
    const { cols, rows } = message.data || {};
    
    if (!sessionId || !cols || !rows) {
      this.sendError(ws, 'Session ID, cols, and rows are required');
      return;
    }

    // For now, just acknowledge the resize
    // In a full implementation, you would update the terminal size
    logger.info(`Terminal resize requested for session ${sessionId}: ${cols}x${rows}`);
  }

  private async handleCloseSession(ws: WebSocket, message: TerminalWebSocketMessage): Promise<void> {
    const { sessionId } = message;
    
    if (!sessionId) {
      this.sendError(ws, 'Session ID is required');
      return;
    }

    try {
      terminalService.closeSession(sessionId);
      this.unsubscribeFromSession(ws, sessionId);
      
      this.sendResponse(ws, {
        type: 'session-closed',
        sessionId,
        data: { sessionId }
      });
    } catch (error) {
      this.sendError(ws, error instanceof Error ? error.message : 'Failed to close session');
    }
  }

  private subscribeToSession(ws: WebSocket, sessionId: string): void {
    const sessionIds = this.connections.get(ws) || [];
    if (!sessionIds.includes(sessionId)) {
      sessionIds.push(sessionId);
      this.connections.set(ws, sessionIds);
    }
  }

  private unsubscribeFromSession(ws: WebSocket, sessionId: string): void {
    const sessionIds = this.connections.get(ws) || [];
    const index = sessionIds.indexOf(sessionId);
    if (index > -1) {
      sessionIds.splice(index, 1);
      this.connections.set(ws, sessionIds);
    }
  }

  private handleConnectionClose(ws: WebSocket): void {
    const sessionIds = this.connections.get(ws) || [];
    
    // Close all sessions associated with this connection
    sessionIds.forEach(sessionId => {
      try {
        terminalService.closeSession(sessionId);
      } catch (error) {
        logger.error(`Failed to close session ${sessionId}:`, {}, error instanceof Error ? error : new Error('Unknown error'));
      }
    });
    
    this.connections.delete(ws);
  }

  private broadcastToSessionSubscribers(sessionId: string, message: TerminalWebSocketResponse): void {
    for (const [ws, sessionIds] of this.connections) {
      if (sessionIds.includes(sessionId)) {
        this.sendResponse(ws, message);
      }
    }
  }

  private sendResponse(ws: WebSocket, response: TerminalWebSocketResponse): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(response));
    }
  }

  private sendError(ws: WebSocket, message: string): void {
    this.sendResponse(ws, {
      type: 'error',
      data: { message }
    });
  }

  /**
   * Close all connections and clean up
   */
  destroy(): void {
    this.wss.close();
    this.connections.clear();
  }
}

export let terminalWebSocketService: TerminalWebSocketService;