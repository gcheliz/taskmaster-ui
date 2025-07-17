import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { repositoryService } from '../services/repositoryService';
import { projectService } from '../services/projectService';
import { taskMasterService } from '../services/taskMasterService';

export interface CreateProjectRequest {
  repositoryId: string;
  projectName: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  repositoryId: string;
  repositoryPath: string;
  createdAt: string;
  status: 'initializing' | 'active' | 'error';
  tasksPath?: string;
}

export interface TaskMasterInfo {
  taskCount: number;
  initOutput: string;
  duration: number;
}

export interface CreateProjectResponse {
  project: ProjectResponse;
  message: string;
  taskMasterInfo?: TaskMasterInfo;
}

/**
 * Project Controller
 * 
 * Handles project-related operations including:
 * - Project creation and initialization
 * - Project listing and management
 * - Integration with TaskMaster CLI
 */
export class ProjectController {

  /**
   * Create a new TaskMaster project
   * POST /api/projects
   */
  async createProject(req: Request, res: Response): Promise<void> {
    const requestId = `proj_create_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      logger.info('Starting project creation', {
        requestId,
        operation: 'create-project',
        timestamp: new Date().toISOString()
      });

      // Validate request body
      const { repositoryId, projectName }: CreateProjectRequest = req.body;

      if (!repositoryId) {
        logger.warn('Project creation failed: missing repositoryId', {
          requestId,
          validation: { repositoryId: 'required' }
        });
        res.status(400).json({
          error: 'Repository ID is required',
          code: 'MISSING_REPOSITORY_ID'
        });
        return;
      }

      if (!projectName || typeof projectName !== 'string') {
        logger.warn('Project creation failed: invalid projectName', {
          requestId,
          validation: { projectName: 'required string' }
        });
        res.status(400).json({
          error: 'Project name is required and must be a string',
          code: 'INVALID_PROJECT_NAME'
        });
        return;
      }

      // Validate project name format
      const projectNameTrimmed = projectName.trim();
      if (projectNameTrimmed.length < 2) {
        logger.warn('Project creation failed: project name too short', {
          requestId,
          projectName: projectNameTrimmed,
          validation: { minLength: 2 }
        });
        res.status(400).json({
          error: 'Project name must be at least 2 characters long',
          code: 'PROJECT_NAME_TOO_SHORT'
        });
        return;
      }

      if (projectNameTrimmed.length > 50) {
        logger.warn('Project creation failed: project name too long', {
          requestId,
          projectName: projectNameTrimmed,
          validation: { maxLength: 50 }
        });
        res.status(400).json({
          error: 'Project name must be less than 50 characters',
          code: 'PROJECT_NAME_TOO_LONG'
        });
        return;
      }

      if (!/^[a-zA-Z0-9\-_\s]+$/.test(projectNameTrimmed)) {
        logger.warn('Project creation failed: invalid project name format', {
          requestId,
          projectName: projectNameTrimmed,
          validation: { pattern: 'alphanumeric with spaces, hyphens, underscores only' }
        });
        res.status(400).json({
          error: 'Project name can only contain letters, numbers, spaces, hyphens, and underscores',
          code: 'INVALID_PROJECT_NAME_FORMAT'
        });
        return;
      }

      // Check if repository exists
      const repository = await repositoryService.getRepositoryById(repositoryId);
      if (!repository) {
        logger.warn('Project creation failed: repository not found', {
          requestId,
          repositoryId
        });
        res.status(404).json({
          error: 'Repository not found',
          code: 'REPOSITORY_NOT_FOUND'
        });
        return;
      }

      logger.info('Repository found for project creation', {
        requestId,
        repositoryId,
        repositoryPath: repository.path,
        projectName: projectNameTrimmed
      });

      // Generate project ID
      const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      logger.info('Starting TaskMaster CLI initialization', {
        requestId,
        projectId,
        projectName: projectNameTrimmed,
        repositoryPath: repository.path
      });

      // Execute TaskMaster CLI initialization
      try {
        const initResult = await taskMasterService.initProject(repository.path);
        
        if (!initResult.success) {
          logger.error('TaskMaster CLI initialization failed', {
            requestId,
            projectId,
            error: initResult.error,
            output: initResult.output,
            exitCode: initResult.exitCode
          });

          res.status(500).json({
            error: 'Failed to initialize TaskMaster project',
            code: 'TASKMASTER_INIT_FAILED',
            details: {
              output: initResult.output,
              error: initResult.error,
              exitCode: initResult.exitCode
            }
          });
          return;
        }

        logger.info('TaskMaster CLI initialization completed successfully', {
          requestId,
          projectId,
          duration: initResult.duration,
          taskCount: initResult.data?.taskCount || 0
        });

        // Create project in database
        const project = await projectService.findOrCreateProject({
          name: projectNameTrimmed,
          path: repository.path,
          description: `TaskMaster project for ${repository.name}`
        });

        // Update repository to link to the project if not already linked
        if (repository.projectId !== project.id) {
          await repositoryService.updateRepository(repositoryId, {
            // Note: This will require updating the repository to include projectId
          });
        }

        // Create project response with 'active' status after successful initialization
        const projectResponse: ProjectResponse = {
          id: project.id,
          name: project.name,
          repositoryId: repositoryId,
          repositoryPath: repository.path,
          createdAt: project.createdAt.toISOString(),
          status: 'active',
          tasksPath: `${repository.path}/.taskmaster/tasks/tasks.json`
        };

        logger.info('Project creation completed successfully', {
          requestId,
          projectId,
          projectName: projectNameTrimmed,
          repositoryPath: repository.path,
          status: 'active',
          initDuration: initResult.duration
        });

        // Return 201 Created with project data
        res.status(201).json({
          project: projectResponse,
          message: 'Project created and initialized successfully',
          taskMasterInfo: {
            taskCount: initResult.data?.taskCount || 0,
            initOutput: initResult.output,
            duration: initResult.duration
          }
        });

      } catch (initError) {
        logger.error('TaskMaster CLI initialization failed with error', {
          requestId,
          projectId,
          error: initError instanceof Error ? initError.message : 'Unknown error',
          stack: initError instanceof Error ? initError.stack : undefined
        });

        res.status(500).json({
          error: 'Failed to initialize TaskMaster project',
          code: 'TASKMASTER_INIT_ERROR',
          details: {
            message: initError instanceof Error ? initError.message : 'Unknown error'
          }
        });
        return;
      }

    } catch (error) {
      logger.error('Project creation failed with unexpected error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      res.status(500).json({
        error: 'Internal server error during project creation',
        code: 'PROJECT_CREATION_ERROR'
      });
    }
  }

  /**
   * Get all projects
   * GET /api/projects
   */
  async getProjects(req: Request, res: Response): Promise<void> {
    const requestId = `proj_list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      logger.info('Listing projects', {
        requestId,
        operation: 'list-projects',
        timestamp: new Date().toISOString()
      });

      // Get all projects from database
      const projectsData = await projectService.getAllProjects();
      
      // Transform to response format
      const projects: ProjectResponse[] = projectsData.map(project => ({
        id: project.id,
        name: project.name,
        repositoryId: project.repositories?.[0]?.id || '',
        repositoryPath: project.path,
        createdAt: project.createdAt.toISOString(),
        status: 'active' as const,
        tasksPath: `${project.path}/.taskmaster/tasks/tasks.json`
      }));

      logger.info('Projects listed successfully', {
        requestId,
        projectCount: projects.length
      });

      res.status(200).json({
        projects,
        count: projects.length,
        metadata: {
          totalProjects: projectsData.length,
          totalRepositories: projectsData.reduce((sum, p) => sum + (p._count?.repositories || 0), 0),
          totalTasks: projectsData.reduce((sum, p) => sum + (p._count?.tasks || 0), 0)
        }
      });

    } catch (error) {
      logger.error('Failed to list projects', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      res.status(500).json({
        error: 'Internal server error while listing projects',
        code: 'PROJECT_LIST_ERROR'
      });
    }
  }

