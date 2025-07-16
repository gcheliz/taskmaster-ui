import { LogContext } from './logger';
export declare enum ErrorType {
    CLI_NOT_FOUND = "CLI_NOT_FOUND",
    CLI_EXECUTION_FAILED = "CLI_EXECUTION_FAILED",
    CLI_TIMEOUT = "CLI_TIMEOUT",
    CLI_INVALID_OUTPUT = "CLI_INVALID_OUTPUT",
    PARSING_FAILED = "PARSING_FAILED",
    INVALID_JSON = "INVALID_JSON",
    UNEXPECTED_FORMAT = "UNEXPECTED_FORMAT",
    INVALID_REPOSITORY_PATH = "INVALID_REPOSITORY_PATH",
    INVALID_OPERATION = "INVALID_OPERATION",
    INVALID_ARGUMENTS = "INVALID_ARGUMENTS",
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
    FILE_SYSTEM_ERROR = "FILE_SYSTEM_ERROR",
    PERMISSION_DENIED = "PERMISSION_DENIED",
    NETWORK_ERROR = "NETWORK_ERROR",
    DATABASE_ERROR = "DATABASE_ERROR",
    UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
    INVALID_TOKEN = "INVALID_TOKEN",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
    DEPENDENCY_ERROR = "DEPENDENCY_ERROR"
}
export declare enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export interface ErrorDetails {
    type: ErrorType;
    severity: ErrorSeverity;
    message: string;
    code: string;
    context?: LogContext;
    originalError?: Error;
    suggestions?: string[];
    isRetryable?: boolean;
    retryAfter?: number;
    userMessage?: string;
}
export declare class TaskMasterError extends Error {
    readonly type: ErrorType;
    readonly severity: ErrorSeverity;
    readonly code: string;
    readonly context?: LogContext;
    readonly originalError?: Error;
    readonly suggestions: string[];
    readonly isRetryable: boolean;
    readonly retryAfter?: number;
    readonly userMessage: string;
    constructor(details: ErrorDetails);
    private generateUserMessage;
    toJSON(): {
        name: string;
        type: ErrorType;
        severity: ErrorSeverity;
        code: string;
        message: string;
        userMessage: string;
        context: LogContext | undefined;
        suggestions: string[];
        isRetryable: boolean;
        retryAfter: number | undefined;
        stack: string | undefined;
        originalError: {
            name: string;
            message: string;
            stack: string | undefined;
        } | undefined;
    };
}
export declare class ErrorHandler {
    private static instance;
    static getInstance(): ErrorHandler;
    /**
     * Handle CLI execution errors
     */
    handleCliError(error: Error, context: LogContext): TaskMasterError;
    /**
     * Handle parsing errors
     */
    handleParsingError(rawOutput: string, operation: string, error: Error, context: LogContext): TaskMasterError;
    /**
     * Handle validation errors
     */
    handleValidationError(field: string, value: any, reason: string, context: LogContext): TaskMasterError;
    /**
     * Handle system errors
     */
    handleSystemError(error: Error, context: LogContext): TaskMasterError;
    /**
     * Handle security events
     */
    handleSecurityError(event: string, context: LogContext, severity?: ErrorSeverity): TaskMasterError;
    /**
     * Convert unknown errors to TaskMasterError
     */
    normalizeError(error: unknown, context: LogContext): TaskMasterError;
    /**
     * Get HTTP status code for error type
     */
    getHttpStatusCode(error: TaskMasterError): number;
}
export declare const errorHandler: ErrorHandler;
//# sourceMappingURL=errorHandler.d.ts.map