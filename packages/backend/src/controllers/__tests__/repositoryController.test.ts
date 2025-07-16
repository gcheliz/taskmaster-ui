// Repository Controller Tests
// Tests for repository management endpoints

import { RepositoryController } from '../repositoryController';
import { repositoryValidationService } from '../../services/repositoryValidationService';
import { gitDataService } from '../../services/gitDataService';
import { EnhancedRequest, EnhancedResponse } from '../../middleware';
import { RepositoryValidationResult } from '../../types/api';

// Mock the services
jest.mock('../../services/repositoryValidationService');
jest.mock('../../services/gitDataService');

const mockRepositoryValidationService = repositoryValidationService as jest.Mocked<typeof repositoryValidationService>;
const mockGitDataService = gitDataService as jest.Mocked<typeof gitDataService>;

describe('RepositoryController', () => {
  let controller: RepositoryController;
  let mockRequest: Partial<EnhancedRequest>;
  let mockResponse: Partial<EnhancedResponse>;

  beforeEach(() => {
    controller = new RepositoryController();
    
    mockRequest = {
      requestId: 'test-req-123',
      method: 'POST',
      path: '/api/repositories/validate',
      body: {},
      query: {},
      validatedBody: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('validateRepository', () => {
    const validationRequest = {
      repositoryPath: '/Users/test/valid-repo',
      validateGit: true,
      validateTaskMaster: true
    };

    it('should validate repository successfully', async () => {
      const mockValidationResult: RepositoryValidationResult = {
        isValid: true,
        validations: [
          {
            type: 'path',
            isValid: true,
            message: 'Path exists and is accessible'
          },
          {
            type: 'directory',
            isValid: true,
            message: 'Path is a valid directory'
          },
          {
            type: 'git',
            isValid: true,
            message: 'Valid Git repository'
          }
        ],
        repositoryInfo: {
          path: '/Users/test/valid-repo',
          name: 'valid-repo',
          isGitRepository: true,
          isTaskMasterProject: false,
          gitBranch: 'main'
        }
      };

      mockRepositoryValidationService.validateRepository.mockResolvedValue(mockValidationResult);
      mockRequest.validatedBody = validationRequest;

      await controller.validateRepository(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      expect(mockRepositoryValidationService.validateRepository).toHaveBeenCalledWith(
        '/Users/test/valid-repo',
        {
          validateGit: true,
          validateTaskMaster: true,
          checkPermissions: true
        }
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockValidationResult,
        metadata: expect.objectContaining({
          timestamp: expect.any(String),
          requestId: 'test-req-123',
          duration: expect.any(Number),
          version: '1.0.0'
        })
      });
    });

    it('should handle invalid repository path', async () => {
      const mockValidationResult: RepositoryValidationResult = {
        isValid: false,
        validations: [
          {
            type: 'path',
            isValid: false,
            message: 'Path does not exist or is not accessible'
          }
        ],
        errors: ['Path does not exist or is not accessible']
      };

      mockRepositoryValidationService.validateRepository.mockResolvedValue(mockValidationResult);
      mockRequest.validatedBody = {
        ...validationRequest,
        repositoryPath: '/invalid/path'
      };

      await controller.validateRepository(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockValidationResult,
        metadata: expect.objectContaining({
          requestId: 'test-req-123'
        })
      });
    });

    it('should handle validation service errors', async () => {
      const serviceError = new Error('Validation service failed');
      mockRepositoryValidationService.validateRepository.mockRejectedValue(serviceError);
      mockRequest.validatedBody = validationRequest;

      await controller.validateRepository(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: expect.any(String),
          message: expect.any(String),
          correlationId: 'test-req-123'
        }),
        metadata: expect.objectContaining({
          requestId: 'test-req-123'
        })
      });
    });

    it('should use default validation options when not provided', async () => {
      const mockValidationResult: RepositoryValidationResult = {
        isValid: true,
        validations: [],
        repositoryInfo: {
          path: '/Users/test/repo',
          name: 'repo',
          isGitRepository: true,
          isTaskMasterProject: true
        }
      };

      mockRepositoryValidationService.validateRepository.mockResolvedValue(mockValidationResult);
      mockRequest.validatedBody = {
        repositoryPath: '/Users/test/repo'
        // validateGit and validateTaskMaster not provided
      };

      await controller.validateRepository(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      expect(mockRepositoryValidationService.validateRepository).toHaveBeenCalledWith(
        '/Users/test/repo',
        {
          validateGit: true, // default
          validateTaskMaster: true, // default
          checkPermissions: true
        }
      );
    });

    it('should respect explicit validation options', async () => {
      const mockValidationResult: RepositoryValidationResult = {
        isValid: true,
        validations: [],
        repositoryInfo: {
          path: '/Users/test/repo',
          name: 'repo',
          isGitRepository: false,
          isTaskMasterProject: false
        }
      };

      mockRepositoryValidationService.validateRepository.mockResolvedValue(mockValidationResult);
      mockRequest.validatedBody = {
        repositoryPath: '/Users/test/repo',
        validateGit: false,
        validateTaskMaster: false
      };

      await controller.validateRepository(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      expect(mockRepositoryValidationService.validateRepository).toHaveBeenCalledWith(
        '/Users/test/repo',
        {
          validateGit: false,
          validateTaskMaster: false,
          checkPermissions: true
        }
      );
    });
  });

  describe('getRepositoryInfo', () => {
    it('should get repository information successfully', async () => {
      const mockRepositoryInfo = {
        path: '/Users/test/repo',
        name: 'repo',
        isGitRepository: true,
        isTaskMasterProject: true,
        gitBranch: 'main',
        gitRemoteUrl: 'https://github.com/user/repo.git'
      };

      const mockValidationResult: RepositoryValidationResult = {
        isValid: true,
        validations: [],
        repositoryInfo: mockRepositoryInfo
      };

      mockRepositoryValidationService.validateRepository.mockResolvedValue(mockValidationResult);
      mockRequest.query = { repositoryPath: '/Users/test/repo' };

      await controller.getRepositoryInfo(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      expect(mockRepositoryValidationService.validateRepository).toHaveBeenCalledWith(
        '/Users/test/repo',
        {
          validateGit: true,
          validateTaskMaster: true,
          checkPermissions: false // Info request doesn't check permissions
        }
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockRepositoryInfo,
        metadata: expect.objectContaining({
          requestId: 'test-req-123'
        })
      });
    });

    it('should handle missing repositoryPath parameter', async () => {
      mockRequest.query = {}; // No repositoryPath

      await controller.getRepositoryInfo(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'MISSING_PARAMETER',
          message: 'repositoryPath query parameter is required'
        },
        metadata: expect.objectContaining({
          requestId: 'test-req-123'
        })
      });

      expect(mockRepositoryValidationService.validateRepository).not.toHaveBeenCalled();
    });

    it('should handle validation service errors', async () => {
      const serviceError = new Error('Service error');
      mockRepositoryValidationService.validateRepository.mockRejectedValue(serviceError);
      mockRequest.query = { repositoryPath: '/Users/test/repo' };

      await controller.getRepositoryInfo(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: expect.any(String),
          message: expect.any(String),
          correlationId: 'test-req-123'
        }),
        metadata: expect.objectContaining({
          requestId: 'test-req-123'
        })
      });
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      await controller.healthCheck(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          service: 'repository-management',
          status: 'healthy',
          timestamp: expect.any(String),
          checks: {
            service: 'ok',
            dependencies: {
              filesystem: 'ok',
              git: 'ok'
            }
          }
        },
        metadata: expect.objectContaining({
          requestId: 'test-req-123',
          duration: expect.any(Number)
        })
      });
    });

    it('should handle health check errors', async () => {
      // Simulate an error during health check by making status throw
      const originalStatus = mockResponse.status;
      mockResponse.status = jest.fn().mockImplementation(() => {
        throw new Error('Health check failed');
      });

      await controller.healthCheck(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      // Restore original mock
      mockResponse.status = originalStatus;

      // The error is caught and handled, so status should be called with 500
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('request logging and metadata', () => {
    it('should include proper metadata in all responses', async () => {
      const mockValidationResult: RepositoryValidationResult = {
        isValid: true,
        validations: [],
        repositoryInfo: {
          path: '/test',
          name: 'test',
          isGitRepository: true,
          isTaskMasterProject: false
        }
      };

      mockRepositoryValidationService.validateRepository.mockResolvedValue(mockValidationResult);
      mockRequest.validatedBody = { repositoryPath: '/test' };

      const startTime = Date.now();
      await controller.validateRepository(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );
      const endTime = Date.now();

      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      
      expect(responseCall.metadata).toEqual({
        timestamp: expect.any(String),
        requestId: 'test-req-123',
        duration: expect.any(Number),
        version: '1.0.0'
      });

      // Verify duration is reasonable
      expect(responseCall.metadata.duration).toBeGreaterThanOrEqual(0);
      expect(responseCall.metadata.duration).toBeLessThan(endTime - startTime + 100);

      // Verify timestamp is valid ISO string
      expect(new Date(responseCall.metadata.timestamp).toISOString()).toBe(responseCall.metadata.timestamp);
    });

    it('should handle missing requestId gracefully', async () => {
      const mockValidationResult: RepositoryValidationResult = {
        isValid: true,
        validations: [],
        repositoryInfo: {
          path: '/test',
          name: 'test',
          isGitRepository: true,
          isTaskMasterProject: false
        }
      };

      mockRepositoryValidationService.validateRepository.mockResolvedValue(mockValidationResult);
      mockRequest.requestId = undefined; // No request ID
      mockRequest.validatedBody = { repositoryPath: '/test' };

      await controller.validateRepository(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.metadata.requestId).toBe('unknown');
    });
  });

  describe('getRepositoryDetails', () => {
    const mockRepositoryMetadata = {
      name: 'test-repo',
      path: '/Users/test/test-repo',
      currentBranch: 'main',
      lastCommit: {
        hash: 'abc123def456',
        date: '2023-01-15T10:30:00.000Z',
        message: 'Add new feature',
        author: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      },
      status: {
        isClean: true,
        staged: 0,
        unstaged: 0,
        untracked: 0,
        conflicted: 0,
        ahead: 0,
        behind: 0
      },
      branches: [
        {
          name: 'main',
          type: 'local' as const,
          current: true,
          tracking: 'origin/main',
          ahead: 0,
          behind: 0
        },
        {
          name: 'origin/main',
          type: 'remote' as const,
          current: false
        }
      ]
    };

    const mockRemotes = ['origin: https://github.com/user/test-repo.git'];

    it('should get repository details successfully', async () => {
      mockGitDataService.getRepositoryMetadata.mockResolvedValue(mockRepositoryMetadata);
      mockGitDataService.getRemotes.mockResolvedValue(mockRemotes);
      mockRequest.query = { repositoryPath: '/Users/test/test-repo' };

      await controller.getRepositoryDetails(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      expect(mockGitDataService.getRepositoryMetadata).toHaveBeenCalledWith('/Users/test/test-repo');
      expect(mockGitDataService.getRemotes).toHaveBeenCalledWith('/Users/test/test-repo');

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          ...mockRepositoryMetadata,
          remotes: mockRemotes
        },
        metadata: expect.objectContaining({
          timestamp: expect.any(String),
          requestId: 'test-req-123',
          duration: expect.any(Number),
          version: '1.0.0'
        })
      });
    });

    it('should handle missing repositoryPath parameter', async () => {
      mockRequest.query = {}; // No repositoryPath

      await controller.getRepositoryDetails(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'MISSING_PARAMETER',
          message: 'repositoryPath query parameter is required',
          correlationId: 'test-req-123'
        },
        metadata: expect.objectContaining({
          requestId: 'test-req-123'
        })
      });

      expect(mockGitDataService.getRepositoryMetadata).not.toHaveBeenCalled();
      expect(mockGitDataService.getRemotes).not.toHaveBeenCalled();
    });

    it('should handle git data service errors', async () => {
      const serviceError = new Error('Git data service failed');
      mockGitDataService.getRepositoryMetadata.mockRejectedValue(serviceError);
      mockRequest.query = { repositoryPath: '/Users/test/test-repo' };

      await controller.getRepositoryDetails(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: expect.any(String),
          message: expect.any(String),
          details: expect.objectContaining({
            type: expect.any(String),
            severity: expect.any(String),
            suggestions: expect.any(Array)
          }),
          correlationId: 'test-req-123'
        }),
        metadata: expect.objectContaining({
          requestId: 'test-req-123'
        })
      });
    });

    it('should handle remotes service errors gracefully', async () => {
      const remotesError = new Error('Failed to get remotes');
      mockGitDataService.getRepositoryMetadata.mockResolvedValue(mockRepositoryMetadata);
      mockGitDataService.getRemotes.mockRejectedValue(remotesError);
      mockRequest.query = { repositoryPath: '/Users/test/test-repo' };

      await controller.getRepositoryDetails(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: expect.any(String),
          message: expect.any(String),
          correlationId: 'test-req-123'
        }),
        metadata: expect.objectContaining({
          requestId: 'test-req-123'
        })
      });
    });

    it('should handle repository with dirty status', async () => {
      const dirtyRepositoryMetadata = {
        ...mockRepositoryMetadata,
        status: {
          isClean: false,
          staged: 2,
          unstaged: 1,
          untracked: 3,
          conflicted: 0,
          ahead: 1,
          behind: 0
        }
      };

      mockGitDataService.getRepositoryMetadata.mockResolvedValue(dirtyRepositoryMetadata);
      mockGitDataService.getRemotes.mockResolvedValue(mockRemotes);
      mockRequest.query = { repositoryPath: '/Users/test/test-repo' };

      await controller.getRepositoryDetails(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          ...dirtyRepositoryMetadata,
          remotes: mockRemotes
        },
        metadata: expect.objectContaining({
          requestId: 'test-req-123'
        })
      });
    });

    it('should handle repository with multiple branches', async () => {
      const multiBranchMetadata = {
        ...mockRepositoryMetadata,
        branches: [
          {
            name: 'main',
            type: 'local' as const,
            current: true,
            tracking: 'origin/main',
            ahead: 0,
            behind: 0
          },
          {
            name: 'feature/new-ui',
            type: 'local' as const,
            current: false,
            tracking: 'origin/feature/new-ui',
            ahead: 2,
            behind: 1
          },
          {
            name: 'origin/main',
            type: 'remote' as const,
            current: false
          },
          {
            name: 'origin/feature/new-ui',
            type: 'remote' as const,
            current: false
          }
        ]
      };

      mockGitDataService.getRepositoryMetadata.mockResolvedValue(multiBranchMetadata);
      mockGitDataService.getRemotes.mockResolvedValue(mockRemotes);
      mockRequest.query = { repositoryPath: '/Users/test/test-repo' };

      await controller.getRepositoryDetails(
        mockRequest as EnhancedRequest,
        mockResponse as EnhancedResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.data.branches).toHaveLength(4);
      expect(responseCall.data.branches[0].current).toBe(true);
      expect(responseCall.data.branches[1].ahead).toBe(2);
      expect(responseCall.data.branches[1].behind).toBe(1);
    });
  });
});