import { ChildProcessWithoutNullStreams } from 'child_process';
import { EventEmitter } from 'events';
export interface TerminalSession {
    id: string;
    workingDirectory: string;
    repositoryPath?: string;
    shell: string;
    process?: ChildProcessWithoutNullStreams;
    isActive: boolean;
    createdAt: Date;
    lastActivity: Date;
}
export interface TerminalCommand {
    command: string;
    sessionId: string;
    timestamp: Date;
}
export interface TerminalOutput {
    type: 'stdout' | 'stderr' | 'exit';
    data: string;
    sessionId: string;
    timestamp: Date;
}
export declare class TerminalService extends EventEmitter {
    private sessions;
    private readonly maxSessions;
    private readonly sessionTimeout;
    private cleanupInterval;
    constructor();
    /**
     * Create a new terminal session
     */
    createSession(workingDirectory?: string, repositoryPath?: string): string;
    /**
     * Execute a command in a terminal session
     */
    executeCommand(sessionId: string, command: string): Promise<void>;
    /**
     * Send input to a running process
     */
    sendInput(sessionId: string, input: string): void;
    /**
     * Kill a running process in a session
     */
    killProcess(sessionId: string): void;
    /**
     * Change working directory for a session
     */
    changeDirectory(sessionId: string, directory: string): void;
    /**
     * Get session information
     */
    getSession(sessionId: string): TerminalSession | undefined;
    /**
     * Get all active sessions
     */
    getActiveSessions(): TerminalSession[];
    /**
     * Close a terminal session
     */
    closeSession(sessionId: string): void;
    /**
     * Close all sessions
     */
    closeAllSessions(): void;
    /**
     * Check if a command is a built-in command
     */
    private isBuiltInCommand;
    /**
     * Handle built-in commands
     */
    private handleBuiltInCommand;
    /**
     * Validate if a directory exists and is accessible
     */
    private isValidDirectory;
    /**
     * Setup cleanup interval for inactive sessions
     */
    private setupCleanupInterval;
    /**
     * Clean up inactive sessions
     */
    private cleanupInactiveSessions;
    /**
     * Clean up the oldest session when at capacity
     */
    private cleanupOldestSession;
    /**
     * Cleanup on service shutdown
     */
    destroy(): void;
}
export declare const terminalService: TerminalService;
//# sourceMappingURL=terminalService.d.ts.map