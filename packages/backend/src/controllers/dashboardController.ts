import { Request, Response } from 'express';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DashboardData {
  project: {
    id: string;
    name: string;
    path: string;
    lastUpdated: string;
  };
  taskMetrics: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    blocked: number;
    deferred: number;
    cancelled: number;
    completionRate: number;
    statusBreakdown: Record<string, number>;
    priorityBreakdown: Record<string, number>;
    complexityDistribution: Record<string, number>;
  };
  subtaskMetrics: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    completionRate: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'commit' | 'task_update' | 'project_update';
    timestamp: string;
    message: string;
    author?: string;
    details?: any;
  }>;
  chartData: {
    taskCompletionTrend: Array<{
      date: string;
      completed: number;
      total: number;
      completionRate: number;
    }>;
    priorityDistribution: Array<{
      priority: string;
      count: number;
      percentage: number;
    }>;
    complexityBreakdown: Array<{
      complexity: string;
      count: number;
      averageTime: number;
    }>;
  };
  insights: {
    totalEstimatedHours: number;
    averageTaskComplexity: number;
    productivityScore: number;
    recommendations: string[];
  };
}

/**
 * Dashboard Controller
 * 
 * Handles dashboard data aggregation and reporting endpoints
 */
export class DashboardController {
  /**
   * Get dashboard data for a specific project
   */
  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const projectTag = req.query.tag as string;
      
