import { test, expect } from '../fixtures/test-fixtures';

test.describe('Terminal', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/terminal');
  });

  test('should display terminal interface', async ({ authenticatedPage: page }) => {
    // Check terminal components
    await expect(page.getByRole('heading', { name: /terminal/i })).toBeVisible();
    await expect(page.locator('[data-testid="terminal-output"]')).toBeVisible();
    await expect(page.getByPlaceholder(/type a command/i)).toBeVisible();
  });

  test('should execute commands', async ({ authenticatedPage: page }) => {
    // Mock command execution
    await page.route('**/api/terminal/execute', async route => {
      const request = route.request();
      const body = await request.postData();
      const { command } = JSON.parse(body || '{}');
      
      await route.fulfill({
        json: {
          output: `$ ${command}\nCommand executed successfully`,
          exitCode: 0,
          executedAt: new Date().toISOString(),
        }
      });
    });
    
    // Type command
    const input = page.getByPlaceholder(/type a command/i);
    await input.fill('echo "Hello, World!"');
    
    // Press Enter
    await input.press('Enter');
    
    // Check output
    await expect(page.locator('[data-testid="terminal-output"]')).toContainText('$ echo "Hello, World!"');
    await expect(page.locator('[data-testid="terminal-output"]')).toContainText('Command executed successfully');
  });

  test('should maintain command history', async ({ authenticatedPage: page }) => {
    const input = page.getByPlaceholder(/type a command/i);
    
    // Execute multiple commands
    await input.fill('ls -la');
    await input.press('Enter');
    
    await input.fill('pwd');
    await input.press('Enter');
    
    await input.fill('echo test');
    await input.press('Enter');
    
    // Navigate history with arrow keys
    await input.press('ArrowUp'); // Should show 'echo test'
    await expect(input).toHaveValue('echo test');
    
    await input.press('ArrowUp'); // Should show 'pwd'
    await expect(input).toHaveValue('pwd');
    
    await input.press('ArrowUp'); // Should show 'ls -la'
    await expect(input).toHaveValue('ls -la');
    
    await input.press('ArrowDown'); // Should show 'pwd'
    await expect(input).toHaveValue('pwd');
  });

  test('should handle command errors', async ({ authenticatedPage: page }) => {
    // Mock command error
    await page.route('**/api/terminal/execute', async route => {
      await route.fulfill({
        json: {
          output: 'Command not found: invalid-command',
          exitCode: 127,
          error: true,
          executedAt: new Date().toISOString(),
        }
      });
    });
    
    const input = page.getByPlaceholder(/type a command/i);
    await input.fill('invalid-command');
    await input.press('Enter');
    
    // Check error output
    const output = page.locator('[data-testid="terminal-output"]');
    await expect(output).toContainText('Command not found');
    
    // Error should be styled differently
    const errorLine = output.locator('text=Command not found');
    await expect(errorLine).toHaveClass(/error|text-red/);
  });

  test('should support command auto-completion', async ({ authenticatedPage: page }) => {
    // Mock command suggestions
    await page.route('**/api/terminal/suggestions', async route => {
      await route.fulfill({
        json: {
          suggestions: ['git status', 'git add', 'git commit', 'git push']
        }
      });
    });
    
    const input = page.getByPlaceholder(/type a command/i);
    await input.fill('git');
    await input.press('Tab');
    
    // Should show suggestions
    await expect(page.getByText('git status')).toBeVisible();
    await expect(page.getByText('git add')).toBeVisible();
    await expect(page.getByText('git commit')).toBeVisible();
    
    // Select a suggestion
    await page.getByText('git status').click();
    await expect(input).toHaveValue('git status');
  });

  test('should clear terminal output', async ({ authenticatedPage: page }) => {
    const input = page.getByPlaceholder(/type a command/i);
    
    // Execute some commands
    await input.fill('echo "Line 1"');
    await input.press('Enter');
    
    await input.fill('echo "Line 2"');
    await input.press('Enter');
    
    // Output should be visible
    const output = page.locator('[data-testid="terminal-output"]');
    await expect(output).toContainText('Line 1');
    await expect(output).toContainText('Line 2');
    
    // Clear terminal
    await page.getByRole('button', { name: /clear/i }).click();
    
    // Output should be empty
    await expect(output).toBeEmpty();
  });

  test('should handle long-running commands', async ({ authenticatedPage: page }) => {
    // Mock long-running command
    await page.route('**/api/terminal/execute', async route => {
      // Delay response
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        json: {
          output: 'Long command completed',
          exitCode: 0,
          executedAt: new Date().toISOString(),
        }
      });
    });
    
    const input = page.getByPlaceholder(/type a command/i);
    await input.fill('long-command');
    await input.press('Enter');
    
    // Should show loading state
    await expect(page.getByTestId('command-loading')).toBeVisible();
    
    // Input should be disabled during execution
    await expect(input).toBeDisabled();
    
    // Wait for completion
    await expect(page.getByText('Long command completed')).toBeVisible({ timeout: 5000 });
    
    // Input should be enabled again
    await expect(input).toBeEnabled();
  });

  test('should cancel running commands', async ({ authenticatedPage: page }) => {
    // Mock cancellable command
    let cancelled = false;
    await page.route('**/api/terminal/execute', async route => {
      const abortController = new AbortController();
      
      // Listen for cancel
      page.on('request', req => {
        if (req.url().includes('/api/terminal/cancel')) {
          cancelled = true;
          abortController.abort();
        }
      });
      
      try {
        await new Promise((resolve, reject) => {
          setTimeout(resolve, 5000);
          abortController.signal.addEventListener('abort', reject);
        });
        
        await route.fulfill({
          json: { output: 'Should not see this', exitCode: 0 }
        });
      } catch {
        await route.fulfill({
          json: { output: 'Command cancelled', exitCode: 130 }
        });
      }
    });
    
    const input = page.getByPlaceholder(/type a command/i);
    await input.fill('long-running-command');
    await input.press('Enter');
    
    // Cancel button should appear
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await expect(cancelButton).toBeVisible();
    
    // Click cancel
    await cancelButton.click();
    
    // Should show cancelled message
    await expect(page.getByText('Command cancelled')).toBeVisible();
  });

  test('should resize terminal output', async ({ authenticatedPage: page }) => {
    const terminal = page.locator('[data-testid="terminal-container"]');
    
    // Check default size
    const initialHeight = await terminal.evaluate(el => el.clientHeight);
    
    // Find resize handle
    const resizeHandle = page.locator('[data-testid="resize-handle"]');
    
    // Drag to resize
    await resizeHandle.dragTo(page.locator('body'), {
      targetPosition: { x: 0, y: initialHeight + 200 }
    });
    
    // Check new size
    const newHeight = await terminal.evaluate(el => el.clientHeight);
    expect(newHeight).toBeGreaterThan(initialHeight);
  });

  test('should export terminal output', async ({ authenticatedPage: page }) => {
    // Execute some commands
    const input = page.getByPlaceholder(/type a command/i);
    await input.fill('echo "Export test"');
    await input.press('Enter');
    
    // Mock download
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.getByRole('button', { name: /export/i }).click();
    
    // Check download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/terminal-output.*\.txt/);
  });
});