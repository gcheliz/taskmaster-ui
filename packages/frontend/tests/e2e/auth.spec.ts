import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from login page
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Check login form elements are present
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    
    // Check page title
    await expect(page).toHaveTitle(/taskmaster/i);
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Click submit without filling form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should successfully login and redirect to dashboard', async ({ page }) => {
    // Mock successful login response
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'test-token',
          user: {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
          },
        }),
      });
    });

    // Mock user info endpoint
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

    // Fill in valid credentials
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Check dashboard elements
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('should persist authentication across page refreshes', async ({ page, context }) => {
    // Set auth token in localStorage
    await context.addInitScript(() => {
      localStorage.setItem('auth_token', 'test-token');
    });

    // Mock user info endpoint
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

    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Should stay on dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Refresh page
    await page.reload();
    
    // Should still be on dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page, context }) => {
    // Set auth token
    await context.addInitScript(() => {
      localStorage.setItem('auth_token', 'test-token');
    });

    // Mock user info endpoint
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

    // Start from dashboard
    await page.goto('/dashboard');
    
    // Click logout button
    await page.getByRole('button', { name: /logout/i }).click();
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    
    // Check token is removed
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeNull();
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Try to access dashboard without auth
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/auth/login', async route => {
      await route.abort('failed');
    });

    // Fill in credentials
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for error message
    await expect(page.getByText(/network error|failed to connect/i)).toBeVisible();
  });
});