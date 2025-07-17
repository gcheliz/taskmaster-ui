#!/usr/bin/env ts-node

/**
 * Database Performance Load Testing Script
 * 
 * This script performs comprehensive load testing and EXPLAIN analysis
 * to verify database performance optimizations meet the <100ms requirement
 * for 95th percentile of API endpoints.
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface LoadTestResult {
  testName: string;
  totalRequests: number;
  duration: number;
  averageResponseTime: number;
  percentile95: number;
  percentile99: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  failureCount: number;
  successRate: number;
}

interface ExplainResult {
  query: string;
  executionTime: number;
  planningTime: number;
  totalTime: number;
  plan: any;
  usesIndex: boolean;
  hasSeqScan: boolean;
}

class PerformanceLoadTester {
  private prisma: PrismaClient;
  private results: LoadTestResult[] = [];
  private explainResults: ExplainResult[] = [];

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error']
    });
  }

  /**
   * Run comprehensive load testing suite
   */
  public async runLoadTests(): Promise<void> {
    console.log('🚀 Starting Database Performance Load Testing...\n');

    // Ensure database is connected
    await this.prisma.$connect();
    
    try {
      // Run individual load tests
      await this.testSimpleQueries();
      await this.testTaskQueries();
      await this.testProjectQueries();
      await this.testComplexJoinQueries();
      await this.testConcurrentOperations();
      
      // Run EXPLAIN analysis
      await this.runExplainAnalysis();
      
      // Generate performance report
      await this.generateReport();
      
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Test simple SELECT queries
   */
  private async testSimpleQueries(): Promise<void> {
    console.log('📊 Testing simple SELECT queries...');
    
    const testName = 'Simple SELECT Queries';
    const requestCount = 100;
    const responseTimes: number[] = [];
    let failureCount = 0;

    const startTime = Date.now();

    for (let i = 0; i < requestCount; i++) {
      const queryStart = Date.now();
      try {
        await this.prisma.$queryRaw`SELECT 1 as test_result`;
        responseTimes.push(Date.now() - queryStart);
      } catch (error) {
        failureCount++;
        console.error(`Query ${i + 1} failed:`, error);
      }
    }

    const duration = Date.now() - startTime;
    this.recordTestResult(testName, requestCount, duration, responseTimes, failureCount);
  }

  /**
   * Test task-related queries with various filters
   */
  private async testTaskQueries(): Promise<void> {
    console.log('📊 Testing task queries...');
    
    const testName = 'Task Queries';
    const requestCount = 50;
    const responseTimes: number[] = [];
    let failureCount = 0;

    const startTime = Date.now();

    const testQueries = [
      () => this.prisma.task.findMany({ take: 10 }),
      () => this.prisma.task.findMany({ where: { status: 'IN_PROGRESS' }, take: 10 }),
      () => this.prisma.task.findMany({ where: { priority: 'HIGH' }, take: 10 }),
      () => this.prisma.task.findMany({ 
        where: { 
          OR: [
            { status: 'IN_PROGRESS' },
            { priority: 'HIGH' }
          ]
        }, 
        take: 10 
      }),
      () => this.prisma.task.count(),
      () => this.prisma.task.count({ where: { status: 'COMPLETED' } }),
    ];

    for (let i = 0; i < requestCount; i++) {
      const query = testQueries[i % testQueries.length];
      const queryStart = Date.now();
      
      try {
        await query();
        responseTimes.push(Date.now() - queryStart);
      } catch (error) {
        failureCount++;
        console.error(`Task query ${i + 1} failed:`, error);
      }
    }

    const duration = Date.now() - startTime;
    this.recordTestResult(testName, requestCount, duration, responseTimes, failureCount);
  }

  /**
   * Test project-related queries
   */
  private async testProjectQueries(): Promise<void> {
    console.log('📊 Testing project queries...');
    
    const testName = 'Project Queries';
    const requestCount = 30;
    const responseTimes: number[] = [];
    let failureCount = 0;

    const startTime = Date.now();

    for (let i = 0; i < requestCount; i++) {
      const queryStart = Date.now();
      
      try {
        await this.prisma.project.findMany({
          include: {
            tasks: {
              take: 5,
              orderBy: { createdAt: 'desc' }
            },
            repositories: {
              take: 3
            }
          },
          take: 5
        });
        responseTimes.push(Date.now() - queryStart);
      } catch (error) {
        failureCount++;
        console.error(`Project query ${i + 1} failed:`, error);
      }
    }

    const duration = Date.now() - startTime;
    this.recordTestResult(testName, requestCount, duration, responseTimes, failureCount);
  }

  /**
   * Test complex JOIN queries
   */
  private async testComplexJoinQueries(): Promise<void> {
    console.log('📊 Testing complex JOIN queries...');
    
    const testName = 'Complex JOIN Queries';
    const requestCount = 20;
    const responseTimes: number[] = [];
    let failureCount = 0;

    const startTime = Date.now();

    for (let i = 0; i < requestCount; i++) {
      const queryStart = Date.now();
      
      try {
        await this.prisma.task.findMany({
          where: {
            OR: [
              { status: 'IN_PROGRESS' },
              { priority: 'HIGH' }
            ]
          },
          include: {
            project: {
              include: {
                repositories: {
                  include: {
                    commits: {
                      take: 5,
                      orderBy: { timestamp: 'desc' }
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        });
        responseTimes.push(Date.now() - queryStart);
      } catch (error) {
        failureCount++;
        console.error(`Complex query ${i + 1} failed:`, error);
      }
    }

    const duration = Date.now() - startTime;
    this.recordTestResult(testName, requestCount, duration, responseTimes, failureCount);
  }

  /**
   * Test concurrent operations to simulate real-world load
   */
  private async testConcurrentOperations(): Promise<void> {
    console.log('📊 Testing concurrent operations...');
    
    const testName = 'Concurrent Operations';
    const concurrentRequests = 10;
    const batchCount = 5;
    const responseTimes: number[] = [];
    let failureCount = 0;

    const startTime = Date.now();

    for (let batch = 0; batch < batchCount; batch++) {
      const promises: Promise<void>[] = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        const promise = (async () => {
          const queryStart = Date.now();
          try {
            // Mix of different query types
            const queries = [
              this.prisma.task.count(),
              this.prisma.project.count(),
              this.prisma.task.findMany({ take: 5 }),
              this.prisma.project.findMany({ take: 3 })
            ];
            
            await Promise.all(queries);
            responseTimes.push(Date.now() - queryStart);
          } catch (error) {
            failureCount++;
            console.error(`Concurrent operation failed:`, error);
          }
        })();
        
        promises.push(promise);
      }
      
      await Promise.all(promises);
    }

    const duration = Date.now() - startTime;
    this.recordTestResult(testName, concurrentRequests * batchCount, duration, responseTimes, failureCount);
  }

  /**
   * Run EXPLAIN analysis on key queries
   */
  private async runExplainAnalysis(): Promise<void> {
    console.log('\n🔍 Running EXPLAIN analysis...');

    const queries = [
      {
        name: 'Task status query',
        sql: `SELECT * FROM tasks WHERE status = 'IN_PROGRESS' LIMIT 10`
      },
      {
        name: 'Task priority query', 
        sql: `SELECT * FROM tasks WHERE priority = 'HIGH' LIMIT 10`
      },
      {
        name: 'Task with project JOIN',
        sql: `SELECT t.*, p.name as project_name 
              FROM tasks t 
              JOIN projects p ON t."projectId" = p.id 
              ORDER BY t."createdAt" DESC 
              LIMIT 10`
      },
      {
        name: 'Complex task query',
        sql: `SELECT t.*, p.name as project_name 
              FROM tasks t 
              JOIN projects p ON t."projectId" = p.id 
              WHERE t.status = 'IN_PROGRESS' 
                AND t.priority = 'HIGH'
              ORDER BY t."createdAt" DESC 
              LIMIT 5`
      },
      {
        name: 'Repository with commit count',
        sql: `SELECT r.*, COUNT(c.id) as commit_count
              FROM repositories r
              LEFT JOIN commits c ON c."repositoryId" = r.id
              GROUP BY r.id
              LIMIT 10`
      }
    ];

    for (const query of queries) {
      try {
        console.log(`  Analyzing: ${query.name}`);
        const result = await this.prisma.$queryRaw`
          EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query.sql}
        ` as any[];

        if (result && result.length > 0) {
          const plan = result[0];
          const explainResult: ExplainResult = {
            query: query.name,
            executionTime: plan['Execution Time'] || 0,
            planningTime: plan['Planning Time'] || 0,
            totalTime: (plan['Execution Time'] || 0) + (plan['Planning Time'] || 0),
            plan: plan.Plan,
            usesIndex: this.checkForIndexUsage(plan.Plan),
            hasSeqScan: this.checkForSequentialScan(plan.Plan)
          };

          this.explainResults.push(explainResult);
        }
      } catch (error) {
        console.error(`  Failed to analyze ${query.name}:`, error);
      }
    }
  }

  /**
   * Check if query plan uses indexes
   */
  private checkForIndexUsage(plan: any): boolean {
    if (!plan) return false;
    
    if (plan['Node Type']?.includes('Index')) {
      return true;
    }
    
    if (plan.Plans && Array.isArray(plan.Plans)) {
      return plan.Plans.some((subPlan: any) => this.checkForIndexUsage(subPlan));
    }
    
    return false;
  }

  /**
   * Check if query plan has sequential scans
   */
  private checkForSequentialScan(plan: any): boolean {
    if (!plan) return false;
    
    if (plan['Node Type'] === 'Seq Scan') {
      return true;
    }
    
    if (plan.Plans && Array.isArray(plan.Plans)) {
      return plan.Plans.some((subPlan: any) => this.checkForSequentialScan(subPlan));
    }
    
    return false;
  }

  /**
   * Record test result
   */
  private recordTestResult(
    testName: string,
    requestCount: number,
    duration: number,
    responseTimes: number[],
    failureCount: number
  ): void {
    if (responseTimes.length === 0) {
      console.error(`❌ ${testName}: No successful requests`);
      return;
    }

    responseTimes.sort((a, b) => a - b);
    
    const result: LoadTestResult = {
      testName,
      totalRequests: requestCount,
      duration,
      averageResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
      percentile95: responseTimes[Math.floor(responseTimes.length * 0.95)],
      percentile99: responseTimes[Math.floor(responseTimes.length * 0.99)],
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      requestsPerSecond: responseTimes.length / (duration / 1000),
      failureCount,
      successRate: ((requestCount - failureCount) / requestCount) * 100
    };

    this.results.push(result);

    // Log immediate results
    const status = result.percentile95 < 100 ? '✅' : '⚠️';
    console.log(`  ${status} ${testName}:`);
    console.log(`    95th percentile: ${result.percentile95.toFixed(2)}ms`);
    console.log(`    Average: ${result.averageResponseTime.toFixed(2)}ms`);
    console.log(`    Success rate: ${result.successRate.toFixed(1)}%\n`);
  }

  /**
   * Generate comprehensive performance report
   */
  private async generateReport(): Promise<void> {
    console.log('📊 Generating Performance Report...\n');

    const reportDir = path.join(process.cwd(), 'performance-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `performance-report-${timestamp}.json`);
    const summaryFile = path.join(reportDir, `performance-summary-${timestamp}.md`);

    // Prepare report data
    const reportData = {
      timestamp: new Date().toISOString(),
      loadTestResults: this.results,
      explainResults: this.explainResults,
      summary: this.generateSummary()
    };

    // Write JSON report
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));

    // Write Markdown summary
    const markdownSummary = this.generateMarkdownSummary(reportData);
    fs.writeFileSync(summaryFile, markdownSummary);

    console.log(`📊 Report saved to: ${reportFile}`);
    console.log(`📋 Summary saved to: ${summaryFile}`);

    // Print console summary
    this.printConsoleSummary();
  }

  /**
   * Generate performance summary
   */
  private generateSummary(): any {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.percentile95 < 100).length;
    const overallSuccessRate = this.results.reduce((sum, r) => sum + r.successRate, 0) / totalTests;
    const avgPercentile95 = this.results.reduce((sum, r) => sum + r.percentile95, 0) / totalTests;

    return {
      totalTests,
      passedTests,
      testPassRate: (passedTests / totalTests) * 100,
      overallSuccessRate,
      averagePercentile95: avgPercentile95,
      meetsPerformanceTarget: passedTests === totalTests,
      explainSummary: {
        totalQueries: this.explainResults.length,
        queriesUsingIndexes: this.explainResults.filter(r => r.usesIndex).length,
        queriesWithSeqScan: this.explainResults.filter(r => r.hasSeqScan).length
      }
    };
  }

  /**
   * Generate Markdown summary
   */
  private generateMarkdownSummary(reportData: any): string {
    const { summary, loadTestResults, explainResults } = reportData;
    
    return `# Database Performance Test Report

Generated: ${new Date(reportData.timestamp).toLocaleString()}

## Executive Summary

- **Performance Target**: <100ms for 95th percentile ✨
- **Tests Passed**: ${summary.passedTests}/${summary.totalTests} (${summary.testPassRate.toFixed(1)}%)
- **Overall Success Rate**: ${summary.overallSuccessRate.toFixed(1)}%
- **Average 95th Percentile**: ${summary.averagePercentile95.toFixed(2)}ms
- **Meets Performance Target**: ${summary.meetsPerformanceTarget ? '✅ YES' : '❌ NO'}

## Load Test Results

| Test Name | 95th Percentile | Average | Success Rate | RPS |
|-----------|----------------|---------|--------------|-----|
${loadTestResults.map((r: LoadTestResult) => 
  `| ${r.testName} | ${r.percentile95.toFixed(2)}ms | ${r.averageResponseTime.toFixed(2)}ms | ${r.successRate.toFixed(1)}% | ${r.requestsPerSecond.toFixed(1)} |`
).join('\n')}

## EXPLAIN Analysis

| Query | Execution Time | Uses Index | Has Seq Scan |
|-------|----------------|------------|--------------|
${explainResults.map((r: ExplainResult) => 
  `| ${r.query} | ${r.executionTime.toFixed(2)}ms | ${r.usesIndex ? '✅' : '❌'} | ${r.hasSeqScan ? '⚠️' : '✅'} |`
).join('\n')}

## Index Usage Summary

- **Queries Using Indexes**: ${summary.explainSummary.queriesUsingIndexes}/${summary.explainSummary.totalQueries}
- **Queries with Sequential Scans**: ${summary.explainSummary.queriesWithSeqScan}/${summary.explainSummary.totalQueries}

## Recommendations

${this.generateRecommendations().map(rec => `- ${rec}`).join('\n')}
`;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Check 95th percentile performance
    const failedTests = this.results.filter(r => r.percentile95 >= 100);
    if (failedTests.length > 0) {
      recommendations.push(`Optimize queries for: ${failedTests.map(t => t.testName).join(', ')}`);
    }

    // Check index usage
    const queriesWithoutIndexes = this.explainResults.filter(r => !r.usesIndex);
    if (queriesWithoutIndexes.length > 0) {
      recommendations.push(`Add indexes for: ${queriesWithoutIndexes.map(q => q.query).join(', ')}`);
    }

    // Check sequential scans
    const queriesWithSeqScan = this.explainResults.filter(r => r.hasSeqScan);
    if (queriesWithSeqScan.length > 0) {
      recommendations.push(`Eliminate sequential scans in: ${queriesWithSeqScan.map(q => q.query).join(', ')}`);
    }

    // Success rate recommendations
    const lowSuccessRateTests = this.results.filter(r => r.successRate < 95);
    if (lowSuccessRateTests.length > 0) {
      recommendations.push(`Investigate failures in: ${lowSuccessRateTests.map(t => t.testName).join(', ')}`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance targets met! Consider further optimizations for edge cases.');
    }

    return recommendations;
  }

  /**
   * Print console summary
   */
  private printConsoleSummary(): void {
    const summary = this.generateSummary();
    
    console.log('\n' + '='.repeat(60));
    console.log('🏆 PERFORMANCE TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Target: <100ms for 95th percentile`);
    console.log(`Status: ${summary.meetsPerformanceTarget ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Tests Passed: ${summary.passedTests}/${summary.totalTests}`);
    console.log(`Average 95th Percentile: ${summary.averagePercentile95.toFixed(2)}ms`);
    console.log(`Overall Success Rate: ${summary.overallSuccessRate.toFixed(1)}%`);
    console.log('='.repeat(60));
    
    // Show failing tests
    const failedTests = this.results.filter(r => r.percentile95 >= 100);
    if (failedTests.length > 0) {
      console.log('\n⚠️  Tests exceeding 100ms:');
      failedTests.forEach(test => {
        console.log(`  - ${test.testName}: ${test.percentile95.toFixed(2)}ms`);
      });
    }
    
    console.log('\n🚀 Performance optimization complete!\n');
  }
}

// Run the load test
if (require.main === module) {
  const tester = new PerformanceLoadTester();
  tester.runLoadTests().catch(console.error);
}

export default PerformanceLoadTester;