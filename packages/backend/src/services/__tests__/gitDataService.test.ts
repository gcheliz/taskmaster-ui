import { GitDataService } from '../gitDataService';
import { promises as fs } from 'fs';
import path from 'path';
import { simpleGit } from 'simple-git';

// Mock simple-git
jest.mock('simple-git');
const mockSimpleGit = simpleGit as jest.MockedFunction<typeof simpleGit>;

// Mock fs
jest.mock('fs', () => ({
  promises: {
    stat: jest.fn(),
    access: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('GitDataService', () => {
  let gitService: GitDataService;
  let mockGit: any;

  beforeEach(() => {
    gitService = new GitDataService();
    
    // Setup mock Git instance
    mockGit = {
      revparse: jest.fn(),
      log: jest.fn(),
      status: jest.fn(),
      branch: jest.fn(),
      getRemotes: jest.fn(),
    };
    
    mockSimpleGit.mockReturnValue(mockGit);
    
    // Setup default fs mocks
    mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any);
    mockFs.access.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRepositoryMetadata', () => {
    it('should return complete repository metadata', async () => {
      const testPath = '/test/repo';
      
      // Mock all Git operations
      mockGit.revparse.mockResolvedValue('main');
      mockGit.log.mockResolvedValue({
        latest: {
          hash: 'abc123',
          date: '2023-01-01',
          message: 'Initial commit',
          author_name: 'John Doe',
          author_email: 'john@example.com'
        }
      });
      mockGit.status.mockResolvedValue({
        isClean: () => true,
        staged: [],
        modified: [],
        deleted: [],
        not_added: [],
        conflicted: [],
        ahead: 0,
        behind: 0
      });
      mockGit.branch
        .mockResolvedValueOnce({
          branches: {
            main: { current: true, tracking: 'origin/main', ahead: 0, behind: 0 }
          }
        })
        .mockResolvedValueOnce({
          branches: {
            'remotes/origin/main': { current: false }
          }
        });

      const result = await gitService.getRepositoryMetadata(testPath);

      expect(result).toEqual({
        name: 'repo',
        path: testPath,
        currentBranch: 'main',
        lastCommit: {
          hash: 'abc123',
          date: '2023-01-01',
          message: 'Initial commit',
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
            type: 'local',
            current: true,
            tracking: 'origin/main',
            ahead: undefined,
            behind: undefined
          },
          {
            name: 'origin/main',
            type: 'remote',
            current: false
          }
        ]
      });
    });

    it('should throw error for invalid repository path', async () => {
      mockFs.stat.mockRejectedValue(new Error('ENOENT'));

      await expect(gitService.getRepositoryMetadata('/invalid/path'))
        .rejects.toThrow('Invalid repository path');
    });

    it('should throw error for non-directory path', async () => {
      mockFs.stat.mockResolvedValue({ isDirectory: () => false } as any);

      await expect(gitService.getRepositoryMetadata('/file/path'))
        .rejects.toThrow('Path is not a directory');
    });

    it('should throw error for non-git directory', async () => {
      mockFs.access.mockRejectedValue(new Error('ENOENT'));

      await expect(gitService.getRepositoryMetadata('/not/git'))
        .rejects.toThrow('Directory is not a Git repository');
    });
  });

  describe('getCurrentBranch', () => {
    it('should return current branch name', async () => {
      mockGit.revparse.mockResolvedValue('feature-branch\n');

      const result = await gitService.getCurrentBranch(mockGit);

      expect(result).toBe('feature-branch');
      expect(mockGit.revparse).toHaveBeenCalledWith(['--abbrev-ref', 'HEAD']);
    });

    it('should fallback to status when revparse fails', async () => {
      mockGit.revparse.mockRejectedValue(new Error('No commits'));
      mockGit.status.mockResolvedValue({ current: 'develop' });

      const result = await gitService.getCurrentBranch(mockGit);

      expect(result).toBe('develop');
    });

    it('should fallback to main when both revparse and status fail', async () => {
      mockGit.revparse.mockRejectedValue(new Error('No commits'));
      mockGit.status.mockRejectedValue(new Error('No status'));

      const result = await gitService.getCurrentBranch(mockGit);

      expect(result).toBe('main');
    });
  });

  describe('getLastCommit', () => {
    it('should return formatted commit information', async () => {
      const mockCommit = {
        hash: 'abc123def456',
        date: '2023-01-15T10:30:00.000Z',
        message: 'Add new feature',
        author_name: 'Jane Smith',
        author_email: 'jane@example.com'
      };

      mockGit.log.mockResolvedValue({
        latest: mockCommit
      });

      const result = await gitService.getLastCommit(mockGit);

      expect(result).toEqual({
        hash: 'abc123def456',
        date: '2023-01-15T10:30:00.000Z',
        message: 'Add new feature',
        author: {
          name: 'Jane Smith',
          email: 'jane@example.com'
        }
      });
    });

    it('should throw error when no commits exist', async () => {
      mockGit.log.mockResolvedValue({ latest: null });

      await expect(gitService.getLastCommit(mockGit))
        .rejects.toThrow('No commits found in repository');
    });

    it('should handle git log errors', async () => {
      mockGit.log.mockRejectedValue(new Error('Git error'));

      await expect(gitService.getLastCommit(mockGit))
        .rejects.toThrow('Failed to get last commit: Git error');
    });
  });

  describe('getRepositoryStatus', () => {
    it('should return clean repository status', async () => {
      mockGit.status.mockResolvedValue({
        isClean: () => true,
        staged: [],
        modified: [],
        deleted: [],
        not_added: [],
        conflicted: [],
        ahead: 0,
        behind: 0
      });

      const result = await gitService.getRepositoryStatus(mockGit);

      expect(result).toEqual({
        isClean: true,
        staged: 0,
        unstaged: 0,
        untracked: 0,
        conflicted: 0,
        ahead: 0,
        behind: 0
      });
    });

    it('should return dirty repository status', async () => {
      mockGit.status.mockResolvedValue({
        isClean: () => false,
        staged: ['file1.txt'],
        modified: ['file2.txt', 'file3.txt'],
        deleted: ['file4.txt'],
        not_added: ['file5.txt'],
        conflicted: ['file6.txt'],
        ahead: 2,
        behind: 1
      });

      const result = await gitService.getRepositoryStatus(mockGit);

      expect(result).toEqual({
        isClean: false,
        staged: 1,
        unstaged: 3, // modified + deleted
        untracked: 1,
        conflicted: 1,
        ahead: 2,
        behind: 1
      });
    });

    it('should handle git status errors', async () => {
      mockGit.status.mockRejectedValue(new Error('Status error'));

      await expect(gitService.getRepositoryStatus(mockGit))
        .rejects.toThrow('Failed to get repository status: Status error');
    });
  });

  describe('getAllBranches', () => {
    it('should return local and remote branches', async () => {
      mockGit.branch
        .mockResolvedValueOnce({
          branches: {
            main: { current: true, tracking: 'origin/main', ahead: 0, behind: 0 },
            feature: { current: false, tracking: null, ahead: 1, behind: 0 }
          }
        })
        .mockResolvedValueOnce({
          branches: {
            'remotes/origin/main': { current: false },
            'remotes/origin/develop': { current: false },
            'remotes/origin/HEAD': { current: false } // Should be filtered out
          }
        });

      const result = await gitService.getAllBranches(mockGit);

      expect(result).toEqual([
        {
          name: 'main',
          type: 'local',
          current: true,
          tracking: 'origin/main',
          ahead: undefined,
          behind: undefined
        },
        {
          name: 'feature',
          type: 'local',
          current: false,
          tracking: undefined,
          ahead: 1,
          behind: undefined
        },
        {
          name: 'origin/main',
          type: 'remote',
          current: false
        },
        {
          name: 'origin/develop',
          type: 'remote',
          current: false
        }
      ]);
    });

    it('should handle git branch errors', async () => {
      mockGit.branch.mockRejectedValue(new Error('Branch error'));

      await expect(gitService.getAllBranches(mockGit))
        .rejects.toThrow('Failed to get branches: Branch error');
    });
  });

  describe('hasUncommittedChanges', () => {
    it('should return true for dirty repository', async () => {
      mockGit.status.mockResolvedValue({
        isClean: () => false,
        staged: [],
        modified: ['file.txt'],
        deleted: [],
        not_added: [],
        conflicted: [],
        ahead: 0,
        behind: 0
      });

      const result = await gitService.hasUncommittedChanges('/test/repo');

      expect(result).toBe(true);
    });

    it('should return false for clean repository', async () => {
      mockGit.status.mockResolvedValue({
        isClean: () => true,
        staged: [],
        modified: [],
        deleted: [],
        not_added: [],
        conflicted: [],
        ahead: 0,
        behind: 0
      });

      const result = await gitService.hasUncommittedChanges('/test/repo');

      expect(result).toBe(false);
    });
  });

  describe('getRemotes', () => {
    it('should return formatted remote information', async () => {
      mockGit.getRemotes.mockResolvedValue([
        {
          name: 'origin',
          refs: {
            fetch: 'https://github.com/user/repo.git',
            push: 'https://github.com/user/repo.git'
          }
        },
        {
          name: 'upstream',
          refs: {
            fetch: 'https://github.com/upstream/repo.git',
            push: 'https://github.com/upstream/repo.git'
          }
        }
      ]);

      const result = await gitService.getRemotes('/test/repo');

      expect(result).toEqual([
        'origin: https://github.com/user/repo.git',
        'upstream: https://github.com/upstream/repo.git'
      ]);
    });

    it('should handle git remotes errors', async () => {
      mockGit.getRemotes.mockRejectedValue(new Error('Remotes error'));

      await expect(gitService.getRemotes('/test/repo'))
        .rejects.toThrow('Failed to get remotes: Remotes error');
    });
  });

  describe('configuration', () => {
    it('should create service with custom timeout', () => {
      const customService = new GitDataService({ timeout: 60000 });
      expect(customService).toBeInstanceOf(GitDataService);
    });

    it('should use default timeout when none provided', () => {
      const defaultService = new GitDataService();
      expect(defaultService).toBeInstanceOf(GitDataService);
    });
  });
});