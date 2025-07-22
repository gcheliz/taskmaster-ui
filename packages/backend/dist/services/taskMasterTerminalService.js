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
exports.taskMasterTerminalService = exports.TaskMasterTerminalService = void 0;
const events_1 = require("events");
const child_process_1 = require("child_process");
const uuid_1 = require("uuid");
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const logger_1 = require("../utils/logger");
const taskMasterService_1 = require("./taskMasterService");
const taskMasterOutputParser_1 = require("./taskMasterOutputParser");
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
class TaskMasterTerminalService extends events_1.EventEmitter {
    constructor(taskMasterService) {
        super();
        this.sessions = new Map();
        this.maxSessions = 20;
        this.sessionTimeout = 60 * 60 * 1000; // 60 minutes for TaskMaster work
        // TaskMaster CLI commands that require special handling
        this.TASKMASTER_COMMANDS = new Set(['task-master', 'taskmaster']);
        // TaskMaster CLI operations
        this.TASKMASTER_OPERATIONS = new Set([
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
        this.taskMasterService = taskMasterService || new taskMasterService_1.TaskMasterService();
        this.setupCleanupInterval();
        this.setupTaskMasterServiceEvents();
    }
    /**
     * Create a new TaskMaster terminal session
     */
    createSession(workingDirectory, repositoryPath, projectTag) {
        const sessionId = (0, uuid_1.v4)();
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
        const environment = this.setupTaskMasterEnvironment(cwd, detectedProjectTag);
        const session = {
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
        logger_1.logger.info(`Created TaskMaster terminal session ${sessionId} in ${cwd} (project: ${detectedProjectTag})`);
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
    async executeCommand(sessionId, command) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`TaskMaster terminal session not found: ${sessionId}`);
        }
        if (!session.isActive) {
            throw new Error(`TaskMaster terminal session is not active: ${sessionId}`);
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
        const cmdObject = {
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
        }
        else {
            await this.executeRegularCommand(session, command);
        }
    }
    /**
     * Execute TaskMaster CLI command with enhanced integration
     */
    async executeTaskMasterCommand(session, command) {
        try {
            // Parse and enhance the command
            const enhancedCommand = this.enhanceTaskMasterCommand(command, session);
            logger_1.logger.info(`Executing TaskMaster command: ${enhancedCommand}`);
            // Execute through TaskMaster service for better integration
            const result = await this.executeTaskMasterCLI(session.workingDirectory, enhancedCommand, session.environment);
            // Parse and emit output
            const output = {
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
        }
        catch (error) {
            const errorOutput = {
                type: 'stderr',
                data: error instanceof Error ? error.message : 'TaskMaster command failed',
                sessionId: session.id,
                timestamp: new Date(),
                isTaskMasterOutput: true,
            };
            this.emit('output', errorOutput);
            logger_1.logger.error(`TaskMaster command failed: ${command}`, {}, error instanceof Error ? error : new Error('Unknown error'));
        }
    }
    /**
     * Execute regular shell command
     */
    async executeRegularCommand(session, command) {
        return new Promise((resolve, reject) => {
            const args = this.parseCommand(command);
            const [cmd, ...cmdArgs] = args;
            const childProcess = (0, child_process_1.spawn)(cmd, cmdArgs, {
                cwd: session.workingDirectory,
                env: { ...process.env, ...session.environment },
                shell: true,
            });
            session.process = childProcess;
            childProcess.stdout?.on('data', data => {
                const output = {
                    type: 'stdout',
                    data: data.toString(),
                    sessionId: session.id,
                    timestamp: new Date(),
                };
                this.emit('output', output);
            });
            childProcess.stderr?.on('data', data => {
                const output = {
                    type: 'stderr',
                    data: data.toString(),
                    sessionId: session.id,
                    timestamp: new Date(),
                };
                this.emit('output', output);
            });
            childProcess.on('close', code => {
                const output = {
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
                const errorOutput = {
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
    enhanceTaskMasterCommand(command, session) {
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
    async executeTaskMasterCLI(workingDirectory, command, environment) {
        return new Promise(resolve => {
            const args = command.split(' ');
            const childProcess = (0, child_process_1.spawn)(args[0], args.slice(1), {
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
                const parsed = taskMasterOutputParser_1.taskMasterOutputParser.parseOutput(output, command);
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
    getTaskMasterSuggestions(sessionId, partialCommand) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return [];
        const suggestions = [];
        // Command completion
        if (partialCommand.startsWith('task-master ')) {
            const operation = partialCommand.substring(12).trim();
            for (const op of this.TASKMASTER_OPERATIONS) {
                if (op.startsWith(operation)) {
                    suggestions.push(`task-master ${op}`);
                }
            }
        }
        else if (partialCommand === 'task-master' ||
            'task-master'.startsWith(partialCommand)) {
            suggestions.push('task-master');
        }
        // History-based suggestions
        const historySuggestions = session.commandHistory
            .filter(cmd => cmd.startsWith(partialCommand) && !suggestions.includes(cmd))
            .slice(-5);
        suggestions.push(...historySuggestions);
        return suggestions;
    }
    /**
     * Get session information including TaskMaster-specific data
     */
    getSession(sessionId) {
        return this.sessions.get(sessionId) || null;
    }
    /**
     * Get all active TaskMaster terminal sessions
     */
    getActiveSessions() {
        return Array.from(this.sessions.values()).filter(s => s.isActive);
    }
    /**
     * Send input to a running process
     */
    sendInput(sessionId, input) {
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
    killProcess(sessionId) {
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
    closeSession(sessionId) {
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
        logger_1.logger.info(`Closed TaskMaster terminal session ${sessionId}`);
    }
    /**
     * Resize terminal (placeholder for future PTY integration)
     */
    resizeTerminal(sessionId, cols, rows) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`TaskMaster terminal session not found: ${sessionId}`);
        }
        // Future: Implement PTY resize
        logger_1.logger.info(`Terminal resize requested for session ${sessionId}: ${cols}x${rows}`);
    }
    // Private helper methods
    isValidDirectory(dir) {
        try {
            const stats = fs.statSync(dir);
            return stats.isDirectory();
        }
        catch {
            return false;
        }
    }
    detectProjectTag(workingDirectory) {
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
        }
        catch (error) {
            logger_1.logger.warn(`Failed to detect project tag: ${error}`);
            return path.basename(workingDirectory);
        }
    }
    setupTaskMasterEnvironment(workingDirectory, projectTag) {
        const env = {
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
    isTaskMasterCommand(command) {
        const parts = command.trim().split(/\s+/);
        return parts.length > 0 && this.TASKMASTER_COMMANDS.has(parts[0]);
    }
    isStateChangingCommand(command) {
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
    parseCommand(command) {
        // Simple command parsing - can be enhanced for complex shell parsing
        return command.trim().split(/\s+/);
    }
    cleanupOldestSession() {
        let oldestSession = null;
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
    setupCleanupInterval() {
        this.cleanupInterval = setInterval(() => {
            const cutoffTime = Date.now() - this.sessionTimeout;
            const sessionsToClose = [];
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
    setupTaskMasterServiceEvents() {
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
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        // Close all sessions
        for (const sessionId of this.sessions.keys()) {
            this.closeSession(sessionId);
        }
    }
}
exports.TaskMasterTerminalService = TaskMasterTerminalService;
// Singleton instance
exports.taskMasterTerminalService = new TaskMasterTerminalService();
//# sourceMappingURL=taskMasterTerminalService.js.map