import { Server } from 'http';
export declare class WebSocketService {
    private wss;
    private clients;
    initialize(server: Server): void;
    broadcast(message: any): void;
    getClientCount(): number;
    close(): void;
}
//# sourceMappingURL=websocket.d.ts.map