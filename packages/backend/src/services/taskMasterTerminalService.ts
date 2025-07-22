import { EventEmitter } from 'events';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { logger } from '../utils/logger';
import { TaskMasterService } from './taskMasterService';
import { taskMasterCommandBuilder } from './taskMasterCommandBuilder';
import { taskMasterOutputParser } from './taskMasterOutputParser';

export interface TaskMasterTerminalSession {
  id: string;
  workingDirectory: string;
  repositoryPath?: string;
  projectTag?: string;
  shell: string;
  process?: ChildProcessWithoutNullStreams;
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
  taskMasterIntegrated: boolean;
  commandHistory: string[];
  environment: Record<string, string>;
}

export interface TaskMasterTerminalCommand {
  command: string;
  sessionId: string;
  timestamp: Date;
  isTaskMasterCommand: boolean;
  projectTag?: string;
}

export interface TaskMasterTerminalOutput {
  type: 'stdout' | 'stderr' | 'exit' | 'taskmaster-result';
  data: string;
  sessionId: string;
  timestamp: Date;
  isTaskMasterOutput?: boolean;
  parsed?: any;
}

/**
 * TaskMaster Terminal Service
 *
 * Specialized terminal service that provides seamless integration with TaskMaster CLI.
 * Features:
 * - TaskMaster CLI command detection and execution
 * - Automatic project tag injection
 * - Command output parsing and enhancement
 * - Real-time command completion suggestions
 * - TaskMaster-specific environment setup
 */
export class TaskMasterTerminalService extends EventEmitter {
  private sessions: Map<string, TaskMasterTerminalSession> = new Map();
  private taskMasterService: TaskMasterService;
  private readonly maxSessions = 20;
  private readonly sessionTimeout = 60 * 60 * 1000; // 60 minutes for TaskMaster work
  private cleanupInterval: NodeJS.Timeout | undefined;

  // TaskMaster CLI commands that require special handling
  private readonly TASKMASTER_COMMANDS = new Set(['task-master', 'taskmaster']);

  // TaskMaster CLI operations
  private readonly TASKMASTER_OPERATIONS = new Set([
    'init',
    'list',
    'next',
    'show',
    'set-status',
    'add-task',
    'expand',
    'update-task',
    'update-subtask',
    'analyze-complexity',
    'complexity-report',
    'add-dependency',
    'move',
    'validate-dependencies',
    'generate',
    'models',
    'parse-prd',
  ]);

  constructor(taskMasterService?: TaskMasterService) {
    super();
    this.taskMasterService = taskMasterService || new TaskMasterService();
    this.setupCleanupInterval();
    this.setupTaskMasterServiceEvents();
  }

  /**
   * Create a new TaskMaster terminal session
   */
  createSession(
    workingDirectory?: string,
    repositoryPath?: string,
    projectTag?: string
  ): string {
    const sessionId = uuidv4();
    const defaultShell = os.platform() === 'win32' ? 'cmd.exe' : '/bin/bash';
    const cwd = workingDirectory || repositoryPath || process.cwd();

    // Validate working directory
    if (!this.isValidDirectory(cwd)) {
      throw new Error(`Invalid working directory: ${cwd}`);
    }

    // Detect project tag if not provided
    const detectedProjectTag = projectTag || this.detectProjectTag(cwd);

    // Check session limit
    if (this.sessions.size >= this.maxSessions) {
      this.cleanupOldestSession();
    }

    // Setup TaskMaster environment
    const environment = this.setupTaskMasterEnvironment(
      cwd,
      detectedProjectTag
    );

    const session: TaskMasterTerminalSession = {
      id: sessionId,
      workingDirectory: cwd,
      repositoryPath,
      projectTag: detectedProjectTag,
      shell: defaultShell,
      isActive: true,
      createdAt: new Date(),
      lastActivity: new Date(),
      taskMasterIntegrated: true,
      commandHistory: [],
      environment,
    };

    this.sessions.set(sessionId, session);
    logger.info(
      `Created TaskMaster terminal session ${sessionId} in ${cwd} (project: ${detectedProjectTag})`
    );

    // Emit session created event
    this.emit('session-created', {
      sessionId,
      workingDirectory: cwd,
      projectTag: detectedProjectTag,
    });

    return sessionId;
  }

