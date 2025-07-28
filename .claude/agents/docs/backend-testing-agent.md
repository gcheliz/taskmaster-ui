# Backend Testing Agent

## Overview

The Backend Testing Agent automatically generates comprehensive test suites for backend code using Jest. It analyzes TypeScript/JavaScript files to understand their structure and generates appropriate unit tests, integration tests, and performance tests.

## Features

### 1. Code Analysis

The agent uses TypeScript's compiler API to analyze:

- **Classes**: Methods, properties, constructors
- **Functions**: Parameters, return types, async/sync
- **Express Routes**: HTTP methods, paths, middleware
- **Prisma Models**: Database operations and relationships
- **Imports/Exports**: Module dependencies

### 2. Test Generation Types

#### Unit Tests

- Test individual functions and methods
- Mock external dependencies
- Validate input/output behavior
- Error handling scenarios

#### Integration Tests

- Test API endpoints with supertest
- Database operations with test data
- External API interactions with nock
- Authentication and authorization flows

#### Performance Tests

- Response time measurements
- Load testing for endpoints
- Function execution benchmarks
- Memory usage analysis

### 3. Mocking Capabilities

- **Auto-mocking**: Automatically mock imported modules
- **Database Mocking**: Mock Prisma client with jest-mock-extended
- **External API Mocking**: Mock HTTP requests with nock
- **Custom Mocks**: Generate specific mock implementations

### 4. Test Data Factories

Generate realistic test data using Faker.js:

```typescript
const user = await createUser({
  email: faker.internet.email(),
  name: faker.person.fullName(),
});
```

### 5. Coverage Analysis

- Statement, branch, function, and line coverage
- Configurable thresholds
- Coverage reports in multiple formats
- Fail tests if coverage drops below threshold

## Usage

### Basic Unit Test Generation

```typescript
import { backendTestingAgent } from '@/agents/testing-agents';

await backendTestingAgent.generateTests({
  targetFile: '/src/services/userService.ts',
  testType: 'unit',
});
```

### Integration Tests with Mocking

```typescript
await backendTestingAgent.generateTests({
  targetFile: '/src/routes/users.ts',
  testType: 'integration',
  mocking: {
    mockDatabase: true,
    mockExternalAPIs: true,
    mockModules: ['../middleware/auth'],
  },
});
```

### Tests with Data Factories

```typescript
await backendTestingAgent.generateTests({
  targetFile: '/src/repositories/userRepository.ts',
  testType: 'integration',
  dataFactories: true,
  mocking: {
    mockDatabase: true,
  },
});
```

### Performance Testing

```typescript
await backendTestingAgent.generateTests({
  targetFile: '/src/services/dataProcessor.ts',
  testType: 'unit',
  performanceTests: true,
});
```

### Coverage Configuration

```typescript
await backendTestingAgent.generateTests({
  targetFile: '/src/utils/helpers.ts',
  testType: 'unit',
  coverage: {
    threshold: 80,
    includeStatements: true,
    includeBranches: true,
    includeFunctions: true,
    includeLines: true,
  },
});
```

## Generated Test Examples

### Unit Test for Function

```typescript
describe('Function Unit Tests', () => {
  it('should test calculateTotal function', () => {
    expect(calculateTotal([1, 2, 3])).toBe(6);
  });

  it('should handle invalid parameters for calculateTotal', () => {
    expect(() => calculateTotal(null)).toThrow();
  });
});
```

### Integration Test for API Route

```typescript
describe('API Route Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /users should return success', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
  });

  it('POST /users should handle invalid data', async () => {
    const response = await request(app).post('/users').send({});
    expect(response.status).toBe(400);
  });

  it('GET /users should require authentication', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(401);
  });
});
```

### Database Model Test

```typescript
describe('Database Model Integration Tests', () => {
  beforeEach(async () => {
    await prisma.$transaction([prisma.user.deleteMany()]);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a User', async () => {
    const data = { email: 'test@example.com', name: 'Test User' };
    const created = await prisma.user.create({ data });
    expect(created.id).toBeDefined();
  });

  it('should find User by id', async () => {
    const created = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });
    const found = await prisma.user.findUnique({
      where: { id: created.id },
    });
    expect(found).toBeDefined();
  });
});
```

