import { CommandExecutor, CommandExecutionError } from '../commandExecutor';
import { EventEmitter } from 'events';

describe('CommandExecutor', () => {
  let executor: CommandExecutor;

  beforeEach(() => {
    executor = new CommandExecutor();
  });

  afterEach(() => {
    // Clean up any active processes
    executor.killAllProcesses();
  });

  describe('Basic Command Execution', () => {
    it('should execute a simple echo command successfully', async () => {
      const result = await executor.executeCommand('echo', ['hello world']);

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('hello world');
      expect(result.stderr).toBe('');
      expect(result.signal).toBe(null);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should capture stdout correctly for ls command', async () => {
      const result = await executor.executeCommand('ls', ['-la'], {
        cwd: process.cwd()
      });

      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('.');
      expect(result.stdout).toContain('..');
    });

    it('should handle working directory option', async () => {
      const result = await executor.executeCommand('pwd', [], {
        cwd: '/tmp'
      });

      expect(result.success).toBe(true);
      expect(result.stdout).toMatch(/\/tmp$/);
    });
  });

  describe('Error Handling', () => {
    it('should handle command that does not exist', async () => {
      await expect(
        executor.executeCommand('nonexistentcommand', ['arg1'])
      ).rejects.toThrow(CommandExecutionError);
    });

    it('should capture stderr from failing command', async () => {
      try {
        await executor.executeCommand('ls', ['/nonexistent/directory']);
      } catch (error) {
        expect(error).toBeInstanceOf(CommandExecutionError);
        const cmdError = error as CommandExecutionError;
        expect(cmdError.result.success).toBe(false);
        expect(cmdError.result.exitCode).not.toBe(0);
        expect(cmdError.result.stderr).toContain('No such file');
      }
    });

    it('should handle timeout correctly', async () => {
      const startTime = Date.now();
      
      try {
        await executor.executeCommand('sleep', ['10'], {
          timeout: 1000 // 1 second timeout
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(2000); // Should timeout before 2 seconds
        expect(error).toBeInstanceOf(CommandExecutionError);
      }
    }, 15000);
  });

  describe('Environment Variables', () => {
    it('should pass environment variables to command', async () => {
      const result = await executor.executeCommand('node', ['-e', 'console.log(process.env.TEST_VAR)'], {
        env: { TEST_VAR: 'test_value' }
      });

      expect(result.success).toBe(true);
      expect(result.stdout).toBe('test_value');
    });
  });

  describe('Event Handling', () => {
    it('should emit progress events during command execution', async () => {
      const events: string[] = [];
      
      executor.on('progress', (processId: string, progress: any) => {
        events.push(progress.stage);
      });

      await executor.executeCommand('echo', ['test']);

      expect(events).toContain('starting');
      expect(events).toContain('running');
      expect(events).toContain('completed');
    });
  });

  describe('Sequential Execution', () => {
    it('should execute multiple commands in sequence', async () => {
      const commands = [
        { command: 'echo', args: ['first'] },
        { command: 'echo', args: ['second'] },
        { command: 'echo', args: ['third'] }
      ];

      const results = await executor.executeSequence(commands);

      expect(results).toHaveLength(3);
      expect(results[0].stdout).toBe('first');
      expect(results[1].stdout).toBe('second');
      expect(results[2].stdout).toBe('third');
      expect(results.every(r => r.success)).toBe(true);
    });

    it('should stop sequence on first failure', async () => {
      const commands = [
        { command: 'echo', args: ['first'] },
        { command: 'ls', args: ['/nonexistent'] },
        { command: 'echo', args: ['third'] }
      ];

      await expect(
        executor.executeSequence(commands)
      ).rejects.toThrow(CommandExecutionError);
    });
  });

  describe('Process Management', () => {
    it('should track active processes', async () => {
      expect(executor.getActiveProcessCount()).toBe(0);

      // Start a long-running command but don't await it
      const promise = executor.executeCommand('sleep', ['2']);
      
      // Check that process is tracked
      expect(executor.getActiveProcessCount()).toBe(1);

      // Wait for completion
      await promise;
      
      // Check that process is cleaned up
      expect(executor.getActiveProcessCount()).toBe(0);
    }, 10000);

    it('should be able to kill all processes', async () => {
      // Start multiple long-running commands
      const promise1 = executor.executeCommand('sleep', ['10']);
      const promise2 = executor.executeCommand('sleep', ['10']);

      expect(executor.getActiveProcessCount()).toBe(2);

      // Kill all processes
      executor.killAllProcesses();

      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(executor.getActiveProcessCount()).toBe(0);

      // The promises should reject due to process termination
      try {
        await promise1;
        // If we reach here, the process completed normally (which shouldn't happen)
        expect(false).toBe(true); // Force test failure with better message
      } catch (error) {
        expect(error).toBeInstanceOf(CommandExecutionError);
      }

      try {
        await promise2;
        // If we reach here, the process completed normally (which shouldn't happen)
        expect(false).toBe(true); // Force test failure with better message
      } catch (error) {
        expect(error).toBeInstanceOf(CommandExecutionError);
      }
    }, 15000);
  });

  describe('Shell Integration', () => {
    it('should work with shell commands when shell option is enabled', async () => {
      const result = await executor.executeCommand('echo $HOME', [], {
        shell: true
      });

      expect(result.success).toBe(true);
      expect(result.stdout).toBeTruthy();
    });
  });
});