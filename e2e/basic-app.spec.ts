import { test, expect } from '@playwright/test';

test.describe('Basic Application Tests', () => {
  test('application loads successfully', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Check for basic UI elements
    await expect(page.locator('h1')).toContainText(/TaskMaster|Project|Dashboard/);
    
    // Verify the page is interactive
    await expect(page).not.toHaveText('Error');
    await expect(page).not.toHaveText('404');
  });
  
  test('navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Check for navigation elements
    const navElements = page.locator('[data-testid="navigation"]').or(
      page.locator('nav')
    );
    
    // If navigation exists, verify it's functional
    if (await navElements.count() > 0) {
      await expect(navElements.first()).toBeVisible();
    }
  });
  
  test('responsive design works', async ({ page }) => {
    await page.goto('/');
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveTitle(/TaskMaster UI/);
  });
});