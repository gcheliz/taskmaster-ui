import { useState, useCallback } from 'react';
import { projectService } from '../services/projectService';
import type { ProjectCreationOptions, ProjectCreationResult } from '../services/projectService';
import type { ProjectResponse } from '../services/api';

export interface UseProjectOperationsResult {
  createProject: (options: ProjectCreationOptions) => Promise<ProjectCreationResult>;
  getProjects: () => Promise<ProjectResponse[]>;
  getProject: (id: string) => Promise<ProjectResponse | null>;
  deleteProject: (id: string) => Promise<boolean>;
  isCreating: boolean;
  isLoading: boolean;
  error: string | null;
  lastCreatedProject: ProjectResponse | null;
  lastTaskMasterInfo: { taskCount: number; initOutput: string; duration: number } | null;
}

/**
 * Hook for project operations
 * 
 * Provides a React interface for project creation, management, and state tracking.
 * Handles loading states, error management, and success feedback.
 */
export const useProjectOperations = (): UseProjectOperationsResult => {
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedProject, setLastCreatedProject] = useState<ProjectResponse | null>(null);
  const [lastTaskMasterInfo, setLastTaskMasterInfo] = useState<{ 
    taskCount: number; 
    initOutput: string; 
    duration: number 
  } | null>(null);

  const createProject = useCallback(async (options: ProjectCreationOptions): Promise<ProjectCreationResult> => {
    setIsCreating(true);
    setError(null);
    setLastCreatedProject(null);
    setLastTaskMasterInfo(null);

    try {
      const result = await projectService.createProject(options);
      
      if (result.success) {
        setLastCreatedProject(result.project!);
        setLastTaskMasterInfo(result.taskMasterInfo || null);
        setError(null);
      } else {
        setError(result.error?.message || 'Failed to create project');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: errorMessage
        }
      };
    } finally {
      setIsCreating(false);
    }
  }, []);

  const getProjects = useCallback(async (): Promise<ProjectResponse[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const projects = await projectService.getProjects();
      setError(null);
      return projects;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch projects';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProject = useCallback(async (id: string): Promise<ProjectResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const project = await projectService.getProject(id);
      setError(null);
      return project;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch project';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await projectService.deleteProject(id);
      
      if (!success) {
        setError('Failed to delete project');
      } else {
        setError(null);
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createProject,
    getProjects,
    getProject,
    deleteProject,
    isCreating,
    isLoading,
    error,
    lastCreatedProject,
    lastTaskMasterInfo,
  };
};