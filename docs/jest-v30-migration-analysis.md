# Jest v30 Migration Analysis

## Current Testing Framework Status

### Frontend Package

- **Testing Framework**: Vitest v3.2.4
- **Jest-related packages**:
  - @jest/globals v30.0.4 (already on v30)
  - @testing-library/jest-dom v6.6.3
  - jest-axe v10.0.0
- **Status**: Frontend uses Vitest, not Jest. No migration needed.

### Backend Package

- **Testing Framework**: Jest v29.7.0
- **Related packages**:
  - jest: v29.7.0
  - @types/jest: v29.5.14
  - ts-jest: v29.4.0
- **Configuration**: Uses ts-jest preset with TypeScript
- **Status**: Needs migration from v29 to v30

## Migration Requirements

### Key Challenges

1. **ts-jest Compatibility**
   - Current ts-jest v29.4.0 is designed for Jest v29
   - No stable ts-jest version available for Jest v30 yet
   - ts-jest@next (29.0.0-next.1) is not compatible with Jest v30

2. **Breaking Changes in Jest v30**
   - Minimum Node.js version: 16.10
   - Default test environment changed from jsdom to node
   - Removed deprecated features from v29
   - Changes to snapshot serialization
   - Updated module resolution

### Current Backend Test Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
};
```

## Migration Blockers

### Critical Issue: ts-jest Compatibility

The main blocker for migrating to Jest v30 is the lack of a compatible ts-jest version. Since the backend uses TypeScript, ts-jest is essential for:

- Transforming TypeScript files
- Type checking during tests
- Source map support

### Options

1. **Wait for ts-jest v30 support**
   - Monitor ts-jest releases for Jest v30 compatibility
   - This is the safest approach

2. **Alternative: Use Vitest**
   - Frontend already uses Vitest successfully
   - Vitest has excellent TypeScript support out of the box
   - Would unify testing frameworks across the monorepo

3. **Use Babel for TypeScript**
   - Replace ts-jest with @babel/preset-typescript
   - Loses type checking during tests
   - Not recommended for TypeScript projects

## Baseline Test Results

### Backend Tests (Jest v29)

- **Status**: 16 failed, 33 passed (49 total)
- **Main Issues**:
  - Integration test failures in taskMasterController
  - Database connection errors in projectService tests
  - Tests not exiting cleanly (async operations not stopped)

### Frontend Tests (Vitest v3)

- **Status**: 46 failed, 580 passed, 24 skipped (650 total)
- **Main Issues**:
  - Router context errors in multiple test suites
  - Accessibility violations in comprehensive audit
  - React act() warnings in several components
  - Document undefined errors in web vitals

## Recommendation

**Do not migrate to Jest v30 at this time** due to:

1. Lack of ts-jest support for Jest v30
2. No clear migration path for TypeScript projects
3. Risk of breaking existing tests without proper TypeScript support
4. Existing test failures need to be addressed first

**Alternative recommendation**: Consider migrating backend tests to Vitest to:

- Unify testing frameworks across the monorepo
- Get better TypeScript support out of the box
- Benefit from Vitest's faster execution and better DX
- Align with frontend testing framework

**Priority**: Fix existing test failures before any migration attempt
