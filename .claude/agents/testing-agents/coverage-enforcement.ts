/**
 * Coverage Enforcement System
 * 
 * Enforces code coverage thresholds and provides reporting
 * with trend tracking and alerts
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CoverageThresholds {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface CoverageReport {
  summary: CoverageSummary;
  files: FileCoverage[];
  timestamp: string;
  passed: boolean;
  violations: CoverageViolation[];
}

export interface CoverageSummary {
  statements: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  lines: CoverageMetric;
}

export interface CoverageMetric {
  total: number;
  covered: number;
  skipped: number;
  percentage: number;
}

export interface FileCoverage {
  path: string;
  statements: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  lines: CoverageMetric;
}

export interface CoverageViolation {
  type: 'file' | 'summary';
  path?: string;
  metric: keyof CoverageThresholds;
  threshold: number;
  actual: number;
  difference: number;
}

export interface CoverageTrend {
  date: string;
  summary: CoverageSummary;
  passed: boolean;
}

export interface CoverageEnforcementOptions {
  thresholds: CoverageThresholds;
  reportDir?: string;
  historyFile?: string;
  maxHistoryEntries?: number;
  failOnViolation?: boolean;
  includePatterns?: string[];
  excludePatterns?: string[];
}

export class CoverageEnforcement {
  private history: CoverageTrend[] = [];
  private options: Required<CoverageEnforcementOptions>;

  constructor(options: CoverageEnforcementOptions) {
    this.options = {
      reportDir: 'coverage',
      historyFile: '.coverage-history.json',
      maxHistoryEntries: 100,
      failOnViolation: true,
      includePatterns: ['src/**/*.{ts,tsx,js,jsx}'],
      excludePatterns: ['**/*.test.*', '**/*.spec.*', '**/node_modules/**'],
      ...options,
    };

    this.loadHistory();
  }

  /**
   * Check coverage for a project
   */
  async checkCoverage(projectPath: string): Promise<CoverageReport> {
    // Run coverage command
    const coverageData = await this.runCoverageCommand(projectPath);
    
    // Parse coverage data
    const report = this.parseCoverageData(coverageData);
    
    // Check thresholds
    const violations = this.checkThresholds(report);
    report.violations = violations;
    report.passed = violations.length === 0;
    
    // Update history
    await this.updateHistory(report);
    
    // Generate report
    await this.generateReport(report, projectPath);
    
    return report;
  }

  /**
   * Run coverage command
   */
  private async runCoverageCommand(projectPath: string): Promise<any> {
    const isBackend = projectPath.includes('backend');
    const command = isBackend
      ? 'pnpm run test:coverage -- --json --outputFile=coverage/coverage.json'
      : 'pnpm run test:coverage -- --reporter=json';

    try {
      await execAsync(command, { cwd: projectPath });
      
      // Read coverage file
      const coverageFile = path.join(projectPath, 'coverage', 'coverage-final.json');
      const data = await fs.readFile(coverageFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to run coverage: ${error}`);
    }
  }

  /**
   * Parse coverage data
   */
  private parseCoverageData(data: any): CoverageReport {
    const files: FileCoverage[] = [];
    const summary: CoverageSummary = {
      statements: { total: 0, covered: 0, skipped: 0, percentage: 0 },
      branches: { total: 0, covered: 0, skipped: 0, percentage: 0 },
      functions: { total: 0, covered: 0, skipped: 0, percentage: 0 },
      lines: { total: 0, covered: 0, skipped: 0, percentage: 0 },
    };

    // Process each file
    for (const [filePath, fileData] of Object.entries(data)) {
      if (!this.shouldIncludeFile(filePath)) continue;

      const fileCoverage = this.parseFileCoverage(filePath, fileData as any);
      files.push(fileCoverage);

      // Update summary
      this.updateSummary(summary, fileCoverage);
    }

    // Calculate percentages
    this.calculatePercentages(summary);

    return {
      summary,
      files,
      timestamp: new Date().toISOString(),
      passed: true,
      violations: [],
    };
  }

  /**
   * Check if file should be included
   */
  private shouldIncludeFile(filePath: string): boolean {
    // Check exclude patterns
    for (const pattern of this.options.excludePatterns) {
      if (this.matchesPattern(filePath, pattern)) {
        return false;
      }
    }

    // Check include patterns
    for (const pattern of this.options.includePatterns) {
      if (this.matchesPattern(filePath, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Match file against pattern
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    // Simple glob matching
    const regex = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.')
      .replace(/\{([^}]+)\}/g, (_, group) => `(${group.split(',').join('|')})`);
    
    return new RegExp(regex).test(filePath);
  }

  /**
   * Parse file coverage
   */
  private parseFileCoverage(filePath: string, data: any): FileCoverage {
    return {
      path: filePath,
      statements: this.parseMetric(data.s, data.statementMap),
      branches: this.parseMetric(data.b, data.branchMap),
      functions: this.parseMetric(data.f, data.fnMap),
      lines: this.parseMetric(data.s, data.statementMap), // Lines same as statements
    };
  }

  /**
   * Parse coverage metric
   */
  private parseMetric(hits: any, map: any): CoverageMetric {
    const keys = Object.keys(map || hits || {});
    const total = keys.length;
    
    let covered = 0;
    if (Array.isArray(hits)) {
      // Branch coverage
      covered = hits.flat().filter(h => h > 0).length;
    } else {
      // Statement/function coverage
      covered = keys.filter(k => hits[k] > 0).length;
    }

    return {
      total,
      covered,
      skipped: 0,
      percentage: total > 0 ? (covered / total) * 100 : 100,
    };
  }

  /**
   * Update summary with file coverage
   */
  private updateSummary(summary: CoverageSummary, file: FileCoverage): void {
    summary.statements.total += file.statements.total;
    summary.statements.covered += file.statements.covered;
    
    summary.branches.total += file.branches.total;
    summary.branches.covered += file.branches.covered;
    
    summary.functions.total += file.functions.total;
    summary.functions.covered += file.functions.covered;
    
    summary.lines.total += file.lines.total;
    summary.lines.covered += file.lines.covered;
  }

  /**
   * Calculate percentages for summary
   */
  private calculatePercentages(summary: CoverageSummary): void {
    for (const metric of Object.values(summary)) {
      metric.percentage = metric.total > 0
        ? (metric.covered / metric.total) * 100
        : 100;
    }
  }

  /**
   * Check thresholds
   */
  private checkThresholds(report: CoverageReport): CoverageViolation[] {
    const violations: CoverageViolation[] = [];

    // Check summary thresholds
    for (const [metric, threshold] of Object.entries(this.options.thresholds)) {
      const actual = report.summary[metric as keyof CoverageSummary].percentage;
      if (actual < threshold) {
        violations.push({
          type: 'summary',
          metric: metric as keyof CoverageThresholds,
          threshold,
          actual,
          difference: threshold - actual,
        });
      }
    }

    // Check file thresholds
    for (const file of report.files) {
      for (const [metric, threshold] of Object.entries(this.options.thresholds)) {
        const actual = file[metric as keyof FileCoverage].percentage;
        if (actual < threshold) {
          violations.push({
            type: 'file',
            path: file.path,
            metric: metric as keyof CoverageThresholds,
            threshold,
            actual,
            difference: threshold - actual,
          });
        }
      }
    }

    return violations;
  }

  /**
   * Update history
   */
  private async updateHistory(report: CoverageReport): Promise<void> {
    this.history.push({
      date: report.timestamp,
      summary: report.summary,
      passed: report.passed,
    });

    // Limit history size
    if (this.history.length > this.options.maxHistoryEntries) {
      this.history = this.history.slice(-this.options.maxHistoryEntries);
    }

    await this.saveHistory();
  }

  /**
   * Load history
   */
  private async loadHistory(): Promise<void> {
    try {
      const data = await fs.readFile(this.options.historyFile, 'utf-8');
      this.history = JSON.parse(data);
    } catch {
      // History file doesn't exist
      this.history = [];
    }
  }

  /**
   * Save history
   */
  private async saveHistory(): Promise<void> {
    await fs.writeFile(
      this.options.historyFile,
      JSON.stringify(this.history, null, 2)
    );
  }

  /**
   * Generate report
   */
  private async generateReport(
    report: CoverageReport,
    projectPath: string
  ): Promise<void> {
    const reportPath = path.join(projectPath, this.options.reportDir, 'coverage-report.md');
    
    const content = this.formatReport(report);
    
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, content);
  }

  /**
   * Format report as markdown
   */
  private formatReport(report: CoverageReport): string {
    let content = `# Coverage Report

Generated: ${new Date(report.timestamp).toLocaleString()}
Status: ${report.passed ? '✅ PASSED' : '❌ FAILED'}

## Summary

| Metric | Coverage | Threshold | Status |
|--------|----------|-----------|---------|
| Statements | ${report.summary.statements.percentage.toFixed(2)}% | ${this.options.thresholds.statements}% | ${report.summary.statements.percentage >= this.options.thresholds.statements ? '✅' : '❌'} |
| Branches | ${report.summary.branches.percentage.toFixed(2)}% | ${this.options.thresholds.branches}% | ${report.summary.branches.percentage >= this.options.thresholds.branches ? '✅' : '❌'} |
| Functions | ${report.summary.functions.percentage.toFixed(2)}% | ${this.options.thresholds.functions}% | ${report.summary.functions.percentage >= this.options.thresholds.functions ? '✅' : '❌'} |
| Lines | ${report.summary.lines.percentage.toFixed(2)}% | ${this.options.thresholds.lines}% | ${report.summary.lines.percentage >= this.options.thresholds.lines ? '✅' : '❌'} |
`;

    if (report.violations.length > 0) {
      content += `
## Violations

`;
      for (const violation of report.violations) {
        if (violation.type === 'file') {
          content += `- **${violation.path}**: ${violation.metric} coverage ${violation.actual.toFixed(2)}% (required: ${violation.threshold}%)\n`;
        } else {
          content += `- **Overall ${violation.metric}**: ${violation.actual.toFixed(2)}% (required: ${violation.threshold}%)\n`;
        }
      }
    }

    // Add trend if we have history
    if (this.history.length > 1) {
      content += `
## Coverage Trend

`;
      const recent = this.history.slice(-10);
      for (const entry of recent) {
        content += `- ${new Date(entry.date).toLocaleDateString()}: ${entry.summary.lines.percentage.toFixed(2)}% ${entry.passed ? '✅' : '❌'}\n`;
      }
    }

    return content;
  }

  /**
   * Get coverage trend
   */
  getTrend(metric: keyof CoverageSummary = 'lines', days: number = 30): CoverageTrend[] {
    const since = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.history.filter(entry => 
      new Date(entry.date).getTime() >= since
    );
  }

  /**
   * Check if coverage is improving
   */
  isImproving(metric: keyof CoverageSummary = 'lines'): boolean {
    if (this.history.length < 2) return true;

    const recent = this.history.slice(-10);
    const values = recent.map(entry => entry.summary[metric].percentage);
    
    // Simple linear regression
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < values.length; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }
    
    const n = values.length;
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    return slope > 0;
  }

  /**
   * Get average coverage
   */
  getAverageCoverage(metric: keyof CoverageSummary = 'lines', days: number = 30): number {
    const trend = this.getTrend(metric, days);
    if (trend.length === 0) return 0;

    const sum = trend.reduce((acc, entry) => 
      acc + entry.summary[metric].percentage, 0
    );
    
    return sum / trend.length;
  }

  /**
   * Create pre-commit hook
   */
  async createPreCommitHook(projectPath: string): Promise<string> {
    const hookContent = `#!/bin/sh
# Coverage enforcement pre-commit hook

echo "🔍 Checking code coverage..."

# Run coverage check
pnpm run test:coverage

# Check if coverage meets thresholds
node -e "
const { CoverageEnforcement } = require('.claude/agents/testing-agents/coverage-enforcement');

const enforcer = new CoverageEnforcement({
  thresholds: {
    statements: ${this.options.thresholds.statements},
    branches: ${this.options.thresholds.branches},
    functions: ${this.options.thresholds.functions},
    lines: ${this.options.thresholds.lines}
  }
});

enforcer.checkCoverage('.')
  .then(report => {
    if (!report.passed) {
      console.error('❌ Coverage thresholds not met!');
      console.error('Run \\"pnpm run test:coverage\\" to see details');
      process.exit(1);
    }
    console.log('✅ Coverage thresholds met');
  })
  .catch(error => {
    console.error('Error checking coverage:', error);
    process.exit(1);
  });
"
`;

    const hookPath = path.join(projectPath, '.git', 'hooks', 'pre-commit');
    await fs.writeFile(hookPath, hookContent, { mode: 0o755 });
    
    return hookPath;
  }

  /**
   * Generate CI/CD configuration
   */
  generateCIConfig(): string {
    return `
# Coverage check job
coverage:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: pnpm/action-setup@v2
    - uses: actions/setup-node@v3
      with:
        node-version: 18
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Run tests with coverage
      run: pnpm run test:coverage
    
    - name: Check coverage thresholds
      run: |
        node -e "
        const { CoverageEnforcement } = require('.claude/agents/testing-agents/coverage-enforcement');
        const enforcer = new CoverageEnforcement({
          thresholds: {
            statements: ${this.options.thresholds.statements},
            branches: ${this.options.thresholds.branches},
            functions: ${this.options.thresholds.functions},
            lines: ${this.options.thresholds.lines}
          }
        });
        
        enforcer.checkCoverage('.')
          .then(report => {
            if (!report.passed) {
              console.error('Coverage thresholds not met!');
              process.exit(1);
            }
          });
        "
    
    - name: Upload coverage reports
      uses: actions/upload-artifact@v3
      with:
        name: coverage-report
        path: coverage/
`;
  }
}

// Export with default thresholds
export const coverageEnforcement = new CoverageEnforcement({
  thresholds: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80,
  },
});