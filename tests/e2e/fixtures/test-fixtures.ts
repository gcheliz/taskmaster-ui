import { test as base } from '@playwright/test';

// Define custom fixtures
export interface TestFixtures {
  authenticatedPage: any;
}

// Extend base test with our fixtures
export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Mock authentication for tests
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'https://github.com/test-user.png',
      }));
    });
    
    await use(page);
  },
});

export { expect } from '@playwright/test';

// Test data generators
export const testData = {
  createTask: (overrides = {}) => ({
    title: 'Test Task',
    description: 'This is a test task description',
    status: 'pending',
    priority: 'medium',
    ...overrides,
  }),
  
  createProject: (overrides = {}) => ({
    name: 'Test Project',
    description: 'This is a test project',
    repositories: [],
    ...overrides,
  }),
  
  createTerminalCommand: (overrides = {}) => ({
    command: 'echo "test"',
    workingDirectory: '/test',
    ...overrides,
  }),
};