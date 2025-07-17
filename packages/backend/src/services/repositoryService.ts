import { DatabaseService } from './database';
import { Repository } from '@prisma/client';

/**
 * Repository Service
 * 
 * Handles repository data persistence and retrieval from the database.
 * Provides CRUD operations for repository management using Prisma.
 */
export class RepositoryService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  /**
   * Get repository by ID
   */
  async getRepositoryById(id: string): Promise<Repository | null> {
    try {
      const prisma = this.dbService.getPrisma();
      const repository = await prisma.repository.findUnique({
        where: { id },
        include: {
          project: true,
          commits: {
            orderBy: { timestamp: 'desc' },
            take: 10 // Include last 10 commits
          }
        }
      });
      return repository;
    } catch (error) {
      console.error('Error getting repository by ID:', error);
      throw error;
    }
  }

  /**
   * Get all repositories
   */
  async getAllRepositories(): Promise<Repository[]> {
    try {
      const prisma = this.dbService.getPrisma();
      const repositories = await prisma.repository.findMany({
        include: {
          project: true,
          commits: {
            orderBy: { timestamp: 'desc' },
            take: 5 // Include last 5 commits for each repo
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return repositories;
    } catch (error) {
      console.error('Error getting all repositories:', error);
      throw error;
    }
  }

  /**
   * Get repository by path
   */
  async getRepositoryByPath(path: string): Promise<Repository | null> {
    try {
      const prisma = this.dbService.getPrisma();
      const repository = await prisma.repository.findUnique({
        where: { path },
        include: {
          project: true,
          commits: {
            orderBy: { timestamp: 'desc' },
            take: 10
          }
        }
      });
      return repository;
    } catch (error) {
      console.error('Error getting repository by path:', error);
      throw error;
    }
  }

  /**
   * Get repositories by project ID
   */
  async getRepositoriesByProjectId(projectId: string): Promise<Repository[]> {
    try {
      const prisma = this.dbService.getPrisma();
      const repositories = await prisma.repository.findMany({
        where: { projectId },
        include: {
          project: true,
          commits: {
            orderBy: { timestamp: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return repositories;
    } catch (error) {
      console.error('Error getting repositories by project ID:', error);
      throw error;
    }
  }

  /**
   * Create a new repository
   */
  async createRepository(data: {
    name: string;
    url?: string;
    path: string;
    branch?: string;
    projectId: string;
  }): Promise<Repository> {
    try {
      const prisma = this.dbService.getPrisma();
      const repository = await prisma.repository.create({
        data: {
          name: data.name,
          url: data.url,
          path: data.path,
          branch: data.branch || 'main',
          projectId: data.projectId
        },
        include: {
          project: true,
          commits: true
        }
      });
      return repository;
    } catch (error) {
      console.error('Error creating repository:', error);
      throw error;
    }
  }

  /**
   * Update repository
   */
  async updateRepository(
    id: string, 
    updates: {
      name?: string;
      url?: string;
      path?: string;
      branch?: string;
    }
  ): Promise<Repository | null> {
    try {
      const prisma = this.dbService.getPrisma();
      
      // Check if repository exists
      const existing = await prisma.repository.findUnique({
        where: { id }
      });
      
      if (!existing) {
        return null;
      }

      const repository = await prisma.repository.update({
        where: { id },
        data: updates,
        include: {
          project: true,
          commits: {
            orderBy: { timestamp: 'desc' },
            take: 10
          }
        }
      });
      
      return repository;
    } catch (error) {
      console.error('Error updating repository:', error);
      throw error;
    }
  }

  /**
   * Delete repository
   */
  async deleteRepository(id: string): Promise<boolean> {
    try {
      const prisma = this.dbService.getPrisma();
      
      // Check if repository exists
      const existing = await prisma.repository.findUnique({
        where: { id }
      });
      
      if (!existing) {
        return false;
      }

      // Delete repository (commits will be cascade deleted due to foreign key constraint)
      await prisma.repository.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting repository:', error);
      throw error;
    }
  }

  /**
   * Check if repository exists by path
   */
  async repositoryExistsByPath(path: string): Promise<boolean> {
    try {
      const repository = await this.getRepositoryByPath(path);
      return repository !== null;
    } catch (error) {
      console.error('Error checking repository existence:', error);
      throw error;
    }
  }

  /**
   * Count total repositories
   */
  async getRepositoryCount(): Promise<number> {
    try {
      const prisma = this.dbService.getPrisma();
      const count = await prisma.repository.count();
      return count;
    } catch (error) {
      console.error('Error counting repositories:', error);
      throw error;
    }
  }

  /**
   * Get repository statistics
   */
  async getRepositoryStats(id: string): Promise<{
    commitCount: number;
    latestCommit?: {
      hash: string;
      message: string;
      author: string;
      timestamp: Date;
    };
  }> {
    try {
      const prisma = this.dbService.getPrisma();
      
      const [commitCount, latestCommit] = await Promise.all([
        prisma.commit.count({
          where: { repositoryId: id }
        }),
        prisma.commit.findFirst({
          where: { repositoryId: id },
          orderBy: { timestamp: 'desc' },
          select: {
            hash: true,
            message: true,
            author: true,
            timestamp: true
          }
        })
      ]);

      return {
        commitCount,
        latestCommit: latestCommit || undefined
      };
    } catch (error) {
      console.error('Error getting repository stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const repositoryService = new RepositoryService();