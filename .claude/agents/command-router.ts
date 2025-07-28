import { promises as fs } from 'fs';
import path from 'path';
import { handleAPICommand } from './backend-agents/api-development-commands';
import { handleDatabaseCommand } from './backend-agents/database-management-commands';
import { logger } from '../packages/backend/src/utils/winston-adapter';

interface CommandContext {
  workspacePath: string;
  environment: 'development' | 'staging' | 'production';
  user?: string;
}

interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
  files?: string[];
  error?: string;
}

export class AgentCommandRouter {
  private context: CommandContext;
  private commandHistory: Array<{ command: string; timestamp: Date; result: CommandResult }> = [];

  constructor(context: CommandContext) {
    this.context = context;
  }

  /**
   * Route commands to appropriate agents
   */
  async executeCommand(command: string, args: any): Promise<CommandResult> {
    const startTime = Date.now();
    
    try {
      let result: CommandResult;

      // Parse command category
      if (command.startsWith('/api-')) {
        result = await this.handleAPICommands(command, args);
      } else if (command.startsWith('/db-')) {
        result = await this.handleDatabaseCommands(command, args);
      } else if (command.startsWith('/test-')) {
        result = await this.handleTestCommands(command, args);
      } else if (command.startsWith('/review')) {
        result = await this.handleReviewCommand(command, args);
      } else if (command.startsWith('/docs')) {
        result = await this.handleDocumentationCommand(command, args);
      } else if (command.startsWith('/feature') || command.startsWith('/bugfix')) {
        result = await this.handleWorkflowCommand(command, args);
      } else {
        result = {
          success: false,
          message: `Unknown command: ${command}`,
          error: 'UNKNOWN_COMMAND',
        };
      }

      // Log command execution
      this.commandHistory.push({
        command,
        timestamp: new Date(),
        result,
      });

      // Track metrics
      const duration = Date.now() - startTime;
      logger.info(`Command executed: ${command}`, {
        duration,
        success: result.success,
        filesChanged: result.files?.length || 0,
      });

      return result;
    } catch (error) {
      logger.error(`Command execution failed: ${command}`, error);
      return {
        success: false,
        message: `Command failed: ${error.message}`,
        error: error.stack,
      };
    }
  }

  /**
   * Handle API-related commands
   */
  private async handleAPICommands(command: string, args: any): Promise<CommandResult> {
    const subCommand = command.replace('/api-', '');
    
    switch (subCommand) {
      case 'generate':
        return await handleAPICommand('generate', {
          endpoint: args.endpoint,
          method: args.method,
          description: args.description,
          authentication: args.auth !== false,
          validation: args.validation ? JSON.parse(args.validation) : undefined,
          modelName: args.model,
        });
      
      case 'docs':
        return await handleAPICommand('document', {
          format: args.format || 'openapi',
        });
      
      case 'validate':
        return await handleAPICommand('validate', {
          path: args.path,
        });
      
      default:
        return {
          success: false,
          message: `Unknown API command: ${subCommand}`,
        };
    }
  }

  /**
   * Handle database-related commands
   */
  private async handleDatabaseCommands(command: string, args: any): Promise<CommandResult> {
    const subCommand = command.replace('/db-', '');
    
    switch (subCommand) {
      case 'schema':
        return await handleDatabaseCommand('schema', {
          model: args.model,
          action: args.action,
          fields: args.fields ? JSON.parse(args.fields) : undefined,
          indexes: args.indexes ? JSON.parse(args.indexes) : undefined,
        });
      
      case 'migrate':
        return await handleDatabaseCommand('migrate', {
          name: args.name,
          description: args.description,
          autoApply: args.autoApply || false,
          environment: args.environment || 'development',
        });
      
      case 'seed':
        return await handleDatabaseCommand('seed', {
          model: args.model,
          count: args.count || 10,
          fields: args.fields ? JSON.parse(args.fields) : undefined,
        });
      
      case 'optimize':
        return await handleDatabaseCommand('optimize', {
          model: args.model,
        });
      
      case 'validate':
        return await handleDatabaseCommand('validate', {
          name: args.name,
          path: args.path,
        });
      
      case 'apply':
        return await handleDatabaseCommand('apply', {
          environment: args.environment || 'development',
        });
      
      default:
        return {
          success: false,
          message: `Unknown database command: ${subCommand}`,
        };
    }
  }

