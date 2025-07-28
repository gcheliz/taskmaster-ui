# Frontend Testing Agent

## Overview

The Frontend Testing Agent automatically generates comprehensive test suites for frontend components using Vitest, Playwright, and various testing tools. It analyzes React components to understand their structure and generates appropriate tests for components, E2E scenarios, visual regression, and accessibility.

## Features

### 1. Component Analysis

The agent analyzes React components to extract:

- **Component Name**: From exports and function names
- **Props**: TypeScript interfaces and prop types
- **Hooks**: useState, useEffect, custom hooks
- **Event Handlers**: onClick, onChange, onSubmit, etc.
- **State Variables**: Local component state
- **Forms**: Form elements and submission handling
- **Routing**: Navigation and router usage

### 2. Test Generation Types

#### Component Tests (Vitest)

- Unit tests for individual components
- Props validation and rendering
- Event handler testing
- State updates verification
- Hook behavior testing
- Snapshot testing

#### E2E Tests (Playwright)

- Full user journey testing
- Cross-browser compatibility
- Mobile device testing
- Form submission flows
- Navigation testing
- API interaction verification

#### Visual Regression Tests

- Screenshot comparison
- Percy/Chromatic integration
- Responsive design testing
- Interactive state captures
- Ignore regions for dynamic content

#### Accessibility Tests

- WCAG 2.1 compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast validation
- Focus management
- ARIA implementation

### 3. Framework Support

Currently supports:

- **React** (primary support)
- **Vue** (planned)
- **Svelte** (planned)

### 4. Browser Testing

- Multiple browser support (Chromium, Firefox, WebKit)
- Mobile emulation
- Custom viewport sizes
- Device-specific testing

### 5. Performance Testing

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)

## Usage

### Basic Component Test Generation

```typescript
import { frontendTestingAgent } from '@/agents/testing-agents';

await frontendTestingAgent.generateTests({
  targetFile: '/src/components/Button.tsx',
  testType: 'component',
  framework: 'react',
});
```

### E2E Tests with Cross-Browser Support

```typescript
await frontendTestingAgent.generateTests({
  targetFile: '/src/pages/LoginPage.tsx',
  testType: 'e2e',
  browser: {
    browsers: ['chromium', 'firefox', 'webkit'],
    viewport: { width: 1280, height: 720 },
    mobile: true,
  },
});
```

### Visual Regression Tests

```typescript
await frontendTestingAgent.generateTests({
  targetFile: '/src/components/Card.tsx',
  testType: 'visual',
  visualRegression: {
    service: 'percy',
    threshold: 0.1,
    ignoreRegions: ['.timestamp', '.dynamic-content'],
  },
});
```

### Accessibility Testing

```typescript
await frontendTestingAgent.generateTests({
  targetFile: '/src/components/Navigation.tsx',
  testType: 'accessibility',
});
```

### Performance Budget Testing

```typescript
await frontendTestingAgent.generateTests({
  targetFile: '/src/pages/HomePage.tsx',
  testType: 'e2e',
  performanceBudget: {
    fcp: 1500, // 1.5s
    lcp: 2500, // 2.5s
    tti: 3500, // 3.5s
    cls: 0.1, // 0.1
  },
});
```

## Generated Test Examples

### Component Test (Vitest)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('should render without crashing', async () => {
    const props = { label: "test", onClick: vi.fn() };
    const { container } = render(<Button {...props} />);

    expect(container).toBeTruthy();
  });

  it('should handle onClick event', async () => {
    const props = { label: "test", onClick: vi.fn() };
    const { container } = render(<Button {...props} />);

    await fireEvent.click(screen.getByRole('button'));

    expect(props.onClick).toHaveBeenCalled();
  });

  it('should update state correctly', async () => {
    const { container } = render(<Button />);

    await fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText(/updated/i)).toBeInTheDocument();
  });
});
```

### E2E Test (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('LoginForm E2E Tests', () => {
  test('should load the page and display component', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="LoginForm"]');

    await expect(page.locator('[data-testid="LoginForm"]')).toBeVisible();

    await page.screenshot({
      path: 'screenshots/LoginForm-should-load-the-page-and-display-component.png',
    });
  });

  test('should submit form successfully', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    await expect(page).toHaveURL(/success/);
  });

  test.describe('Cross-browser testing', () => {
    test.use({ browserName: 'firefox' });

    test('should work in firefox', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('[data-testid="LoginForm"]')).toBeVisible();
    });
  });

  test.describe('Mobile testing', () => {
    test.use({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X)',
    });

    test('should work on mobile', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('[data-testid="LoginForm"]')).toBeVisible();
    });
  });
});
```

### Visual Regression Test

