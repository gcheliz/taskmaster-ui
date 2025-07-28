/**
 * Pull Request Review Integration
 * 
 * Handles automated code review for pull requests
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { codeReviewEngine, ReviewResult, Severity } from './core-engine';
import { suggestionEngine } from './suggestion-engine';

const execAsync = promisify(exec);

export interface PRReviewOptions {
  owner?: string;
  repo?: string;
  prNumber?: number;
  baseBranch?: string;
  headBranch?: string;
  githubToken?: string;
  analyzers?: string[];
  postComments?: boolean;
  requestChangesOnError?: boolean;
  approveOnSuccess?: boolean;
}

export interface PRFile {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface PRReviewResult {
  result: ReviewResult;
  comments: PRComment[];
  summary: string;
  status: 'approved' | 'changes_requested' | 'commented';
}

export interface PRComment {
  path: string;
  line?: number;
  side?: 'LEFT' | 'RIGHT';
  body: string;
}

export class PRReviewIntegration {
  /**
   * Review a pull request
   */
  async reviewPullRequest(options: PRReviewOptions): Promise<PRReviewResult> {
    // Get PR files
    const files = await this.getPRFiles(options);
    
    if (files.length === 0) {
      return {
        result: this.emptyResult(),
        comments: [],
        summary: 'No files to review',
        status: 'approved'
      };
    }

    // Filter for reviewable files
    const reviewableFiles = files
      .filter(f => f.status !== 'removed')
      .filter(f => f.filename.match(/\.(ts|tsx|js|jsx)$/))
      .map(f => f.filename);

    if (reviewableFiles.length === 0) {
      return {
        result: this.emptyResult(),
        comments: [],
        summary: 'No JavaScript/TypeScript files to review',
        status: 'approved'
      };
    }

    // Run code review
    const result = await codeReviewEngine.review({
      targetPaths: reviewableFiles,
      analyzers: options.analyzers,
      severityThreshold: Severity.INFO
    });

    // Generate comments
    const comments = this.generatePRComments(result, files);
    
    // Generate suggestions
    const suggestions = suggestionEngine.generateSuggestions(result.findings);
    
    // Determine review status
    const hasErrors = result.findings.some(f => f.severity === Severity.ERROR);
    const hasWarnings = result.findings.some(f => f.severity === Severity.WARNING);
    
    let status: 'approved' | 'changes_requested' | 'commented';
    if (hasErrors && options.requestChangesOnError) {
      status = 'changes_requested';
    } else if (!hasErrors && !hasWarnings && options.approveOnSuccess) {
      status = 'approved';
    } else {
      status = 'commented';
    }

    // Generate summary
    const summary = this.generatePRSummary(result, suggestions.length);

    return {
      result,
      comments,
      summary,
      status
    };
  }

  /**
   * Get PR files using Git
   */
  private async getPRFiles(options: PRReviewOptions): Promise<PRFile[]> {
    const baseBranch = options.baseBranch || 'main';
    
    try {
      // Get list of changed files
      const { stdout: filesOutput } = await execAsync(
        `git diff --name-status ${baseBranch}...HEAD`
      );

      const files: PRFile[] = [];
      const lines = filesOutput.trim().split('\n');

      for (const line of lines) {
        if (!line) continue;
        
        const [status, ...pathParts] = line.split('\t');
        const filename = pathParts.join('\t');
        
        // Get file stats
        try {
          const { stdout: statOutput } = await execAsync(
            `git diff --numstat ${baseBranch}...HEAD -- "${filename}"`
          );
          
          const [additions = '0', deletions = '0'] = statOutput.trim().split('\t');
          
          files.push({
            filename,
            status: this.mapGitStatus(status),
            additions: parseInt(additions, 10) || 0,
            deletions: parseInt(deletions, 10) || 0,
            changes: (parseInt(additions, 10) || 0) + (parseInt(deletions, 10) || 0)
          });
        } catch {
          // File might be binary or deleted
          files.push({
            filename,
            status: this.mapGitStatus(status),
            additions: 0,
            deletions: 0,
            changes: 0
          });
        }
      }

      return files;
    } catch (error) {
      console.error('Failed to get PR files:', error);
      return [];
    }
  }

  /**
   * Map Git status to PR status
   */
  private mapGitStatus(status: string): 'added' | 'modified' | 'removed' | 'renamed' {
    switch (status) {
      case 'A': return 'added';
      case 'M': return 'modified';
      case 'D': return 'removed';
      case 'R': return 'renamed';
      default: return 'modified';
    }
  }

  /**
   * Generate PR comments from review findings
   */
  private generatePRComments(result: ReviewResult, prFiles: PRFile[]): PRComment[] {
    const comments: PRComment[] = [];
    const maxCommentsPerFile = 10;
    const fileCommentCount = new Map<string, number>();

    for (const finding of result.findings) {
      const prFile = prFiles.find(f => f.filename === finding.file);
      if (!prFile || prFile.status === 'removed') continue;

      // Limit comments per file
      const currentCount = fileCommentCount.get(finding.file) || 0;
      if (currentCount >= maxCommentsPerFile) continue;
      fileCommentCount.set(finding.file, currentCount + 1);

      // Generate comment body
      let body = `**[${finding.analyzer}]** ${this.getSeverityEmoji(finding.severity)} ${finding.message}`;
      
      if (finding.rule) {
        body += `\n\n**Rule:** \`${finding.rule}\``;
      }
      
      if (finding.documentation) {
        body += `\n\n[📚 Documentation](${finding.documentation})`;
      }
      
      if (finding.fix) {
        body += `\n\n💡 **Suggested fix:** ${finding.fix.description}`;
      }

      comments.push({
        path: finding.file,
        line: finding.line,
        body
      });
    }

    return comments;
  }

  /**
   * Generate PR summary
   */
  private generatePRSummary(result: ReviewResult, suggestionCount: number): string {
    if (result.findings.length === 0) {
      return '## ✅ Code Review Passed\n\nNo issues found! Great work! 🎉';
    }

    const lines: string[] = [];
    lines.push('## 🔍 Automated Code Review\n');
    
    // Overall summary
    lines.push(`Found **${result.findings.length}** issues in **${result.summary.filesReviewed}** files.\n`);
    
    // Severity breakdown
    lines.push('### Issues by Severity\n');
    if (result.summary.bySeverity.error > 0) {
      lines.push(`- ❌ Errors: ${result.summary.bySeverity.error}`);
    }
    if (result.summary.bySeverity.warning > 0) {
      lines.push(`- ⚠️ Warnings: ${result.summary.bySeverity.warning}`);
    }
    if (result.summary.bySeverity.info > 0) {
      lines.push(`- ℹ️ Info: ${result.summary.bySeverity.info}`);
    }
    if (result.summary.bySeverity.suggestion > 0) {
      lines.push(`- 💡 Suggestions: ${result.summary.bySeverity.suggestion}`);
    }
    
    // Analyzer breakdown
    lines.push('\n### Issues by Analyzer\n');
    for (const [analyzer, count] of Object.entries(result.summary.byAnalyzer)) {
      lines.push(`- **${analyzer}**: ${count} issues`);
    }
    
    // Suggestions
    if (suggestionCount > 0) {
      lines.push(`\n### 💡 Optimization Suggestions\n`);
      lines.push(`Generated **${suggestionCount}** actionable recommendations to improve code quality.`);
      lines.push(`Run \`pnpm review:suggestions\` locally for detailed suggestions with code examples.`);
    }
    
    // Review time
    lines.push(`\n---\n*Review completed in ${(result.summary.timeElapsed / 1000).toFixed(2)}s*`);
    
    return lines.join('\n');
  }

  /**
   * Get severity emoji
   */
  private getSeverityEmoji(severity: Severity): string {
    switch (severity) {
      case Severity.ERROR: return '❌';
      case Severity.WARNING: return '⚠️';
      case Severity.INFO: return 'ℹ️';
      case Severity.SUGGESTION: return '💡';
      default: return '•';
    }
  }

  /**
   * Create empty result
   */
  private emptyResult(): ReviewResult {
    return {
      success: true,
      findings: [],
      summary: {
        totalFindings: 0,
        byAnalyzer: {},
        bySeverity: {
          [Severity.ERROR]: 0,
          [Severity.WARNING]: 0,
          [Severity.INFO]: 0,
          [Severity.SUGGESTION]: 0
        },
        filesReviewed: 0,
        timeElapsed: 0
      }
    };
  }

  /**
   * Format PR review for CLI output
   */
  formatPRReview(review: PRReviewResult): string {
    const lines: string[] = [];
    
    lines.push(review.summary);
    lines.push('\n');
    
    if (review.comments.length > 0) {
      lines.push('### 📝 Review Comments\n');
      
      // Group comments by file
      const commentsByFile = new Map<string, PRComment[]>();
      for (const comment of review.comments) {
        const list = commentsByFile.get(comment.path) || [];
        list.push(comment);
        commentsByFile.set(comment.path, list);
      }
      
      for (const [file, fileComments] of commentsByFile) {
        lines.push(`#### ${file}\n`);
        for (const comment of fileComments) {
          if (comment.line) {
            lines.push(`**Line ${comment.line}:** ${comment.body}\n`);
          } else {
            lines.push(`${comment.body}\n`);
          }
        }
      }
    }
    
    lines.push(`\n**Review Status:** ${this.formatStatus(review.status)}`);
    
    return lines.join('\n');
  }

  /**
   * Format review status
   */
  private formatStatus(status: string): string {
    switch (status) {
      case 'approved': return '✅ Approved';
      case 'changes_requested': return '❌ Changes Requested';
      case 'commented': return '💬 Commented';
      default: return status;
    }
  }
}

// Export singleton instance
export const prReviewIntegration = new PRReviewIntegration();