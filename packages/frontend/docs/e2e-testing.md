# E2E Testing with Playwright

## Overview

This project uses Playwright for end-to-end testing, providing comprehensive test coverage across multiple browsers and devices.

## Test Structure

```
tests/
├── e2e/                    # E2E test files
│   ├── fixtures/           # Test fixtures and helpers
│   │   └── test-fixtures.ts
│   ├── auth/              # Authentication tests
│   │   └── login.spec.ts
│   ├── dashboard/         # Dashboard tests
│   │   └── dashboard.spec.ts
│   ├── tasks/             # Task management tests
│   │   └── task-board.spec.ts
│   └── terminal/          # Terminal tests
│       └── terminal.spec.ts
└── integration/           # API integration tests
    └── api-integration.spec.ts
```

## Running Tests

### Basic Commands

```bash
# Run all E2E tests
pnpm test:e2e

# Run tests with UI mode (recommended for debugging)
pnpm test:e2e:ui

# Run tests in headed mode (see browser)
pnpm test:e2e:headed

# Debug specific test
pnpm test:e2e:debug tests/e2e/auth/login.spec.ts

# Run specific test file
pnpm exec playwright test tests/e2e/dashboard/dashboard.spec.ts

# Run tests matching pattern
pnpm exec playwright test -g "should create a new task"
```

### Browser-Specific Testing

```bash
# Run on specific browser
pnpm exec playwright test --project=chromium
pnpm exec playwright test --project=firefox
pnpm exec playwright test --project=webkit

# Run on mobile devices
pnpm exec playwright test --project="Mobile Chrome"
pnpm exec playwright test --project="Mobile Safari"
```

## Test Fixtures

### Authentication Fixture

The `authenticatedPage` fixture automatically sets up authentication state:

```typescript
import { test, expect } from '../fixtures/test-fixtures';

test('authenticated test', async ({ authenticatedPage }) => {
  // Page is already authenticated
  await authenticatedPage.goto('/dashboard');
  // No need to login
});
```

### Test Data Generators

```typescript
import { testData } from '../fixtures/test-fixtures';

const task = testData.createTask({
  title: 'Custom Task',
  priority: 'high'
});

const project = testData.createProject({
  name: 'Test Project'
});
```

## Writing Tests

### Page Object Pattern

```typescript
// pages/dashboard.page.ts
export class DashboardPage {
  constructor(private page: Page) {}
  
  async navigateTo() {
    await this.page.goto('/dashboard');
  }
  
  async getStatValue(statName: string) {
    return this.page.getByTestId(`stat-${statName}`).textContent();
  }
  
  async refreshStats() {
    await this.page.getByRole('button', { name: /refresh/i }).click();
  }
}
```

### Best Practices

1. **Use data-testid attributes** for reliable element selection:
   ```typescript
   <div data-testid="task-card">...</div>
   ```

2. **Mock API responses** for consistent testing:
   ```typescript
   await page.route('**/api/tasks', async route => {
     await route.fulfill({ json: mockTasks });
   });
   ```

3. **Wait for elements** properly:
   ```typescript
   await expect(page.getByText('Loading')).toBeHidden();
   await expect(page.getByTestId('task-list')).toBeVisible();
   ```

4. **Test mobile responsiveness**:
   ```typescript
   await page.setViewportSize({ width: 375, height: 667 });
   ```

## Debugging Tests

### Visual Debugging

```bash
# Open Playwright UI
pnpm test:e2e:ui

# Debug mode with browser
pnpm test:e2e:debug
```

### Trace Viewer

Traces are automatically captured on test failure:

```bash
# View trace
pnpm exec playwright show-trace trace.zip
```

### Screenshots and Videos

Failed tests automatically capture:
- Screenshots at point of failure
- Video recording of the entire test
- Full trace with network activity

Find these in `test-results/` directory.

## CI/CD Integration

### GitHub Actions

```yaml
- name: Install Playwright
  run: pnpm exec playwright install --with-deps

- name: Run E2E tests
  run: pnpm test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

### Environment Variables

```bash
# Base URL for tests
E2E_BASE_URL=http://localhost:5173

# CI mode (disables test.only, enables retries)
CI=true

# Parallel workers
PLAYWRIGHT_WORKERS=4
```

## Common Test Patterns

### Testing Real-time Updates

```typescript
test('should handle real-time updates', async ({ page }) => {
  // Simulate WebSocket message
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('websocket-message', {
      detail: { type: 'task_updated', data: updatedTask }
    }));
  });
  
  await expect(page.getByText(updatedTask.title)).toBeVisible();
});
```

### Testing Drag and Drop

```typescript
test('should drag task between columns', async ({ page }) => {
  const task = page.getByTestId('task-1');
  const targetColumn = page.getByTestId('column-done');
  
  await task.dragTo(targetColumn);
  
  await expect(targetColumn).toContainText('Task Title');
});
```

### Testing File Uploads

```typescript
test('should upload file', async ({ page }) => {
  const fileInput = page.getByLabel('Upload file');
  await fileInput.setInputFiles('path/to/file.txt');
  
  await expect(page.getByText('file.txt')).toBeVisible();
});
```

### Testing Keyboard Navigation

```typescript
test('should navigate with keyboard', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button').first()).toBeFocused();
  
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
});
```

## Performance Testing

### Measuring Performance

```typescript
test('should load quickly', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/dashboard');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3 seconds
  
  // Check Web Vitals
  const metrics = await page.evaluate(() => 
    JSON.stringify(performance.getEntriesByType('navigation'))
  );
  console.log('Performance metrics:', metrics);
});
```

## Accessibility Testing

### Built-in Accessibility Checks

```typescript
test('should be accessible', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Check for ARIA labels
  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  
  // Check keyboard navigation
  await page.keyboard.press('Tab');
  const focusedElement = await page.evaluate(() => 
    document.activeElement?.tagName
  );
  expect(focusedElement).not.toBe('BODY');
});
```

## Troubleshooting

### Common Issues

1. **Tests timeout**: Increase timeout in config or specific test
   ```typescript
   test.setTimeout(60000); // 60 seconds
   ```

2. **Element not found**: Use more specific selectors
   ```typescript
   // Bad
   await page.click('button');
   
   // Good
   await page.getByRole('button', { name: 'Submit' }).click();
   ```

3. **Flaky tests**: Add proper waits
   ```typescript
   // Wait for API response
   await page.waitForResponse('**/api/tasks');
   
   // Wait for element state
   await expect(page.getByTestId('loader')).toBeHidden();
   ```

## Coverage Report

After running tests, view the HTML report:

```bash
# Generate and open report
pnpm exec playwright show-report
```

The report includes:
- Pass/fail status for each test
- Execution time
- Screenshots and videos for failures
- Detailed error messages
- Test steps trace