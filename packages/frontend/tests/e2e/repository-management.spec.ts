import { test, expect } from '@playwright/test';

test.describe('Repository Management', () => {
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

    // Mock repositories endpoint
    await page.route('**/api/repositories', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 1,
              name: 'test-repo-1',
              url: 'https://github.com/user/test-repo-1',
              description: 'First test repository',
              isActive: true,
              lastSyncedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 2,
              name: 'test-repo-2',
              url: 'https://github.com/user/test-repo-2',
              description: 'Second test repository',
              isActive: false,
              lastSyncedAt: new Date(Date.now() - 86400000).toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]),
        });
      }
    });

    // Navigate to repositories page
    await page.goto('/repositories');
  });

  test('should display repository list', async ({ page }) => {
    // Check repositories are displayed
    await expect(page.getByText('test-repo-1')).toBeVisible();
    await expect(page.getByText('test-repo-2')).toBeVisible();
    
    // Check repository details
    await expect(page.getByText('First test repository')).toBeVisible();
    await expect(page.getByText('Second test repository')).toBeVisible();
  });

  test('should add a new repository', async ({ page }) => {
    // Mock repository creation
    await page.route('**/api/repositories', async route => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 3,
            ...postData,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });
      }
    });

    // Click add repository button
    await page.getByRole('button', { name: /add repository/i }).click();
    
    // Fill in repository details
    await page.getByLabel(/repository name/i).fill('new-test-repo');
    await page.getByLabel(/repository url/i).fill('https://github.com/user/new-test-repo');
    await page.getByLabel(/description/i).fill('A new test repository');
    
    // Submit form
    await page.getByRole('button', { name: /create repository/i }).click();
    
    // Check repository is added
    await expect(page.getByText('new-test-repo')).toBeVisible();
    await expect(page.getByText('A new test repository')).toBeVisible();
  });

  test('should validate repository URL', async ({ page }) => {
    // Click add repository button
    await page.getByRole('button', { name: /add repository/i }).click();
    
    // Fill in invalid URL
    await page.getByLabel(/repository name/i).fill('invalid-repo');
    await page.getByLabel(/repository url/i).fill('not-a-valid-url');
    
    // Try to submit
    await page.getByRole('button', { name: /create repository/i }).click();
    
    // Check for validation error
    await expect(page.getByText(/invalid.*url/i)).toBeVisible();
  });

  test('should view repository details', async ({ page }) => {
    // Mock repository detail endpoint
    await page.route('**/api/repositories/1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          name: 'test-repo-1',
          url: 'https://github.com/user/test-repo-1',
          description: 'First test repository',
          isActive: true,
          lastSyncedAt: new Date().toISOString(),
          stats: {
            totalCommits: 150,
            totalIssues: 25,
            totalPullRequests: 30,
            contributors: 5,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
    });

    // Click on repository
    await page.getByText('test-repo-1').click();
    
    // Check detail page loaded
    await expect(page).toHaveURL(/\/repositories\/1/);
    await expect(page.getByText('First test repository')).toBeVisible();
    
    // Check stats are displayed
    await expect(page.getByText(/150.*commits/i)).toBeVisible();
    await expect(page.getByText(/25.*issues/i)).toBeVisible();
  });

  test('should edit repository', async ({ page }) => {
    // Navigate to repository detail
    await page.getByText('test-repo-1').click();
    
    // Mock repository update
    await page.route('**/api/repositories/1', async route => {
      if (route.request().method() === 'PUT') {
        const putData = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            ...putData,
            updatedAt: new Date().toISOString(),
          }),
        });
      }
    });

    // Click edit button
    await page.getByRole('button', { name: /edit.*repository/i }).click();
    
    // Update description
    await page.getByLabel(/description/i).clear();
    await page.getByLabel(/description/i).fill('Updated repository description');
    
    // Save changes
    await page.getByRole('button', { name: /save changes/i }).click();
    
    // Check updated description
    await expect(page.getByText('Updated repository description')).toBeVisible();
  });

  test('should delete repository', async ({ page }) => {
    // Mock repository deletion
    await page.route('**/api/repositories/1', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 204,
        });
      }
    });

    // Find delete button for first repository
    const repoCard = page.locator('[data-testid="repository-card"]').filter({ hasText: 'test-repo-1' });
    await repoCard.getByRole('button', { name: /delete/i }).click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /confirm/i }).click();
    
    // Check repository is removed
    await expect(page.getByText('test-repo-1')).not.toBeVisible();
  });

  test('should sync repository', async ({ page }) => {
    // Navigate to repository detail
    await page.getByText('test-repo-1').click();
    
    // Mock sync endpoint
    await page.route('**/api/repositories/1/sync', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          lastSyncedAt: new Date().toISOString(),
          message: 'Repository synced successfully',
        }),
      });
    });

    // Click sync button
    await page.getByRole('button', { name: /sync/i }).click();
    
    // Check loading state
    await expect(page.getByText(/syncing/i)).toBeVisible();
    
    // Check success message
    await expect(page.getByText(/sync.*success/i)).toBeVisible();
  });

  test('should filter repositories by status', async ({ page }) => {
    // Click filter button
    await page.getByRole('button', { name: /filter/i }).click();
    
    // Select active only
    await page.getByLabel(/active only/i).check();
    
    // Check only active repository is visible
    await expect(page.getByText('test-repo-1')).toBeVisible();
    await expect(page.getByText('test-repo-2')).not.toBeVisible();
  });

  test('should search repositories', async ({ page }) => {
    // Type in search box
    await page.getByPlaceholder(/search repositories/i).fill('repo-1');
    
    // Check filtered results
    await expect(page.getByText('test-repo-1')).toBeVisible();
    await expect(page.getByText('test-repo-2')).not.toBeVisible();
    
    // Clear search
    await page.getByPlaceholder(/search repositories/i).clear();
    
    // All repositories should be visible again
    await expect(page.getByText('test-repo-1')).toBeVisible();
    await expect(page.getByText('test-repo-2')).toBeVisible();
  });

  test('should handle repository sync errors', async ({ page }) => {
    // Navigate to repository detail
    await page.getByText('test-repo-1').click();
    
    // Mock sync error
    await page.route('**/api/repositories/1/sync', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Failed to sync repository',
        }),
      });
    });

    // Click sync button
    await page.getByRole('button', { name: /sync/i }).click();
    
    // Check error message
    await expect(page.getByText(/failed to sync/i)).toBeVisible();
  });

  test('should display repository health metrics', async ({ page }) => {
    // Navigate to repository detail
    await page.getByText('test-repo-1').click();
    
    // Mock health metrics endpoint
    await page.route('**/api/repositories/1/health', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          healthScore: 85,
          metrics: {
            codeQuality: 90,
            testCoverage: 80,
            documentation: 75,
            security: 95,
          },
        }),
      });
    });

    // Click health metrics tab/button
    await page.getByRole('button', { name: /health/i }).click();
    
    // Check health score
    await expect(page.getByText(/85.*health score/i)).toBeVisible();
    
    // Check individual metrics
    await expect(page.getByText(/90.*code quality/i)).toBeVisible();
    await expect(page.getByText(/80.*test coverage/i)).toBeVisible();
  });
});