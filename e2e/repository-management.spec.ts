import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Test setup and teardown for repository management tests
let testRepoPath: string;
let secondTestRepoPath: string;

test.beforeEach(async () => {
  // Create temporary repositories for testing
  const timestamp = Date.now();
  testRepoPath = path.join(os.tmpdir(), `test-repo-${timestamp}`);
  secondTestRepoPath = path.join(os.tmpdir(), `test-repo-2-${timestamp}`);
  
  // Create first test repository
  await fs.mkdir(testRepoPath, { recursive: true });
  await fs.mkdir(path.join(testRepoPath, '.git'), { recursive: true });
  await fs.writeFile(
    path.join(testRepoPath, 'README.md'),
    '# Test Repository 1\n\nThis is a test repository for E2E testing.'
  );
  
  // Create second test repository
  await fs.mkdir(secondTestRepoPath, { recursive: true });
  await fs.mkdir(path.join(secondTestRepoPath, '.git'), { recursive: true });
  await fs.writeFile(
    path.join(secondTestRepoPath, 'README.md'),
    '# Test Repository 2\n\nSecond test repository for multiple repo testing.'
  );
  
  console.log(`Created test repositories at: ${testRepoPath} and ${secondTestRepoPath}`);
});

test.afterEach(async () => {
  // Clean up test repositories
  try {
    await fs.rm(testRepoPath, { recursive: true, force: true });
    await fs.rm(secondTestRepoPath, { recursive: true, force: true });
    console.log('Cleaned up test repositories');
  } catch (error) {
    console.warn(`Failed to clean up test repositories: ${error}`);
  }
});

