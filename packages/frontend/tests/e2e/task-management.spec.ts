import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
  // Set up authentication before each test
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

    // Mock tasks endpoint
    await page.route('**/api/tasks', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 1,
              title: 'Test Task 1',
              description: 'Description for task 1',
              status: 'pending',
              priority: 'high',
              complexity: 5,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 2,
              title: 'Test Task 2',
              description: 'Description for task 2',
              status: 'in_progress',
              priority: 'medium',
              complexity: 3,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]),
        });
      }
    });

    // Navigate to task board
    await page.goto('/tasks');
  });

  test('should display task board with columns', async ({ page }) => {
    // Check all columns are visible
    await expect(page.getByText('To Do')).toBeVisible();
    await expect(page.getByText('In Progress')).toBeVisible();
    await expect(page.getByText('Testing')).toBeVisible();
    await expect(page.getByText('Done')).toBeVisible();
    
    // Check tasks are displayed
    await expect(page.getByText('Test Task 1')).toBeVisible();
    await expect(page.getByText('Test Task 2')).toBeVisible();
  });

  test('should open task creation modal', async ({ page }) => {
    // Click add task button
    await page.getByRole('button', { name: /add task/i }).click();
    
    // Check modal is open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel(/title/i)).toBeVisible();
    await expect(page.getByLabel(/description/i)).toBeVisible();
    await expect(page.getByLabel(/priority/i)).toBeVisible();
    await expect(page.getByLabel(/complexity/i)).toBeVisible();
  });

  test('should create a new task', async ({ page }) => {
    // Mock task creation
    await page.route('**/api/tasks', async route => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 3,
            ...postData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });
      }
    });

    // Open task creation modal
    await page.getByRole('button', { name: /add task/i }).click();
    
    // Fill in task details
    await page.getByLabel(/title/i).fill('New Test Task');
    await page.getByLabel(/description/i).fill('This is a new task description');
    await page.getByLabel(/priority/i).selectOption('high');
    await page.getByLabel(/complexity/i).fill('8');
    
    // Submit form
    await page.getByRole('button', { name: /create task/i }).click();
    
    // Check task is added to board
    await expect(page.getByText('New Test Task')).toBeVisible();
    
    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should view task details', async ({ page }) => {
    // Click on a task
    await page.getByText('Test Task 1').click();
    
    // Check modal opens with task details
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Test Task 1')).toBeVisible();
    await expect(page.getByText('Description for task 1')).toBeVisible();
    await expect(page.getByText(/high/i)).toBeVisible();
  });

  test('should edit a task', async ({ page }) => {
    // Mock task update
    await page.route('**/api/tasks/1', async route => {
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

    // Click on task to open modal
    await page.getByText('Test Task 1').click();
    
    // Click edit button
    await page.getByRole('button', { name: /edit task/i }).click();
    
    // Update task title
    await page.getByLabel(/title/i).clear();
    await page.getByLabel(/title/i).fill('Updated Task Title');
    
    // Save changes
    await page.getByRole('button', { name: /save changes/i }).click();
    
    // Check task is updated
    await expect(page.getByText('Updated Task Title')).toBeVisible();
  });

  test('should delete a task', async ({ page }) => {
    // Mock task deletion
    await page.route('**/api/tasks/1', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 204,
        });
      }
    });

    // Click on task to open modal
    await page.getByText('Test Task 1').click();
    
    // Click edit button
    await page.getByRole('button', { name: /edit task/i }).click();
    
    // Click delete button
    await page.getByRole('button', { name: /delete task/i }).click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /confirm/i }).click();
    
    // Check task is removed
    await expect(page.getByText('Test Task 1')).not.toBeVisible();
  });

  test('should filter tasks by priority', async ({ page }) => {
    // Click filter button
    await page.getByRole('button', { name: /filter/i }).click();
    
    // Select high priority filter
    await page.getByLabel(/high/i).check();
    
    // Check only high priority tasks are visible
    await expect(page.getByText('Test Task 1')).toBeVisible();
    await expect(page.getByText('Test Task 2')).not.toBeVisible();
  });

  test('should sort tasks', async ({ page }) => {
    // Click sort button
    await page.getByRole('button', { name: /sort/i }).click();
    
    // Select priority sorting
    await page.getByText(/priority/i).click();
    
    // Verify tasks are sorted by priority (high priority first)
    const tasks = await page.locator('[data-testid="task-card"]').allTextContents();
    expect(tasks[0]).toContain('Test Task 1'); // High priority
    expect(tasks[1]).toContain('Test Task 2'); // Medium priority
  });

  test('should drag and drop tasks between columns', async ({ page }) => {
    // Mock task status update
    await page.route('**/api/tasks/1', async route => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            title: 'Test Task 1',
            status: 'in_progress',
            updatedAt: new Date().toISOString(),
          }),
        });
      }
    });

    // Get task element
    const task = page.getByText('Test Task 1');
    const inProgressColumn = page.locator('[data-column-id="in-progress"]');
    
    // Drag task to In Progress column
    await task.dragTo(inProgressColumn);
    
    // Verify task moved to new column
    await expect(inProgressColumn.getByText('Test Task 1')).toBeVisible();
  });

  test('should handle validation errors', async ({ page }) => {
    // Open task creation modal
    await page.getByRole('button', { name: /add task/i }).click();
    
    // Try to submit without required fields
    await page.getByRole('button', { name: /create task/i }).click();
    
    // Check for validation errors
    await expect(page.getByText(/title is required/i)).toBeVisible();
  });

  test('should export tasks', async ({ page }) => {
    // Mock export endpoint
    await page.route('**/api/export/tasks', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            { id: 1, title: 'Test Task 1', status: 'pending' },
            { id: 2, title: 'Test Task 2', status: 'in_progress' },
          ],
        }),
      });
    });

    // Click export button
    await page.getByRole('button', { name: /export/i }).click();
    
    // Select JSON format
    await page.getByText(/export as json/i).click();
    
    // Verify download initiated (check for success message)
    await expect(page.getByText(/export.*success/i)).toBeVisible();
  });
});