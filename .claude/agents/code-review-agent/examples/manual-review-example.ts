/**
 * Example: Manual Code Review Workflow
 * 
 * Demonstrates comprehensive code review with reporting
 */

import { 
  codeReviewEngine,
  runCodeReview,
  reviewWithSuggestions,
  suggestionEngine,
  reportingSystem,
  reviewCache
} from '../index';

async function manualReviewExample() {
  console.log('📚 Manual Code Review Example\n');

  // 1. Basic review of specific files
  console.log('1. Reviewing specific files...');
  const basicResult = await runCodeReview([
    'src/controllers/userController.ts',
    'src/services/authService.ts'
  ]);
  console.log(codeReviewEngine.formatResults(basicResult));

  // 2. Review with suggestions
  console.log('\n2. Review with optimization suggestions...');
  const suggestionReport = await reviewWithSuggestions(['src/components/']);
  console.log(suggestionReport);

  // 3. Generate different report formats
  console.log('\n3. Generating reports...');
  
  // Markdown report
  const markdownReport = await reportingSystem.generateReport(
    basicResult,
    suggestionEngine.generateSuggestions(basicResult.findings),
    {
      format: 'markdown',
      includeDetails: true,
      includeSuggestions: true,
      includeMetrics: true,
      includeTrends: true,
      outputPath: 'reports/code-review.md'
    }
  );
  console.log('Markdown report saved to: reports/code-review.md');

  // JSON report for CI/CD integration
  const jsonReport = await reportingSystem.generateReport(
    basicResult,
    [],
    {
      format: 'json',
      includeDetails: true,
      includeMetrics: true,
      outputPath: 'reports/code-review.json'
    }
  );
  console.log('JSON report saved to: reports/code-review.json');

  // HTML report for web viewing
  const htmlReport = await reportingSystem.generateReport(
    basicResult,
    [],
    {
      format: 'html',
      includeDetails: true,
      includeMetrics: true,
      outputPath: 'reports/code-review.html'
    }
  );
  console.log('HTML report saved to: reports/code-review.html');

  // 4. Cache management
  console.log('\n4. Cache statistics...');
  const cacheStats = reviewCache.getStats();
  console.log(`Cache entries: ${cacheStats.entries}`);
  console.log(`Cache size: ${(cacheStats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Hit rate: ${cacheStats.hitRate.toFixed(1)}%`);

  // 5. Targeted analyzer reviews
  console.log('\n5. Running specific analyzers...');
  
  // Security-only review
  const securityResult = await codeReviewEngine.review({
    targetPaths: ['src/'],
    analyzers: ['security']
  });
  console.log(`Security issues found: ${securityResult.findings.length}`);

  // Performance-only review
  const performanceResult = await codeReviewEngine.review({
    targetPaths: ['src/components/'],
    analyzers: ['performance']
  });
  console.log(`Performance issues found: ${performanceResult.findings.length}`);

  // 6. Review with auto-fix
  console.log('\n6. Review with automatic fixes...');
  const fixResult = await runCodeReview(['src/utils/'], { fixMode: true });
  if (fixResult.fixesApplied) {
    console.log(`Applied ${fixResult.fixesApplied} automatic fixes`);
  }

  // 7. Interactive review workflow
  console.log('\n7. Interactive review workflow...');
  await interactiveReview();
}

/**
 * Interactive review workflow
 */
async function interactiveReview() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise(resolve => {
      rl.question(prompt, resolve);
    });
  };

  console.log('\n🔍 Interactive Code Review\n');
  
  while (true) {
    const command = await question('\nEnter command (review/fix/report/cache/exit): ');
    
    switch (command) {
      case 'review':
        const path = await question('Enter path to review: ');
        const result = await runCodeReview([path]);
        console.log(codeReviewEngine.formatResults(result));
        break;
        
      case 'fix':
        const fixPath = await question('Enter path to fix: ');
        const fixResult = await runCodeReview([fixPath], { fixMode: true });
        console.log(`Fixed ${fixResult.fixesApplied || 0} issues`);
        break;
        
      case 'report':
        const format = await question('Enter format (markdown/json/html): ');
        const output = await question('Enter output path: ');
        const reportResult = await runCodeReview(['.']);
        await reportingSystem.generateReport(reportResult, [], {
          format: format as any,
          includeDetails: true,
          includeMetrics: true,
          outputPath: output
        });
        console.log(`Report saved to: ${output}`);
        break;
        
      case 'cache':
        const stats = reviewCache.getStats();
        console.log(`Cache: ${stats.entries} entries, ${stats.hitRate.toFixed(1)}% hit rate`);
        break;
        
      case 'exit':
        rl.close();
        return;
        
      default:
        console.log('Unknown command');
    }
  }
}

/**
 * Example: Custom review configuration
 */
async function customReviewExample() {
  // Create custom review configuration
  const customConfig = {
    targetPaths: ['src/'],
    analyzers: ['eslint', 'typescript', 'security'],
    severityThreshold: 'warning' as const,
    ignorePatterns: [
      '**/node_modules/**',
      '**/__tests__/**',
      '**/*.test.*'
    ]
  };

  const result = await codeReviewEngine.review(customConfig);
  
  // Filter results by severity
  const errors = result.findings.filter(f => f.severity === 'error');
  const warnings = result.findings.filter(f => f.severity === 'warning');
  
  console.log(`Found ${errors.length} errors and ${warnings.length} warnings`);
  
  // Group by file
  const findingsByFile = new Map<string, typeof result.findings>();
  for (const finding of result.findings) {
    const list = findingsByFile.get(finding.file) || [];
    list.push(finding);
    findingsByFile.set(finding.file, list);
  }
  
  // Show files with most issues
  const sortedFiles = Array.from(findingsByFile.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5);
    
  console.log('\nTop 5 files with issues:');
  for (const [file, findings] of sortedFiles) {
    console.log(`  ${file}: ${findings.length} issues`);
  }
}

// Run example if called directly
if (require.main === module) {
  manualReviewExample().catch(console.error);
}