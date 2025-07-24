import { test, expect } from '../fixtures/test-fixtures';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Mock dashboard data
    await authenticatedPage.route('**/api/dashboard/stats', async route => {
      await route.fulfill({
        json: {
          totalTasks: 42,
          completedTasks: 25,
          inProgressTasks: 10,
          pendingTasks: 7,
          totalProjects: 5,
          activeProjects: 3,
          completionRate: 59.52,
          averageTaskTime: 3.5,
        }
      });
    });
    
    await authenticatedPage.route('**/api/projects', async route => {
      await route.fulfill({
        json: [
          {
            id: '1',
            name: 'Test Project 1',
            description: 'First test project',
            tasksCount: 10,
            completedTasksCount: 5,
          },
          {
            id: '2',
            name: 'Test Project 2',
            description: 'Second test project',
            tasksCount: 8,
            completedTasksCount: 6,
          },
        ]
      });
    });
    
    await authenticatedPage.goto('/dashboard');
  });

  test('should display dashboard stats correctly', async ({ authenticatedPage: page }) => {
    // Check stats are displayed
    await expect(page.getByText('42')).toBeVisible(); // Total tasks
    await expect(page.getByText('25')).toBeVisible(); // Completed tasks
    await expect(page.getByText('59.52%')).toBeVisible(); // Completion rate
    
    // Check stat cards
    await expect(page.getByText(/total tasks/i)).toBeVisible();
    await expect(page.getByText(/completed tasks/i)).toBeVisible();
    await expect(page.getByText(/in progress/i)).toBeVisible();
    await expect(page.getByText(/completion rate/i)).toBeVisible();
  });

  test('should display projects list', async ({ authenticatedPage: page }) => {
    // Check projects section
    await expect(page.getByRole('heading', { name: /active projects/i })).toBeVisible();
    
    // Check project cards
    await expect(page.getByText('Test Project 1')).toBeVisible();
    await expect(page.getByText('Test Project 2')).toBeVisible();
    
    // Check progress indicators
    await expect(page.getByText('5 / 10 tasks')).toBeVisible();
    await expect(page.getByText('6 / 8 tasks')).toBeVisible();
  });

  test('should navigate to tasks from quick actions', async ({ authenticatedPage: page }) => {
    // Click on "View All Tasks" quick action
    await page.getByRole('button', { name: /view all tasks/i }).click();
    
    // Should navigate to tasks page
    await expect(page).toHaveURL('/tasks');
  });

  test('should refresh stats on demand', async ({ authenticatedPage: page }) => {
    let refreshCount = 0;
    
    // Mock updated stats
    await page.route('**/api/dashboard/stats', async route => {
      refreshCount++;
      await route.fulfill({
        json: {
          totalTasks: refreshCount === 1 ? 42 : 45,
          completedTasks: 25,
          inProgressTasks: 10,
          pendingTasks: refreshCount === 1 ? 7 : 10,
          totalProjects: 5,
          activeProjects: 3,
          completionRate: 59.52,
          averageTaskTime: 3.5,
        }
      });
    });
    
    // Find and click refresh button
    await page.getByRole('button', { name: /refresh/i }).click();
    
    // Check updated values
    await expect(page.getByText('45')).toBeVisible();
  });

  test('should display activity feed', async ({ authenticatedPage: page }) => {
    // Mock activity data
    await page.route('**/api/dashboard/activity', async route => {
      await route.fulfill({
        json: [
          {
            id: '1',
            type: 'task_completed',
            message: 'Completed task: Setup authentication',
            timestamp: new Date().toISOString(),
            user: { name: 'Test User' },
          },
          {
            id: '2',
            type: 'task_created',
            message: 'Created new task: Write E2E tests',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            user: { name: 'Test User' },
          },
        ]
      });
    });
    
    await page.reload();
    
    // Check activity feed
    await expect(page.getByRole('heading', { name: /recent activity/i })).toBeVisible();
    await expect(page.getByText(/completed task: setup authentication/i)).toBeVisible();
    await expect(page.getByText(/created new task: write e2e tests/i)).toBeVisible();
  });

  test('should handle empty state gracefully', async ({ authenticatedPage: page }) => {
    // Mock empty data
    await page.route('**/api/dashboard/stats', async route => {
      await route.fulfill({
        json: {
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          pendingTasks: 0,
          totalProjects: 0,
          activeProjects: 0,
          completionRate: 0,
          averageTaskTime: 0,
        }
      });
    });
    
    await page.route('**/api/projects', async route => {
      await route.fulfill({ json: [] });
    });
    
    await page.reload();
    
    // Should show empty state messages
    await expect(page.getByText(/no projects yet/i)).toBeVisible();
    await expect(page.getByText(/create your first project/i)).toBeVisible();
  });

  test('should be responsive on mobile', async ({ authenticatedPage: page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Stats should stack vertically
    const statsGrid = page.locator('[class*="grid"]').first();
    await expect(statsGrid).toHaveCSS('grid-template-columns', /1fr/);
    
    // Navigation should be accessible via hamburger menu
    const hamburger = page.getByRole('button', { name: /menu/i });
    await expect(hamburger).toBeVisible();
  });
});