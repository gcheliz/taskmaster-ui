import { Page, Locator } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Test utilities for E2E tests
 */
export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Wait for a repository to be connected
   */
  async waitForRepositoryConnected(timeout = 10000) {
    await this.page.waitForSelector('[data-testid="repository-connected"]', { 
      timeout,
      state: 'visible' 
    });
  }

  /**
   * Fill repository path and connect
   */
  async connectRepository(repositoryPath: string) {
    // Find and click add repository button
    const addRepoButton = this.page.locator('[data-testid="add-repository-button"]')
      .or(this.page.locator('button', { hasText: 'Add Repository' }));
    
    await addRepoButton.click();
    
    // Fill in path
    const pathInput = this.page.locator('[data-testid="repository-path-input"]')
      .or(this.page.locator('input[type="text"]').first());
    
    await pathInput.fill(repositoryPath);
    
    // Submit
    const connectButton = this.page.locator('[data-testid="connect-repository-button"]')
      .or(this.page.locator('button', { hasText: 'Connect Repository' }));
    
    await connectButton.click();
    
    // Wait for connection
    await this.waitForRepositoryConnected();
  }

  /**
   * Open project creation modal
   */
  async openProjectCreationModal() {
    const createProjectButton = this.page.locator('[data-testid="create-project-button"]')
      .or(this.page.locator('button', { hasText: 'Create Project' }))
      .or(this.page.locator('button', { hasText: 'New Project' }));
    
    await createProjectButton.click();
    
    // Wait for modal to appear
    await this.page.waitForSelector('[data-testid="create-project-modal"]', {
      state: 'visible',
      timeout: 5000
    });
  }

  /**
   * Fill project creation form
   */
  async fillProjectCreationForm(projectName: string, repositoryName?: string) {
    // Fill project name
    const projectNameInput = this.page.locator('[data-testid="project-name-input"]')
      .or(this.page.locator('input[type="text"]').last());
    
    await projectNameInput.fill(projectName);
    
    // Select repository if specified
    if (repositoryName) {
      const repositorySelect = this.page.locator('[data-testid="repository-select"]')
        .or(this.page.locator('select'));
      
      if (await repositorySelect.isVisible()) {
        await repositorySelect.click();
        
        const repoOption = this.page.locator(`option:has-text("${repositoryName}")`)
          .or(this.page.locator('option').first());
        
        await repoOption.click();
      }
    }
  }

  /**
   * Submit project creation form
   */
  async submitProjectCreation() {
    const submitButton = this.page.locator('[data-testid="create-project-submit"]')
      .or(this.page.locator('button[type="submit"]'))
      .or(this.page.locator('button', { hasText: 'Create Project' }));
    
    await submitButton.click();
  }

  /**
   * Wait for project creation success
   */
  async waitForProjectCreationSuccess(timeout = 30000) {
    await this.page.waitForSelector('[data-testid="project-created-success"]', { 
      timeout,
      state: 'visible' 
    });
  }

  /**
   * Check if TaskMaster directory structure exists
   */
  async verifyTaskMasterDirectoryStructure(repositoryPath: string) {
    const taskMasterDir = path.join(repositoryPath, '.taskmaster');
    const tasksDir = path.join(taskMasterDir, 'tasks');
    const tasksJsonPath = path.join(tasksDir, 'tasks.json');
    
    // Check directories exist
    const taskMasterDirExists = await fs.access(taskMasterDir).then(() => true).catch(() => false);
    const tasksDirExists = await fs.access(tasksDir).then(() => true).catch(() => false);
    const tasksJsonExists = await fs.access(tasksJsonPath).then(() => true).catch(() => false);
    
    return {
      taskMasterDirExists,
      tasksDirExists,
      tasksJsonExists,
      tasksJsonPath
    };
  }

  /**
   * Create a test Git repository
   */
  static async createTestRepository(basePath: string): Promise<string> {
    await fs.mkdir(basePath, { recursive: true });
    
    // Create .git directory
    await fs.mkdir(path.join(basePath, '.git'), { recursive: true });
    
    // Create basic files
    await fs.writeFile(
      path.join(basePath, 'README.md'),
      '# Test Repository\n\nThis is a test repository for E2E testing.'
    );
    
    await fs.writeFile(
      path.join(basePath, 'package.json'),
      JSON.stringify({
        name: 'test-repository',
        version: '1.0.0',
        description: 'A test repository for E2E testing'
      }, null, 2)
    );
    
    return basePath;
  }

  /**
   * Clean up test repository
   */
  static async cleanupTestRepository(repositoryPath: string): Promise<void> {
    try {
      await fs.rm(repositoryPath, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Failed to clean up test repository: ${error}`);
    }
  }

  /**
   * Get a flexible locator that tries multiple selectors
   */
  getFlexibleLocator(testId: string, ...alternativeSelectors: string[]): Locator {
    let locator = this.page.locator(`[data-testid="${testId}"]`);
    
    for (const selector of alternativeSelectors) {
      locator = locator.or(this.page.locator(selector));
    }
    
    return locator;
  }
}

/**
 * Mock data for testing
 */
export const mockData = {
  validProjectName: 'Test Project',
  invalidProjectName: 'Invalid/Project*Name',
  longProjectName: 'A'.repeat(100),
  emptyProjectName: '',
  
  getUniqueProjectName: () => `Test Project ${Date.now()}`,
  getUniqueRepositoryPath: () => path.join(process.cwd(), 'tmp', `test-repo-${Date.now()}`),
};