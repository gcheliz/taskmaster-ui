import { DatabaseService } from './database';
import { Commit } from '@prisma/client';

export interface CommitWithRepository extends Commit {
  repository?: {
    id: string;
    name: string;
    path: string;
    project: {
      id: string;
      name: string;
    };
  };
}

/**
 * Commit Service
 *
 * Handles commit data persistence and retrieval from the database.
 * Provides CRUD operations for Git commit tracking using Prisma.
 */
export class CommitService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  /**
   * Create a new commit record
   */
  async createCommit(data: {
    hash: string;
    message: string;
    author: string;
    timestamp: Date;
    repositoryId: string;
  }): Promise<Commit> {
    try {
      const prisma = this.dbService.getPrisma();
      const commit = await prisma.commit.create({
        data: {
          hash: data.hash,
          message: data.message,
          author: data.author,
          timestamp: data.timestamp,
          repositoryId: data.repositoryId,
        },
        include: {
          repository: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      return commit;
    } catch (error) {
      console.error('Error creating commit:', error);
      throw error;
    }
  }

  /**
   * Get commit by hash
   */
  async getCommitByHash(hash: string): Promise<CommitWithRepository | null> {
    try {
      const prisma = this.dbService.getPrisma();
      const commit = await prisma.commit.findUnique({
        where: { hash },
        include: {
          repository: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      return commit;
    } catch (error) {
      console.error('Error getting commit by hash:', error);
      throw error;
    }
  }

  /**
   * Get commits by repository ID
   */
  async getCommitsByRepositoryId(
    repositoryId: string,
    options?: {
      limit?: number;
      offset?: number;
      since?: Date;
      until?: Date;
      author?: string;
    }
  ): Promise<Commit[]> {
    try {
      const prisma = this.dbService.getPrisma();

      const where: any = { repositoryId };

      if (options?.since || options?.until) {
        where.timestamp = {};
        if (options.since) {
          where.timestamp.gte = options.since;
        }
        if (options.until) {
          where.timestamp.lte = options.until;
        }
      }

      if (options?.author) {
        where.author = {
          contains: options.author,
          mode: 'insensitive',
        };
      }

      const commits = await prisma.commit.findMany({
        where,
        orderBy: {
          timestamp: 'desc',
        },
        take: options?.limit,
        skip: options?.offset,
        include: {
          repository: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      return commits;
    } catch (error) {
      console.error('Error getting commits by repository ID:', error);
      throw error;
    }
  }

  /**
   * Get commits by project ID (across all repositories)
   */
  async getCommitsByProjectId(
    projectId: string,
    options?: {
      limit?: number;
      offset?: number;
      since?: Date;
      until?: Date;
      author?: string;
    }
  ): Promise<CommitWithRepository[]> {
    try {
      const prisma = this.dbService.getPrisma();

      const where: any = {
        repository: {
          projectId,
        },
      };

      if (options?.since || options?.until) {
        where.timestamp = {};
        if (options.since) {
          where.timestamp.gte = options.since;
        }
        if (options.until) {
          where.timestamp.lte = options.until;
        }
      }

      if (options?.author) {
        where.author = {
          contains: options.author,
          mode: 'insensitive',
        };
      }

      const commits = await prisma.commit.findMany({
        where,
        orderBy: {
          timestamp: 'desc',
        },
        take: options?.limit,
        skip: options?.offset,
        include: {
          repository: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      return commits;
    } catch (error) {
      console.error('Error getting commits by project ID:', error);
      throw error;
    }
  }

  /**
   * Get latest commit for a repository
   */
  async getLatestCommit(repositoryId: string): Promise<Commit | null> {
    try {
      const prisma = this.dbService.getPrisma();
      const commit = await prisma.commit.findFirst({
        where: { repositoryId },
        orderBy: {
          timestamp: 'desc',
        },
        include: {
          repository: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      return commit;
    } catch (error) {
      console.error('Error getting latest commit:', error);
      throw error;
    }
  }

  /**
   * Update commit information
   */
  async updateCommit(
    hash: string,
    updates: {
      message?: string;
      author?: string;
      timestamp?: Date;
    }
  ): Promise<Commit | null> {
    try {
      const prisma = this.dbService.getPrisma();

      // Check if commit exists
      const existing = await prisma.commit.findUnique({
        where: { hash },
      });

      if (!existing) {
        return null;
      }

      const commit = await prisma.commit.update({
        where: { hash },
        data: updates,
        include: {
          repository: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return commit;
    } catch (error) {
      console.error('Error updating commit:', error);
      throw error;
    }
  }

  /**
   * Delete commit
   */
  async deleteCommit(hash: string): Promise<boolean> {
    try {
      const prisma = this.dbService.getPrisma();

      // Check if commit exists
      const existing = await prisma.commit.findUnique({
        where: { hash },
      });

      if (!existing) {
        return false;
      }

      await prisma.commit.delete({
        where: { hash },
      });

      return true;
    } catch (error) {
      console.error('Error deleting commit:', error);
      throw error;
    }
  }

  /**
   * Get commit statistics for a repository
   */
  async getCommitStatistics(
    repositoryId: string,
    days: number = 30
  ): Promise<{
    totalCommits: number;
    commitsInPeriod: number;
    uniqueAuthors: number;
    averageCommitsPerDay: number;
    commitsByAuthor: { author: string; count: number }[];
    commitsByDay: { date: string; count: number }[];
  }> {
    try {
      const prisma = this.dbService.getPrisma();

      const since = new Date();
      since.setDate(since.getDate() - days);

      const [totalCommits, commitsInPeriod, commitsWithAuthors] =
        await Promise.all([
          prisma.commit.count({
            where: { repositoryId },
          }),
          prisma.commit.count({
            where: {
              repositoryId,
              timestamp: { gte: since },
            },
          }),
          prisma.commit.findMany({
            where: {
              repositoryId,
              timestamp: { gte: since },
            },
            select: {
              author: true,
              timestamp: true,
            },
          }),
        ]);

      // Calculate unique authors
      const uniqueAuthors = new Set(commitsWithAuthors.map(c => c.author)).size;

      // Calculate average commits per day
      const averageCommitsPerDay = commitsInPeriod / days;

      // Group commits by author
      const authorCounts = commitsWithAuthors.reduce(
        (acc, commit) => {
          acc[commit.author] = (acc[commit.author] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const commitsByAuthor = Object.entries(authorCounts)
        .map(([author, count]) => ({ author, count }))
        .sort((a, b) => b.count - a.count);

      // Group commits by day
      const dayCounts = commitsWithAuthors.reduce(
        (acc, commit) => {
          const date = commit.timestamp.toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const commitsByDay = Object.entries(dayCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalCommits,
        commitsInPeriod,
        uniqueAuthors,
        averageCommitsPerDay: Math.round(averageCommitsPerDay * 100) / 100,
        commitsByAuthor,
        commitsByDay,
      };
    } catch (error) {
      console.error('Error getting commit statistics:', error);
      throw error;
    }
  }

  /**
   * Bulk create commits (useful for importing Git history)
   */
  async bulkCreateCommits(
    commits: Array<{
      hash: string;
      message: string;
      author: string;
      timestamp: Date;
      repositoryId: string;
    }>
  ): Promise<number> {
    try {
      const prisma = this.dbService.getPrisma();

      // Use createMany for efficient bulk insert
      const result = await prisma.commit.createMany({
        data: commits,
        skipDuplicates: true, // Skip commits that already exist
      });

      return result.count;
    } catch (error) {
      console.error('Error bulk creating commits:', error);
      throw error;
    }
  }

  /**
   * Check if commit exists
   */
  async commitExists(hash: string): Promise<boolean> {
    try {
      const commit = await this.getCommitByHash(hash);
      return commit !== null;
    } catch (error) {
      console.error('Error checking commit existence:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const commitService = new CommitService();
