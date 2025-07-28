/**
 * Testing Agents
 * 
 * Collection of agents for automated test generation,
 * test execution, and coverage enforcement
 */

export { BackendTestingAgent, backendTestingAgent } from './backend-testing-core';
export type { 
  TestGenerationOptions, 
  CoverageOptions, 
  MockingOptions,
  TestCase,
  TestSuite
} from './backend-testing-core';

export { FrontendTestingAgent, frontendTestingAgent } from './frontend-testing-core';
export type {
  FrontendTestOptions,
  BrowserOptions,
  VisualRegressionOptions,
  PerformanceBudgetOptions,
  ComponentTestCase,
  UserInteraction,
  E2ETestScenario,
  E2EStep
} from './frontend-testing-core';

export { TestIntelligenceEngine, testIntelligence } from './test-intelligence';
export type {
  CodeAnalysis,
  TestScenario,
  FunctionAnalysis,
  ClassAnalysis,
  MockStrategy,
  MockBehavior,
  TestSetup,
  TestExecution,
  TestAssertion
} from './test-intelligence';

export { MockGenerator, mockGenerator } from './mock-generator';
export type {
  MockGeneratorOptions,
  MockTarget,
  DataGenerationOptions,
  DataSchema,
  TestDataFactory,
  MockDefinition
} from './mock-generator';

export { IntelligentTestSystem, intelligentTestSystem } from './intelligent-test-system';
export type {
  IntelligentTestOptions,
  TestGenerationResult,
  CoverageReport,
  CoverageGap,
  MockingPreferences,
  DataGenerationPreferences
} from './intelligent-test-system';

/**
 * Testing agent command handlers
 */
export const testingCommands = {
  '/test:backend': 'Generate backend tests with Jest',
  '/test:frontend': 'Generate frontend tests with Vitest',
  '/test:e2e': 'Generate E2E tests with Playwright',
  '/test:coverage': 'Analyze and report test coverage',
  '/test:mock': 'Generate mock data and stubs',
  '/test:perf': 'Generate performance tests',
  '/test:visual': 'Generate visual regression tests',
  '/test:a11y': 'Generate accessibility tests',
  '/test:intelligent': 'Generate intelligent tests with full analysis',
  '/test:analyze': 'Analyze code complexity and test requirements',
} as const;

/**
 * Initialize all testing agents
 */
export function initializeTestingAgents(projectRoot: string): void {
  console.log('🧪 Initializing Testing Agents...');
  console.log('✅ Backend Testing Agent ready');
  console.log('✅ Frontend Testing Agent ready');
  console.log('✅ Test Intelligence Engine ready');
  console.log('✅ Mock Generator ready');
  console.log('✅ Intelligent Test System ready');
  console.log('📚 Available commands:', Object.keys(testingCommands).join(', '));
}