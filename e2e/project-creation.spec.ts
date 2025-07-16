import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Test setup and teardown
let testRepoPath: string;
let testProjectName: string;

test.beforeEach(async () => {
  // Create a temporary repository for testing
  testRepoPath = path.join(os.tmpdir(), `test-repo-${Date.now()}`);
  testProjectName = `Test Project ${Date.now()}`;
  
  // Create test repository directory
  await fs.mkdir(testRepoPath, { recursive: true });
  
  // Initialize as git repository
  await fs.mkdir(path.join(testRepoPath, '.git'), { recursive: true });
  
  // Create a basic README file
  await fs.writeFile(
    path.join(testRepoPath, 'README.md'),
    '# Test Repository\n\nThis is a test repository for E2E testing.'
  );
  
  console.log(`Created test repository at: ${testRepoPath}`);
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

test.describe('Project Creation Flow', () => {
  test('should create a new project end-to-end', async ({ page }) => {
    console.log(`Starting E2E test with repository: ${testRepoPath}`);
    
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Step 1: Add a repository first (if not already added)
    // Look for "Add Repository" button or similar
    const addRepoButton = page.locator('[data-testid="add-repository-button"]').or(
      page.locator('button', { hasText: 'Add Repository' })
    );
    
    // If add repository button exists, click it
    if (await addRepoButton.isVisible()) {
      await addRepoButton.click();
      
      // Fill in the repository path
      const pathInput = page.locator('[data-testid="repository-path-input"]').or(
        page.locator('input[type="text"]').first()
      );
      await pathInput.fill(testRepoPath);
      
      // Submit the repository form
      const connectButton = page.locator('[data-testid="connect-repository-button"]').or(
        page.locator('button', { hasText: 'Connect Repository' })
      );
      await connectButton.click();
      
      // Wait for repository to be connected
      await expect(page.locator('[data-testid="repository-connected"]').or(
        page.locator('text=Repository connected successfully')
      )).toBeVisible({ timeout: 10000 });
    }
    
    // Step 2: Navigate to project creation
    // Look for "Create Project" or "New Project" button
    const createProjectButton = page.locator('[data-testid="create-project-button"]').or(
      page.locator('button', { hasText: 'Create Project' })
    ).or(
      page.locator('button', { hasText: 'New Project' })
    );
    
    await expect(createProjectButton).toBeVisible({ timeout: 10000 });
    await createProjectButton.click();
    
    // Step 3: Fill in project creation form
    // Wait for the project creation modal/form to appear
    await expect(page.locator('[data-testid="create-project-modal"]').or(
      page.locator('[role="dialog"]')
    )).toBeVisible({ timeout: 5000 });
    
    // Select repository from dropdown
    const repositorySelect = page.locator('[data-testid="repository-select"]').or(
      page.locator('select')
    );
    
    if (await repositorySelect.isVisible()) {
      await repositorySelect.click();
      
      // Select the test repository (look for option containing the repo path)
      const repoOption = page.locator(`option:has-text("${path.basename(testRepoPath)}")`).or(
        page.locator('option').first()
      );
      await repoOption.click();
    }
    
    // Fill in project name
    const projectNameInput = page.locator('[data-testid="project-name-input"]').or(
      page.locator('input[type="text"]').last()
    );
    await projectNameInput.fill(testProjectName);
    
    // Submit the project creation form
    const submitButton = page.locator('[data-testid="create-project-submit"]').or(
      page.locator('button[type="submit"]')
    ).or(
      page.locator('button', { hasText: 'Create Project' })
    );
    
    await submitButton.click();
    
    // Step 4: Wait for project creation to complete
    // Look for success message or project in list
    await expect(page.locator('[data-testid="project-created-success"]').or(
      page.locator('text=Project created successfully')
    )).toBeVisible({ timeout: 30000 });
    
    // Step 5: Verify project appears in the project list
    await expect(page.locator(`text=${testProjectName}`)).toBeVisible({ timeout: 5000 });
    
    // Step 6: Verify file system changes
    // Check that .taskmaster directory was created
    const taskMasterDir = path.join(testRepoPath, '.taskmaster');
    const taskMasterDirExists = await fs.access(taskMasterDir).then(() => true).catch(() => false);
    expect(taskMasterDirExists).toBe(true);
    
    // Check that tasks.json file exists
    const tasksJsonPath = path.join(taskMasterDir, 'tasks', 'tasks.json');
    const tasksJsonExists = await fs.access(tasksJsonPath).then(() => true).catch(() => false);
    expect(tasksJsonExists).toBe(true);
    
    // Verify the content of tasks.json
    if (tasksJsonExists) {
      const tasksJsonContent = await fs.readFile(tasksJsonPath, 'utf-8');
      const tasksData = JSON.parse(tasksJsonContent);
      
      // Basic structure validation
      expect(tasksData).toHaveProperty('metadata');
      expect(tasksData).toHaveProperty('tasks');
      expect(Array.isArray(tasksData.tasks)).toBe(true);
    }
    
    console.log(`E2E test completed successfully for project: ${testProjectName}`);
  });
  
  test('should handle project creation errors gracefully', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Try to create a project with invalid data
    const createProjectButton = page.locator('[data-testid="create-project-button"]').or(
      page.locator('button', { hasText: 'Create Project' })
    ).or(
      page.locator('button', { hasText: 'New Project' })
    );
    
    await createProjectButton.click();
    
    // Wait for the project creation modal/form to appear
    await expect(page.locator('[data-testid="create-project-modal"]').or(
      page.locator('[role="dialog"]')
    )).toBeVisible({ timeout: 5000 });
    
    // Try to submit with empty project name
    const submitButton = page.locator('[data-testid="create-project-submit"]').or(
      page.locator('button[type="submit"]')
    ).or(
      page.locator('button', { hasText: 'Create Project' })
    );
    
    await submitButton.click();
    
    // Should show validation error
    await expect(page.locator('[data-testid="validation-error"]').or(
      page.locator('text=Project name is required')
    )).toBeVisible({ timeout: 5000 });
    
    // Try with invalid characters in project name
    const projectNameInput = page.locator('[data-testid="project-name-input"]').or(
      page.locator('input[type="text"]').last()
    );
    await projectNameInput.fill('Invalid/Project*Name');
    
    await submitButton.click();
    
    // Should show validation error for invalid characters
    await expect(page.locator('text=Project name can only contain').or(
      page.locator('[data-testid="validation-error"]')
    )).toBeVisible({ timeout: 5000 });
    
    console.log('Error handling test completed successfully');
  });
  
  test('should show loading states during project creation', async ({ page }) => {
    console.log(`Starting loading states test with repository: ${testRepoPath}`);
    
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page).toHaveTitle(/TaskMaster UI/);
    
    // Create project with valid data
    const createProjectButton = page.locator('[data-testid="create-project-button"]').or(
      page.locator('button', { hasText: 'Create Project' })
    ).or(
      page.locator('button', { hasText: 'New Project' })
    );
    
    await createProjectButton.click();
    
    // Wait for the project creation modal/form to appear
    await expect(page.locator('[data-testid="create-project-modal"]').or(
      page.locator('[role="dialog"]')
    )).toBeVisible({ timeout: 5000 });
    
    // Fill in project name
    const projectNameInput = page.locator('[data-testid="project-name-input"]').or(
      page.locator('input[type="text"]').last()
    );
    await projectNameInput.fill('Test Loading Project');
    
    // Submit the form
    const submitButton = page.locator('[data-testid="create-project-submit"]').or(
      page.locator('button[type="submit"]')
    ).or(
      page.locator('button', { hasText: 'Create Project' })
    );
    
    await submitButton.click();
    
    // Should show loading state
    await expect(page.locator('[data-testid="loading-spinner"]').or(
      page.locator('[data-testid="creating-project-loading"]')
    )).toBeVisible({ timeout: 2000 });
    
    // Submit button should be disabled during loading
    await expect(submitButton).toBeDisabled();
    
    console.log('Loading states test completed successfully');
  });
});