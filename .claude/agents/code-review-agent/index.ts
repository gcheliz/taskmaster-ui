/**
 * Code Review Agent
 * 
 * Main entry point for the code review agent
 */

import { codeReviewEngine, CodeReviewOptions, ReviewResult } from './core-engine';
import { eslintAnalyzer } from './analyzers/eslint-analyzer';
import { typescriptAnalyzer } from './analyzers/typescript-analyzer';
import { securityAnalyzer } from './analyzers/security-analyzer';
import { performanceAnalyzer } from './analyzers/performance-analyzer';
import { architectureAnalyzer } from './analyzers/architecture-analyzer';
import { suggestionEngine } from './suggestion-engine';
import { gitHooksIntegration } from './git-hooks';
import { prReviewIntegration } from './pr-review';
import { reportingSystem } from './reporting';
import { reviewCache } from './review-cache';

// Register all analyzers
codeReviewEngine.registerAnalyzer(eslintAnalyzer);
codeReviewEngine.registerAnalyzer(typescriptAnalyzer);
codeReviewEngine.registerAnalyzer(securityAnalyzer);
codeReviewEngine.registerAnalyzer(performanceAnalyzer);
codeReviewEngine.registerAnalyzer(architectureAnalyzer);

export { 
  codeReviewEngine,
  CodeReviewOptions,
  ReviewResult,
  Severity,
  ReviewFinding,
  ReviewSummary
} from './core-engine';

export {
  eslintAnalyzer,
  typescriptAnalyzer,
  securityAnalyzer,
  performanceAnalyzer,
  architectureAnalyzer,
  suggestionEngine,
  gitHooksIntegration,
  prReviewIntegration,
  reportingSystem,
  reviewCache
};

/**
 * Code review commands
 */
export const codeReviewCommands = {
  '/review': 'Run comprehensive code review on files or directories',
  '/review:eslint': 'Run ESLint analysis only',
  '/review:typescript': 'Run TypeScript strict mode analysis only',
  '/review:security': 'Run security vulnerability scan only',
  '/review:performance': 'Run performance optimization analysis only',
  '/review:architecture': 'Run architecture pattern validation only',
  '/review:suggestions': 'Run code review with optimization suggestions',
  '/review:fix': 'Run code review and apply automatic fixes where possible',
  '/review:pr': 'Review changes in current pull request',
  '/review:commit': 'Review changes in specific commit or range',
  '/review:report': 'Generate comprehensive code quality report',
  '/review:cache': 'Manage review cache (stats, clear, export)'
} as const;

/**
 * Run code review with default options
 */
export async function runCodeReview(
  targetPaths: string[] = ['.'],
  options: Partial<CodeReviewOptions> = {}
): Promise<ReviewResult> {
  const defaultOptions: CodeReviewOptions = {
    targetPaths,
    analyzers: options.analyzers,
    severityThreshold: options.severityThreshold,
    ignorePatterns: options.ignorePatterns,
    fixMode: options.fixMode || false,
    configPath: options.configPath
  };

  return codeReviewEngine.review(defaultOptions);
}

/**
 * Run code review and format results
 */
export async function reviewAndFormat(
  targetPaths: string[] = ['.'],
  options: Partial<CodeReviewOptions> = {}
): Promise<string> {
  const result = await runCodeReview(targetPaths, options);
  return codeReviewEngine.formatResults(result);
}

/**
 * Run code review with optimization suggestions
 */
export async function reviewWithSuggestions(
  targetPaths: string[] = ['.'],
  options: Partial<CodeReviewOptions> = {}
): Promise<string> {
  const result = await runCodeReview(targetPaths, options);
  const baseReport = codeReviewEngine.formatResults(result);
  
  if (result.findings.length > 0) {
    const suggestions = suggestionEngine.generateSuggestions(result.findings);
    const suggestionsReport = suggestionEngine.formatSuggestions(suggestions);
    return `${baseReport}\n\n${suggestionsReport}`;
  }
  
  return baseReport;
}

/**
 * Run code review for specific analyzer
 */
export async function runSpecificAnalyzer(
  analyzer: string,
  targetPaths: string[] = ['.'],
  options: Partial<CodeReviewOptions> = {}
): Promise<ReviewResult> {
  return runCodeReview(targetPaths, {
    ...options,
    analyzers: [analyzer]
  });
}

/**
 * Setup Git hooks for code review
 */
export async function setupGitHooks(projectRoot: string, options?: any): Promise<void> {
  await gitHooksIntegration.setupGitIntegration(projectRoot, options);
}

/**
 * Initialize code review agent
 */
