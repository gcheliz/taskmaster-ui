"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskMasterTerminalWebSocketService = exports.TaskMasterTerminalWebSocketService = void 0;
const ws_1 = require("ws");
const logger_1 = require("../utils/logger");
const taskMasterTerminalService_1 = require("./taskMasterTerminalService");
/**
 * TaskMaster Terminal WebSocket Service
 *
 * Provides real-time communication for TaskMaster terminal sessions.
 * Features:
 * - Real-time command execution and output streaming
 * - Session management over WebSocket
 * - TaskMaster CLI integration with live feedback
 * - Command suggestions and autocomplete
 * - Secure authenticated connections
 */
class TaskMasterTerminalWebSocketService {
    constructor() {
        this.connections = new Map();
        this.sessionToConnection = new Map();
        this.connectionToSessions = new Map();
        this.setupEventListeners();
    }
    /**
     * Handle new WebSocket connection
     */
    async handleConnection(ws, req) {
        const connectionId = this.generateConnectionId();
        try {
            // Authenticate the WebSocket connection
            const user = await this.authenticateConnection(req);
            if (!user) {
                ws.close(1008, 'Authentication required');
                return;
            }
            // Store connection
            this.connections.set(connectionId, ws);
            this.connectionToSessions.set(connectionId, new Set());
            logger_1.logger.info(`TaskMaster terminal WebSocket connection established: ${connectionId} (user: ${user.id})`);
            // Send welcome message
            this.sendMessage(ws, {
                type: 'session-created',
                data: {
                    message: 'Connected to TaskMaster Terminal Service',
                    connectionId,
                },
            });
            // Handle messages
            ws.on('message', async (rawMessage) => {
                try {
                    const message = JSON.parse(rawMessage.toString());
                    await this.handleMessage(connectionId, ws, message);
                }
                catch (error) {
                    logger_1.logger.error(`Failed to parse TaskMaster terminal WebSocket message: ${error}`, {}, error instanceof Error ? error : new Error('Unknown error'));
                    this.sendError(ws, 'Invalid message format', undefined);
                }
            });
            // Handle connection close
            ws.on('close', () => {
                this.handleConnectionClose(connectionId);
            });
            // Handle errors
            ws.on('error', (error) => {
                logger_1.logger.error(`TaskMaster terminal WebSocket error for connection ${connectionId}:`, {}, error instanceof Error ? error : new Error('Unknown error'));
                this.handleConnectionClose(connectionId);
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to handle TaskMaster terminal WebSocket connection:`, {}, error instanceof Error ? error : new Error('Unknown error'));
            ws.close(1011, 'Server error');
        }
    }
    /**
     * Handle WebSocket messages
     */
    async handleMessage(connectionId, ws, message) {
        try {
            switch (message.type) {
                case 'create-session':
                    await this.handleCreateSession(connectionId, ws, message);
                    break;
                case 'command':
                    await this.handleExecuteCommand(connectionId, ws, message);
                    break;
                case 'input':
                    await this.handleSendInput(connectionId, ws, message);
                    break;
                case 'resize':
                    await this.handleResize(connectionId, ws, message);
                    break;
                case 'kill':
                    await this.handleKillProcess(connectionId, ws, message);
                    break;
                case 'close-session':
                    await this.handleCloseSession(connectionId, ws, message);
                    break;
                default:
                    this.sendError(ws, 'Unknown message type', message.sessionId);
                    break;
            }
        }
        catch (error) {
            logger_1.logger.error(`Failed to handle TaskMaster terminal WebSocket message:`, {}, error instanceof Error ? error : new Error('Unknown error'));
            this.sendError(ws, error instanceof Error ? error.message : 'Message handling failed', message.sessionId);
        }
    }
    /**
     * Handle create session request
     */
    async handleCreateSession(connectionId, ws, message) {
        const { workingDirectory, repositoryPath, projectTag } = message.data || {};
        try {
            const sessionId = taskMasterTerminalService_1.taskMasterTerminalService.createSession(workingDirectory, repositoryPath, projectTag);
            // Associate session with connection
            this.sessionToConnection.set(sessionId, connectionId);
            const sessions = this.connectionToSessions.get(connectionId);
            if (sessions) {
                sessions.add(sessionId);
            }
            this.sendMessage(ws, {
                type: 'session-created',
                sessionId,
                data: {
                    workingDirectory: workingDirectory || process.cwd(),
                    projectTag,
                    taskMasterIntegrated: true,
                },
            });
            logger_1.logger.info(`TaskMaster terminal session created via WebSocket: ${sessionId}`);
        }
        catch (error) {
            this.sendError(ws, error instanceof Error ? error.message : 'Failed to create session', undefined);
        }
    }
    /**
     * Handle execute command request
     */
    async handleExecuteCommand(connectionId, ws, message) {
        const { sessionId } = message;
        const { command } = message.data || {};
        if (!sessionId || !command) {
            this.sendError(ws, 'Session ID and command are required', sessionId);
            return;
        }
        try {
            await taskMasterTerminalService_1.taskMasterTerminalService.executeCommand(sessionId, command);
            // Output will be sent via event listeners
        }
        catch (error) {
            this.sendError(ws, error instanceof Error ? error.message : 'Command execution failed', sessionId);
        }
    }
    /**
     * Handle send input request
     */
    async handleSendInput(connectionId, ws, message) {
        const { sessionId } = message;
        const { input } = message.data || {};
        if (!sessionId || !input) {
            this.sendError(ws, 'Session ID and input are required', sessionId);
            return;
        }
        try {
            taskMasterTerminalService_1.taskMasterTerminalService.sendInput(sessionId, input);
        }
        catch (error) {
            this.sendError(ws, error instanceof Error ? error.message : 'Failed to send input', sessionId);
        }
    }
    /**
     * Handle resize request
     */
    async handleResize(connectionId, ws, message) {
        const { sessionId } = message;
        const { cols, rows } = message.data || {};
        if (!sessionId || !cols || !rows) {
            this.sendError(ws, 'Session ID, cols, and rows are required', sessionId);
            return;
        }
        try {
            taskMasterTerminalService_1.taskMasterTerminalService.resizeTerminal(sessionId, cols, rows);
        }
        catch (error) {
            this.sendError(ws, error instanceof Error ? error.message : 'Failed to resize terminal', sessionId);
        }
    }
    /**
     * Handle kill process request
     */
    async handleKillProcess(connectionId, ws, message) {
        const { sessionId } = message;
        if (!sessionId) {
            this.sendError(ws, 'Session ID is required', sessionId);
            return;
        }
        try {
            taskMasterTerminalService_1.taskMasterTerminalService.killProcess(sessionId);
        }
        catch (error) {
            this.sendError(ws, error instanceof Error ? error.message : 'Failed to kill process', sessionId);
        }
    }
    /**
     * Handle close session request
     */
    async handleCloseSession(connectionId, ws, message) {
        const { sessionId } = message;
        if (!sessionId) {
            this.sendError(ws, 'Session ID is required', sessionId);
            return;
        }
        try {
            taskMasterTerminalService_1.taskMasterTerminalService.closeSession(sessionId);
            // Remove session associations
            this.sessionToConnection.delete(sessionId);
            const sessions = this.connectionToSessions.get(connectionId);
            if (sessions) {
                sessions.delete(sessionId);
            }
            this.sendMessage(ws, {
                type: 'session-closed',
                sessionId,
                data: {
                    message: 'Session closed successfully',
                },
            });
        }
        catch (error) {
            this.sendError(ws, error instanceof Error ? error.message : 'Failed to close session', sessionId);
        }
    }
    /**
     * Setup event listeners for TaskMaster terminal service
     */
    setupEventListeners() {
        // Listen for terminal output
        taskMasterTerminalService_1.taskMasterTerminalService.on('output', (output) => {
            const connectionId = this.sessionToConnection.get(output.sessionId);
            if (connectionId) {
                const ws = this.connections.get(connectionId);
                if (ws && ws.readyState === ws_1.WebSocket.OPEN) {
                    this.sendMessage(ws, {
                        type: 'output',
                        sessionId: output.sessionId,
                        data: output,
                    });
                }
            }
        });
        // Listen for session events
        taskMasterTerminalService_1.taskMasterTerminalService.on('session-created', (data) => {
            // Already handled in create session handler
        });
        taskMasterTerminalService_1.taskMasterTerminalService.on('session-closed', (data) => {
            const connectionId = this.sessionToConnection.get(data.sessionId);
            if (connectionId) {
                const ws = this.connections.get(connectionId);
                if (ws && ws.readyState === ws_1.WebSocket.OPEN) {
                    this.sendMessage(ws, {
                        type: 'session-closed',
                        sessionId: data.sessionId,
                        data: {
                            message: 'Session closed',
                        },
                    });
                }
                // Clean up associations
                this.sessionToConnection.delete(data.sessionId);
                const sessions = this.connectionToSessions.get(connectionId);
                if (sessions) {
                    sessions.delete(data.sessionId);
                }
            }
        });
        // Listen for TaskMaster-specific events
        taskMasterTerminalService_1.taskMasterTerminalService.on('taskmaster-state-changed', (data) => {
            const connectionId = this.sessionToConnection.get(data.sessionId);
            if (connectionId) {
                const ws = this.connections.get(connectionId);
                if (ws && ws.readyState === ws_1.WebSocket.OPEN) {
                    this.sendMessage(ws, {
                        type: 'output',
                        sessionId: data.sessionId,
                        data: {
                            type: 'taskmaster-state-changed',
                            data: data,
                            timestamp: new Date(),
                        },
                    });
                }
            }
        });
    }
    /**
     * Handle connection close
     */
    handleConnectionClose(connectionId) {
        logger_1.logger.info(`TaskMaster terminal WebSocket connection closed: ${connectionId}`);
        // Close all sessions associated with this connection
        const sessions = this.connectionToSessions.get(connectionId);
        if (sessions) {
            for (const sessionId of sessions) {
                try {
                    taskMasterTerminalService_1.taskMasterTerminalService.closeSession(sessionId);
                    this.sessionToConnection.delete(sessionId);
                }
                catch (error) {
                    logger_1.logger.error(`Failed to close session ${sessionId} on connection close:`, {}, error instanceof Error ? error : new Error('Unknown error'));
                }
            }
        }
        // Clean up connection mappings
        this.connections.delete(connectionId);
        this.connectionToSessions.delete(connectionId);
    }
    /**
     * Send message to WebSocket client
     */
    sendMessage(ws, message) {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
    /**
     * Send error message to WebSocket client
     */
    sendError(ws, message, sessionId) {
        this.sendMessage(ws, {
            type: 'error',
            sessionId,
            data: {
                message,
                timestamp: new Date().toISOString(),
            },
        });
    }
    /**
     * Authenticate WebSocket connection
     */
    async authenticateConnection(req) {
        // Extract token from query string or headers
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return null;
        }
        // Simple mock authentication - in production, verify JWT token
        // TODO: Implement proper JWT verification
        // For now, return mock user data
        return { id: 'user-1', email: 'user@example.com' };
    }
    /**
     * Generate unique connection ID
     */
    generateConnectionId() {
        return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get connection statistics
     */
    getStats() {
        return {
            activeConnections: this.connections.size,
            activeSessions: this.sessionToConnection.size,
            totalSessions: Array.from(this.connectionToSessions.values())
                .reduce((total, sessions) => total + sessions.size, 0),
        };
    }
    /**
     * Cleanup all connections and sessions
     */
    cleanup() {
        // Close all WebSocket connections
        for (const ws of this.connections.values()) {
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                ws.close(1001, 'Server shutdown');
            }
        }
        // Close all terminal sessions
        for (const sessionId of this.sessionToConnection.keys()) {
            try {
                taskMasterTerminalService_1.taskMasterTerminalService.closeSession(sessionId);
            }
            catch (error) {
                logger_1.logger.error(`Failed to close session ${sessionId} during cleanup:`, {}, error instanceof Error ? error : new Error('Unknown error'));
            }
        }
        // Clear all mappings
        this.connections.clear();
        this.sessionToConnection.clear();
        this.connectionToSessions.clear();
    }
}
exports.TaskMasterTerminalWebSocketService = TaskMasterTerminalWebSocketService;
// Singleton instance
exports.taskMasterTerminalWebSocketService = new TaskMasterTerminalWebSocketService();
//# sourceMappingURL=taskMasterTerminalWebSocketService.js.map