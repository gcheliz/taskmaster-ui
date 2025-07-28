/**
 * Performance Analyzer
 * 
 * Detects performance anti-patterns and provides optimization suggestions
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as ts from 'typescript';
import { 
  Analyzer, 
  AnalyzerOptions, 
  ReviewFinding, 
  Severity,
  CodeFix
} from '../core-engine';

interface PerformanceRule {
  id: string;
  name: string;
  check: (node: ts.Node, checker: ts.TypeChecker, sourceFile: ts.SourceFile) => ReviewFinding | null;
}

export class PerformanceAnalyzer implements Analyzer {
  name = 'performance';
  description = 'Performance optimization analyzer for detecting anti-patterns';
  canFix = false; // Performance optimizations should be carefully reviewed

  private performanceRules: PerformanceRule[] = [
    {
      id: 'react-memo',
      name: 'Missing React.memo for pure components',
      check: this.checkReactMemo.bind(this)
    },
    {
      id: 'react-callback',
      name: 'Missing useCallback for event handlers',
      check: this.checkUseCallback.bind(this)
    },
    {
      id: 'react-memo-deps',
      name: 'Missing useMemo for expensive computations',
      check: this.checkUseMemo.bind(this)
    },
    {
      id: 'array-index-key',
      name: 'Using array index as React key',
      check: this.checkArrayIndexKey.bind(this)
    },
    {
      id: 'inline-functions',
      name: 'Inline function definitions in render',
      check: this.checkInlineFunctions.bind(this)
    },
    {
      id: 'unnecessary-spread',
      name: 'Unnecessary object spread',
      check: this.checkUnnecessarySpread.bind(this)
    },
    {
      id: 'unoptimized-loops',
      name: 'Unoptimized loops',
      check: this.checkUnoptimizedLoops.bind(this)
    },
    {
      id: 'repeated-calculations',
      name: 'Repeated calculations',
      check: this.checkRepeatedCalculations.bind(this)
    },
    {
      id: 'large-bundle-imports',
      name: 'Large bundle imports',
      check: this.checkLargeBundleImports.bind(this)
    },
    {
      id: 'synchronous-operations',
      name: 'Blocking synchronous operations',
      check: this.checkSynchronousOperations.bind(this)
    }
  ];

  /**
   * Analyze files for performance issues
   */
  async analyze(files: string[], options: AnalyzerOptions): Promise<ReviewFinding[]> {
    const findings: ReviewFinding[] = [];

    // Filter for JS/TS files
    const jstsFiles = files.filter(f => 
      f.endsWith('.ts') || f.endsWith('.tsx') || 
      f.endsWith('.js') || f.endsWith('.jsx')
    );

    for (const file of jstsFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const isReactFile = file.endsWith('.tsx') || file.endsWith('.jsx') || 
                           content.includes('import React') || content.includes('from "react"');
        
        // Create TypeScript source file
        const sourceFile = ts.createSourceFile(
          file,
          content,
          ts.ScriptTarget.Latest,
          true
        );

        // Create a simple type checker (limited without full program)
        const checker = this.createSimpleTypeChecker();

        // Apply rules
        const fileFindings = this.analyzeSourceFile(sourceFile, checker, isReactFile, options);
        findings.push(...fileFindings);

        // Additional content-based checks
        const contentFindings = await this.performContentAnalysis(file, content);
        findings.push(...contentFindings);
      } catch (error) {
        console.error(`Failed to analyze ${file}: ${error}`);
      }
    }

    return findings;
  }

  /**
   * Create a simple type checker for basic analysis
   */
  private createSimpleTypeChecker(): ts.TypeChecker {
    // This is a placeholder - in a real implementation, we'd need the full program
    return {} as ts.TypeChecker;
  }

  /**
   * Analyze a source file
   */
  private analyzeSourceFile(
    sourceFile: ts.SourceFile,
    checker: ts.TypeChecker,
    isReactFile: boolean,
    options: AnalyzerOptions
  ): ReviewFinding[] {
    const findings: ReviewFinding[] = [];

    const visit = (node: ts.Node) => {
      for (const rule of this.performanceRules) {
        // Skip React-specific rules for non-React files
        if (!isReactFile && rule.id.startsWith('react-')) {
          continue;
        }

        // Skip ignored rules
        if (options.ignoreRules?.includes(rule.id)) {
          continue;
        }

        const finding = rule.check(node, checker, sourceFile);
        if (finding) {
          findings.push(finding);
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return findings;
  }

  /**
   * Check for missing React.memo
   */
  private checkReactMemo(node: ts.Node, _checker: ts.TypeChecker, sourceFile: ts.SourceFile): ReviewFinding | null {
    // Check for function components that could benefit from React.memo
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) {
      const parent = node.parent;
      
      // Check if it's a component (capitalized name, returns JSX)
      let componentName = '';
      if (ts.isFunctionDeclaration(node) && node.name) {
        componentName = node.name.text;
      } else if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
        componentName = parent.name.text;
      }

      if (componentName && /^[A-Z]/.test(componentName)) {
        // Check if already wrapped in memo
        const text = sourceFile.text;
        const nodeStart = node.getStart();
        const beforeNode = text.substring(Math.max(0, nodeStart - 50), nodeStart);
        
        if (!beforeNode.includes('memo(') && !text.includes(`React.memo(${componentName})`)) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          return {
            analyzer: this.name,
            severity: Severity.SUGGESTION,
            file: sourceFile.fileName,
            line: line + 1,
            column: character + 1,
            message: `Consider wrapping component '${componentName}' with React.memo() to prevent unnecessary re-renders`,
            rule: 'react-memo',
            documentation: 'https://react.dev/reference/react/memo'
          };
        }
      }
    }

    return null;
  }

  /**
   * Check for missing useCallback
   */
  private checkUseCallback(node: ts.Node, _checker: ts.TypeChecker, sourceFile: ts.SourceFile): ReviewFinding | null {
    // Check for inline functions passed as props
    if (ts.isJsxAttribute(node) && node.initializer) {
      const attrName = node.name.getText();
      
      // Check if it's an event handler prop
      if (attrName.startsWith('on') && ts.isJsxExpression(node.initializer)) {
        const expr = node.initializer.expression;
        
        if (expr && (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr))) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          return {
            analyzer: this.name,
            severity: Severity.WARNING,
            file: sourceFile.fileName,
            line: line + 1,
            column: character + 1,
            message: `Inline function in prop '${attrName}' causes re-renders. Use useCallback to memoize`,
            rule: 'react-callback',
            documentation: 'https://react.dev/reference/react/useCallback'
          };
        }
      }
    }

    return null;
  }

  /**
   * Check for missing useMemo
   */
  private checkUseMemo(node: ts.Node, _checker: ts.TypeChecker, sourceFile: ts.SourceFile): ReviewFinding | null {
    // Look for expensive computations in render
    if (ts.isCallExpression(node)) {
      const callText = node.expression.getText();
      
      // Check for expensive operations
      const expensiveOps = ['filter', 'map', 'reduce', 'sort', 'find', 'findIndex'];
      
      if (expensiveOps.some(op => callText.endsWith(`.${op}`))) {
        // Check if it's inside a component render
        let parent = node.parent;
        let inComponent = false;
        let inUseMemo = false;
        
        while (parent) {
          if (ts.isFunctionDeclaration(parent) || ts.isArrowFunction(parent)) {
            const name = this.getFunctionName(parent);
            if (name && /^[A-Z]/.test(name)) {
              inComponent = true;
            }
          }
          
          if (ts.isCallExpression(parent)) {
            const callName = parent.expression.getText();
            if (callName === 'useMemo') {
              inUseMemo = true;
              break;
            }
          }
          
          parent = parent.parent;
        }
        
        if (inComponent && !inUseMemo) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          return {
            analyzer: this.name,
            severity: Severity.WARNING,
            file: sourceFile.fileName,
            line: line + 1,
            column: character + 1,
            message: `Array operation '${callText}' in render may cause performance issues. Consider wrapping in useMemo`,
            rule: 'react-memo-deps',
            documentation: 'https://react.dev/reference/react/useMemo'
          };
        }
      }
    }

    return null;
  }

  /**
   * Check for array index as key
   */
  private checkArrayIndexKey(node: ts.Node, _checker: ts.TypeChecker, sourceFile: ts.SourceFile): ReviewFinding | null {
    if (ts.isJsxAttribute(node) && node.name.getText() === 'key') {
      if (node.initializer && ts.isJsxExpression(node.initializer)) {
        const expr = node.initializer.expression;
        
        if (expr && ts.isIdentifier(expr) && (expr.text === 'index' || expr.text === 'i' || expr.text === 'idx')) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          return {
            analyzer: this.name,
            severity: Severity.WARNING,
            file: sourceFile.fileName,
            line: line + 1,
            column: character + 1,
            message: 'Using array index as key can cause issues with component state. Use a stable, unique identifier',
            rule: 'array-index-key',
            documentation: 'https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key'
          };
        }
      }
    }

    return null;
  }

  /**
   * Check for inline function definitions
   */
  private checkInlineFunctions(node: ts.Node, _checker: ts.TypeChecker, sourceFile: ts.SourceFile): ReviewFinding | null {
    // Already covered by useCallback check
    return null;
  }

  /**
   * Check for unnecessary object spread
   */
  private checkUnnecessarySpread(node: ts.Node, _checker: ts.TypeChecker, sourceFile: ts.SourceFile): ReviewFinding | null {
    if (ts.isSpreadAssignment(node) || ts.isSpreadElement(node)) {
      const parent = node.parent;
      
      // Check for spreading an object just to add one property
      if (ts.isObjectLiteralExpression(parent) && parent.properties.length === 2) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        return {
          analyzer: this.name,
          severity: Severity.SUGGESTION,
          file: sourceFile.fileName,
          line: line + 1,
          column: character + 1,
          message: 'Consider using Object.assign() or direct property assignment instead of spread for better performance',
          rule: 'unnecessary-spread'
        };
      }
    }

    return null;
  }

  /**
   * Check for unoptimized loops
   */
  private checkUnoptimizedLoops(node: ts.Node, _checker: ts.TypeChecker, sourceFile: ts.SourceFile): ReviewFinding | null {
    if (ts.isForStatement(node) || ts.isForInStatement(node) || ts.isForOfStatement(node)) {
      const body = ts.isForStatement(node) ? node.statement : 
                   ts.isForInStatement(node) ? node.statement : 
                   (node as ts.ForOfStatement).statement;

      if (body) {
        // Check for DOM operations inside loops
        const bodyText = body.getText();
        const domOperations = ['querySelector', 'getElementById', 'appendChild', 'removeChild', 'innerHTML'];
        
        for (const op of domOperations) {
          if (bodyText.includes(op)) {
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            return {
              analyzer: this.name,
              severity: Severity.WARNING,
              file: sourceFile.fileName,
              line: line + 1,
              column: character + 1,
              message: `DOM operation '${op}' inside loop can cause performance issues. Consider batching operations`,
              rule: 'unoptimized-loops'
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Check for repeated calculations
   */
  private checkRepeatedCalculations(node: ts.Node, _checker: ts.TypeChecker, sourceFile: ts.SourceFile): ReviewFinding | null {
    // This would require more complex analysis to track repeated expressions
    return null;
  }

  /**
   * Check for large bundle imports
   */
  private checkLargeBundleImports(node: ts.Node, _checker: ts.TypeChecker, sourceFile: ts.SourceFile): ReviewFinding | null {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const importPath = node.moduleSpecifier.text;
      
      // Check for known large libraries being imported entirely
      const largeLibraries = [
        { name: 'lodash', suggestion: 'Use specific imports like lodash/debounce' },
        { name: 'moment', suggestion: 'Consider using date-fns or native Intl.DateTimeFormat' },
        { name: '@mui/material', suggestion: 'Use specific component imports' },
        { name: 'antd', suggestion: 'Use babel-plugin-import for tree shaking' },
        { name: 'rxjs', suggestion: 'Import specific operators' }
      ];

      for (const lib of largeLibraries) {
        if (importPath === lib.name && !node.importClause?.namedBindings) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          return {
            analyzer: this.name,
            severity: Severity.WARNING,
            file: sourceFile.fileName,
            line: line + 1,
            column: character + 1,
            message: `Importing entire '${lib.name}' library increases bundle size. ${lib.suggestion}`,
            rule: 'large-bundle-imports'
          };
        }
      }
    }

    return null;
  }

  /**
   * Check for synchronous operations
   */
  private checkSynchronousOperations(node: ts.Node, _checker: ts.TypeChecker, sourceFile: ts.SourceFile): ReviewFinding | null {
    if (ts.isCallExpression(node)) {
      const callText = node.expression.getText();
      
      // Check for blocking operations
      const blockingOps = [
        { name: 'readFileSync', suggestion: 'Use readFile with promises/async' },
        { name: 'writeFileSync', suggestion: 'Use writeFile with promises/async' },
        { name: 'execSync', suggestion: 'Use exec with promises/async' },
        { name: 'JSON.parse', minSize: 1000, suggestion: 'Consider streaming for large JSON' }
      ];

      for (const op of blockingOps) {
        if (callText.includes(op.name)) {
          // For JSON.parse, check if it's parsing a large string
          if (op.name === 'JSON.parse' && node.arguments.length > 0) {
            const arg = node.arguments[0];
            if (ts.isStringLiteral(arg) && arg.text.length < (op.minSize || 0)) {
              continue;
            }
          }

          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          return {
            analyzer: this.name,
            severity: Severity.WARNING,
            file: sourceFile.fileName,
            line: line + 1,
            column: character + 1,
            message: `Synchronous operation '${op.name}' can block the event loop. ${op.suggestion}`,
            rule: 'synchronous-operations'
          };
        }
      }
    }

    return null;
  }

  /**
   * Get function name
   */
  private getFunctionName(node: ts.FunctionDeclaration | ts.ArrowFunction): string {
    if (ts.isFunctionDeclaration(node) && node.name) {
      return node.name.text;
    }
    
    const parent = node.parent;
    if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
      return parent.name.text;
    }
    
    return '';
  }

  /**
   * Perform content-based analysis
   */
  private async performContentAnalysis(filePath: string, content: string): Promise<ReviewFinding[]> {
    const findings: ReviewFinding[] = [];

    // Check for console.log statements (performance impact in production)
    const consoleRegex = /console\.(log|debug|info|warn|error)\(/g;
    let match;
    while ((match = consoleRegex.exec(content)) !== null) {
      const lines = content.substring(0, match.index).split('\n');
      findings.push({
        analyzer: this.name,
        severity: Severity.INFO,
        file: filePath,
        line: lines.length,
        column: lines[lines.length - 1].length + 1,
        message: 'Console statements impact performance in production. Consider using a proper logging library with levels',
        rule: 'console-usage'
      });
    }

    // Check for potentially expensive regex patterns
    const regexPattern = /new RegExp\(['"`]([^'"`]+)['"`]\)|\/([^\/]+)\/[gimuy]*/g;
    while ((match = regexPattern.exec(content)) !== null) {
      const pattern = match[1] || match[2];
      if (pattern && this.isPotentiallyExpensiveRegex(pattern)) {
        const lines = content.substring(0, match.index).split('\n');
        findings.push({
          analyzer: this.name,
          severity: Severity.WARNING,
          file: filePath,
          line: lines.length,
          column: lines[lines.length - 1].length + 1,
          message: 'Complex regex pattern may cause performance issues. Consider simplifying or pre-compiling',
          rule: 'expensive-regex'
        });
      }
    }

    return findings;
  }

  /**
   * Check if regex is potentially expensive
   */
  private isPotentiallyExpensiveRegex(pattern: string): boolean {
    // Check for known problematic patterns
    const problematicPatterns = [
      /(\[[^\]]*\]|\([^\)]*\))\*\+/,  // Nested quantifiers
      /\([^\)]*\|\)/,                   // Empty alternatives
      /\([^\)]{20,}\)/                  // Very long groups
    ];

    return problematicPatterns.some(p => p.test(pattern));
  }
}

// Export singleton instance
export const performanceAnalyzer = new PerformanceAnalyzer();