export async function initializeCodeReviewAgent(projectRoot: string): Promise<void> {
  console.log('🔍 Initializing Code Review Agent...');
  
  // Check for required configuration files
  const requiredFiles = [
    '.eslintrc.js',
    '.eslintrc.json',
    '.eslintrc.yml',
    'tsconfig.json'
  ];
  
  const fs = await import('fs/promises');
  const path = await import('path');
  
  let hasEslintConfig = false;
  let hasTsConfig = false;
  
  for (const file of requiredFiles) {
    const filePath = path.join(projectRoot, file);
    try {
      await fs.access(filePath);
      if (file.startsWith('.eslintrc')) hasEslintConfig = true;
      if (file === 'tsconfig.json') hasTsConfig = true;
    } catch {
      // File doesn't exist
    }
  }
  
  if (!hasEslintConfig) {
    console.warn('⚠️  No ESLint configuration found. ESLint analyzer may use defaults.');
  }
  
  if (!hasTsConfig) {
    console.warn('⚠️  No tsconfig.json found. TypeScript analyzer may have limited functionality.');
  }
  
  console.log('✅ Code Review Agent ready');
  console.log('📚 Available commands:', Object.keys(codeReviewCommands).join(', '));
}

/**
 * Command handlers for slash commands
 */
export const commandHandlers = {
  '/review': async (args: string[]) => {
    const paths = args.length > 0 ? args : ['.'];
    const result = await reviewAndFormat(paths);
    return result;
  },
  
  '/review:eslint': async (args: string[]) => {
    const paths = args.length > 0 ? args : ['.'];
    const result = await runSpecificAnalyzer('eslint', paths);
    return codeReviewEngine.formatResults(result);
  },
  
  '/review:typescript': async (args: string[]) => {
    const paths = args.length > 0 ? args : ['.'];
    const result = await runSpecificAnalyzer('typescript', paths);
    return codeReviewEngine.formatResults(result);
  },
  
  '/review:security': async (args: string[]) => {
    const paths = args.length > 0 ? args : ['.'];
    const result = await runSpecificAnalyzer('security', paths);
    return codeReviewEngine.formatResults(result);
  },
  
  '/review:performance': async (args: string[]) => {
    const paths = args.length > 0 ? args : ['.'];
    const result = await runSpecificAnalyzer('performance', paths);
    return codeReviewEngine.formatResults(result);
  },
  
  '/review:architecture': async (args: string[]) => {
    const paths = args.length > 0 ? args : ['.'];
    const result = await runSpecificAnalyzer('architecture', paths);
    return codeReviewEngine.formatResults(result);
  },
  
  '/review:suggestions': async (args: string[]) => {
    const paths = args.length > 0 ? args : ['.'];
    return reviewWithSuggestions(paths);
  },
  
  '/review:fix': async (args: string[]) => {
    const paths = args.length > 0 ? args : ['.'];
    const result = await runCodeReview(paths, { fixMode: true });
    return codeReviewEngine.formatResults(result);
  },
  
  '/review:pr': async (args: string[]) => {
    // Review current PR changes
    const baseBranch = args[0] || 'main';
    const review = await prReviewIntegration.reviewPullRequest({
      baseBranch,
      postComments: true,
      requestChangesOnError: true,
      approveOnSuccess: true
    });
    return prReviewIntegration.formatPRReview(review);
  },
  
  '/review:commit': async (args: string[]) => {
    // Review specific commit or range
    const commit = args[0] || 'HEAD';
    const result = await gitHooksIntegration.reviewChangedFiles({ commit });
    return codeReviewEngine.formatResults(result);
  },
  
  '/review:report': async (args: string[]) => {
    // Generate comprehensive report
    const format = args[0] || 'markdown';
    const outputPath = args[1];
    const paths = args.slice(2).length > 0 ? args.slice(2) : ['.'];
    
    const result = await runCodeReview(paths);
    const suggestions = suggestionEngine.generateSuggestions(result.findings);
    
    const report = await reportingSystem.generateReport(result, suggestions, {
      format: format as any,
      includeDetails: true,
      includeSuggestions: true,
      includeMetrics: true,
      includeTrends: true,
      outputPath
    });
    
    if (outputPath) {
      return `Report saved to: ${outputPath}`;
    }
    return report;
  },
  
  '/review:cache': async (args: string[]) => {
    // Manage cache
    const action = args[0] || 'stats';
    
    switch (action) {
      case 'stats':
        const stats = reviewCache.getStats();
        return `Cache Statistics:
  Entries: ${stats.entries}
  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB
  Hits: ${stats.hits}
  Misses: ${stats.misses}
  Hit Rate: ${stats.hitRate.toFixed(1)}%`;
        
      case 'clear':
        await reviewCache.clearCache();
        return 'Cache cleared successfully';
        
      case 'export':
        const exportPath = args[1] || 'review-cache-export.json';
        await reviewCache.exportCache(exportPath);
        return `Cache exported to: ${exportPath}`;
        
      default:
        return 'Usage: /review:cache [stats|clear|export] [outputPath]';
    }
  }
};