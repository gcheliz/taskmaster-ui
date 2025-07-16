export interface LogContext {
    requestId?: string;
    repositoryPath?: string;
    operation?: string;
    userId?: string;
    timestamp?: string;
    duration?: number;
    [key: string]: any;
}
export interface LogEntry {
    level: LogLevel;
    message: string;
    context?: LogContext;
    error?: Error;
    timestamp: string;
    module: string;
}
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug",
    TRACE = "trace"
}
export declare class TaskMasterLogger {
    private static instance;
    private logLevel;
    private logHandlers;
    private constructor();
    static getInstance(): TaskMasterLogger;
    addHandler(handler: LogHandler): void;
    setLogLevel(level: LogLevel): void;
    private shouldLog;
    private log;
    error(message: string, context?: LogContext, error?: Error, module?: string): void;
    warn(message: string, context?: LogContext, module?: string): void;
    info(message: string, context?: LogContext, module?: string): void;
    debug(message: string, context?: LogContext, module?: string): void;
    trace(message: string, context?: LogContext, module?: string): void;
    logApiRequest(method: string, path: string, context: LogContext): void;
    logApiResponse(method: string, path: string, statusCode: number, duration: number, context: LogContext): void;
    logCliExecution(operation: string, repositoryPath: string, context: LogContext): void;
    logCliResult(operation: string, success: boolean, duration: number, context: LogContext, error?: Error): void;
    logParsingError(operation: string, rawOutput: string, context: LogContext, error: Error): void;
    logSecurityEvent(event: string, context: LogContext, severity?: 'low' | 'medium' | 'high'): void;
}
export interface LogHandler {
    handle(entry: LogEntry): void;
}
export declare class ConsoleLogHandler implements LogHandler {
    handle(entry: LogEntry): void;
}
export declare class FileLogHandler implements LogHandler {
    private logFile;
    constructor(logFile?: string);
    private ensureLogDirectory;
    handle(entry: LogEntry): void;
}
export declare const logger: TaskMasterLogger;
//# sourceMappingURL=logger.d.ts.map