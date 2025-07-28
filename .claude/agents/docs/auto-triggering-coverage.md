# Auto-triggering and Coverage Enforcement Documentation

## Overview

The Auto-triggering and Coverage Enforcement system provides continuous testing capabilities with automatic test generation on file changes, coverage threshold enforcement, and seamless CI/CD integration. It ensures code quality is maintained throughout development.

## Key Features

### 1. File Watching System

- **Automatic Detection**: Monitors file changes in real-time
- **Intelligent Triggering**: Determines appropriate test types based on file location and content
- **Debounced Processing**: Prevents excessive test runs with configurable delays
- **Caching**: Avoids re-running tests for unchanged files
- **Priority Queue**: Processes critical files first

### 2. Coverage Enforcement

- **Threshold Management**: Enforces minimum coverage requirements
- **Granular Control**: Set thresholds for statements, branches, functions, and lines
- **Violation Reporting**: Detailed reports on coverage gaps
- **Trend Tracking**: Historical coverage data with trend analysis
- **Pre-commit Integration**: Prevents commits that don't meet thresholds

### 3. CI/CD Integration

- **Multi-Provider Support**: GitHub Actions, GitLab CI, Jenkins, CircleCI
- **Parallel Execution**: Optimized test runs with job parallelization
- **Artifact Management**: Automatic coverage report collection
- **Notification System**: Alerts for test failures and coverage drops

## File Watcher Usage

### Starting the File Watcher

```typescript
import { fileWatcher } from '@/agents/testing-agents';

// Start watching with default configuration
await fileWatcher.start();

// Custom configuration
const watcher = new FileWatcher({
  paths: ['src/', 'lib/'],
  ignore: ['**/node_modules/**', '**/*.test.*'],
  debounceDelay: 1000,
  concurrency: 4,
  cacheEnabled: true,
});

await watcher.start();
```

### File Watcher Events

```typescript
fileWatcher.on('change', change => {
  console.log(`File ${change.type}: ${change.path}`);
});

fileWatcher.on('test:start', trigger => {
  console.log(
    `Running ${trigger.testType} tests for ${trigger.files.length} files`
  );
});

fileWatcher.on('test:complete', result => {
  console.log(`Tests completed: ${result.coverageOk ? 'PASSED' : 'FAILED'}`);
});

fileWatcher.on('coverage:failed', data => {
  console.error('Coverage requirements not met!');
});
```

### Configuration Options

```typescript
interface FileWatcherOptions {
  paths: string[]; // Directories to watch
  ignore?: string[]; // Patterns to ignore
  testOnStartup?: boolean; // Run tests on startup
  debounceDelay?: number; // Delay before processing (ms)
  concurrency?: number; // Max parallel test runs
  cacheEnabled?: boolean; // Enable test result caching
}
```

## Coverage Enforcement Usage

### Basic Coverage Check

```typescript
import { coverageEnforcement } from '@/agents/testing-agents';

// Check coverage with default thresholds (80%)
const report = await coverageEnforcement.checkCoverage('./packages/backend');

if (!report.passed) {
  console.error('Coverage thresholds not met!');
  console.error(report.violations);
}
```

### Custom Thresholds

```typescript
const enforcer = new CoverageEnforcement({
  thresholds: {
    statements: 90,
    branches: 85,
    functions: 95,
    lines: 90,
  },
  reportDir: 'coverage',
  historyFile: '.coverage-history.json',
});

const report = await enforcer.checkCoverage('.');
```

### Coverage Trends

```typescript
// Get coverage trend for last 30 days
const trend = coverageEnforcement.getTrend('lines', 30);

// Check if coverage is improving
const improving = coverageEnforcement.isImproving('lines');

// Get average coverage
const average = coverageEnforcement.getAverageCoverage('lines', 30);
```

## CI/CD Integration

### GitHub Actions Setup

```typescript
import { githubIntegration } from '@/agents/testing-agents';

// Generate GitHub Actions workflow
await githubIntegration.generateCIConfig('./');

// Generated .github/workflows/test.yml
```

Example workflow:

```yaml
name: Test Suite
on:
  push:
    branches: [main, develop]
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter=backend run test
      - run: pnpm --filter=backend run test:coverage
      - uses: actions/upload-artifact@v3
        with:
          name: backend-coverage
          path: packages/backend/coverage/

  coverage-check:
    needs: [backend-tests, frontend-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: |
          node -e "
          const { coverageEnforcement } = require('.claude/agents/testing-agents');
          coverageEnforcement.checkCoverage('.')
            .then(report => {
              if (!report.passed) {
                console.error('Coverage thresholds not met!');
                process.exit(1);
              }
            });
          "
```

### Pre-commit Hook Setup

```typescript
// Create pre-commit hook
await coverageEnforcement.createPreCommitHook('./');

// Setup pre-commit configuration
await githubIntegration.setupPreCommitHooks('./');
```

Generated `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: local
    hooks:
      - id: test-coverage
        name: Check test coverage
        entry: pnpm run test:coverage:check
        language: system
        pass_filenames: false
        types: [file]
        files: '\.(ts|tsx|js|jsx)$'
```

