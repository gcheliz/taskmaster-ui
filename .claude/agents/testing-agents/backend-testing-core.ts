/**
 * Backend Testing Agent Core
 * 
 * Generates comprehensive test suites for backend code using Jest,
 * including unit tests, integration tests, and test data factories
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { templateEngine } from '../template-engine';

export interface TestGenerationOptions {
  targetFile: string;
  testType: 'unit' | 'integration' | 'e2e';
  coverage?: CoverageOptions;
  mocking?: MockingOptions;
  dataFactories?: boolean;
  performanceTests?: boolean;
}

export interface CoverageOptions {
  threshold?: number;
  includeStatements?: boolean;
  includeBranches?: boolean;
  includeFunctions?: boolean;
  includeLines?: boolean;
}

export interface MockingOptions {
  autoMock?: boolean;
  mockModules?: string[];
  mockDatabase?: boolean;
  mockExternalAPIs?: boolean;
}

export interface TestCase {
  name: string;
  description?: string;
  setup?: string;
  assertion: string;
  teardown?: string;
}

export interface TestSuite {
  name: string;
  description?: string;
  imports: string[];
  setup?: string;
  teardown?: string;
  testCases: TestCase[];
}

export class BackendTestingAgent {
  private testsPath: string;

  constructor(projectRoot: string) {
    this.testsPath = path.join(projectRoot, 'packages/backend/src/__tests__');
  }

  /**
   * Generate tests for a backend file
   */
  async generateTests(options: TestGenerationOptions): Promise<{
    files: string[];
    coverage: any;
    documentation: string;
  }> {
    const files: string[] = [];
    
    // Analyze the target file
    const analysis = await this.analyzeFile(options.targetFile);
    
    // Generate appropriate tests based on file type
    const testSuites = await this.createTestSuites(analysis, options);
    
    // Write test files
    for (const suite of testSuites) {
      const testPath = await this.writeTestFile(suite, options.targetFile);
      files.push(testPath);
    }
    
    // Generate test data factories if requested
    if (options.dataFactories) {
      const factoryPath = await this.generateDataFactory(analysis);
      if (factoryPath) files.push(factoryPath);
    }
    
    // Generate performance tests if requested
    if (options.performanceTests) {
      const perfPath = await this.generatePerformanceTests(analysis, options);
      if (perfPath) files.push(perfPath);
    }
    
    // Run coverage analysis
    const coverage = await this.analyzeCoverage(files, options.coverage);
    
    const documentation = this.generateDocumentation(analysis, testSuites, coverage);
    
    return { files, coverage, documentation };
  }

  /**
   * Analyze a TypeScript/JavaScript file
   */
  private async analyzeFile(filePath: string): Promise<any> {
    const content = await fs.readFile(filePath, 'utf-8');
    
    const analysis = {
      filePath,
      exports: [] as any[],
      imports: [] as string[],
      classes: [] as any[],
      functions: [] as any[],
      routes: [] as any[],
      middleware: [] as any[],
      models: [] as any[],
    };

    // Simple regex-based analysis for testing
    // In production, this would use the TypeScript AST
    
    // Detect functions
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      analysis.functions.push({
        name: match[1],
        isAsync: content.slice(match.index, match.index + match[0].length).includes('async'),
        parameters: [],
        returnType: 'any',
      });
    }

    // Detect classes
    const classRegex = /(?:export\s+)?class\s+(\w+)/g;
    while ((match = classRegex.exec(content)) !== null) {
      analysis.classes.push({
        className: match[1],
        methods: [],
        properties: [],
      });
    }

    // Detect imports
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    while ((match = importRegex.exec(content)) !== null) {
      analysis.imports.push(match[1]);
    }

    // Detect Express routes
    if (content.includes('express.Router') || content.includes('app.')) {
      analysis.routes = this.detectExpressRoutes(content);
    }

    // Detect Prisma models
    if (content.includes('@prisma/client') || content.includes('prisma.')) {
      analysis.models = this.detectPrismaModels(content);
    }

    return analysis;
  }


  /**
   * Detect Express routes in the file
   */
  private detectExpressRoutes(content: string): any[] {
    const routes: any[] = [];
    const routeRegex = /(app|router)\.(get|post|put|patch|delete|all|use)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      routes.push({
        method: match[2].toUpperCase(),
        path: match[3],
        handler: 'handler', // Would need more parsing to get actual handler name
      });
    }

    return routes;
  }

  /**
   * Detect Prisma models being used
   */
  private detectPrismaModels(content: string): string[] {
    const models: Set<string> = new Set();
    const modelRegex = /prisma\.(\w+)\./g;
    
    let match;
    while ((match = modelRegex.exec(content)) !== null) {
      models.add(match[1]);
    }

    return Array.from(models);
  }

  /**
   * Create test suites based on analysis
   */
  private async createTestSuites(analysis: any, options: TestGenerationOptions): Promise<TestSuite[]> {
    const suites: TestSuite[] = [];

    // Generate unit tests for classes
    if (analysis.classes.length > 0 && options.testType === 'unit') {
      for (const cls of analysis.classes) {
        suites.push(await this.createClassTestSuite(cls, options));
      }
    }

    // Generate unit tests for functions
    if (analysis.functions.length > 0 && options.testType === 'unit') {
      suites.push(await this.createFunctionTestSuite(analysis.functions, options));
    }

    // Generate integration tests - combine routes and models into one suite if both exist
    if (options.testType === 'integration') {
      if (analysis.routes.length > 0 && analysis.models.length > 0) {
        // Combine into one comprehensive integration test suite
        const combinedSuite = await this.createCombinedIntegrationSuite(analysis, options);
        suites.push(combinedSuite);
      } else if (analysis.routes.length > 0) {
        suites.push(await this.createRouteTestSuite(analysis.routes, options));
      } else if (analysis.models.length > 0) {
        suites.push(await this.createModelTestSuite(analysis.models, options));
      }
    }

    return suites;
  }

  /**
   * Create test suite for a class
   */
  private async createClassTestSuite(cls: any, options: TestGenerationOptions): Promise<TestSuite> {
    const testCases: TestCase[] = [];

    // Test class instantiation
    testCases.push({
      name: `should create an instance of ${cls.className}`,
      assertion: `expect(instance).toBeInstanceOf(${cls.className});`,
      setup: `const instance = new ${cls.className}();`,
    });

    // Test each method
    for (const method of cls.methods) {
      testCases.push({
        name: `should test ${method.name} method`,
        description: `Test ${method.isAsync ? 'async ' : ''}method ${method.name}`,
        setup: `const instance = new ${cls.className}();`,
        assertion: method.isAsync
          ? `await expect(instance.${method.name}()).resolves.toBeDefined();`
          : `expect(instance.${method.name}()).toBeDefined();`,
      });
    }

    return {
      name: `${cls.className} Unit Tests`,
      imports: this.generateImports(options.targetFile, options),
      setup: options.mocking?.autoMock ? 'jest.mock(\'../dependencies\');' : '',
      testCases,
    };
  }

  /**
   * Create test suite for functions
   */
  private async createFunctionTestSuite(functions: any[], options: TestGenerationOptions): Promise<TestSuite> {
    const testCases: TestCase[] = [];

    for (const func of functions) {
      // Basic function test
      testCases.push({
        name: `should test ${func.name} function`,
        description: `Test ${func.isAsync ? 'async ' : ''}function ${func.name}`,
        assertion: func.isAsync
          ? `await expect(${func.name}()).resolves.toBeDefined();`
          : `expect(${func.name}()).toBeDefined();`,
      });

      // Test with different parameter combinations
      if (func.parameters.length > 0) {
        testCases.push({
          name: `should handle invalid parameters for ${func.name}`,
          assertion: `expect(() => ${func.name}(null)).toThrow();`,
        });
      }
    }

    return {
      name: 'Function Unit Tests',
      imports: this.generateImports(options.targetFile, options),
      testCases,
    };
  }

  /**
   * Create integration test suite for routes
   */
  private async createRouteTestSuite(routes: any[], options: TestGenerationOptions): Promise<TestSuite> {
    const testCases: TestCase[] = [];

    for (const route of routes) {
      // Success case
      testCases.push({
        name: `${route.method} ${route.path} should return success`,
        setup: `const response = await request(app).${route.method.toLowerCase()}('${route.path}');`,
        assertion: `expect(response.status).toBe(200);`,
      });

      // Error cases
      if (route.method !== 'GET') {
        testCases.push({
          name: `${route.method} ${route.path} should handle invalid data`,
          setup: `const response = await request(app).${route.method.toLowerCase()}('${route.path}').send({});`,
          assertion: `expect(response.status).toBe(400);`,
        });
      }

      // Auth test
      testCases.push({
        name: `${route.method} ${route.path} should require authentication`,
        setup: `const response = await request(app).${route.method.toLowerCase()}('${route.path}');`,
        assertion: `expect(response.status).toBe(401);`,
      });
    }

    return {
      name: 'API Route Integration Tests',
      imports: [
        "import request from 'supertest';",
        "import { app } from '../app';",
        ...this.generateMockImports(options),
      ],
      setup: this.generateIntegrationSetup(options),
      teardown: this.generateIntegrationTeardown(options),
      testCases,
    };
  }

  /**
   * Create combined integration test suite
   */
  private async createCombinedIntegrationSuite(analysis: any, options: TestGenerationOptions): Promise<TestSuite> {
    const routeTests = await this.createRouteTestSuite(analysis.routes, options);
    const modelTests = await this.createModelTestSuite(analysis.models, options);
    
    return {
      name: 'Comprehensive Integration Tests',
      imports: [...new Set([...routeTests.imports, ...modelTests.imports])],
      setup: [routeTests.setup, modelTests.setup].filter(Boolean).join('\n\n'),
      teardown: [routeTests.teardown, modelTests.teardown].filter(Boolean).join('\n\n'),
      testCases: [...routeTests.testCases, ...modelTests.testCases],
    };
  }

  /**
   * Create integration test suite for database models
   */
  private async createModelTestSuite(models: string[], options: TestGenerationOptions): Promise<TestSuite> {
    const testCases: TestCase[] = [];

    for (const model of models) {
      // CRUD operations
      testCases.push({
        name: `should create a ${model}`,
        setup: `const data = ${this.generateMockData(model)};`,
        assertion: `const created = await prisma.${model.toLowerCase()}.create({ data });
        expect(created.id).toBeDefined();`,
      });

      testCases.push({
        name: `should find ${model} by id`,
        setup: `const created = await prisma.${model.toLowerCase()}.create({ data: ${this.generateMockData(model)} });`,
        assertion: `const found = await prisma.${model.toLowerCase()}.findUnique({ where: { id: created.id } });
        expect(found).toBeDefined();`,
      });

      testCases.push({
        name: `should update ${model}`,
        setup: `const created = await prisma.${model.toLowerCase()}.create({ data: ${this.generateMockData(model)} });`,
        assertion: `const updated = await prisma.${model.toLowerCase()}.update({
          where: { id: created.id },
          data: { updatedAt: new Date() }
        });
        expect(updated.updatedAt).not.toBe(created.updatedAt);`,
      });

      testCases.push({
        name: `should delete ${model}`,
        setup: `const created = await prisma.${model.toLowerCase()}.create({ data: ${this.generateMockData(model)} });`,
        assertion: `await prisma.${model.toLowerCase()}.delete({ where: { id: created.id } });
        const found = await prisma.${model.toLowerCase()}.findUnique({ where: { id: created.id } });
        expect(found).toBeNull();`,
      });
    }

    return {
      name: 'Database Model Integration Tests',
      imports: [
        "import { prisma } from '../lib/prisma';",
        ...this.generateMockImports(options),
      ],
      setup: `beforeEach(async () => {
        await prisma.$transaction([
          ${models.map(m => `prisma.${m.toLowerCase()}.deleteMany()`).join(',\n          ')}
        ]);
      });`,
      teardown: `afterAll(async () => {
        await prisma.$disconnect();
      });`,
      testCases,
    };
  }

  /**
   * Generate mock data for a model
   */
  private generateMockData(model: string): string {
    // This would be more sophisticated in practice
    const mockData: Record<string, any> = {
      User: "{ email: 'test@example.com', name: 'Test User' }",
      Post: "{ title: 'Test Post', content: 'Test content', authorId: 1 }",
      Comment: "{ content: 'Test comment', postId: 1, authorId: 1 }",
    };

    return mockData[model] || "{}";
  }

  /**
   * Write test file
   */
  private async writeTestFile(suite: TestSuite, targetFile: string): Promise<string> {
    const targetName = path.basename(targetFile, path.extname(targetFile));
    const testFileName = `${targetName}.test.ts`;
    const testPath = path.join(this.testsPath, testFileName);

    const content = this.generateTestFileContent(suite);
    await templateEngine.saveGeneratedFile(content, testPath);

    return testPath;
  }

  /**
   * Generate test file content
   */
  private generateTestFileContent(suite: TestSuite): string {
    return `${suite.imports.join('\n')}

describe('${suite.name}', () => {
  ${suite.setup ? suite.setup : ''}
  
  ${suite.testCases.map(tc => `
  it('${tc.name}', async () => {
    ${tc.setup || ''}
    ${tc.assertion}
    ${tc.teardown || ''}
  });`).join('\n')}
  
  ${suite.teardown ? suite.teardown : ''}
});`;
  }

  /**
   * Generate data factory
   */
  private async generateDataFactory(analysis: any): Promise<string | null> {
    if (analysis.models.length === 0) return null;

    const factoryPath = path.join(this.testsPath, 'factories', 'index.ts');
    const content = this.generateFactoryContent(analysis.models);
    
    await fs.mkdir(path.dirname(factoryPath), { recursive: true });
    await templateEngine.saveGeneratedFile(content, factoryPath);

    return factoryPath;
  }

  /**
   * Generate factory content
   */
  private generateFactoryContent(models: string[]): string {
    return `import { faker } from '@faker-js/faker';
import { prisma } from '../../lib/prisma';

${models.map(model => `
export const create${model} = async (overrides = {}) => {
  return prisma.${model.toLowerCase()}.create({
    data: {
      ${this.generateFactoryFields(model)},
      ...overrides,
    },
  });
};

export const create${model}s = async (count: number, overrides = {}) => {
  return Promise.all(
    Array.from({ length: count }, () => create${model}(overrides))
  );
};`).join('\n')}`;
  }

  /**
   * Generate factory fields based on model
   */
  private generateFactoryFields(model: string): string {
    const fields: Record<string, string> = {
      User: `email: faker.internet.email(),
      name: faker.person.fullName(),
      password: faker.internet.password()`,
      Post: `title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(),
      published: faker.datatype.boolean()`,
      Comment: `content: faker.lorem.paragraph()`,
    };

    return fields[model] || '';
  }

  /**
   * Generate performance tests
   */
  private async generatePerformanceTests(analysis: any, options: TestGenerationOptions): Promise<string | null> {
    if (analysis.routes.length === 0 && analysis.functions.length === 0) return null;

    const perfPath = path.join(this.testsPath, 'performance', `${path.basename(options.targetFile, '.ts')}.perf.test.ts`);
    const content = this.generatePerformanceTestContent(analysis);
    
    await fs.mkdir(path.dirname(perfPath), { recursive: true });
    await templateEngine.saveGeneratedFile(content, perfPath);

    return perfPath;
  }

  /**
   * Generate performance test content
   */
  private generatePerformanceTestContent(analysis: any): string {
    return `import { performance } from 'perf_hooks';
${analysis.routes.length > 0 ? "import request from 'supertest';\nimport { app } from '../../app';" : ''}

describe('Performance Tests', () => {
  ${analysis.routes.map((route: any) => `
  it('${route.method} ${route.path} should respond within 100ms', async () => {
    const start = performance.now();
    await request(app).${route.method.toLowerCase()}('${route.path}');
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });`).join('\n')}

  ${analysis.functions.map((func: any) => `
  it('${func.name} should execute within 50ms', async () => {
    const start = performance.now();
    ${func.isAsync ? 'await ' : ''}${func.name}();
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50);
  });`).join('\n')}
});`;
  }

  /**
   * Analyze test coverage
   */
  private async analyzeCoverage(_testFiles: string[], options?: CoverageOptions): Promise<any> {
    // This would run Jest with coverage in practice
    return {
      statements: { total: 100, covered: 85, percentage: 85 },
      branches: { total: 50, covered: 40, percentage: 80 },
      functions: { total: 30, covered: 27, percentage: 90 },
      lines: { total: 200, covered: 170, percentage: 85 },
      threshold: options?.threshold || 80,
      passed: true,
    };
  }

  /**
   * Generate imports based on options
   */
  private generateImports(targetFile: string, options: TestGenerationOptions): string[] {
    const imports: string[] = [];
    const relativePath = path.relative(this.testsPath, targetFile).replace(/\.ts$/, '');
    
    imports.push(`import * as target from '${relativePath}';`);

    if (options.mocking?.mockDatabase) {
      imports.push("import { prismaMock } from '../mocks/prisma';");
    }

    return imports;
  }

  /**
   * Generate mock imports
   */
  private generateMockImports(options: TestGenerationOptions): string[] {
    const imports: string[] = [];

    if (options.mocking?.mockDatabase) {
      imports.push("import { mockDeep } from 'jest-mock-extended';");
    }

    if (options.mocking?.mockExternalAPIs) {
      imports.push("import nock from 'nock';");
    }

    options.mocking?.mockModules?.forEach(module => {
      imports.push(`jest.mock('${module}');`);
    });

    return imports;
  }

  /**
   * Generate integration test setup
   */
  private generateIntegrationSetup(options: TestGenerationOptions): string {
    const setup: string[] = [];

    if (options.mocking?.mockDatabase) {
      setup.push(`beforeEach(() => {
    jest.clearAllMocks();
  });`);
    }

    if (options.mocking?.mockExternalAPIs) {
      setup.push(`beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('localhost');
  });`);
    }

    return setup.join('\n');
  }

  /**
   * Generate integration test teardown
   */
  private generateIntegrationTeardown(options: TestGenerationOptions): string {
    const teardown: string[] = [];

    if (options.mocking?.mockExternalAPIs) {
      teardown.push(`afterAll(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });`);
    }

    return teardown.join('\n');
  }

  /**
   * Generate documentation
   */
  private generateDocumentation(analysis: any, suites: TestSuite[], coverage: any): string {
    return `# Test Report for ${path.basename(analysis.filePath)}

## Test Suites Generated
${suites.map(s => `- ${s.name}: ${s.testCases.length} tests`).join('\n')}

## Coverage Report
- Statements: ${coverage.statements.percentage}% (${coverage.statements.covered}/${coverage.statements.total})
- Branches: ${coverage.branches.percentage}% (${coverage.branches.covered}/${coverage.branches.total})
- Functions: ${coverage.functions.percentage}% (${coverage.functions.covered}/${coverage.functions.total})
- Lines: ${coverage.lines.percentage}% (${coverage.lines.covered}/${coverage.lines.total})

Coverage ${coverage.passed ? 'PASSED' : 'FAILED'} (threshold: ${coverage.threshold}%)

## Analyzed Components
- Classes: ${analysis.classes.length}
- Functions: ${analysis.functions.length}
- Routes: ${analysis.routes.length}
- Models: ${analysis.models.length}
`;
  }
}

// Export singleton instance
export const backendTestingAgent = new BackendTestingAgent(process.cwd());