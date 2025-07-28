/**
 * Intelligent Test System
 * 
 * Combines test intelligence and mock generation to create comprehensive
 * test suites with automatic mocking and edge case detection
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { testIntelligence, CodeAnalysis, TestScenario } from './test-intelligence';
import { mockGenerator, MockGeneratorOptions, DataGenerationOptions } from './mock-generator';
import { backendTestingAgent } from './backend-testing-core';
import { frontendTestingAgent } from './frontend-testing-core';
import { templateEngine } from '../template-engine';

export interface IntelligentTestOptions {
  targetFile: string;
  testType: 'unit' | 'integration' | 'e2e' | 'all';
  framework: 'jest' | 'vitest' | 'playwright';
  coverage?: CoverageRequirements;
  mocking?: MockingPreferences;
  dataGeneration?: DataGenerationPreferences;
  edgeCases?: boolean;
  performance?: boolean;
}

export interface CoverageRequirements {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface MockingPreferences {
  strategy: 'minimal' | 'comprehensive' | 'smart';
  externalOnly?: boolean;
  databases?: 'in-memory' | 'container' | 'stub';
  apis?: 'record' | 'stub' | 'mock-server';
}

export interface DataGenerationPreferences {
  realistic: boolean;
  locale?: string;
  seed?: number;
  factories?: boolean;
  builders?: boolean;
}

export interface TestGenerationResult {
  analysis: CodeAnalysis;
  scenarios: TestScenario[];
  mocks: any[];
  factories: any[];
  files: GeneratedFile[];
  coverage: CoverageReport;
  documentation: string;
}

export interface GeneratedFile {
  path: string;
  type: 'test' | 'mock' | 'factory' | 'helper';
  content: string;
}

export interface CoverageReport {
  estimated: CoverageRequirements;
  gaps: CoverageGap[];
  recommendations: string[];
}

export interface CoverageGap {
  type: 'branch' | 'function' | 'edge-case' | 'error-handling';
  location: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export class IntelligentTestSystem {
  /**
   * Generate intelligent tests for a file
   */
  async generateIntelligentTests(options: IntelligentTestOptions): Promise<TestGenerationResult> {
    // Analyze the code
    const analysis = await testIntelligence.analyzeCode(options.targetFile);
    
    // Generate test scenarios
    const scenarios = await testIntelligence.generateTestScenarios(analysis);
    
    // Filter scenarios based on test type
    const filteredScenarios = this.filterScenarios(scenarios, options);
    
    // Generate mocks
    const mocks = await this.generateSmartMocks(analysis, filteredScenarios, options);
    
    // Generate data factories
    const factories = await this.generateDataFactories(analysis, options);
    
    // Generate test files
    const files = await this.generateTestFiles(analysis, filteredScenarios, mocks, factories, options);
    
    // Analyze coverage
    const coverage = this.analyzeCoverage(analysis, filteredScenarios);
    
    // Generate documentation
    const documentation = this.generateDocumentation(analysis, filteredScenarios, coverage);
    
    return {
      analysis,
      scenarios: filteredScenarios,
      mocks,
      factories,
      files,
      coverage,
      documentation,
    };
  }

  /**
   * Filter scenarios based on test type
   */
  private filterScenarios(scenarios: TestScenario[], options: IntelligentTestOptions): TestScenario[] {
    if (options.testType === 'all') return scenarios;
    
    return scenarios.filter(scenario => {
      if (options.testType === 'unit') {
        return scenario.type === 'unit' || scenario.type === 'edge-case';
      }
      if (options.testType === 'integration') {
        return scenario.type === 'integration';
      }
      if (options.testType === 'e2e') {
        return scenario.type === 'integration' || scenario.type === 'performance';
      }
      return true;
    });
  }

  /**
   * Generate smart mocks based on analysis
   */
  private async generateSmartMocks(
    analysis: CodeAnalysis,
    scenarios: TestScenario[],
    options: IntelligentTestOptions
  ): Promise<any[]> {
    const mocks: any[] = [];
    
    // Analyze which dependencies need mocking
    const mockTargets = this.identifyMockTargets(analysis, scenarios, options);
    
    for (const target of mockTargets) {
      const mockOptions: MockGeneratorOptions = {
        type: options.testType,
        framework: options.framework as any,
        target: {
          module: target.module,
          functions: target.functions,
        },
        strategy: target.strategy,
      };
      
      const generatedMocks = await mockGenerator.generateMocks(mockOptions);
      mocks.push(...generatedMocks);
    }
    
    return mocks;
  }

  /**
   * Identify what needs to be mocked
   */
  private identifyMockTargets(
    analysis: CodeAnalysis,
    scenarios: TestScenario[],
    options: IntelligentTestOptions
  ): any[] {
    const targets: any[] = [];
    const mockingStrategy = options.mocking?.strategy || 'smart';
    
    // Analyze dependencies
    for (const dep of analysis.dependencies) {
      const shouldMock = this.shouldMockDependency(dep, mockingStrategy, options);
      
      if (shouldMock) {
        // Find which functions are actually used in scenarios
        const usedFunctions = this.findUsedFunctions(dep, scenarios);
        
        targets.push({
          module: dep.module,
          functions: usedFunctions,
          strategy: dep.mockStrategy,
        });
      }
    }
    
    return targets;
  }

  /**
   * Determine if dependency should be mocked
   */
  private shouldMockDependency(
    dep: any,
    strategy: string,
    options: IntelligentTestOptions
  ): boolean {
    // External only mocking
    if (options.mocking?.externalOnly && dep.type === 'internal') {
      return false;
    }
    
    switch (strategy) {
      case 'minimal':
        // Only mock critical dependencies
        return dep.criticalPath || dep.type === 'system';
        
      case 'comprehensive':
        // Mock everything except utilities
        return dep.mockStrategy.type !== 'none';
        
      case 'smart':
      default:
        // Smart detection based on side effects
        return dep.type === 'external' || 
               dep.type === 'system' ||
               dep.mockStrategy.type !== 'none';
    }
  }

  /**
   * Find which functions are used in test scenarios
   */
  private findUsedFunctions(dep: any, scenarios: TestScenario[]): string[] {
    const used = new Set<string>();
    
    for (const scenario of scenarios) {
      // Check mocks in setup
      for (const mock of scenario.setup.mocks) {
        if (mock.target === dep.module && mock.configuration) {
          Object.keys(mock.configuration).forEach(func => used.add(func));
        }
      }
      
      // Check execution steps
      for (const step of scenario.execution.steps) {
        if (step.target?.includes(dep.module)) {
          const funcMatch = step.target.match(/\.(\w+)$/);
          if (funcMatch) used.add(funcMatch[1]);
        }
      }
    }
    
    return Array.from(used);
  }

  /**
   * Generate data factories
   */
  private async generateDataFactories(
    analysis: CodeAnalysis,
    options: IntelligentTestOptions
  ): Promise<any[]> {
    if (!options.dataGeneration?.factories) return [];
    
    const factories: any[] = [];
    
    // Extract data schemas from the code
    const schemas = this.extractDataSchemas(analysis);
    
    for (const schema of schemas) {
      const dataOptions: DataGenerationOptions = {
        type: options.dataGeneration.builders ? 'builder' : 'faker',
        schema: schema.fields,
        locale: options.dataGeneration.locale,
      };
      
      const generatedFactories = await mockGenerator.generateDataFactories(dataOptions);
      factories.push(...generatedFactories);
    }
    
    return factories;
  }

  /**
   * Extract data schemas from analysis
   */
  private extractDataSchemas(analysis: CodeAnalysis): any[] {
    const schemas: any[] = [];
    
    // Extract from classes
    for (const cls of analysis.classes) {
      const schema = {
        name: cls.name,
        fields: {} as any,
      };
      
      for (const prop of cls.properties) {
        schema.fields[prop.name] = {
          type: prop.type,
          nullable: prop.type.includes('?') || prop.type.includes('undefined'),
        };
      }
      
      if (Object.keys(schema.fields).length > 0) {
        schemas.push(schema);
      }
    }
    
    // Extract from interfaces and types
    for (const typeName of [...analysis.patterns.map(p => p.location)]) {
      // Would need more sophisticated type extraction
      // For now, use common patterns
      if (typeName.includes('User') || typeName.includes('Model')) {
        schemas.push({
          name: typeName,
          fields: this.inferSchemaFromName(typeName),
        });
      }
    }
    
    return schemas;
  }

  /**
   * Infer schema from type name
   */
  private inferSchemaFromName(name: string): any {
    const schemas: Record<string, any> = {
      User: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
        createdAt: { type: 'date' },
      },
      Post: {
        id: { type: 'string' },
        title: { type: 'string' },
        content: { type: 'string' },
        authorId: { type: 'string' },
        publishedAt: { type: 'date' },
      },
      Product: {
        id: { type: 'string' },
        name: { type: 'string' },
        price: { type: 'number' },
        description: { type: 'string' },
        stock: { type: 'number' },
      },
    };
    
    // Find closest match
    for (const [key, schema] of Object.entries(schemas)) {
      if (name.includes(key)) return schema;
    }
    
    return {};
  }

  /**
   * Generate test files
   */
  private async generateTestFiles(
    analysis: CodeAnalysis,
    scenarios: TestScenario[],
    mocks: any[],
    factories: any[],
    options: IntelligentTestOptions
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    
    // Group scenarios by type
    const groupedScenarios = this.groupScenarios(scenarios);
    
    // Generate test files for each group
    for (const [type, typeScenarios] of Object.entries(groupedScenarios)) {
      const testContent = await this.generateTestContent(
        analysis,
        typeScenarios,
        mocks,
        factories,
        options
      );
      
      const testPath = this.getTestFilePath(analysis.filePath, type, options);
      
      files.push({
        path: testPath,
        type: 'test',
        content: testContent,
      });
    }
    
    // Generate mock files
    for (const mock of mocks) {
      const mockPath = this.getMockFilePath(mock.name, options);
      files.push({
        path: mockPath,
        type: 'mock',
        content: this.formatMock(mock, options),
      });
    }
    
    // Generate factory files
    for (const factory of factories) {
      const factoryPath = this.getFactoryFilePath(factory.name, options);
      files.push({
        path: factoryPath,
        type: 'factory',
        content: this.formatFactory(factory, options),
      });
    }
    
    // Generate test helpers if needed
    if (this.needsTestHelpers(scenarios)) {
      files.push({
        path: this.getHelperFilePath(options),
        type: 'helper',
        content: this.generateTestHelpers(scenarios, options),
      });
    }
    
    // Save all files
    for (const file of files) {
      await fs.mkdir(path.dirname(file.path), { recursive: true });
      await templateEngine.saveGeneratedFile(file.content, file.path);
    }
    
    return files;
  }

  /**
   * Group scenarios by type
   */
  private groupScenarios(scenarios: TestScenario[]): Record<string, TestScenario[]> {
    const groups: Record<string, TestScenario[]> = {};
    
    for (const scenario of scenarios) {
      const key = scenario.type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(scenario);
    }
    
    return groups;
  }

  /**
   * Generate test content
   */
  private async generateTestContent(
    analysis: CodeAnalysis,
    scenarios: TestScenario[],
    mocks: any[],
    factories: any[],
    options: IntelligentTestOptions
  ): Promise<string> {
    const framework = options.framework;
    
    if (framework === 'jest' || framework === 'vitest') {
      return this.generateJestVitestTests(analysis, scenarios, mocks, factories, options);
    } else if (framework === 'playwright') {
      return this.generatePlaywrightTests(analysis, scenarios, mocks, options);
    }
    
    return '';
  }

  /**
   * Generate Jest/Vitest tests
   */
  private generateJestVitestTests(
    analysis: CodeAnalysis,
    scenarios: TestScenario[],
    mocks: any[],
    factories: any[],
    options: IntelligentTestOptions
  ): string {
    const isVitest = options.framework === 'vitest';
    const importStatement = isVitest 
      ? "import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';"
      : "import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';";
    
    let content = `/**
 * Intelligent tests for ${path.basename(analysis.filePath)}
 * Generated with comprehensive coverage and edge case detection
 */

${importStatement}
`;

    // Add imports for mocks
    for (const mock of mocks) {
      content += `import { ${mock.name} } from './__mocks__/${mock.name}';\n`;
    }
    
    // Add imports for factories
    for (const factory of factories) {
      content += `import { create${factory.name}, build${factory.name} } from './__factories__/${factory.name}';\n`;
    }
    
    // Import the module under test
    const moduleName = path.basename(analysis.filePath, path.extname(analysis.filePath));
    content += `\nimport { ${analysis.functions.map(f => f.name).join(', ')} } from '../${moduleName}';\n\n`;
    
    // Generate describe blocks
    content += `describe('${moduleName}', () => {\n`;
    
    // Group scenarios by function/class
    const byTarget = this.groupByTarget(scenarios);
    
    for (const [target, targetScenarios] of Object.entries(byTarget)) {
      content += `\n  describe('${target}', () => {\n`;
      
      // Add setup/teardown if needed
      const needsSetup = targetScenarios.some(s => s.setup.mocks.length > 0);
      if (needsSetup) {
        content += this.generateSetup(targetScenarios[0], options);
      }
      
      // Generate test cases
      for (const scenario of targetScenarios) {
        content += this.generateTestCase(scenario, options);
      }
      
      content += '  });\n';
    }
    
    content += '});\n';
    
    return content;
  }

  /**
   * Generate Playwright tests
   */
  private generatePlaywrightTests(
    analysis: CodeAnalysis,
    scenarios: TestScenario[],
    mocks: any[],
    options: IntelligentTestOptions
  ): string {
    return `import { test, expect } from '@playwright/test';

test.describe('${path.basename(analysis.filePath)} E2E Tests', () => {
${scenarios.map(scenario => `
  test('${scenario.name}', async ({ page }) => {
    // Setup
    ${this.generatePlaywrightSetup(scenario)}
    
    // Execute
    ${this.generatePlaywrightSteps(scenario)}
    
    // Assert
    ${this.generatePlaywrightAssertions(scenario)}
  });`).join('\n')}
});`;
  }

  /**
   * Group scenarios by target
   */
  private groupByTarget(scenarios: TestScenario[]): Record<string, TestScenario[]> {
    const groups: Record<string, TestScenario[]> = {};
    
    for (const scenario of scenarios) {
      // Extract target from execution steps
      const target = scenario.execution.steps[0]?.target || 'general';
      if (!groups[target]) groups[target] = [];
      groups[target].push(scenario);
    }
    
    return groups;
  }

  /**
   * Generate setup code
   */
  private generateSetup(scenario: TestScenario, options: IntelligentTestOptions): string {
    const isVitest = options.framework === 'vitest';
    
    return `
    beforeEach(() => {
      ${isVitest ? 'vi.clearAllMocks();' : 'jest.clearAllMocks();'}
      ${scenario.setup.mocks.map(mock => 
        `// Setup ${mock.target} mock
      ${this.generateMockSetup(mock, options)}`
      ).join('\n      ')}
    });\n\n`;
  }

  /**
   * Generate mock setup code
   */
  private generateMockSetup(mock: any, options: IntelligentTestOptions): string {
    if (mock.configuration) {
      return Object.entries(mock.configuration)
        .map(([method, config]: [string, any]) => {
          if (config.returns !== undefined) {
            return `${mock.target}.${method}.mockReturnValue(${JSON.stringify(config.returns)});`;
          }
          if (config.throws) {
            return `${mock.target}.${method}.mockRejectedValue(${config.throws});`;
          }
          return '';
        })
        .filter(Boolean)
        .join('\n      ');
    }
    return '';
  }

  /**
   * Generate test case
   */
  private generateTestCase(scenario: TestScenario, options: IntelligentTestOptions): string {
    const timeout = scenario.execution.timeout ? `, ${scenario.execution.timeout}` : '';
    
    return `
    it('${scenario.name}'${timeout}, async () => {
      // Arrange
      ${this.generateTestData(scenario)}
      
      // Act
      ${this.generateTestExecution(scenario)}
      
      // Assert
      ${this.generateTestAssertions(scenario)}
    });\n`;
  }

  /**
   * Generate test data
   */
  private generateTestData(scenario: TestScenario): string {
    return scenario.setup.data
      .map(data => {
        if (data.generator) {
          return `const ${data.variable} = ${this.generateDataValue(data)};`;
        }
        return `const ${data.variable} = ${JSON.stringify(data.value)};`;
      })
      .join('\n      ');
  }

  /**
   * Generate data value with generator
   */
  private generateDataValue(data: any): string {
    switch (data.generator.type) {
      case 'faker':
        return `faker.${data.generator.config.method}()`;
      case 'factory':
        return `create${data.generator.config.factory}()`;
      case 'builder':
        return `a${data.generator.config.builder}().build()`;
      case 'sequence':
        return `Array.from({ length: ${data.generator.config.count} }, (_, i) => i)`;
      default:
        return 'null';
    }
  }

  /**
   * Generate test execution
   */
  private generateTestExecution(scenario: TestScenario): string {
    return scenario.execution.steps
      .map(step => {
        switch (step.action) {
          case 'call':
            const params = step.parameters?.join(', ') || '';
            return `const result = await ${step.target}(${params});`;
          case 'instantiate':
            return `const instance = new ${step.target}(${step.parameters?.join(', ') || ''});`;
          case 'mutate':
            return `instance.${step.target} = ${step.parameters?.[0] || 'newValue'};`;
          default:
            return `// ${step.action}: ${step.expectedBehavior}`;
        }
      })
      .join('\n      ');
  }

  /**
   * Generate test assertions
   */
  private generateTestAssertions(scenario: TestScenario): string {
    return scenario.assertions
      .map(assertion => {
        switch (assertion.type) {
          case 'equality':
            return `expect(${assertion.target}).toBe(${JSON.stringify(assertion.expected)});`;
          case 'truthy':
            return `expect(${assertion.target}).toBeTruthy();`;
          case 'exception':
            return `expect(() => ${assertion.target}).toThrow(${assertion.expected});`;
          case 'side-effect':
            return `expect(${assertion.target}).toHaveBeenCalled();`;
          case 'performance':
            return `// Performance: ${assertion.target} ${assertion.expected}`;
          default:
            return `expect(${assertion.target}).toBe(${assertion.expected});`;
        }
      })
      .join('\n      ');
  }

  /**
   * Generate Playwright setup
   */
  private generatePlaywrightSetup(scenario: TestScenario): string {
    return scenario.setup.mocks
      .map(mock => `await page.route('${mock.target}', route => route.fulfill(${JSON.stringify(mock.configuration)}));`)
      .join('\n    ');
  }

  /**
   * Generate Playwright steps
   */
  private generatePlaywrightSteps(scenario: TestScenario): string {
    return scenario.execution.steps
      .map(step => {
        switch (step.action) {
          case 'goto':
            return `await page.goto('${step.parameters?.[0] || '/'}');`;
          case 'click':
            return `await page.click('${step.target}');`;
          case 'fill':
            return `await page.fill('${step.target}', '${step.parameters?.[0]}');`;
          case 'wait':
            return `await page.waitForTimeout(${step.parameters?.[0] || 1000});`;
          default:
            return `// ${step.action}`;
        }
      })
      .join('\n    ');
  }

  /**
   * Generate Playwright assertions
   */
  private generatePlaywrightAssertions(scenario: TestScenario): string {
    return scenario.assertions
      .map(assertion => `await expect(page.locator('${assertion.target}')).${assertion.expected};`)
      .join('\n    ');
  }

  /**
   * Get test file path
   */
  private getTestFilePath(originalPath: string, type: string, options: IntelligentTestOptions): string {
    const dir = path.dirname(originalPath);
    const base = path.basename(originalPath, path.extname(originalPath));
    const testDir = options.framework === 'playwright' ? 'e2e' : '__tests__';
    
    return path.join(dir, testDir, `${base}.${type}.test.ts`);
  }

  /**
   * Get mock file path
   */
  private getMockFilePath(mockName: string, options: IntelligentTestOptions): string {
    return path.join(process.cwd(), '__mocks__', `${mockName}.ts`);
  }

  /**
   * Get factory file path
   */
  private getFactoryFilePath(factoryName: string, options: IntelligentTestOptions): string {
    return path.join(process.cwd(), '__factories__', `${factoryName}.ts`);
  }

  /**
   * Get helper file path
   */
  private getHelperFilePath(options: IntelligentTestOptions): string {
    return path.join(process.cwd(), '__tests__', 'helpers', 'test-utils.ts');
  }

  /**
   * Check if needs test helpers
   */
  private needsTestHelpers(scenarios: TestScenario[]): boolean {
    return scenarios.some(s => 
      s.setup.environment || 
      s.setup.data.some(d => d.generator) ||
      s.assertions.some(a => a.type === 'performance')
    );
  }

  /**
   * Generate test helpers
   */
  private generateTestHelpers(scenarios: TestScenario[], options: IntelligentTestOptions): string {
    return `/**
 * Test helpers and utilities
 */

import { faker } from '@faker-js/faker';

// Performance testing helper
export async function measurePerformance<T>(
  fn: () => Promise<T>,
  maxDuration: number
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  if (duration > maxDuration) {
    throw new Error(\`Performance budget exceeded: \${duration}ms > \${maxDuration}ms\`);
  }
  
  return { result, duration };
}

// Wait for condition helper
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    if (await condition()) return;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Timeout waiting for condition');
}

// Retry helper
export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Test data seeder
export function seedTestData<T>(count: number, generator: () => T): T[] {
  return Array.from({ length: count }, generator);
}`;
  }

  /**
   * Format mock for output
   */
  private formatMock(mock: any, options: IntelligentTestOptions): string {
    let content = `/**
 * Mock: ${mock.name}
 * Type: ${mock.type}
 */

`;

    content += mock.implementation;
    
    if (mock.helpers) {
      content += '\n\n// Helper functions\n';
      content += mock.helpers.map((h: any) => h.implementation).join('\n\n');
    }
    
    if (mock.setup) {
      content += '\n\n// Setup\n';
      content += mock.setup;
    }
    
    if (mock.teardown) {
      content += '\n\n// Teardown\n';
      content += mock.teardown;
    }
    
    content += `\n\nexport { ${mock.name} };\n`;
    
    return content;
  }

  /**
   * Format factory for output
   */
  private formatFactory(factory: any, options: IntelligentTestOptions): string {
    return factory.implementation + '\n\n' + 
           factory.builders.map((b: any) => 
             `export const ${b.name} = (overrides = {}) => create${factory.name}({ ...${JSON.stringify(b.overrides)}, ...overrides });`
           ).join('\n');
  }

  /**
   * Analyze coverage
   */
  private analyzeCoverage(analysis: CodeAnalysis, scenarios: TestScenario[]): CoverageReport {
    const gaps: CoverageGap[] = [];
    
    // Check branch coverage
    for (const func of analysis.functions) {
      const coveredBranches = new Set<string>();
      
      for (const scenario of scenarios) {
        // Simple check - would need execution analysis for real coverage
        if (scenario.name.includes(func.name)) {
          func.branches.forEach(b => coveredBranches.add(b.condition));
        }
      }
      
      const uncoveredBranches = func.branches.filter(b => !coveredBranches.has(b.condition));
      
      for (const branch of uncoveredBranches) {
        gaps.push({
          type: 'branch',
          location: `${func.name} - ${branch.type}`,
          description: `Uncovered branch: ${branch.condition}`,
          severity: 'medium',
        });
      }
    }
    
    // Check error handling coverage
    for (const func of analysis.functions) {
      if (func.errorHandling.length > 0) {
        const hasErrorTest = scenarios.some(s => 
          s.type === 'error' && s.name.includes(func.name)
        );
        
        if (!hasErrorTest) {
          gaps.push({
            type: 'error-handling',
            location: func.name,
            description: 'Missing error handling tests',
            severity: 'high',
          });
        }
      }
    }
    
    // Check edge case coverage
    const hasEdgeCaseTests = scenarios.some(s => s.type === 'edge-case');
    if (!hasEdgeCaseTests && analysis.complexity.cyclomaticComplexity > 5) {
      gaps.push({
        type: 'edge-case',
        location: 'overall',
        description: 'Complex code lacking edge case tests',
        severity: 'medium',
      });
    }
    
    // Calculate estimated coverage
    const totalBranches = analysis.functions.reduce((sum, f) => sum + f.branches.length, 0);
    const coveredBranches = totalBranches - gaps.filter(g => g.type === 'branch').length;
    
    const estimated: CoverageRequirements = {
      statements: Math.min(95, 80 + scenarios.length),
      branches: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 100,
      functions: (scenarios.length / Math.max(1, analysis.functions.length)) * 100,
      lines: Math.min(90, 75 + scenarios.length * 2),
    };
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(gaps, analysis);
    
    return { estimated, gaps, recommendations };
  }

  /**
   * Generate coverage recommendations
   */
  private generateRecommendations(gaps: CoverageGap[], analysis: CodeAnalysis): string[] {
    const recommendations: string[] = [];
    
    // High severity gaps
    const highSeverityGaps = gaps.filter(g => g.severity === 'high');
    if (highSeverityGaps.length > 0) {
      recommendations.push(
        `Priority: Add ${highSeverityGaps.length} high-priority tests for error handling and critical paths`
      );
    }
    
    // Branch coverage
    const branchGaps = gaps.filter(g => g.type === 'branch');
    if (branchGaps.length > 3) {
      recommendations.push(
        'Consider adding parameterized tests to cover multiple branches efficiently'
      );
    }
    
    // Complexity
    if (analysis.complexity.cyclomaticComplexity > 10) {
      recommendations.push(
        'High complexity detected - consider refactoring or adding integration tests'
      );
    }
    
    // Performance
    if (analysis.risks.some(r => r.type === 'performance')) {
      recommendations.push(
        'Add performance benchmarks for critical paths'
      );
    }
    
    return recommendations;
  }

  /**
   * Generate documentation
   */
  private generateDocumentation(
    analysis: CodeAnalysis,
    scenarios: TestScenario[],
    coverage: CoverageReport
  ): string {
    return `# Intelligent Test Report

## Code Analysis Summary
- **File**: ${analysis.filePath}
- **Functions**: ${analysis.functions.length}
- **Classes**: ${analysis.classes.length}
- **Complexity**: ${analysis.complexity.cyclomaticComplexity}
- **Risk Areas**: ${analysis.risks.length}

## Test Scenarios Generated
- **Total**: ${scenarios.length}
- **Unit Tests**: ${scenarios.filter(s => s.type === 'unit').length}
- **Integration Tests**: ${scenarios.filter(s => s.type === 'integration').length}
- **Edge Cases**: ${scenarios.filter(s => s.type === 'edge-case').length}
- **Error Tests**: ${scenarios.filter(s => s.type === 'error').length}

## Coverage Analysis
- **Statements**: ${coverage.estimated.statements.toFixed(1)}%
- **Branches**: ${coverage.estimated.branches.toFixed(1)}%
- **Functions**: ${coverage.estimated.functions.toFixed(1)}%
- **Lines**: ${coverage.estimated.lines.toFixed(1)}%

## Coverage Gaps
${coverage.gaps.map(gap => 
  `- **${gap.type}** (${gap.severity}): ${gap.description} at ${gap.location}`
).join('\n')}

## Recommendations
${coverage.recommendations.map(rec => `- ${rec}`).join('\n')}

## Test Execution Priority
1. **Critical** (${scenarios.filter(s => s.priority === 'critical').length}): Core functionality and error handling
2. **High** (${scenarios.filter(s => s.priority === 'high').length}): Main paths and integrations
3. **Medium** (${scenarios.filter(s => s.priority === 'medium').length}): Edge cases and validations
4. **Low** (${scenarios.filter(s => s.priority === 'low').length}): Nice-to-have coverage

## Mock Strategy
- External dependencies: ${analysis.dependencies.filter(d => d.type === 'external').length} mocked
- Database operations: ${analysis.dependencies.some(d => d.module.includes('db')) ? 'In-memory mock' : 'N/A'}
- Network requests: ${analysis.dependencies.some(d => d.module.includes('http')) ? 'Stubbed responses' : 'N/A'}

## Next Steps
1. Review and run generated tests
2. Address high-priority coverage gaps
3. Add custom test cases for business logic
4. Set up continuous integration
5. Monitor coverage trends
`;
  }

  /**
   * Auto-trigger test generation based on file changes
   */
  async autoGenerateTests(changedFiles: string[], options: Partial<IntelligentTestOptions>): Promise<void> {
    for (const file of changedFiles) {
      // Skip test files
      if (file.includes('.test.') || file.includes('.spec.')) continue;
      
      // Skip non-source files
      if (!file.match(/\.(ts|tsx|js|jsx)$/)) continue;
      
      const fullOptions: IntelligentTestOptions = {
        targetFile: file,
        testType: 'unit',
        framework: 'vitest',
        ...options,
        mocking: {
          strategy: 'smart',
          ...options.mocking,
        },
        dataGeneration: {
          realistic: true,
          factories: true,
          ...options.dataGeneration,
        },
      };
      
      try {
        const result = await this.generateIntelligentTests(fullOptions);
        console.log(`✅ Generated ${result.files.length} test files for ${file}`);
        
        // Check coverage requirements
        if (options.coverage) {
          const meetsRequirements = 
            result.coverage.estimated.statements >= options.coverage.statements &&
            result.coverage.estimated.branches >= options.coverage.branches &&
            result.coverage.estimated.functions >= options.coverage.functions &&
            result.coverage.estimated.lines >= options.coverage.lines;
          
          if (!meetsRequirements) {
            console.warn(`⚠️  Coverage requirements not met for ${file}`);
            console.log(result.coverage.recommendations.join('\n'));
          }
        }
      } catch (error) {
        console.error(`❌ Failed to generate tests for ${file}:`, error);
      }
    }
  }
}

// Export singleton instance
export const intelligentTestSystem = new IntelligentTestSystem();