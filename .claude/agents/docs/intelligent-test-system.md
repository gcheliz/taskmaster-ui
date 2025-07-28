# Intelligent Test System Documentation

## Overview

The Intelligent Test System combines advanced code analysis, smart mock generation, and comprehensive test scenario creation to automatically generate high-quality test suites. It analyzes code structure, identifies edge cases, generates appropriate mocks, and creates test data factories.

## Key Features

### 1. Code Intelligence

- **Complexity Analysis**: Measures cyclomatic and cognitive complexity
- **Pattern Detection**: Identifies design patterns (Singleton, Factory, Observer)
- **Risk Identification**: Detects security, performance, and memory risks
- **Data Flow Analysis**: Tracks data transformations through functions
- **Branch Analysis**: Maps all execution paths for complete coverage

### 2. Smart Mock Generation

- **Automatic Detection**: Identifies which dependencies need mocking
- **Strategy Selection**: Chooses appropriate mock types (stub, spy, mock, fake)
- **Behavior Configuration**: Sets up return values, errors, and side effects
- **Framework Support**: Works with Jest, Vitest, and Mocha
- **External Service Mocks**: Pre-built mocks for common services (AWS, Redis, etc.)

### 3. Test Data Generation

- **Faker Integration**: Realistic data using faker.js
- **Factory Pattern**: Generates factory functions for models
- **Builder Pattern**: Creates fluent builders for complex objects
- **Fixture Support**: Static test data for deterministic tests
- **Relationship Handling**: Manages related data generation

### 4. Intelligent Test Scenarios

- **Automatic Generation**: Creates tests based on code analysis
- **Priority Assignment**: Ranks tests by criticality
- **Edge Case Detection**: Identifies boundary conditions
- **Error Path Testing**: Ensures error handling coverage
- **Performance Testing**: Adds benchmarks for complex code

## Usage

### Basic Intelligent Test Generation

```typescript
import { intelligentTestSystem } from '@/agents/testing-agents';

// Generate comprehensive tests for a file
const result = await intelligentTestSystem.generateIntelligentTests({
  targetFile: '/src/services/userService.ts',
  testType: 'all',
  framework: 'vitest',
  coverage: {
    statements: 90,
    branches: 85,
    functions: 95,
    lines: 90,
  },
  mocking: {
    strategy: 'smart',
    databases: 'in-memory',
    apis: 'stub',
  },
  dataGeneration: {
    realistic: true,
    factories: true,
    locale: 'en_US',
  },
  edgeCases: true,
  performance: true,
});

console.log(`Generated ${result.files.length} test files`);
console.log(`Coverage: ${result.coverage.estimated.statements}%`);
```

### Code Analysis Only

```typescript
import { testIntelligence } from '@/agents/testing-agents';

// Analyze code without generating tests
const analysis = await testIntelligence.analyzeCode('/src/utils/validator.ts');

console.log(`Complexity: ${analysis.complexity.cyclomaticComplexity}`);
console.log(`Functions: ${analysis.functions.length}`);
console.log(`Risk areas: ${analysis.risks.length}`);
```

### Mock Generation

```typescript
import { mockGenerator } from '@/agents/testing-agents';

// Generate mocks for specific dependencies
const mocks = await mockGenerator.generateMocks({
  type: 'unit',
  framework: 'jest',
  target: {
    module: 'axios',
    functions: ['get', 'post', 'put', 'delete'],
  },
  strategy: {
    type: 'stub',
    behavior: {
      returnValue: { data: {}, status: 200 },
    },
  },
});
```

### Data Factory Generation

```typescript
import { mockGenerator } from '@/agents/testing-agents';

// Generate data factories
const factories = await mockGenerator.generateDataFactories({
  type: 'faker',
  schema: {
    id: { type: 'string', generator: 'datatype.uuid' },
    email: { type: 'string', constraints: { format: 'email' } },
    name: { type: 'string' },
    age: { type: 'number', constraints: { min: 18, max: 100 } },
    role: { type: 'string', constraints: { enum: ['user', 'admin'] } },
    createdAt: { type: 'date' },
  },
  count: 10,
  locale: 'en_US',
});
```

## Generated Test Examples

### Unit Test with Smart Mocks

```typescript
import { describe, it, expect, vi } from 'vitest';
import { createUser } from '../userService';
import { mockDatabase } from './__mocks__/database';
import { createUserFactory } from './__factories__/UserFactory';

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDatabase.users.findOne.mockReturnValue(null);
    mockDatabase.users.insertOne.mockResolvedValue({ insertedId: '123' });
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = createUserFactory();

      const result = await createUser(userData);

      expect(result.id).toBe('123');
      expect(mockDatabase.users.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userData.email,
          name: userData.name,
        })
      );
    });

    it('should handle duplicate email', async () => {
      mockDatabase.users.findOne.mockReturnValue({ id: 'existing' });

      await expect(createUser({ email: 'test@example.com' })).rejects.toThrow(
        'Email already exists'
      );
    });

    it('should validate email format', async () => {
      await expect(createUser({ email: 'invalid-email' })).rejects.toThrow(
        'Invalid email format'
      );
    });
  });
});
```

### Integration Test with Intelligent Mocks

