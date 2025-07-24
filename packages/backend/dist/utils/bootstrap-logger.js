"use strict";
/**
 * Bootstrap Logger
 *
 * A simple logger for use during application startup before the main logger is initialized.
 * This is used in configuration files that are loaded very early in the application lifecycle.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sslLogger = exports.securityLogger = exports.configLogger = exports.bootstrapLogger = void 0;
const createBootstrapLogger = (module) => {
    const formatMessage = (level, message) => {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] [${module}] ${message}`;
    };
    return {
        error: (message, ...args) => {
            console.error(formatMessage('ERROR', message), ...args);
        },
        warn: (message, ...args) => {
            console.warn(formatMessage('WARN', message), ...args);
        },
        info: (message, ...args) => {
            console.info(formatMessage('INFO', message), ...args);
        },
        log: (message, ...args) => {
            console.log(formatMessage('INFO', message), ...args);
        }
    };
};
exports.bootstrapLogger = createBootstrapLogger('Bootstrap');
exports.configLogger = createBootstrapLogger('Config');
exports.securityLogger = createBootstrapLogger('Security');
exports.sslLogger = createBootstrapLogger('SSL');
exports.default = createBootstrapLogger;
//# sourceMappingURL=bootstrap-logger.js.map