  /**
   * Get project by ID
   * GET /api/projects/:id
   */
  async getProjectById(req: Request, res: Response): Promise<void> {
    const requestId = `proj_get_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const projectId = req.params.id;

    try {
      logger.info('Getting project by ID', {
        requestId,
        projectId,
        operation: 'get-project',
        timestamp: new Date().toISOString()
      });

      if (!projectId) {
        res.status(400).json({
          error: 'Project ID is required',
          code: 'MISSING_PROJECT_ID'
        });
        return;
      }

      // Get project from database
      const project = await projectService.getProjectById(projectId);
      
      if (!project) {
        logger.warn('Project not found', {
          requestId,
          projectId
        });

        res.status(404).json({
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND'
        });
        return;
      }

      // Transform to response format
      const projectResponse: ProjectResponse = {
        id: project.id,
        name: project.name,
        repositoryId: project.repositories?.[0]?.id || '',
        repositoryPath: project.path,
        createdAt: project.createdAt.toISOString(),
        status: 'active',
        tasksPath: `${project.path}/.taskmaster/tasks/tasks.json`
      };

      logger.info('Project retrieved successfully', {
        requestId,
        projectId,
        projectName: project.name
      });

      res.status(200).json({
        project: projectResponse,
        details: {
          description: project.description,
          repositoryCount: project._count?.repositories || 0,
          taskCount: project._count?.tasks || 0,
          repositories: project.repositories?.map(repo => ({
            id: repo.id,
            name: repo.name,
            url: repo.url,
            branch: repo.branch
          })),
          recentTasks: project.tasks?.slice(0, 5).map(task => ({
            id: task.id,
            title: task.title,
            status: task.status,
            priority: task.priority,
            createdAt: task.createdAt.toISOString()
          }))
        }
      });

    } catch (error) {
      logger.error('Failed to get project', {
        requestId,
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      res.status(500).json({
        error: 'Internal server error while getting project',
        code: 'PROJECT_GET_ERROR'
      });
    }
  }

  /**
   * Delete project by ID
   * DELETE /api/projects/:id
   */
  async deleteProject(req: Request, res: Response): Promise<void> {
    const requestId = `proj_delete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const projectId = req.params.id;

    try {
      logger.info('Deleting project', {
        requestId,
        projectId,
        operation: 'delete-project',
        timestamp: new Date().toISOString()
      });

      if (!projectId) {
        res.status(400).json({
          error: 'Project ID is required',
          code: 'MISSING_PROJECT_ID'
        });
        return;
      }

      // Delete project from database
      const deleted = await projectService.deleteProject(projectId);
      
      if (!deleted) {
        logger.warn('Project not found for deletion', {
          requestId,
          projectId
        });

        res.status(404).json({
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND'
        });
        return;
      }

      logger.info('Project deleted successfully', {
        requestId,
        projectId
      });

      res.status(200).json({
        message: 'Project deleted successfully',
        projectId
      });

    } catch (error) {
      logger.error('Failed to delete project', {
        requestId,
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      res.status(500).json({
        error: 'Internal server error while deleting project',
        code: 'PROJECT_DELETE_ERROR'
      });
    }
  }
}

export const projectController = new ProjectController();