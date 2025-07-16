"use strict";
// Comprehensive Error Handler Tests
// Tests all error types and handling scenarios
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("../errorHandler");
describe('ErrorHandler', () => {
    const mockContext = {
        requestId: 'test-req-123',
        repositoryPath: '/test/repo',
        operation: 'test-operation'
    };
    describe('CLI Error Handling', () => {
        it('should handle CLI not found errors', () => {
            const error = new Error('command not found: task-master');
            const result = errorHandler_1.errorHandler.handleCliError(error, mockContext);
            expect(result).toBeInstanceOf(errorHandler_1.TaskMasterError);
            expect(result.type).toBe(errorHandler_1.ErrorType.CLI_NOT_FOUND);
            expect(result.severity).toBe(errorHandler_1.ErrorSeverity.HIGH);
            expect(result.code).toBe('CLI_001');
            expect(result.isRetryable).toBe(false);
            expect(result.suggestions).toContain('Install TaskMaster CLI using npm: npm install -g task-master-ai');
        });
        it('should handle CLI timeout errors', () => {
            const error = new Error('Command timed out after 30000ms');
            const result = errorHandler_1.errorHandler.handleCliError(error, mockContext);
            expect(result.type).toBe(errorHandler_1.ErrorType.CLI_TIMEOUT);
            expect(result.severity).toBe(errorHandler_1.ErrorSeverity.MEDIUM);
            expect(result.code).toBe('CLI_002');
            expect(result.isRetryable).toBe(true);
            expect(result.retryAfter).toBe(5000);
        });
        it('should handle permission denied errors', () => {
            const error = new Error('permission denied accessing /protected/repo');
            const result = errorHandler_1.errorHandler.handleCliError(error, mockContext);
            expect(result.type).toBe(errorHandler_1.ErrorType.PERMISSION_DENIED);
            expect(result.severity).toBe(errorHandler_1.ErrorSeverity.HIGH);
            expect(result.code).toBe('CLI_003');
            expect(result.isRetryable).toBe(false);
        });
        it('should handle generic CLI execution failures', () => {
            const error = new Error('Exit code 1: Invalid repository');
            const result = errorHandler_1.errorHandler.handleCliError(error, mockContext);
            expect(result.type).toBe(errorHandler_1.ErrorType.CLI_EXECUTION_FAILED);
            expect(result.severity).toBe(errorHandler_1.ErrorSeverity.MEDIUM);
            expect(result.code).toBe('CLI_004');
            expect(result.isRetryable).toBe(true);
        });
    });
    describe('Parsing Error Handling', () => {
        it('should handle parsing failures', () => {
            const rawOutput = 'Invalid JSON output: {broken json}';
            const operation = 'list';
            const error = new Error('Unexpected token in JSON');
            const result = errorHandler_1.errorHandler.handleParsingError(rawOutput, operation, error, mockContext);
            expect(result.type).toBe(errorHandler_1.ErrorType.PARSING_FAILED);
            expect(result.severity).toBe(errorHandler_1.ErrorSeverity.MEDIUM);
            expect(result.code).toBe('PARSE_001');
            expect(result.context?.operation).toBe(operation);
            expect(result.context?.outputLength).toBe(rawOutput.length);
            expect(result.isRetryable).toBe(true);
        });
        it('should include output preview in context', () => {
            const longOutput = 'A'.repeat(300);
            const result = errorHandler_1.errorHandler.handleParsingError(longOutput, 'test', new Error('Parse error'), mockContext);
            expect(result.context?.outputPreview).toBe('A'.repeat(200));
            expect(result.context?.outputLength).toBe(300);
        });
    });
    describe('Validation Error Handling', () => {
        it('should handle repository path validation errors', () => {
            const result = errorHandler_1.errorHandler.handleValidationError('repositoryPath', '/invalid/../path', 'Path contains invalid characters', mockContext);
            expect(result.type).toBe(errorHandler_1.ErrorType.INVALID_REPOSITORY_PATH);
            expect(result.severity).toBe(errorHandler_1.ErrorSeverity.LOW);
            expect(result.code).toBe('VAL_002');
            expect(result.isRetryable).toBe(false);
        });
        it('should handle operation validation errors', () => {
            const result = errorHandler_1.errorHandler.handleValidationError('operation', 'invalid-op', 'Unknown operation', mockContext);
            expect(result.type).toBe(errorHandler_1.ErrorType.INVALID_OPERATION);
            expect(result.code).toBe('VAL_003');
        });
        it('should handle generic validation errors', () => {
            const result = errorHandler_1.errorHandler.handleValidationError('customField', null, 'Field is required', mockContext);
            expect(result.type).toBe(errorHandler_1.ErrorType.INVALID_ARGUMENTS);
            expect(result.code).toBe('VAL_001');
        });
    });
    describe('System Error Handling', () => {
        it('should handle file system errors', () => {
            const error = new Error('ENOENT: no such file or directory');
            const result = errorHandler_1.errorHandler.handleSystemError(error, mockContext);
            expect(result.type).toBe(errorHandler_1.ErrorType.FILE_SYSTEM_ERROR);
            expect(result.severity).toBe(errorHandler_1.ErrorSeverity.MEDIUM);
            expect(result.code).toBe('SYS_001');
            expect(result.isRetryable).toBe(false);
        });
        it('should handle network errors', () => {
            const error = new Error('ENOTFOUND: DNS lookup failed');
            const result = errorHandler_1.errorHandler.handleSystemError(error, mockContext);
            expect(result.type).toBe(errorHandler_1.ErrorType.NETWORK_ERROR);
            expect(result.code).toBe('SYS_002');
            expect(result.isRetryable).toBe(true);
            expect(result.retryAfter).toBe(10000);
        });
        it('should handle unknown system errors', () => {
            const error = new Error('Something unexpected happened');
            const result = errorHandler_1.errorHandler.handleSystemError(error, mockContext);
            expect(result.type).toBe(errorHandler_1.ErrorType.UNKNOWN_ERROR);
            expect(result.code).toBe('SYS_999');
            expect(result.isRetryable).toBe(true);
        });
    });
    describe('Security Error Handling', () => {
        it('should handle rate limiting', () => {
            const result = errorHandler_1.errorHandler.handleSecurityError('rate limit exceeded', mockContext, errorHandler_1.ErrorSeverity.MEDIUM);
            expect(result.type).toBe(errorHandler_1.ErrorType.RATE_LIMIT_EXCEEDED);
            expect(result.code).toBe('SEC_002');
            expect(result.isRetryable).toBe(true);
            expect(result.retryAfter).toBe(60000);
        });
        it('should handle token validation errors', () => {
            const result = errorHandler_1.errorHandler.handleSecurityError('invalid token provided', mockContext, errorHandler_1.ErrorSeverity.HIGH);
            expect(result.type).toBe(errorHandler_1.ErrorType.INVALID_TOKEN);
            expect(result.code).toBe('SEC_003');
            expect(result.isRetryable).toBe(false);
        });
        it('should handle generic security violations', () => {
            const result = errorHandler_1.errorHandler.handleSecurityError('unauthorized access attempt', mockContext);
            expect(result.type).toBe(errorHandler_1.ErrorType.UNAUTHORIZED_ACCESS);
            expect(result.code).toBe('SEC_001');
        });
    });
    describe('Error Normalization', () => {
        it('should return TaskMasterError as-is', () => {
            const originalError = new errorHandler_1.TaskMasterError({
                type: errorHandler_1.ErrorType.CLI_NOT_FOUND,
                severity: errorHandler_1.ErrorSeverity.HIGH,
                message: 'Test error',
                code: 'TEST_001'
            });
            const result = errorHandler_1.errorHandler.normalizeError(originalError, mockContext);
            expect(result).toBe(originalError);
        });
        it('should convert Error to TaskMasterError', () => {
            const error = new Error('Standard error');
            const result = errorHandler_1.errorHandler.normalizeError(error, mockContext);
            expect(result).toBeInstanceOf(errorHandler_1.TaskMasterError);
            expect(result.type).toBe(errorHandler_1.ErrorType.UNKNOWN_ERROR);
        });
        it('should convert string to TaskMasterError', () => {
            const result = errorHandler_1.errorHandler.normalizeError('String error', mockContext);
            expect(result).toBeInstanceOf(errorHandler_1.TaskMasterError);
            expect(result.message).toBe('String error');
            expect(result.code).toBe('UNK_001');
        });
        it('should handle completely unknown errors', () => {
            const result = errorHandler_1.errorHandler.normalizeError({ weird: 'object' }, mockContext);
            expect(result).toBeInstanceOf(errorHandler_1.TaskMasterError);
            expect(result.message).toBe('An unknown error occurred');
            expect(result.code).toBe('UNK_002');
        });
    });
    describe('HTTP Status Code Mapping', () => {
        it('should return 400 for validation errors', () => {
            const error = new errorHandler_1.TaskMasterError({
                type: errorHandler_1.ErrorType.INVALID_ARGUMENTS,
                severity: errorHandler_1.ErrorSeverity.LOW,
                message: 'Invalid input',
                code: 'VAL_001'
            });
            expect(errorHandler_1.errorHandler.getHttpStatusCode(error)).toBe(400);
        });
        it('should return 401 for authentication errors', () => {
            const error = new errorHandler_1.TaskMasterError({
                type: errorHandler_1.ErrorType.UNAUTHORIZED_ACCESS,
                severity: errorHandler_1.ErrorSeverity.HIGH,
                message: 'Not authorized',
                code: 'SEC_001'
            });
            expect(errorHandler_1.errorHandler.getHttpStatusCode(error)).toBe(401);
        });
        it('should return 403 for permission errors', () => {
            const error = new errorHandler_1.TaskMasterError({
                type: errorHandler_1.ErrorType.PERMISSION_DENIED,
                severity: errorHandler_1.ErrorSeverity.HIGH,
                message: 'Access denied',
                code: 'CLI_003'
            });
            expect(errorHandler_1.errorHandler.getHttpStatusCode(error)).toBe(403);
        });
        it('should return 404 for not found errors', () => {
            const error = new errorHandler_1.TaskMasterError({
                type: errorHandler_1.ErrorType.CLI_NOT_FOUND,
                severity: errorHandler_1.ErrorSeverity.HIGH,
                message: 'CLI not found',
                code: 'CLI_001'
            });
            expect(errorHandler_1.errorHandler.getHttpStatusCode(error)).toBe(404);
        });
        it('should return 408 for timeout errors', () => {
            const error = new errorHandler_1.TaskMasterError({
                type: errorHandler_1.ErrorType.CLI_TIMEOUT,
                severity: errorHandler_1.ErrorSeverity.MEDIUM,
                message: 'Request timeout',
                code: 'CLI_002'
            });
            expect(errorHandler_1.errorHandler.getHttpStatusCode(error)).toBe(408);
        });
        it('should return 429 for rate limit errors', () => {
            const error = new errorHandler_1.TaskMasterError({
                type: errorHandler_1.ErrorType.RATE_LIMIT_EXCEEDED,
                severity: errorHandler_1.ErrorSeverity.MEDIUM,
                message: 'Rate limit exceeded',
                code: 'SEC_002'
            });
            expect(errorHandler_1.errorHandler.getHttpStatusCode(error)).toBe(429);
        });
        it('should return 500 for unknown errors', () => {
            const error = new errorHandler_1.TaskMasterError({
                type: errorHandler_1.ErrorType.UNKNOWN_ERROR,
                severity: errorHandler_1.ErrorSeverity.HIGH,
                message: 'Unknown error',
                code: 'UNK_001'
            });
            expect(errorHandler_1.errorHandler.getHttpStatusCode(error)).toBe(500);
        });
    });
    describe('TaskMasterError', () => {
        it('should generate appropriate user messages', () => {
            const error = new errorHandler_1.TaskMasterError({
                type: errorHandler_1.ErrorType.CLI_NOT_FOUND,
                severity: errorHandler_1.ErrorSeverity.HIGH,
                message: 'CLI not found',
                code: 'CLI_001'
            });
            expect(error.userMessage).toContain('TaskMaster CLI is not installed');
        });
        it('should use custom user message when provided', () => {
            const customMessage = 'Custom user-friendly message';
            const error = new errorHandler_1.TaskMasterError({
                type: errorHandler_1.ErrorType.CLI_NOT_FOUND,
                severity: errorHandler_1.ErrorSeverity.HIGH,
                message: 'CLI not found',
                code: 'CLI_001',
                userMessage: customMessage
            });
            expect(error.userMessage).toBe(customMessage);
        });
        it('should serialize to JSON properly', () => {
            const error = new errorHandler_1.TaskMasterError({
                type: errorHandler_1.ErrorType.CLI_EXECUTION_FAILED,
                severity: errorHandler_1.ErrorSeverity.MEDIUM,
                message: 'Execution failed',
                code: 'CLI_004',
                context: mockContext,
                suggestions: ['Try again'],
                isRetryable: true
            });
            const json = error.toJSON();
            expect(json.type).toBe(errorHandler_1.ErrorType.CLI_EXECUTION_FAILED);
            expect(json.severity).toBe(errorHandler_1.ErrorSeverity.MEDIUM);
            expect(json.code).toBe('CLI_004');
            expect(json.context).toEqual(mockContext);
            expect(json.suggestions).toEqual(['Try again']);
            expect(json.isRetryable).toBe(true);
        });
        it('should maintain stack trace', () => {
            const error = new errorHandler_1.TaskMasterError({
                type: errorHandler_1.ErrorType.UNKNOWN_ERROR,
                severity: errorHandler_1.ErrorSeverity.HIGH,
                message: 'Test error',
                code: 'TEST_001'
            });
            expect(error.stack).toBeDefined();
            expect(error.stack).toContain('TaskMasterError');
        });
    });
});
//# sourceMappingURL=errorHandler.test.js.map