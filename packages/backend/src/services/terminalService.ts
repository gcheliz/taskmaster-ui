import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import * as os from 'os';
import * as path from 'path';
import { logger } from '../utils/logger';

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

export class TerminalService extends EventEmitter {
  private sessions: Map<string, TerminalSession> = new Map();
  private readonly maxSessions = 10;
  private readonly sessionTimeout = 30 * 60 * 1000; // 30 minutes
  private cleanupInterval: NodeJS.Timeout | undefined;

  constructor() {
    super();
    this.setupCleanupInterval();
  }

  /**
   * Create a new terminal session
   */
  createSession(workingDirectory?: string, repositoryPath?: string): string {
    const sessionId = uuidv4();
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

    const session: TerminalSession = {
      id: sessionId,
      workingDirectory: cwd,
      repositoryPath,
      shell: defaultShell,
      isActive: true,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.sessions.set(sessionId, session);
    logger.info(`Created terminal session ${sessionId} in ${cwd}`);

    return sessionId;
  }

  /**
   * Execute a command in a terminal session
   */
  async executeCommand(sessionId: string, command: string): Promise<void> {
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
      const childProcess = spawn(cmd, args, {
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
      childProcess.stdout.on('data', (data: Buffer) => {
        const output: TerminalOutput = {
          type: 'stdout',
          data: data.toString(),
          sessionId,
          timestamp: new Date()
        };
        this.emit('output', output);
      });

      // Handle stderr
      childProcess.stderr.on('data', (data: Buffer) => {
        const output: TerminalOutput = {
          type: 'stderr',
          data: data.toString(),
          sessionId,
          timestamp: new Date()
        };
        this.emit('output', output);
      });

      // Handle process exit
      childProcess.on('close', (code: number | null) => {
        const output: TerminalOutput = {
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
      childProcess.on('error', (error: Error) => {
        const output: TerminalOutput = {
          type: 'stderr',
          data: `Error: ${error.message}\\n`,
          sessionId,
          timestamp: new Date()
        };
        this.emit('output', output);
      });

    } catch (error) {
      const output: TerminalOutput = {
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
  sendInput(sessionId: string, input: string): void {
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
  killProcess(sessionId: string): void {
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
  changeDirectory(sessionId: string, directory: string): void {
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

    const output: TerminalOutput = {
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
  getSession(sessionId: string): TerminalSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): TerminalSession[] {
    return Array.from(this.sessions.values()).filter(session => session.isActive);
  }

  /**
   * Close a terminal session
   */
  closeSession(sessionId: string): void {
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
    
    logger.info(`Closed terminal session ${sessionId}`);
  }

  /**
   * Close all sessions
   */
  closeAllSessions(): void {
    for (const sessionId of this.sessions.keys()) {
      this.closeSession(sessionId);
    }
  }

  /**
   * Check if a command is a built-in command
   */
  private isBuiltInCommand(command: string): boolean {
    const builtInCommands = ['cd', 'pwd', 'clear', 'exit'];
    const cmd = command.trim().split(/\\s+/)[0];
    return builtInCommands.includes(cmd);
  }

  /**
   * Handle built-in commands
   */
  private async handleBuiltInCommand(sessionId: string, command: string): Promise<void> {
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
        } else {
          this.changeDirectory(sessionId, args[0]);
        }
        break;

      case 'pwd': {
        const output: TerminalOutput = {
          type: 'stdout',
          data: `${session.workingDirectory}\\n`,
          sessionId,
          timestamp: new Date()
        };
        this.emit('output', output);
        break;
      }

      case 'clear': {
        const clearOutput: TerminalOutput = {
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
  private isValidDirectory(directory: string): boolean {
    try {
      const fs = require('fs');
      const stat = fs.statSync(directory);
      return stat.isDirectory();
    } catch (error) {
      return false;
    }
  }

  /**
   * Setup cleanup interval for inactive sessions
   */
  private setupCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveSessions();
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  /**
   * Clean up inactive sessions
   */
  private cleanupInactiveSessions(): void {
    const now = Date.now();
    
    for (const [sessionId, session] of this.sessions) {
      if (now - session.lastActivity.getTime() > this.sessionTimeout) {
        logger.info(`Cleaning up inactive session ${sessionId}`);
        this.closeSession(sessionId);
      }
    }
  }

  /**
   * Clean up the oldest session when at capacity
   */
  private cleanupOldestSession(): void {
    let oldestSession: TerminalSession | null = null;
    let oldestSessionId: string | null = null;

    for (const [sessionId, session] of this.sessions) {
      if (!oldestSession || session.createdAt < oldestSession.createdAt) {
        oldestSession = session;
        oldestSessionId = sessionId;
      }
    }

    if (oldestSessionId) {
      logger.info(`Cleaning up oldest session ${oldestSessionId} due to capacity limit`);
      this.closeSession(oldestSessionId);
    }
  }

  /**
   * Cleanup on service shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.closeAllSessions();
  }
}

// Export singleton instance
export const terminalService = new TerminalService();