/**
 * Bootstrap Logger
 * 
 * A simple logger for use during application startup before the main logger is initialized.
 * This is used in configuration files that are loaded very early in the application lifecycle.
 */

interface BootstrapLogger {
  error: (message: string, ...args: any[]) => void
  warn: (message: string, ...args: any[]) => void
  info: (message: string, ...args: any[]) => void
  log: (message: string, ...args: any[]) => void
}

const createBootstrapLogger = (module: string): BootstrapLogger => {
  const formatMessage = (level: string, message: string): string => {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level}] [${module}] ${message}`
  }

  return {
    error: (message: string, ...args: any[]) => {
      console.error(formatMessage('ERROR', message), ...args)
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(formatMessage('WARN', message), ...args)
    },
    info: (message: string, ...args: any[]) => {
      console.info(formatMessage('INFO', message), ...args)
    },
    log: (message: string, ...args: any[]) => {
      console.log(formatMessage('INFO', message), ...args)
    }
  }
}

export const bootstrapLogger = createBootstrapLogger('Bootstrap')
export const configLogger = createBootstrapLogger('Config')
export const securityLogger = createBootstrapLogger('Security')
export const sslLogger = createBootstrapLogger('SSL')

export default createBootstrapLogger