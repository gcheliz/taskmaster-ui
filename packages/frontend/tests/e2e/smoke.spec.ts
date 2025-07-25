import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('application should load', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login');
    
    // Check that the login page loads
    await expect(page.getByText(/sign in/i)).toBeVisible();
  });

  test('login page has required elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check for logo/brand
    await expect(page.getByText(/taskmaster/i)).toBeVisible();
    
    // Check for form elements
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('application responds to user input', async ({ page }) => {
    await page.goto('/login');
    
    // Type in email field
    const emailField = page.getByLabel(/email/i);
    await emailField.fill('test@example.com');
    await expect(emailField).toHaveValue('test@example.com');
    
    // Type in password field
    const passwordField = page.getByLabel(/password/i);
    await passwordField.fill('testpassword');
    await expect(passwordField).toHaveValue('testpassword');
  });
});