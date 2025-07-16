import { useCallback } from 'react';
import { useRepository } from '../contexts/RepositoryContext';
import type { Repository } from '../contexts/RepositoryContext';
import { apiService, ApiError } from '../services/api';
import type { RepositoryValidateRequest } from '../services/api';

export interface UseRepositoryOperationsResult {
  connectRepository: (repositoryPath: string, options?: ConnectRepositoryOptions) => Promise<Repository>;
  disconnectRepository: (repositoryId: string) => Promise<void>;
  refreshRepository: (repositoryId: string) => Promise<void>;
  validateRepositoryPath: (repositoryPath: string, options?: ValidateRepositoryOptions) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export interface ConnectRepositoryOptions {
  validateGit?: boolean;
  validateTaskMaster?: boolean;
  selectAfterConnect?: boolean;
}

export interface ValidateRepositoryOptions {
  validateGit?: boolean;
  validateTaskMaster?: boolean;
}

export const useRepositoryOperations = (): UseRepositoryOperationsResult => {
  const {
    state,
    addRepository,
    removeRepository,
    selectRepository,
    updateRepository,
    setLoading,
    setError,
    getRepositoryByPath,
  } = useRepository();

  const generateRepositoryId = (path: string): string => {
    // Generate a consistent ID based on the path
    const timestamp = Date.now();
    const pathHash = path.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return `repo_${Math.abs(pathHash)}_${timestamp}`;
  };

  const connectRepository = useCallback(async (
    repositoryPath: string,
    options: ConnectRepositoryOptions = {}
  ): Promise<Repository> => {
    const {
      validateGit = true,
      validateTaskMaster = true,
      selectAfterConnect = true,
    } = options;

    setLoading(true);
    setError(null);

    try {
      // Check if repository is already connected
      const existingRepo = getRepositoryByPath(repositoryPath);
      if (existingRepo) {
        setLoading(false);
        setError('Repository is already connected');
        throw new Error('Repository is already connected');
      }

      // Validate repository via API
      const validationRequest: RepositoryValidateRequest = {
        repositoryPath,
        validateGit,
        validateTaskMaster,
      };

      const validationResult = await apiService.validateRepository(validationRequest);

      if (!validationResult.isValid) {
        const errorMessage = validationResult.errors.length > 0
          ? validationResult.errors[0]
          : 'Repository validation failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Create repository object
      const repository: Repository = {
        id: generateRepositoryId(repositoryPath),
        connectedAt: new Date().toISOString(),
        validationResult,
        ...validationResult.repositoryInfo,
      };

      // Add to state
      addRepository(repository);

      // Select if requested
      if (selectAfterConnect) {
        selectRepository(repository);
      }

      setLoading(false);
      return repository;

    } catch (error) {
      setLoading(false);
      
      if (error instanceof ApiError) {
        setError(error.message);
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect repository';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [addRepository, selectRepository, setLoading, setError, getRepositoryByPath]);

  const disconnectRepository = useCallback(async (repositoryId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Remove from state
      removeRepository(repositoryId);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect repository';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [removeRepository, setLoading, setError]);

  const refreshRepository = useCallback(async (repositoryId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const repository = state.repositories.find(repo => repo.id === repositoryId);
      if (!repository) {
        throw new Error('Repository not found');
      }

      // Re-validate repository
      const validationRequest: RepositoryValidateRequest = {
        repositoryPath: repository.path,
        validateGit: repository.isGitRepository,
        validateTaskMaster: repository.isTaskMasterProject,
      };

      const validationResult = await apiService.validateRepository(validationRequest);

      // Update repository with new validation result
      const updates: Partial<Repository> = {
        validationResult,
        ...validationResult.repositoryInfo,
      };

      updateRepository(repositoryId, updates);
      setLoading(false);

    } catch (error) {
      setLoading(false);
      
      if (error instanceof ApiError) {
        setError(error.message);
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh repository';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [state.repositories, updateRepository, setLoading, setError]);

  const validateRepositoryPath = useCallback(async (
    repositoryPath: string,
    options: ValidateRepositoryOptions = {}
  ): Promise<boolean> => {
    const { validateGit = true, validateTaskMaster = true } = options;

    try {
      const validationRequest: RepositoryValidateRequest = {
        repositoryPath,
        validateGit,
        validateTaskMaster,
      };

      const validationResult = await apiService.validateRepository(validationRequest);
      return validationResult.isValid;

    } catch (error) {
      console.error('Repository validation failed:', error);
      return false;
    }
  }, []);

  return {
    connectRepository,
    disconnectRepository,
    refreshRepository,
    validateRepositoryPath,
    isLoading: state.isLoading,
    error: state.error,
  };
};