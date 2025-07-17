"use strict";
// Comprehensive Error Handling System for TaskMaster CLI Service
// Provides structured error handling with proper categorization and recovery
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ErrorHandler = exports.TaskMasterError = exports.ErrorSeverity = exports.ErrorType = void 0;
const logger_1 = require("./logger");
var ErrorType;
(function (ErrorType) {
    // CLI Related Errors
    ErrorType["CLI_NOT_FOUND"] = "CLI_NOT_FOUND";
    ErrorType["CLI_EXECUTION_FAILED"] = "CLI_EXECUTION_FAILED";
    ErrorType["CLI_TIMEOUT"] = "CLI_TIMEOUT";
    ErrorType["CLI_INVALID_OUTPUT"] = "CLI_INVALID_OUTPUT";
    // Parsing Errors
    ErrorType["PARSING_FAILED"] = "PARSING_FAILED";
    ErrorType["INVALID_JSON"] = "INVALID_JSON";
    ErrorType["UNEXPECTED_FORMAT"] = "UNEXPECTED_FORMAT";
    // Validation Errors
    ErrorType["INVALID_REPOSITORY_PATH"] = "INVALID_REPOSITORY_PATH";
    ErrorType["INVALID_OPERATION"] = "INVALID_OPERATION";
    ErrorType["INVALID_ARGUMENTS"] = "INVALID_ARGUMENTS";
    ErrorType["MISSING_REQUIRED_FIELD"] = "MISSING_REQUIRED_FIELD";
    // System Errors
    ErrorType["FILE_SYSTEM_ERROR"] = "FILE_SYSTEM_ERROR";
    ErrorType["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    ErrorType["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorType["DATABASE_ERROR"] = "DATABASE_ERROR";
    // Security Errors
    ErrorType["UNAUTHORIZED_ACCESS"] = "UNAUTHORIZED_ACCESS";
    ErrorType["INVALID_TOKEN"] = "INVALID_TOKEN";
    ErrorType["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    // Application Errors
    ErrorType["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
    ErrorType["CONFIGURATION_ERROR"] = "CONFIGURATION_ERROR";
    ErrorType["DEPENDENCY_ERROR"] = "DEPENDENCY_ERROR";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
class TaskMasterError extends Error {
    constructor(details) {
        super(details.message);
        this.name = 'TaskMasterError';
        this.type = details.type;
        this.severity = details.severity;
        this.code = details.code;
        this.context = details.context;
        this.originalError = details.originalError;
        this.suggestions = details.suggestions || [];
        this.isRetryable = details.isRetryable || false;
        this.retryAfter = details.retryAfter;
        this.userMessage = details.userMessage || this.generateUserMessage();
        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TaskMasterError);
        }
    }
    generateUserMessage() {
        switch (this.type) {
            case ErrorType.CLI_NOT_FOUND:
                return 'TaskMaster CLI is not installed or not found in PATH. Please install TaskMaster CLI first.';
            case ErrorType.CLI_EXECUTION_FAILED:
                return 'Command execution failed. Please check your repository path and try again.';
            case ErrorType.CLI_TIMEOUT:
                return 'Command timed out. The operation may be taking longer than expected.';
            case ErrorType.INVALID_REPOSITORY_PATH:
                return 'Invalid repository path. Please provide a valid path to a TaskMaster project.';
            case ErrorType.PARSING_FAILED:
                return 'Failed to parse command output. The command may have returned unexpected data.';
            case ErrorType.PERMISSION_DENIED:
                return 'Permission denied. Please check your access rights to the repository.';
            case ErrorType.RATE_LIMIT_EXCEEDED:
                return 'Too many requests. Please wait a moment before trying again.';
            default:
                return 'An unexpected error occurred. Please try again or contact support.';
        }
    }
    toJSON() {
        return {
            name: this.name,
            type: this.type,
            severity: this.severity,
            code: this.code,
            message: this.message,
            userMessage: this.userMessage,
            context: this.context,
            suggestions: this.suggestions,
            isRetryable: this.isRetryable,
            retryAfter: this.retryAfter,
            stack: this.stack,
            originalError: this.originalError ? {
                name: this.originalError.name,
                message: this.originalError.message,
                stack: this.originalError.stack
            } : undefined
        };
    }
}
exports.TaskMasterError = TaskMasterError;
class ErrorHandler {
    static getInstance() {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }
    /**
     * Handle CLI execution errors
     */
    handleCliError(error, context) {
        logger_1.logger.error('CLI execution error', context, error, 'error-handler');
        // Check if CLI is not found
        if (error.message.includes('command not found') ||
            error.message.includes('ENOENT') ||
            error.message.includes('not recognized')) {
            return new TaskMasterError({
                type: ErrorType.CLI_NOT_FOUND,
                severity: ErrorSeverity.HIGH,
                message: 'TaskMaster CLI executable not found',
                code: 'CLI_001',
                context,
                originalError: error,
                suggestions: [
                    'Install TaskMaster CLI using npm: npm install -g task-master-ai',
                    'Verify TaskMaster CLI is in your PATH',
                    'Check if the CLI is properly configured'
                ],
                isRetryable: false
            });
        }
        // Check for timeout
        if (error.message.includes('timeout') ||
            error.message.includes('ETIMEDOUT') ||
            error.message.includes('timed out')) {
            return new TaskMasterError({
                type: ErrorType.CLI_TIMEOUT,
                severity: ErrorSeverity.MEDIUM,
                message: 'CLI command execution timed out',
                code: 'CLI_002',
                context,
                originalError: error,
                suggestions: [
                    'Try the operation again',
                    'Check if the repository is very large',
                    'Verify network connectivity if using remote repositories'
                ],
                isRetryable: true,
                retryAfter: 5000
            });
        }
        // Check for permission errors
        if (error.message.includes('permission denied') ||
            error.message.includes('EACCES') ||
            error.message.includes('access denied')) {
            return new TaskMasterError({
                type: ErrorType.PERMISSION_DENIED,
                severity: ErrorSeverity.HIGH,
                message: 'Permission denied accessing repository',
                code: 'CLI_003',
                context,
                originalError: error,
                suggestions: [
                    'Check file permissions for the repository',
                    'Ensure you have read/write access to the directory',
                    'Run with appropriate user permissions'
                ],
                isRetryable: false
            });
        }
        // Generic CLI execution error
        return new TaskMasterError({
            type: ErrorType.CLI_EXECUTION_FAILED,
            severity: ErrorSeverity.MEDIUM,
            message: `CLI execution failed: ${error.message}`,
            code: 'CLI_004',
            context,
            originalError: error,
            suggestions: [
                'Verify the repository path is correct',
                'Check if the repository is a valid TaskMaster project',
                'Try initializing the project with task-master init'
            ],
            isRetryable: true
        });
    }
    /**
     * Handle parsing errors
     */
    handleParsingError(rawOutput, operation, error, context) {
        logger_1.logger.logParsingError(operation, rawOutput, context, error);
        return new TaskMasterError({
            type: ErrorType.PARSING_FAILED,
            severity: ErrorSeverity.MEDIUM,
            message: `Failed to parse output from operation: ${operation}`,
            code: 'PARSE_001',
            context: {
                ...context,
                operation,
                outputLength: rawOutput.length,
                outputPreview: rawOutput.substring(0, 200)
            },
            originalError: error,
            suggestions: [
                'Try running the command again',
                'Verify the TaskMaster CLI version is compatible',
                'Check if the output format has changed'
            ],
            isRetryable: true
        });
    }
    /**
     * Handle validation errors
     */
    handleValidationError(field, value, reason, context) {
        logger_1.logger.warn(`Validation error: ${field} - ${reason}`, {
            ...context,
            field,
            value: typeof value === 'string' ? value.substring(0, 100) : value,
            reason
        }, 'validation');
        let errorType = ErrorType.INVALID_ARGUMENTS;
        let code = 'VAL_001';
        if (field === 'repositoryPath') {
            errorType = ErrorType.INVALID_REPOSITORY_PATH;
            code = 'VAL_002';
        }
        else if (field === 'operation') {
            errorType = ErrorType.INVALID_OPERATION;
            code = 'VAL_003';
        }
        return new TaskMasterError({
            type: errorType,
            severity: ErrorSeverity.LOW,
            message: `Validation failed for ${field}: ${reason}`,
            code,
            context: {
                ...context,
                field,
                value,
                reason
            },
            suggestions: [
                `Please provide a valid ${field}`,
                'Check the API documentation for expected format',
                'Verify all required fields are provided'
            ],
            isRetryable: false
        });
    }
    /**
     * Handle system errors
     */
    handleSystemError(error, context) {
        logger_1.logger.error('System error', context, error, 'system');
        // File system errors
        if (error.message.includes('ENOENT') && !error.message.includes('command not found')) {
            return new TaskMasterError({
                type: ErrorType.FILE_SYSTEM_ERROR,
                severity: ErrorSeverity.MEDIUM,
                message: 'File or directory not found',
                code: 'SYS_001',
                context,
                originalError: error,
                suggestions: [
                    'Verify the file path exists',
                    'Check directory permissions',
                    'Ensure the repository is properly initialized'
                ],
                isRetryable: false
            });
        }
        // Network errors
        if (error.message.includes('ENOTFOUND') ||
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('network')) {
            return new TaskMasterError({
                type: ErrorType.NETWORK_ERROR,
                severity: ErrorSeverity.MEDIUM,
                message: 'Network connection error',
                code: 'SYS_002',
                context,
                originalError: error,
                suggestions: [
                    'Check your internet connection',
                    'Verify DNS settings',
                    'Try again in a few moments'
                ],
                isRetryable: true,
                retryAfter: 10000
            });
        }
        // Generic system error
        return new TaskMasterError({
            type: ErrorType.UNKNOWN_ERROR,
            severity: ErrorSeverity.HIGH,
            message: `System error: ${error.message}`,
            code: 'SYS_999',
            context,
            originalError: error,
            suggestions: [
                'Try the operation again',
                'Check system resources',
                'Contact support if the problem persists'
            ],
            isRetryable: true
        });
    }
    /**
     * Handle security events
     */
    handleSecurityError(event, context, severity = ErrorSeverity.HIGH) {
        logger_1.logger.logSecurityEvent(event, context, severity);
        let errorType = ErrorType.UNAUTHORIZED_ACCESS;
        let code = 'SEC_001';
        if (event.includes('rate limit')) {
            errorType = ErrorType.RATE_LIMIT_EXCEEDED;
            code = 'SEC_002';
        }
        else if (event.includes('token')) {
            errorType = ErrorType.INVALID_TOKEN;
            code = 'SEC_003';
        }
        return new TaskMasterError({
            type: errorType,
            severity,
            message: `Security violation: ${event}`,
            code,
            context,
            suggestions: [
                'Verify your authentication credentials',
                'Check if your access token is valid',
                'Wait before retrying if rate limited'
            ],
            isRetryable: errorType === ErrorType.RATE_LIMIT_EXCEEDED,
            retryAfter: errorType === ErrorType.RATE_LIMIT_EXCEEDED ? 60000 : undefined
        });
    }
    /**
     * Convert unknown errors to TaskMasterError
     */
    normalizeError(error, context) {
        if (error instanceof TaskMasterError) {
            return error;
        }
        if (error instanceof Error) {
            return this.handleSystemError(error, context);
        }
        // Handle string errors
        if (typeof error === 'string') {
            return new TaskMasterError({
                type: ErrorType.UNKNOWN_ERROR,
                severity: ErrorSeverity.MEDIUM,
                message: error,
                code: 'UNK_001',
                context,
                suggestions: ['Try the operation again'],
                isRetryable: true
            });
        }
        // Handle completely unknown errors
        return new TaskMasterError({
            type: ErrorType.UNKNOWN_ERROR,
            severity: ErrorSeverity.HIGH,
            message: 'An unknown error occurred',
            code: 'UNK_002',
            context,
            suggestions: [
                'Try the operation again',
                'Contact support if the problem persists'
            ],
            isRetryable: true
        });
    }
    /**
     * Get HTTP status code for error type
     */
    getHttpStatusCode(error) {
        switch (error.type) {
            case ErrorType.INVALID_REPOSITORY_PATH:
            case ErrorType.INVALID_OPERATION:
            case ErrorType.INVALID_ARGUMENTS:
            case ErrorType.MISSING_REQUIRED_FIELD:
            case ErrorType.INVALID_JSON:
                return 400; // Bad Request
            case ErrorType.UNAUTHORIZED_ACCESS:
            case ErrorType.INVALID_TOKEN:
                return 401; // Unauthorized
            case ErrorType.PERMISSION_DENIED:
                return 403; // Forbidden
            case ErrorType.CLI_NOT_FOUND:
            case ErrorType.FILE_SYSTEM_ERROR:
                return 404; // Not Found
            case ErrorType.CLI_TIMEOUT:
                return 408; // Request Timeout
            case ErrorType.RATE_LIMIT_EXCEEDED:
                return 429; // Too Many Requests
            case ErrorType.CLI_EXECUTION_FAILED:
            case ErrorType.PARSING_FAILED:
            case ErrorType.NETWORK_ERROR:
            case ErrorType.DATABASE_ERROR:
            case ErrorType.CONFIGURATION_ERROR:
            case ErrorType.DEPENDENCY_ERROR:
            case ErrorType.UNKNOWN_ERROR:
            default:
                return 500; // Internal Server Error
        }
    }
}
exports.ErrorHandler = ErrorHandler;
// Export singleton instance
exports.errorHandler = ErrorHandler.getInstance();
//# sourceMappingURL=errorHandler.js.map