```typescript
import { test } from '@playwright/test';
import { percySnapshot } from '@percy/playwright';

test.describe('Card Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('default state', async ({ page }) => {
    await page.waitForSelector('[data-testid="Card"]');
    await percySnapshot(page, 'Card - Default');
  });

  test('interactive states', async ({ page }) => {
    // Hover state
    await page.hover('[data-testid="Card"]');
    await percySnapshot(page, 'Card - Hover');

    // Active state
    await page.click('[data-testid="Card"]');
    await percySnapshot(page, 'Card - Active');
  });

  test('responsive design', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.waitForTimeout(500); // Wait for any animations
      await percySnapshot(page, `Card - ${viewport.name}`);
    }
  });
});
```

### Accessibility Test

```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

test.describe('Navigation Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
  });

  test('should have no accessibility violations', async ({ page }) => {
    await checkA11y(page, '[data-testid="Navigation"]', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test('should have proper heading structure', async ({ page }) => {
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements =>
      elements.map(el => ({
        level: parseInt(el.tagName[1]),
        text: el.textContent,
      }))
    );

    let previousLevel = 0;
    for (const heading of headings) {
      expect(heading.level).toBeLessThanOrEqual(previousLevel + 1);
      previousLevel = heading.level;
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test Enter key on buttons
    await page.focus('button');
    await page.keyboard.press('Enter');

    // Test Escape key on modals/dropdowns
    const modal = await page.$('[role="dialog"]');
    if (modal) {
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    }
  });
});
```

## Configuration Options

### FrontendTestOptions

```typescript
interface FrontendTestOptions {
  targetFile: string; // Component file to test
  testType: 'component' | 'e2e' | 'visual' | 'accessibility';
  framework?: 'react' | 'vue' | 'svelte';
  browser?: BrowserOptions;
  visualRegression?: VisualRegressionOptions;
  performanceBudget?: PerformanceBudgetOptions;
}
```

### BrowserOptions

```typescript
interface BrowserOptions {
  browsers?: ('chromium' | 'firefox' | 'webkit')[];
  viewport?: { width: number; height: number };
  mobile?: boolean;
}
```

### VisualRegressionOptions

```typescript
interface VisualRegressionOptions {
  service?: 'percy' | 'chromatic' | 'applitools';
  threshold?: number; // Difference threshold (0-1)
  ignoreRegions?: string[]; // CSS selectors to ignore
}
```

### PerformanceBudgetOptions

```typescript
interface PerformanceBudgetOptions {
  fcp?: number; // First Contentful Paint (ms)
  lcp?: number; // Largest Contentful Paint (ms)
  tti?: number; // Time to Interactive (ms)
  cls?: number; // Cumulative Layout Shift (score)
}
```

## Best Practices

### 1. Component Testing

- Test both happy path and edge cases
- Mock external dependencies
- Test user interactions
- Verify accessibility from the start
- Use data-testid attributes for reliable selection

### 2. E2E Testing

- Keep tests independent
- Use proper wait strategies
- Test critical user journeys
- Run tests in multiple browsers
- Include mobile testing

### 3. Visual Testing

- Establish baseline images
- Ignore dynamic content regions
- Test responsive breakpoints
- Review visual diffs carefully
- Version control baselines

### 4. Accessibility Testing

- Test with keyboard only
- Verify screen reader compatibility
- Check color contrast
- Ensure proper focus management
- Test with assistive technologies

### 5. Performance Testing

- Set realistic budgets
- Test on throttled connections
- Monitor trends over time
- Optimize critical rendering path
- Use performance monitoring in production

## Integration with CI/CD

### Vitest Configuration

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/'],
    },
  },
});
```

### Playwright Configuration

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

### GitHub Actions Example

```yaml
- name: Run Frontend Tests
  run: |
    pnpm run test:frontend
    pnpm run test:frontend:coverage

- name: Run E2E Tests
  run: |
    pnpm exec playwright install
    pnpm run test:e2e

- name: Run Visual Tests
  env:
    PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
  run: pnpm run test:visual

- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: |
      coverage/
      playwright-report/
      test-results/
```

## Troubleshooting

### Common Issues

1. **Component Test Failures**
   - Check for missing mocks
   - Verify test environment setup
   - Ensure proper async handling

2. **E2E Test Flakiness**
   - Add proper wait conditions
   - Increase timeouts for CI
   - Check for race conditions

3. **Visual Test Differences**
   - Review font loading
   - Check animation states
   - Verify responsive breakpoints

4. **Accessibility Violations**
   - Fix contrast issues first
   - Add missing ARIA labels
   - Ensure keyboard navigation

### Debug Mode

Enable verbose logging:

```typescript
frontendTestingAgent.debug = true;
```

## Command Line Usage

```bash
# Generate component tests
task-master-agent test:frontend --file src/components/Button.tsx --type component

# Generate E2E tests with mobile
task-master-agent test:frontend --file src/pages/Home.tsx --type e2e --mobile

# Generate visual tests
task-master-agent test:frontend --file src/components/Card.tsx --type visual --service percy

# Generate accessibility tests
task-master-agent test:frontend --file src/layouts/Main.tsx --type a11y
```
