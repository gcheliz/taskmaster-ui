import { WorkflowService } from '../WorkflowService';
import { WorkflowContext, WorkflowType } from '../types';
import { logger } from '../../utils/logger';

export interface WorkflowCommand {
  name: string;
  description: string;
  syntax: string;
  handler: (args: string[], context: any) => Promise<any>;
}

export class WorkflowCommands {
  private workflowService: WorkflowService;
  private commands: Map<string, WorkflowCommand>;

  constructor(workflowService: WorkflowService) {
    this.workflowService = workflowService;
    this.commands = new Map();
    this.registerDefaultCommands();
  }

  private registerDefaultCommands(): void {
    // /feature command
    this.registerCommand({
      name: 'feature',
      description: 'Start a feature development workflow',
      syntax: '/feature <description>',
      handler: async (args: string[], context: any) => {
        const description = args.join(' ').trim();
        if (!description) {
          throw new Error('Feature description is required');
        }

        const workflowContext: WorkflowContext = {
          projectId: context.projectId || 'default',
          repositoryPath: context.repositoryPath || process.cwd(),
          branch: context.branch || 'main',
          taskId: context.taskId,
          variables: {
            featureDescription: description,
            initiatedBy: context.user || 'cli',
            timestamp: new Date().toISOString(),
          },
          metadata: {
            source: 'command',
            command: '/feature',
            user: context.user,
          },
        };

        const workflow = await this.workflowService.createFeatureWorkflow(
          workflowContext.projectId,
          workflowContext.repositoryPath,
          workflowContext.branch,
          description,
          workflowContext.taskId
        );

        return {
          message: `Feature workflow started: ${workflow.name}`,
          workflowId: workflow.id,
          status: workflow.status,
        };
      },
    });

    // /bugfix command
    this.registerCommand({
      name: 'bugfix',
      description: 'Start a bug fix workflow',
      syntax: '/bugfix <description>',
      handler: async (args: string[], context: any) => {
        const description = args.join(' ').trim();
        if (!description) {
          throw new Error('Bug description is required');
        }

        const workflowContext: WorkflowContext = {
          projectId: context.projectId || 'default',
          repositoryPath: context.repositoryPath || process.cwd(),
          branch: context.branch || 'main',
          taskId: context.taskId,
          variables: {
            bugDescription: description,
            initiatedBy: context.user || 'cli',
            timestamp: new Date().toISOString(),
          },
          metadata: {
            source: 'command',
            command: '/bugfix',
            user: context.user,
          },
        };

        const workflow = await this.workflowService.createBugfixWorkflow(
          workflowContext.projectId,
          workflowContext.repositoryPath,
          workflowContext.branch,
          description,
          workflowContext.taskId
        );

        return {
          message: `Bug fix workflow started: ${workflow.name}`,
          workflowId: workflow.id,
          status: workflow.status,
        };
      },
    });

    // /workflow status command
    this.registerCommand({
      name: 'workflow-status',
      description: 'Check workflow status',
      syntax: '/workflow-status <workflowId>',
      handler: async (args: string[], _context: any) => {
        const workflowId = args[0];
        if (!workflowId) {
          throw new Error('Workflow ID is required');
        }

        const workflow =
          await this.workflowService.getWorkflowStatus(workflowId);

        const completedSteps = workflow.steps.filter(
          s => s.status === 'completed'
        ).length;
        const failedSteps = workflow.steps.filter(
          s => s.status === 'failed'
        ).length;
        const runningSteps = workflow.steps.filter(
          s => s.status === 'running'
        ).length;

        return {
          workflowId: workflow.id,
          name: workflow.name,
          type: workflow.type,
          status: workflow.status,
          progress: workflow.progress,
          steps: {
            total: workflow.steps.length,
            completed: completedSteps,
            failed: failedSteps,
            running: runningSteps,
          },
          startedAt: workflow.startedAt,
          completedAt: workflow.completedAt,
          error: workflow.error,
        };
      },
    });

    // /workflow list command
    this.registerCommand({
      name: 'workflow-list',
      description: 'List all workflows',
      syntax: '/workflow-list [--status=<status>] [--type=<type>]',
      handler: async (args: string[], context: any) => {
        const filters: any = {};

        // Parse arguments
        args.forEach(arg => {
          if (arg.startsWith('--status=')) {
            filters.status = arg.split('=')[1];
          } else if (arg.startsWith('--type=')) {
            filters.type = arg.split('=')[1];
          }
        });

        if (context.projectId) {
          filters['context.projectId'] = context.projectId;
        }

        const workflows = await this.workflowService.listWorkflows(filters);

        return {
          count: workflows.length,
          workflows: workflows.map(w => ({
            id: w.id,
            name: w.name,
            type: w.type,
            status: w.status,
            progress: w.progress,
            startedAt: w.startedAt,
            completedAt: w.completedAt,
          })),
        };
      },
    });

    // /workflow pause command
    this.registerCommand({
      name: 'workflow-pause',
      description: 'Pause a running workflow',
      syntax: '/workflow-pause <workflowId>',
      handler: async (args: string[], _context: any) => {
        const workflowId = args[0];
        if (!workflowId) {
          throw new Error('Workflow ID is required');
        }

        await this.workflowService.pauseWorkflow(workflowId);

        return {
          message: `Workflow ${workflowId} paused successfully`,
          workflowId,
        };
      },
    });

    // /workflow resume command
    this.registerCommand({
      name: 'workflow-resume',
      description: 'Resume a paused workflow',
      syntax: '/workflow-resume <workflowId>',
      handler: async (args: string[], _context: any) => {
        const workflowId = args[0];
        if (!workflowId) {
          throw new Error('Workflow ID is required');
        }

        await this.workflowService.resumeWorkflow(workflowId);

        return {
          message: `Workflow ${workflowId} resumed successfully`,
          workflowId,
        };
      },
    });

    // /workflow cancel command
    this.registerCommand({
      name: 'workflow-cancel',
      description: 'Cancel a workflow',
      syntax: '/workflow-cancel <workflowId>',
      handler: async (args: string[], _context: any) => {
        const workflowId = args[0];
        if (!workflowId) {
          throw new Error('Workflow ID is required');
        }

        await this.workflowService.cancelWorkflow(workflowId);

        return {
          message: `Workflow ${workflowId} cancelled successfully`,
          workflowId,
        };
      },
    });

    // /refactor command
    this.registerCommand({
      name: 'refactor',
      description: 'Start a refactoring workflow',
      syntax: '/refactor <description> [files...]',
      handler: async (args: string[], context: any) => {
        if (args.length < 1) {
          throw new Error('Refactor description is required');
        }

        const description = args[0];
        const targetFiles = args.slice(1);

        const workflowContext: WorkflowContext = {
          projectId: context.projectId || 'default',
          repositoryPath: context.repositoryPath || process.cwd(),
          branch: context.branch || 'main',
          taskId: context.taskId,
          variables: {
            refactorDescription: description,
            targetFiles:
              targetFiles.length > 0 ? targetFiles : ['**/*.ts', '**/*.js'],
            performanceCheck: true,
            initiatedBy: context.user || 'cli',
            timestamp: new Date().toISOString(),
          },
          metadata: {
            source: 'command',
            command: '/refactor',
            user: context.user,
          },
        };

        const workflow = await this.workflowService.executeWorkflowByType(
          'refactor',
          workflowContext
        );

        return {
          message: `Refactoring workflow started: ${workflow.name}`,
          workflowId: workflow.id,
          status: workflow.status,
        };
      },
    });
  }

