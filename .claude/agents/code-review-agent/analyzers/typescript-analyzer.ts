/**
 * TypeScript Strict Mode Analyzer
 * 
 * Checks TypeScript code for strict mode compliance and type safety
 */

import * as ts from 'typescript';
import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  Analyzer, 
  AnalyzerOptions, 
  ReviewFinding, 
  Severity,
  CodeFix
} from '../core-engine';

interface TypeScriptConfig {
  compilerOptions?: ts.CompilerOptions;
  include?: string[];
  exclude?: string[];
}

export class TypeScriptAnalyzer implements Analyzer {
  name = 'typescript';
  description = 'TypeScript strict mode compliance and type safety checker';
  canFix = false; // TypeScript fixes are complex and should be done manually

  private strictModeOptions: Partial<ts.CompilerOptions> = {
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true,
    strictFunctionTypes: true,
    strictBindCallApply: true,
    strictPropertyInitialization: true,
    noImplicitThis: true,
    alwaysStrict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    noUncheckedIndexedAccess: true,
    noPropertyAccessFromIndexSignature: true,
    exactOptionalPropertyTypes: true,
    forceConsistentCasingInFileNames: true
  };

  /**
   * Analyze files for TypeScript strict mode compliance
   */
  async analyze(files: string[], options: AnalyzerOptions): Promise<ReviewFinding[]> {
    const findings: ReviewFinding[] = [];
    
    try {
      // Load TypeScript config
      const configPath = await this.findTsConfig(options.configPath);
      const config = await this.loadTsConfig(configPath);
      
      // Filter TypeScript files
      const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
      if (tsFiles.length === 0) {
        return findings;
      }

      // Create program with strict options
      const strictOptions = this.mergeWithStrictOptions(config.compilerOptions || {});
      const program = ts.createProgram(tsFiles, strictOptions);
      const checker = program.getTypeChecker();

      // Get all diagnostics
      const diagnostics = [
        ...program.getSemanticDiagnostics(),
        ...program.getSyntacticDiagnostics(),
        ...program.getDeclarationDiagnostics()
      ];

      // Also check for strict mode violations
      const strictViolations = this.checkStrictModeCompliance(config.compilerOptions || {});
      
      // Convert diagnostics to findings
      for (const diagnostic of diagnostics) {
        const finding = this.diagnosticToFinding(diagnostic, program);
        if (finding && !this.shouldIgnoreFinding(finding, options)) {
          findings.push(finding);
        }
      }

      // Add strict mode configuration findings
      for (const violation of strictViolations) {
        findings.push(violation);
      }

      // Additional custom checks
      for (const sourceFile of program.getSourceFiles()) {
        if (!tsFiles.includes(sourceFile.fileName)) continue;
        
        const customFindings = this.performCustomChecks(sourceFile, checker);
        findings.push(...customFindings);
      }

      return findings;
    } catch (error) {
      console.error(`TypeScript analysis failed: ${error}`);
      throw error;
    }
  }

  /**
   * Find tsconfig.json
   */
  private async findTsConfig(configPath?: string): Promise<string> {
    if (configPath) {
      return configPath;
    }

    // Search for tsconfig.json in current and parent directories
    let dir = process.cwd();
    while (dir !== path.dirname(dir)) {
      const tsConfigPath = path.join(dir, 'tsconfig.json');
      try {
        await fs.access(tsConfigPath);
        return tsConfigPath;
      } catch {
        dir = path.dirname(dir);
      }
    }

    throw new Error('tsconfig.json not found');
  }

