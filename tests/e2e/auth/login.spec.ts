import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show login page when not authenticated', async ({ page }) => {
    // Clear any existing auth
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.reload();
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login');
    
    // Should show login elements
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByText(/sign in with github/i)).toBeVisible();
  });

  test('should redirect to dashboard after GitHub OAuth', async ({ page }) => {
    // Mock OAuth callback
    await page.route('**/api/auth/github', async route => {
      await route.fulfill({
        status: 302,
        headers: {
          'Location': '/auth/callback?token=mock-token'
        }
      });
    });
    
    // Mock user data
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        json: {
          id: 'test-user',
          name: 'Test User',
          email: 'test@example.com',
          avatar: 'https://github.com/test.png',
          provider: 'github',
        }
      });
    });
    
    // Click GitHub login
    await page.getByText(/sign in with github/i).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should maintain authentication across page reloads', async ({ page }) => {
    // Set up authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
      }));
    });
    
    // Mock auth check
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        json: {
          id: 'test-user',
          name: 'Test User',
          email: 'test@example.com',
        }
      });
    });
    
    await page.goto('/dashboard');
    
    // Should stay on dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Reload page
    await page.reload();
    
    // Should still be on dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle logout correctly', async ({ page }) => {
    // Set up authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
      }));
    });
    
    await page.goto('/dashboard');
    
    // Open user menu
    await page.getByRole('button', { name: /user menu/i }).click();
    
    // Click logout
    await page.getByRole('menuitem', { name: /sign out/i }).click();
    
    // Should clear localStorage
    const hasToken = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(hasToken).toBeNull();
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Mock failed auth
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 401,
        json: { error: 'Unauthorized' }
      });
    });
    
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    
    // Should show error message
    await expect(page.getByText(/authentication failed/i)).toBeVisible();
  });
});