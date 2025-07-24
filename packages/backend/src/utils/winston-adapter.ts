import winston from 'winston'
import { logger as taskMasterLogger, LogContext } from './logger'

// Create a Winston logger that delegates to our existing TaskMaster logger
const winstonLogger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      log(info, callback) {
        const { level, message, ...metadata } = info
        
        // Map Winston levels to TaskMaster logger methods
        switch (level) {
          case 'error':
            taskMasterLogger.error(message, metadata, metadata.error, metadata.module)
            break
          case 'warn':
            taskMasterLogger.warn(message, metadata, metadata.module)
            break
          case 'info':
            taskMasterLogger.info(message, metadata, metadata.module)
            break
          case 'debug':
            taskMasterLogger.debug(message, metadata, metadata.module)
            break
          default:
            taskMasterLogger.trace(message, metadata, metadata.module)
        }
        
        if (callback) {
          callback()
        }
      }
    })
  ]
})

// Export a logger object that matches console API but uses our logger
export const logger = {
  error: (message: string, ...args: unknown[]) => {
    const error = args.find(arg => arg instanceof Error) as Error | undefined
    const metadata = args.filter(arg => !(arg instanceof Error))
    taskMasterLogger.error(message, metadata[0] as LogContext | undefined, error)
  },
  
  warn: (message: string, ...args: unknown[]) => {
    taskMasterLogger.warn(message, args[0] as LogContext | undefined)
  },
  
  log: (message: string, ...args: unknown[]) => {
    taskMasterLogger.info(message, args[0] as LogContext | undefined)
  },
  
  info: (message: string, ...args: unknown[]) => {
    taskMasterLogger.info(message, args[0] as LogContext | undefined)
  },
  
  debug: (message: string, ...args: unknown[]) => {
    taskMasterLogger.debug(message, args[0] as LogContext | undefined)
  },
  
  trace: (message: string, ...args: unknown[]) => {
    taskMasterLogger.trace(message, args[0] as LogContext | undefined)
  }
}

// Also export the winston logger for libraries that expect it
export default winstonLogger