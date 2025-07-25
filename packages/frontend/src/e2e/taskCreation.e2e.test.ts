import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173'

test.describe('Task Creation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(BASE_URL)
    
    // Wait for the application to load
    await page.waitForSelector('[data-testid="task-board"]', { timeout: 10000 })
  })

  test('should create a task successfully', async ({ page }) => {
    // Click the Add Task button
    await page.click('button:has-text("Add Task")')

    // Wait for modal to open
    await expect(page.locator('text=Create New Task')).toBeVisible()

    // Fill in the form
    await page.fill('[data-testid="task-title-input"]', 'E2E Test Task')
    await page.fill('[data-testid="task-description-input"]', 'This is an end-to-end test task creation')
    await page.selectOption('[data-testid="task-priority-select"]', 'high')
    await page.selectOption('[data-testid="task-status-select"]', 'pending')

    // Add optional fields
    await page.fill('[data-testid="task-assigned-to-input"]', 'test@example.com')
    await page.fill('[data-testid="task-estimated-hours-input"]', '8')
    await page.fill('[data-testid="task-tags-input"]', 'e2e, test, automated')

    // Set due date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    await page.fill('[data-testid="task-due-date-input"]', dateString)

    // Submit the form
    await page.click('[data-testid="task-save-button"]')

    // Check for optimistic update - task should appear immediately
    const newTask = page.locator('text=E2E Test Task')
    await expect(newTask).toBeVisible({ timeout: 1000 })

    // Check for saving indicator
    await expect(page.locator('text=Saving...')).toBeVisible()

    // Wait for saving to complete
    await expect(page.locator('text=Saving...')).not.toBeVisible({ timeout: 10000 })

    // Verify success notification
    await expect(page.locator('text=/Task.*created successfully/i')).toBeVisible()

    // Verify task is still visible after save
    await expect(newTask).toBeVisible()

    // Verify modal is closed
    await expect(page.locator('text=Create New Task')).not.toBeVisible()

    // Verify task details are correct
    const taskCard = page.locator('[class*="task-card"]', { hasText: 'E2E Test Task' })
    await expect(taskCard.locator('text=high')).toBeVisible()
    await expect(taskCard.locator('text=test@example.com')).toBeVisible()
    await expect(taskCard.locator('text=8h')).toBeVisible()
  })

  test('should show validation errors for invalid input', async ({ page }) => {
    // Click the Add Task button
    await page.click('button:has-text("Add Task")')

    // Try to submit without filling required fields
    await page.click('[data-testid="task-save-button"]')

    // Check for validation errors
    await expect(page.locator('text=Title is required')).toBeVisible()
    await expect(page.locator('text=Description is required')).toBeVisible()

    // Fill title with too few characters
    await page.fill('[data-testid="task-title-input"]', 'AB')
    await page.click('[data-testid="task-save-button"]')
    await expect(page.locator('text=/Title must be at least 3 characters/i')).toBeVisible()

    // Fill description with too few characters
    await page.fill('[data-testid="task-description-input"]', 'Too short')
    await page.click('[data-testid="task-save-button"]')
    await expect(page.locator('text=/Description must be at least 10 characters/i')).toBeVisible()

    // Set past due date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateString = yesterday.toISOString().split('T')[0]
    await page.fill('[data-testid="task-due-date-input"]', dateString)
    await page.click('[data-testid="task-save-button"]')
    await expect(page.locator('text=/Due date cannot be in the past/i')).toBeVisible()
  })

  test('should handle server errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/tasks', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Task with this title already exists',
            },
          }),
        })
      } else {
        route.continue()
      }
    })

    // Create a task
    await page.click('button:has-text("Add Task")')
    await page.fill('[data-testid="task-title-input"]', 'Duplicate Task')
    await page.fill('[data-testid="task-description-input"]', 'This task will fail on the server')
    await page.click('[data-testid="task-save-button"]')

    // Task should appear with optimistic update
    await expect(page.locator('text=Duplicate Task')).toBeVisible({ timeout: 1000 })
    await expect(page.locator('text=Saving...')).toBeVisible()

    // Wait for error and rollback
    await expect(page.locator('text=Duplicate Task')).not.toBeVisible({ timeout: 5000 })

    // Error notification should appear
    await expect(page.locator('text=/Task with this title already exists/i')).toBeVisible()

    // Modal should remain open
    await expect(page.locator('text=Create New Task')).toBeVisible()

    // Form data should be preserved
    const titleInput = page.locator('[data-testid="task-title-input"]')
    await expect(titleInput).toHaveValue('Duplicate Task')
  })

  test('should create multiple tasks in succession', async ({ page }) => {
    // Create first task
    await page.click('button:has-text("Add Task")')
    await page.fill('[data-testid="task-title-input"]', 'First E2E Task')
    await page.fill('[data-testid="task-description-input"]', 'First task created in E2E test')
    await page.click('[data-testid="task-save-button"]')

    // Wait for first task to complete
    await expect(page.locator('text=First E2E Task')).toBeVisible()
    await expect(page.locator('text=Saving...').first()).not.toBeVisible({ timeout: 10000 })

    // Create second task immediately
    await page.click('button:has-text("Add Task")')
    await page.fill('[data-testid="task-title-input"]', 'Second E2E Task')
    await page.fill('[data-testid="task-description-input"]', 'Second task created in E2E test')
    await page.click('[data-testid="task-save-button"]')

    // Both tasks should be visible
    await expect(page.locator('text=First E2E Task')).toBeVisible()
    await expect(page.locator('text=Second E2E Task')).toBeVisible()

    // Wait for all saving to complete
    await expect(page.locator('text=Saving...')).not.toBeVisible({ timeout: 10000 })

    // Both tasks should remain visible
    await expect(page.locator('text=First E2E Task')).toBeVisible()
    await expect(page.locator('text=Second E2E Task')).toBeVisible()
  })

  test('should place tasks in correct columns based on status', async ({ page }) => {
    // Create a task with "in-progress" status
    await page.click('button:has-text("Add Task")')
    await page.fill('[data-testid="task-title-input"]', 'In Progress Task')
    await page.fill('[data-testid="task-description-input"]', 'This task should appear in the In Progress column')
    await page.selectOption('[data-testid="task-status-select"]', 'in-progress')
    await page.click('[data-testid="task-save-button"]')

    // Wait for task to appear
    await expect(page.locator('text=In Progress Task')).toBeVisible()

    // Find the In Progress column
    const inProgressColumn = page.locator('[data-testid="kanban-column-in-progress"]')
    
    // Verify task is in the correct column
    await expect(inProgressColumn.locator('text=In Progress Task')).toBeVisible()

    // Create a "done" task
    await page.click('button:has-text("Add Task")')
    await page.fill('[data-testid="task-title-input"]', 'Completed Task')
    await page.fill('[data-testid="task-description-input"]', 'This task should appear in the Done column')
    await page.selectOption('[data-testid="task-status-select"]', 'done')
    await page.click('[data-testid="task-save-button"]')

    // Verify task is in Done column
    const doneColumn = page.locator('[data-testid="kanban-column-done"]')
    await expect(doneColumn.locator('text=Completed Task')).toBeVisible()
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Open modal with keyboard
    await page.keyboard.press('Tab') // Focus on first interactive element
    await page.keyboard.press('Tab') // Navigate to Add Task button
    await page.keyboard.press('Enter') // Open modal

    // Modal should be open
    await expect(page.locator('text=Create New Task')).toBeVisible()

    // Navigate through form fields with Tab
    await page.keyboard.press('Tab') // Focus on title input
    await page.keyboard.type('Keyboard Navigation Task')

    await page.keyboard.press('Tab') // Move to description
    await page.keyboard.type('Task created using keyboard navigation')

    await page.keyboard.press('Tab') // Move to priority
    await page.keyboard.press('ArrowDown') // Select high priority

    // Submit with keyboard
    await page.keyboard.press('Tab') // Continue tabbing to submit button
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter') // Submit form

    // Task should be created
    await expect(page.locator('text=Keyboard Navigation Task')).toBeVisible()
  })

  test('should handle network interruption', async ({ page }) => {
    // Simulate network going offline after form submission
    await page.click('button:has-text("Add Task")')
    await page.fill('[data-testid="task-title-input"]', 'Offline Test Task')
    await page.fill('[data-testid="task-description-input"]', 'Task created while network is interrupted')

    // Intercept the request and simulate network error
    await page.route('**/api/tasks', (route) => {
      route.abort('failed')
    })

    // Submit the form
    await page.click('[data-testid="task-save-button"]')

    // Task should appear optimistically
    await expect(page.locator('text=Offline Test Task')).toBeVisible({ timeout: 1000 })

    // Should show saving indicator
    await expect(page.locator('text=Saving...')).toBeVisible()

    // Task should be removed after network error
    await expect(page.locator('text=Offline Test Task')).not.toBeVisible({ timeout: 10000 })

    // Error message should appear
    await expect(page.locator('text=/Failed to create task/i')).toBeVisible()
  })

  test('should preserve form data on error', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/tasks', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Server error occurred',
          },
        }),
      })
    })

    // Fill out the form completely
    await page.click('button:has-text("Add Task")')
    await page.fill('[data-testid="task-title-input"]', 'Preserved Form Task')
    await page.fill('[data-testid="task-description-input"]', 'This form data should be preserved on error')
    await page.selectOption('[data-testid="task-priority-select"]', 'urgent')
    await page.fill('[data-testid="task-assigned-to-input"]', 'preserved@example.com')
    await page.fill('[data-testid="task-estimated-hours-input"]', '16')
    await page.fill('[data-testid="task-tags-input"]', 'preserved, error, test')
    await page.fill('[data-testid="task-details-input"]', 'These are preserved details')
    await page.fill('[data-testid="task-test-strategy-input"]', 'Preserved test strategy')

    // Submit and get error
    await page.click('[data-testid="task-save-button"]')

    // Wait for error
    await expect(page.locator('text=/Server error occurred/i')).toBeVisible({ timeout: 10000 })

    // All form data should be preserved
    await expect(page.locator('[data-testid="task-title-input"]')).toHaveValue('Preserved Form Task')
    await expect(page.locator('[data-testid="task-description-input"]')).toHaveValue('This form data should be preserved on error')
    await expect(page.locator('[data-testid="task-priority-select"]')).toHaveValue('urgent')
    await expect(page.locator('[data-testid="task-assigned-to-input"]')).toHaveValue('preserved@example.com')
    await expect(page.locator('[data-testid="task-estimated-hours-input"]')).toHaveValue('16')
    await expect(page.locator('[data-testid="task-tags-input"]')).toHaveValue('preserved, error, test')
    await expect(page.locator('[data-testid="task-details-input"]')).toHaveValue('These are preserved details')
    await expect(page.locator('[data-testid="task-test-strategy-input"]')).toHaveValue('Preserved test strategy')
  })
})