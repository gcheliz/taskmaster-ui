"use strict";
// Basic Repository Validation Service Tests
// Simple tests for core functionality without complex mocking
Object.defineProperty(exports, "__esModule", { value: true });
const repositoryValidationService_1 = require("../repositoryValidationService");
describe('RepositoryValidationService - Basic Tests', () => {
    let service;
    beforeEach(() => {
        service = repositoryValidationService_1.RepositoryValidationService.getInstance();
    });
    describe('getInstance', () => {
        it('should return a singleton instance', () => {
            const instance1 = repositoryValidationService_1.RepositoryValidationService.getInstance();
            const instance2 = repositoryValidationService_1.RepositoryValidationService.getInstance();
            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(repositoryValidationService_1.RepositoryValidationService);
        });
    });
    describe('validation options handling', () => {
        it('should handle invalid paths gracefully', async () => {
            const result = await service.validateRepository('/definitely/does/not/exist');
            expect(result.isValid).toBe(false);
            expect(result.validations.length).toBeGreaterThan(0);
            expect(result.validations[0].type).toBe('path');
            expect(result.validations[0].isValid).toBe(false);
            expect(result.errors).toBeDefined();
            expect(result.errors?.length).toBeGreaterThan(0);
        });
        it('should create proper result structure', async () => {
            const result = await service.validateRepository('/invalid/path');
            expect(result).toHaveProperty('isValid');
            expect(result).toHaveProperty('validations');
            expect(result.validations).toBeInstanceOf(Array);
            if (result.errors) {
                expect(result.errors).toBeInstanceOf(Array);
            }
            if (result.repositoryInfo) {
                expect(result.repositoryInfo).toHaveProperty('path');
                expect(result.repositoryInfo).toHaveProperty('name');
                expect(result.repositoryInfo).toHaveProperty('isGitRepository');
                expect(result.repositoryInfo).toHaveProperty('isTaskMasterProject');
            }
        });
        it('should handle empty path', async () => {
            const result = await service.validateRepository('');
            expect(result.isValid).toBe(false);
            expect(result.validations[0].type).toBe('path');
            expect(result.validations[0].isValid).toBe(false);
        });
        it('should handle relative paths', async () => {
            const result = await service.validateRepository('./relative/path');
            expect(result.isValid).toBe(false);
            expect(result.validations[0].type).toBe('path');
            expect(result.validations[0].isValid).toBe(false);
        });
        it('should skip validations when options are false', async () => {
            const result = await service.validateRepository('/invalid/path', {
                validateGit: false,
                validateTaskMaster: false,
                checkPermissions: false
            });
            // Should still have path and directory validations
            expect(result.validations.length).toBeGreaterThanOrEqual(1);
            // Should not have git, taskmaster, or permissions validations
            const gitValidation = result.validations.find(v => v.type === 'git');
            const taskMasterValidation = result.validations.find(v => v.type === 'taskmaster');
            const permissionsValidation = result.validations.find(v => v.type === 'permissions');
            expect(gitValidation).toBeUndefined();
            expect(taskMasterValidation).toBeUndefined();
            expect(permissionsValidation).toBeUndefined();
        });
    });
    describe('validation types', () => {
        it('should include all expected validation types for full validation', async () => {
            const result = await service.validateRepository('/invalid/path', {
                validateGit: true,
                validateTaskMaster: true,
                checkPermissions: true
            });
            // Since the path is invalid, we might not get all validations,
            // but we should at least get the path validation
            expect(result.validations.length).toBeGreaterThanOrEqual(1);
            expect(result.validations[0].type).toBe('path');
        });
        it('should have proper validation structure', async () => {
            const result = await service.validateRepository('/invalid/path');
            result.validations.forEach(validation => {
                expect(validation).toHaveProperty('type');
                expect(validation).toHaveProperty('isValid');
                expect(validation).toHaveProperty('message');
                expect(validation.type).toMatch(/^(path|directory|git|taskmaster|permissions)$/);
                expect(typeof validation.isValid).toBe('boolean');
                expect(typeof validation.message).toBe('string');
            });
        });
    });
    describe('error handling', () => {
        it('should handle exceptions gracefully', async () => {
            // Test with various invalid inputs
            const testCases = [
                '',
                null,
                undefined,
                '/\\invalid\\path',
                '/../../../etc/passwd',
                '/proc/self/environ',
            ];
            for (const testPath of testCases) {
                const result = await service.validateRepository(testPath);
                expect(result).toHaveProperty('isValid');
                expect(result.isValid).toBe(false);
                expect(result.validations.length).toBeGreaterThan(0);
            }
        });
        it('should have meaningful error messages', async () => {
            const result = await service.validateRepository('/definitely/does/not/exist');
            expect(result.errors).toBeDefined();
            expect(result.errors.length).toBeGreaterThan(0);
            result.validations.forEach(validation => {
                expect(validation.message).toBeTruthy();
                expect(validation.message.length).toBeGreaterThan(10);
            });
        });
    });
    describe('result metadata', () => {
        it('should generate unique request IDs on multiple calls', () => {
            const service1 = repositoryValidationService_1.RepositoryValidationService.getInstance();
            const service2 = repositoryValidationService_1.RepositoryValidationService.getInstance();
            // Services should be the same instance
            expect(service1).toBe(service2);
            // Test private method access through type assertion
            const requestId1 = service1.generateRequestId();
            const requestId2 = service1.generateRequestId();
            expect(requestId1).not.toBe(requestId2);
            expect(requestId1).toMatch(/^repo_val_\d+_[a-z0-9]+$/);
            expect(requestId2).toMatch(/^repo_val_\d+_[a-z0-9]+$/);
        });
    });
});
//# sourceMappingURL=repositoryValidationService.basic.test.js.map