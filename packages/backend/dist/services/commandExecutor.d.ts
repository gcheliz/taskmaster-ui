import { EventEmitter } from 'events';
export interface CommandResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
    signal: NodeJS.Signals | null;
    success: boolean;
    duration: number;
}
export interface CommandOptions {
    cwd?: string;
    timeout?: number;
    env?: Record<string, string>;
    shell?: boolean;
}
export interface CommandProgress {
    stdout?: string;
    stderr?: string;
    stage: 'starting' | 'running' | 'completed' | 'failed' | 'timeout';
}
export declare class CommandExecutor extends EventEmitter {
    private activeProcesses;
    /**
     * Execute a shell command with comprehensive monitoring and error handling
     */
    executeCommand(command: string, args?: string[], options?: CommandOptions): Promise<CommandResult>;
    /**
     * Execute multiple commands in sequence
     */
    executeSequence(commands: Array<{
        command: string;
        args?: string[];
        options?: CommandOptions;
    }>): Promise<CommandResult[]>;
    /**
     * Kill all active processes
     */
    killAllProcesses(): void;
    /**
     * Get count of active processes
     */
    getActiveProcessCount(): number;
}
export declare class CommandExecutionError extends Error {
    result: CommandResult;
    constructor(message: string, result: CommandResult);
}
export declare const commandExecutor: CommandExecutor;
//# sourceMappingURL=commandExecutor.d.ts.map