import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set auth token for protected routes
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

  test('login page should have no accessibility violations', async ({ page }) => {
    await page.goto('/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('dashboard should have no accessibility violations', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('task board should have no accessibility violations', async ({ page }) => {
    // Mock tasks data
    await page.route('**/api/tasks', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            title: 'Test Task',
            description: 'Test description',
            status: 'pending',
            priority: 'high',
          },
        ]),
      });
    });

    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('task modal should have no accessibility violations', async ({ page }) => {
    await page.goto('/tasks');
    
    // Open task modal
    await page.getByRole('button', { name: /add task/i }).click();
    await page.waitForTimeout(500); // Wait for modal animation
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('.Toastify') // Exclude toast notifications
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation should work on task board', async ({ page }) => {
    await page.goto('/tasks');
    
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    
    // Check focus is visible
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Navigate through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.locator(':focus');
      await expect(focused).toBeVisible();
    }
    
    // Test reverse navigation
    await page.keyboard.press('Shift+Tab');
    const reverseFocused = await page.locator(':focus');
    await expect(reverseFocused).toBeVisible();
  });

  test('form inputs should have proper labels', async ({ page }) => {
    await page.goto('/login');
    
    // Check email input has label
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
    
    // Check password input has label
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();
    
    // Check form has proper submit button
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await expect(submitButton).toBeVisible();
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Find all images
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const altText = await img.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText).not.toBe('');
    }
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto('/tasks');
    
    // Find all buttons
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const accessibleName = await button.getAttribute('aria-label') || 
                           await button.textContent();
      expect(accessibleName).toBeTruthy();
    }
  });

  test('color contrast should meet WCAG standards', async ({ page }) => {
    await page.goto('/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include(['color-contrast'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('focus indicators should be visible', async ({ page }) => {
    await page.goto('/login');
    
    // Tab to email input
    await page.keyboard.press('Tab');
    
    // Check focus indicator is visible
    const focusedElement = await page.locator(':focus');
    const outlineStyle = await focusedElement.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
        outlineColor: styles.outlineColor,
      };
    });
    
    // Should have visible outline
    expect(parseInt(outlineStyle.outlineWidth)).toBeGreaterThan(0);
    expect(outlineStyle.outlineStyle).not.toBe('none');
  });

  test('ARIA landmarks should be properly structured', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Check for navigation landmark
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check for header landmark
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('modal should trap focus', async ({ page }) => {
    await page.goto('/tasks');
    
    // Open modal
    await page.getByRole('button', { name: /add task/i }).click();
    await page.waitForTimeout(500);
    
    // Get all focusable elements in modal
    const modal = page.locator('[role="dialog"]');
    const focusableElements = await modal.locator('button, input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
    
    expect(focusableElements.length).toBeGreaterThan(0);
    
    // Tab through all elements and verify focus stays in modal
    for (let i = 0; i < focusableElements.length + 1; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.locator(':focus');
      const isInModal = await focusedElement.evaluate((el, modalSelector) => {
        const modal = document.querySelector(modalSelector);
        return modal?.contains(el) || false;
      }, '[role="dialog"]');
      
      expect(isInModal).toBe(true);
    }
  });

  test('error messages should be announced to screen readers', async ({ page }) => {
    await page.goto('/login');
    
    // Submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check error messages have proper ARIA attributes
    const errorMessages = await page.locator('[role="alert"]').all();
    expect(errorMessages.length).toBeGreaterThan(0);
    
    for (const error of errorMessages) {
      await expect(error).toBeVisible();
      const ariaLive = await error.getAttribute('aria-live');
      expect(['polite', 'assertive']).toContain(ariaLive);
    }
  });

  test('loading states should be announced', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/tasks', async route => {
      await page.waitForTimeout(2000);
      await route.fulfill({
        status: 200,
        body: JSON.stringify([]),
      });
    });

    await page.goto('/tasks');
    
    // Check for loading announcement
    const loadingElement = await page.locator('[aria-busy="true"]').first();
    await expect(loadingElement).toBeVisible();
    
    // Should have aria-label or aria-describedby
    const ariaLabel = await loadingElement.getAttribute('aria-label');
    const ariaDescribedby = await loadingElement.getAttribute('aria-describedby');
    expect(ariaLabel || ariaDescribedby).toBeTruthy();
  });
});