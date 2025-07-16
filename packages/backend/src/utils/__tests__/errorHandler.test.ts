// Comprehensive Error Handler Tests
// Tests all error types and handling scenarios

import { errorHandler, TaskMasterError, ErrorType, ErrorSeverity } from '../errorHandler';
import { LogContext } from '../logger';

describe('ErrorHandler', () => {
  const mockContext: LogContext = {
    requestId: 'test-req-123',
    repositoryPath: '/test/repo',
    operation: 'test-operation'
  };

  describe('CLI Error Handling', () => {
    it('should handle CLI not found errors', () => {
      const error = new Error('command not found: task-master');
      const result = errorHandler.handleCliError(error, mockContext);

      expect(result).toBeInstanceOf(TaskMasterError);
      expect(result.type).toBe(ErrorType.CLI_NOT_FOUND);
      expect(result.severity).toBe(ErrorSeverity.HIGH);
      expect(result.code).toBe('CLI_001');
      expect(result.isRetryable).toBe(false);
      expect(result.suggestions).toContain('Install TaskMaster CLI using npm: npm install -g task-master-ai');
    });

    it('should handle CLI timeout errors', () => {
      const error = new Error('Command timed out after 30000ms');
      const result = errorHandler.handleCliError(error, mockContext);

      expect(result.type).toBe(ErrorType.CLI_TIMEOUT);
      expect(result.severity).toBe(ErrorSeverity.MEDIUM);
      expect(result.code).toBe('CLI_002');
      expect(result.isRetryable).toBe(true);
      expect(result.retryAfter).toBe(5000);
    });

    it('should handle permission denied errors', () => {
      const error = new Error('permission denied accessing /protected/repo');
      const result = errorHandler.handleCliError(error, mockContext);

      expect(result.type).toBe(ErrorType.PERMISSION_DENIED);
      expect(result.severity).toBe(ErrorSeverity.HIGH);
      expect(result.code).toBe('CLI_003');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle generic CLI execution failures', () => {
      const error = new Error('Exit code 1: Invalid repository');
      const result = errorHandler.handleCliError(error, mockContext);

      expect(result.type).toBe(ErrorType.CLI_EXECUTION_FAILED);
      expect(result.severity).toBe(ErrorSeverity.MEDIUM);
      expect(result.code).toBe('CLI_004');
      expect(result.isRetryable).toBe(true);
    });
  });

  describe('Parsing Error Handling', () => {
    it('should handle parsing failures', () => {
      const rawOutput = 'Invalid JSON output: {broken json}';
      const operation = 'list';
      const error = new Error('Unexpected token in JSON');
      
      const result = errorHandler.handleParsingError(rawOutput, operation, error, mockContext);

      expect(result.type).toBe(ErrorType.PARSING_FAILED);
      expect(result.severity).toBe(ErrorSeverity.MEDIUM);
      expect(result.code).toBe('PARSE_001');
      expect(result.context?.operation).toBe(operation);
      expect(result.context?.outputLength).toBe(rawOutput.length);
      expect(result.isRetryable).toBe(true);
    });

    it('should include output preview in context', () => {
      const longOutput = 'A'.repeat(300);
      const result = errorHandler.handleParsingError(longOutput, 'test', new Error('Parse error'), mockContext);

      expect(result.context?.outputPreview).toBe('A'.repeat(200));
      expect(result.context?.outputLength).toBe(300);
    });
  });

  describe('Validation Error Handling', () => {
    it('should handle repository path validation errors', () => {
      const result = errorHandler.handleValidationError(
        'repositoryPath',
        '/invalid/../path',
        'Path contains invalid characters',
        mockContext
      );

      expect(result.type).toBe(ErrorType.INVALID_REPOSITORY_PATH);
      expect(result.severity).toBe(ErrorSeverity.LOW);
      expect(result.code).toBe('VAL_002');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle operation validation errors', () => {
      const result = errorHandler.handleValidationError(
        'operation',
        'invalid-op',
        'Unknown operation',
        mockContext
      );

      expect(result.type).toBe(ErrorType.INVALID_OPERATION);
      expect(result.code).toBe('VAL_003');
    });

    it('should handle generic validation errors', () => {
      const result = errorHandler.handleValidationError(
        'customField',
        null,
        'Field is required',
        mockContext
      );

      expect(result.type).toBe(ErrorType.INVALID_ARGUMENTS);
      expect(result.code).toBe('VAL_001');
    });
  });

  describe('System Error Handling', () => {
    it('should handle file system errors', () => {
      const error = new Error('ENOENT: no such file or directory');
      const result = errorHandler.handleSystemError(error, mockContext);

      expect(result.type).toBe(ErrorType.FILE_SYSTEM_ERROR);
      expect(result.severity).toBe(ErrorSeverity.MEDIUM);
      expect(result.code).toBe('SYS_001');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle network errors', () => {
      const error = new Error('ENOTFOUND: DNS lookup failed');
      const result = errorHandler.handleSystemError(error, mockContext);

      expect(result.type).toBe(ErrorType.NETWORK_ERROR);
      expect(result.code).toBe('SYS_002');
      expect(result.isRetryable).toBe(true);
      expect(result.retryAfter).toBe(10000);
    });

    it('should handle unknown system errors', () => {
      const error = new Error('Something unexpected happened');
      const result = errorHandler.handleSystemError(error, mockContext);

      expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(result.code).toBe('SYS_999');
      expect(result.isRetryable).toBe(true);
    });
  });

  describe('Security Error Handling', () => {
    it('should handle rate limiting', () => {
      const result = errorHandler.handleSecurityError(
        'rate limit exceeded',
        mockContext,
        ErrorSeverity.MEDIUM
      );

      expect(result.type).toBe(ErrorType.RATE_LIMIT_EXCEEDED);
      expect(result.code).toBe('SEC_002');
      expect(result.isRetryable).toBe(true);
      expect(result.retryAfter).toBe(60000);
    });

    it('should handle token validation errors', () => {
      const result = errorHandler.handleSecurityError(
        'invalid token provided',
        mockContext,
        ErrorSeverity.HIGH
      );

      expect(result.type).toBe(ErrorType.INVALID_TOKEN);
      expect(result.code).toBe('SEC_003');
      expect(result.isRetryable).toBe(false);
    });

    it('should handle generic security violations', () => {
      const result = errorHandler.handleSecurityError(
        'unauthorized access attempt',
        mockContext
      );

      expect(result.type).toBe(ErrorType.UNAUTHORIZED_ACCESS);
      expect(result.code).toBe('SEC_001');
    });
  });

  describe('Error Normalization', () => {
    it('should return TaskMasterError as-is', () => {
      const originalError = new TaskMasterError({
        type: ErrorType.CLI_NOT_FOUND,
        severity: ErrorSeverity.HIGH,
        message: 'Test error',
        code: 'TEST_001'
      });

      const result = errorHandler.normalizeError(originalError, mockContext);
      expect(result).toBe(originalError);
    });

    it('should convert Error to TaskMasterError', () => {
      const error = new Error('Standard error');
      const result = errorHandler.normalizeError(error, mockContext);

      expect(result).toBeInstanceOf(TaskMasterError);
      expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
    });

    it('should convert string to TaskMasterError', () => {
      const result = errorHandler.normalizeError('String error', mockContext);

      expect(result).toBeInstanceOf(TaskMasterError);
      expect(result.message).toBe('String error');
      expect(result.code).toBe('UNK_001');
    });

    it('should handle completely unknown errors', () => {
      const result = errorHandler.normalizeError({ weird: 'object' }, mockContext);

      expect(result).toBeInstanceOf(TaskMasterError);
      expect(result.message).toBe('An unknown error occurred');
      expect(result.code).toBe('UNK_002');
    });
  });

  describe('HTTP Status Code Mapping', () => {
    it('should return 400 for validation errors', () => {
      const error = new TaskMasterError({
        type: ErrorType.INVALID_ARGUMENTS,
        severity: ErrorSeverity.LOW,
        message: 'Invalid input',
        code: 'VAL_001'
      });

      expect(errorHandler.getHttpStatusCode(error)).toBe(400);
    });

    it('should return 401 for authentication errors', () => {
      const error = new TaskMasterError({
        type: ErrorType.UNAUTHORIZED_ACCESS,
        severity: ErrorSeverity.HIGH,
        message: 'Not authorized',
        code: 'SEC_001'
      });

      expect(errorHandler.getHttpStatusCode(error)).toBe(401);
    });

    it('should return 403 for permission errors', () => {
      const error = new TaskMasterError({
        type: ErrorType.PERMISSION_DENIED,
        severity: ErrorSeverity.HIGH,
        message: 'Access denied',
        code: 'CLI_003'
      });

      expect(errorHandler.getHttpStatusCode(error)).toBe(403);
    });

    it('should return 404 for not found errors', () => {
      const error = new TaskMasterError({
        type: ErrorType.CLI_NOT_FOUND,
        severity: ErrorSeverity.HIGH,
        message: 'CLI not found',
        code: 'CLI_001'
      });

      expect(errorHandler.getHttpStatusCode(error)).toBe(404);
    });

    it('should return 408 for timeout errors', () => {
      const error = new TaskMasterError({
        type: ErrorType.CLI_TIMEOUT,
        severity: ErrorSeverity.MEDIUM,
        message: 'Request timeout',
        code: 'CLI_002'
      });

      expect(errorHandler.getHttpStatusCode(error)).toBe(408);
    });

    it('should return 429 for rate limit errors', () => {
      const error = new TaskMasterError({
        type: ErrorType.RATE_LIMIT_EXCEEDED,
        severity: ErrorSeverity.MEDIUM,
        message: 'Rate limit exceeded',
        code: 'SEC_002'
      });

      expect(errorHandler.getHttpStatusCode(error)).toBe(429);
    });

    it('should return 500 for unknown errors', () => {
      const error = new TaskMasterError({
        type: ErrorType.UNKNOWN_ERROR,
        severity: ErrorSeverity.HIGH,
        message: 'Unknown error',
        code: 'UNK_001'
      });

      expect(errorHandler.getHttpStatusCode(error)).toBe(500);
    });
  });

  describe('TaskMasterError', () => {
    it('should generate appropriate user messages', () => {
      const error = new TaskMasterError({
        type: ErrorType.CLI_NOT_FOUND,
        severity: ErrorSeverity.HIGH,
        message: 'CLI not found',
        code: 'CLI_001'
      });

      expect(error.userMessage).toContain('TaskMaster CLI is not installed');
    });

    it('should use custom user message when provided', () => {
      const customMessage = 'Custom user-friendly message';
      const error = new TaskMasterError({
        type: ErrorType.CLI_NOT_FOUND,
        severity: ErrorSeverity.HIGH,
        message: 'CLI not found',
        code: 'CLI_001',
        userMessage: customMessage
      });

      expect(error.userMessage).toBe(customMessage);
    });

    it('should serialize to JSON properly', () => {
      const error = new TaskMasterError({
        type: ErrorType.CLI_EXECUTION_FAILED,
        severity: ErrorSeverity.MEDIUM,
        message: 'Execution failed',
        code: 'CLI_004',
        context: mockContext,
        suggestions: ['Try again'],
        isRetryable: true
      });

      const json = error.toJSON();
      
      expect(json.type).toBe(ErrorType.CLI_EXECUTION_FAILED);
      expect(json.severity).toBe(ErrorSeverity.MEDIUM);
      expect(json.code).toBe('CLI_004');
      expect(json.context).toEqual(mockContext);
      expect(json.suggestions).toEqual(['Try again']);
      expect(json.isRetryable).toBe(true);
    });

    it('should maintain stack trace', () => {
      const error = new TaskMasterError({
        type: ErrorType.UNKNOWN_ERROR,
        severity: ErrorSeverity.HIGH,
        message: 'Test error',
        code: 'TEST_001'
      });

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('TaskMasterError');
    });
  });
});