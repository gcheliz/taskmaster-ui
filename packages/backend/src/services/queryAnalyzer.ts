/**
 * Query Performance Analyzer
 * 
 * This service provides comprehensive query performance monitoring and analysis
 * for the TaskMaster UI database operations.
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface QueryLog {
  timestamp: Date;
  query: string;
  params?: any[];
  duration?: number;
  target: string;
  level: 'query' | 'info' | 'warn' | 'error';
}

interface QueryStats {
  totalQueries: number;
  averageDuration: number;
  slowestQuery: QueryLog | null;
  fastestQuery: QueryLog | null;
  mostFrequentQueries: { query: string; count: number; avgDuration: number }[];
  queryTypes: { [key: string]: number };
}

interface PerformanceMetrics {
  responseTime: number;
  queryCount: number;
  cacheHitRate?: number;
  memoryUsage?: number;
}

export class QueryAnalyzer {
  private queryLogs: QueryLog[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private logFile: string;
  private isEnabled: boolean;

  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'query-performance.log');
    this.isEnabled = process.env.NODE_ENV === 'development' || process.env.ENABLE_QUERY_ANALYSIS === 'true';
    this.ensureLogDirectory();
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Create enhanced Prisma client with query logging
   */
  public createEnhancedPrismaClient(): PrismaClient {
    const logLevels = this.isEnabled 
      ? ['query', 'info', 'warn', 'error'] as const
      : ['error'] as const;

    const prisma = new PrismaClient({
      log: logLevels.map(level => ({
        level,
        emit: 'event'
      })),
      // Connection pooling configuration
      datasources: {
        db: {
          url: this.enhanceConnectionString(process.env.DATABASE_URL || '')
        }
      }
    });

    if (this.isEnabled) {
      this.setupQueryLogging(prisma);
    }

    return prisma;
  }

  /**
   * Enhance connection string with performance optimizations
   */
  private enhanceConnectionString(url: string): string {
    if (!url) return url;

    const urlObj = new URL(url);
    
    // Environment-based connection pool settings
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Connection Pool Configuration
    if (!urlObj.searchParams.has('connection_limit')) {
      // Production: Higher connection limit for concurrent requests
      // Development: Lower limit to prevent resource exhaustion
      urlObj.searchParams.set('connection_limit', isProduction ? '20' : '10');
    }
    
    if (!urlObj.searchParams.has('pool_timeout')) {
      // Time in seconds to wait for an available connection
      urlObj.searchParams.set('pool_timeout', '10');
    }

    // Performance and Reliability Settings
    if (!urlObj.searchParams.has('statement_timeout')) {
      // Maximum time for query execution (30 seconds)
      urlObj.searchParams.set('statement_timeout', '30000');
    }

    if (!urlObj.searchParams.has('connect_timeout')) {
      // Time to wait for initial connection (10 seconds)
      urlObj.searchParams.set('connect_timeout', '10');
    }

    if (!urlObj.searchParams.has('socket_timeout')) {
      // Socket timeout for network operations (30 seconds)
      urlObj.searchParams.set('socket_timeout', '30');
    }

    // Connection Health and Retry Settings
    if (!urlObj.searchParams.has('application_name')) {
      // Application identifier for connection tracking
      urlObj.searchParams.set('application_name', 'taskmaster-ui-backend');
    }

    // PostgreSQL-specific optimizations
    if (!urlObj.searchParams.has('tcp_keepalives_idle')) {
      // Keep-alive settings for long-lived connections
      urlObj.searchParams.set('tcp_keepalives_idle', '300'); // 5 minutes
    }

    if (!urlObj.searchParams.has('tcp_keepalives_interval')) {
      urlObj.searchParams.set('tcp_keepalives_interval', '30'); // 30 seconds
    }

    if (!urlObj.searchParams.has('tcp_keepalives_count')) {
      urlObj.searchParams.set('tcp_keepalives_count', '3'); // 3 retries
    }

    return urlObj.toString();
  }

  /**
   * Setup query logging for Prisma client
   */
  private setupQueryLogging(prisma: PrismaClient): void {
    // Query logging
    (prisma as any).$on('query', (event: any) => {
      const queryLog: QueryLog = {
        timestamp: new Date(),
        query: event.query,
        params: event.params,
        duration: event.duration,
        target: event.target,
        level: 'query'
      };

      this.recordQuery(queryLog);
    });

    // Info logging
    (prisma as any).$on('info', (event: any) => {
      const queryLog: QueryLog = {
        timestamp: new Date(),
        query: event.message,
        target: event.target,
        level: 'info'
      };

      this.recordQuery(queryLog);
    });

    // Warning logging
    (prisma as any).$on('warn', (event: any) => {
      const queryLog: QueryLog = {
        timestamp: new Date(),
        query: event.message,
        target: event.target,
        level: 'warn'
      };

      this.recordQuery(queryLog);
      console.warn('Prisma Warning:', event.message);
    });

    // Error logging
    (prisma as any).$on('error', (event: any) => {
      const queryLog: QueryLog = {
        timestamp: new Date(),
        query: event.message,
        target: event.target,
        level: 'error'
      };

      this.recordQuery(queryLog);
      console.error('Prisma Error:', event.message);
    });
  }

  /**
   * Record a query for analysis
   */
  private recordQuery(queryLog: QueryLog): void {
    if (!this.isEnabled) return;

    this.queryLogs.push(queryLog);

    // Keep only last 1000 queries in memory
    if (this.queryLogs.length > 1000) {
      this.queryLogs = this.queryLogs.slice(-1000);
    }

    // Write to log file
    this.writeToLogFile(queryLog);

    // Alert on slow queries
    if (queryLog.duration && queryLog.duration > 1000) { // 1 second threshold
      console.warn(`🐌 Slow query detected (${queryLog.duration}ms):`, queryLog.query);
    }
  }

  /**
   * Write query log to file
   */
  private writeToLogFile(queryLog: QueryLog): void {
    try {
      const logEntry = {
        timestamp: queryLog.timestamp.toISOString(),
        level: queryLog.level,
        duration: queryLog.duration,
        target: queryLog.target,
        query: queryLog.query,
        params: queryLog.params
      };

      fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Failed to write query log:', error);
    }
  }

  /**
   * Analyze query performance
   */
  public analyzeQueries(): QueryStats {
    const queryOnlyLogs = this.queryLogs.filter(log => log.level === 'query' && log.duration);

    if (queryOnlyLogs.length === 0) {
      return {
        totalQueries: 0,
        averageDuration: 0,
        slowestQuery: null,
        fastestQuery: null,
        mostFrequentQueries: [],
        queryTypes: {}
      };
    }

    // Calculate basic stats
    const durations = queryOnlyLogs.map(log => log.duration!);
    const totalQueries = queryOnlyLogs.length;
    const averageDuration = durations.reduce((sum, duration) => sum + duration, 0) / totalQueries;

    // Find slowest and fastest queries
    const slowestQuery = queryOnlyLogs.reduce((slowest, current) => 
      (current.duration! > (slowest?.duration || 0)) ? current : slowest
    );

    const fastestQuery = queryOnlyLogs.reduce((fastest, current) => 
      (current.duration! < (fastest?.duration || Infinity)) ? current : fastest
    );

    // Analyze query frequency and performance
    const queryFrequency = new Map<string, { count: number; totalDuration: number }>();
    
    queryOnlyLogs.forEach(log => {
      // Normalize query by removing parameter values
      const normalizedQuery = this.normalizeQuery(log.query);
      const existing = queryFrequency.get(normalizedQuery) || { count: 0, totalDuration: 0 };
      
      queryFrequency.set(normalizedQuery, {
        count: existing.count + 1,
        totalDuration: existing.totalDuration + (log.duration || 0)
      });
    });

    // Get most frequent queries
    const mostFrequentQueries = Array.from(queryFrequency.entries())
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        avgDuration: stats.totalDuration / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Analyze query types
    const queryTypes: { [key: string]: number } = {};
    queryOnlyLogs.forEach(log => {
      const type = this.getQueryType(log.query);
      queryTypes[type] = (queryTypes[type] || 0) + 1;
    });

    return {
      totalQueries,
      averageDuration,
      slowestQuery,
      fastestQuery,
      mostFrequentQueries,
      queryTypes
    };
  }

  /**
   * Normalize query by removing parameter values
   */
  private normalizeQuery(query: string): string {
    // Replace parameter placeholders with generic markers
    return query
      .replace(/\$\d+/g, '$?')
      .replace(/'[^']*'/g, "'?'")
      .replace(/\d+/g, '?')
      .trim();
  }

  /**
   * Determine query type from SQL
   */
  private getQueryType(query: string): string {
    const trimmed = query.trim().toUpperCase();
    
    if (trimmed.startsWith('SELECT')) return 'SELECT';
    if (trimmed.startsWith('INSERT')) return 'INSERT';
    if (trimmed.startsWith('UPDATE')) return 'UPDATE';
    if (trimmed.startsWith('DELETE')) return 'DELETE';
    if (trimmed.startsWith('BEGIN')) return 'TRANSACTION';
    if (trimmed.startsWith('COMMIT')) return 'COMMIT';
    if (trimmed.startsWith('ROLLBACK')) return 'ROLLBACK';
    
    return 'OTHER';
  }

  /**
   * Record performance metrics for an operation
   */
  public recordPerformanceMetric(metric: PerformanceMetrics): void {
    if (!this.isEnabled) return;

    this.performanceMetrics.push({
      ...metric,
      // Add timestamp for metric
      timestamp: Date.now()
    } as any);

    // Keep only last 500 metrics
    if (this.performanceMetrics.length > 500) {
      this.performanceMetrics = this.performanceMetrics.slice(-500);
    }
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    queryStats: QueryStats;
    recentMetrics: PerformanceMetrics[];
    recommendations: string[];
  } {
    const queryStats = this.analyzeQueries();
    const recentMetrics = this.performanceMetrics.slice(-50);
    const recommendations = this.generateRecommendations(queryStats);

    return {
      queryStats,
      recentMetrics,
      recommendations
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(stats: QueryStats): string[] {
    const recommendations: string[] = [];

    // Check average query duration
    if (stats.averageDuration > 100) {
      recommendations.push('Consider adding database indexes for frequently queried fields');
    }

    // Check for slow queries
    if (stats.slowestQuery && stats.slowestQuery.duration! > 1000) {
      recommendations.push('Investigate and optimize the slowest queries');
    }

    // Check query frequency
    const selectQueries = stats.queryTypes['SELECT'] || 0;
    const totalQueries = stats.totalQueries;
    
    if (selectQueries / totalQueries > 0.8) {
      recommendations.push('Consider implementing query result caching');
    }

    // Check for frequent complex queries
    stats.mostFrequentQueries.forEach(query => {
      if (query.count > 10 && query.avgDuration > 50) {
        recommendations.push(`Optimize frequently executed query: ${query.query.substring(0, 50)}...`);
      }
    });

    return recommendations;
  }

  /**
   * Clear logs and metrics
   */
  public clearLogs(): void {
    this.queryLogs = [];
    this.performanceMetrics = [];
    
    // Clear log file
    try {
      fs.writeFileSync(this.logFile, '');
    } catch (error) {
      console.error('Failed to clear log file:', error);
    }
  }

  /**
   * Export logs to file for external analysis
   */
  public exportLogs(outputPath: string): void {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        queryLogs: this.queryLogs,
        performanceMetrics: this.performanceMetrics,
        summary: this.getPerformanceSummary()
      };

      fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
      console.log(`Query logs exported to: ${outputPath}`);
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  }

  /**
   * Enable or disable query analysis
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if query analysis is enabled
   */
  public getEnabled(): boolean {
    return this.isEnabled;
  }
}

export default new QueryAnalyzer();