### Performance Test

```typescript
describe('Performance Tests', () => {
  it('GET /users should respond within 100ms', async () => {
    const start = performance.now();
    await request(app).get('/users');
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('processLargeDataset should execute within 50ms', async () => {
    const start = performance.now();
    await processLargeDataset(testData);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50);
  });
});
```

## Test Data Factories

### Generated Factory Example

```typescript
import { faker } from '@faker-js/faker';
import { prisma } from '../../lib/prisma';

export const createUser = async (overrides = {}) => {
  return prisma.user.create({
    data: {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: faker.internet.password(),
      ...overrides,
    },
  });
};

export const createUsers = async (count: number, overrides = {}) => {
  return Promise.all(
    Array.from({ length: count }, () => createUser(overrides))
  );
};
```

## Configuration Options

### TestGenerationOptions

```typescript
interface TestGenerationOptions {
  targetFile: string; // File to generate tests for
  testType: 'unit' | 'integration' | 'e2e';
  coverage?: CoverageOptions; // Coverage configuration
  mocking?: MockingOptions; // Mocking configuration
  dataFactories?: boolean; // Generate test data factories
  performanceTests?: boolean; // Generate performance tests
}
```

### CoverageOptions

```typescript
interface CoverageOptions {
  threshold?: number; // Minimum coverage percentage (default: 80)
  includeStatements?: boolean; // Include statement coverage
  includeBranches?: boolean; // Include branch coverage
  includeFunctions?: boolean; // Include function coverage
  includeLines?: boolean; // Include line coverage
}
```

### MockingOptions

```typescript
interface MockingOptions {
  autoMock?: boolean; // Automatically mock all imports
  mockModules?: string[]; // Specific modules to mock
  mockDatabase?: boolean; // Mock Prisma client
  mockExternalAPIs?: boolean; // Mock external HTTP requests
}
```

## Best Practices

### 1. Test Organization

- Keep tests close to source files
- Use descriptive test names
- Group related tests in describe blocks
- One assertion per test when possible

### 2. Mocking Strategy

- Mock external dependencies
- Use real implementations for unit under test
- Create reusable mock utilities
- Keep mocks simple and focused

### 3. Test Data

- Use factories for consistent test data
- Avoid hardcoded values
- Clean up test data after tests
- Use realistic data with Faker

### 4. Coverage Goals

- Aim for 80% coverage minimum
- Focus on critical paths
- Don't test implementation details
- Cover edge cases and error scenarios

### 5. Performance Testing

- Set realistic performance budgets
- Test under various load conditions
- Monitor trends over time
- Profile before optimizing

## Integration with CI/CD

### Jest Configuration

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.d.ts'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/src/**/*.test.ts'],
};
```

### GitHub Actions Example

```yaml
- name: Run Backend Tests
  run: |
    npm run test:backend
    npm run test:backend:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/backend/lcov.info
    flags: backend
```

## Troubleshooting

### Common Issues

1. **TypeScript Parsing Errors**
   - Ensure TypeScript is properly configured
   - Check for syntax errors in source files
   - Verify import paths are correct

2. **Mock Not Working**
   - Check jest.mock() placement (must be at top)
   - Verify module paths are correct
   - Use **mocks** directory for complex mocks

3. **Coverage Below Threshold**
   - Identify uncovered code with coverage report
   - Add tests for edge cases
   - Consider if code is testable

4. **Slow Test Execution**
   - Use --runInBand for debugging
   - Optimize database queries in tests
   - Mock expensive operations

### Debug Mode

Enable detailed logging:

```typescript
backendTestingAgent.debug = true;
```

## Command Line Usage

```bash
# Generate unit tests
task-master-agent test:backend --file src/services/user.ts --type unit

# Generate integration tests with mocks
task-master-agent test:backend --file src/routes/api.ts --type integration --mock-db

# Generate with coverage enforcement
task-master-agent test:backend --file src/utils/calc.ts --coverage 90

# Generate performance tests
task-master-agent test:backend --file src/workers/processor.ts --perf
```