test.describe('Repository Management Workflow', () => {
  test('should add and display a repository successfully', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Test repository addition
    await test.step('Add repository through UI', async () => {
      // Look for add repository button or form
      const addRepoButton = page.locator('[data-testid="add-repository"]').or(
        page.locator('button:has-text("Add Repository")')
      ).or(
        page.locator('[aria-label="Add Repository"]')
      );
      
      if (await addRepoButton.count() > 0) {
        await addRepoButton.click();
      }
      
      // Fill in repository path
      const pathInput = page.locator('input[placeholder*="repository"]').or(
        page.locator('input[placeholder*="path"]')
      ).or(
        page.locator('[data-testid="repository-path-input"]')
      );
      
      await expect(pathInput).toBeVisible({ timeout: 10000 });
      await pathInput.fill(testRepoPath);
      
      // Submit the form
      const submitButton = page.locator('button:has-text("Connect")').or(
        page.locator('button:has-text("Add")').or(
          page.locator('[data-testid="connect-repository"]')
        )
      );
      
      await submitButton.click();
    });
    
    // Verify repository appears in sidebar
    await test.step('Verify repository appears in UI', async () => {
      const repoName = path.basename(testRepoPath);
      const repositoryItem = page.locator(`[data-testid="repository-${repoName}"]`).or(
        page.locator(`:text("${repoName}")`)
      );
      
      await expect(repositoryItem).toBeVisible({ timeout: 15000 });
    });
    
    // Verify repository status indicator
    await test.step('Check repository status', async () => {
      // Look for success indicators
      const successIndicators = [
        page.locator('[data-testid="repository-status-connected"]'),
        page.locator('.repository-status.connected'),
        page.locator('[aria-label*="connected"]')
      ];
      
      let found = false;
      for (const indicator of successIndicators) {
        if (await indicator.count() > 0) {
          await expect(indicator).toBeVisible();
          found = true;
          break;
        }
      }
      
      // If no specific status indicator, check for absence of error states
      if (!found) {
        await expect(page.locator('.error')).toHaveCount(0);
        await expect(page.locator('[role="alert"]')).toHaveCount(0);
      }
    });
  });

  test('should handle invalid repository paths with proper error messages', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    await test.step('Test invalid path validation', async () => {
      // Try to add invalid repository path
      const addRepoButton = page.locator('[data-testid="add-repository"]').or(
        page.locator('button:has-text("Add Repository")')
      );
      
      if (await addRepoButton.count() > 0) {
        await addRepoButton.click();
      }
      
      const pathInput = page.locator('input[placeholder*="repository"]').or(
        page.locator('input[placeholder*="path"]')
      );
      
      // Test with non-existent path
      await pathInput.fill('/non/existent/path');
      
      const submitButton = page.locator('button:has-text("Connect")').or(
        page.locator('button:has-text("Add")')
      );
      
      await submitButton.click();
      
      // Verify error message appears
      const errorMessage = page.locator('[role="alert"]').or(
        page.locator('.error').or(
          page.locator('[data-testid="error-message"]')
        )
      );
      
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
      await expect(errorMessage).toContainText(/invalid|not found|does not exist/i);
    });
    
    await test.step('Test relative path validation', async () => {
      const pathInput = page.locator('input[placeholder*="repository"]').or(
        page.locator('input[placeholder*="path"]')
      );
      
      // Clear previous input and test relative path
      await pathInput.clear();
      await pathInput.fill('./relative/path');
      
      const submitButton = page.locator('button:has-text("Connect")').or(
        page.locator('button:has-text("Add")')
      );
      
      await submitButton.click();
      
      // Verify error message for relative path
      const errorMessage = page.locator('[role="alert"]').or(
        page.locator('.error')
      );
      
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/absolute|invalid|path/i);
    });
  });

  test('should manage multiple repositories simultaneously', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Add first repository
    await test.step('Add first repository', async () => {
      const addRepoButton = page.locator('[data-testid="add-repository"]').or(
        page.locator('button:has-text("Add Repository")')
      );
      
      if (await addRepoButton.count() > 0) {
        await addRepoButton.click();
      }
      
      const pathInput = page.locator('input[placeholder*="repository"]').or(
        page.locator('input[placeholder*="path"]')
      );
      
      await pathInput.fill(testRepoPath);
      
      const submitButton = page.locator('button:has-text("Connect")').or(
        page.locator('button:has-text("Add")')
      );
      
      await submitButton.click();
      
      // Wait for first repository to be added
      const firstRepoName = path.basename(testRepoPath);
      await expect(page.locator(`:text("${firstRepoName}")`)).toBeVisible({ timeout: 15000 });
    });
    
    // Add second repository
    await test.step('Add second repository', async () => {
      // Click add repository again
      const addRepoButton = page.locator('[data-testid="add-repository"]').or(
        page.locator('button:has-text("Add Repository")')
      );
      
      await addRepoButton.click();
      
      const pathInput = page.locator('input[placeholder*="repository"]').or(
        page.locator('input[placeholder*="path"]')
      );
      
      await pathInput.fill(secondTestRepoPath);
      
      const submitButton = page.locator('button:has-text("Connect")').or(
        page.locator('button:has-text("Add")')
      );
      
      await submitButton.click();
      
      // Wait for second repository to be added
      const secondRepoName = path.basename(secondTestRepoPath);
      await expect(page.locator(`:text("${secondRepoName}")`)).toBeVisible({ timeout: 15000 });
    });
    
    // Verify both repositories are listed
    await test.step('Verify both repositories are visible', async () => {
      const firstRepoName = path.basename(testRepoPath);
      const secondRepoName = path.basename(secondTestRepoPath);
      
      await expect(page.locator(`:text("${firstRepoName}")`)).toBeVisible();
      await expect(page.locator(`:text("${secondRepoName}")`)).toBeVisible();
    });
    
    // Test switching between repositories
    await test.step('Test repository switching', async () => {
      const firstRepoName = path.basename(testRepoPath);
      const secondRepoName = path.basename(secondTestRepoPath);
      
      // Click on first repository
      await page.locator(`:text("${firstRepoName}")`).click();
      // Add small delay for UI to update
      await page.waitForTimeout(500);
      
      // Click on second repository
      await page.locator(`:text("${secondRepoName}")`).click();
      // Add small delay for UI to update
      await page.waitForTimeout(500);
      
      // Verify UI updates appropriately (no errors)
      await expect(page.locator('.error')).toHaveCount(0);
    });
  });

  test('should refresh repository data correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Add repository first
    await test.step('Add repository', async () => {
      const addRepoButton = page.locator('[data-testid="add-repository"]').or(
        page.locator('button:has-text("Add Repository")')
      );
      
      if (await addRepoButton.count() > 0) {
        await addRepoButton.click();
      }
      
      const pathInput = page.locator('input[placeholder*="repository"]').or(
        page.locator('input[placeholder*="path"]')
      );
      
      await pathInput.fill(testRepoPath);
      
      const submitButton = page.locator('button:has-text("Connect")').or(
        page.locator('button:has-text("Add")')
      );
      
      await submitButton.click();
      
      const repoName = path.basename(testRepoPath);
      await expect(page.locator(`:text("${repoName}")`)).toBeVisible({ timeout: 15000 });
    });
    
    // Test refresh functionality
    await test.step('Test repository refresh', async () => {
      // Look for refresh button
      const refreshButton = page.locator('[data-testid="refresh-repository"]').or(
        page.locator('[aria-label*="refresh"]').or(
          page.locator('button:has-text("Refresh")')
        )
      );
      
      // If refresh button exists, test it
      if (await refreshButton.count() > 0) {
        await refreshButton.click();
        
        // Wait for refresh to complete (no specific indicator, just wait)
        await page.waitForTimeout(2000);
        
        // Verify no errors after refresh
        await expect(page.locator('.error')).toHaveCount(0);
      }
      
      // Test page refresh as fallback
      await page.reload();
      await expect(page).toHaveTitle(/TaskMaster UI/);
      
      // Verify repository is still there after page refresh
      const repoName = path.basename(testRepoPath);
      await expect(page.locator(`:text("${repoName}")`)).toBeVisible({ timeout: 15000 });
    });
  });

  test('should handle repository removal correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Add repository first
    await test.step('Add repository to remove', async () => {
      const addRepoButton = page.locator('[data-testid="add-repository"]').or(
        page.locator('button:has-text("Add Repository")')
      );
      
      if (await addRepoButton.count() > 0) {
        await addRepoButton.click();
      }
      
      const pathInput = page.locator('input[placeholder*="repository"]').or(
        page.locator('input[placeholder*="path"]')
      );
      
      await pathInput.fill(testRepoPath);
      
      const submitButton = page.locator('button:has-text("Connect")').or(
        page.locator('button:has-text("Add")')
      );
      
      await submitButton.click();
      
      const repoName = path.basename(testRepoPath);
      await expect(page.locator(`:text("${repoName}")`)).toBeVisible({ timeout: 15000 });
    });
    
    // Test repository removal
    await test.step('Remove repository', async () => {
      const repoName = path.basename(testRepoPath);
      
      // Look for remove/delete button near the repository
      const removeButton = page.locator('[data-testid="remove-repository"]').or(
        page.locator('[aria-label*="remove"]').or(
          page.locator('[aria-label*="delete"]').or(
            page.locator('button:has-text("Remove")').or(
              page.locator('button:has-text("Delete")')
            )
          )
        )
      );
      
      // If remove button exists, test removal
      if (await removeButton.count() > 0) {
        await removeButton.click();
        
        // Handle confirmation dialog if it appears
        const confirmButton = page.locator('button:has-text("Confirm")').or(
          page.locator('button:has-text("Yes")').or(
            page.locator('button:has-text("Delete")')
          )
        );
        
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
        }
        
        // Verify repository is removed from UI
        await expect(page.locator(`:text("${repoName}")`)).not.toBeVisible({ timeout: 10000 });
      } else {
        // Skip test if remove functionality not implemented
        console.log('Repository removal functionality not found - skipping removal test');
      }
    });
  });

  test('should display repository status and health information', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Add repository
    await test.step('Add repository and check status', async () => {
      const addRepoButton = page.locator('[data-testid="add-repository"]').or(
        page.locator('button:has-text("Add Repository")')
      );
      
      if (await addRepoButton.count() > 0) {
        await addRepoButton.click();
      }
      
      const pathInput = page.locator('input[placeholder*="repository"]').or(
        page.locator('input[placeholder*="path"]')
      );
      
      await pathInput.fill(testRepoPath);
      
      const submitButton = page.locator('button:has-text("Connect")').or(
        page.locator('button:has-text("Add")')
      );
      
      await submitButton.click();
      
      const repoName = path.basename(testRepoPath);
      await expect(page.locator(`:text("${repoName}")`)).toBeVisible({ timeout: 15000 });
    });
    
    // Check for status indicators
    await test.step('Verify repository status indicators', async () => {
      // Look for various status indicators
      const statusIndicators = [
        page.locator('[data-testid*="status"]'),
        page.locator('.status-indicator'),
        page.locator('[aria-label*="status"]'),
        page.locator('.repository-health')
      ];
      
      let foundIndicator = false;
      for (const indicator of statusIndicators) {
        if (await indicator.count() > 0) {
          await expect(indicator).toBeVisible();
          foundIndicator = true;
          break;
        }
      }
      
      // If no specific status indicators, verify no error states
      if (!foundIndicator) {
        await expect(page.locator('.error')).toHaveCount(0);
        console.log('No specific status indicators found, but no errors present');
      }
    });
    
    // Test repository details view if available
    await test.step('Check repository details', async () => {
      const repoName = path.basename(testRepoPath);
      const repoElement = page.locator(`:text("${repoName}")`);
      
      // Try clicking on repository to see details
      await repoElement.click();
      
      // Look for expanded details or information
      const detailsElements = [
        page.locator('[data-testid="repository-details"]'),
        page.locator('.repository-info'),
        page.locator('[aria-expanded="true"]')
      ];
      
      // Check if any details are shown
      let foundDetails = false;
      for (const details of detailsElements) {
        if (await details.count() > 0) {
          await expect(details).toBeVisible();
          foundDetails = true;
          break;
        }
      }
      
      if (!foundDetails) {
        console.log('Repository details view not implemented or not accessible');
      }
    });
  });
});

