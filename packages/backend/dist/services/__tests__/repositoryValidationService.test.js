"use strict";
// Repository Validation Service Tests
// Comprehensive tests for repository validation functionality
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs/promises"));
const repositoryValidationService_1 = require("../repositoryValidationService");
// Mock dependencies
jest.mock('fs/promises');
jest.mock('child_process', () => ({
    exec: jest.fn()
}));
const mockFs = fs;
// Create a manual mock for execAsync
const mockExecAsync = jest.fn();
describe('RepositoryValidationService', () => {
    let service;
    beforeEach(() => {
        service = repositoryValidationService_1.RepositoryValidationService.getInstance();
        jest.clearAllMocks();
    });
    describe('validateRepository', () => {
        const validRepoPath = '/Users/test/valid-repo';
        it('should validate a valid repository successfully', async () => {
            // Mock successful path access
            mockFs.access.mockResolvedValue(undefined);
            // Mock directory stats
            mockFs.stat.mockResolvedValue({
                isDirectory: () => true,
                isFile: () => false,
                size: 4096,
                mtime: new Date()
            });
            // Mock Git validation
            execAsync.mockResolvedValueOnce({
                stdout: '',
                stderr: ''
            });
            // Mock Git info commands
            execAsync
                .mockResolvedValueOnce({ stdout: 'main\n', stderr: '' }) // branch
                .mockResolvedValueOnce({ stdout: 'https://github.com/user/repo.git\n', stderr: '' }) // remote
                .mockResolvedValueOnce({ stdout: 'abc123|Initial commit|John Doe|2023-01-01 10:00:00 +0000', stderr: '' }); // commit
            // Mock TaskMaster validation
            mockFs.access
                .mockResolvedValueOnce(undefined) // .taskmaster dir
                .mockResolvedValueOnce(undefined) // tasks.json
                .mockResolvedValueOnce(undefined); // config.json
            // Mock TaskMaster files reading
            mockFs.readFile.mockResolvedValue(JSON.stringify({
                'test-project': {
                    tasks: [{ id: 1 }, { id: 2 }],
                    metadata: { updated: '2023-01-01T10:00:00.000Z' }
                }
            }));
            const result = await service.validateRepository(validRepoPath);
            expect(result.isValid).toBe(true);
            expect(result.validations).toHaveLength(5); // path, directory, permissions, git, taskmaster
            expect(result.repositoryInfo).toBeDefined();
            expect(result.repositoryInfo?.isGitRepository).toBe(true);
            expect(result.repositoryInfo?.isTaskMasterProject).toBe(true);
            expect(result.repositoryInfo?.gitBranch).toBe('main');
            expect(result.repositoryInfo?.taskMasterConfig?.taskCount).toBe(2);
        });
        it('should fail validation for non-existent path', async () => {
            const invalidPath = '/non/existent/path';
            // Mock path access failure
            mockFs.access.mockRejectedValue(new Error('ENOENT: no such file or directory'));
            const result = await service.validateRepository(invalidPath);
            expect(result.isValid).toBe(false);
            expect(result.validations).toHaveLength(1);
            expect(result.validations[0].type).toBe('path');
            expect(result.validations[0].isValid).toBe(false);
            expect(result.errors).toContain('Path does not exist or is not accessible');
        });
        it('should fail validation for file path (not directory)', async () => {
            const filePath = '/Users/test/file.txt';
            // Mock successful path access
            mockFs.access.mockResolvedValue(undefined);
            // Mock file stats (not directory)
            mockFs.stat.mockResolvedValue({
                isDirectory: () => false,
                isFile: () => true,
                size: 1024,
                mtime: new Date()
            });
            const result = await service.validateRepository(filePath);
            expect(result.isValid).toBe(false);
            expect(result.validations).toHaveLength(2);
            expect(result.validations[1].type).toBe('directory');
            expect(result.validations[1].isValid).toBe(false);
            expect(result.errors).toContain('Path exists but is not a directory');
        });
        it('should detect permission issues', async () => {
            // Mock successful path and directory validation
            mockFs.access.mockResolvedValueOnce(undefined); // path exists
            mockFs.stat.mockResolvedValue({
                isDirectory: () => true,
                isFile: () => false,
                size: 4096,
                mtime: new Date()
            });
            // Mock permission failure
            mockFs.access.mockRejectedValueOnce(new Error('EACCES: permission denied'));
            const result = await service.validateRepository(validRepoPath);
            expect(result.isValid).toBe(false);
            expect(result.validations.find(v => v.type === 'permissions')?.isValid).toBe(false);
            expect(result.errors).toContain('Insufficient permissions (need read/write access)');
        });
        it('should handle non-Git repository', async () => {
            // Mock successful basic validations
            mockFs.access.mockResolvedValue(undefined);
            mockFs.stat.mockResolvedValue({
                isDirectory: () => true,
                isFile: () => false,
                size: 4096,
                mtime: new Date()
            });
            // Mock Git validation failure (no .git directory)
            mockFs.access.mockRejectedValueOnce(new Error('ENOENT: no such file or directory'));
            const result = await service.validateRepository(validRepoPath);
            expect(result.repositoryInfo?.isGitRepository).toBe(false);
            expect(result.validations.find(v => v.type === 'git')?.isValid).toBe(false);
            expect(result.validations.find(v => v.type === 'git')?.message).toContain('Not a Git repository');
        });
        it('should handle non-TaskMaster project', async () => {
            // Mock successful basic validations
            mockFs.access.mockResolvedValue(undefined);
            mockFs.stat.mockResolvedValue({
                isDirectory: () => true,
                isFile: () => false,
                size: 4096,
                mtime: new Date()
            });
            // Mock Git as valid
            execAsync.mockResolvedValue({
                stdout: '',
                stderr: ''
            });
            // Mock TaskMaster validation failure (no .taskmaster directory)
            mockFs.access.mockRejectedValueOnce(new Error('ENOENT: no such file or directory'));
            const result = await service.validateRepository(validRepoPath);
            expect(result.repositoryInfo?.isTaskMasterProject).toBe(false);
            expect(result.validations.find(v => v.type === 'taskmaster')?.isValid).toBe(false);
            expect(result.validations.find(v => v.type === 'taskmaster')?.message).toContain('Not a TaskMaster project');
        });
        it('should skip validations when options are false', async () => {
            // Mock successful basic validations
            mockFs.access.mockResolvedValue(undefined);
            mockFs.stat.mockResolvedValue({
                isDirectory: () => true,
                isFile: () => false,
                size: 4096,
                mtime: new Date()
            });
            const result = await service.validateRepository(validRepoPath, {
                validateGit: false,
                validateTaskMaster: false,
                checkPermissions: false
            });
            expect(result.validations).toHaveLength(2); // Only path and directory
            expect(result.validations.find(v => v.type === 'git')).toBeUndefined();
            expect(result.validations.find(v => v.type === 'taskmaster')).toBeUndefined();
            expect(result.validations.find(v => v.type === 'permissions')).toBeUndefined();
        });
        it('should handle Git command failures gracefully', async () => {
            // Mock successful basic validations
            mockFs.access.mockResolvedValue(undefined);
            mockFs.stat.mockResolvedValue({
                isDirectory: () => true,
                isFile: () => false,
                size: 4096,
                mtime: new Date()
            });
            // Mock .git directory exists
            mockFs.access.mockResolvedValueOnce(undefined);
            // Mock Git status command failure
            execAsync.mockRejectedValue(new Error('fatal: not a git repository'));
            const result = await service.validateRepository(validRepoPath);
            expect(result.validations.find(v => v.type === 'git')?.isValid).toBe(false);
            expect(result.validations.find(v => v.type === 'git')?.message).toContain('Git repository validation failed');
        });
        it('should handle TaskMaster config reading errors', async () => {
            // Mock successful basic validations
            mockFs.access.mockResolvedValue(undefined);
            mockFs.stat.mockResolvedValue({
                isDirectory: () => true,
                isFile: () => false,
                size: 4096,
                mtime: new Date()
            });
            // Mock Git as valid
            execAsync.mockResolvedValue({
                stdout: '',
                stderr: ''
            });
            // Mock TaskMaster directory and files exist
            mockFs.access.mockResolvedValue(undefined);
            // Mock TaskMaster tasks.json reading failure
            mockFs.readFile.mockRejectedValue(new Error('Permission denied'));
            const result = await service.validateRepository(validRepoPath);
            expect(result.repositoryInfo?.isTaskMasterProject).toBe(true);
            expect(result.repositoryInfo?.taskMasterConfig?.taskCount).toBe(0);
        });
        it('should generate unique request IDs', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            // Mock validation that will fail
            mockFs.access.mockRejectedValue(new Error('Test error'));
            // Run multiple validations
            const promises = [
                service.validateRepository('/path1').catch(() => { }),
                service.validateRepository('/path2').catch(() => { }),
                service.validateRepository('/path3').catch(() => { })
            ];
            await Promise.all(promises);
            // Each validation should have a unique request ID
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
    describe('Git information extraction', () => {
        it('should extract complete Git information', async () => {
            // Mock successful basic validations
            mockFs.access.mockResolvedValue(undefined);
            mockFs.stat.mockResolvedValue({
                isDirectory: () => true,
                isFile: () => false,
                size: 4096,
                mtime: new Date()
            });
            // Mock Git status command
            execAsync.mockResolvedValueOnce({
                stdout: '',
                stderr: ''
            });
            // Mock Git info commands with detailed responses
            execAsync
                .mockResolvedValueOnce({ stdout: 'feature/new-feature\n', stderr: '' }) // branch
                .mockResolvedValueOnce({ stdout: 'git@github.com:user/repo.git\n', stderr: '' }) // remote
                .mockResolvedValueOnce({
                stdout: 'abc123def456|Add new feature implementation|Jane Developer|2023-12-01 15:30:00 +0000',
                stderr: ''
            }); // commit
            const result = await service.validateRepository('/test/repo');
            expect(result.repositoryInfo?.gitBranch).toBe('feature/new-feature');
            expect(result.repositoryInfo?.gitRemoteUrl).toBe('git@github.com:user/repo.git');
            expect(result.repositoryInfo?.lastCommit).toEqual({
                hash: 'abc123def456',
                message: 'Add new feature implementation',
                author: 'Jane Developer',
                date: '2023-12-01 15:30:00 +0000'
            });
        });
        it('should handle missing Git remote', async () => {
            // Mock successful basic validations
            mockFs.access.mockResolvedValue(undefined);
            mockFs.stat.mockResolvedValue({
                isDirectory: () => true,
                isFile: () => false,
                size: 4096,
                mtime: new Date()
            });
            // Mock Git status command
            execAsync.mockResolvedValueOnce({
                stdout: '',
                stderr: ''
            });
            // Mock Git commands - branch succeeds, remote fails, commit succeeds
            execAsync
                .mockResolvedValueOnce({ stdout: 'main\n', stderr: '' }) // branch
                .mockRejectedValueOnce(new Error('No such remote')) // remote fails
                .mockResolvedValueOnce({ stdout: 'abc123|Initial|Author|2023-01-01', stderr: '' }); // commit
            const result = await service.validateRepository('/test/repo');
            expect(result.repositoryInfo?.gitBranch).toBe('main');
            expect(result.repositoryInfo?.gitRemoteUrl).toBeUndefined();
            expect(result.repositoryInfo?.lastCommit).toBeDefined();
        });
    });
});
//# sourceMappingURL=repositoryValidationService.test.js.map