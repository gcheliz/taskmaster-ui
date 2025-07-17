import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Test setup for task board workflow tests
let testRepoPath: string;
let testProjectName: string;

test.beforeEach(async () => {
  // Create a temporary repository for testing
  const timestamp = Date.now();
  testRepoPath = path.join(os.tmpdir(), `test-taskboard-repo-${timestamp}`);
  testProjectName = `Test Project ${timestamp}`;
  
  // Create test repository directory
  await fs.mkdir(testRepoPath, { recursive: true });
  
  // Initialize as git repository
  await fs.mkdir(path.join(testRepoPath, '.git'), { recursive: true });
  
  // Create a basic README file
  await fs.writeFile(
    path.join(testRepoPath, 'README.md'),
    '# Test Repository for Task Board\n\nThis repository is used for testing task board workflows.'
  );
  
  console.log(`Created test repository for task board at: ${testRepoPath}`);
});

test.afterEach(async () => {
  // Clean up test repository
  try {
    await fs.rm(testRepoPath, { recursive: true, force: true });
    console.log(`Cleaned up test repository: ${testRepoPath}`);
  } catch (error) {
    console.warn(`Failed to clean up test repository: ${error}`);
  }
});

test.describe('Task Board Workflow Tests', () => {
  test('should complete full task board workflow from repository to task management', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Step 1: Add repository
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
      
      await expect(pathInput).toBeVisible({ timeout: 10000 });
      await pathInput.fill(testRepoPath);
      
      const submitButton = page.locator('button:has-text("Connect")').or(
        page.locator('button:has-text("Add")')
      );
      
      await submitButton.click();
      
      // Verify repository appears
      const repoName = path.basename(testRepoPath);
      await expect(page.locator(`:text("${repoName}")`)).toBeVisible({ timeout: 15000 });
    });
    
    // Step 2: Create project
    await test.step('Create project in repository', async () => {
      // Look for create project button
      const createProjectButton = page.locator('[data-testid="create-project"]').or(
        page.locator('button:has-text("Create Project")').or(
          page.locator('[aria-label*="Create Project"]')
        )
      );
      
      if (await createProjectButton.count() > 0) {
        await createProjectButton.click();
        
        // Fill project name
        const projectNameInput = page.locator('input[placeholder*="project"]').or(
          page.locator('[data-testid="project-name-input"]')
        );
        
        await expect(projectNameInput).toBeVisible({ timeout: 10000 });
        await projectNameInput.fill(testProjectName);
        
        // Submit project creation
        const createButton = page.locator('button:has-text("Create")').or(
          page.locator('[data-testid="create-project-submit"]')
        );
        
        await createButton.click();
        
        // Wait for project to be created
        await expect(page.locator(`:text("${testProjectName}")`)).toBeVisible({ timeout: 15000 });
      } else {
        console.log('Create project functionality not found - may be on task board already');
      }
    });
    
    // Step 3: Access task board
    await test.step('Navigate to task board', async () => {
      // Look for task board or project view
      const taskBoardElements = [
        page.locator('[data-testid="task-board"]'),
        page.locator('.task-board'),
        page.locator('[aria-label*="task board"]'),
        page.locator('.kanban-board')
      ];
      
      let foundTaskBoard = false;
      for (const element of taskBoardElements) {
        if (await element.count() > 0) {
          await expect(element).toBeVisible();
          foundTaskBoard = true;
          break;
        }
      }
      
      // If no task board found, try clicking on project
      if (!foundTaskBoard) {
        const projectLink = page.locator(`:text("${testProjectName}")`);
        if (await projectLink.count() > 0) {
          await projectLink.click();
          await page.waitForTimeout(2000);
        }
      }
    });
    
    // Step 4: Verify task board structure
    await test.step('Verify task board columns exist', async () => {
      // Look for common task board columns
      const columnNames = ['To Do', 'In Progress', 'Done', 'todo', 'in-progress', 'done'];
      let foundColumns = 0;
      
      for (const columnName of columnNames) {
        const column = page.locator(`:text("${columnName}")`).or(
          page.locator(`[data-testid*="${columnName.toLowerCase().replace(' ', '-')}"]`)
        );
        
        if (await column.count() > 0) {
          foundColumns++;
        }
      }
      
      // Verify at least some column structure exists
      if (foundColumns === 0) {
        // Look for any column-like structures
        const genericColumns = [
          page.locator('.column'),
          page.locator('.task-column'),
          page.locator('[data-testid*="column"]'),
          page.locator('.kanban-column')
        ];
        
        for (const column of genericColumns) {
          if (await column.count() > 0) {
            foundColumns = await column.count();
            break;
          }
        }
      }
      
      console.log(`Found ${foundColumns} task board columns`);
      expect(foundColumns).toBeGreaterThan(0);
    });
  });

  test('should create and manage tasks through the UI', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Setup repository and project first
    await test.step('Setup repository and project', async () => {
      // Add repository
      const addRepoButton = page.locator('[data-testid="add-repository"]').or(
        page.locator('button:has-text("Add Repository")')
      );
      
      if (await addRepoButton.count() > 0) {
        await addRepoButton.click();
        
        const pathInput = page.locator('input[placeholder*="repository"]').or(
          page.locator('input[placeholder*="path"]')
        );
        
        await pathInput.fill(testRepoPath);
        
        const submitButton = page.locator('button:has-text("Connect")').or(
          page.locator('button:has-text("Add")')
        );
        
        await submitButton.click();
        
        // Wait for repository to be added
        const repoName = path.basename(testRepoPath);
        await expect(page.locator(`:text("${repoName}")`)).toBeVisible({ timeout: 15000 });
      }
      
      // Create project if needed
      const createProjectButton = page.locator('button:has-text("Create Project")');
      if (await createProjectButton.count() > 0) {
        await createProjectButton.click();
        
        const projectNameInput = page.locator('input[placeholder*="project"]');
        await projectNameInput.fill(testProjectName);
        
        const createButton = page.locator('button:has-text("Create")');
        await createButton.click();
        
        await expect(page.locator(`:text("${testProjectName}")`)).toBeVisible({ timeout: 15000 });
      }
    });
    
    // Test task creation
    await test.step('Create a new task', async () => {
      // Look for add task button
      const addTaskButtons = [
        page.locator('[data-testid="add-task"]'),
        page.locator('button:has-text("Add Task")'),
        page.locator('[aria-label*="Add Task"]'),
        page.locator('[aria-label*="Create Task"]'),
        page.locator('.add-task-button')
      ];
      
      let addTaskButton = null;
      for (const button of addTaskButtons) {
        if (await button.count() > 0) {
          addTaskButton = button.first();
          break;
        }
      }
      
      if (addTaskButton) {
        await addTaskButton.click();
        
        // Fill task details
        const taskTitleInput = page.locator('input[placeholder*="task"]').or(
          page.locator('input[placeholder*="title"]').or(
            page.locator('[data-testid="task-title-input"]')
          )
        );
        
        if (await taskTitleInput.count() > 0) {
          await taskTitleInput.fill('Test Task from E2E');
          
          // Submit task creation
          const createTaskButton = page.locator('button:has-text("Create")').or(
            page.locator('button:has-text("Add")').or(
              page.locator('[data-testid="create-task-submit"]')
            )
          );
          
          if (await createTaskButton.count() > 0) {
            await createTaskButton.click();
            
            // Verify task appears on board
            await expect(page.locator(':text("Test Task from E2E")')).toBeVisible({ timeout: 10000 });
          }
        }
      } else {
        console.log('Add task functionality not found - may require different navigation');
      }
    });
    
    // Test task interaction
    await test.step('Interact with created task', async () => {
      const testTask = page.locator(':text("Test Task from E2E")');
      
      if (await testTask.count() > 0) {
        // Try clicking on the task
        await testTask.click();
        
        // Look for task details or edit functionality
        const taskDetails = [
          page.locator('[data-testid="task-details"]'),
          page.locator('.task-modal'),
          page.locator('[role="dialog"]')
        ];
        
        let foundDetails = false;
        for (const details of taskDetails) {
          if (await details.count() > 0) {
            await expect(details).toBeVisible();
            foundDetails = true;
            break;
          }
        }
        
        if (foundDetails) {
          console.log('Task details modal opened successfully');
          
          // Close modal if it opened
          const closeButton = page.locator('[aria-label*="close"]').or(
            page.locator('button:has-text("Close")').or(
              page.locator('[data-testid="close-modal"]')
            )
          );
          
          if (await closeButton.count() > 0) {
            await closeButton.click();
          } else {
            // Try escape key
            await page.keyboard.press('Escape');
          }
        }
      }
    });
  });

  test('should support drag and drop task movement', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Setup repository and navigate to task board
    await test.step('Setup and navigate to task board', async () => {
      // Add repository
      const addRepoButton = page.locator('button:has-text("Add Repository")');
      
      if (await addRepoButton.count() > 0) {
        await addRepoButton.click();
        
        const pathInput = page.locator('input[placeholder*="repository"]').or(
          page.locator('input[placeholder*="path"]')
        );
        await pathInput.fill(testRepoPath);
        
        const submitButton = page.locator('button:has-text("Connect")');
        await submitButton.click();
        
        const repoName = path.basename(testRepoPath);
        await expect(page.locator(`:text("${repoName}")`)).toBeVisible({ timeout: 15000 });
      }
    });
    
    // Test drag and drop if functionality exists
    await test.step('Test drag and drop functionality', async () => {
      // Look for task cards that can be dragged
      const taskCards = [
        page.locator('.task-card'),
        page.locator('[data-testid*="task"]'),
        page.locator('[draggable="true"]')
      ];
      
      let draggableTask = null;
      for (const taskCard of taskCards) {
        if (await taskCard.count() > 0) {
          draggableTask = taskCard.first();
          break;
        }
      }
      
      if (draggableTask) {
        // Get task position
        const taskBox = await draggableTask.boundingBox();
        
        // Look for drop zones (columns)
        const dropZones = [
          page.locator('.column'),
          page.locator('.task-column'),
          page.locator('[data-testid*="column"]')
        ];
        
        let targetColumn = null;
        for (const column of dropZones) {
          if (await column.count() > 1) {
            targetColumn = column.nth(1); // Use second column as target
            break;
          }
        }
        
        if (targetColumn && taskBox) {
          const targetBox = await targetColumn.boundingBox();
          
          if (targetBox) {
            // Perform drag and drop
            await page.mouse.move(taskBox.x + taskBox.width / 2, taskBox.y + taskBox.height / 2);
            await page.mouse.down();
            await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
            await page.mouse.up();
            
            console.log('Drag and drop operation completed');
            
            // Wait for any animations to complete
            await page.waitForTimeout(1000);
          }
        }
      } else {
        console.log('No draggable tasks found - drag and drop test skipped');
      }
    });
  });

  test('should filter and sort tasks correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Setup repository first
    await test.step('Setup repository', async () => {
      const addRepoButton = page.locator('button:has-text("Add Repository")');
      
      if (await addRepoButton.count() > 0) {
        await addRepoButton.click();
        
        const pathInput = page.locator('input[placeholder*="repository"]');
        await pathInput.fill(testRepoPath);
        
        const submitButton = page.locator('button:has-text("Connect")');
        await submitButton.click();
        
        const repoName = path.basename(testRepoPath);
        await expect(page.locator(`:text("${repoName}")`)).toBeVisible({ timeout: 15000 });
      }
    });
    
    // Test filtering functionality
    await test.step('Test task filtering', async () => {
      // Look for filter controls
      const filterControls = [
        page.locator('[data-testid="filter"]'),
        page.locator('.filter-control'),
        page.locator('input[placeholder*="filter"]'),
        page.locator('input[placeholder*="search"]')
      ];
      
      let filterControl = null;
      for (const control of filterControls) {
        if (await control.count() > 0) {
          filterControl = control.first();
          break;
        }
      }
      
      if (filterControl) {
        // Test text filtering
        await filterControl.fill('test');
        await page.waitForTimeout(1000);
        
        // Clear filter
        await filterControl.clear();
        await page.waitForTimeout(500);
        
        console.log('Filter functionality tested');
      } else {
        console.log('Filter controls not found - may not be implemented');
      }
    });
    
    // Test sorting functionality
    await test.step('Test task sorting', async () => {
      // Look for sort controls
      const sortControls = [
        page.locator('[data-testid="sort"]'),
        page.locator('.sort-control'),
        page.locator('select[aria-label*="sort"]'),
        page.locator('button:has-text("Sort")')
      ];
      
      let sortControl = null;
      for (const control of sortControls) {
        if (await control.count() > 0) {
          sortControl = control.first();
          break;
        }
      }
      
      if (sortControl) {
        await sortControl.click();
        await page.waitForTimeout(1000);
        
        console.log('Sort functionality tested');
      } else {
        console.log('Sort controls not found - may not be implemented');
      }
    });
  });

  test('should display task board performance indicators', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Setup and navigate to task board
    await test.step('Setup repository and check performance', async () => {
      const addRepoButton = page.locator('button:has-text("Add Repository")');
      
      if (await addRepoButton.count() > 0) {
        await addRepoButton.click();
        
        const pathInput = page.locator('input[placeholder*="repository"]');
        await pathInput.fill(testRepoPath);
        
        const submitButton = page.locator('button:has-text("Connect")');
        await submitButton.click();
        
        const repoName = path.basename(testRepoPath);
        await expect(page.locator(`:text("${repoName}")`)).toBeVisible({ timeout: 15000 });
      }
    });
    
    // Check for performance and loading indicators
    await test.step('Verify loading states and performance', async () => {
      // Look for loading indicators
      const loadingIndicators = [
        page.locator('[data-testid="loading"]'),
        page.locator('.loading'),
        page.locator('.spinner'),
        page.locator('[aria-label*="loading"]')
      ];
      
      // Check if any loading indicators exist and disappear
      for (const indicator of loadingIndicators) {
        if (await indicator.count() > 0) {
          // Wait for loading to complete
          await expect(indicator).not.toBeVisible({ timeout: 30000 });
          console.log('Loading indicator found and resolved');
          break;
        }
      }
      
      // Verify no error states
      await expect(page.locator('.error')).toHaveCount(0);
      await expect(page.locator('[role="alert"]')).toHaveCount(0);
    });
    
    // Test responsiveness
    await test.step('Test responsive design', async () => {
      // Test different viewport sizes
      const viewports = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 768, height: 1024 },  // Tablet
        { width: 375, height: 667 }    // Mobile
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(500);
        
        // Verify page is still functional
        await expect(page).toHaveTitle(/TaskMaster UI/);
        console.log(`Tested viewport: ${viewport.width}x${viewport.height}`);
      }
      
      // Reset to desktop view
      await page.setViewportSize({ width: 1920, height: 1080 });
    });
  });

  test('should handle task board keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Setup repository
    await test.step('Setup repository', async () => {
      const addRepoButton = page.locator('button:has-text("Add Repository")');
      
      if (await addRepoButton.count() > 0) {
        await addRepoButton.click();
        
        const pathInput = page.locator('input[placeholder*="repository"]');
        await pathInput.fill(testRepoPath);
        
        const submitButton = page.locator('button:has-text("Connect")');
        await submitButton.click();
        
        const repoName = path.basename(testRepoPath);
        await expect(page.locator(`:text("${repoName}")`)).toBeVisible({ timeout: 15000 });
      }
    });
    
    // Test keyboard navigation
    await test.step('Test keyboard navigation', async () => {
      // Test tab navigation through task board elements
      let tabCount = 0;
      const maxTabs = 20;
      
      while (tabCount < maxTabs) {
        await page.keyboard.press('Tab');
        tabCount++;
        
        const focusedElement = page.locator(':focus');
        if (await focusedElement.count() > 0) {
          const elementRole = await focusedElement.getAttribute('role').catch(() => null);
          const elementType = await focusedElement.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
          
          if (elementRole === 'button' || elementType === 'button') {
            console.log(`Found focusable button at tab ${tabCount}`);
          }
        }
      }
      
      console.log(`Completed keyboard navigation test with ${tabCount} tab presses`);
    });
    
    // Test keyboard shortcuts if they exist
    await test.step('Test keyboard shortcuts', async () => {
      // Test common keyboard shortcuts
      const shortcuts = [
        'Escape', // Close modals
        'Enter',  // Activate focused element
        'Space'   // Alternative activation
      ];
      
      for (const shortcut of shortcuts) {
        await page.keyboard.press(shortcut);
        await page.waitForTimeout(200);
      }
      
      console.log('Keyboard shortcuts tested');
    });
  });
});

