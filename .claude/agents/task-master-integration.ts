import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { AgentCommandRouter } from './command-router';
import { logger } from '../packages/backend/src/utils/winston-adapter';

const execAsync = promisify(exec);

interface TaskContext {
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  subtasks?: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

export class TaskMasterIntegration {
  private workspacePath: string;
  private router: AgentCommandRouter;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
    this.router = new AgentCommandRouter({
      workspacePath,
      environment: 'development',
      user: 'task-master',
    });
  }

  /**
   * Get current task context from task-master
   */
  async getCurrentTask(): Promise<TaskContext | null> {
    try {
      const { stdout } = await execAsync('task-master next --json', {
        cwd: this.workspacePath,
      });
      
      const taskData = JSON.parse(stdout);
      return this.parseTaskData(taskData);
    } catch (error) {
      logger.error('Failed to get current task:', error);
      return null;
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: 'in-progress' | 'done' | 'blocked'): Promise<boolean> {
    try {
      await execAsync(`task-master set-status --id=${taskId} --status=${status}`, {
        cwd: this.workspacePath,
      });
      
      logger.info(`Task ${taskId} status updated to ${status}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update task status:`, error);
      return false;
    }
  }

  /**
   * Add notes to a task
   */
  async addTaskNote(taskId: string, note: string): Promise<boolean> {
    try {
      const escapedNote = note.replace(/"/g, '\\"');
      await execAsync(`task-master update-subtask --id=${taskId} --prompt="${escapedNote}"`, {
        cwd: this.workspacePath,
      });
      
      return true;
    } catch (error) {
      logger.error(`Failed to add task note:`, error);
      return false;
    }
  }

  /**
   * Process task and suggest agent actions
   */
  async processTask(task: TaskContext): Promise<void> {
    const suggestions = this.analyzeTaskForAgents(task);
    
    if (suggestions.length > 0) {
      logger.info(`Agent suggestions for task ${task.taskId}:`);
      suggestions.forEach(suggestion => {
        logger.info(`- ${suggestion.command}: ${suggestion.reason}`);
      });
      
      // Auto-execute if configured
      if (process.env.CLAUDE_AUTO_EXECUTE === 'true') {
        for (const suggestion of suggestions) {
          await this.executeSuggestion(suggestion, task);
        }
      }
    }
  }

  /**
   * Analyze task and suggest agent commands
   */
  private analyzeTaskForAgents(task: TaskContext): Array<{ command: string; reason: string }> {
    const suggestions: Array<{ command: string; reason: string }> = [];
    const lowerTitle = task.taskTitle.toLowerCase();
    const lowerDesc = task.taskDescription.toLowerCase();
    
    // API endpoint creation
    if (lowerTitle.includes('api') || lowerTitle.includes('endpoint') || lowerDesc.includes('create route')) {
      suggestions.push({
        command: '/api-generate',
        reason: 'Task involves API endpoint creation',
      });
    }
    
    // Database migrations
    if (lowerTitle.includes('database') || lowerTitle.includes('schema') || lowerDesc.includes('migration')) {
      suggestions.push({
        command: '/db-migrate',
        reason: 'Task involves database schema changes',
      });
    }
    
    // Seed data
    if (lowerTitle.includes('seed') || lowerDesc.includes('test data')) {
      suggestions.push({
        command: '/db-seed',
        reason: 'Task requires seed data generation',
      });
    }
    
    // Testing
    if (lowerTitle.includes('test') || lowerDesc.includes('coverage')) {
      suggestions.push({
        command: '/test-generate',
        reason: 'Task requires test creation',
      });
    }
    
    // Documentation
    if (lowerTitle.includes('document') || lowerDesc.includes('docs')) {
      suggestions.push({
        command: '/docs',
        reason: 'Task involves documentation',
      });
    }
    
    return suggestions;
  }

  /**
   * Execute agent suggestion
   */
  private async executeSuggestion(
    suggestion: { command: string; reason: string },
    task: TaskContext
  ): Promise<void> {
    logger.info(`Executing ${suggestion.command} for task ${task.taskId}`);
    
    // Add task context note
    await this.addTaskNote(
      task.taskId,
      `Claude Agent: ${suggestion.command} - ${suggestion.reason}`
    );
    
    // Execute command based on type
    // This is where you'd add specific command parameters based on task context
    const result = await this.router.executeCommand(suggestion.command, {});
    
    if (result.success) {
      await this.addTaskNote(
        task.taskId,
        `Agent completed: ${result.message}`
      );
    } else {
      await this.addTaskNote(
        task.taskId,
        `Agent failed: ${result.error}`
      );
    }
  }

  /**
   * Parse task data from task-master
   */
  private parseTaskData(data: any): TaskContext {
    return {
      taskId: data.id,
      taskTitle: data.title,
      taskDescription: data.description || data.details || '',
      subtasks: data.subtasks?.map((st: any) => ({
        id: st.id,
        title: st.title,
        status: st.status,
      })),
    };
  }

  /**
   * Watch for task changes
   */
  async watchTasks(callback: (task: TaskContext) => void): Promise<void> {
    // Poll for task changes every 30 seconds
    setInterval(async () => {
      const task = await this.getCurrentTask();
      if (task && task.taskId) {
        callback(task);
      }
    }, 30000);
  }
}

/**
 * CLI integration for task-master hooks
 */
export async function handleTaskMasterHook(
  hookType: 'pre-task' | 'post-task' | 'task-update',
  taskData: any
): Promise<void> {
  const integration = new TaskMasterIntegration(process.cwd());
  
  switch (hookType) {
    case 'pre-task':
      // Analyze task before starting
      const task = integration['parseTaskData'](taskData);
      await integration.processTask(task);
      break;
      
    case 'post-task':
      // Clean up or generate reports after task completion
      logger.info(`Task completed: ${taskData.id}`);
      break;
      
    case 'task-update':
      // React to task updates
      logger.info(`Task updated: ${taskData.id}`);
      break;
  }
}

/**
 * Integration with CLAUDE.md context
 */
export async function updateClaudeContext(taskContext: TaskContext): Promise<void> {
  const contextPath = path.join(process.cwd(), 'CLAUDE.md');
  
  try {
    let content = await fs.readFile(contextPath, 'utf-8');
    
    // Update current task section
    const taskSection = `
## Current Task Context

**Task ID:** ${taskContext.taskId}
**Title:** ${taskContext.taskTitle}
**Description:** ${taskContext.taskDescription}

### Subtasks
${taskContext.subtasks?.map(st => `- [${st.status}] ${st.id}: ${st.title}`).join('\n') || 'No subtasks'}

### Agent Suggestions
Run \`task-master show ${taskContext.taskId}\` for full details.
`;
    
    // Replace or append task section
    const taskSectionRegex = /## Current Task Context[\s\S]*?(?=##|$)/;
    if (taskSectionRegex.test(content)) {
      content = content.replace(taskSectionRegex, taskSection);
    } else {
      content += '\n\n' + taskSection;
    }
    
    await fs.writeFile(contextPath, content, 'utf-8');
    logger.info('Updated CLAUDE.md with current task context');
  } catch (error) {
    logger.error('Failed to update CLAUDE.md:', error);
  }
}