/**
 * Code Review Reporting System
 * 
 * Generates comprehensive reports with metrics, trends, and insights
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ReviewResult, ReviewFinding, Severity, ReviewSummary } from './core-engine';
import { OptimizationSuggestion, SuggestionCategory } from './suggestion-engine';

export interface ReportOptions {
  format: 'markdown' | 'json' | 'html' | 'console';
  includeDetails?: boolean;
  includeSuggestions?: boolean;
  includeMetrics?: boolean;
  includeTrends?: boolean;
  outputPath?: string;
}

export interface CodeQualityMetrics {
  overallScore: number;
  categoryScores: Record<string, number>;
  severityDistribution: Record<Severity, number>;
  analyzerDistribution: Record<string, number>;
  fileMetrics: FileMetrics[];
  trends?: QualityTrend[];
}

export interface FileMetrics {
  file: string;
  score: number;
  issueCount: number;
  severityBreakdown: Record<Severity, number>;
  analyzers: string[];
}

export interface QualityTrend {
  date: string;
  score: number;
  issueCount: number;
  filesReviewed: number;
}

export interface ReportHistory {
  reports: HistoricalReport[];
  summary: HistorySummary;
}

export interface HistoricalReport {
  id: string;
  timestamp: string;
  filesReviewed: number;
  totalFindings: number;
  overallScore: number;
  summary: ReviewSummary;
}

export interface HistorySummary {
  totalReports: number;
  averageScore: number;
  averageIssues: number;
  commonIssues: CommonIssue[];
  improvementRate: number;
}

export interface CommonIssue {
  rule: string;
  analyzer: string;
  frequency: number;
  severity: Severity;
  lastSeen: string;
}

export class ReportingSystem {
  private historyFile = '.claude/review-history.json';
  private cacheDir = '.claude/review-cache';
  private maxHistoryEntries = 100;

  /**
   * Generate comprehensive report
   */
  async generateReport(
    result: ReviewResult,
    suggestions: OptimizationSuggestion[] = [],
    options: ReportOptions
  ): Promise<string> {
    // Calculate metrics
    const metrics = this.calculateMetrics(result);
    
    // Load history for trends
    const history = await this.loadHistory();
    
    // Add current report to history
    await this.addToHistory(result, metrics.overallScore);
    
    // Generate trends if requested
    if (options.includeTrends) {
      metrics.trends = this.calculateTrends(history);
    }

    // Generate report in requested format
    let report: string;
    switch (options.format) {
      case 'markdown':
        report = this.generateMarkdownReport(result, metrics, suggestions, options);
        break;
      case 'json':
        report = this.generateJSONReport(result, metrics, suggestions, options);
        break;
      case 'html':
        report = this.generateHTMLReport(result, metrics, suggestions, options);
        break;
      case 'console':
      default:
        report = this.generateConsoleReport(result, metrics, suggestions, options);
    }

    // Save to file if requested
    if (options.outputPath) {
      await this.saveReport(report, options.outputPath);
    }

    return report;
  }

  /**
   * Calculate code quality metrics
   */
  private calculateMetrics(result: ReviewResult): CodeQualityMetrics {
    // Calculate overall score (100 - penalty points)
    let score = 100;
    const penalties = {
      [Severity.ERROR]: 10,
      [Severity.WARNING]: 5,
      [Severity.INFO]: 2,
      [Severity.SUGGESTION]: 1
    };

    for (const finding of result.findings) {
      score -= penalties[finding.severity] || 0;
    }
    score = Math.max(0, score);

    // Calculate category scores
    const categoryScores: Record<string, number> = {};
    const analyzerGroups = this.groupByAnalyzer(result.findings);
    
    for (const [analyzer, findings] of Object.entries(analyzerGroups)) {
      let analyzerScore = 100;
      for (const finding of findings) {
        analyzerScore -= penalties[finding.severity] || 0;
      }
      categoryScores[analyzer] = Math.max(0, analyzerScore);
    }

    // Calculate file metrics
    const fileMetrics = this.calculateFileMetrics(result.findings);

    return {
      overallScore: score,
      categoryScores,
      severityDistribution: result.summary.bySeverity,
      analyzerDistribution: result.summary.byAnalyzer,
      fileMetrics
    };
  }

  /**
   * Group findings by analyzer
   */
  private groupByAnalyzer(findings: ReviewFinding[]): Record<string, ReviewFinding[]> {
    const groups: Record<string, ReviewFinding[]> = {};
    
    for (const finding of findings) {
      const list = groups[finding.analyzer] || [];
      list.push(finding);
      groups[finding.analyzer] = list;
    }
    
    return groups;
  }

  /**
   * Calculate per-file metrics
   */
  private calculateFileMetrics(findings: ReviewFinding[]): FileMetrics[] {
    const fileMap = new Map<string, ReviewFinding[]>();
    
    // Group by file
    for (const finding of findings) {
      const list = fileMap.get(finding.file) || [];
      list.push(finding);
      fileMap.set(finding.file, list);
    }

    // Calculate metrics for each file
    const metrics: FileMetrics[] = [];
    for (const [file, fileFindings] of fileMap) {
      const severityBreakdown: Record<Severity, number> = {
        [Severity.ERROR]: 0,
        [Severity.WARNING]: 0,
        [Severity.INFO]: 0,
        [Severity.SUGGESTION]: 0
      };

      const analyzers = new Set<string>();
      let fileScore = 100;
      const penalties = { error: 10, warning: 5, info: 2, suggestion: 1 };

      for (const finding of fileFindings) {
        severityBreakdown[finding.severity]++;
        analyzers.add(finding.analyzer);
        fileScore -= penalties[finding.severity] || 0;
      }

      metrics.push({
        file,
        score: Math.max(0, fileScore),
        issueCount: fileFindings.length,
        severityBreakdown,
        analyzers: Array.from(analyzers)
      });
    }

    // Sort by score (lowest first)
    metrics.sort((a, b) => a.score - b.score);

    return metrics;
  }

  /**
   * Generate Markdown report
   */
  private generateMarkdownReport(
    result: ReviewResult,
    metrics: CodeQualityMetrics,
    suggestions: OptimizationSuggestion[],
    options: ReportOptions
  ): string {
    const lines: string[] = [];
    
    // Header
    lines.push('# Code Review Report');
    lines.push(`\nGenerated: ${new Date().toLocaleString()}`);
    lines.push(`Files reviewed: ${result.summary.filesReviewed}`);
    lines.push(`Total findings: ${result.summary.totalFindings}`);
    lines.push(`Overall score: **${metrics.overallScore}/100**\n`);

    // Executive Summary
    lines.push('## Executive Summary\n');
    if (metrics.overallScore >= 90) {
      lines.push('✅ **Excellent code quality!** The codebase meets high standards with minimal issues.\n');
    } else if (metrics.overallScore >= 70) {
      lines.push('🟡 **Good code quality** with some areas for improvement.\n');
    } else if (metrics.overallScore >= 50) {
      lines.push('🟠 **Fair code quality** - significant improvements recommended.\n');
    } else {
      lines.push('🔴 **Poor code quality** - immediate attention required.\n');
    }

    // Severity Distribution
    lines.push('## Findings by Severity\n');
    lines.push('| Severity | Count | Impact |');
    lines.push('|----------|-------|--------|');
    lines.push(`| ❌ Errors | ${result.summary.bySeverity.error || 0} | Critical issues that must be fixed |`);
    lines.push(`| ⚠️ Warnings | ${result.summary.bySeverity.warning || 0} | Important issues that should be addressed |`);
    lines.push(`| ℹ️ Info | ${result.summary.bySeverity.info || 0} | Minor issues or best practice violations |`);
    lines.push(`| 💡 Suggestions | ${result.summary.bySeverity.suggestion || 0} | Recommendations for improvement |`);

    // Category Scores
    if (options.includeMetrics) {
      lines.push('\n## Category Scores\n');
      lines.push('| Analyzer | Score | Issues |');
      lines.push('|----------|-------|--------|');
      for (const [analyzer, score] of Object.entries(metrics.categoryScores)) {
        const count = result.summary.byAnalyzer[analyzer] || 0;
        lines.push(`| ${analyzer} | ${score}/100 | ${count} |`);
      }
    }

    // Top Issues by File
    lines.push('\n## Files with Most Issues\n');
    const topFiles = metrics.fileMetrics.slice(0, 10);
    for (const file of topFiles) {
      lines.push(`### ${file.file} (Score: ${file.score}/100)\n`);
      lines.push(`- Total issues: ${file.issueCount}`);
      lines.push(`- Errors: ${file.severityBreakdown.error}, Warnings: ${file.severityBreakdown.warning}`);
      lines.push(`- Analyzed by: ${file.analyzers.join(', ')}\n`);
    }

    // Detailed Findings
    if (options.includeDetails) {
      lines.push('## Detailed Findings\n');
      
      // Group by severity
      const bySeverity = this.groupBySeverity(result.findings);
      
      for (const [severity, findings] of Object.entries(bySeverity)) {
        if (findings.length === 0) continue;
        
        lines.push(`### ${this.formatSeverity(severity as Severity)}\n`);
        
        for (const finding of findings.slice(0, 20)) { // Limit to 20 per severity
          lines.push(`**${finding.file}:${finding.line || 0}** - ${finding.message}`);
          if (finding.rule) {
            lines.push(`  Rule: \`${finding.rule}\` | Analyzer: ${finding.analyzer}`);
          }
          lines.push('');
        }
        
        if (findings.length > 20) {
          lines.push(`... and ${findings.length - 20} more ${severity} issues\n`);
        }
      }
    }

    // Suggestions
    if (options.includeSuggestions && suggestions.length > 0) {
      lines.push('## Optimization Suggestions\n');
      
      const byCategory = this.groupSuggestionsByCategory(suggestions);
      for (const [category, categorySuggestions] of Object.entries(byCategory)) {
        lines.push(`### ${this.formatSuggestionCategory(category as SuggestionCategory)}\n`);
        
        for (const suggestion of categorySuggestions.slice(0, 5)) {
          lines.push(`**${suggestion.finding.file}** - ${suggestion.suggestion}`);
          lines.push(`  Impact: ${suggestion.impact} | Effort: ${suggestion.effort}\n`);
        }
      }
    }

    // Trends
    if (options.includeTrends && metrics.trends && metrics.trends.length > 0) {
      lines.push('## Quality Trends\n');
      lines.push('| Date | Score | Issues | Files |');
      lines.push('|------|-------|--------|-------|');
      
      for (const trend of metrics.trends.slice(-10)) {
        lines.push(`| ${new Date(trend.date).toLocaleDateString()} | ${trend.score} | ${trend.issueCount} | ${trend.filesReviewed} |`);
      }
      
      const improvement = this.calculateImprovement(metrics.trends);
      if (improvement > 0) {
        lines.push(`\n📈 Code quality has improved by ${improvement.toFixed(1)}% over the last ${metrics.trends.length} reviews.`);
      } else if (improvement < 0) {
        lines.push(`\n📉 Code quality has declined by ${Math.abs(improvement).toFixed(1)}% over the last ${metrics.trends.length} reviews.`);
      }
    }

    // Recommendations
    lines.push('\n## Recommendations\n');
    lines.push(this.generateRecommendations(result, metrics));

    return lines.join('\n');
  }

  /**
   * Generate JSON report
   */
  private generateJSONReport(
    result: ReviewResult,
    metrics: CodeQualityMetrics,
    suggestions: OptimizationSuggestion[],
    options: ReportOptions
  ): string {
    const report = {
      metadata: {
        generated: new Date().toISOString(),
        version: '1.0.0',
        options
      },
      summary: {
        filesReviewed: result.summary.filesReviewed,
        totalFindings: result.summary.totalFindings,
        overallScore: metrics.overallScore,
        timeElapsed: result.summary.timeElapsed
      },
      metrics,
      findings: options.includeDetails ? result.findings : undefined,
      suggestions: options.includeSuggestions ? suggestions : undefined,
      trends: options.includeTrends ? metrics.trends : undefined
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * Generate HTML report
   */
  private generateHTMLReport(
    result: ReviewResult,
    metrics: CodeQualityMetrics,
    suggestions: OptimizationSuggestion[],
    options: ReportOptions
  ): string {
    const scoreColor = metrics.overallScore >= 90 ? '#4CAF50' : 
                      metrics.overallScore >= 70 ? '#FFC107' :
                      metrics.overallScore >= 50 ? '#FF9800' : '#F44336';

    return `<!DOCTYPE html>
<html>
<head>
  <title>Code Review Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1, h2, h3 { color: #333; }
    .score { font-size: 48px; font-weight: bold; color: ${scoreColor}; }
    .metric-card { display: inline-block; background: #f8f9fa; padding: 20px; margin: 10px; border-radius: 8px; text-align: center; }
    .severity-error { color: #F44336; }
    .severity-warning { color: #FF9800; }
    .severity-info { color: #2196F3; }
    .severity-suggestion { color: #4CAF50; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f8f9fa; font-weight: 600; }
    .finding { margin: 10px 0; padding: 10px; background: #f8f9fa; border-left: 4px solid #ddd; }
    .finding.error { border-color: #F44336; }
    .finding.warning { border-color: #FF9800; }
    .finding.info { border-color: #2196F3; }
    .finding.suggestion { border-color: #4CAF50; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Code Review Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    
    <div class="metric-card">
      <div class="score">${metrics.overallScore}/100</div>
      <div>Overall Score</div>
    </div>
    
    <div class="metric-card">
      <div style="font-size: 24px; font-weight: bold;">${result.summary.totalFindings}</div>
      <div>Total Issues</div>
    </div>
    
    <div class="metric-card">
      <div style="font-size: 24px; font-weight: bold;">${result.summary.filesReviewed}</div>
      <div>Files Reviewed</div>
    </div>

    <h2>Findings by Severity</h2>
    <table>
      <tr>
        <th>Severity</th>
        <th>Count</th>
        <th>Description</th>
      </tr>
      <tr>
        <td class="severity-error">❌ Errors</td>
        <td>${result.summary.bySeverity.error || 0}</td>
        <td>Critical issues that must be fixed</td>
      </tr>
      <tr>
        <td class="severity-warning">⚠️ Warnings</td>
        <td>${result.summary.bySeverity.warning || 0}</td>
        <td>Important issues that should be addressed</td>
      </tr>
      <tr>
        <td class="severity-info">ℹ️ Info</td>
        <td>${result.summary.bySeverity.info || 0}</td>
        <td>Minor issues or best practice violations</td>
      </tr>
      <tr>
        <td class="severity-suggestion">💡 Suggestions</td>
        <td>${result.summary.bySeverity.suggestion || 0}</td>
        <td>Recommendations for improvement</td>
      </tr>
    </table>

    ${options.includeDetails ? this.generateHTMLFindings(result.findings) : ''}
  </div>
</body>
</html>`;
  }

  /**
   * Generate HTML findings section
   */
  private generateHTMLFindings(findings: ReviewFinding[]): string {
    const html: string[] = ['<h2>Detailed Findings</h2>'];
    
    const bySeverity = this.groupBySeverity(findings);
    
    for (const [severity, severityFindings] of Object.entries(bySeverity)) {
      if (severityFindings.length === 0) continue;
      
      html.push(`<h3>${this.formatSeverity(severity as Severity)}</h3>`);
      
      for (const finding of severityFindings.slice(0, 10)) {
        html.push(`
          <div class="finding ${severity}">
            <strong>${finding.file}:${finding.line || 0}</strong> - ${finding.message}<br>
            <small>Rule: ${finding.rule || 'N/A'} | Analyzer: ${finding.analyzer}</small>
          </div>
        `);
      }
    }
    
    return html.join('\n');
  }

  /**
   * Generate console report
   */
  private generateConsoleReport(
    result: ReviewResult,
    metrics: CodeQualityMetrics,
    suggestions: OptimizationSuggestion[],
    options: ReportOptions
  ): string {
    const lines: string[] = [];
    
    // Use ANSI colors for console output
    const colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m'
    };

    lines.push(`\n${colors.bright}═══ Code Review Report ═══${colors.reset}\n`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Files reviewed: ${result.summary.filesReviewed}`);
    lines.push(`Total findings: ${result.summary.totalFindings}`);
    
    const scoreColor = metrics.overallScore >= 90 ? colors.green : 
                      metrics.overallScore >= 70 ? colors.yellow : colors.red;
    lines.push(`Overall score: ${scoreColor}${metrics.overallScore}/100${colors.reset}\n`);

    // Summary table
    lines.push(`${colors.bright}Severity Distribution:${colors.reset}`);
    lines.push(`  ${colors.red}❌ Errors:${colors.reset}      ${result.summary.bySeverity.error || 0}`);
    lines.push(`  ${colors.yellow}⚠️  Warnings:${colors.reset}   ${result.summary.bySeverity.warning || 0}`);
    lines.push(`  ${colors.blue}ℹ️  Info:${colors.reset}       ${result.summary.bySeverity.info || 0}`);
    lines.push(`  ${colors.green}💡 Suggestions:${colors.reset} ${result.summary.bySeverity.suggestion || 0}\n`);

    // Top issues
    if (metrics.fileMetrics.length > 0) {
      lines.push(`${colors.bright}Files with Most Issues:${colors.reset}`);
      for (const file of metrics.fileMetrics.slice(0, 5)) {
        lines.push(`  ${file.file} (${file.issueCount} issues, score: ${file.score}/100)`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate recommendations based on findings
   */
  private generateRecommendations(result: ReviewResult, metrics: CodeQualityMetrics): string {
    const recommendations: string[] = [];

    // High-level recommendations based on score
    if (metrics.overallScore < 50) {
      recommendations.push('1. **Immediate Action Required**: Address all error-level issues before deployment.');
      recommendations.push('2. **Code Review Process**: Implement stricter code review policies.');
      recommendations.push('3. **Developer Training**: Consider team training on identified problem areas.');
    } else if (metrics.overallScore < 70) {
      recommendations.push('1. **Priority Focus**: Address warnings and errors in critical code paths first.');
      recommendations.push('2. **Gradual Improvement**: Set up automated checks to prevent new issues.');
    } else if (metrics.overallScore < 90) {
      recommendations.push('1. **Continuous Improvement**: Address remaining warnings to achieve excellence.');
      recommendations.push('2. **Best Practices**: Document and share solutions to common issues.');
    } else {
      recommendations.push('1. **Maintain Standards**: Keep up the excellent work!');
      recommendations.push('2. **Knowledge Sharing**: Share your practices with other teams.');
    }

    // Specific recommendations based on findings
    const analyzerIssues = Object.entries(result.summary.byAnalyzer)
      .sort(([, a], [, b]) => b - a);

    if (analyzerIssues.length > 0) {
      const [topAnalyzer, count] = analyzerIssues[0];
      recommendations.push(`\n**Focus Area**: ${topAnalyzer} (${count} issues) - Prioritize fixing ${topAnalyzer} violations.`);
    }

    return recommendations.join('\n');
  }

  /**
   * Save report to file
   */
  private async saveReport(report: string, outputPath: string): Promise<void> {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, report, 'utf-8');
  }

  /**
   * Load review history
   */
  private async loadHistory(): Promise<ReportHistory> {
    try {
      const data = await fs.readFile(this.historyFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return { reports: [], summary: this.createEmptyHistorySummary() };
    }
  }

  /**
   * Add report to history
   */
  private async addToHistory(result: ReviewResult, score: number): Promise<void> {
    const history = await this.loadHistory();
    
    const report: HistoricalReport = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      filesReviewed: result.summary.filesReviewed,
      totalFindings: result.summary.totalFindings,
      overallScore: score,
      summary: result.summary
    };

    history.reports.push(report);
    
    // Limit history size
    if (history.reports.length > this.maxHistoryEntries) {
      history.reports = history.reports.slice(-this.maxHistoryEntries);
    }

    // Update summary
    history.summary = this.updateHistorySummary(history.reports);

    await fs.mkdir(path.dirname(this.historyFile), { recursive: true });
    await fs.writeFile(this.historyFile, JSON.stringify(history, null, 2));
  }

  /**
   * Calculate trends from history
   */
  private calculateTrends(history: ReportHistory): QualityTrend[] {
    return history.reports.map(report => ({
      date: report.timestamp,
      score: report.overallScore,
      issueCount: report.totalFindings,
      filesReviewed: report.filesReviewed
    }));
  }

  /**
   * Calculate improvement rate
   */
  private calculateImprovement(trends: QualityTrend[]): number {
    if (trends.length < 2) return 0;
    
    const first = trends[0];
    const last = trends[trends.length - 1];
    
    return ((last.score - first.score) / first.score) * 100;
  }

  /**
   * Group findings by severity
   */
  private groupBySeverity(findings: ReviewFinding[]): Record<Severity, ReviewFinding[]> {
    const groups: Record<Severity, ReviewFinding[]> = {
      [Severity.ERROR]: [],
      [Severity.WARNING]: [],
      [Severity.INFO]: [],
      [Severity.SUGGESTION]: []
    };

    for (const finding of findings) {
      groups[finding.severity].push(finding);
    }

    return groups;
  }

  /**
   * Group suggestions by category
   */
  private groupSuggestionsByCategory(suggestions: OptimizationSuggestion[]): Record<SuggestionCategory, OptimizationSuggestion[]> {
    const groups: Record<string, OptimizationSuggestion[]> = {};
    
    for (const suggestion of suggestions) {
      const list = groups[suggestion.category] || [];
      list.push(suggestion);
      groups[suggestion.category] = list;
    }
    
    return groups as Record<SuggestionCategory, OptimizationSuggestion[]>;
  }

  /**
   * Format severity for display
   */
  private formatSeverity(severity: Severity): string {
    const labels = {
      [Severity.ERROR]: '❌ Errors',
      [Severity.WARNING]: '⚠️ Warnings',
      [Severity.INFO]: 'ℹ️ Information',
      [Severity.SUGGESTION]: '💡 Suggestions'
    };
    return labels[severity] || severity;
  }

  /**
   * Format suggestion category
   */
  private formatSuggestionCategory(category: SuggestionCategory): string {
    const labels = {
      [SuggestionCategory.PERFORMANCE]: 'Performance Optimizations',
      [SuggestionCategory.SECURITY]: 'Security Improvements',
      [SuggestionCategory.MAINTAINABILITY]: 'Maintainability Enhancements',
      [SuggestionCategory.ARCHITECTURE]: 'Architecture Refinements',
      [SuggestionCategory.BEST_PRACTICES]: 'Best Practice Recommendations'
    };
    return labels[category] || category;
  }

  /**
   * Create empty history summary
   */
  private createEmptyHistorySummary(): HistorySummary {
    return {
      totalReports: 0,
      averageScore: 0,
      averageIssues: 0,
      commonIssues: [],
      improvementRate: 0
    };
  }

  /**
   * Update history summary
   */
  private updateHistorySummary(reports: HistoricalReport[]): HistorySummary {
    if (reports.length === 0) {
      return this.createEmptyHistorySummary();
    }

    const totalScore = reports.reduce((sum, r) => sum + r.overallScore, 0);
    const totalIssues = reports.reduce((sum, r) => sum + r.totalFindings, 0);
    
    // Track common issues
    const issueFrequency = new Map<string, CommonIssue>();
    
    for (const report of reports) {
      // This is simplified - in reality, we'd track individual issues
      for (const [analyzer, count] of Object.entries(report.summary.byAnalyzer)) {
        const key = `${analyzer}:general`;
        const existing = issueFrequency.get(key) || {
          rule: 'general',
          analyzer,
          frequency: 0,
          severity: Severity.INFO,
          lastSeen: report.timestamp
        };
        existing.frequency += count;
        existing.lastSeen = report.timestamp;
        issueFrequency.set(key, existing);
      }
    }

    const commonIssues = Array.from(issueFrequency.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    const improvementRate = this.calculateImprovement(
      reports.map(r => ({
        date: r.timestamp,
        score: r.overallScore,
        issueCount: r.totalFindings,
        filesReviewed: r.filesReviewed
      }))
    );

    return {
      totalReports: reports.length,
      averageScore: totalScore / reports.length,
      averageIssues: totalIssues / reports.length,
      commonIssues,
      improvementRate
    };
  }
}

// Export singleton instance
export const reportingSystem = new ReportingSystem();