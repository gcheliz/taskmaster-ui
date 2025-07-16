import { Server } from 'http';
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
export declare class TerminalWebSocketService {
    private wss;
    private connections;
    constructor(server: Server);
    private setupWebSocketServer;
    private setupTerminalServiceListeners;
    private handleWebSocketMessage;
    private handleCreateSession;
    private handleCommand;
    private handleInput;
    private handleKill;
    private handleResize;
    private handleCloseSession;
    private subscribeToSession;
    private unsubscribeFromSession;
    private handleConnectionClose;
    private broadcastToSessionSubscribers;
    private sendResponse;
    private sendError;
    /**
     * Close all connections and clean up
     */
    destroy(): void;
}
export declare let terminalWebSocketService: TerminalWebSocketService;
//# sourceMappingURL=terminalWebSocketService.d.ts.map