  /**
   * Handle test-related commands
   */
  private async handleTestCommands(command: string, args: any): Promise<CommandResult> {
    // Placeholder for testing agent integration
    return {
      success: false,
      message: 'Testing agents not yet implemented',
    };
  }

  /**
   * Handle code review command
   */
  private async handleReviewCommand(command: string, args: any): Promise<CommandResult> {
    // Placeholder for code review agent integration
    return {
      success: false,
      message: 'Code review agent not yet implemented',
    };
  }

  /**
   * Handle documentation command
   */
  private async handleDocumentationCommand(command: string, args: any): Promise<CommandResult> {
    // Placeholder for documentation agent integration
    return {
      success: false,
      message: 'Documentation agent not yet implemented',
    };
  }

  /**
   * Handle workflow commands
   */
  private async handleWorkflowCommand(command: string, args: any): Promise<CommandResult> {
    // Placeholder for workflow orchestration
    return {
      success: false,
      message: 'Workflow orchestration not yet implemented',
    };
  }

  /**
   * Get command history
   */
  getCommandHistory(): Array<{ command: string; timestamp: Date; result: CommandResult }> {
    return this.commandHistory;
  }

  /**
   * Auto-trigger based on file changes
   */
  async handleFileChange(filePath: string, changeType: 'add' | 'change' | 'unlink'): Promise<void> {
    const relativePath = path.relative(this.context.workspacePath, filePath);
    
    // API endpoint changes
    if (relativePath.match(/routes\/.*\.ts$/) && changeType === 'add') {
      logger.info(`New route file detected: ${relativePath}`);
      // Could auto-generate controller and service
    }
    
    // Schema changes
    if (relativePath.includes('schema.prisma') && changeType === 'change') {
      logger.info(`Schema change detected, consider running migration`);
      // Could auto-suggest migration
    }
    
    // Test file changes
    if (relativePath.match(/__tests__\/.*\.test\.ts$/) && changeType === 'change') {
      logger.info(`Test file changed: ${relativePath}`);
      // Could auto-run related tests
    }
  }
}

/**
 * Parse command line arguments into structured format
 */
export function parseCommandArgs(commandLine: string): { command: string; args: any } {
  const parts = commandLine.split(' ');
  const command = parts[0];
  const args: any = {};
  
  // Parse --key=value format
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('--')) {
      const [key, ...valueParts] = part.substring(2).split('=');
      const value = valueParts.join('=');
      
      // Handle boolean flags
      if (!value) {
        args[key] = true;
      } else {
        // Try to parse JSON
        try {
          args[key] = JSON.parse(value);
        } catch {
          // Not JSON, treat as string
          args[key] = value;
        }
      }
    }
  }
  
  return { command, args };
}

/**
 * Integration with Claude slash commands
 */
export async function handleClaudeCommand(commandLine: string, workspacePath: string): Promise<string> {
  const { command, args } = parseCommandArgs(commandLine);
  
  const router = new AgentCommandRouter({
    workspacePath,
    environment: 'development',
    user: 'claude',
  });
  
  const result = await router.executeCommand(command, args);
  
  // Format result for Claude
  if (result.success) {
    let output = `✅ ${result.message}`;
    
    if (result.files && result.files.length > 0) {
      output += '\n\nGenerated files:';
      result.files.forEach(file => {
        output += `\n- ${file}`;
      });
    }
    
    if (result.data) {
      output += '\n\nAdditional info:';
      output += '\n```json\n' + JSON.stringify(result.data, null, 2) + '\n```';
    }
    
    return output;
  } else {
    return `❌ ${result.message}\n\n${result.error || ''}`;
  }
}