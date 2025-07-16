import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiService, ApiError } from '../api';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiService', () => {
  let apiService: ApiService;

  beforeEach(() => {
    apiService = new ApiService();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validateRepository', () => {
    it('should successfully validate a repository', async () => {
      const mockResponse = {
        success: true,
        data: {
          isValid: true,
          validations: [
            {
              type: 'path',
              isValid: true,
              message: 'Path exists and is accessible'
            }
          ],
          repositoryInfo: {
            path: '/test/repo',
            name: 'test-repo',
            isGitRepository: true,
            isTaskMasterProject: false
          },
          errors: []
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.validateRepository({
        repositoryPath: '/test/repo'
      });

      expect(result.isValid).toBe(true);
      expect(result.repositoryInfo.name).toBe('test-repo');
      expect(mockFetch).toHaveBeenCalledWith('/api/repositories/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': expect.stringMatching(/^req_\d+_[a-z0-9]+$/)
        },
        body: JSON.stringify({
          repositoryPath: '/test/repo'
        })
      });
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'INVALID_PATH',
          message: 'Repository path does not exist',
          correlationId: 'test-id'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockResponse
      });

      await expect(apiService.validateRepository({
        repositoryPath: '/invalid/path'
      })).rejects.toThrow(ApiError);

      try {
        await apiService.validateRepository({
          repositoryPath: '/invalid/path'
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        if (error instanceof ApiError) {
          expect(error.code).toBe('INVALID_PATH');
          expect(error.message).toBe('Repository path does not exist');
          expect(error.status).toBe(400);
          expect(error.correlationId).toBe('test-id');
        }
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(apiService.validateRepository({
        repositoryPath: '/test/repo'
      })).rejects.toThrow(ApiError);

      try {
        await apiService.validateRepository({
          repositoryPath: '/test/repo'
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        if (error instanceof ApiError) {
          expect(error.code).toBe('NETWORK_ERROR');
          expect(error.message).toContain('Unable to connect to the server');
        }
      }
    });

    it('should handle successful response with failure status', async () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Repository validation failed'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await expect(apiService.validateRepository({
        repositoryPath: '/test/repo'
      })).rejects.toThrow(ApiError);
    });
  });

  describe('getRepositoryInfo', () => {
    it('should get repository info', async () => {
      const mockResponse = {
        success: true,
        data: {
          path: '/test/repo',
          name: 'test-repo',
          isGitRepository: true,
          isTaskMasterProject: false,
          gitBranch: 'main'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.getRepositoryInfo('/test/repo');

      expect(result.name).toBe('test-repo');
      expect(result.gitBranch).toBe('main');
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/repositories/info?repositoryPath=%2Ftest%2Frepo',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  describe('getRepositoryHealth', () => {
    it('should get repository health', async () => {
      const mockResponse = {
        success: true,
        data: {
          service: 'repository-management',
          status: 'healthy'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.getRepositoryHealth();

      expect(result.status).toBe('healthy');
      expect(mockFetch).toHaveBeenCalledWith('/api/repositories/health', {
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': expect.stringMatching(/^req_\d+_[a-z0-9]+$/)
        }
      });
    });
  });
});