import { DatabaseService } from './database';
import { Task, Priority, TaskStatus } from '@prisma/client';

export interface TaskWithProject extends Task {
  project?: {
    id: string;
    name: string;
    path: string;
  };
}

/**
 * Task Service
 * 
 * Handles task data persistence and retrieval from the database.
 * Provides CRUD operations for task management using Prisma.
 */
export class TaskService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  /**
   * Create a new task
   */
  async createTask(data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: Priority;
    order?: number;
    dueDate?: Date;
    projectId: string;
  }): Promise<Task> {
    try {
      const prisma = this.dbService.getPrisma();
      const task = await prisma.task.create({
        data: {
          title: data.title,
          description: data.description,
          status: data.status || TaskStatus.PENDING,
          priority: data.priority || Priority.MEDIUM,
          order: data.order || 0,
          dueDate: data.dueDate,
          projectId: data.projectId
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              path: true
            }
          }
        }
      });
      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<TaskWithProject | null> {
    try {
      const prisma = this.dbService.getPrisma();
      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              path: true
            }
          }
        }
      });
      return task;
    } catch (error) {
      console.error('Error getting task by ID:', error);
      throw error;
    }
  }

  /**
   * Get tasks by project ID
   */
  async getTasksByProjectId(projectId: string, options?: {
    status?: TaskStatus;
    priority?: Priority;
    limit?: number;
    offset?: number;
    orderBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'order' | 'priority';
    orderDirection?: 'asc' | 'desc';
  }): Promise<Task[]> {
    try {
      const prisma = this.dbService.getPrisma();
      
      const where: any = { projectId };
      if (options?.status) {
        where.status = options.status;
      }
      if (options?.priority) {
        where.priority = options.priority;
      }

      const orderBy: any = {};
      if (options?.orderBy) {
        orderBy[options.orderBy] = options?.orderDirection || 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      const tasks = await prisma.task.findMany({
        where,
        orderBy,
        take: options?.limit,
        skip: options?.offset,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              path: true
            }
          }
        }
      });
      return tasks;
    } catch (error) {
      console.error('Error getting tasks by project ID:', error);
      throw error;
    }
  }

  /**
   * Get all tasks
   */
  async getAllTasks(options?: {
    status?: TaskStatus;
    priority?: Priority;
    limit?: number;
    offset?: number;
    orderBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'order' | 'priority';
    orderDirection?: 'asc' | 'desc';
  }): Promise<TaskWithProject[]> {
    try {
      const prisma = this.dbService.getPrisma();
      
      const where: any = {};
      if (options?.status) {
        where.status = options.status;
      }
      if (options?.priority) {
        where.priority = options.priority;
      }

      const orderBy: any = {};
      if (options?.orderBy) {
        orderBy[options.orderBy] = options?.orderDirection || 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      const tasks = await prisma.task.findMany({
        where,
        orderBy,
        take: options?.limit,
        skip: options?.offset,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              path: true
            }
          }
        }
      });
      return tasks;
    } catch (error) {
      console.error('Error getting all tasks:', error);
      throw error;
    }
  }

  /**
   * Update task
   */
  async updateTask(
    id: string, 
    updates: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: Priority;
      order?: number;
      dueDate?: Date;
    }
  ): Promise<Task | null> {
    try {
      const prisma = this.dbService.getPrisma();
      
      // Check if task exists
      const existing = await prisma.task.findUnique({
        where: { id }
      });
      
      if (!existing) {
        return null;
      }

      const task = await prisma.task.update({
        where: { id },
        data: updates,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              path: true
            }
          }
        }
      });
      
      return task;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<boolean> {
    try {
      const prisma = this.dbService.getPrisma();
      
      // Check if task exists
      const existing = await prisma.task.findUnique({
        where: { id }
      });
      
      if (!existing) {
        return false;
      }

      // Delete task
      await prisma.task.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Count tasks by status for a project
   */
  async getTaskCountsByStatus(projectId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    blocked: number;
    cancelled: number;
  }> {
    try {
      const prisma = this.dbService.getPrisma();
      
      const [
        total,
        pending,
        inProgress,
        completed,
        blocked,
        cancelled
      ] = await Promise.all([
        prisma.task.count({ where: { projectId } }),
        prisma.task.count({ where: { projectId, status: TaskStatus.PENDING } }),
        prisma.task.count({ where: { projectId, status: TaskStatus.IN_PROGRESS } }),
        prisma.task.count({ where: { projectId, status: TaskStatus.COMPLETED } }),
        prisma.task.count({ where: { projectId, status: TaskStatus.BLOCKED } }),
        prisma.task.count({ where: { projectId, status: TaskStatus.CANCELLED } })
      ]);

      return {
        total,
        pending,
        inProgress,
        completed,
        blocked,
        cancelled
      };
    } catch (error) {
      console.error('Error getting task counts by status:', error);
      throw error;
    }
  }

  /**
   * Get tasks due soon (within specified days)
   */
  async getTasksDueSoon(projectId: string, daysAhead: number = 7): Promise<Task[]> {
    try {
      const prisma = this.dbService.getPrisma();
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysAhead);
      
      const tasks = await prisma.task.findMany({
        where: {
          projectId,
          dueDate: {
            lte: dueDate
          },
          status: {
            not: TaskStatus.COMPLETED
          }
        },
        orderBy: {
          dueDate: 'asc'
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              path: true
            }
          }
        }
      });
      
      return tasks;
    } catch (error) {
      console.error('Error getting tasks due soon:', error);
      throw error;
    }
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(projectId: string): Promise<Task[]> {
    try {
      const prisma = this.dbService.getPrisma();
      
      const now = new Date();
      
      const tasks = await prisma.task.findMany({
        where: {
          projectId,
          dueDate: {
            lt: now
          },
          status: {
            not: TaskStatus.COMPLETED
          }
        },
        orderBy: {
          dueDate: 'asc'
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              path: true
            }
          }
        }
      });
      
      return tasks;
    } catch (error) {
      console.error('Error getting overdue tasks:', error);
      throw error;
    }
  }

  /**
   * Bulk update task statuses
   */
  async bulkUpdateTaskStatus(taskIds: string[], status: TaskStatus): Promise<number> {
    try {
      if (!taskIds || taskIds.length === 0) {
        throw new Error('Task IDs are required for bulk update');
      }

      if (!Object.values(TaskStatus).includes(status)) {
        throw new Error(`Invalid task status: ${status}`);
      }

      const prisma = this.dbService.getPrisma();
      
      const result = await prisma.task.updateMany({
        where: {
          id: {
            in: taskIds
          }
        },
        data: {
          status,
          updatedAt: new Date()
        }
      });
      
      return result.count;
    } catch (error) {
      console.error('Error bulk updating task status:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to bulk update task status: ${error.message}`);
      }
      throw new Error('Failed to bulk update task status: Unknown error');
    }
  }

  /**
   * Create multiple tasks in a transaction
   */
  async bulkCreateTasks(tasks: Array<{
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: Priority;
    order?: number;
    dueDate?: Date;
    projectId: string;
  }>): Promise<number> {
    try {
      if (!tasks || tasks.length === 0) {
        throw new Error('Tasks array is required and cannot be empty');
      }

      // Validate all tasks have required fields
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (!task.title || task.title.trim().length === 0) {
          throw new Error(`Task at index ${i} must have a title`);
        }
        if (!task.projectId) {
          throw new Error(`Task at index ${i} must have a projectId`);
        }
      }

      return await this.dbService.transaction(async (prisma) => {
        const taskData = tasks.map(task => ({
          title: task.title.trim(),
          description: task.description?.trim(),
          status: task.status || TaskStatus.PENDING,
          priority: task.priority || Priority.MEDIUM,
          order: task.order || 0,
          dueDate: task.dueDate,
          projectId: task.projectId
        }));

        const result = await prisma.task.createMany({
          data: taskData
        });

        return result.count;
      });
    } catch (error) {
      console.error('Error bulk creating tasks:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to bulk create tasks: ${error.message}`);
      }
      throw new Error('Failed to bulk create tasks: Unknown error');
    }
  }

  /**
   * Move tasks between projects in a transaction
   */
  async moveTasksToProject(taskIds: string[], targetProjectId: string): Promise<number> {
    try {
      if (!taskIds || taskIds.length === 0) {
        throw new Error('Task IDs are required');
      }

      if (!targetProjectId) {
        throw new Error('Target project ID is required');
      }

      return await this.dbService.transaction(async (prisma) => {
        // Verify target project exists
        const targetProject = await prisma.project.findUnique({
          where: { id: targetProjectId }
        });

        if (!targetProject) {
          throw new Error(`Target project not found: ${targetProjectId}`);
        }

        // Move tasks to target project
        const result = await prisma.task.updateMany({
          where: {
            id: {
              in: taskIds
            }
          },
          data: {
            projectId: targetProjectId,
            updatedAt: new Date()
          }
        });

        return result.count;
      });
    } catch (error) {
      console.error('Error moving tasks to project:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to move tasks to project: ${error.message}`);
      }
      throw new Error('Failed to move tasks to project: Unknown error');
    }
  }

  /**
   * Get task statistics for a project
   */
  async getTaskStatistics(projectId: string): Promise<{
    totalTasks: number;
    completionRate: number;
    averageTimeToComplete: number | null;
    tasksByPriority: {
      high: number;
      medium: number;
      low: number;
      urgent: number;
    };
    tasksByStatus: {
      pending: number;
      inProgress: number;
      completed: number;
      blocked: number;
      cancelled: number;
    };
    overdueCount: number;
    dueSoonCount: number;
  }> {
    try {
      const counts = await this.getTaskCountsByStatus(projectId);
      const overdueTasks = await this.getOverdueTasks(projectId);
      const dueSoonTasks = await this.getTasksDueSoon(projectId);
      
      const prisma = this.dbService.getPrisma();
      
      // Get tasks by priority
      const [highPriority, mediumPriority, lowPriority, urgentPriority] = await Promise.all([
        prisma.task.count({ where: { projectId, priority: Priority.HIGH } }),
        prisma.task.count({ where: { projectId, priority: Priority.MEDIUM } }),
        prisma.task.count({ where: { projectId, priority: Priority.LOW } }),
        prisma.task.count({ where: { projectId, priority: Priority.URGENT } })
      ]);

      const completionRate = counts.total > 0 ? (counts.completed / counts.total) * 100 : 0;

      return {
        totalTasks: counts.total,
        completionRate: Math.round(completionRate * 100) / 100,
        averageTimeToComplete: null, // Would require tracking completion times
        tasksByPriority: {
          high: highPriority,
          medium: mediumPriority,
          low: lowPriority,
          urgent: urgentPriority
        },
        tasksByStatus: {
          pending: counts.pending,
          inProgress: counts.inProgress,
          completed: counts.completed,
          blocked: counts.blocked,
          cancelled: counts.cancelled
        },
        overdueCount: overdueTasks.length,
        dueSoonCount: dueSoonTasks.length
      };
    } catch (error) {
      console.error('Error getting task statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const taskService = new TaskService();