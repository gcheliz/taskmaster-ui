"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const ws_1 = require("ws");
class WebSocketService {
    constructor() {
        this.wss = null;
        this.clients = new Set();
    }
    initialize(server) {
        this.wss = new ws_1.WebSocketServer({ server });
        this.wss.on('connection', (ws, req) => {
            console.log('New WebSocket connection established');
            this.clients.add(ws);
            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connection',
                message: 'Connected to TaskMaster UI',
                timestamp: new Date().toISOString(),
            }));
            // Handle incoming messages
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    console.log('Received message:', message);
                    // Echo back the message with timestamp
                    ws.send(JSON.stringify({
                        type: 'echo',
                        data: message,
                        timestamp: new Date().toISOString(),
                    }));
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
                console.log('WebSocket connection closed');
                this.clients.delete(ws);
            });
            // Handle errors
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
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
        this.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
    getClientCount() {
        return this.clients.size;
    }
    close() {
        if (this.wss) {
            this.wss.close();
            this.wss = null;
            this.clients.clear();
            console.log('WebSocket server closed');
        }
    }
}
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=websocket.js.map