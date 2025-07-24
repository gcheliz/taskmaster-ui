import { test, expect, testData } from '../fixtures/test-fixtures';

test.describe('Task Board', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Mock tasks data
    await authenticatedPage.route('**/api/tasks', async route => {
      await route.fulfill({
        json: [
          {
            id: '1',
            title: 'Setup Database',
            description: 'Configure PostgreSQL database',
            status: 'pending',
            priority: 'high',
            projectId: 'project-1',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Create API Endpoints',
            description: 'Build REST API',
            status: 'in-progress',
            priority: 'medium',
            projectId: 'project-1',
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            title: 'Write Documentation',
            description: 'API documentation',
            status: 'done',
            priority: 'low',
            projectId: 'project-1',
            createdAt: new Date().toISOString(),
          },
        ]
      });
    });
    
    await authenticatedPage.goto('/tasks');
  });

  test('should display tasks in correct columns', async ({ authenticatedPage: page }) => {
    // Check kanban columns
    const pendingColumn = page.locator('[data-testid="column-pending"]');
    const inProgressColumn = page.locator('[data-testid="column-in-progress"]');
    const doneColumn = page.locator('[data-testid="column-done"]');
    
    await expect(pendingColumn).toContainText('Setup Database');
    await expect(inProgressColumn).toContainText('Create API Endpoints');
    await expect(doneColumn).toContainText('Write Documentation');
    
    // Check task counts
    await expect(pendingColumn).toContainText('1');
    await expect(inProgressColumn).toContainText('1');
    await expect(doneColumn).toContainText('1');
  });

  test('should create a new task', async ({ authenticatedPage: page }) => {
    // Mock task creation
    await page.route('**/api/tasks', async (route, request) => {
      if (request.method() === 'POST') {
        const body = await request.postData();
        const task = JSON.parse(body || '{}');
        await route.fulfill({
          json: {
            id: '4',
            ...task,
            createdAt: new Date().toISOString(),
          }
        });
      } else {
        await route.continue();
      }
    });
    
    // Click add task button
    await page.getByRole('button', { name: /add task/i }).click();
    
    // Fill task form
    await page.getByLabel(/title/i).fill('New Test Task');
    await page.getByLabel(/description/i).fill('This is a test task');
    await page.getByLabel(/priority/i).selectOption('high');
    
    // Submit form
    await page.getByRole('button', { name: /create/i }).click();
    
    // Task should appear in pending column
    await expect(page.locator('[data-testid="column-pending"]')).toContainText('New Test Task');
  });

  test('should drag and drop tasks between columns', async ({ authenticatedPage: page }) => {
    // Get task card
    const taskCard = page.locator('[data-testid="task-1"]');
    const inProgressColumn = page.locator('[data-testid="column-in-progress"]');
    
    // Drag task from pending to in-progress
    await taskCard.dragTo(inProgressColumn);
    
    // Task should now be in in-progress column
    await expect(inProgressColumn).toContainText('Setup Database');
    
    // Pending column should not contain the task
    await expect(page.locator('[data-testid="column-pending"]')).not.toContainText('Setup Database');
  });

  test('should filter tasks by search', async ({ authenticatedPage: page }) => {
    // Type in search box
    await page.getByPlaceholder(/search tasks/i).fill('API');
    
    // Should only show matching task
    await expect(page.getByText('Create API Endpoints')).toBeVisible();
    await expect(page.getByText('Setup Database')).not.toBeVisible();
    await expect(page.getByText('Write Documentation')).not.toBeVisible();
    
    // Clear search
    await page.getByPlaceholder(/search tasks/i).clear();
    
    // All tasks should be visible again
    await expect(page.getByText('Setup Database')).toBeVisible();
    await expect(page.getByText('Create API Endpoints')).toBeVisible();
    await expect(page.getByText('Write Documentation')).toBeVisible();
  });

  test('should filter tasks by priority', async ({ authenticatedPage: page }) => {
    // Click priority filter
    await page.getByRole('button', { name: /filter by priority/i }).click();
    
    // Select high priority
    await page.getByRole('option', { name: /high/i }).click();
    
    // Should only show high priority tasks
    await expect(page.getByText('Setup Database')).toBeVisible();
    await expect(page.getByText('Create API Endpoints')).not.toBeVisible();
    await expect(page.getByText('Write Documentation')).not.toBeVisible();
  });

  test('should open task details modal', async ({ authenticatedPage: page }) => {
    // Click on a task
    await page.getByText('Setup Database').click();
    
    // Modal should open
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Check modal content
    await expect(page.getByRole('heading', { name: 'Setup Database' })).toBeVisible();
    await expect(page.getByText('Configure PostgreSQL database')).toBeVisible();
    await expect(page.getByText(/high priority/i)).toBeVisible();
    
    // Close modal
    await page.getByRole('button', { name: /close/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should edit task details', async ({ authenticatedPage: page }) => {
    // Mock task update
    await page.route('**/api/tasks/1', async route => {
      await route.fulfill({
        json: {
          id: '1',
          title: 'Updated Task Title',
          description: 'Updated description',
          status: 'pending',
          priority: 'medium',
          projectId: 'project-1',
          createdAt: new Date().toISOString(),
        }
      });
    });
    
    // Open task modal
    await page.getByText('Setup Database').click();
    
    // Click edit button
    await page.getByRole('button', { name: /edit/i }).click();
    
    // Update task
    await page.getByLabel(/title/i).clear();
    await page.getByLabel(/title/i).fill('Updated Task Title');
    
    // Save changes
    await page.getByRole('button', { name: /save/i }).click();
    
    // Check task is updated
    await expect(page.getByText('Updated Task Title')).toBeVisible();
  });

  test('should delete a task', async ({ authenticatedPage: page }) => {
    // Mock task deletion
    await page.route('**/api/tasks/1', async (route, request) => {
      if (request.method() === 'DELETE') {
        await route.fulfill({ status: 204 });
      } else {
        await route.continue();
      }
    });
    
    // Open task modal
    await page.getByText('Setup Database').click();
    
    // Click delete button
    await page.getByRole('button', { name: /delete/i }).click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /confirm/i }).click();
    
    // Task should be removed
    await expect(page.getByText('Setup Database')).not.toBeVisible();
  });

  test('should handle real-time updates', async ({ authenticatedPage: page }) => {
    // Simulate WebSocket message for new task
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('websocket-message', {
        detail: {
          type: 'task_created',
          data: {
            id: '5',
            title: 'Real-time Task',
            description: 'Added via WebSocket',
            status: 'pending',
            priority: 'high',
            projectId: 'project-1',
            createdAt: new Date().toISOString(),
          }
        }
      }));
    });
    
    // New task should appear
    await expect(page.getByText('Real-time Task')).toBeVisible();
  });

  test('should switch between board and list views', async ({ authenticatedPage: page }) => {
    // Default should be board view
    await expect(page.locator('[data-view="board"]')).toBeVisible();
    
    // Switch to list view
    await page.getByRole('button', { name: /list view/i }).click();
    
    // Should show list view
    await expect(page.locator('[data-view="list"]')).toBeVisible();
    
    // Tasks should still be visible
    await expect(page.getByText('Setup Database')).toBeVisible();
    await expect(page.getByText('Create API Endpoints')).toBeVisible();
    
    // Switch back to board view
    await page.getByRole('button', { name: /board view/i }).click();
    await expect(page.locator('[data-view="board"]')).toBeVisible();
  });
});