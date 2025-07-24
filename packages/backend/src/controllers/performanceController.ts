/**
 * Performance Monitoring Controller
 *
 * Provides endpoints for database performance monitoring and query analysis
 */

import { Request, Response } from 'express';
import { logger } from '../utils/winston-adapter';
import { DatabaseService } from '../services/database';
import queryAnalyzer from '../services/queryAnalyzer';

export class PerformanceController {
  /**
   * Get query performance analysis
   */
  public async getQueryAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const analysis = DatabaseService.getInstance().getQueryAnalysis();

      res.json({
        success: true,
        data: analysis,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error getting query analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get query analysis',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Clear query logs and metrics
   */
  public async clearLogs(req: Request, res: Response): Promise<void> {
    try {
      DatabaseService.getInstance().clearQueryLogs();

      res.json({
        success: true,
        message: 'Query logs cleared successfully',
      });
    } catch (error) {
      logger.error('Error clearing logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear logs',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Export query logs
   */
  public async exportLogs(req: Request, res: Response): Promise<void> {
    try {
      const filename = `query-logs-${Date.now()}.json`;
      const outputPath = `/tmp/${filename}`;

      DatabaseService.getInstance().exportQueryLogs(outputPath);

      res.download(outputPath, filename, err => {
        if (err) {
          logger.error('Error downloading file:', err);
          res.status(500).json({
            success: false,
            error: 'Failed to download logs',
          });
        }
      });
    } catch (error) {
      logger.error('Error exporting logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export logs',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Get database connection info and pool status
   */
  public async getConnectionInfo(req: Request, res: Response): Promise<void> {
    try {
      const dbService = DatabaseService.getInstance();
      const isHealthy = await dbService.healthCheck();
      const stats = await dbService.getStats();

      // Get connection string info (sanitized)
      const databaseUrl = process.env.DATABASE_URL || '';
      const urlObj = databaseUrl ? new URL(databaseUrl) : null;

      const connectionInfo = {
        isHealthy,
        host: urlObj?.hostname || 'unknown',
        port: urlObj?.port || 'unknown',
        database: urlObj?.pathname?.slice(1) || 'unknown',
        connectionPoolSize:
          urlObj?.searchParams.get('connection_limit') || 'default',
        poolTimeout: urlObj?.searchParams.get('pool_timeout') || 'default',
        statementTimeout:
          urlObj?.searchParams.get('statement_timeout') || 'default',
      };

      res.json({
        success: true,
        data: {
          connection: connectionInfo,
          stats,
          queryAnalysisEnabled: queryAnalyzer.getEnabled(),
        },
      });
    } catch (error) {
      logger.error('Error getting connection info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get connection info',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Run database performance test
   */
  public async runPerformanceTest(req: Request, res: Response): Promise<void> {
    try {
      const dbService = DatabaseService.getInstance();
      const prisma = dbService.getPrisma();

      const startTime = Date.now();
      const results: Array<{
        test: string;
        duration: number;
        recordCount: number;
        status?: string;
      }> = [];

      // Test 1: Simple SELECT query
      const simpleStart = Date.now();
      await prisma.$queryRaw`SELECT 1 as test`;
      results.push({
        test: 'Simple SELECT',
        duration: Date.now() - simpleStart,
        recordCount: 1,
        status: 'passed',
      });

      // Test 2: Count queries
      const countStart = Date.now();
      const [projectCount, taskCount] = await Promise.all([
        prisma.project.count(),
        prisma.task.count(),
      ]);
      results.push({
        test: 'Count queries',
        duration: Date.now() - countStart,
        recordCount: projectCount + taskCount,
        status: 'passed',
      });

      // Test 3: Join query (tasks with projects)
      const joinStart = Date.now();
      const tasksWithProjects = await prisma.task.findMany({
        take: 10,
        include: {
          project: true,
        },
      });
      results.push({
        test: 'Join query (tasks with projects)',
        duration: Date.now() - joinStart,
        recordCount: tasksWithProjects.length,
        status: 'passed',
      });

      // Test 4: Complex query with filtering
      const complexStart = Date.now();
      const complexQuery = await prisma.task.findMany({
        where: {
          OR: [{ status: 'IN_PROGRESS' }, { priority: 'HIGH' }],
        },
        include: {
          project: {
            select: {
              name: true,
              description: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });
      results.push({
        test: 'Complex filtered query',
        duration: Date.now() - complexStart,
        recordCount: complexQuery.length,
        status: 'passed',
      });

      const totalTime = Date.now() - startTime;

      // Record performance metrics
      dbService.recordPerformanceMetric({
        responseTime: totalTime,
        queryCount: results.length,
      });

      res.json({
        success: true,
        data: {
          totalDuration: totalTime,
          tests: results,
          summary: {
            averageQueryTime:
              results.reduce((sum, r) => sum + r.duration, 0) / results.length,
            slowestQuery: results.reduce((slowest, current) =>
              current.duration > slowest.duration ? current : slowest
            ),
            fastestQuery: results.reduce((fastest, current) =>
              current.duration < fastest.duration ? current : fastest
            ),
          },
        },
      });
    } catch (error) {
      logger.error('Error running performance test:', error);
      res.status(500).json({
        success: false,
        error: 'Performance test failed',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Get slow query analysis with EXPLAIN plans
   */
  public async analyzeSlowQueries(req: Request, res: Response): Promise<void> {
    try {
      const dbService = DatabaseService.getInstance();
      const prisma = dbService.getPrisma();

      // Get analysis from query analyzer
      const analysis = dbService.getQueryAnalysis();

      // Run EXPLAIN on some sample queries to analyze performance
      const explainResults = [];

      // EXPLAIN a complex task query
      try {
        const explainPlan = await prisma.$queryRaw`
          EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
          SELECT t.*, p.name as project_name 
          FROM tasks t 
          JOIN projects p ON t."projectId" = p.id 
          WHERE t.status = 'IN_PROGRESS' 
          ORDER BY t."createdAt" DESC 
          LIMIT 10
        `;
        explainResults.push({
          query: 'Tasks with projects (IN_PROGRESS)',
          plan: explainPlan,
        });
      } catch (explainError) {
        explainResults.push({
          query: 'Tasks with projects (IN_PROGRESS)',
          error: (explainError as Error).message,
        });
      }

      // EXPLAIN a repository query
      try {
        const explainPlan2 = await prisma.$queryRaw`
          EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
          SELECT r.*, p.name as project_name, COUNT(c.id) as commit_count
          FROM repositories r
          JOIN projects p ON r."projectId" = p.id
          LEFT JOIN commits c ON c."repositoryId" = r.id
          GROUP BY r.id, p.name
        `;
        explainResults.push({
          query: 'Repositories with commit counts',
          plan: explainPlan2,
        });
      } catch (explainError) {
        explainResults.push({
          query: 'Repositories with commit counts',
          error: (explainError as Error).message,
        });
      }

      res.json({
        success: true,
        data: {
          queryAnalysis: analysis,
          explainPlans: explainResults,
          recommendations: this.generateOptimizationRecommendations(
            analysis,
            explainResults
          ),
        },
      });
    } catch (error) {
      logger.error('Error analyzing slow queries:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze slow queries',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Generate optimization recommendations based on analysis
   */
  private generateOptimizationRecommendations(
    analysis: any,
    explainResults: unknown[]
  ): string[] {
    const recommendations: string[] = [];

    // Add recommendations from query analyzer
    if (analysis.recommendations) {
      recommendations.push(...analysis.recommendations);
    }

    // Analyze EXPLAIN plans for additional recommendations
    explainResults.forEach(result => {
      const typedResult = result as { plan?: Array<{ Plan?: unknown; 'Execution Time'?: number }> };
      if (typedResult.plan && Array.isArray(typedResult.plan)) {
        const plan = typedResult.plan[0];
        if (plan && plan.Plan) {
          const executionTime = plan['Execution Time'];
          if (executionTime && executionTime > 100) {
            recommendations.push(
              `Consider optimizing: ${(result as { query?: string }).query} (${executionTime}ms execution time)`
            );
          }

          // Check for sequential scans
          if (this.hasSequentialScan(plan.Plan)) {
            recommendations.push(
              `Add indexes to avoid sequential scans in: ${(result as any).query || 'unknown query'}`
            );
          }
        }
      }
    });

    return recommendations;
  }

  /**
   * Check if execution plan contains sequential scans
   */
  private hasSequentialScan(plan: any): boolean {
    if (!plan) return false;

    if (plan['Node Type'] === 'Seq Scan') {
      return true;
    }

    if (plan.Plans && Array.isArray(plan.Plans)) {
      return plan.Plans.some((subPlan: any) => this.hasSequentialScan(subPlan));
    }

    return false;
  }

  /**
   * Toggle query analysis on/off
   */
  public async toggleAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'enabled must be a boolean value',
        });
        return;
      }

      queryAnalyzer.setEnabled(enabled);

      res.json({
        success: true,
        message: `Query analysis ${enabled ? 'enabled' : 'disabled'}`,
        enabled: queryAnalyzer.getEnabled(),
      });
    } catch (error) {
      logger.error('Error toggling analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to toggle analysis',
        message: (error as Error).message,
      });
    }
  }
}

export default new PerformanceController();
