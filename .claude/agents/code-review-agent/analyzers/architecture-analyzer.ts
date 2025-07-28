/**
 * Architecture Analyzer
 * 
 * Validates code against architectural patterns and conventions
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as ts from 'typescript';
import { 
  Analyzer, 
  AnalyzerOptions, 
  ReviewFinding, 
  Severity
} from '../core-engine';

interface ArchitectureRule {
  id: string;
  name: string;
  validate: (filePath: string, content: string, ast?: ts.SourceFile) => ReviewFinding[];
}

interface LayerRule {
  layer: string;
  allowedImports: RegExp[];
  forbiddenImports: RegExp[];
}

export class ArchitectureAnalyzer implements Analyzer {
  name = 'architecture';
  description = 'Architecture pattern validation and dependency checking';
  canFix = false; // Architecture violations require manual review

  // Define layer rules based on common architectures
  private layerRules: LayerRule[] = [
    {
      layer: 'controllers',
      allowedImports: [
        /^\.\.\/services/,
        /^\.\.\/middleware/,
        /^\.\.\/types/,
        /^\.\.\/utils/,
        /^\.\.\/validators/
      ],
      forbiddenImports: [
        /^\.\.\/repositories/,  // Controllers shouldn't directly access repositories
        /^\.\.\/models/,        // Controllers shouldn't directly access database models
        /^\.\.\/database/
      ]
    },
    {
      layer: 'services',
      allowedImports: [
        /^\.\.\/repositories/,
        /^\.\.\/types/,
        /^\.\.\/utils/,
        /^\.\.\/models/
      ],
      forbiddenImports: [
        /^\.\.\/controllers/,   // Services shouldn't depend on controllers
        /^\.\.\/routes/         // Services shouldn't depend on routes
      ]
    },
    {
      layer: 'repositories',
      allowedImports: [
        /^\.\.\/models/,
        /^\.\.\/types/,
        /^\.\.\/database/
      ],
      forbiddenImports: [
        /^\.\.\/controllers/,   // Repositories shouldn't depend on controllers
        /^\.\.\/services/,      // Repositories shouldn't depend on services
        /^\.\.\/routes/
      ]
    },
    {
      layer: 'components',
      allowedImports: [
        /^\.\.\/hooks/,
        /^\.\.\/utils/,
        /^\.\.\/types/,
        /^\.\.\/services/,
        /^\.\.\/stores/,
        /^\.\.\/atoms/,         // Atomic design
        /^\.\.\/molecules/
      ],
      forbiddenImports: [
        /^\.\.\/pages/,         // Components shouldn't import pages
        /^\.\.\/organisms/      // Lower level components shouldn't import higher level
      ]
    }
  ];

  private architectureRules: ArchitectureRule[] = [
    {
      id: 'layer-violation',
      name: 'Layer Architecture Violation',
      validate: this.validateLayerArchitecture.bind(this)
    },
    {
      id: 'circular-dependency',
      name: 'Circular Dependency',
      validate: this.validateCircularDependencies.bind(this)
    },
    {
      id: 'naming-convention',
      name: 'Naming Convention Violation',
      validate: this.validateNamingConventions.bind(this)
    },
    {
      id: 'file-structure',
      name: 'File Structure Violation',
      validate: this.validateFileStructure.bind(this)
    },
    {
      id: 'dependency-injection',
      name: 'Dependency Injection Pattern',
      validate: this.validateDependencyInjection.bind(this)
    },
    {
      id: 'single-responsibility',
      name: 'Single Responsibility Principle',
      validate: this.validateSingleResponsibility.bind(this)
    },
    {
      id: 'interface-segregation',
      name: 'Interface Segregation Principle',
      validate: this.validateInterfaceSegregation.bind(this)
    },
    {
      id: 'atomic-design',
      name: 'Atomic Design Pattern',
      validate: this.validateAtomicDesign.bind(this)
    }
  ];

  /**
   * Analyze files for architecture violations
   */
  async analyze(files: string[], options: AnalyzerOptions): Promise<ReviewFinding[]> {
    const findings: ReviewFinding[] = [];

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        let ast: ts.SourceFile | undefined;

        // Create AST for TypeScript/JavaScript files
        if (file.match(/\.(ts|tsx|js|jsx)$/)) {
          ast = ts.createSourceFile(
            file,
            content,
            ts.ScriptTarget.Latest,
            true
          );
        }

        // Apply architecture rules
        for (const rule of this.architectureRules) {
          if (options.ignoreRules?.includes(rule.id)) {
            continue;
          }

          const ruleFindings = rule.validate(file, content, ast);
          findings.push(...ruleFindings);
        }
      } catch (error) {
        console.error(`Failed to analyze ${file}: ${error}`);
      }
    }

    // Perform cross-file analysis
    const crossFileFindings = await this.performCrossFileAnalysis(files);
    findings.push(...crossFileFindings);

    return findings;
  }

  /**
   * Validate layer architecture
   */
  private validateLayerArchitecture(filePath: string, _content: string, ast?: ts.SourceFile): ReviewFinding[] {
    const findings: ReviewFinding[] = [];
    
    if (!ast) return findings;

    // Determine which layer this file belongs to
    const layer = this.determineLayer(filePath);
    if (!layer) return findings;

    const layerRule = this.layerRules.find(r => r.layer === layer);
    if (!layerRule) return findings;

    // Check imports
    ast.forEachChild(node => {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const importPath = node.moduleSpecifier.text;
        
        // Check if it's a relative import
        if (importPath.startsWith('.')) {
          // Check forbidden imports
          for (const forbidden of layerRule.forbiddenImports) {
            if (forbidden.test(importPath)) {
              const { line, character } = ast.getLineAndCharacterOfPosition(node.getStart());
              findings.push({
                analyzer: this.name,
                severity: Severity.ERROR,
                file: filePath,
                line: line + 1,
                column: character + 1,
                message: `Layer violation: ${layer} should not import from ${importPath}`,
                rule: 'layer-violation',
                documentation: 'https://en.wikipedia.org/wiki/Multitier_architecture'
              });
            }
          }

          // Check if import is in allowed list
          const isAllowed = layerRule.allowedImports.some(allowed => allowed.test(importPath));
          if (!isAllowed && importPath.startsWith('../')) {
            const { line, character } = ast.getLineAndCharacterOfPosition(node.getStart());
            findings.push({
              analyzer: this.name,
              severity: Severity.WARNING,
              file: filePath,
              line: line + 1,
              column: character + 1,
              message: `Suspicious import: ${layer} importing from ${importPath} may violate architecture`,
              rule: 'layer-violation'
            });
          }
        }
      }
    });

    return findings;
  }

  /**
   * Validate circular dependencies
   */
  private validateCircularDependencies(_filePath: string, _content: string, _ast?: ts.SourceFile): ReviewFinding[] {
    // This would require building a full dependency graph
    // For now, we'll skip this as it needs cross-file analysis
    return [];
  }

  /**
   * Validate naming conventions
   */
  private validateNamingConventions(filePath: string, _content: string, ast?: ts.SourceFile): ReviewFinding[] {
    const findings: ReviewFinding[] = [];
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileExt = path.extname(filePath);

    // Check file naming conventions
    const conventions = [
      { pattern: /Controller\.(ts|js)$/, type: 'controller', convention: 'PascalCase' },
      { pattern: /Service\.(ts|js)$/, type: 'service', convention: 'PascalCase' },
      { pattern: /Repository\.(ts|js)$/, type: 'repository', convention: 'PascalCase' },
      { pattern: /\.(tsx|jsx)$/, type: 'component', convention: 'PascalCase' },
      { pattern: /\.test\.(ts|tsx|js|jsx)$/, type: 'test', convention: 'kebab-case or PascalCase' },
      { pattern: /\.spec\.(ts|tsx|js|jsx)$/, type: 'test', convention: 'kebab-case or PascalCase' }
    ];

    for (const conv of conventions) {
      if (conv.pattern.test(filePath)) {
        if (conv.type === 'component' && !this.isPascalCase(fileName) && fileName !== 'index') {
          findings.push({
            analyzer: this.name,
            severity: Severity.WARNING,
            file: filePath,
            message: `React component file '${fileName}' should use PascalCase naming`,
            rule: 'naming-convention'
          });
        } else if (conv.type === 'controller' || conv.type === 'service' || conv.type === 'repository') {
          if (!fileName.endsWith(conv.type.charAt(0).toUpperCase() + conv.type.slice(1))) {
            findings.push({
              analyzer: this.name,
              severity: Severity.WARNING,
              file: filePath,
              message: `${conv.type} file should end with '${conv.type.charAt(0).toUpperCase() + conv.type.slice(1)}'`,
              rule: 'naming-convention'
            });
          }
        }
      }
    }

    // Check class/interface/function naming in the file
    if (ast) {
      ast.forEachChild(node => {
        if (ts.isClassDeclaration(node) && node.name) {
          if (!this.isPascalCase(node.name.text)) {
            const { line, character } = ast.getLineAndCharacterOfPosition(node.getStart());
            findings.push({
              analyzer: this.name,
              severity: Severity.WARNING,
              file: filePath,
              line: line + 1,
              column: character + 1,
              message: `Class '${node.name.text}' should use PascalCase naming`,
              rule: 'naming-convention'
            });
          }
        }

        if (ts.isInterfaceDeclaration(node) && node.name) {
          if (!this.isPascalCase(node.name.text) || !node.name.text.startsWith('I')) {
            const { line, character } = ast.getLineAndCharacterOfPosition(node.getStart());
            findings.push({
              analyzer: this.name,
              severity: Severity.INFO,
              file: filePath,
              line: line + 1,
              column: character + 1,
              message: `Interface '${node.name.text}' should use PascalCase and consider prefixing with 'I'`,
              rule: 'naming-convention'
            });
          }
        }
      });
    }

    return findings;
  }

  /**
   * Validate file structure
   */
  private validateFileStructure(filePath: string, _content: string, _ast?: ts.SourceFile): ReviewFinding[] {
    const findings: ReviewFinding[] = [];
    const relativePath = path.relative(process.cwd(), filePath);
    const parts = relativePath.split(path.sep);

    // Check for files in wrong directories
    const structureRules = [
      { file: /Controller\.(ts|js)$/, expectedDir: 'controllers' },
      { file: /Service\.(ts|js)$/, expectedDir: 'services' },
      { file: /Repository\.(ts|js)$/, expectedDir: 'repositories' },
      { file: /\.test\.(ts|tsx|js|jsx)$/, expectedDir: '__tests__' },
      { file: /\.spec\.(ts|tsx|js|jsx)$/, expectedDir: '__tests__' }
    ];

    for (const rule of structureRules) {
      if (rule.file.test(filePath)) {
        const hasExpectedDir = parts.some(part => part === rule.expectedDir);
        if (!hasExpectedDir) {
          findings.push({
            analyzer: this.name,
            severity: Severity.WARNING,
            file: filePath,
            message: `File should be in a '${rule.expectedDir}' directory`,
            rule: 'file-structure'
          });
        }
      }
    }

    return findings;
  }

  /**
   * Validate dependency injection
   */
  private validateDependencyInjection(filePath: string, _content: string, ast?: ts.SourceFile): ReviewFinding[] {
    const findings: ReviewFinding[] = [];
    
    if (!ast || !filePath.match(/Service\.(ts|js)$/)) return findings;

    // Check for constructor injection in service classes
    ast.forEachChild(node => {
      if (ts.isClassDeclaration(node)) {
        let hasConstructor = false;
        let hasDirectInstantiation = false;

        node.members.forEach(member => {
          if (ts.isConstructorDeclaration(member)) {
            hasConstructor = true;
          }
          
          if (ts.isPropertyDeclaration(member) && member.initializer) {
            // Check for direct instantiation of dependencies
            if (ts.isNewExpression(member.initializer)) {
              hasDirectInstantiation = true;
            }
          }
        });

        if (hasDirectInstantiation) {
          const { line, character } = ast.getLineAndCharacterOfPosition(node.getStart());
          findings.push({
            analyzer: this.name,
            severity: Severity.WARNING,
            file: filePath,
            line: line + 1,
            column: character + 1,
            message: 'Service classes should use dependency injection instead of direct instantiation',
            rule: 'dependency-injection',
            documentation: 'https://en.wikipedia.org/wiki/Dependency_injection'
          });
        }
      }
    });

    return findings;
  }

  /**
   * Validate single responsibility principle
   */
  private validateSingleResponsibility(filePath: string, content: string, ast?: ts.SourceFile): ReviewFinding[] {
    const findings: ReviewFinding[] = [];
    
    if (!ast) return findings;

    // Check file length (too long files often violate SRP)
    const lines = content.split('\n').length;
    if (lines > 300) {
      findings.push({
        analyzer: this.name,
        severity: Severity.WARNING,
        file: filePath,
        message: `File has ${lines} lines. Consider splitting into smaller, more focused modules`,
        rule: 'single-responsibility'
      });
    }

    // Check class complexity
    ast.forEachChild(node => {
      if (ts.isClassDeclaration(node) && node.name) {
        const publicMethods = node.members.filter(member => 
          ts.isMethodDeclaration(member) && 
          !member.modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword)
        );

        if (publicMethods.length > 10) {
          const { line, character } = ast.getLineAndCharacterOfPosition(node.getStart());
          findings.push({
            analyzer: this.name,
            severity: Severity.WARNING,
            file: filePath,
            line: line + 1,
            column: character + 1,
            message: `Class '${node.name.text}' has ${publicMethods.length} public methods. Consider splitting responsibilities`,
            rule: 'single-responsibility'
          });
        }
      }
    });

    return findings;
  }

  /**
   * Validate interface segregation principle
   */
  private validateInterfaceSegregation(filePath: string, _content: string, ast?: ts.SourceFile): ReviewFinding[] {
    const findings: ReviewFinding[] = [];
    
    if (!ast) return findings;

    // Check for large interfaces
    ast.forEachChild(node => {
      if (ts.isInterfaceDeclaration(node) && node.name) {
        const memberCount = node.members.length;
        
        if (memberCount > 5) {
          const { line, character } = ast.getLineAndCharacterOfPosition(node.getStart());
          findings.push({
            analyzer: this.name,
            severity: Severity.INFO,
            file: filePath,
            line: line + 1,
            column: character + 1,
            message: `Interface '${node.name.text}' has ${memberCount} members. Consider splitting into smaller, more specific interfaces`,
            rule: 'interface-segregation'
          });
        }
      }
    });

    return findings;
  }

  /**
   * Validate atomic design pattern
   */
  private validateAtomicDesign(filePath: string, _content: string, ast?: ts.SourceFile): ReviewFinding[] {
    const findings: ReviewFinding[] = [];
    
    // Only check React component files
    if (!filePath.match(/\.(tsx|jsx)$/)) return findings;

    const atomicLevels = ['atoms', 'molecules', 'organisms', 'templates', 'pages'];
    const fileLevel = atomicLevels.find(level => filePath.includes(`/${level}/`));

    if (fileLevel && ast) {
      // Check imports follow atomic design hierarchy
      ast.forEachChild(node => {
        if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          const importPath = node.moduleSpecifier.text;
          
          // Check if importing from a higher level
          const importLevel = atomicLevels.find(level => importPath.includes(`/${level}/`));
          if (importLevel) {
            const currentIndex = atomicLevels.indexOf(fileLevel);
            const importIndex = atomicLevels.indexOf(importLevel);
            
            if (importIndex > currentIndex) {
              const { line, character } = ast.getLineAndCharacterOfPosition(node.getStart());
              findings.push({
                analyzer: this.name,
                severity: Severity.WARNING,
                file: filePath,
                line: line + 1,
                column: character + 1,
                message: `Atomic design violation: ${fileLevel} should not import from ${importLevel}`,
                rule: 'atomic-design',
                documentation: 'https://bradfrost.com/blog/post/atomic-web-design/'
              });
            }
          }
        }
      });
    }

    return findings;
  }

  /**
   * Perform cross-file analysis
   */
  private async performCrossFileAnalysis(files: string[]): Promise<ReviewFinding[]> {
    const findings: ReviewFinding[] = [];

    // Build dependency graph
    const dependencyGraph = new Map<string, Set<string>>();
    
    for (const file of files) {
      if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const imports = this.extractImports(content);
          dependencyGraph.set(file, new Set(imports));
        } catch (error) {
          // Skip file if can't read
        }
      }
    }

    // Check for potential circular dependencies (simplified)
    for (const [file, imports] of dependencyGraph.entries()) {
      for (const importPath of imports) {
        const resolvedImport = this.resolveImportPath(file, importPath);
        const importDeps = dependencyGraph.get(resolvedImport);
        
        if (importDeps?.has(file)) {
          findings.push({
            analyzer: this.name,
            severity: Severity.ERROR,
            file: file,
            message: `Potential circular dependency detected between ${file} and ${resolvedImport}`,
            rule: 'circular-dependency'
          });
        }
      }
    }

    return findings;
  }

  /**
   * Helper methods
   */
  private determineLayer(filePath: string): string | null {
    const layers = ['controllers', 'services', 'repositories', 'components', 'models', 'utils'];
    
    for (const layer of layers) {
      if (filePath.includes(`/${layer}/`)) {
        return layer;
      }
    }
    
    return null;
  }

  private isPascalCase(str: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str);
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+(?:.*\s+from\s+)?['"]([^'"]+)['"]/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  private resolveImportPath(fromFile: string, importPath: string): string {
    if (!importPath.startsWith('.')) {
      return importPath; // External module
    }
    
    const fromDir = path.dirname(fromFile);
    return path.resolve(fromDir, importPath);
  }
}

// Export singleton instance
export const architectureAnalyzer = new ArchitectureAnalyzer();