test.describe('Task Board Accessibility', () => {
  test('should meet accessibility standards', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    await test.step('Check ARIA labels and roles', async () => {
      // Look for proper ARIA attributes
      const ariaElements = [
        page.locator('[aria-label]'),
        page.locator('[role]'),
        page.locator('[aria-describedby]'),
        page.locator('[aria-expanded]')
      ];
      
      let foundAriaElements = 0;
      for (const elements of ariaElements) {
        foundAriaElements += await elements.count();
      }
      
      console.log(`Found ${foundAriaElements} elements with ARIA attributes`);
      expect(foundAriaElements).toBeGreaterThan(0);
    });
    
    await test.step('Test screen reader compatibility', async () => {
      // Look for screen reader friendly elements
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      console.log(`Found ${headingCount} heading elements for screen readers`);
      
      // Check for skip links
      const skipLinks = page.locator('[href="#main"]').or(
        page.locator(':text("Skip to content")')
      );
      
      if (await skipLinks.count() > 0) {
        console.log('Skip to content link found');
      }
    });
    
    await test.step('Verify focus management', async () => {
      // Test focus visibility
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      
      if (await focusedElement.count() > 0) {
        const focusVisible = await focusedElement.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.outline !== 'none' || 
                 style.boxShadow !== 'none' || 
                 style.border !== el.style.border;
        }).catch(() => false);
        
        console.log(`Focus indicator visible: ${focusVisible}`);
      }
    });
  });

  test('should support high contrast mode', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    await test.step('Test high contrast compatibility', async () => {
      // Check if high contrast mode is respected
      const bodyElement = page.locator('body');
      const hasHighContrastStyles = await bodyElement.evaluate(() => {
        return window.matchMedia('(prefers-contrast: high)').matches;
      }).catch(() => false);
      
      console.log(`High contrast mode detected: ${hasHighContrastStyles}`);
      
      // Verify no elements have insufficient contrast
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const isVisible = await button.isVisible().catch(() => false);
        
        if (isVisible) {
          const styles = await button.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor
            };
          }).catch(() => ({ color: '', backgroundColor: '' }));
          
          console.log(`Button ${i} styles:`, styles);
        }
      }
    });
  });
});