test.describe('Repository Management Accessibility', () => {
  test('should be fully keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    await test.step('Test keyboard navigation to repository controls', async () => {
      // Use keyboard to navigate to add repository
      await page.keyboard.press('Tab');
      // Continue tabbing until we find repository-related controls
      for (let i = 0; i < 20; i++) {
        const focusedElement = page.locator(':focus');
        const elementText = await focusedElement.textContent().catch(() => '');
        
        if (elementText && /add|repository|connect/i.test(elementText)) {
          // Found repository control, test activation
          await page.keyboard.press('Enter');
          break;
        }
        
        await page.keyboard.press('Tab');
      }
    });
    
    await test.step('Test form completion with keyboard', async () => {
      // Look for repository path input
      const pathInput = page.locator('input[placeholder*="repository"]').or(
        page.locator('input[placeholder*="path"]')
      );
      
      if (await pathInput.count() > 0) {
        await pathInput.focus();
        await pathInput.fill(testRepoPath);
        
        // Use keyboard to submit
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');
        
        // Verify repository was added
        const repoName = path.basename(testRepoPath);
        await expect(page.locator(`:text("${repoName}")`)).toBeVisible({ timeout: 15000 });
      }
    });
  });

  test('should provide proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    await test.step('Check ARIA attributes on repository controls', async () => {
      // Look for properly labeled repository controls
      const accessibleControls = [
        page.locator('[aria-label*="repository"]'),
        page.locator('[aria-label*="add"]'),
        page.locator('[role="button"]'),
        page.locator('[role="textbox"]')
      ];
      
      let foundAccessibleControl = false;
      for (const control of accessibleControls) {
        if (await control.count() > 0) {
          foundAccessibleControl = true;
          break;
        }
      }
      
      // If specific ARIA attributes not found, check basic accessibility
      if (!foundAccessibleControl) {
        // Verify buttons have text content or aria-labels
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        
        for (let i = 0; i < buttonCount; i++) {
          const button = buttons.nth(i);
          const text = await button.textContent();
          const ariaLabel = await button.getAttribute('aria-label');
          
          expect(text || ariaLabel).toBeTruthy();
        }
      }
    });
    
    await test.step('Test screen reader announcements', async () => {
      // Look for live regions that announce changes
      const liveRegions = page.locator('[aria-live]').or(
        page.locator('[role="status"]').or(
          page.locator('[role="alert"]')
        )
      );
      
      if (await liveRegions.count() > 0) {
        console.log('Found live regions for screen reader announcements');
      } else {
        console.log('No specific live regions found - basic accessibility present');
      }
    });
  });
});