## Package.json Scripts

Add these scripts to your package.json:

```json
{
  "scripts": {
    "test:watch": "AUTO_TEST=true node .claude/agents/testing-agents/scripts/watch.js",
    "test:coverage": "pnpm run test:coverage:backend && pnpm run test:coverage:frontend",
    "test:coverage:check": "node .claude/agents/testing-agents/scripts/check-coverage.js",
    "test:coverage:report": "node .claude/agents/testing-agents/scripts/coverage-report.js",
    "test:ci:setup": "node .claude/agents/testing-agents/scripts/setup-ci.js",
    "test:intelligent:watch": "AUTO_TEST=true INTELLIGENT=true node .claude/agents/testing-agents/scripts/watch.js"
  }
}
```

## Environment Variables

```bash
# Enable automatic test generation
AUTO_TEST=true

# Set coverage thresholds
COVERAGE_STATEMENTS=90
COVERAGE_BRANCHES=85
COVERAGE_FUNCTIONS=95
COVERAGE_LINES=90

# Configure file watcher
WATCH_DEBOUNCE=1000
WATCH_CONCURRENCY=4
WATCH_CACHE=true

# CI/CD provider
CI_PROVIDER=github
```

## Best Practices

### 1. File Watcher Configuration

- **Ignore Patterns**: Always exclude test files, node_modules, and build directories
- **Debounce Delay**: Set to 500-1000ms to avoid excessive test runs
- **Concurrency**: Limit based on CPU cores (usually 2-4)
- **Cache**: Enable for faster feedback on unchanged files

### 2. Coverage Thresholds

- **Start Conservative**: Begin with 70-80% and gradually increase
- **File-specific**: Consider different thresholds for different file types
- **Critical Paths**: Set higher thresholds for core functionality
- **Gradual Enforcement**: Use warnings before hard failures

### 3. CI/CD Integration

- **Parallel Jobs**: Run backend/frontend tests in parallel
- **Artifact Storage**: Save coverage reports for historical analysis
- **Fast Feedback**: Run unit tests before integration tests
- **Branch Protection**: Require coverage checks for merge

### 4. Performance Optimization

- **Test Caching**: Cache results for unchanged files
- **Selective Testing**: Only run tests for changed modules
- **Resource Limits**: Prevent CPU overload with concurrency limits
- **Smart Triggers**: Use file patterns to determine test types

## Troubleshooting

### Common Issues

1. **File Watcher Not Triggering**
   - Check ignore patterns aren't too broad
   - Verify file paths are correct
   - Ensure watcher is started

2. **Coverage Failures**
   - Review violation report for specific files
   - Check if thresholds are realistic
   - Ensure all source files are included

3. **CI Pipeline Timeouts**
   - Reduce test concurrency
   - Enable test result caching
   - Split large test suites

4. **Memory Issues**
   - Limit concurrent test runs
   - Clear cache periodically
   - Use --max-old-space-size flag

### Debug Mode

Enable verbose logging:

```typescript
fileWatcher.on('error', error => {
  console.error('Watcher error:', error);
});

process.env.DEBUG = 'testing:*';
```

## Example Implementation

### Complete Setup

```typescript
import {
  fileWatcher,
  coverageEnforcement,
  githubIntegration,
} from '@/agents/testing-agents';

async function setupTestingInfrastructure() {
  // Configure coverage enforcement
  const coverage = new CoverageEnforcement({
    thresholds: {
      statements: 85,
      branches: 80,
      functions: 90,
      lines: 85,
    },
  });

  // Setup file watcher
  fileWatcher.on('test:complete', async result => {
    if (!result.coverageOk) {
      // Send notification
      console.error('Coverage dropped below thresholds!');
    }
  });

  // Generate CI configuration
  await githubIntegration.generateCIConfig('./');

  // Create pre-commit hooks
  await coverage.createPreCommitHook('./');

  // Start watching
  await fileWatcher.start();

  console.log('✅ Testing infrastructure ready!');
}

// Run setup
setupTestingInfrastructure().catch(console.error);
```

### Custom Test Trigger

```typescript
fileWatcher.on('change', change => {
  // Custom logic for specific files
  if (change.path.includes('critical/')) {
    // Run all tests for critical files
    intelligentTestSystem.generateIntelligentTests({
      targetFile: change.path,
      testType: 'all',
      framework: 'vitest',
      coverage: {
        statements: 95,
        branches: 90,
        functions: 100,
        lines: 95,
      },
    });
  }
});
```

## Metrics and Monitoring

### Coverage Metrics

- **Current Coverage**: Real-time coverage percentages
- **Coverage Trend**: Historical coverage over time
- **Violation Count**: Number of files below threshold
- **Test Execution Time**: Average test duration

### File Watcher Metrics

- **Files Watched**: Total files being monitored
- **Changes Processed**: Number of file changes handled
- **Cache Hit Rate**: Percentage of cached test results used
- **Queue Length**: Current test queue size

### Performance Metrics

- **Test Duration**: Time to run test suites
- **Memory Usage**: Peak memory during test execution
- **CPU Utilization**: Average CPU usage
- **Parallel Efficiency**: Speedup from parallelization
