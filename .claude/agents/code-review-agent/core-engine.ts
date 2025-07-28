/**
 * Core Code Review Engine
 * 
 * Central engine for automated code quality and security validation
 * with pluggable analyzer architecture
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

export interface CodeReviewOptions {
  targetPaths: string[];
  analyzers?: string[];
  severityThreshold?: Severity;
  ignorePatterns?: string[];
  fixMode?: boolean;
  configPath?: string;
}

export enum Severity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  SUGGESTION = 'suggestion'
}

export interface ReviewFinding {
  analyzer: string;
  severity: Severity;
  file: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  message: string;
  rule?: string;
  fix?: CodeFix;
  documentation?: string;
}

export interface CodeFix {
  description: string;
  changes: FileChange[];
}

export interface FileChange {
  file: string;
  edits: Edit[];
}

export interface Edit {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  newText: string;
}

export interface ReviewResult {
  success: boolean;
  findings: ReviewFinding[];
  summary: ReviewSummary;
  fixesApplied?: number;
  errors?: string[];
}

export interface ReviewSummary {
  totalFindings: number;
  byAnalyzer: Record<string, number>;
  bySeverity: Record<Severity, number>;
  filesReviewed: number;
  timeElapsed: number;
}

export interface Analyzer {
  name: string;
  description: string;
  analyze(files: string[], options: AnalyzerOptions): Promise<ReviewFinding[]>;
  canFix?: boolean;
  applyFixes?(findings: ReviewFinding[]): Promise<number>;
}

export interface AnalyzerOptions {
  configPath?: string;
  severityOverrides?: Record<string, Severity>;
  ignoreRules?: string[];
  autoFix?: boolean;
}

export interface ReviewConfig {
  enabled: boolean;
  analyzers: AnalyzerConfig[];
  severityThreshold: Severity;
  ignorePatterns: string[];
  customRules?: Record<string, any>;
}

export interface AnalyzerConfig {
  name: string;
  enabled: boolean;
  options?: AnalyzerOptions;
}

import { reviewCache } from './review-cache';

export class CodeReviewEngine {
  private analyzers: Map<string, Analyzer> = new Map();
  private config: ReviewConfig;
  private cache = reviewCache;
  private defaultConfig: ReviewConfig = {
    enabled: true,
    analyzers: [
      { name: 'eslint', enabled: true },
      { name: 'typescript', enabled: true },
      { name: 'security', enabled: true },
      { name: 'performance', enabled: true },
      { name: 'architecture', enabled: true }
    ],
    severityThreshold: Severity.WARNING,
    ignorePatterns: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.test.*',
      '**/*.spec.*'
    ]
  };

  constructor(configPath?: string) {
    this.config = this.defaultConfig;
    if (configPath) {
      this.loadConfig(configPath);
    }
    // Initialize cache
    this.cache.initialize().catch(console.error);
  }

  /**
   * Register an analyzer
   */
  registerAnalyzer(analyzer: Analyzer): void {
    this.analyzers.set(analyzer.name, analyzer);
  }

  /**
   * Load configuration from file
   */
  private async loadConfig(configPath: string): Promise<void> {
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      const customConfig = JSON.parse(configContent);
      this.config = { ...this.defaultConfig, ...customConfig };
    } catch (error) {
      console.warn(`Failed to load config from ${configPath}, using defaults`);
    }
  }

  /**
   * Run code review
   */
  async review(options: CodeReviewOptions): Promise<ReviewResult> {
    const startTime = Date.now();
    const findings: ReviewFinding[] = [];
    const errors: string[] = [];
    let fixesApplied = 0;

    try {
      // Expand target paths to actual files
      const files = await this.expandPaths(options.targetPaths, options.ignorePatterns);
      
      if (files.length === 0) {
        return {
          success: true,
          findings: [],
          summary: this.createSummary([], files.length, Date.now() - startTime),
          errors: ['No files found to review']
        };
      }

      // Determine which analyzers to run
      const analyzersToRun = this.getAnalyzersToRun(options.analyzers);

      // Run each analyzer
      for (const analyzerName of analyzersToRun) {
        const analyzer = this.analyzers.get(analyzerName);
        if (!analyzer) {
          errors.push(`Analyzer '${analyzerName}' not found`);
          continue;
        }

        const analyzerConfig = this.config.analyzers.find(a => a.name === analyzerName);
        if (!analyzerConfig?.enabled) {
          continue;
        }

        try {
          // Process files with caching
          const analyzerFindings: ReviewFinding[] = [];
          const uncachedFiles: string[] = [];

          // Check cache for each file
          for (const file of files) {
            const cachedFindings = await this.cache.getCachedFindings(file, [analyzerName]);
            if (cachedFindings) {
              analyzerFindings.push(...cachedFindings);
            } else {
              uncachedFiles.push(file);
            }
          }

          // Analyze only uncached files
          if (uncachedFiles.length > 0) {
            const newFindings = await analyzer.analyze(uncachedFiles, {
              ...analyzerConfig.options,
              autoFix: options.fixMode
            });

            // Cache findings by file
            const findingsByFile = new Map<string, ReviewFinding[]>();
            for (const finding of newFindings) {
              const list = findingsByFile.get(finding.file) || [];
              list.push(finding);
              findingsByFile.set(finding.file, list);
            }

            // Cache findings for each file
            for (const [file, fileFindings] of findingsByFile) {
              await this.cache.cacheFindings(file, [analyzerName], fileFindings);
            }

            analyzerFindings.push(...newFindings);
          }

          // Filter by severity threshold
          const filteredFindings = analyzerFindings.filter(
            f => this.getSeverityLevel(f.severity) >= this.getSeverityLevel(options.severityThreshold || this.config.severityThreshold)
          );

          findings.push(...filteredFindings);

          // Apply fixes if requested
          if (options.fixMode && analyzer.canFix) {
            const fixableFindings = filteredFindings.filter(f => f.fix);
            if (fixableFindings.length > 0) {
              fixesApplied += await analyzer.applyFixes!(fixableFindings);
              // Invalidate cache for fixed files
              const fixedFiles = new Set(fixableFindings.map(f => f.file));
              await this.cache.invalidateFiles(Array.from(fixedFiles));
            }
          }
        } catch (error) {
          errors.push(`Analyzer '${analyzerName}' failed: ${error}`);
        }
      }

      // Sort findings by severity and file
      findings.sort((a, b) => {
        const severityDiff = this.getSeverityLevel(b.severity) - this.getSeverityLevel(a.severity);
        if (severityDiff !== 0) return severityDiff;
        return a.file.localeCompare(b.file);
      });

      const success = findings.filter(f => f.severity === Severity.ERROR).length === 0;

      return {
        success,
        findings,
        summary: this.createSummary(findings, files.length, Date.now() - startTime),
        ...(fixesApplied > 0 && { fixesApplied }),
        ...(errors.length > 0 && { errors })
      };
    } catch (error) {
      return {
        success: false,
        findings: [],
        summary: this.createSummary([], 0, Date.now() - startTime),
        errors: [`Code review failed: ${error}`]
      };
    }
  }

  /**
   * Expand paths to actual files
   */
  private async expandPaths(targetPaths: string[], ignorePatterns?: string[]): Promise<string[]> {
    const allFiles = new Set<string>();
    const ignore = [...this.config.ignorePatterns, ...(ignorePatterns || [])];

    for (const targetPath of targetPaths) {
      const stat = await fs.stat(targetPath).catch(() => null);
      
      if (!stat) {
        // Try as glob pattern
        const matches = await glob(targetPath, { ignore });
        matches.forEach(file => allFiles.add(file));
      } else if (stat.isDirectory()) {
        // Expand directory
        const pattern = path.join(targetPath, '**/*.{ts,tsx,js,jsx}');
        const matches = await glob(pattern, { ignore });
        matches.forEach(file => allFiles.add(file));
      } else {
        // Single file
        allFiles.add(targetPath);
      }
    }

    return Array.from(allFiles);
  }

  /**
   * Get analyzers to run
   */
  private getAnalyzersToRun(requestedAnalyzers?: string[]): string[] {
    if (requestedAnalyzers && requestedAnalyzers.length > 0) {
      return requestedAnalyzers;
    }

    return this.config.analyzers
      .filter(a => a.enabled)
      .map(a => a.name);
  }

  /**
   * Get severity level for comparison
   */
  private getSeverityLevel(severity: Severity): number {
    const levels = {
      [Severity.ERROR]: 3,
      [Severity.WARNING]: 2,
      [Severity.INFO]: 1,
      [Severity.SUGGESTION]: 0
    };
    return levels[severity] || 0;
  }

  /**
   * Create review summary
   */
  private createSummary(findings: ReviewFinding[], filesReviewed: number, timeElapsed: number): ReviewSummary {
    const byAnalyzer: Record<string, number> = {};
    const bySeverity: Record<Severity, number> = {
      [Severity.ERROR]: 0,
      [Severity.WARNING]: 0,
      [Severity.INFO]: 0,
      [Severity.SUGGESTION]: 0
    };

    for (const finding of findings) {
      byAnalyzer[finding.analyzer] = (byAnalyzer[finding.analyzer] || 0) + 1;
      bySeverity[finding.severity]++;
    }

    return {
      totalFindings: findings.length,
      byAnalyzer,
      bySeverity,
      filesReviewed,
      timeElapsed
    };
  }

  /**
   * Format review results for display
   */
  formatResults(result: ReviewResult): string {
    const lines: string[] = [];
    
    lines.push('# Code Review Results\n');
    lines.push(`Status: ${result.success ? '✅ Passed' : '❌ Failed'}`);
    lines.push(`Files reviewed: ${result.summary.filesReviewed}`);
    lines.push(`Total findings: ${result.summary.totalFindings}`);
    lines.push(`Time elapsed: ${(result.summary.timeElapsed / 1000).toFixed(2)}s`);
    
    if (result.fixesApplied) {
      lines.push(`Fixes applied: ${result.fixesApplied}`);
    }
    
    lines.push('\n## Summary by Severity\n');
    for (const [severity, count] of Object.entries(result.summary.bySeverity)) {
      if (count > 0) {
        lines.push(`- ${this.getSeverityIcon(severity as Severity)} ${severity}: ${count}`);
      }
    }
    
    lines.push('\n## Summary by Analyzer\n');
    for (const [analyzer, count] of Object.entries(result.summary.byAnalyzer)) {
      lines.push(`- ${analyzer}: ${count} findings`);
    }
    
    if (result.findings.length > 0) {
      lines.push('\n## Findings\n');
      
      let currentFile = '';
      for (const finding of result.findings) {
        if (finding.file !== currentFile) {
          currentFile = finding.file;
          lines.push(`\n### ${finding.file}\n`);
        }
        
        const location = finding.line ? `:${finding.line}${finding.column ? `:${finding.column}` : ''}` : '';
        lines.push(`${this.getSeverityIcon(finding.severity)} **[${finding.analyzer}]** ${finding.message} ${location}`);
        
        if (finding.rule) {
          lines.push(`   Rule: ${finding.rule}`);
        }
        
        if (finding.fix) {
          lines.push(`   💡 Fix available: ${finding.fix.description}`);
        }
        
        if (finding.documentation) {
          lines.push(`   📚 [Documentation](${finding.documentation})`);
        }
        
        lines.push('');
      }
    }
    
    if (result.errors && result.errors.length > 0) {
      lines.push('\n## Errors\n');
      result.errors.forEach(error => lines.push(`- ⚠️ ${error}`));
    }
    
    return lines.join('\n');
  }

  /**
   * Get severity icon
   */
  private getSeverityIcon(severity: Severity): string {
    const icons = {
      [Severity.ERROR]: '❌',
      [Severity.WARNING]: '⚠️',
      [Severity.INFO]: 'ℹ️',
      [Severity.SUGGESTION]: '💡'
    };
    return icons[severity] || '•';
  }

  /**
   * Get available analyzers
   */
  getAvailableAnalyzers(): string[] {
    return Array.from(this.analyzers.keys());
  }

  /**
   * Get analyzer info
   */
  getAnalyzerInfo(name: string): Analyzer | undefined {
    return this.analyzers.get(name);
  }
}

// Export singleton instance
export const codeReviewEngine = new CodeReviewEngine();