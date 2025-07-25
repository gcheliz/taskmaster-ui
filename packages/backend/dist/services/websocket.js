"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const ws_1 = require("ws");
const gitWebSocketService_1 = require("./gitWebSocketService");
class WebSocketService {
    constructor() {
        this.wss = null;
        this.clients = new Map();
        this.clientIdCounter = 0;
    }
    initialize(server) {
        this.wss = new ws_1.WebSocketServer({ server });
        // Initialize Git WebSocket service
        gitWebSocketService_1.gitWebSocketService.initialize((message) => {
            this.broadcast(message);
        });
        this.wss.on('connection', (ws, req) => {
            const clientId = `client-${++this.clientIdCounter}`;
            console.log(`New WebSocket connection established: ${clientId}`);
            const clientInfo = { id: clientId, ws };
            this.clients.set(clientId, clientInfo);
            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connection',
                message: 'Connected to TaskMaster UI',
                timestamp: new Date().toISOString(),
            }));
            // Handle incoming messages
            ws.on('message', async (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    console.log('Received message:', message);
                    // Check if it's a Git-related message
                    if (message.type?.startsWith('git-') ||
                        ['subscribe-repository', 'unsubscribe-repository', 'refresh-repository', 'get-repository-state'].includes(message.type)) {
                        const response = await gitWebSocketService_1.gitWebSocketService.handleWebSocketMessage(clientId, message);
                        if (response) {
                            ws.send(JSON.stringify(response));
                        }
                    }
                    else {
                        // Echo back the message with timestamp for other messages
                        ws.send(JSON.stringify({
                            type: 'echo',
                            data: message,
                            timestamp: new Date().toISOString(),
                        }));
                    }
                }
                catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Invalid message format',
                        timestamp: new Date().toISOString(),
                    }));
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
    broadcast(message) {
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
            if (clientInfo.ws.readyState === ws_1.WebSocket.OPEN) {
                clientInfo.ws.send(data);
            }
        });
    }
    getClientCount() {
        return this.clients.size;
    }
    async close() {
        if (this.wss) {
            // Shutdown Git WebSocket service
            await gitWebSocketService_1.gitWebSocketService.shutdown();
            this.wss.close();
            this.wss = null;
            this.clients.clear();
            console.log('WebSocket server closed');
        }
    }
}
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=websocket.js.map