```typescript
import { describe, it, expect } from 'vitest';
import { server } from './__mocks__/api-server';
import { processOrder } from '../orderProcessor';

describe('Order Processing Integration', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should process order through payment and shipping', async () => {
    const order = {
      items: [{ id: '1', quantity: 2, price: 29.99 }],
      customerId: 'cust_123',
      shippingAddress: {
        /* ... */
      },
    };

    const result = await processOrder(order);

    expect(result.paymentStatus).toBe('completed');
    expect(result.shippingStatus).toBe('scheduled');
    expect(result.totalAmount).toBe(59.98);
  });
});
```

## Code Analysis Report Example

```markdown
# Intelligent Test Report

## Code Analysis Summary

- **File**: /src/services/paymentService.ts
- **Functions**: 8
- **Classes**: 2
- **Complexity**: 15
- **Risk Areas**: 3

## Risk Analysis

1. **SQL Injection** (critical): Raw query construction at line 145
   - Mitigation: Use parameterized queries
2. **Race Condition** (high): Multiple async operations without synchronization
   - Mitigation: Implement proper locking mechanism
3. **Memory Leak** (medium): Event listeners not cleaned up
   - Mitigation: Add cleanup in lifecycle methods

## Test Scenarios Generated

- **Total**: 24
- **Unit Tests**: 16
- **Integration Tests**: 4
- **Edge Cases**: 3
- **Error Tests**: 1

## Coverage Analysis

- **Statements**: 92.5%
- **Branches**: 87.3%
- **Functions**: 100%
- **Lines**: 91.2%

## Recommendations

1. Add 2 high-priority tests for error handling
2. Consider parameterized tests for branch coverage
3. Add performance benchmarks for payment processing
```

## Configuration Options

### IntelligentTestOptions

```typescript
interface IntelligentTestOptions {
  targetFile: string; // File to test
  testType: 'unit' | 'integration' | 'e2e' | 'all';
  framework: 'jest' | 'vitest' | 'playwright';
  coverage?: {
    statements: number; // Target coverage %
    branches: number;
    functions: number;
    lines: number;
  };
  mocking?: {
    strategy: 'minimal' | 'comprehensive' | 'smart';
    externalOnly?: boolean;
    databases?: 'in-memory' | 'container' | 'stub';
    apis?: 'record' | 'stub' | 'mock-server';
  };
  dataGeneration?: {
    realistic: boolean;
    locale?: string;
    seed?: number;
    factories?: boolean;
    builders?: boolean;
  };
  edgeCases?: boolean; // Generate edge case tests
  performance?: boolean; // Generate performance tests
}
```

## Advanced Features

### 1. Pattern-Based Testing

The system recognizes common patterns and generates appropriate tests:

- **Singleton**: Thread safety and instance lifecycle tests
- **Factory**: All product variations and error cases
- **Observer**: Event emission and cleanup verification
- **Strategy**: All strategy implementations

### 2. Risk-Based Testing

Automatically prioritizes tests based on identified risks:

- **Security risks**: Get critical priority
- **Performance risks**: Generate benchmark tests
- **Memory risks**: Add lifecycle and cleanup tests
- **Concurrency risks**: Create race condition tests

### 3. Data Relationship Management

Handles complex data relationships:

```typescript
const factories = await generateDataFactories({
  schema: {
    user: {
      id: { type: 'string' },
      posts: { type: 'array', relation: 'Post' },
    },
    post: {
      id: { type: 'string' },
      authorId: { type: 'string', relation: 'User' },
    },
  },
});
```

### 4. Conditional Mocking

Creates mocks with conditional behavior:

```typescript
const mock = {
  behavior: {
    conditional: [
      {
        condition: args => args[0] === 'admin',
        response: { role: 'admin', permissions: ['all'] },
      },
      {
        condition: args => args[0] === 'user',
        response: { role: 'user', permissions: ['read'] },
      },
    ],
  },
};
```

## Integration with CI/CD

### Auto-trigger on File Changes

```typescript
// Watch for file changes and auto-generate tests
await intelligentTestSystem.autoGenerateTests(['src/services/newService.ts'], {
  coverage: {
    statements: 90,
    branches: 85,
    functions: 95,
    lines: 90,
  },
});
```

### Coverage Enforcement

```javascript
// package.json
{
  "scripts": {
    "test:intelligent": "node scripts/intelligent-test.js",
    "test:coverage": "vitest run --coverage",
    "test:enforce": "npm run test:intelligent && npm run test:coverage"
  }
}
```

## Best Practices

1. **Start with Smart Strategy**: Use 'smart' mocking strategy for balanced coverage
2. **Enable Edge Cases**: Always test boundary conditions
3. **Use Realistic Data**: Enable realistic data generation for better test quality
4. **Review Generated Tests**: Always review and customize generated tests
5. **Maintain Test Data**: Keep factories and builders up to date
6. **Monitor Coverage Trends**: Track coverage over time
7. **Prioritize Risk Areas**: Focus on high-risk code sections

## Troubleshooting

### Common Issues

1. **Mock Conflicts**
   - Ensure mocks are cleared between tests
   - Use unique mock names

2. **Data Generation Issues**
   - Check schema definitions
   - Verify faker locale support

3. **Coverage Gaps**
   - Review branch analysis
   - Add custom edge cases

4. **Performance**
   - Limit concurrent test generation
   - Use caching for analysis

## Command Line Usage

```bash
# Analyze code complexity
task-master-agent test:analyze --file src/service.ts

# Generate intelligent tests
task-master-agent test:intelligent --file src/service.ts --coverage 90

# Generate only mocks
task-master-agent test:mock --module axios --strategy smart

# Generate data factories
task-master-agent test:factory --schema user.json --count 100
```