  /**
   * Execute a command in a TaskMaster terminal session
   */
  async executeCommand(sessionId: string, command: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`TaskMaster terminal session not found: ${sessionId}`);
    }

    if (!session.isActive) {
      throw new Error(
        `TaskMaster terminal session is not active: ${sessionId}`
      );
    }

    // Update last activity and add to history
    session.lastActivity = new Date();
    session.commandHistory.push(command);

    // Keep only last 100 commands in history
    if (session.commandHistory.length > 100) {
      session.commandHistory = session.commandHistory.slice(-100);
    }

    const isTaskMasterCommand = this.isTaskMasterCommand(command);

    // Create command object
    const cmdObject: TaskMasterTerminalCommand = {
      command,
      sessionId,
      timestamp: new Date(),
      isTaskMasterCommand,
      projectTag: session.projectTag,
    };

    // Emit command event
    this.emit('command-executed', cmdObject);

    if (isTaskMasterCommand) {
      await this.executeTaskMasterCommand(session, command);
    } else {
      await this.executeRegularCommand(session, command);
    }
  }

  /**
   * Execute TaskMaster CLI command with enhanced integration
   */
  private async executeTaskMasterCommand(
    session: TaskMasterTerminalSession,
    command: string
  ): Promise<void> {
    try {
      // Parse and enhance the command
      const enhancedCommand = this.enhanceTaskMasterCommand(command, session);

      logger.info(`Executing TaskMaster command: ${enhancedCommand}`);

      // Execute through TaskMaster service for better integration
      const result = await this.executeTaskMasterCLI(
        session.workingDirectory,
        enhancedCommand,
        session.environment
      );

      // Parse and emit output
      const output: TaskMasterTerminalOutput = {
        type: 'taskmaster-result',
        data: result.output,
        sessionId: session.id,
        timestamp: new Date(),
        isTaskMasterOutput: true,
        parsed: result.parsed,
      };

      this.emit('output', output);

      // If command was successful and modified state, emit state change
      if (result.success && this.isStateChangingCommand(command)) {
        this.emit('taskmaster-state-changed', {
          sessionId: session.id,
          command: enhancedCommand,
          workingDirectory: session.workingDirectory,
          projectTag: session.projectTag,
        });
      }
    } catch (error) {
      const errorOutput: TaskMasterTerminalOutput = {
        type: 'stderr',
        data:
          error instanceof Error ? error.message : 'TaskMaster command failed',
        sessionId: session.id,
        timestamp: new Date(),
        isTaskMasterOutput: true,
      };

      this.emit('output', errorOutput);
      logger.error(
        `TaskMaster command failed: ${command}`,
        {},
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Execute regular shell command
   */
  private async executeRegularCommand(
    session: TaskMasterTerminalSession,
    command: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = this.parseCommand(command);
      const [cmd, ...cmdArgs] = args;

      const childProcess = spawn(cmd, cmdArgs, {
        cwd: session.workingDirectory,
        env: { ...process.env, ...session.environment },
        shell: true,
      });

      session.process = childProcess;

      childProcess.stdout?.on('data', data => {
        const output: TaskMasterTerminalOutput = {
          type: 'stdout',
          data: data.toString(),
          sessionId: session.id,
          timestamp: new Date(),
        };
        this.emit('output', output);
      });

      childProcess.stderr?.on('data', data => {
        const output: TaskMasterTerminalOutput = {
          type: 'stderr',
          data: data.toString(),
          sessionId: session.id,
          timestamp: new Date(),
        };
        this.emit('output', output);
      });

      childProcess.on('close', code => {
        const output: TaskMasterTerminalOutput = {
          type: 'exit',
          data: `Process exited with code ${code}`,
          sessionId: session.id,
          timestamp: new Date(),
        };

        this.emit('output', output);
        session.process = undefined;
        resolve();
      });

      childProcess.on('error', error => {
        const errorOutput: TaskMasterTerminalOutput = {
          type: 'stderr',
          data: `Command failed: ${error.message}`,
          sessionId: session.id,
          timestamp: new Date(),
        };

        this.emit('output', errorOutput);
        session.process = undefined;
        reject(error);
      });
    });
  }

  /**
   * Enhance TaskMaster command with automatic project tag injection
   */
  private enhanceTaskMasterCommand(
    command: string,
    session: TaskMasterTerminalSession
  ): string {
    // If project tag exists and command doesn't already have --tag, add it
    if (session.projectTag && !command.includes('--tag=')) {
      const parts = command.split(' ');
      if (parts.length > 1 && this.TASKMASTER_OPERATIONS.has(parts[1])) {
        return `${command} --tag=${session.projectTag}`;
      }
    }
    return command;
  }

  /**
   * Execute TaskMaster CLI command using the command executor
   */
  private async executeTaskMasterCLI(
    workingDirectory: string,
    command: string,
    environment: Record<string, string>
  ): Promise<{ output: string; parsed: any; success: boolean }> {
    return new Promise(resolve => {
      const args = command.split(' ');
      const childProcess = spawn(args[0], args.slice(1), {
        cwd: workingDirectory,
        env: { ...process.env, ...environment },
        shell: false,
      });

      let stdout = '';
      let stderr = '';

      childProcess.stdout?.on('data', data => {
        stdout += data.toString();
      });

      childProcess.stderr?.on('data', data => {
        stderr += data.toString();
      });

      childProcess.on('close', code => {
        const output = stdout + stderr;
        const parsed = taskMasterOutputParser.parseOutput(output, command);

        resolve({
          output,
          parsed,
          success: code === 0,
        });
      });

      childProcess.on('error', error => {
        resolve({
          output: `Error executing TaskMaster CLI: ${error.message}`,
          parsed: null,
          success: false,
        });
      });
    });
  }

  /**
   * Get TaskMaster command suggestions based on current input
   */
  getTaskMasterSuggestions(
    sessionId: string,
    partialCommand: string
  ): string[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    const suggestions: string[] = [];

    // Command completion
    if (partialCommand.startsWith('task-master ')) {
      const operation = partialCommand.substring(12).trim();

      for (const op of this.TASKMASTER_OPERATIONS) {
        if (op.startsWith(operation)) {
          suggestions.push(`task-master ${op}`);
        }
      }
    } else if (
      partialCommand === 'task-master' ||
      'task-master'.startsWith(partialCommand)
    ) {
      suggestions.push('task-master');
    }

    // History-based suggestions
    const historySuggestions = session.commandHistory
      .filter(
        cmd => cmd.startsWith(partialCommand) && !suggestions.includes(cmd)
      )
      .slice(-5);

    suggestions.push(...historySuggestions);

    return suggestions;
  }

  /**
   * Get session information including TaskMaster-specific data
   */
  getSession(sessionId: string): TaskMasterTerminalSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all active TaskMaster terminal sessions
   */
  getActiveSessions(): TaskMasterTerminalSession[] {
    return Array.from(this.sessions.values()).filter(s => s.isActive);
  }

  /**
   * Send input to a running process
   */
  sendInput(sessionId: string, input: string): void {
    const session = this.sessions.get(sessionId);
    if (!session?.process?.stdin) {
      throw new Error(`No active process in session ${sessionId}`);
    }

    session.process.stdin.write(input);
    session.lastActivity = new Date();
  }

  /**
   * Kill running process in a session
   */
  killProcess(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session?.process) {
      throw new Error(`No active process in session ${sessionId}`);
    }

    session.process.kill('SIGTERM');
    session.process = undefined;
  }

  /**
   * Close a TaskMaster terminal session
   */
  closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`TaskMaster terminal session not found: ${sessionId}`);
    }

    // Kill any running process
    if (session.process) {
      session.process.kill('SIGTERM');
    }

    session.isActive = false;
    this.sessions.delete(sessionId);

    this.emit('session-closed', { sessionId });
    logger.info(`Closed TaskMaster terminal session ${sessionId}`);
  }

  /**
   * Resize terminal (placeholder for future PTY integration)
   */
  resizeTerminal(sessionId: string, cols: number, rows: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`TaskMaster terminal session not found: ${sessionId}`);
    }

    // Future: Implement PTY resize
    logger.info(
      `Terminal resize requested for session ${sessionId}: ${cols}x${rows}`
    );
  }

  // Private helper methods

  private isValidDirectory(dir: string): boolean {
    try {
      const stats = fs.statSync(dir);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  private detectProjectTag(workingDirectory: string): string | undefined {
    try {
      // Look for .taskmaster/config.json or tasks.json
      const taskMasterDir = path.join(workingDirectory, '.taskmaster');

      if (fs.existsSync(taskMasterDir)) {
        const tasksJsonPath = path.join(taskMasterDir, 'tasks', 'tasks.json');

        if (fs.existsSync(tasksJsonPath)) {
          const tasksData = JSON.parse(fs.readFileSync(tasksJsonPath, 'utf8'));

          // Extract project tag from tasks.json structure
          const projectTags = Object.keys(tasksData);
          if (projectTags.length > 0) {
            return projectTags[0]; // Use first project tag found
          }
        }
      }

      // Fallback: use directory name
      return path.basename(workingDirectory);
    } catch (error) {
      logger.warn(`Failed to detect project tag: ${error}`);
      return path.basename(workingDirectory);
    }
  }

  private setupTaskMasterEnvironment(
    workingDirectory: string,
    projectTag?: string
  ): Record<string, string> {
    const env: Record<string, string> = {
      TASKMASTER_WORKING_DIR: workingDirectory,
    };

    if (projectTag) {
      env.TASKMASTER_PROJECT_TAG = projectTag;
    }

    // Add .taskmaster/bin to PATH if exists
    const taskMasterBin = path.join(workingDirectory, '.taskmaster', 'bin');
    if (fs.existsSync(taskMasterBin)) {
      env.PATH = `${taskMasterBin}:${process.env.PATH || ''}`;
    }

    return env;
  }

  private isTaskMasterCommand(command: string): boolean {
    const parts = command.trim().split(/\s+/);
    return parts.length > 0 && this.TASKMASTER_COMMANDS.has(parts[0]);
  }

  private isStateChangingCommand(command: string): boolean {
    const stateChangingOps = new Set([
      'set-status',
      'add-task',
      'expand',
      'update-task',
      'update-subtask',
      'add-dependency',
      'move',
      'init',
    ]);

    const parts = command.split(' ');
    return parts.length > 1 && stateChangingOps.has(parts[1]);
  }

  private parseCommand(command: string): string[] {
    // Simple command parsing - can be enhanced for complex shell parsing
    return command.trim().split(/\s+/);
  }

  private cleanupOldestSession(): void {
    let oldestSession: TaskMasterTerminalSession | null = null;
    let oldestTime = Date.now();

    for (const session of this.sessions.values()) {
      if (session.lastActivity.getTime() < oldestTime) {
        oldestTime = session.lastActivity.getTime();
        oldestSession = session;
      }
    }

    if (oldestSession) {
      this.closeSession(oldestSession.id);
    }
  }

  private setupCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      const cutoffTime = Date.now() - this.sessionTimeout;
      const sessionsToClose: string[] = [];

      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.lastActivity.getTime() < cutoffTime) {
          sessionsToClose.push(sessionId);
        }
      }

      sessionsToClose.forEach(sessionId => {
        this.closeSession(sessionId);
      });
    }, 60000); // Check every minute
  }

  private setupTaskMasterServiceEvents(): void {
    this.taskMasterService.on('task-updated', data => {
      this.emit('taskmaster-task-updated', data);
    });

    this.taskMasterService.on('error', error => {
      this.emit('taskmaster-error', error);
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Close all sessions
    for (const sessionId of this.sessions.keys()) {
      this.closeSession(sessionId);
    }
  }
}

// Singleton instance
export const taskMasterTerminalService = new TaskMasterTerminalService();
