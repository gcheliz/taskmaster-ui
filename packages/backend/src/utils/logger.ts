// Advanced Logging System for TaskMaster CLI Service
// Provides structured logging with different levels and contexts

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

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

export class TaskMasterLogger {
  private static instance: TaskMasterLogger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logHandlers: LogHandler[] = [];

  private constructor() {
    // Add console handler by default
    this.addHandler(new ConsoleLogHandler());
    
    // Add file handler in production
    if (process.env.NODE_ENV === 'production') {
      this.addHandler(new FileLogHandler());
    }

    // Set log level from environment
    const envLogLevel = process.env.LOG_LEVEL?.toLowerCase();
    if (envLogLevel && Object.values(LogLevel).includes(envLogLevel as LogLevel)) {
      this.logLevel = envLogLevel as LogLevel;
    }
  }

  static getInstance(): TaskMasterLogger {
    if (!TaskMasterLogger.instance) {
      TaskMasterLogger.instance = new TaskMasterLogger();
    }
    return TaskMasterLogger.instance;
  }

  addHandler(handler: LogHandler): void {
    this.logHandlers.push(handler);
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG, LogLevel.TRACE];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    return requestedLevelIndex <= currentLevelIndex;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error, module: string = 'unknown'): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
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
      } catch (handlerError) {
        console.error('Log handler failed:', handlerError);
      }
    });
  }

  error(message: string, context?: LogContext, error?: Error, module?: string): void {
    this.log(LogLevel.ERROR, message, context, error, module);
  }

  warn(message: string, context?: LogContext, module?: string): void {
    this.log(LogLevel.WARN, message, context, undefined, module);
  }

  info(message: string, context?: LogContext, module?: string): void {
    this.log(LogLevel.INFO, message, context, undefined, module);
  }

  debug(message: string, context?: LogContext, module?: string): void {
    this.log(LogLevel.DEBUG, message, context, undefined, module);
  }

  trace(message: string, context?: LogContext, module?: string): void {
    this.log(LogLevel.TRACE, message, context, undefined, module);
  }

  // Specialized logging methods for common scenarios
  logApiRequest(method: string, path: string, context: LogContext): void {
    this.info(`API ${method} ${path}`, {
      ...context,
      type: 'api_request'
    }, 'api');
  }

  logApiResponse(method: string, path: string, statusCode: number, duration: number, context: LogContext): void {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API ${method} ${path} - ${statusCode} (${duration}ms)`, {
      ...context,
      statusCode,
      duration,
      type: 'api_response'
    }, undefined, 'api');
  }

  logCliExecution(operation: string, repositoryPath: string, context: LogContext): void {
    this.info(`CLI execution: ${operation}`, {
      ...context,
      operation,
      repositoryPath,
      type: 'cli_execution'
    }, 'cli');
  }

  logCliResult(operation: string, success: boolean, duration: number, context: LogContext, error?: Error): void {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    this.log(level, `CLI ${operation} ${success ? 'completed' : 'failed'} (${duration}ms)`, {
      ...context,
      operation,
      success,
      duration,
      type: 'cli_result'
    }, error, 'cli');
  }

  logParsingError(operation: string, rawOutput: string, context: LogContext, error: Error): void {
    this.error(`Parsing failed for ${operation}`, {
      ...context,
      operation,
      outputLength: rawOutput.length,
      outputPreview: rawOutput.substring(0, 200),
      type: 'parsing_error'
    }, error, 'parser');
  }

  logSecurityEvent(event: string, context: LogContext, severity: 'low' | 'medium' | 'high' = 'medium'): void {
    const level = severity === 'high' ? LogLevel.ERROR : LogLevel.WARN;
    this.log(level, `Security event: ${event}`, {
      ...context,
      severity,
      type: 'security_event'
    }, undefined, 'security');
  }
}

// Log Handler Interface
export interface LogHandler {
  handle(entry: LogEntry): void;
}

// Console Log Handler
export class ConsoleLogHandler implements LogHandler {
  handle(entry: LogEntry): void {
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

// File Log Handler
export class FileLogHandler implements LogHandler {
  private logFile: string;

  constructor(logFile: string = './logs/taskmaster.log') {
    this.logFile = logFile;
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    const fs = require('fs');
    const path = require('path');
    const logDir = path.dirname(this.logFile);
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  handle(entry: LogEntry): void {
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
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
}

// Export singleton instance
export const logger = TaskMasterLogger.getInstance();