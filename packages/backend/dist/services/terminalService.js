"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminalService = exports.TerminalService = void 0;
const child_process_1 = require("child_process");
const events_1 = require("events");
const uuid_1 = require("uuid");
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const logger_1 = require("../utils/logger");
class TerminalService extends events_1.EventEmitter {
    constructor() {
        super();
        this.sessions = new Map();
        this.maxSessions = 10;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.setupCleanupInterval();
    }
    /**
     * Create a new terminal session
     */
    createSession(workingDirectory, repositoryPath) {
        const sessionId = (0, uuid_1.v4)();
        const defaultShell = os.platform() === 'win32' ? 'cmd.exe' : '/bin/bash';
        const cwd = workingDirectory || repositoryPath || process.cwd();
        // Validate working directory
        if (!this.isValidDirectory(cwd)) {
            throw new Error(`Invalid working directory: ${cwd}`);
        }
        // Check session limit
        if (this.sessions.size >= this.maxSessions) {
            this.cleanupOldestSession();
        }
        const session = {
            id: sessionId,
            workingDirectory: cwd,
            repositoryPath,
            shell: defaultShell,
            isActive: true,
            createdAt: new Date(),
            lastActivity: new Date()
        };
        this.sessions.set(sessionId, session);
        logger_1.logger.info(`Created terminal session ${sessionId} in ${cwd}`);
        return sessionId;
    }
    /**
     * Execute a command in a terminal session
     */
    async executeCommand(sessionId, command) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Terminal session not found: ${sessionId}`);
        }
        if (!session.isActive) {
            throw new Error(`Terminal session is not active: ${sessionId}`);
        }
        // Update last activity
        session.lastActivity = new Date();
        // Handle built-in commands
        if (this.isBuiltInCommand(command)) {
            await this.handleBuiltInCommand(sessionId, command);
            return;
        }
        // Parse command and arguments
        const [cmd, ...args] = command.trim().split(/\\s+/);
        try {
            // Spawn the command
            const childProcess = (0, child_process_1.spawn)(cmd, args, {
                cwd: session.workingDirectory,
                shell: true,
                stdio: 'pipe',
                env: {
                    ...process.env,
                    TERM: 'xterm-256color',
                    COLUMNS: '80',
                    LINES: '24'
                }
            });
            // Store the process reference
            session.process = childProcess;
            // Handle stdout
            childProcess.stdout.on('data', (data) => {
                const output = {
                    type: 'stdout',
                    data: data.toString(),
                    sessionId,
                    timestamp: new Date()
                };
                this.emit('output', output);
            });
            // Handle stderr
            childProcess.stderr.on('data', (data) => {
                const output = {
                    type: 'stderr',
                    data: data.toString(),
                    sessionId,
                    timestamp: new Date()
                };
                this.emit('output', output);
            });
            // Handle process exit
            childProcess.on('close', (code) => {
                const output = {
                    type: 'exit',
                    data: `Process exited with code ${code}\\n`,
                    sessionId,
                    timestamp: new Date()
                };
                this.emit('output', output);
                // Clear the process reference
                if (session.process === childProcess) {
                    session.process = undefined;
                }
            });
            // Handle process error
            childProcess.on('error', (error) => {
                const output = {
                    type: 'stderr',
                    data: `Error: ${error.message}\\n`,
                    sessionId,
                    timestamp: new Date()
                };
                this.emit('output', output);
            });
        }
        catch (error) {
            const output = {
                type: 'stderr',
                data: `Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}\\n`,
                sessionId,
                timestamp: new Date()
            };
            this.emit('output', output);
        }
    }
    /**
     * Send input to a running process
     */
    sendInput(sessionId, input) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.process) {
            throw new Error(`No active process in session: ${sessionId}`);
        }
        session.process.stdin.write(input);
        session.lastActivity = new Date();
    }
    /**
     * Kill a running process in a session
     */
    killProcess(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.process) {
            return;
        }
        session.process.kill('SIGTERM');
        session.process = undefined;
        session.lastActivity = new Date();
    }
    /**
     * Change working directory for a session
     */
    changeDirectory(sessionId, directory) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Terminal session not found: ${sessionId}`);
        }
        const newPath = path.resolve(session.workingDirectory, directory);
        if (!this.isValidDirectory(newPath)) {
            throw new Error(`Invalid directory: ${directory}`);
        }
        session.workingDirectory = newPath;
        session.lastActivity = new Date();
        const output = {
            type: 'stdout',
            data: `Changed directory to ${newPath}\\n`,
            sessionId,
            timestamp: new Date()
        };
        this.emit('output', output);
    }
    /**
     * Get session information
     */
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    /**
     * Get all active sessions
     */
    getActiveSessions() {
        return Array.from(this.sessions.values()).filter(session => session.isActive);
    }
    /**
     * Close a terminal session
     */
    closeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return;
        }
        // Kill any running process
        if (session.process) {
            session.process.kill('SIGTERM');
        }
        session.isActive = false;
        this.sessions.delete(sessionId);
        logger_1.logger.info(`Closed terminal session ${sessionId}`);
    }
    /**
     * Close all sessions
     */
    closeAllSessions() {
        for (const sessionId of this.sessions.keys()) {
            this.closeSession(sessionId);
        }
    }
    /**
     * Check if a command is a built-in command
     */
    isBuiltInCommand(command) {
        const builtInCommands = ['cd', 'pwd', 'clear', 'exit'];
        const cmd = command.trim().split(/\\s+/)[0];
        return builtInCommands.includes(cmd);
    }
    /**
     * Handle built-in commands
     */
    async handleBuiltInCommand(sessionId, command) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return;
        }
        const [cmd, ...args] = command.trim().split(/\\s+/);
        switch (cmd) {
            case 'cd':
                if (args.length === 0) {
                    // Change to home directory
                    this.changeDirectory(sessionId, os.homedir());
                }
                else {
                    this.changeDirectory(sessionId, args[0]);
                }
                break;
            case 'pwd': {
                const output = {
                    type: 'stdout',
                    data: `${session.workingDirectory}\\n`,
                    sessionId,
                    timestamp: new Date()
                };
                this.emit('output', output);
                break;
            }
            case 'clear': {
                const clearOutput = {
                    type: 'stdout',
                    data: '\\x1b[2J\\x1b[H',
                    sessionId,
                    timestamp: new Date()
                };
                this.emit('output', clearOutput);
                break;
            }
            case 'exit':
                this.closeSession(sessionId);
                break;
        }
    }
    /**
     * Validate if a directory exists and is accessible
     */
    isValidDirectory(directory) {
        try {
            const fs = require('fs');
            const stat = fs.statSync(directory);
            return stat.isDirectory();
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Setup cleanup interval for inactive sessions
     */
    setupCleanupInterval() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupInactiveSessions();
        }, 5 * 60 * 1000); // Check every 5 minutes
    }
    /**
     * Clean up inactive sessions
     */
    cleanupInactiveSessions() {
        const now = Date.now();
        for (const [sessionId, session] of this.sessions) {
            if (now - session.lastActivity.getTime() > this.sessionTimeout) {
                logger_1.logger.info(`Cleaning up inactive session ${sessionId}`);
                this.closeSession(sessionId);
            }
        }
    }
    /**
     * Clean up the oldest session when at capacity
     */
    cleanupOldestSession() {
        let oldestSession = null;
        let oldestSessionId = null;
        for (const [sessionId, session] of this.sessions) {
            if (!oldestSession || session.createdAt < oldestSession.createdAt) {
                oldestSession = session;
                oldestSessionId = sessionId;
            }
        }
        if (oldestSessionId) {
            logger_1.logger.info(`Cleaning up oldest session ${oldestSessionId} due to capacity limit`);
            this.closeSession(oldestSessionId);
        }
    }
    /**
     * Cleanup on service shutdown
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.closeAllSessions();
    }
}
exports.TerminalService = TerminalService;
// Export singleton instance
exports.terminalService = new TerminalService();
//# sourceMappingURL=terminalService.js.map