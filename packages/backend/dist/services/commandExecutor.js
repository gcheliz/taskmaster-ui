"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandExecutor = exports.CommandExecutionError = exports.CommandExecutor = void 0;
const child_process_1 = require("child_process");
const events_1 = require("events");
class CommandExecutor extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.activeProcesses = new Map();
    }
    /**
     * Execute a shell command with comprehensive monitoring and error handling
     */
    async executeCommand(command, args = [], options = {}) {
        const startTime = Date.now();
        const processId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { cwd = process.cwd(), timeout = 30000, // 30 seconds default
        env = {}, shell = false } = options;
        // Merge environment variables
        const processEnv = { ...process.env, ...env };
        let stdout = '';
        let stderr = '';
        let exitCode = null;
        let signal = null;
        return new Promise((resolve, reject) => {
            // Emit starting event
            this.emit('progress', processId, {
                stage: 'starting'
            });
            // Spawn the process
            const childProcess = (0, child_process_1.spawn)(command, args, {
                cwd,
                env: processEnv,
                shell,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            // Track active process
            this.activeProcesses.set(processId, childProcess);
            // Set up timeout
            const timeoutHandle = setTimeout(() => {
                this.emit('progress', processId, {
                    stage: 'timeout'
                });
                childProcess.kill('SIGTERM');
                // Force kill after additional grace period
                setTimeout(() => {
                    if (!childProcess.killed) {
                        childProcess.kill('SIGKILL');
                    }
                }, 5000);
            }, timeout);
            // Handle stdout
            childProcess.stdout?.on('data', (data) => {
                const chunk = data.toString();
                stdout += chunk;
                this.emit('progress', processId, {
                    stdout: chunk,
                    stage: 'running'
                });
            });
            // Handle stderr
            childProcess.stderr?.on('data', (data) => {
                const chunk = data.toString();
                stderr += chunk;
                this.emit('progress', processId, {
                    stderr: chunk,
                    stage: 'running'
                });
            });
            // Handle process completion
            childProcess.on('close', (code, killSignal) => {
                clearTimeout(timeoutHandle);
                this.activeProcesses.delete(processId);
                exitCode = code;
                signal = killSignal;
                const duration = Date.now() - startTime;
                const success = code === 0;
                const result = {
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    exitCode,
                    signal,
                    success,
                    duration
                };
                this.emit('progress', processId, {
                    stage: success ? 'completed' : 'failed'
                });
                if (success) {
                    resolve(result);
                }
                else {
                    reject(new CommandExecutionError(`Command failed: ${command} ${args.join(' ')}`, result));
                }
            });
            // Handle process errors
            childProcess.on('error', (error) => {
                clearTimeout(timeoutHandle);
                this.activeProcesses.delete(processId);
                const duration = Date.now() - startTime;
                const result = {
                    stdout: stdout.trim(),
                    stderr: stderr.trim() + `\nProcess Error: ${error.message}`,
                    exitCode: null,
                    signal: null,
                    success: false,
                    duration
                };
                this.emit('progress', processId, {
                    stage: 'failed'
                });
                reject(new CommandExecutionError(`Command execution error: ${error.message}`, result));
            });
        });
    }
    /**
     * Execute multiple commands in sequence
     */
    async executeSequence(commands) {
        const results = [];
        for (const cmd of commands) {
            try {
                const result = await this.executeCommand(cmd.command, cmd.args || [], cmd.options || {});
                results.push(result);
            }
            catch (error) {
                // Add the failed result to the array
                if (error instanceof CommandExecutionError) {
                    results.push(error.result);
                }
                throw error; // Re-throw to stop sequence
            }
        }
        return results;
    }
    /**
     * Kill all active processes
     */
    killAllProcesses() {
        for (const [processId, process] of this.activeProcesses) {
            process.kill('SIGTERM');
            // Force kill after grace period
            setTimeout(() => {
                if (!process.killed) {
                    process.kill('SIGKILL');
                }
            }, 5000);
        }
        this.activeProcesses.clear();
    }
    /**
     * Get count of active processes
     */
    getActiveProcessCount() {
        return this.activeProcesses.size;
    }
}
exports.CommandExecutor = CommandExecutor;
class CommandExecutionError extends Error {
    constructor(message, result) {
        super(message);
        this.result = result;
        this.name = 'CommandExecutionError';
    }
}
exports.CommandExecutionError = CommandExecutionError;
// Export singleton instance
exports.commandExecutor = new CommandExecutor();
//# sourceMappingURL=commandExecutor.js.map