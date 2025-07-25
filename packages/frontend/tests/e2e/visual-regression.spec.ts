import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set auth token
    await context.addInitScript(() => {
      localStorage.setItem('auth_token', 'test-token');
    });

    // Mock user endpoint
    await page.route('**/api/auth/user', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
        }),
      });
    });
  });

  test('login page visual snapshot', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for page to be stable
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('dashboard visual snapshot', async ({ page }) => {
    // Mock dashboard data
    await page.route('**/api/dashboard/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          taskCounts: {
            total: 50,
            completed: 20,
            inProgress: 15,
            pending: 15,
          },
          repositoryCount: 5,
          recentActivity: [
            { type: 'task_created', timestamp: new Date().toISOString() },
            { type: 'task_completed', timestamp: new Date().toISOString() },
          ],
        }),
      });
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('task board visual snapshot', async ({ page }) => {
    // Mock tasks data
    await page.route('**/api/tasks', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            title: 'Visual Test Task 1',
            description: 'Description for visual test',
            status: 'pending',
            priority: 'high',
            complexity: 5,
          },
          {
            id: 2,
            title: 'Visual Test Task 2',
            description: 'Another task for visual test',
            status: 'in_progress',
            priority: 'medium',
            complexity: 3,
          },
          {
            id: 3,
            title: 'Visual Test Task 3',
            description: 'Completed task',
            status: 'done',
            priority: 'low',
            complexity: 1,
          },
        ]),
      });
    });

    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    // Wait for animations to complete
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('task-board.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('task modal visual snapshot', async ({ page }) => {
    // Navigate to task board
    await page.goto('/tasks');
    
    // Open add task modal
    await page.getByRole('button', { name: /add task/i }).click();
    
    // Wait for modal animation
    await page.waitForTimeout(500);
    
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('task-modal.png', {
      animations: 'disabled',
    });
  });

  test('repositories page visual snapshot', async ({ page }) => {
    // Mock repositories data
    await page.route('**/api/repositories', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'visual-test-repo-1',
            url: 'https://github.com/user/repo1',
            description: 'Active repository for visual testing',
            isActive: true,
            lastSyncedAt: new Date().toISOString(),
          },
          {
            id: 2,
            name: 'visual-test-repo-2',
            url: 'https://github.com/user/repo2',
            description: 'Inactive repository for visual testing',
            isActive: false,
            lastSyncedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          },
        ]),
      });
    });

    await page.goto('/repositories');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('repositories.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('dark mode visual snapshot', async ({ page }) => {
    // Enable dark mode
    await page.goto('/dashboard');
    
    // Toggle dark mode
    await page.getByRole('button', { name: /theme/i }).click();
    await page.getByText(/dark/i).click();
    
    // Wait for theme transition
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('dashboard-dark-mode.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('mobile responsive visual snapshot', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('error state visual snapshot', async ({ page }) => {
    // Mock error response
    await page.route('**/api/tasks', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error',
        }),
      });
    });

    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('error-state.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('loading state visual snapshot', async ({ page }) => {
    // Delay API response to capture loading state
    await page.route('**/api/tasks', async route => {
      await page.waitForTimeout(2000);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/tasks');
    
    // Capture loading state
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('loading-state.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('empty state visual snapshot', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/tasks', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('empty-state.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});