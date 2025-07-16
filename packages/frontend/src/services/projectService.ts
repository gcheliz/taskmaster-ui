// Project Service
// Handles project-related operations including creation, management, and TaskMaster integration

import { apiService, ApiError } from './api';
import type { 
  CreateProjectRequest, 
  ProjectResponse
} from './api';

export interface ProjectCreationOptions {
  repositoryId: string;
  projectName: string;
}

export interface ProjectCreationResult {
  success: boolean;
  project?: ProjectResponse;
  taskMasterInfo?: {
    taskCount: number;
    initOutput: string;
    duration: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Project Service
 * 
 * Provides high-level project management operations including:
 * - Project creation with TaskMaster initialization
 * - Project listing and retrieval
 * - Project deletion
 * - Error handling and user-friendly messages
 */
export class ProjectService {
  
  /**
   * Create a new TaskMaster project
   * 
   * @param options Project creation options
   * @returns Project creation result with success/error information
   */
  async createProject(options: ProjectCreationOptions): Promise<ProjectCreationResult> {
    try {
      // Validate input
      if (!options.repositoryId || !options.projectName) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Repository ID and project name are required'
          }
        };
      }

      // Trim and validate project name
      const projectName = options.projectName.trim();
      if (projectName.length < 2) {
        return {
          success: false,
          error: {
            code: 'INVALID_PROJECT_NAME',
            message: 'Project name must be at least 2 characters long'
          }
        };
      }

      if (projectName.length > 50) {
        return {
          success: false,
          error: {
            code: 'INVALID_PROJECT_NAME',
            message: 'Project name must be less than 50 characters'
          }
        };
      }

      if (!/^[a-zA-Z0-9\-_\s]+$/.test(projectName)) {
        return {
          success: false,
          error: {
            code: 'INVALID_PROJECT_NAME',
            message: 'Project name can only contain letters, numbers, spaces, hyphens, and underscores'
          }
        };
      }

      // Create the project
      const request: CreateProjectRequest = {
        repositoryId: options.repositoryId,
        projectName: projectName
      };

      const response = await apiService.createProject(request);

      return {
        success: true,
        project: response.project,
        taskMasterInfo: response.taskMasterInfo
      };

    } catch (error) {
      if (error instanceof ApiError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: this.getUserFriendlyErrorMessage(error),
            details: error
          }
        };
      }

      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred while creating the project'
        }
      };
    }
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<ProjectResponse[]> {
    try {
      const response = await apiService.getProjects();
      return response.projects;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return [];
    }
  }

  /**
   * Get a specific project by ID
   */
  async getProject(id: string): Promise<ProjectResponse | null> {
    try {
      return await apiService.getProject(id);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      return null;
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<boolean> {
    try {
      await apiService.deleteProject(id);
      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  }

  /**
   * Convert API errors into user-friendly messages
   */
  private getUserFriendlyErrorMessage(error: ApiError): string {
    switch (error.code) {
      case 'MISSING_REPOSITORY_ID':
        return 'Please select a repository';
      
      case 'INVALID_PROJECT_NAME':
      case 'PROJECT_NAME_TOO_SHORT':
      case 'PROJECT_NAME_TOO_LONG':
      case 'INVALID_PROJECT_NAME_FORMAT':
        return 'Please enter a valid project name (2-50 characters, letters, numbers, spaces, hyphens, and underscores only)';
      
      case 'REPOSITORY_NOT_FOUND':
        return 'The selected repository could not be found. Please select a different repository.';
      
      case 'TASKMASTER_INIT_FAILED':
        return 'Failed to initialize TaskMaster in the repository. Please ensure the repository is a valid Git repository.';
      
      case 'TASKMASTER_INIT_ERROR':
        return 'TaskMaster CLI is not available or encountered an error. Please check your TaskMaster installation.';
      
      case 'NETWORK_ERROR':
        return 'Unable to connect to the server. Please check your connection and try again.';
      
      case 'PROJECT_CREATION_ERROR':
      default:
        return error.message || 'An error occurred while creating the project. Please try again.';
    }
  }
}

// Default project service instance
export const projectService = new ProjectService();