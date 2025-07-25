import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { gitWebSocketService, GitWebSocketMessage } from './gitWebSocketService';

interface ClientInfo {
  id: string;
  ws: WebSocket;
}

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ClientInfo> = new Map();
  private clientIdCounter = 0;

  public initialize(server: Server): void {
    this.wss = new WebSocketServer({ server });
    
    // Initialize Git WebSocket service
    gitWebSocketService.initialize((message: GitWebSocketMessage) => {
      this.broadcast(message);
    });

    this.wss.on('connection', (ws: WebSocket, _req) => {
      const clientId = `client-${++this.clientIdCounter}`;
      console.log(`New WebSocket connection established: ${clientId}`);
      
      const clientInfo: ClientInfo = { id: clientId, ws };
      this.clients.set(clientId, clientInfo);

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: 'connection',
          message: 'Connected to TaskMaster UI',
          timestamp: new Date().toISOString(),
        })
      );

      // Handle incoming messages
      ws.on('message', async data => {
        try {
          const message = JSON.parse(data.toString());
          console.log('Received message:', message);

          // Check if it's a Git-related message
          if (message.type?.startsWith('git-') || 
              ['subscribe-repository', 'unsubscribe-repository', 'refresh-repository', 'get-repository-state'].includes(message.type)) {
            const response = await gitWebSocketService.handleWebSocketMessage(clientId, message);
            if (response) {
              ws.send(JSON.stringify(response));
            }
          } else {
            // Echo back the message with timestamp for other messages
            ws.send(
              JSON.stringify({
                type: 'echo',
                data: message,
                timestamp: new Date().toISOString(),
              })
            );
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Invalid message format',
              timestamp: new Date().toISOString(),
            })
          );
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        console.log(`WebSocket connection closed: ${clientId}`);
        this.clients.delete(clientId);
      });

      // Handle errors
      ws.on('error', error => {
        console.error(`WebSocket error for ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });

    console.log('WebSocket server initialized');
  }

  public broadcast(message: any): void {
    if (!this.wss) {
      console.error('WebSocket server not initialized');
      return;
    }

    const data = JSON.stringify({
      type: 'broadcast',
      data: message,
      timestamp: new Date().toISOString(),
    });

    this.clients.forEach(clientInfo => {
      if (clientInfo.ws.readyState === WebSocket.OPEN) {
        clientInfo.ws.send(data);
      }
    });
  }

  public getClientCount(): number {
    return this.clients.size;
  }

  public async close(): Promise<void> {
    if (this.wss) {
      // Shutdown Git WebSocket service
      await gitWebSocketService.shutdown();
      
      this.wss.close();
      this.wss = null;
      this.clients.clear();
      console.log('WebSocket server closed');
    }
  }
}
