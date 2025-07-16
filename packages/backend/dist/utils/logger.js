"use strict";
// Advanced Logging System for TaskMaster CLI Service
// Provides structured logging with different levels and contexts
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.FileLogHandler = exports.ConsoleLogHandler = exports.TaskMasterLogger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
    LogLevel["TRACE"] = "trace";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class TaskMasterLogger {
    constructor() {
        this.logLevel = LogLevel.INFO;
        this.logHandlers = [];
        // Add console handler by default
        this.addHandler(new ConsoleLogHandler());
        // Add file handler in production
        if (process.env.NODE_ENV === 'production') {
            this.addHandler(new FileLogHandler());
        }
        // Set log level from environment
        const envLogLevel = process.env.LOG_LEVEL?.toLowerCase();
        if (envLogLevel && Object.values(LogLevel).includes(envLogLevel)) {
            this.logLevel = envLogLevel;
        }
    }
    static getInstance() {
        if (!TaskMasterLogger.instance) {
            TaskMasterLogger.instance = new TaskMasterLogger();
        }
        return TaskMasterLogger.instance;
    }
    addHandler(handler) {
        this.logHandlers.push(handler);
    }
    setLogLevel(level) {
        this.logLevel = level;
    }
    shouldLog(level) {
        const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG, LogLevel.TRACE];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const requestedLevelIndex = levels.indexOf(level);
        return requestedLevelIndex <= currentLevelIndex;
    }
    log(level, message, context, error, module = 'unknown') {
        if (!this.shouldLog(level)) {
            return;
        }
        const logEntry = {
            level,
            message,
            context: {
                ...context,
                timestamp: new Date().toISOString()
            },
            error,
            timestamp: new Date().toISOString(),
            module
        };
        // Send to all handlers
        this.logHandlers.forEach(handler => {
            try {
                handler.handle(logEntry);
            }
            catch (handlerError) {
                console.error('Log handler failed:', handlerError);
            }
        });
    }
    error(message, context, error, module) {
        this.log(LogLevel.ERROR, message, context, error, module);
    }
    warn(message, context, module) {
        this.log(LogLevel.WARN, message, context, undefined, module);
    }
    info(message, context, module) {
        this.log(LogLevel.INFO, message, context, undefined, module);
    }
    debug(message, context, module) {
        this.log(LogLevel.DEBUG, message, context, undefined, module);
    }
    trace(message, context, module) {
        this.log(LogLevel.TRACE, message, context, undefined, module);
    }
    // Specialized logging methods for common scenarios
    logApiRequest(method, path, context) {
        this.info(`API ${method} ${path}`, {
            ...context,
            type: 'api_request'
        }, 'api');
    }
    logApiResponse(method, path, statusCode, duration, context) {
        const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
        this.log(level, `API ${method} ${path} - ${statusCode} (${duration}ms)`, {
            ...context,
            statusCode,
            duration,
            type: 'api_response'
        }, undefined, 'api');
    }
    logCliExecution(operation, repositoryPath, context) {
        this.info(`CLI execution: ${operation}`, {
            ...context,
            operation,
            repositoryPath,
            type: 'cli_execution'
        }, 'cli');
    }
    logCliResult(operation, success, duration, context, error) {
        const level = success ? LogLevel.INFO : LogLevel.ERROR;
        this.log(level, `CLI ${operation} ${success ? 'completed' : 'failed'} (${duration}ms)`, {
            ...context,
            operation,
            success,
            duration,
            type: 'cli_result'
        }, error, 'cli');
    }
    logParsingError(operation, rawOutput, context, error) {
        this.error(`Parsing failed for ${operation}`, {
            ...context,
            operation,
            outputLength: rawOutput.length,
            outputPreview: rawOutput.substring(0, 200),
            type: 'parsing_error'
        }, error, 'parser');
    }
    logSecurityEvent(event, context, severity = 'medium') {
        const level = severity === 'high' ? LogLevel.ERROR : LogLevel.WARN;
        this.log(level, `Security event: ${event}`, {
            ...context,
            severity,
            type: 'security_event'
        }, undefined, 'security');
    }
}
exports.TaskMasterLogger = TaskMasterLogger;
// Console Log Handler
class ConsoleLogHandler {
    handle(entry) {
        const timestamp = new Date(entry.timestamp).toISOString();
        const level = entry.level.toUpperCase().padEnd(5);
        const module = entry.module.padEnd(10);
        let message = `[${timestamp}] ${level} [${module}] ${entry.message}`;
        if (entry.context && Object.keys(entry.context).length > 0) {
            message += ` ${JSON.stringify(entry.context)}`;
        }
        // Color coding for different log levels
        switch (entry.level) {
            case LogLevel.ERROR:
                console.error('\x1b[31m%s\x1b[0m', message); // Red
                if (entry.error) {
                    console.error('\x1b[31m%s\x1b[0m', entry.error.stack || entry.error.message);
                }
                break;
            case LogLevel.WARN:
                console.warn('\x1b[33m%s\x1b[0m', message); // Yellow
                break;
            case LogLevel.INFO:
                console.info('\x1b[36m%s\x1b[0m', message); // Cyan
                break;
            case LogLevel.DEBUG:
                console.debug('\x1b[90m%s\x1b[0m', message); // Gray
                break;
            case LogLevel.TRACE:
                console.trace('\x1b[90m%s\x1b[0m', message); // Gray
                break;
            default:
                console.log(message);
        }
    }
}
exports.ConsoleLogHandler = ConsoleLogHandler;
// File Log Handler
class FileLogHandler {
    constructor(logFile = './logs/taskmaster.log') {
        this.logFile = logFile;
        this.ensureLogDirectory();
    }
    ensureLogDirectory() {
        const fs = require('fs');
        const path = require('path');
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }
    handle(entry) {
        const fs = require('fs');
        const logLine = JSON.stringify({
            ...entry,
            error: entry.error ? {
                message: entry.error.message,
                stack: entry.error.stack,
                name: entry.error.name
            } : undefined
        }) + '\n';
        try {
            fs.appendFileSync(this.logFile, logLine);
        }
        catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }
}
exports.FileLogHandler = FileLogHandler;
// Export singleton instance
exports.logger = TaskMasterLogger.getInstance();
//# sourceMappingURL=logger.js.map