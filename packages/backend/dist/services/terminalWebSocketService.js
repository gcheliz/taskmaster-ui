"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminalWebSocketService = exports.TerminalWebSocketService = void 0;
const ws_1 = require("ws");
const terminalService_1 = require("./terminalService");
const logger_1 = require("../utils/logger");
class TerminalWebSocketService {
    constructor(server) {
        this.connections = new Map(); // ws -> sessionIds
        this.wss = new ws_1.WebSocketServer({
            server,
            path: '/terminal-ws'
        });
        this.setupWebSocketServer();
        this.setupTerminalServiceListeners();
    }
    setupWebSocketServer() {
        this.wss.on('connection', (ws) => {
            logger_1.logger.info('Terminal WebSocket connection established');
            // Initialize connection session tracking
            this.connections.set(ws, []);
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleWebSocketMessage(ws, data);
                }
                catch (error) {
                    logger_1.logger.error('Failed to parse WebSocket message:', {}, error instanceof Error ? error : new Error('Unknown error'));
                    this.sendError(ws, 'Invalid message format');
                }
            });
            ws.on('close', () => {
                logger_1.logger.info('Terminal WebSocket connection closed');
                this.handleConnectionClose(ws);
            });
            ws.on('error', (error) => {
                logger_1.logger.error('Terminal WebSocket error:', {}, error);
                this.handleConnectionClose(ws);
            });
        });
    }
    setupTerminalServiceListeners() {
        // Listen for terminal output
        terminalService_1.terminalService.on('output', (output) => {
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
    async handleWebSocketMessage(ws, message) {
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
        }
        catch (error) {
            logger_1.logger.error('Error handling WebSocket message:', {}, error instanceof Error ? error : new Error('Unknown error'));
            this.sendError(ws, error instanceof Error ? error.message : 'Internal server error');
        }
    }
    async handleCreateSession(ws, message) {
        const { workingDirectory, repositoryPath } = message.data || {};
        try {
            const sessionId = terminalService_1.terminalService.createSession(workingDirectory, repositoryPath);
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
        }
        catch (error) {
            this.sendError(ws, error instanceof Error ? error.message : 'Failed to create session');
        }
    }
    async handleCommand(ws, message) {
        const { sessionId } = message;
        const { command } = message.data || {};
        if (!sessionId || !command) {
            this.sendError(ws, 'Session ID and command are required');
            return;
        }
        try {
            await terminalService_1.terminalService.executeCommand(sessionId, command);
        }
        catch (error) {
            this.sendError(ws, error instanceof Error ? error.message : 'Failed to execute command');
        }
    }
    async handleInput(ws, message) {
        const { sessionId } = message;
        const { input } = message.data || {};
        if (!sessionId || input === undefined) {
            this.sendError(ws, 'Session ID and input are required');
            return;
        }
        try {
            terminalService_1.terminalService.sendInput(sessionId, input);
        }
        catch (error) {
            this.sendError(ws, error instanceof Error ? error.message : 'Failed to send input');
        }
    }
    async handleKill(ws, message) {
        const { sessionId } = message;
        if (!sessionId) {
            this.sendError(ws, 'Session ID is required');
            return;
        }
        try {
            terminalService_1.terminalService.killProcess(sessionId);
        }
        catch (error) {
            this.sendError(ws, error instanceof Error ? error.message : 'Failed to kill process');
        }
    }
    async handleResize(ws, message) {
        const { sessionId } = message;
        const { cols, rows } = message.data || {};
        if (!sessionId || !cols || !rows) {
            this.sendError(ws, 'Session ID, cols, and rows are required');
            return;
        }
        // For now, just acknowledge the resize
        // In a full implementation, you would update the terminal size
        logger_1.logger.info(`Terminal resize requested for session ${sessionId}: ${cols}x${rows}`);
    }
    async handleCloseSession(ws, message) {
        const { sessionId } = message;
        if (!sessionId) {
            this.sendError(ws, 'Session ID is required');
            return;
        }
        try {
            terminalService_1.terminalService.closeSession(sessionId);
            this.unsubscribeFromSession(ws, sessionId);
            this.sendResponse(ws, {
                type: 'session-closed',
                sessionId,
                data: { sessionId }
            });
        }
        catch (error) {
            this.sendError(ws, error instanceof Error ? error.message : 'Failed to close session');
        }
    }
    subscribeToSession(ws, sessionId) {
        const sessionIds = this.connections.get(ws) || [];
        if (!sessionIds.includes(sessionId)) {
            sessionIds.push(sessionId);
            this.connections.set(ws, sessionIds);
        }
    }
    unsubscribeFromSession(ws, sessionId) {
        const sessionIds = this.connections.get(ws) || [];
        const index = sessionIds.indexOf(sessionId);
        if (index > -1) {
            sessionIds.splice(index, 1);
            this.connections.set(ws, sessionIds);
        }
    }
    handleConnectionClose(ws) {
        const sessionIds = this.connections.get(ws) || [];
        // Close all sessions associated with this connection
        sessionIds.forEach(sessionId => {
            try {
                terminalService_1.terminalService.closeSession(sessionId);
            }
            catch (error) {
                logger_1.logger.error(`Failed to close session ${sessionId}:`, {}, error instanceof Error ? error : new Error('Unknown error'));
            }
        });
        this.connections.delete(ws);
    }
    broadcastToSessionSubscribers(sessionId, message) {
        for (const [ws, sessionIds] of this.connections) {
            if (sessionIds.includes(sessionId)) {
                this.sendResponse(ws, message);
            }
        }
    }
    sendResponse(ws, response) {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(JSON.stringify(response));
        }
    }
    sendError(ws, message) {
        this.sendResponse(ws, {
            type: 'error',
            data: { message }
        });
    }
    /**
     * Close all connections and clean up
     */
    destroy() {
        this.wss.close();
        this.connections.clear();
    }
}
exports.TerminalWebSocketService = TerminalWebSocketService;
//# sourceMappingURL=terminalWebSocketService.js.map