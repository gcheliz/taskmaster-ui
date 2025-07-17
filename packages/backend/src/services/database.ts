import { PrismaClient } from '@prisma/client';

export class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient | null = null;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    if (this.prisma) {
      return;
    }

    try {
      this.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      });
      
      // Test the connection
      await this.prisma.$connect();
      console.log('Connected to PostgreSQL database via Prisma');
      
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.prisma) {
      return;
    }

    try {
      await this.prisma.$disconnect();
      console.log('Disconnected from PostgreSQL database');
      this.prisma = null;
    } catch (error) {
      console.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  public getPrisma(): PrismaClient {
    if (!this.prisma) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.prisma;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.prisma) {
        return false;
      }
      
      // Simple query to test database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  public async getStats(): Promise<{
    projectCount: number;
    repositoryCount: number;
    taskCount: number;
    commitCount: number;
  }> {
    if (!this.prisma) {
      throw new Error('Database not connected. Call connect() first.');
    }

    try {
      const [projectCount, repositoryCount, taskCount, commitCount] = await Promise.all([
        this.prisma.project.count(),
        this.prisma.repository.count(),
        this.prisma.task.count(),
        this.prisma.commit.count(),
      ]);

      return {
        projectCount,
        repositoryCount,
        taskCount,
        commitCount,
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  /**
   * Transaction wrapper for complex operations
   */
  public async transaction<T>(
    fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
  ): Promise<T> {
    if (!this.prisma) {
      throw new Error('Database not connected. Call connect() first.');
    }

    return this.prisma.$transaction(fn);
  }

  /**
   * Initialize database schema using Prisma migrations
   * This should be called during application startup
   */
  public async initializeSchema(): Promise<void> {
    console.log('Schema initialization is handled by Prisma migrations');
    console.log('Use "prisma migrate deploy" in production or "prisma migrate dev" in development');
  }
}

export default DatabaseService.getInstance();