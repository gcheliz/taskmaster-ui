import { spawn, ChildProcess } from 'child_process';
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

export class CommandExecutor extends EventEmitter {
  private activeProcesses: Map<string, ChildProcess> = new Map();

  /**
   * Execute a shell command with comprehensive monitoring and error handling
   */
  async executeCommand(
    command: string,
    args: string[] = [],
    options: CommandOptions = {}
  ): Promise<CommandResult> {
    const startTime = Date.now();
    const processId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const {
      cwd = process.cwd(),
      timeout = 30000, // 30 seconds default
      env = {},
      shell = false
    } = options;

    // Merge environment variables
    const processEnv = { ...process.env, ...env };

    let stdout = '';
    let stderr = '';
    let exitCode: number | null = null;
    let signal: NodeJS.Signals | null = null;

    return new Promise((resolve, reject) => {
      // Emit starting event
      this.emit('progress', processId, {
        stage: 'starting'
      } as CommandProgress);

      // Spawn the process
      const childProcess = spawn(command, args, {
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
        } as CommandProgress);
        
        childProcess.kill('SIGTERM');
        
        // Force kill after additional grace period
        setTimeout(() => {
          if (!childProcess.killed) {
            childProcess.kill('SIGKILL');
          }
        }, 5000);
      }, timeout);

      // Handle stdout
      childProcess.stdout?.on('data', (data: Buffer) => {
        const chunk = data.toString();
        stdout += chunk;
        
        this.emit('progress', processId, {
          stdout: chunk,
          stage: 'running'
        } as CommandProgress);
      });

      // Handle stderr
      childProcess.stderr?.on('data', (data: Buffer) => {
        const chunk = data.toString();
        stderr += chunk;
        
        this.emit('progress', processId, {
          stderr: chunk,
          stage: 'running'
        } as CommandProgress);
      });

      // Handle process completion
      childProcess.on('close', (code, killSignal) => {
        clearTimeout(timeoutHandle);
        this.activeProcesses.delete(processId);
        
        exitCode = code;
        signal = killSignal;
        
        const duration = Date.now() - startTime;
        const success = code === 0;
        
        const result: CommandResult = {
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode,
          signal,
          success,
          duration
        };

        this.emit('progress', processId, {
          stage: success ? 'completed' : 'failed'
        } as CommandProgress);

        if (success) {
          resolve(result);
        } else {
          reject(new CommandExecutionError(
            `Command failed: ${command} ${args.join(' ')}`,
            result
          ));
        }
      });

      // Handle process errors
      childProcess.on('error', (error) => {
        clearTimeout(timeoutHandle);
        this.activeProcesses.delete(processId);
        
        const duration = Date.now() - startTime;
        
        const result: CommandResult = {
          stdout: stdout.trim(),
          stderr: stderr.trim() + `\nProcess Error: ${error.message}`,
          exitCode: null,
          signal: null,
          success: false,
          duration
        };

        this.emit('progress', processId, {
          stage: 'failed'
        } as CommandProgress);

        reject(new CommandExecutionError(
          `Command execution error: ${error.message}`,
          result
        ));
      });
    });
  }

  /**
   * Execute multiple commands in sequence
   */
  async executeSequence(
    commands: Array<{ command: string; args?: string[]; options?: CommandOptions }>
  ): Promise<CommandResult[]> {
    const results: CommandResult[] = [];
    
    for (const cmd of commands) {
      try {
        const result = await this.executeCommand(
          cmd.command,
          cmd.args || [],
          cmd.options || {}
        );
        results.push(result);
      } catch (error) {
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
  killAllProcesses(): void {
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
  getActiveProcessCount(): number {
    return this.activeProcesses.size;
  }
}

export class CommandExecutionError extends Error {
  constructor(
    message: string,
    public result: CommandResult
  ) {
    super(message);
    this.name = 'CommandExecutionError';
  }
}

// Export singleton instance
export const commandExecutor = new CommandExecutor();