      if (!projectId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PROJECT_ID',
            message: 'Project ID is required'
          }
        });
        return;
      }

      // Find project path - this would typically come from a database
      // For now, we'll use the current working directory
      const projectPath = process.cwd();
      const tasksJsonPath = path.join(projectPath, '.taskmaster', 'tasks', 'tasks.json');
      
      // Check if tasks.json exists
      try {
        await fs.access(tasksJsonPath);
      } catch {
        res.status(404).json({
          success: false,
          error: {
            code: 'TASKS_FILE_NOT_FOUND',
            message: 'Tasks file not found. Make sure TaskMaster is initialized.'
          }
        });
        return;
      }

      // Read and parse tasks.json
      const tasksData = await this.readTasksFile(tasksJsonPath, projectTag);
      
      // Get Git activity
      const gitActivity = await this.getGitActivity(projectPath);
      
      // Aggregate dashboard data
      const dashboardData = await this.aggregateDashboardData(
        projectId,
        projectPath,
        tasksData,
        gitActivity
      );

      res.json({
        success: true,
        data: dashboardData,
        metadata: {
          timestamp: new Date().toISOString(),
          projectId,
          projectTag,
          version: '1.0.0'
        }
      });
    } catch (error) {
      console.error('Dashboard data aggregation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DASHBOARD_AGGREGATION_ERROR',
          message: 'Failed to aggregate dashboard data',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * Get project health metrics
   */
  async getProjectHealth(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const projectTag = req.query.tag as string;
      
      const projectPath = process.cwd();
      const tasksJsonPath = path.join(projectPath, '.taskmaster', 'tasks', 'tasks.json');
      
      const tasksData = await this.readTasksFile(tasksJsonPath, projectTag);
      const health = this.calculateProjectHealth(tasksData);
      
      res.json({
        success: true,
        data: health,
        metadata: {
          timestamp: new Date().toISOString(),
          projectId,
          projectTag
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'HEALTH_CALCULATION_ERROR',
          message: 'Failed to calculate project health',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * Read and parse tasks.json file
   */
  private async readTasksFile(filePath: string, projectTag?: string): Promise<any> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      // If project tag is specified, filter by that tag
      if (projectTag && data[projectTag]) {
        return data[projectTag];
      }
      
      // Otherwise, return the first project or entire data
      const keys = Object.keys(data);
      if (keys.length === 1) {
        return data[keys[0]];
      }
      
      return data;
    } catch (error) {
      throw new Error(`Failed to read tasks file: ${error}`);
    }
  }

  /**
   * Get recent Git activity
   */
  private async getGitActivity(projectPath: string): Promise<any[]> {
    try {
      const { stdout } = await execAsync(
        'git log --oneline --format="%H|%an|%ad|%s" --date=iso -20',
        { cwd: projectPath }
      );
      
      return stdout.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [hash, author, date, ...messageParts] = line.split('|');
          return {
            id: hash,
            type: 'commit' as const,
            timestamp: new Date(date).toISOString(),
            message: messageParts.join('|'),
            author,
            details: { hash, shortHash: hash.substring(0, 7) }
          };
        });
    } catch (error) {
      console.warn('Failed to get Git activity:', error);
      return [];
    }
  }

  /**
   * Aggregate all dashboard data
   */
  private async aggregateDashboardData(
    projectId: string,
    projectPath: string,
    tasksData: any,
    gitActivity: any[]
  ): Promise<DashboardData> {
    const tasks = tasksData.tasks || [];
    const metadata = tasksData.metadata || {};
    
    // Calculate task metrics
    const taskMetrics = this.calculateTaskMetrics(tasks);
    
    // Calculate subtask metrics
    const subtaskMetrics = this.calculateSubtaskMetrics(tasks);
    
    // Combine recent activity
    const recentActivity = [
      ...gitActivity.slice(0, 10), // Latest 10 commits
      ...this.getRecentTaskUpdates(tasks).slice(0, 10) // Latest 10 task updates
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 20);
    
    // Generate chart data
    const chartData = this.generateChartData(tasks, gitActivity);
    
    // Calculate insights
    const insights = this.calculateInsights(tasks, taskMetrics);
    
    return {
      project: {
        id: projectId,
        name: path.basename(projectPath),
        path: projectPath,
        lastUpdated: metadata.updated || new Date().toISOString()
      },
      taskMetrics,
      subtaskMetrics,
      recentActivity,
      chartData,
      insights
    };
  }

  /**
   * Calculate task metrics
   */
  private calculateTaskMetrics(tasks: any[]): DashboardData['taskMetrics'] {
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const complexityCounts = tasks.reduce((acc, task) => {
      const complexity = task.complexity || 0;
      const level = complexity >= 8 ? 'high' : complexity >= 5 ? 'medium' : 'low';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const total = tasks.length;
    const completed = statusCounts['done'] || 0;
    
    return {
      total,
      completed,
      inProgress: statusCounts['in-progress'] || 0,
      pending: statusCounts['pending'] || 0,
      blocked: statusCounts['blocked'] || 0,
      deferred: statusCounts['deferred'] || 0,
      cancelled: statusCounts['cancelled'] || 0,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      statusBreakdown: statusCounts,
      priorityBreakdown: priorityCounts,
      complexityDistribution: complexityCounts
    };
  }

  /**
   * Calculate subtask metrics
   */
  private calculateSubtaskMetrics(tasks: any[]): DashboardData['subtaskMetrics'] {
    const allSubtasks = tasks.flatMap(task => task.subtasks || []);
    const total = allSubtasks.length;
    const completed = allSubtasks.filter(subtask => subtask.status === 'done').length;
    const inProgress = allSubtasks.filter(subtask => subtask.status === 'in-progress').length;
    const pending = allSubtasks.filter(subtask => subtask.status === 'pending').length;
    
    return {
      total,
      completed,
      inProgress,
      pending,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }

  /**
   * Get recent task updates
   */
  private getRecentTaskUpdates(tasks: any[]): DashboardData['recentActivity'] {
    const updates: DashboardData['recentActivity'] = [];
    
    tasks.forEach(task => {
      if (task.status === 'done') {
        updates.push({
          id: `task-${task.id}`,
          type: 'task_update',
          timestamp: new Date().toISOString(), // Would ideally come from task metadata
          message: `Completed task: ${task.title}`,
          details: { taskId: task.id, status: task.status }
        });
      }
    });
    
    return updates;
  }

  /**
   * Generate chart data
   */
  private generateChartData(tasks: any[], gitActivity: any[]): DashboardData['chartData'] {
    const priorityDistribution = Object.entries(
      tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([priority, count]) => ({
      priority,
      count: count as number,
      percentage: (count as number / tasks.length) * 100
    }));
    
    const complexityBreakdown = Object.entries(
      tasks.reduce((acc, task) => {
        const complexity = task.complexity || 0;
        const level = complexity >= 8 ? 'high' : complexity >= 5 ? 'medium' : 'low';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([complexity, count]) => ({
      complexity,
      count: count as number,
      averageTime: this.getAverageTimeForComplexity(complexity, tasks)
    }));
    
    // Generate task completion trend (simplified)
    const taskCompletionTrend = this.generateCompletionTrend(tasks, gitActivity);
    
    return {
      taskCompletionTrend,
      priorityDistribution,
      complexityBreakdown
    };
  }

  /**
   * Generate completion trend data
   */
  private generateCompletionTrend(tasks: any[], gitActivity: any[]): DashboardData['chartData']['taskCompletionTrend'] {
    const days = 7;
    const trend = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const completedTasks = tasks.filter(task => task.status === 'done').length;
      const totalTasks = tasks.length;
      
      trend.push({
        date: date.toISOString().split('T')[0],
        completed: completedTasks,
        total: totalTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      });
    }
    
    return trend;
  }

  /**
   * Get average time for complexity level
   */
  private getAverageTimeForComplexity(complexity: string, tasks: any[]): number {
    const complexityMultiplier = {
      low: 2,
      medium: 6,
      high: 12
    };
    
    return complexityMultiplier[complexity as keyof typeof complexityMultiplier] || 4;
  }

  /**
   * Calculate project insights
   */
  private calculateInsights(tasks: any[], taskMetrics: DashboardData['taskMetrics']): DashboardData['insights'] {
    const totalEstimatedHours = tasks.reduce((sum, task) => {
      const complexity = task.complexity || 0;
      return sum + (complexity * 1.5); // Rough estimate
    }, 0);
    
    const averageTaskComplexity = tasks.reduce((sum, task) => sum + (task.complexity || 0), 0) / tasks.length;
    
    const productivityScore = Math.min(100, Math.max(0, 
      (taskMetrics.completionRate * 0.6) + 
      (averageTaskComplexity * 10 * 0.4)
    ));
    
    const recommendations = this.generateRecommendations(taskMetrics, averageTaskComplexity);
    
    return {
      totalEstimatedHours,
      averageTaskComplexity,
      productivityScore,
      recommendations
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(taskMetrics: DashboardData['taskMetrics'], avgComplexity: number): string[] {
    const recommendations: string[] = [];
    
    if (taskMetrics.completionRate < 50) {
      recommendations.push('Consider breaking down complex tasks into smaller subtasks');
    }
    
    if (taskMetrics.inProgress > taskMetrics.completed) {
      recommendations.push('Focus on completing in-progress tasks before starting new ones');
    }
    
    if (avgComplexity > 7) {
      recommendations.push('High complexity tasks detected - consider adding more detailed requirements');
    }
    
    if (taskMetrics.blocked > 0) {
      recommendations.push(`${taskMetrics.blocked} blocked tasks need attention`);
    }
    
    return recommendations;
  }

  /**
   * Calculate project health score
   */
  private calculateProjectHealth(tasksData: any): any {
    const tasks = tasksData.tasks || [];
    const metrics = this.calculateTaskMetrics(tasks);
    
    const healthScore = Math.min(100, Math.max(0,
      (metrics.completionRate * 0.4) +
      ((metrics.total - metrics.blocked) / Math.max(1, metrics.total) * 100 * 0.3) +
      ((metrics.inProgress / Math.max(1, metrics.pending)) * 100 * 0.3)
    ));
    
    return {
      score: healthScore,
      status: healthScore > 80 ? 'excellent' : healthScore > 60 ? 'good' : healthScore > 40 ? 'fair' : 'needs-attention',
      metrics,
      timestamp: new Date().toISOString()
    };
  }
}

export const dashboardController = new DashboardController();