import { DatabaseService } from './database';
import { Project, Repository, Task } from '@prisma/client';

export interface ProjectWithDetails extends Project {
  repositories?: Repository[];
  tasks?: Task[];
  _count?: {
    repositories: number;
    tasks: number;
  };
}

/**
 * Project Service
 * 
 * Handles project data persistence and retrieval from the database.
 * Provides CRUD operations for project management using Prisma.
 */
export class ProjectService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  /**
   * Create a new project
   */
  async createProject(data: {
    name: string;
    description?: string;
    path: string;
  }): Promise<Project> {
    try {
      const prisma = this.dbService.getPrisma();
      const project = await prisma.project.create({
        data: {
          name: data.name,
          description: data.description,
          path: data.path
        },
        include: {
          repositories: true,
          tasks: true
        }
      });
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<ProjectWithDetails | null> {
    try {
      const prisma = this.dbService.getPrisma();
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          repositories: {
            include: {
              commits: {
                orderBy: { timestamp: 'desc' },
                take: 5
              }
            }
          },
          tasks: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          _count: {
            select: {
              repositories: true,
              tasks: true
            }
          }
        }
      });
      return project;
    } catch (error) {
      console.error('Error getting project by ID:', error);
      throw error;
    }
  }

  /**
   * Get project by name
   */
  async getProjectByName(name: string): Promise<Project | null> {
    try {
      const prisma = this.dbService.getPrisma();
      const project = await prisma.project.findUnique({
        where: { name },
        include: {
          repositories: true,
          tasks: true
        }
      });
      return project;
    } catch (error) {
      console.error('Error getting project by name:', error);
      throw error;
    }
  }

  /**
   * Get project by path
   */
  async getProjectByPath(path: string): Promise<Project | null> {
    try {
      const prisma = this.dbService.getPrisma();
      const project = await prisma.project.findUnique({
        where: { path },
        include: {
          repositories: true,
          tasks: true
        }
      });
      return project;
    } catch (error) {
      console.error('Error getting project by path:', error);
      throw error;
    }
  }

  /**
   * Get all projects
   */
  async getAllProjects(): Promise<ProjectWithDetails[]> {
    try {
      const prisma = this.dbService.getPrisma();
      const projects = await prisma.project.findMany({
        include: {
          repositories: {
            include: {
              commits: {
                orderBy: { timestamp: 'desc' },
                take: 3
              }
            }
          },
          tasks: {
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          _count: {
            select: {
              repositories: true,
              tasks: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return projects;
    } catch (error) {
      console.error('Error getting all projects:', error);
      throw error;
    }
  }

  /**
   * Update project
   */
  async updateProject(
    id: string, 
    updates: {
      name?: string;
      description?: string;
      path?: string;
    }
  ): Promise<Project | null> {
    try {
      const prisma = this.dbService.getPrisma();
      
      // Check if project exists
      const existing = await prisma.project.findUnique({
        where: { id }
      });
      
      if (!existing) {
        return null;
      }

      const project = await prisma.project.update({
        where: { id },
        data: updates,
        include: {
          repositories: true,
          tasks: true
        }
      });
      
      return project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<boolean> {
    try {
      const prisma = this.dbService.getPrisma();
      
      // Check if project exists
      const existing = await prisma.project.findUnique({
        where: { id }
      });
      
      if (!existing) {
        return false;
      }

      // Delete project (repositories and tasks will be cascade deleted)
      await prisma.project.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Check if project exists by name
   */
  async projectExistsByName(name: string): Promise<boolean> {
    try {
      const project = await this.getProjectByName(name);
      return project !== null;
    } catch (error) {
      console.error('Error checking project existence by name:', error);
      throw error;
    }
  }

  /**
   * Check if project exists by path
   */
  async projectExistsByPath(path: string): Promise<boolean> {
    try {
      const project = await this.getProjectByPath(path);
      return project !== null;
    } catch (error) {
      console.error('Error checking project existence by path:', error);
      throw error;
    }
  }

  /**
   * Count total projects
   */
  async getProjectCount(): Promise<number> {
    try {
      const prisma = this.dbService.getPrisma();
      const count = await prisma.project.count();
      return count;
    } catch (error) {
      console.error('Error counting projects:', error);
      throw error;
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(id: string): Promise<{
    repositoryCount: number;
    taskCount: number;
    completedTasks: number;
    pendingTasks: number;
    latestRepository?: {
      name: string;
      path: string;
      createdAt: Date;
    };
    latestTask?: {
      title: string;
      status: string;
      createdAt: Date;
    };
  }> {
    try {
      const prisma = this.dbService.getPrisma();
      
      const [
        repositoryCount,
        taskCount,
        completedTasks,
        pendingTasks,
        latestRepository,
        latestTask
      ] = await Promise.all([
        prisma.repository.count({ where: { projectId: id } }),
        prisma.task.count({ where: { projectId: id } }),
        prisma.task.count({ 
          where: { 
            projectId: id,
            status: 'COMPLETED'
          }
        }),
        prisma.task.count({ 
          where: { 
            projectId: id,
            status: 'PENDING'
          }
        }),
        prisma.repository.findFirst({
          where: { projectId: id },
          orderBy: { createdAt: 'desc' },
          select: {
            name: true,
            path: true,
            createdAt: true
          }
        }),
        prisma.task.findFirst({
          where: { projectId: id },
          orderBy: { createdAt: 'desc' },
          select: {
            title: true,
            status: true,
            createdAt: true
          }
        })
      ]);

      return {
        repositoryCount,
        taskCount,
        completedTasks,
        pendingTasks,
        latestRepository: latestRepository || undefined,
        latestTask: latestTask || undefined
      };
    } catch (error) {
      console.error('Error getting project stats:', error);
      throw error;
    }
  }

  /**
   * Find or create project by path
   * Useful for TaskMaster CLI integration
   */
  async findOrCreateProject(data: {
    name: string;
    path: string;
    description?: string;
  }): Promise<Project> {
    try {
      // Use transaction to ensure consistency
      return await this.dbService.transaction(async (prisma) => {
        // First try to find existing project by path
        const existing = await prisma.project.findUnique({
          where: { path: data.path },
          include: {
            repositories: true,
            tasks: true
          }
        });
        
        if (existing) {
          return existing;
        }

        // Create new project if not found
        const project = await prisma.project.create({
          data: {
            name: data.name,
            description: data.description,
            path: data.path
          },
          include: {
            repositories: true,
            tasks: true
          }
        });
        
        return project;
      });
    } catch (error) {
      console.error('Error finding or creating project:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to find or create project: ${error.message}`);
      }
      throw new Error('Failed to find or create project: Unknown error');
    }
  }

  /**
   * Create project with repository in a transaction
   */
  async createProjectWithRepository(projectData: {
    name: string;
    description?: string;
    path: string;
  }, repositoryData: {
    name: string;
    url?: string;
    path: string;
    branch?: string;
  }): Promise<{ project: Project; repository: any }> {
    try {
      return await this.dbService.transaction(async (prisma) => {
        // Create project first
        const project = await prisma.project.create({
          data: {
            name: projectData.name,
            description: projectData.description,
            path: projectData.path
          }
        });

        // Create repository linked to the project
        const repository = await prisma.repository.create({
          data: {
            name: repositoryData.name,
            url: repositoryData.url,
            path: repositoryData.path,
            branch: repositoryData.branch || 'main',
            projectId: project.id
          }
        });

        return { project, repository };
      });
    } catch (error) {
      console.error('Error creating project with repository:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create project with repository: ${error.message}`);
      }
      throw new Error('Failed to create project with repository: Unknown error');
    }
  }
}

// Export singleton instance
export const projectService = new ProjectService();