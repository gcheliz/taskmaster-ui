"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const logger_1 = require("./logger");
// Create a Winston logger that delegates to our existing TaskMaster logger
const winstonLogger = winston_1.default.createLogger({
    transports: [
        new winston_1.default.transports.Console({
            log(info, callback) {
                const { level, message, ...metadata } = info;
                // Map Winston levels to TaskMaster logger methods
                switch (level) {
                    case 'error':
                        logger_1.logger.error(message, metadata, metadata.error, metadata.module);
                        break;
                    case 'warn':
                        logger_1.logger.warn(message, metadata, metadata.module);
                        break;
                    case 'info':
                        logger_1.logger.info(message, metadata, metadata.module);
                        break;
                    case 'debug':
                        logger_1.logger.debug(message, metadata, metadata.module);
                        break;
                    default:
                        logger_1.logger.trace(message, metadata, metadata.module);
                }
                if (callback) {
                    callback();
                }
            }
        })
    ]
});
// Export a logger object that matches console API but uses our logger
exports.logger = {
    error: (message, ...args) => {
        const error = args.find(arg => arg instanceof Error);
        const metadata = args.filter(arg => !(arg instanceof Error));
        logger_1.logger.error(message, metadata[0], error);
    },
    warn: (message, ...args) => {
        logger_1.logger.warn(message, args[0]);
    },
    log: (message, ...args) => {
        logger_1.logger.info(message, args[0]);
    },
    info: (message, ...args) => {
        logger_1.logger.info(message, args[0]);
    },
    debug: (message, ...args) => {
        logger_1.logger.debug(message, args[0]);
    },
    trace: (message, ...args) => {
        logger_1.logger.trace(message, args[0]);
    }
};
// Also export the winston logger for libraries that expect it
exports.default = winstonLogger;
//# sourceMappingURL=winston-adapter.js.map