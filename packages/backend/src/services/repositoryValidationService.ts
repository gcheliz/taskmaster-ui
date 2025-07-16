// Repository Validation Service
// Provides comprehensive validation for Git repositories and TaskMaster projects

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { 
  RepositoryValidationResult, 
  RepositoryValidation, 
  RepositoryInfo,
  GitCommitInfo,
  TaskMasterProjectConfig
} from '../types/api';
import { logger } from '../utils/logger';
import { errorHandler, ErrorSeverity } from '../utils/errorHandler';

const execAsync = promisify(exec);

export interface RepositoryValidationOptions {
  validateGit?: boolean;
  validateTaskMaster?: boolean;
  checkPermissions?: boolean;
}

export class RepositoryValidationService {
  private static instance: RepositoryValidationService;

  static getInstance(): RepositoryValidationService {
    if (!RepositoryValidationService.instance) {
      RepositoryValidationService.instance = new RepositoryValidationService();
    }
    return RepositoryValidationService.instance;
  }

  /**
   * Validate a repository path with comprehensive checks
   */
  async validateRepository(
    repositoryPath: string, 
    options: RepositoryValidationOptions = {}
  ): Promise<RepositoryValidationResult> {
    const requestId = this.generateRequestId();
    const context = { 
      requestId, 
      repositoryPath, 
      operation: 'validate-repository'
    };

    logger.info('Starting repository validation', context, 'repository-validator');

    const validations: RepositoryValidation[] = [];
    let repositoryInfo: RepositoryInfo | undefined;
    const errors: string[] = [];

    try {
      // 1. Path validation
      const pathValidation = await this.validatePath(repositoryPath);
      validations.push(pathValidation);

      if (!pathValidation.isValid) {
        errors.push(pathValidation.message);
        logger.warn('Path validation failed', { ...context, validation: pathValidation }, 'repository-validator');
        return this.createResult(false, validations, undefined, errors);
      }

      // 2. Directory validation
      const directoryValidation = await this.validateDirectory(repositoryPath);
      validations.push(directoryValidation);

      if (!directoryValidation.isValid) {
        errors.push(directoryValidation.message);
        logger.warn('Directory validation failed', { ...context, validation: directoryValidation }, 'repository-validator');
        return this.createResult(false, validations, undefined, errors);
      }

      // 3. Permissions validation
      if (options.checkPermissions !== false) {
        const permissionsValidation = await this.validatePermissions(repositoryPath);
        validations.push(permissionsValidation);

        if (!permissionsValidation.isValid) {
          errors.push(permissionsValidation.message);
          logger.warn('Permissions validation failed', { ...context, validation: permissionsValidation }, 'repository-validator');
        }
      }

      // Initialize repository info
      repositoryInfo = {
        path: repositoryPath,
        name: path.basename(repositoryPath),
        isGitRepository: false,
        isTaskMasterProject: false
      };

      // 4. Git validation (optional)
      if (options.validateGit !== false) {
        const gitValidation = await this.validateGitRepository(repositoryPath);
        validations.push(gitValidation);

        if (gitValidation.isValid) {
          repositoryInfo.isGitRepository = true;
          const gitInfo = await this.getGitInfo(repositoryPath);
          if (gitInfo) {
            repositoryInfo.gitBranch = gitInfo.branch;
            repositoryInfo.gitRemoteUrl = gitInfo.remoteUrl;
            repositoryInfo.lastCommit = gitInfo.lastCommit;
          }
        }
      }

      // 5. TaskMaster validation (optional)
      if (options.validateTaskMaster !== false) {
        const taskMasterValidation = await this.validateTaskMasterProject(repositoryPath);
        validations.push(taskMasterValidation);

        if (taskMasterValidation.isValid) {
          repositoryInfo.isTaskMasterProject = true;
          const taskMasterConfig = await this.getTaskMasterConfig(repositoryPath);
          if (taskMasterConfig) {
            repositoryInfo.taskMasterConfig = taskMasterConfig;
          }
        }
      }

      // Determine overall validity
      const criticalValidations = validations.filter(v => 
        v.type === 'path' || v.type === 'directory' || v.type === 'permissions'
      );
      const isValid = criticalValidations.every(v => v.isValid);

      const result = this.createResult(isValid, validations, repositoryInfo, errors);

      logger.info('Repository validation completed', { 
        ...context, 
        isValid, 
        validationCount: validations.length,
        errorCount: errors.length 
      }, 'repository-validator');

      return result;

    } catch (error) {
      const taskMasterError = errorHandler.normalizeError(error, context);
      logger.error('Repository validation failed', context, taskMasterError, 'repository-validator');

      errors.push(taskMasterError.userMessage);
      return this.createResult(false, validations, repositoryInfo, errors);
    }
  }

