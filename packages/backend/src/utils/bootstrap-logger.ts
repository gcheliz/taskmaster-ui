/**
 * Bootstrap Logger
 * 
 * A simple logger for use during application startup before the main logger is initialized.
 * This is used in configuration files that are loaded very early in the application lifecycle.
 */

interface BootstrapLogger {
  error: (message: string, ...args: unknown[]) => void
  warn: (message: string, ...args: unknown[]) => void
  info: (message: string, ...args: unknown[]) => void
  log: (message: string, ...args: unknown[]) => void
}

const createBootstrapLogger = (module: string): BootstrapLogger => {
  const formatMessage = (level: string, message: string): string => {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level}] [${module}] ${message}`
  }

  return {
    error: (message: string, ...args: unknown[]) => {
      console.error(formatMessage('ERROR', message), ...args)
    },
    warn: (message: string, ...args: unknown[]) => {
      console.warn(formatMessage('WARN', message), ...args)
    },
    info: (message: string, ...args: unknown[]) => {
      console.info(formatMessage('INFO', message), ...args)
    },
    log: (message: string, ...args: unknown[]) => {
      console.log(formatMessage('INFO', message), ...args)
    }
  }
}

export const bootstrapLogger = createBootstrapLogger('Bootstrap')
export const configLogger = createBootstrapLogger('Config')
export const securityLogger = createBootstrapLogger('Security')
export const sslLogger = createBootstrapLogger('SSL')

export default createBootstrapLogger