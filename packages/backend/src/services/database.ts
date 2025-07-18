import { PrismaClient } from '@prisma/client';
import queryAnalyzer from './queryAnalyzer';
import { getDatabaseConfig, env } from '../config/environment';

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
      // Get database configuration with SSL support
      const dbConfig = getDatabaseConfig();

      // Use enhanced Prisma client with query analysis and SSL configuration
      this.prisma = queryAnalyzer.createEnhancedPrismaClient(dbConfig);

      // Test the connection
      await this.prisma.$connect();
      console.log('Connected to PostgreSQL database via Prisma');

      if (env.DATABASE_SSL === 'true') {
        console.log('🔒 SSL/TLS encryption enabled for database connection');
      }

      if (queryAnalyzer.getEnabled()) {
        console.log('🔍 Query performance analysis enabled');
      }
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
    connectionInfo?: any;
  }> {
    if (!this.prisma) {
      throw new Error('Database not connected. Call connect() first.');
    }

    try {
      const [projectCount, repositoryCount, taskCount, commitCount] =
        await Promise.all([
          this.prisma.project.count(),
          this.prisma.repository.count(),
          this.prisma.task.count(),
          this.prisma.commit.count(),
        ]);

      // Get connection pool information
      let connectionInfo = null;
      try {
        // Query PostgreSQL stats for connection monitoring
        const poolStats = await this.prisma.$queryRaw`
          SELECT 
            application_name,
            state,
            count(*) as connection_count,
            ssl
          FROM pg_stat_activity 
          WHERE application_name = 'taskmaster-ui-backend'
          GROUP BY application_name, state, ssl
        `;
        connectionInfo = poolStats;
      } catch (poolError) {
        console.warn('Could not retrieve connection pool stats:', poolError);
      }

      return {
        projectCount,
        repositoryCount,
        taskCount,
        commitCount,
        connectionInfo,
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
    fn: (
      prisma: Omit<
        PrismaClient,
        | '$connect'
        | '$disconnect'
        | '$on'
        | '$transaction'
        | '$use'
        | '$extends'
      >
    ) => Promise<T>
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
    console.log(
      'Use "prisma migrate deploy" in production or "prisma migrate dev" in development'
    );

    // Validate database connection security in production
    if (env.NODE_ENV === 'production' && env.DATABASE_SSL !== 'true') {
      console.warn('⚠️  Database SSL is disabled in production environment');
    }
  }

  /**
   * Get query performance analysis
   */
  public getQueryAnalysis() {
    return queryAnalyzer.getPerformanceSummary();
  }

  /**
   * Record performance metric for an operation
   */
  public recordPerformanceMetric(metric: {
    responseTime: number;
    queryCount: number;
    cacheHitRate?: number;
    memoryUsage?: number;
  }): void {
    queryAnalyzer.recordPerformanceMetric(metric);
  }

  /**
   * Clear query logs and metrics
   */
  public clearQueryLogs(): void {
    queryAnalyzer.clearLogs();
  }

  /**
   * Export query logs for analysis
   */
  public exportQueryLogs(outputPath: string): void {
    queryAnalyzer.exportLogs(outputPath);
  }
}

export default DatabaseService.getInstance();