  /**
   * Validate that the path exists and is accessible
   */
  private async validatePath(repositoryPath: string): Promise<RepositoryValidation> {
    try {
      await fs.access(repositoryPath);
      return {
        type: 'path',
        isValid: true,
        message: 'Path exists and is accessible',
        details: { path: repositoryPath }
      };
    } catch (error) {
      return {
        type: 'path',
        isValid: false,
        message: 'Path does not exist or is not accessible',
        details: { path: repositoryPath, error: (error as Error).message }
      };
    }
  }

  /**
   * Validate that the path is a directory
   */
  private async validateDirectory(repositoryPath: string): Promise<RepositoryValidation> {
    try {
      const stats = await fs.stat(repositoryPath);
      
      if (stats.isDirectory()) {
        return {
          type: 'directory',
          isValid: true,
          message: 'Path is a valid directory',
          details: { 
            path: repositoryPath,
            size: stats.size,
            modified: stats.mtime.toISOString()
          }
        };
      } else {
        return {
          type: 'directory',
          isValid: false,
          message: 'Path exists but is not a directory',
          details: { path: repositoryPath, type: stats.isFile() ? 'file' : 'other' }
        };
      }
    } catch (error) {
      return {
        type: 'directory',
        isValid: false,
        message: 'Unable to check if path is a directory',
        details: { path: repositoryPath, error: (error as Error).message }
      };
    }
  }

  /**
   * Validate read/write permissions
   */
  private async validatePermissions(repositoryPath: string): Promise<RepositoryValidation> {
    try {
      // Check read permissions
      await fs.access(repositoryPath, fs.constants.R_OK);
      
      // Check write permissions
      await fs.access(repositoryPath, fs.constants.W_OK);

      return {
        type: 'permissions',
        isValid: true,
        message: 'Directory has read and write permissions',
        details: { path: repositoryPath }
      };
    } catch (error) {
      return {
        type: 'permissions',
        isValid: false,
        message: 'Insufficient permissions (need read/write access)',
        details: { path: repositoryPath, error: (error as Error).message }
      };
    }
  }

