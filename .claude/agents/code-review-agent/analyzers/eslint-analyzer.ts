/**
 * ESLint Analyzer
 * 
 * Integrates ESLint for JavaScript/TypeScript code quality checks
 */

import { ESLint } from 'eslint';
import * as path from 'path';
import { 
  Analyzer, 
  AnalyzerOptions, 
  ReviewFinding, 
  Severity,
  CodeFix,
  FileChange,
  Edit
} from '../core-engine';

export class ESLintAnalyzer implements Analyzer {
  name = 'eslint';
  description = 'JavaScript/TypeScript code quality and style checker';
  canFix = true;

  private eslint: ESLint | null = null;

  /**
   * Initialize ESLint instance
   */
  private async getESLint(options: AnalyzerOptions): Promise<ESLint> {
    if (!this.eslint) {
      const eslintOptions: ESLint.Options = {
        useEslintrc: true,
        fix: options.autoFix || false,
        cache: true,
        cacheLocation: '.eslintcache'
      };

      if (options.configPath) {
        eslintOptions.overrideConfigFile = options.configPath;
      }

      this.eslint = new ESLint(eslintOptions);
    }

    return this.eslint;
  }

  /**
   * Analyze files with ESLint
   */
  async analyze(files: string[], options: AnalyzerOptions): Promise<ReviewFinding[]> {
    const findings: ReviewFinding[] = [];
    const eslint = await this.getESLint(options);

    try {
      // Filter out files that ESLint should ignore
      const filesToLint = await this.filterIgnoredFiles(eslint, files);
      
      if (filesToLint.length === 0) {
        return findings;
      }

      // Lint files
      const results = await eslint.lintFiles(filesToLint);

      // Convert ESLint results to ReviewFindings
      for (const result of results) {
        if (result.messages.length === 0) continue;

        for (const message of result.messages) {
          // Skip ignored rules
          if (options.ignoreRules?.includes(message.ruleId || '')) {
            continue;
          }

          const severity = this.convertSeverity(message.severity);
          
          // Apply severity overrides
          const finalSeverity = options.severityOverrides?.[message.ruleId || ''] || severity;

          const finding: ReviewFinding = {
            analyzer: this.name,
            severity: finalSeverity,
            file: result.filePath,
            line: message.line,
            column: message.column,
            endLine: message.endLine || message.line,
            endColumn: message.endColumn || message.column,
            message: message.message,
            rule: message.ruleId || undefined,
            documentation: this.getRuleDocumentation(message.ruleId)
          };

          // Add fix if available
          if (message.fix) {
            finding.fix = this.convertFix(result.filePath, message.fix);
          }

          findings.push(finding);
        }
      }

      return findings;
    } catch (error) {
      console.error(`ESLint analysis failed: ${error}`);
      throw error;
    }
  }

  /**
   * Apply fixes to files
   */
  async applyFixes(findings: ReviewFinding[]): Promise<number> {
    const eslint = await this.getESLint({ autoFix: true });
    const filesToFix = new Set<string>();
    
    // Collect unique files that have fixes
    for (const finding of findings) {
      if (finding.fix && finding.analyzer === this.name) {
        filesToFix.add(finding.file);
      }
    }

    if (filesToFix.size === 0) {
      return 0;
    }

    try {
      // Re-lint files with fix mode enabled
      const results = await eslint.lintFiles(Array.from(filesToFix));
      
      // Write fixed files
      await ESLint.outputFixes(results);
      
      // Count applied fixes
      let fixCount = 0;
      for (const result of results) {
        fixCount += result.output ? 1 : 0;
      }
      
      return fixCount;
    } catch (error) {
      console.error(`Failed to apply ESLint fixes: ${error}`);
      return 0;
    }
  }

  /**
   * Filter out ignored files
   */
  private async filterIgnoredFiles(eslint: ESLint, files: string[]): Promise<string[]> {
    const filtered: string[] = [];
    
    for (const file of files) {
      const ignored = await eslint.isPathIgnored(file);
      if (!ignored) {
        filtered.push(file);
      }
    }
    
    return filtered;
  }

  /**
   * Convert ESLint severity to review severity
   */
  private convertSeverity(eslintSeverity: number): Severity {
    switch (eslintSeverity) {
      case 2: return Severity.ERROR;
      case 1: return Severity.WARNING;
      default: return Severity.INFO;
    }
  }

  /**
   * Convert ESLint fix to CodeFix
   */
  private convertFix(filePath: string, eslintFix: { range: [number, number]; text: string }): CodeFix {
    // Note: This is a simplified conversion
    // In a real implementation, we'd need to convert byte offsets to line/column
    return {
      description: 'Apply ESLint automatic fix',
      changes: [{
        file: filePath,
        edits: [{
          startLine: 0, // Would need proper conversion
          startColumn: 0,
          endLine: 0,
          endColumn: 0,
          newText: eslintFix.text
        }]
      }]
    };
  }

  /**
   * Get rule documentation URL
   */
  private getRuleDocumentation(ruleId?: string): string | undefined {
    if (!ruleId) return undefined;
    
    // Check if it's a TypeScript ESLint rule
    if (ruleId.startsWith('@typescript-eslint/')) {
      const ruleName = ruleId.replace('@typescript-eslint/', '');
      return `https://typescript-eslint.io/rules/${ruleName}`;
    }
    
    // Check if it's a React rule
    if (ruleId.startsWith('react/') || ruleId.startsWith('react-hooks/')) {
      return `https://github.com/jsx-eslint/eslint-plugin-react/blob/main/docs/rules/${ruleId.replace('react/', '')}.md`;
    }
    
    // Default ESLint rules
    return `https://eslint.org/docs/latest/rules/${ruleId}`;
  }
}

// Export singleton instance
export const eslintAnalyzer = new ESLintAnalyzer();