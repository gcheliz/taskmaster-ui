import { AgentCommandRouter, handleClaudeCommand } from './command-router';
import { AgentFileWatcher, defaultWatcherConfig } from './file-watcher';
import { TaskMasterIntegration, handleTaskMasterHook } from './task-master-integration';
import { logger } from '../packages/backend/src/utils/winston-adapter';

// Re-export main components
export { AgentCommandRouter, handleClaudeCommand } from './command-router';
export { AgentFileWatcher } from './file-watcher';
export { TaskMasterIntegration } from './task-master-integration';

// Re-export code review agent
export { 
  codeReviewEngine,
  runCodeReview,
  reviewAndFormat,
  initializeCodeReviewAgent
} from './code-review-agent';

// Agent system configuration
interface AgentSystemConfig {
  workspacePath: string;
  enableFileWatcher: boolean;
  enableTaskIntegration: boolean;
  autoExecute: boolean;
}

/**
 * Main agent system orchestrator
 */
export class ClaudeAgentSystem {
  private config: AgentSystemConfig;
  private router: AgentCommandRouter;
  private fileWatcher?: AgentFileWatcher;
  private taskIntegration?: TaskMasterIntegration;

  constructor(config: Partial<AgentSystemConfig> = {}) {
    this.config = {
      workspacePath: process.cwd(),
      enableFileWatcher: true,
      enableTaskIntegration: true,
      autoExecute: false,
      ...config,
    };

    this.router = new AgentCommandRouter({
      workspacePath: this.config.workspacePath,
      environment: 'development',
    });
  }

  /**
   * Initialize the agent system
   */
  async initialize(): Promise<void> {
    logger.info('Initializing Claude Agent System', this.config);

    // Initialize file watcher
    if (this.config.enableFileWatcher) {
      this.fileWatcher = new AgentFileWatcher({
        ...defaultWatcherConfig,
        workspacePath: this.config.workspacePath,
        enabled: true,
      });
      this.fileWatcher.start();
    }

    // Initialize task integration
    if (this.config.enableTaskIntegration) {
      this.taskIntegration = new TaskMasterIntegration(this.config.workspacePath);
      
      // Start watching for task changes
      this.taskIntegration.watchTasks(async (task) => {
        logger.info(`Task context updated: ${task.taskId}`);
        if (this.config.autoExecute) {
          await this.taskIntegration.processTask(task);
        }
      });
    }

    // Initialize code review agent
    await initializeCodeReviewAgent(this.config.workspacePath);

    logger.info('Claude Agent System initialized successfully');
  }

  /**
   * Shutdown the agent system
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down Claude Agent System');

    if (this.fileWatcher) {
      this.fileWatcher.stop();
    }

    logger.info('Claude Agent System shutdown complete');
  }

  /**
   * Execute a command
   */
  async executeCommand(commandLine: string): Promise<string> {
    return handleClaudeCommand(commandLine, this.config.workspacePath);
  }

  /**
   * Get system status
   */
  getStatus(): object {
    return {
      initialized: true,
      config: this.config,
      fileWatcher: this.config.enableFileWatcher ? 'active' : 'disabled',
      taskIntegration: this.config.enableTaskIntegration ? 'active' : 'disabled',
      commandHistory: this.router.getCommandHistory().length,
    };
  }
}

// CLI entry point
if (require.main === module) {
  const system = new ClaudeAgentSystem();
  
  // Handle process signals
  process.on('SIGINT', async () => {
    await system.shutdown();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await system.shutdown();
    process.exit(0);
  });
  
  // Initialize system
  system.initialize().catch(error => {
    logger.error('Failed to initialize agent system:', error);
    process.exit(1);
  });
  
  // Handle commands from stdin
  if (process.argv.includes('--interactive')) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'claude> ',
    });
    
    rl.prompt();
    
    rl.on('line', async (line: string) => {
      if (line.trim() === 'exit') {
        await system.shutdown();
        process.exit(0);
      }
      
      try {
        const result = await system.executeCommand(line.trim());
        console.log(result);
      } catch (error) {
        console.error('Command failed:', error.message);
      }
      
      rl.prompt();
    });
  }
}

/**
 * Export convenience functions for slash commands
 */
export const agentCommands = {
  '/api-generate': 'Generate a new API endpoint with full stack implementation',
  '/db-migrate': 'Generate and manage database migrations',
  '/db-seed': 'Generate seed data scripts for testing',
  '/db-schema': 'Update Prisma schema',
  '/db-optimize': 'Analyze and optimize database queries',
  '/test-generate': 'Generate tests for code',
  '/review': 'Run code review on files',
  '/docs': 'Generate or update documentation',
  '/feature': 'Start a feature development workflow',
  '/bugfix': 'Start a bug fix workflow',
};