  /**
   * Load TypeScript configuration
   */
  private async loadTsConfig(configPath: string): Promise<TypeScriptConfig> {
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(`Failed to load tsconfig.json: ${error}`);
      return {};
    }
  }

  /**
   * Merge with strict mode options
   */
  private mergeWithStrictOptions(existingOptions: ts.CompilerOptions): ts.CompilerOptions {
    return {
      ...existingOptions,
      ...this.strictModeOptions,
      // Ensure these are enabled for analysis
      noEmit: true,
      skipLibCheck: false
    };
  }

  /**
   * Check strict mode compliance in configuration
   */
  private checkStrictModeCompliance(options: ts.CompilerOptions): ReviewFinding[] {
    const findings: ReviewFinding[] = [];
    const configFile = 'tsconfig.json';

    // Check if strict mode is enabled
    if (!options.strict) {
      findings.push({
        analyzer: this.name,
        severity: Severity.ERROR,
        file: configFile,
        message: 'TypeScript strict mode is not enabled. Add "strict": true to compilerOptions',
        rule: 'strict-mode',
        documentation: 'https://www.typescriptlang.org/tsconfig#strict'
      });
    }

    // Check individual strict options
    const strictOptions = [
      { key: 'noImplicitAny', message: 'Enable noImplicitAny for better type safety' },
      { key: 'strictNullChecks', message: 'Enable strictNullChecks to catch null/undefined errors' },
      { key: 'strictFunctionTypes', message: 'Enable strictFunctionTypes for safer function assignments' },
      { key: 'strictBindCallApply', message: 'Enable strictBindCallApply for type-safe function calls' },
      { key: 'strictPropertyInitialization', message: 'Enable strictPropertyInitialization for class property safety' },
      { key: 'noImplicitThis', message: 'Enable noImplicitThis to catch unsafe this usage' },
      { key: 'alwaysStrict', message: 'Enable alwaysStrict to emit "use strict" in all files' }
    ];

    for (const { key, message } of strictOptions) {
      if (!options[key as keyof ts.CompilerOptions] && !options.strict) {
        findings.push({
          analyzer: this.name,
          severity: Severity.WARNING,
          file: configFile,
          message: `${message} (add "${key}": true to compilerOptions)`,
          rule: key,
          documentation: `https://www.typescriptlang.org/tsconfig#${key}`
        });
      }
    }

    return findings;
  }

  /**
   * Convert TypeScript diagnostic to finding
   */
  private diagnosticToFinding(diagnostic: ts.Diagnostic, program: ts.Program): ReviewFinding | null {
    if (!diagnostic.file) {
      return null;
    }

    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

    return {
      analyzer: this.name,
      severity: this.diagnosticSeverityToSeverity(diagnostic.category),
      file: diagnostic.file.fileName,
      line: line + 1,
      column: character + 1,
      message: message,
      rule: `TS${diagnostic.code}`,
      documentation: `https://typescript.tv/errors/#ts${diagnostic.code}`
    };
  }

  /**
   * Convert TypeScript diagnostic severity
   */
  private diagnosticSeverityToSeverity(category: ts.DiagnosticCategory): Severity {
    switch (category) {
      case ts.DiagnosticCategory.Error:
        return Severity.ERROR;
      case ts.DiagnosticCategory.Warning:
        return Severity.WARNING;
      case ts.DiagnosticCategory.Suggestion:
        return Severity.SUGGESTION;
      case ts.DiagnosticCategory.Message:
      default:
        return Severity.INFO;
    }
  }

  /**
   * Check if finding should be ignored
   */
  private shouldIgnoreFinding(finding: ReviewFinding, options: AnalyzerOptions): boolean {
    if (!finding.rule) return false;
    return options.ignoreRules?.includes(finding.rule) || false;
  }

  /**
   * Perform custom TypeScript checks
   */
  private performCustomChecks(sourceFile: ts.SourceFile, checker: ts.TypeChecker): ReviewFinding[] {
    const findings: ReviewFinding[] = [];
    
    const visit = (node: ts.Node) => {
      // Check for 'any' type usage
      if (ts.isVariableDeclaration(node) || ts.isParameter(node)) {
        const type = checker.getTypeAtLocation(node);
        if (type.flags & ts.TypeFlags.Any) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          findings.push({
            analyzer: this.name,
            severity: Severity.WARNING,
            file: sourceFile.fileName,
            line: line + 1,
            column: character + 1,
            message: 'Avoid using "any" type. Specify a more precise type',
            rule: 'no-explicit-any'
          });
        }
      }

      // Check for missing return type annotations
      if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isArrowFunction(node)) {
        if (!node.type && node.body && !this.isReactComponent(node, checker)) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          findings.push({
            analyzer: this.name,
            severity: Severity.INFO,
            file: sourceFile.fileName,
            line: line + 1,
            column: character + 1,
            message: 'Consider adding explicit return type annotation',
            rule: 'explicit-return-type'
          });
        }
      }

      // Check for non-null assertions
      if (ts.isNonNullExpression(node)) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        findings.push({
          analyzer: this.name,
          severity: Severity.WARNING,
          file: sourceFile.fileName,
          line: line + 1,
          column: character + 1,
          message: 'Avoid non-null assertions (!). Use proper null checks instead',
          rule: 'no-non-null-assertion'
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return findings;
  }

  /**
   * Check if a function is a React component
   */
  private isReactComponent(node: ts.FunctionDeclaration | ts.MethodDeclaration | ts.ArrowFunction, checker: ts.TypeChecker): boolean {
    const signature = checker.getSignatureFromDeclaration(node);
    if (!signature) return false;

    const returnType = checker.getReturnTypeOfSignature(signature);
    const symbol = returnType.getSymbol();
    
    // Simple check for JSX.Element or React component types
    return symbol?.getName() === 'Element' || 
           symbol?.getName() === 'ReactElement' ||
           returnType.symbol?.getName() === 'JSX';
  }
}

// Export singleton instance
export const typescriptAnalyzer = new TypeScriptAnalyzer();