import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RepositoryProvider, useRepository } from '../RepositoryContext';
import type { Repository } from '../RepositoryContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <RepositoryProvider>{children}</RepositoryProvider>
);

const mockRepository: Repository = {
  id: 'test-repo-1',
  path: '/test/repo',
  name: 'test-repo',
  isGitRepository: true,
  isTaskMasterProject: false,
  connectedAt: '2024-01-01T00:00:00.000Z',
  validationResult: {
    isValid: true,
    validations: [],
    repositoryInfo: {
      path: '/test/repo',
      name: 'test-repo',
      isGitRepository: true,
      isTaskMasterProject: false
    },
    errors: []
  }
};

describe('RepositoryContext', () => {
  describe('useRepository hook', () => {
    it('should provide initial state', () => {
      const { result } = renderHook(() => useRepository(), { wrapper });

      expect(result.current.state.repositories).toEqual([]);
      expect(result.current.state.selectedRepository).toBeNull();
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.error).toBeNull();
    });

    it('should add a repository', () => {
      const { result } = renderHook(() => useRepository(), { wrapper });

      act(() => {
        result.current.addRepository(mockRepository);
      });

      expect(result.current.state.repositories).toHaveLength(1);
      expect(result.current.state.repositories[0]).toEqual(mockRepository);
    });

    it('should update existing repository when adding with same path', () => {
      const { result } = renderHook(() => useRepository(), { wrapper });

      // Add initial repository
      act(() => {
        result.current.addRepository(mockRepository);
      });

      // Add updated repository with same path
      const updatedRepository = {
        ...mockRepository,
        id: 'test-repo-2',
        name: 'updated-repo'
      };

      act(() => {
        result.current.addRepository(updatedRepository);
      });

      expect(result.current.state.repositories).toHaveLength(1);
      expect(result.current.state.repositories[0].name).toBe('updated-repo');
      expect(result.current.state.repositories[0].id).toBe('test-repo-2');
    });

    it('should remove a repository', () => {
      const { result } = renderHook(() => useRepository(), { wrapper });

      // Add repository
      act(() => {
        result.current.addRepository(mockRepository);
      });

      expect(result.current.state.repositories).toHaveLength(1);

      // Remove repository
      act(() => {
        result.current.removeRepository(mockRepository.id);
      });

      expect(result.current.state.repositories).toHaveLength(0);
    });

    it('should select a repository', () => {
      const { result } = renderHook(() => useRepository(), { wrapper });

      act(() => {
        result.current.selectRepository(mockRepository);
      });

      expect(result.current.state.selectedRepository).toEqual(mockRepository);
    });

    it('should deselect repository when removing selected repository', () => {
      const { result } = renderHook(() => useRepository(), { wrapper });

      // Add and select repository
      act(() => {
        result.current.addRepository(mockRepository);
        result.current.selectRepository(mockRepository);
      });

      expect(result.current.state.selectedRepository).toEqual(mockRepository);

      // Remove selected repository
      act(() => {
        result.current.removeRepository(mockRepository.id);
      });

      expect(result.current.state.selectedRepository).toBeNull();
    });

    it('should update a repository', () => {
      const { result } = renderHook(() => useRepository(), { wrapper });

      // Add repository
      act(() => {
        result.current.addRepository(mockRepository);
      });

      // Update repository
      act(() => {
        result.current.updateRepository(mockRepository.id, {
          name: 'updated-name',
          gitBranch: 'develop'
        });
      });

      const updatedRepo = result.current.state.repositories[0];
      expect(updatedRepo.name).toBe('updated-name');
      expect(updatedRepo.gitBranch).toBe('develop');
      expect(updatedRepo.path).toBe(mockRepository.path); // Should preserve other fields
    });

    it('should update selected repository when updating', () => {
      const { result } = renderHook(() => useRepository(), { wrapper });

      // Add and select repository
      act(() => {
        result.current.addRepository(mockRepository);
        result.current.selectRepository(mockRepository);
      });

      // Update repository
      act(() => {
        result.current.updateRepository(mockRepository.id, {
          name: 'updated-name'
        });
      });

      expect(result.current.state.selectedRepository?.name).toBe('updated-name');
    });

    it('should set loading state', () => {
      const { result } = renderHook(() => useRepository(), { wrapper });

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.state.isLoading).toBe(true);
    });

    it('should set error state', () => {
      const { result } = renderHook(() => useRepository(), { wrapper });

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.state.error).toBe('Test error');
      expect(result.current.state.isLoading).toBe(false);
    });

    it('should clear repositories', () => {
      const { result } = renderHook(() => useRepository(), { wrapper });

      // Add repository and select it
      act(() => {
        result.current.addRepository(mockRepository);
        result.current.selectRepository(mockRepository);
      });

      expect(result.current.state.repositories).toHaveLength(1);
      expect(result.current.state.selectedRepository).not.toBeNull();

      // Clear repositories
      act(() => {
        result.current.clearRepositories();
      });

      expect(result.current.state.repositories).toHaveLength(0);
      expect(result.current.state.selectedRepository).toBeNull();
    });

    it('should get repository by id', () => {
      const { result } = renderHook(() => useRepository(), { wrapper });

      act(() => {
        result.current.addRepository(mockRepository);
      });

      const foundRepo = result.current.getRepositoryById(mockRepository.id);
      expect(foundRepo).toEqual(mockRepository);

      const notFoundRepo = result.current.getRepositoryById('non-existent');
      expect(notFoundRepo).toBeUndefined();
    });

    it('should get repository by path', () => {
      const { result } = renderHook(() => useRepository(), { wrapper });

      act(() => {
        result.current.addRepository(mockRepository);
      });

      const foundRepo = result.current.getRepositoryByPath(mockRepository.path);
      expect(foundRepo).toEqual(mockRepository);

      const notFoundRepo = result.current.getRepositoryByPath('/non-existent');
      expect(notFoundRepo).toBeUndefined();
    });
  });

  describe('RepositoryProvider', () => {
    it('should accept initial repositories', () => {
      const initialRepositories = [mockRepository];
      
      const TestWrapper = ({ children }: { children: React.ReactNode }) => (
        <RepositoryProvider initialRepositories={initialRepositories}>
          {children}
        </RepositoryProvider>
      );

      const { result } = renderHook(() => useRepository(), { wrapper: TestWrapper });

      expect(result.current.state.repositories).toEqual(initialRepositories);
    });

    it('should throw error when useRepository is used outside provider', () => {
      expect(() => {
        renderHook(() => useRepository());
      }).toThrow('useRepository must be used within a RepositoryProvider');
    });
  });
});