  registerCommand(command: WorkflowCommand): void {
    this.commands.set(command.name, command);
    logger.info('Workflow command registered', { name: command.name });
  }

  async executeCommand(
    commandName: string,
    args: string[],
    context: any
  ): Promise<any> {
    const command = this.commands.get(commandName);
    if (!command) {
      throw new Error(`Unknown workflow command: /${commandName}`);
    }

    try {
      logger.info('Executing workflow command', {
        command: commandName,
        args,
        context,
      });

      const result = await command.handler(args, context);

      logger.info('Workflow command executed successfully', {
        command: commandName,
        result,
      });

      return result;
    } catch (error) {
      logger.error('Workflow command failed', {
        error,
        command: commandName,
        args,
      });
      throw error;
    }
  }

  getCommand(name: string): WorkflowCommand | undefined {
    return this.commands.get(name);
  }

  listCommands(): WorkflowCommand[] {
    return Array.from(this.commands.values());
  }

  getHelp(commandName?: string): string {
    if (commandName) {
      const command = this.commands.get(commandName);
      if (!command) {
        return `Unknown command: /${commandName}`;
      }
      return `${command.name}: ${command.description}\nSyntax: ${command.syntax}`;
    }

    // List all commands
    const help = ['Available workflow commands:'];
    for (const command of this.commands.values()) {
      help.push(`  ${command.syntax} - ${command.description}`);
    }
    return help.join('\n');
  }

  isWorkflowCommand(text: string): boolean {
    if (!text.startsWith('/')) {
      return false;
    }

    const parts = text.slice(1).split(' ');
    const commandName = parts[0];

    return this.commands.has(commandName);
  }

  parseCommand(text: string): { command: string; args: string[] } | null {
    if (!text.startsWith('/')) {
      return null;
    }

    const parts = text.slice(1).split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    if (!this.commands.has(command)) {
      return null;
    }

    return { command, args };
  }
}