  /**
   * Validate that the directory is a Git repository
   */
  private async validateGitRepository(repositoryPath: string): Promise<RepositoryValidation> {
    try {
      const gitDir = path.join(repositoryPath, '.git');
      await fs.access(gitDir);

      // Verify git status works
      const { stdout } = await execAsync('git status --porcelain', { 
        cwd: repositoryPath,
        timeout: 5000
      });

      return {
        type: 'git',
        isValid: true,
        message: 'Valid Git repository',
        details: { 
          path: repositoryPath,
          gitDir,
          hasChanges: stdout.trim().length > 0
        }
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      
      if (errorMessage.includes('ENOENT') || errorMessage.includes('no such file')) {
        return {
          type: 'git',
          isValid: false,
          message: 'Not a Git repository (no .git directory found)',
          details: { path: repositoryPath }
        };
      }

      return {
        type: 'git',
        isValid: false,
        message: 'Git repository validation failed',
        details: { path: repositoryPath, error: errorMessage }
      };
    }
  }

  /**
   * Validate that the directory is a TaskMaster project
   */
  private async validateTaskMasterProject(repositoryPath: string): Promise<RepositoryValidation> {
    try {
      const taskMasterDir = path.join(repositoryPath, '.taskmaster');
      const tasksFile = path.join(taskMasterDir, 'tasks', 'tasks.json');
      const configFile = path.join(taskMasterDir, 'config.json');

      // Check if .taskmaster directory exists
      await fs.access(taskMasterDir);

      // Check if tasks.json exists
      let hasTasksFile = false;
      try {
        await fs.access(tasksFile);
        hasTasksFile = true;
      } catch {}

      // Check if config.json exists
      let hasConfigFile = false;
      try {
        await fs.access(configFile);
        hasConfigFile = true;
      } catch {}

      if (hasTasksFile || hasConfigFile) {
        return {
          type: 'taskmaster',
          isValid: true,
          message: 'Valid TaskMaster project',
          details: { 
            path: repositoryPath,
            taskMasterDir,
            hasTasksFile,
            hasConfigFile
          }
        };
      } else {
        return {
          type: 'taskmaster',
          isValid: false,
          message: 'TaskMaster directory exists but is missing core files',
          details: { 
            path: repositoryPath,
            taskMasterDir,
            missingFiles: ['tasks.json', 'config.json']
          }
        };
      }
    } catch (error) {
      return {
        type: 'taskmaster',
        isValid: false,
        message: 'Not a TaskMaster project (no .taskmaster directory found)',
        details: { path: repositoryPath }
      };
    }
  }

  /**
   * Get detailed Git information
   */
  private async getGitInfo(repositoryPath: string): Promise<{
    branch: string;
    remoteUrl?: string;
    lastCommit?: GitCommitInfo;
  } | null> {
    try {
      // Get current branch
      const { stdout: branchOutput } = await execAsync('git branch --show-current', { 
        cwd: repositoryPath,
        timeout: 5000 
      });
      const branch = branchOutput.trim();

      // Get remote URL (if exists)
      let remoteUrl: string | undefined;
      try {
        const { stdout: remoteOutput } = await execAsync('git remote get-url origin', { 
          cwd: repositoryPath,
          timeout: 5000 
        });
        remoteUrl = remoteOutput.trim();
      } catch {
        // No remote or origin not found
      }

      // Get last commit info
      let lastCommit: GitCommitInfo | undefined;
      try {
        const { stdout: commitOutput } = await execAsync(
          'git log -1 --pretty=format:"%H|%s|%an|%ad" --date=iso', 
          { cwd: repositoryPath, timeout: 5000 }
        );
        
        if (commitOutput.trim()) {
          const [hash, message, author, date] = commitOutput.split('|');
          lastCommit = { hash, message, author, date };
        }
      } catch {
        // No commits or git log failed
      }

      return { branch, remoteUrl, lastCommit };
    } catch (error) {
      logger.warn('Failed to get Git info', { repositoryPath, error: (error as Error).message }, 'repository-validator');
      return null;
    }
  }

  /**
   * Get TaskMaster project configuration
   */
  private async getTaskMasterConfig(repositoryPath: string): Promise<TaskMasterProjectConfig | null> {
    try {
      const taskMasterDir = path.join(repositoryPath, '.taskmaster');
      const tasksFile = path.join(taskMasterDir, 'tasks', 'tasks.json');
      const configFile = path.join(taskMasterDir, 'config.json');

      let taskCount = 0;
      let lastUpdated = '';

      // Try to read tasks.json to get task count and last updated
      try {
        const tasksData = await fs.readFile(tasksFile, 'utf-8');
        const tasksJson = JSON.parse(tasksData);
        
        // Count tasks across all project tags
        for (const projectKey in tasksJson) {
          if (tasksJson[projectKey] && tasksJson[projectKey].tasks) {
            taskCount += tasksJson[projectKey].tasks.length;
            
            // Get the most recent update timestamp
            const projectLastUpdated = tasksJson[projectKey].metadata?.updated;
            if (projectLastUpdated && projectLastUpdated > lastUpdated) {
              lastUpdated = projectLastUpdated;
            }
          }
        }
      } catch (error) {
        logger.debug('Could not read tasks.json', { repositoryPath, error: (error as Error).message }, 'repository-validator');
      }

      return {
        initialized: true,
        taskCount,
        lastUpdated: lastUpdated || new Date().toISOString(),
        configPath: configFile
      };
    } catch (error) {
      logger.warn('Failed to get TaskMaster config', { repositoryPath, error: (error as Error).message }, 'repository-validator');
      return null;
    }
  }

  /**
   * Create a validation result
   */
  private createResult(
    isValid: boolean,
    validations: RepositoryValidation[],
    repositoryInfo?: RepositoryInfo,
    errors?: string[]
  ): RepositoryValidationResult {
    return {
      isValid,
      validations,
      repositoryInfo,
      errors: errors && errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Generate unique request ID for tracking
   */
  private generateRequestId(): string {
    return `repo_val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const repositoryValidationService = RepositoryValidationService.getInstance();