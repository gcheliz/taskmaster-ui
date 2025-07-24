/**
 * Frontend Logger Utility
 * 
 * Provides environment-aware logging for the frontend application.
 * In production, logs are disabled to avoid exposing sensitive information.
 * In development, logs are color-coded and formatted for easy debugging.
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace'
type LogContext = Record<string, unknown>

interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  prefix?: string
}

class FrontendLogger {
  private config: LoggerConfig
  private levels: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4
  }

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      enabled: import.meta.env.MODE !== 'production',
      level: (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info',
      prefix: '[TaskMaster]',
      ...config
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false
    return this.levels[level] <= this.levels[this.config.level]
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString().split('T')[1].replace('Z', '')
    const prefix = this.config.prefix || ''
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `${prefix} ${timestamp} [${level.toUpperCase()}] ${message}${contextStr}`
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog('error')) return
    
    const formattedMessage = this.formatMessage('error', message, context)
    console.error(formattedMessage)
    
    if (error) {
      if (error instanceof Error) {
        console.error('Stack:', error.stack)
      } else {
        console.error('Error details:', error)
      }
    }

    // In production, we might want to send errors to a monitoring service
    if (import.meta.env.MODE === 'production' && error) {
      // TODO: Send to error monitoring service (e.g., Sentry)
    }
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return
    console.warn(this.formatMessage('warn', message, context))
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return
    console.info(this.formatMessage('info', message, context))
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return
    console.debug(this.formatMessage('debug', message, context))
  }

  trace(message: string, context?: LogContext): void {
    if (!this.shouldLog('trace')) return
    console.trace(this.formatMessage('trace', message, context))
  }

  // Specialized logging methods
  
  logApiCall(method: string, url: string, data?: unknown): void {
    this.debug(`API ${method} ${url}`, { data })
  }

  logApiResponse(method: string, url: string, status: number, duration: number): void {
    const level = status >= 400 ? 'error' : 'debug'
    this[level](`API ${method} ${url} - ${status} (${duration}ms)`)
  }

  logComponentLifecycle(component: string, event: 'mount' | 'unmount' | 'update'): void {
    this.trace(`Component ${component} ${event}`)
  }

  logUserAction(action: string, details?: LogContext): void {
    this.info(`User action: ${action}`, details)
  }

  logPerformance(operation: string, duration: number, details?: LogContext): void {
    const level = duration > 1000 ? 'warn' : 'debug'
    this[level](`Performance: ${operation} took ${duration}ms`, details)
  }

  logWebSocketEvent(event: string, data?: unknown): void {
    this.debug(`WebSocket: ${event}`, { data })
  }

  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high', details?: LogContext): void {
    const level = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info'
    this[level](`Security: ${event}`, { severity, ...details })
  }

  // Create a child logger with additional context
  createChild(prefix: string): FrontendLogger {
    return new FrontendLogger({
      ...this.config,
      prefix: `${this.config.prefix} [${prefix}]`
    })
  }

  // Group related logs (useful in development)
  group(label: string, fn: () => void): void {
    if (!this.shouldLog('debug')) return
    
    if (console.group) {
      console.group(this.formatMessage('debug', label))
      try {
        fn()
      } finally {
        console.groupEnd()
      }
    } else {
      this.debug(`--- ${label} START ---`)
      fn()
      this.debug(`--- ${label} END ---`)
    }
  }

  // Time an operation
  async time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      this.logPerformance(label, duration)
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.error(`${label} failed after ${duration}ms`, error)
      throw error
    }
  }
}

// Create and export a default logger instance
export const logger = new FrontendLogger()

// Export the class for creating custom loggers
export { FrontendLogger }

// Convenience exports for common use cases
export const apiLogger = logger.createChild('API')
export const componentLogger = logger.createChild('Component')
export const serviceLogger = logger.createChild('Service')
export const securityLogger = logger.createChild('Security')