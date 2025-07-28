/**
 * Mock Generator
 * 
 * Intelligent mock generation system for creating test doubles,
 * factories, and realistic test data
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { faker } from '@faker-js/faker';

export interface MockGeneratorOptions {
  type: 'unit' | 'integration' | 'e2e';
  framework: 'jest' | 'vitest' | 'mocha';
  target: MockTarget;
  strategy?: MockStrategy;
  data?: DataGenerationOptions;
}

export interface MockTarget {
  module: string;
  functions?: string[];
  classes?: string[];
  dependencies?: string[];
}

export interface MockStrategy {
  type: 'stub' | 'spy' | 'mock' | 'fake' | 'partial';
  behavior?: MockBehavior;
  verification?: VerificationOptions;
}

export interface MockBehavior {
  returnValue?: any;
  throwError?: Error | string;
  sideEffect?: () => void;
  sequence?: any[];
  conditional?: ConditionalResponse[];
  delay?: number;
}

export interface ConditionalResponse {
  condition: (args: any[]) => boolean;
  response: any;
}

export interface VerificationOptions {
  callCount?: number;
  callOrder?: string[];
  arguments?: any[];
  returnValues?: any[];
}

export interface DataGenerationOptions {
  type: 'faker' | 'factory' | 'builder' | 'fixture';
  schema?: DataSchema;
  count?: number;
  locale?: string;
}

export interface DataSchema {
  [key: string]: FieldDefinition;
}

export interface FieldDefinition {
  type: string;
  constraints?: any;
  generator?: string;
  relation?: string;
  nullable?: boolean;
  unique?: boolean;
}

export interface MockDefinition {
  name: string;
  type: string;
  implementation: string;
  setup?: string;
  teardown?: string;
  helpers?: MockHelper[];
}

export interface MockHelper {
  name: string;
  implementation: string;
}

export interface TestDataFactory {
  name: string;
  schema: DataSchema;
  implementation: string;
  builders: TestDataBuilder[];
}

export interface TestDataBuilder {
  name: string;
  baseFactory: string;
  overrides: Record<string, any>;
  traits: string[];
}

export class MockGenerator {
  private mockCache: Map<string, MockDefinition> = new Map();
  private factoryCache: Map<string, TestDataFactory> = new Map();

  /**
   * Generate mocks based on options
   */
  async generateMocks(options: MockGeneratorOptions): Promise<MockDefinition[]> {
    const mocks: MockDefinition[] = [];

    // Analyze target to understand what needs mocking
    const analysis = await this.analyzeTarget(options.target);

    // Generate appropriate mocks
    if (options.type === 'unit') {
      mocks.push(...this.generateUnitMocks(analysis, options));
    } else if (options.type === 'integration') {
      mocks.push(...this.generateIntegrationMocks(analysis, options));
    } else if (options.type === 'e2e') {
      mocks.push(...this.generateE2EMocks(analysis, options));
    }

    return mocks;
  }

  /**
   * Generate test data factories
   */
  async generateDataFactories(options: DataGenerationOptions): Promise<TestDataFactory[]> {
    const factories: TestDataFactory[] = [];

    if (!options.schema) return factories;

    const factoryName = this.generateFactoryName(options.schema);
    const factory: TestDataFactory = {
      name: factoryName,
      schema: options.schema,
      implementation: this.generateFactoryImplementation(options),
      builders: this.generateBuilders(options.schema),
    };

    factories.push(factory);
    this.factoryCache.set(factoryName, factory);

    return factories;
  }

  /**
   * Analyze target module
   */
  private async analyzeTarget(target: MockTarget): Promise<any> {
    try {
      const modulePath = await this.resolveModulePath(target.module);
      const content = await fs.readFile(modulePath, 'utf-8');

      return {
        module: target.module,
        exports: this.extractExports(content),
        dependencies: this.extractDependencies(content),
        types: this.extractTypes(content),
        interfaces: this.extractInterfaces(content),
      };
    } catch (error) {
      // Return minimal analysis if file not found
      return {
        module: target.module,
        exports: target.functions || [],
        dependencies: target.dependencies || [],
        types: [],
        interfaces: [],
      };
    }
  }

  /**
   * Resolve module path
   */
  private async resolveModulePath(module: string): Promise<string> {
    // Try different extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const basePath = path.join(process.cwd(), 'src', module);

    for (const ext of extensions) {
      const fullPath = basePath + ext;
      try {
        await fs.access(fullPath);
        return fullPath;
      } catch {
        // Continue trying
      }
    }

    throw new Error(`Module not found: ${module}`);
  }

  /**
   * Extract exports from module
   */
  private extractExports(content: string): string[] {
    const exports: string[] = [];

    // Named exports
    const namedExportRegex = /export\s+(?:const|let|var|function|class)\s+(\w+)/g;
    let match;
    while ((match = namedExportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    // Export statements
    const exportStmtRegex = /export\s*{\s*([^}]+)\s*}/g;
    while ((match = exportStmtRegex.exec(content)) !== null) {
      const items = match[1].split(',').map(item => item.trim().split(/\s+as\s+/)[0]);
      exports.push(...items);
    }

    return exports;
  }

  /**
   * Extract dependencies
   */
  private extractDependencies(content: string): string[] {
    const deps: string[] = [];

    // Import statements
    const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      deps.push(match[1]);
    }

    // Require statements
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      deps.push(match[1]);
    }

    return [...new Set(deps)];
  }

  /**
   * Extract types
   */
  private extractTypes(content: string): string[] {
    const types: string[] = [];
    const typeRegex = /type\s+(\w+)\s*=/g;
    let match;
    while ((match = typeRegex.exec(content)) !== null) {
      types.push(match[1]);
    }
    return types;
  }

  /**
   * Extract interfaces
   */
  private extractInterfaces(content: string): string[] {
    const interfaces: string[] = [];
    const interfaceRegex = /interface\s+(\w+)/g;
    let match;
    while ((match = interfaceRegex.exec(content)) !== null) {
      interfaces.push(match[1]);
    }
    return interfaces;
  }

  /**
   * Generate unit test mocks
   */
  private generateUnitMocks(analysis: any, options: MockGeneratorOptions): MockDefinition[] {
    const mocks: MockDefinition[] = [];

    // Mock all dependencies
    for (const dep of analysis.dependencies) {
      const mockName = `mock${this.capitalize(path.basename(dep))}`;
      const mock: MockDefinition = {
        name: mockName,
        type: 'dependency',
        implementation: this.generateDependencyMock(dep, options),
        setup: this.generateMockSetup(dep, options),
        teardown: this.generateMockTeardown(dep, options),
        helpers: this.generateMockHelpers(dep, options),
      };
      mocks.push(mock);
    }

    // Mock specific functions if requested
    if (options.target.functions) {
      for (const func of options.target.functions) {
        const mock: MockDefinition = {
          name: `mock${this.capitalize(func)}`,
          type: 'function',
          implementation: this.generateFunctionMock(func, options),
        };
        mocks.push(mock);
      }
    }

    return mocks;
  }

  /**
   * Generate integration test mocks
   */
  private generateIntegrationMocks(analysis: any, options: MockGeneratorOptions): MockDefinition[] {
    const mocks: MockDefinition[] = [];

    // Only mock external dependencies
    const externalDeps = analysis.dependencies.filter((dep: string) => 
      !dep.startsWith('.') && !dep.startsWith('/')
    );

    for (const dep of externalDeps) {
      const mock: MockDefinition = {
        name: `mock${this.capitalize(dep)}`,
        type: 'external',
        implementation: this.generateExternalMock(dep, options),
      };
      mocks.push(mock);
    }

    // Generate database mocks if needed
    if (this.needsDatabaseMock(analysis)) {
      mocks.push(this.generateDatabaseMock(options));
    }

    // Generate API mocks if needed
    if (this.needsApiMock(analysis)) {
      mocks.push(this.generateApiMock(options));
    }

    return mocks;
  }

  /**
   * Generate E2E test mocks
   */
  private generateE2EMocks(analysis: any, options: MockGeneratorOptions): MockDefinition[] {
    const mocks: MockDefinition[] = [];

    // Generate network stubs
    mocks.push({
      name: 'networkStubs',
      type: 'network',
      implementation: this.generateNetworkStubs(options),
      setup: `
// Setup network interception
beforeEach(() => {
  cy.intercept('GET', '/api/**', { fixture: 'api-responses.json' });
  cy.intercept('POST', '/api/**', { statusCode: 201, body: { success: true } });
});`,
    });

    // Generate browser mocks
    if (this.needsBrowserMocks(analysis)) {
      mocks.push({
        name: 'browserMocks',
        type: 'browser',
        implementation: this.generateBrowserMocks(options),
      });
    }

    return mocks;
  }

  /**
   * Generate dependency mock
   */
  private generateDependencyMock(dep: string, options: MockGeneratorOptions): string {
    const framework = options.framework;
    const strategy = options.strategy?.type || 'mock';

    if (framework === 'jest') {
      return this.generateJestMock(dep, strategy, options);
    } else if (framework === 'vitest') {
      return this.generateVitestMock(dep, strategy, options);
    } else {
      return this.generateMochaMock(dep, strategy, options);
    }
  }

  /**
   * Generate Jest mock
   */
  private generateJestMock(dep: string, strategy: string, options: MockGeneratorOptions): string {
    const behavior = options.strategy?.behavior;
    
    let implementation = `jest.mock('${dep}'`;

    if (strategy === 'stub' && behavior?.returnValue !== undefined) {
      implementation += `, () => ({
  default: jest.fn(() => ${JSON.stringify(behavior.returnValue)}),
  __esModule: true,
})`;
    } else if (strategy === 'spy') {
      implementation += `, () => {
  const actual = jest.requireActual('${dep}');
  return {
    ...actual,
    default: jest.fn(actual.default),
  };
}`;
    } else if (strategy === 'fake') {
      implementation += `, () => ({
  default: ${this.generateFakeImplementation(dep)},
  __esModule: true,
})`;
    } else {
      implementation += ');';
    }

    return implementation;
  }

  /**
   * Generate Vitest mock
   */
  private generateVitestMock(dep: string, strategy: string, options: MockGeneratorOptions): string {
    const behavior = options.strategy?.behavior;
    
    let implementation = `vi.mock('${dep}'`;

    if (strategy === 'stub' && behavior?.returnValue !== undefined) {
      implementation += `, () => ({
  default: vi.fn(() => ${JSON.stringify(behavior.returnValue)}),
})`;
    } else if (strategy === 'spy') {
      implementation += `, async () => {
  const actual = await vi.importActual('${dep}');
  return {
    ...actual,
    default: vi.fn(actual.default),
  };
}`;
    } else if (strategy === 'partial') {
      implementation += `, async () => {
  const actual = await vi.importActual('${dep}');
  return {
    ...actual,
    ${options.target.functions?.map(f => `${f}: vi.fn()`).join(',\n    ')}
  };
}`;
    } else {
      implementation += ');';
    }

    return implementation;
  }

  /**
   * Generate Mocha mock
   */
  private generateMochaMock(dep: string, strategy: string, options: MockGeneratorOptions): string {
    return `// Mocha mock using sinon
const ${dep}Stub = sinon.stub();
const ${dep}Mock = proxyquire('./${options.target.module}', {
  '${dep}': ${dep}Stub
});`;
  }

  /**
   * Generate fake implementation
   */
  private generateFakeImplementation(dep: string): string {
    // Common fake implementations
    const fakes: Record<string, string> = {
      'fs': `{
    readFile: (path, callback) => callback(null, 'fake content'),
    writeFile: (path, data, callback) => callback(null),
    unlink: (path, callback) => callback(null),
    mkdir: (path, options, callback) => callback(null),
  }`,
      'axios': `{
    get: (url) => Promise.resolve({ data: { id: 1 }, status: 200 }),
    post: (url, data) => Promise.resolve({ data: { ...data, id: 1 }, status: 201 }),
    put: (url, data) => Promise.resolve({ data, status: 200 }),
    delete: (url) => Promise.resolve({ status: 204 }),
  }`,
      'mongodb': `{
    MongoClient: {
      connect: () => Promise.resolve({
        db: () => ({
          collection: () => ({
            find: () => ({ toArray: () => Promise.resolve([]) }),
            insertOne: (doc) => Promise.resolve({ insertedId: '123' }),
            updateOne: () => Promise.resolve({ modifiedCount: 1 }),
            deleteOne: () => Promise.resolve({ deletedCount: 1 }),
          })
        })
      })
    }
  }`,
    };

    return fakes[dep] || '{}';
  }

  /**
   * Generate mock setup
   */
  private generateMockSetup(dep: string, options: MockGeneratorOptions): string {
    if (options.strategy?.verification) {
      const { callCount, arguments: args } = options.strategy.verification;
      
      return `
// Setup mock expectations
beforeEach(() => {
  ${dep}Mock.resetHistory();
  ${callCount ? `${dep}Mock.callCount = 0;` : ''}
  ${args ? `${dep}Mock.expectedArgs = ${JSON.stringify(args)};` : ''}
});`;
    }

    return '';
  }

  /**
   * Generate mock teardown
   */
  private generateMockTeardown(dep: string, options: MockGeneratorOptions): string {
    if (options.strategy?.verification) {
      return `
// Verify mock expectations
afterEach(() => {
  ${options.strategy.verification.callCount ? 
    `expect(${dep}Mock.callCount).toBe(${options.strategy.verification.callCount});` : ''}
  ${options.strategy.verification.arguments ?
    `expect(${dep}Mock.calledWith(...expectedArgs)).toBe(true);` : ''}
});`;
    }

    return '';
  }

  /**
   * Generate mock helpers
   */
  private generateMockHelpers(dep: string, options: MockGeneratorOptions): MockHelper[] {
    const helpers: MockHelper[] = [];

    if (options.strategy?.behavior?.sequence) {
      helpers.push({
        name: `setup${this.capitalize(dep)}Sequence`,
        implementation: `
function setup${this.capitalize(dep)}Sequence(values) {
  let callIndex = 0;
  ${dep}Mock.mockImplementation(() => {
    const value = values[callIndex % values.length];
    callIndex++;
    return value;
  });
}`,
      });
    }

    if (options.strategy?.behavior?.conditional) {
      helpers.push({
        name: `setup${this.capitalize(dep)}Conditional`,
        implementation: `
function setup${this.capitalize(dep)}Conditional(conditions) {
  ${dep}Mock.mockImplementation((...args) => {
    for (const { condition, response } of conditions) {
      if (condition(args)) {
        return response;
      }
    }
    return undefined;
  });
}`,
      });
    }

    return helpers;
  }

  /**
   * Generate function mock
   */
  private generateFunctionMock(func: string, options: MockGeneratorOptions): string {
    const framework = options.framework;
    const behavior = options.strategy?.behavior;

    let mock = '';

    if (framework === 'jest') {
      mock = `const mock${this.capitalize(func)} = jest.fn()`;
      
      if (behavior?.returnValue !== undefined) {
        mock += `.mockReturnValue(${JSON.stringify(behavior.returnValue)})`;
      } else if (behavior?.throwError) {
        const error = typeof behavior.throwError === 'string' 
          ? `new Error('${behavior.throwError}')`
          : 'new Error()';
        mock += `.mockImplementation(() => { throw ${error}; })`;
      } else if (behavior?.sideEffect) {
        mock += `.mockImplementation(${behavior.sideEffect.toString()})`;
      }
      
      mock += ';';
    } else if (framework === 'vitest') {
      mock = `const mock${this.capitalize(func)} = vi.fn()`;
      
      if (behavior?.returnValue !== undefined) {
        mock += `.mockReturnValue(${JSON.stringify(behavior.returnValue)})`;
      } else if (behavior?.delay) {
        mock += `.mockImplementation(async () => {
  await new Promise(resolve => setTimeout(resolve, ${behavior.delay}));
  return ${JSON.stringify(behavior.returnValue || null)};
})`;
      }
      
      mock += ';';
    }

    return mock;
  }

  /**
   * Generate external mock
   */
  private generateExternalMock(dep: string, options: MockGeneratorOptions): string {
    // Common external dependencies
    const knownMocks: Record<string, string> = {
      'axios': this.generateAxiosMock(options),
      'node-fetch': this.generateFetchMock(options),
      'aws-sdk': this.generateAwsMock(options),
      'redis': this.generateRedisMock(options),
      'nodemailer': this.generateMailerMock(options),
    };

    return knownMocks[dep] || this.generateGenericExternalMock(dep, options);
  }

  /**
   * Generate Axios mock
   */
  private generateAxiosMock(options: MockGeneratorOptions): string {
    return `
import MockAdapter from 'axios-mock-adapter';

const axiosMock = new MockAdapter(axios);

// Setup common responses
axiosMock.onGet(/\\/api\\/users/).reply(200, [
  { id: 1, name: 'Test User' }
]);

axiosMock.onPost(/\\/api\\/users/).reply(201, { 
  id: 2, 
  name: 'New User' 
});

axiosMock.onAny().reply(200);

export { axiosMock };`;
  }

  /**
   * Generate fetch mock
   */
  private generateFetchMock(options: MockGeneratorOptions): string {
    return `
global.fetch = jest.fn();

const mockFetch = (url, options = {}) => {
  const responses = {
    '/api/users': { users: [{ id: 1, name: 'Test' }] },
    '/api/posts': { posts: [] },
  };

  const response = responses[url] || { data: 'mock' };
  
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
  });
};

global.fetch.mockImplementation(mockFetch);`;
  }

  /**
   * Generate AWS mock
   */
  private generateAwsMock(options: MockGeneratorOptions): string {
    return `
import AWSMock from 'aws-sdk-mock';

AWSMock.mock('S3', 'getObject', (params, callback) => {
  callback(null, { Body: Buffer.from('mock data') });
});

AWSMock.mock('S3', 'putObject', (params, callback) => {
  callback(null, { ETag: '"mock-etag"' });
});

AWSMock.mock('DynamoDB', 'get', (params, callback) => {
  callback(null, { Item: { id: { S: '123' } } });
});

export { AWSMock };`;
  }

  /**
   * Generate Redis mock
   */
  private generateRedisMock(options: MockGeneratorOptions): string {
    return `
const redisMock = {
  get: jest.fn((key) => Promise.resolve(JSON.stringify({ cached: true }))),
  set: jest.fn((key, value) => Promise.resolve('OK')),
  del: jest.fn((key) => Promise.resolve(1)),
  expire: jest.fn((key, seconds) => Promise.resolve(1)),
  exists: jest.fn((key) => Promise.resolve(1)),
  hget: jest.fn((key, field) => Promise.resolve('value')),
  hset: jest.fn((key, field, value) => Promise.resolve(1)),
};

export { redisMock };`;
  }

  /**
   * Generate mailer mock
   */
  private generateMailerMock(options: MockGeneratorOptions): string {
    return `
const nodemailerMock = {
  createTransport: jest.fn(() => ({
    sendMail: jest.fn((options) => Promise.resolve({
      messageId: 'mock-message-id',
      accepted: [options.to],
      rejected: [],
      response: '250 OK',
    })),
    verify: jest.fn(() => Promise.resolve(true)),
  })),
};

export { nodemailerMock };`;
  }

  /**
   * Generate generic external mock
   */
  private generateGenericExternalMock(dep: string, options: MockGeneratorOptions): string {
    return `
// Generic mock for ${dep}
const ${dep}Mock = {
  default: jest.fn(),
  // Add common methods based on naming
  ${dep.includes('client') ? 'connect: jest.fn(() => Promise.resolve()),' : ''}
  ${dep.includes('db') ? 'query: jest.fn(() => Promise.resolve({ rows: [] })),' : ''}
  ${dep.includes('api') ? 'request: jest.fn(() => Promise.resolve({ data: {} })),' : ''}
};

export { ${dep}Mock };`;
  }

  /**
   * Check if needs database mock
   */
  private needsDatabaseMock(analysis: any): boolean {
    return analysis.dependencies.some((dep: string) => 
      dep.includes('db') || 
      dep.includes('database') || 
      dep.includes('mongo') || 
      dep.includes('postgres') ||
      dep.includes('mysql') ||
      dep.includes('sqlite')
    );
  }

  /**
   * Generate database mock
   */
  private generateDatabaseMock(options: MockGeneratorOptions): MockDefinition {
    return {
      name: 'databaseMock',
      type: 'database',
      implementation: `
// In-memory database mock
class InMemoryDatabase {
  constructor() {
    this.data = new Map();
    this.collections = new Map();
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }
    return {
      find: (query = {}) => ({
        toArray: () => Promise.resolve(
          Array.from(this.collections.get(name).values())
            .filter(doc => this.matchQuery(doc, query))
        ),
      }),
      findOne: (query) => Promise.resolve(
        Array.from(this.collections.get(name).values())
          .find(doc => this.matchQuery(doc, query))
      ),
      insertOne: (doc) => {
        const id = Date.now().toString();
        const newDoc = { _id: id, ...doc };
        this.collections.get(name).set(id, newDoc);
        return Promise.resolve({ insertedId: id });
      },
      updateOne: (query, update) => {
        const doc = Array.from(this.collections.get(name).values())
          .find(d => this.matchQuery(d, query));
        if (doc) {
          Object.assign(doc, update.$set || {});
          return Promise.resolve({ modifiedCount: 1 });
        }
        return Promise.resolve({ modifiedCount: 0 });
      },
      deleteOne: (query) => {
        const entries = Array.from(this.collections.get(name).entries());
        const entry = entries.find(([_, doc]) => this.matchQuery(doc, query));
        if (entry) {
          this.collections.get(name).delete(entry[0]);
          return Promise.resolve({ deletedCount: 1 });
        }
        return Promise.resolve({ deletedCount: 0 });
      },
    };
  }

  matchQuery(doc, query) {
    return Object.entries(query).every(([key, value]) => doc[key] === value);
  }

  reset() {
    this.collections.clear();
  }
}

export const db = new InMemoryDatabase();`,
      setup: `
// Reset database before each test
beforeEach(() => {
  db.reset();
});`,
    };
  }

  /**
   * Check if needs API mock
   */
  private needsApiMock(analysis: any): boolean {
    return analysis.dependencies.some((dep: string) => 
      dep.includes('api') || 
      dep.includes('http') || 
      dep.includes('fetch') ||
      dep.includes('axios')
    );
  }

  /**
   * Generate API mock
   */
  private generateApiMock(options: MockGeneratorOptions): MockDefinition {
    return {
      name: 'apiMock',
      type: 'api',
      implementation: `
// API mock server
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ])
    );
  }),

  rest.post('/api/users', (req, res, ctx) => {
    const { name, email } = req.body;
    return res(
      ctx.status(201),
      ctx.json({
        id: Date.now(),
        name,
        email,
        createdAt: new Date().toISOString(),
      })
    );
  }),

  rest.put('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    const updates = req.body;
    return res(
      ctx.status(200),
      ctx.json({
        id: Number(id),
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    );
  }),

  rest.delete('/api/users/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  // Catch all handler
  rest.get('*', (req, res, ctx) => {
    console.warn(\`Unhandled request: \${req.url.toString()}\`);
    return res(ctx.status(404));
  }),
];

export const server = setupServer(...handlers);`,
      setup: `
// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());`,
    };
  }

  /**
   * Generate network stubs
   */
  private generateNetworkStubs(options: MockGeneratorOptions): string {
    return `
// Network stubs for E2E tests
const apiStubs = {
  users: [
    { id: 1, name: 'Test User 1', email: 'test1@example.com' },
    { id: 2, name: 'Test User 2', email: 'test2@example.com' },
  ],
  posts: [
    { id: 1, title: 'Test Post', content: 'Lorem ipsum' },
  ],
  auth: {
    login: { token: 'mock-jwt-token', user: { id: 1, name: 'Test User' } },
    logout: { success: true },
  },
};

// Cypress intercepts
cy.intercept('GET', '/api/users', { body: apiStubs.users });
cy.intercept('GET', '/api/posts', { body: apiStubs.posts });
cy.intercept('POST', '/api/auth/login', { body: apiStubs.auth.login });
cy.intercept('POST', '/api/auth/logout', { body: apiStubs.auth.logout });

// Playwright routes
await page.route('/api/**', (route) => {
  const url = route.request().url();
  
  if (url.includes('/users')) {
    route.fulfill({ body: JSON.stringify(apiStubs.users) });
  } else if (url.includes('/posts')) {
    route.fulfill({ body: JSON.stringify(apiStubs.posts) });
  } else {
    route.continue();
  }
});`;
  }

  /**
   * Check if needs browser mocks
   */
  private needsBrowserMocks(analysis: any): boolean {
    return analysis.dependencies.some((dep: string) => 
      dep.includes('localStorage') || 
      dep.includes('sessionStorage') || 
      dep.includes('navigator') ||
      dep.includes('window')
    );
  }

  /**
   * Generate browser mocks
   */
  private generateBrowserMocks(options: MockGeneratorOptions): string {
    return `
// Browser API mocks
const localStorageMock = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

const sessionStorageMock = { ...localStorageMock, store: {} };

const navigatorMock = {
  userAgent: 'Mozilla/5.0 (Test Browser)',
  language: 'en-US',
  onLine: true,
  geolocation: {
    getCurrentPosition: jest.fn((success) => {
      success({
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10,
        },
      });
    }),
  },
};

// Apply mocks
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
Object.defineProperty(window, 'navigator', { value: navigatorMock });`;
  }

  /**
   * Generate factory name
   */
  private generateFactoryName(schema: DataSchema): string {
    const keys = Object.keys(schema);
    if (keys.length === 0) return 'DataFactory';
    
    // Try to infer model name from schema
    const modelName = keys.find(k => k === 'id' || k === '_id') 
      ? 'Model' 
      : this.capitalize(keys[0]);
    
    return `${modelName}Factory`;
  }

  /**
   * Generate factory implementation
   */
  private generateFactoryImplementation(options: DataGenerationOptions): string {
    if (options.type === 'faker') {
      return this.generateFakerFactory(options);
    } else if (options.type === 'factory') {
      return this.generateFactoryBot(options);
    } else if (options.type === 'builder') {
      return this.generateBuilderPattern(options);
    } else {
      return this.generateFixtureFactory(options);
    }
  }

  /**
   * Generate Faker factory
   */
  private generateFakerFactory(options: DataGenerationOptions): string {
    const { schema = {} } = options;
    
    let implementation = `
import { faker } from '@faker-js/faker';

export const create${this.generateFactoryName(schema)} = (overrides = {}) => {
  ${options.locale ? `faker.locale = '${options.locale}';` : ''}
  
  return {`;

    for (const [field, definition] of Object.entries(schema)) {
      implementation += `
    ${field}: ${this.generateFakerField(field, definition)},`;
    }

    implementation += `
    ...overrides,
  };
};

export const create${this.generateFactoryName(schema)}List = (count = ${options.count || 10}, overrides = {}) => {
  return Array.from({ length: count }, (_, index) => 
    create${this.generateFactoryName(schema)}({ ...overrides, id: index + 1 })
  );
};`;

    return implementation;
  }

  /**
   * Generate Faker field
   */
  private generateFakerField(field: string, definition: FieldDefinition): string {
    // Check for custom generator
    if (definition.generator) {
      return `faker.${definition.generator}()`;
    }

    // Infer from field name
    const fieldLower = field.toLowerCase();
    
    if (fieldLower.includes('email')) return 'faker.internet.email()';
    if (fieldLower.includes('name')) return 'faker.person.fullName()';
    if (fieldLower.includes('firstname')) return 'faker.person.firstName()';
    if (fieldLower.includes('lastname')) return 'faker.person.lastName()';
    if (fieldLower.includes('phone')) return 'faker.phone.number()';
    if (fieldLower.includes('address')) return 'faker.location.streetAddress()';
    if (fieldLower.includes('city')) return 'faker.location.city()';
    if (fieldLower.includes('country')) return 'faker.location.country()';
    if (fieldLower.includes('company')) return 'faker.company.name()';
    if (fieldLower.includes('job')) return 'faker.person.jobTitle()';
    if (fieldLower.includes('date')) return 'faker.date.recent()';
    if (fieldLower.includes('time')) return 'faker.date.recent().toISOString()';
    if (fieldLower.includes('url')) return 'faker.internet.url()';
    if (fieldLower.includes('avatar')) return 'faker.image.avatar()';
    if (fieldLower.includes('image')) return 'faker.image.url()';
    if (fieldLower.includes('description')) return 'faker.lorem.paragraph()';
    if (fieldLower.includes('title')) return 'faker.lorem.sentence()';
    if (fieldLower.includes('content')) return 'faker.lorem.paragraphs(3)';
    if (fieldLower.includes('price')) return 'faker.commerce.price()';
    if (fieldLower.includes('amount')) return 'faker.number.int({ min: 1, max: 1000 })';
    if (fieldLower.includes('quantity')) return 'faker.number.int({ min: 1, max: 100 })';
    if (fieldLower.includes('status')) return "faker.helpers.arrayElement(['active', 'inactive', 'pending'])";
    if (fieldLower.includes('role')) return "faker.helpers.arrayElement(['user', 'admin', 'moderator'])";
    if (fieldLower === 'id') return 'faker.string.uuid()';
    
    // Based on type
    switch (definition.type) {
      case 'string':
        if (definition.constraints?.maxLength) {
          return `faker.string.alpha({ length: ${definition.constraints.maxLength} })`;
        }
        return 'faker.lorem.word()';
      case 'number':
      case 'integer':
        const min = definition.constraints?.min || 0;
        const max = definition.constraints?.max || 100;
        return `faker.number.int({ min: ${min}, max: ${max} })`;
      case 'boolean':
        return 'faker.datatype.boolean()';
      case 'date':
        return 'faker.date.recent()';
      case 'array':
        return `faker.helpers.multiple(() => faker.lorem.word(), { count: 3 })`;
      case 'object':
        return '{}';
      default:
        return 'null';
    }
  }

  /**
   * Generate factory bot pattern
   */
  private generateFactoryBot(options: DataGenerationOptions): string {
    const { schema = {} } = options;
    const factoryName = this.generateFactoryName(schema);
    
    return `
import { Factory } from 'factory-bot';

Factory.define('${factoryName}', {
${Object.entries(schema).map(([field, def]) => 
  `  ${field}: ${this.generateFactoryBotField(field, def)},`
).join('\n')}
});

// Define traits
Factory.define('${factoryName}', 'withRelations', {
  ${Object.entries(schema)
    .filter(([_, def]) => def.relation)
    .map(([field, def]) => `${field}: () => Factory.create('${def.relation}'),`)
    .join('\n  ')}
});

export const create${factoryName} = (attrs = {}) => 
  Factory.create('${factoryName}', attrs);

export const build${factoryName} = (attrs = {}) => 
  Factory.build('${factoryName}', attrs);

export const create${factoryName}List = (count = ${options.count || 10}, attrs = {}) =>
  Factory.createList('${factoryName}', count, attrs);`;
  }

  /**
   * Generate factory bot field
   */
  private generateFactoryBotField(field: string, definition: FieldDefinition): string {
    if (definition.type === 'string' && definition.unique) {
      return `Factory.sequence('${field}', (n) => \`${field}_\${n}\`)`;
    }
    
    if (definition.nullable) {
      return `() => Math.random() > 0.5 ? ${this.generateFakerField(field, definition)} : null`;
    }
    
    return `() => ${this.generateFakerField(field, definition)}`;
  }

  /**
   * Generate builder pattern
   */
  private generateBuilderPattern(options: DataGenerationOptions): string {
    const { schema = {} } = options;
    const className = this.generateFactoryName(schema).replace('Factory', 'Builder');
    
    return `
export class ${className} {
  private data: any = {};

  constructor() {
    this.reset();
  }

  reset(): ${className} {
    this.data = {
${Object.entries(schema).map(([field, def]) => 
  `      ${field}: ${this.generateFakerField(field, def)},`
).join('\n')}
    };
    return this;
  }

${Object.entries(schema).map(([field, def]) => `
  with${this.capitalize(field)}(value: ${def.type}): ${className} {
    this.data.${field} = value;
    return this;
  }`).join('\n')}

  withDefaults(): ${className} {
    this.reset();
    return this;
  }

  build(): any {
    return { ...this.data };
  }

  buildList(count: number): any[] {
    return Array.from({ length: count }, (_, i) => ({
      ...this.build(),
      id: i + 1,
    }));
  }
}

export const a${className.replace('Builder', '')} = () => new ${className}();`;
  }

  /**
   * Generate fixture factory
   */
  private generateFixtureFactory(options: DataGenerationOptions): string {
    const { schema = {} } = options;
    
    return `
// Fixture-based factory
export const fixtures = {
  valid: {
${Object.entries(schema).map(([field, def]) => 
  `    ${field}: ${this.generateFixtureValue(field, def, 'valid')},`
).join('\n')}
  },
  invalid: {
${Object.entries(schema).map(([field, def]) => 
  `    ${field}: ${this.generateFixtureValue(field, def, 'invalid')},`
).join('\n')}
  },
  edge: {
${Object.entries(schema).map(([field, def]) => 
  `    ${field}: ${this.generateFixtureValue(field, def, 'edge')},`
).join('\n')}
  },
};

export const createFromFixture = (type = 'valid', overrides = {}) => ({
  ...fixtures[type],
  ...overrides,
});`;
  }

  /**
   * Generate fixture value
   */
  private generateFixtureValue(field: string, definition: FieldDefinition, type: string): string {
    if (type === 'valid') {
      // Return valid test data
      switch (definition.type) {
        case 'string':
          if (field.includes('email')) return "'test@example.com'";
          if (field.includes('url')) return "'https://example.com'";
          return "'test string'";
        case 'number':
          return '42';
        case 'boolean':
          return 'true';
        case 'date':
          return "new Date('2023-01-01')";
        default:
          return 'null';
      }
    } else if (type === 'invalid') {
      // Return invalid test data
      switch (definition.type) {
        case 'string':
          if (definition.constraints?.required) return 'null';
          if (field.includes('email')) return "'invalid-email'";
          return "''";
        case 'number':
          if (definition.constraints?.min) return String(definition.constraints.min - 1);
          return "'not a number'";
        case 'boolean':
          return "'not a boolean'";
        default:
          return 'undefined';
      }
    } else {
      // Edge cases
      switch (definition.type) {
        case 'string':
          if (definition.constraints?.maxLength) {
            return `'${'x'.repeat(definition.constraints.maxLength + 1)}'`;
          }
          return "'\\n\\t\\r'";
        case 'number':
          return 'Number.MAX_SAFE_INTEGER';
        default:
          return 'null';
      }
    }
  }

  /**
   * Generate builders
   */
  private generateBuilders(schema: DataSchema): TestDataBuilder[] {
    const builders: TestDataBuilder[] = [];
    
    // Common traits
    const traits = ['active', 'inactive', 'deleted', 'admin', 'premium'];
    
    for (const trait of traits) {
      if (this.isApplicableTrait(schema, trait)) {
        builders.push({
          name: `with${this.capitalize(trait)}`,
          baseFactory: this.generateFactoryName(schema),
          overrides: this.getTraitOverrides(trait),
          traits: [trait],
        });
      }
    }
    
    return builders;
  }

  /**
   * Check if trait is applicable
   */
  private isApplicableTrait(schema: DataSchema, trait: string): boolean {
    const fields = Object.keys(schema);
    
    switch (trait) {
      case 'active':
      case 'inactive':
        return fields.some(f => f.includes('status') || f.includes('active'));
      case 'deleted':
        return fields.some(f => f.includes('deleted') || f.includes('removed'));
      case 'admin':
        return fields.some(f => f.includes('role') || f.includes('permission'));
      case 'premium':
        return fields.some(f => f.includes('plan') || f.includes('subscription'));
      default:
        return false;
    }
  }

  /**
   * Get trait overrides
   */
  private getTraitOverrides(trait: string): Record<string, any> {
    switch (trait) {
      case 'active':
        return { status: 'active', isActive: true };
      case 'inactive':
        return { status: 'inactive', isActive: false };
      case 'deleted':
        return { deletedAt: new Date(), isDeleted: true };
      case 'admin':
        return { role: 'admin', permissions: ['all'] };
      case 'premium':
        return { plan: 'premium', features: ['all'] };
      default:
        return {};
    }
  }

  /**
   * Capitalize string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Generate complete mock files
   */
  async generateMockFiles(outputDir: string, options: MockGeneratorOptions): Promise<string[]> {
    const files: string[] = [];
    const mocks = await this.generateMocks(options);
    
    // Generate main mock file
    const mockContent = this.combineMocks(mocks, options);
    const mockPath = path.join(outputDir, '__mocks__', `${options.target.module}.mock.${options.framework}.ts`);
    
    await fs.mkdir(path.dirname(mockPath), { recursive: true });
    await fs.writeFile(mockPath, mockContent);
    files.push(mockPath);
    
    // Generate factory files if requested
    if (options.data) {
      const factories = await this.generateDataFactories(options.data);
      
      for (const factory of factories) {
        const factoryContent = this.formatFactory(factory);
        const factoryPath = path.join(outputDir, '__factories__', `${factory.name}.ts`);
        
        await fs.mkdir(path.dirname(factoryPath), { recursive: true });
        await fs.writeFile(factoryPath, factoryContent);
        files.push(factoryPath);
      }
    }
    
    return files;
  }

  /**
   * Combine mocks into single file
   */
  private combineMocks(mocks: MockDefinition[], options: MockGeneratorOptions): string {
    let content = `/**
 * Generated mocks for ${options.target.module}
 * Framework: ${options.framework}
 * Type: ${options.type}
 */

`;

    // Add imports
    if (options.framework === 'jest') {
      content += "import { jest } from '@jest/globals';\n";
    } else if (options.framework === 'vitest') {
      content += "import { vi } from 'vitest';\n";
    }

    content += '\n';

    // Add mock implementations
    for (const mock of mocks) {
      content += `// ${mock.name}\n`;
      content += mock.implementation + '\n\n';
      
      if (mock.helpers) {
        for (const helper of mock.helpers) {
          content += helper.implementation + '\n\n';
        }
      }
    }

    // Add setup and teardown
    const setupCode = mocks
      .filter(m => m.setup)
      .map(m => m.setup)
      .join('\n');
      
    const teardownCode = mocks
      .filter(m => m.teardown)
      .map(m => m.teardown)
      .join('\n');

    if (setupCode || teardownCode) {
      content += '\n// Test lifecycle hooks\n';
      if (setupCode) content += setupCode + '\n';
      if (teardownCode) content += teardownCode + '\n';
    }

    // Export all mocks
    content += '\n// Exports\nexport {\n';
    content += mocks.map(m => `  ${m.name}`).join(',\n');
    content += '\n};\n';

    return content;
  }

  /**
   * Format factory for output
   */
  private formatFactory(factory: TestDataFactory): string {
    let content = `/**
 * ${factory.name}
 * Generated test data factory
 */

${factory.implementation}

`;

    // Add builders if any
    if (factory.builders.length > 0) {
      content += '\n// Trait builders\n';
      
      for (const builder of factory.builders) {
        content += `
export const ${builder.name} = (overrides = {}) => 
  create${factory.name}({
    ${Object.entries(builder.overrides)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join(',\n    ')},
    ...overrides
  });
`;
      }
    }

    return content;
  }
}

// Export singleton instance
export const mockGenerator = new MockGenerator();