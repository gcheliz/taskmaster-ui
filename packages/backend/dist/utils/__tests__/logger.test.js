"use strict";
// Comprehensive Logger Tests
// Tests logging functionality, handlers, and specialized methods
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logger");
describe('TaskMasterLogger', () => {
    let logger;
    let mockHandler;
    beforeEach(() => {
        // Create fresh logger instance for each test
        logger = new logger_1.TaskMasterLogger();
        // Create mock handler
        mockHandler = {
            handle: jest.fn()
        };
        // Clear any existing handlers and add our mock
        logger.logHandlers = [mockHandler];
    });
    describe('Log Level Control', () => {
        it('should respect log level settings', () => {
            logger.setLogLevel(logger_1.LogLevel.WARN);
            logger.debug('Debug message');
            logger.info('Info message');
            logger.warn('Warning message');
            logger.error('Error message');
            expect(mockHandler.handle).toHaveBeenCalledTimes(2); // Only warn and error
            const calls = mockHandler.handle.mock.calls;
            expect(calls[0][0].level).toBe(logger_1.LogLevel.WARN);
            expect(calls[1][0].level).toBe(logger_1.LogLevel.ERROR);
        });
        it('should log all levels when set to TRACE', () => {
            logger.setLogLevel(logger_1.LogLevel.TRACE);
            logger.trace('Trace message');
            logger.debug('Debug message');
            logger.info('Info message');
            logger.warn('Warning message');
            logger.error('Error message');
            expect(mockHandler.handle).toHaveBeenCalledTimes(5);
        });
        it('should only log errors when set to ERROR', () => {
            logger.setLogLevel(logger_1.LogLevel.ERROR);
            logger.debug('Debug message');
            logger.info('Info message');
            logger.warn('Warning message');
            logger.error('Error message');
            expect(mockHandler.handle).toHaveBeenCalledTimes(1);
            expect(mockHandler.handle.mock.calls[0][0].level).toBe(logger_1.LogLevel.ERROR);
        });
    });
    describe('Basic Logging Methods', () => {
        beforeEach(() => {
            logger.setLogLevel(logger_1.LogLevel.TRACE); // Enable all logs
        });
        it('should log error messages with error objects', () => {
            const error = new Error('Test error');
            const context = { requestId: 'req-123' };
            logger.error('Something went wrong', context, error, 'test-module');
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.objectContaining({
                level: logger_1.LogLevel.ERROR,
                message: 'Something went wrong',
                context: expect.objectContaining(context),
                error,
                module: 'test-module'
            }));
        });
        it('should log warning messages', () => {
            const context = { operation: 'test' };
            logger.warn('Warning message', context, 'warn-module');
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.objectContaining({
                level: logger_1.LogLevel.WARN,
                message: 'Warning message',
                context: expect.objectContaining(context),
                module: 'warn-module'
            }));
        });
        it('should log info messages', () => {
            logger.info('Info message', { test: true });
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.objectContaining({
                level: logger_1.LogLevel.INFO,
                message: 'Info message',
                context: expect.objectContaining({ test: true })
            }));
        });
        it('should log debug messages', () => {
            logger.debug('Debug message');
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.objectContaining({
                level: logger_1.LogLevel.DEBUG,
                message: 'Debug message'
            }));
        });
        it('should log trace messages', () => {
            logger.trace('Trace message');
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.objectContaining({
                level: logger_1.LogLevel.TRACE,
                message: 'Trace message'
            }));
        });
    });
    describe('Specialized Logging Methods', () => {
        beforeEach(() => {
            logger.setLogLevel(logger_1.LogLevel.TRACE);
        });
        it('should log API requests', () => {
            const context = { requestId: 'req-123', userId: 'user-456' };
            logger.logApiRequest('POST', '/api/tasks', context);
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.objectContaining({
                level: logger_1.LogLevel.INFO,
                message: 'API POST /api/tasks',
                context: expect.objectContaining({
                    ...context,
                    type: 'api_request'
                }),
                module: 'api'
            }));
        });
        it('should log API responses with appropriate log level', () => {
            const context = { requestId: 'req-123' };
            // Successful response
            logger.logApiResponse('GET', '/api/tasks', 200, 150, context);
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.objectContaining({
                level: logger_1.LogLevel.INFO,
                message: 'API GET /api/tasks - 200 (150ms)',
                context: expect.objectContaining({
                    statusCode: 200,
                    duration: 150,
                    type: 'api_response'
                })
            }));
            mockHandler.handle.mockClear();
            // Error response
            logger.logApiResponse('POST', '/api/tasks', 500, 300, context);
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.objectContaining({
                level: logger_1.LogLevel.ERROR,
                message: 'API POST /api/tasks - 500 (300ms)'
            }));
        });
        it('should log CLI execution start', () => {
            const context = { requestId: 'req-123', repositoryPath: '/test/repo' };
            logger.logCliExecution('list', '/test/repo', context);
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.objectContaining({
                level: logger_1.LogLevel.INFO,
                message: 'CLI execution: list',
                context: expect.objectContaining({
                    operation: 'list',
                    repositoryPath: '/test/repo',
                    type: 'cli_execution'
                }),
                module: 'cli'
            }));
        });
        it('should log CLI results with appropriate level', () => {
            const context = { requestId: 'req-123' };
            // Successful CLI result
            logger.logCliResult('list', true, 1500, context);
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.objectContaining({
                level: logger_1.LogLevel.INFO,
                message: 'CLI list completed (1500ms)',
                context: expect.objectContaining({
                    operation: 'list',
                    success: true,
                    duration: 1500,
                    type: 'cli_result'
                })
            }));
            mockHandler.handle.mockClear();
            // Failed CLI result
            const error = new Error('CLI failed');
            logger.logCliResult('list', false, 500, context, error);
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.objectContaining({
                level: logger_1.LogLevel.ERROR,
                message: 'CLI list failed (500ms)',
                error
            }));
        });
        it('should log parsing errors', () => {
            const context = { requestId: 'req-123' };
            const error = new Error('JSON parse error');
            const rawOutput = 'invalid json output';
            logger.logParsingError('list', rawOutput, context, error);
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.objectContaining({
                level: logger_1.LogLevel.ERROR,
                message: 'Parsing failed for list',
                context: expect.objectContaining({
                    operation: 'list',
                    outputLength: rawOutput.length,
                    outputPreview: rawOutput.substring(0, 200),
                    type: 'parsing_error'
                }),
                error,
                module: 'parser'
            }));
        });
        it('should log security events with appropriate severity', () => {
            const context = { requestId: 'req-123', suspiciousIp: '192.168.1.100' };
            // Low severity
            logger.logSecurityEvent('Failed login attempt', context, 'low');
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.objectContaining({
                level: logger_1.LogLevel.WARN,
                message: 'Security event: Failed login attempt',
                context: expect.objectContaining({
                    severity: 'low',
                    type: 'security_event'
                })
            }));
            mockHandler.handle.mockClear();
            // High severity
            logger.logSecurityEvent('Potential attack detected', context, 'high');
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.objectContaining({
                level: logger_1.LogLevel.ERROR,
                message: 'Security event: Potential attack detected'
            }));
        });
    });
    describe('Context Enhancement', () => {
        beforeEach(() => {
            logger.setLogLevel(logger_1.LogLevel.TRACE);
        });
        it('should add timestamp to context', () => {
            const context = { requestId: 'req-123' };
            logger.info('Test message', context);
            const loggedContext = mockHandler.handle.mock.calls[0][0].context;
            expect(loggedContext).toHaveProperty('timestamp');
            expect(loggedContext).toHaveProperty('requestId', 'req-123');
        });
        it('should handle undefined context gracefully', () => {
            logger.info('Test message without context');
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Test message without context',
                context: expect.objectContaining({
                    timestamp: expect.any(String)
                })
            }));
        });
    });
    describe('Handler Management', () => {
        it('should support multiple handlers', () => {
            const handler2 = { handle: jest.fn() };
            logger.addHandler(handler2);
            logger.info('Test message');
            expect(mockHandler.handle).toHaveBeenCalled();
            expect(handler2.handle).toHaveBeenCalled();
        });
        it('should handle handler errors gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockHandler.handle.mockImplementation(() => {
                throw new Error('Handler failed');
            });
            // Should not throw
            expect(() => {
                logger.info('Test message');
            }).not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith('Log handler failed:', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });
    describe('Log Entry Structure', () => {
        beforeEach(() => {
            logger.setLogLevel(logger_1.LogLevel.TRACE);
        });
        it('should create proper log entry structure', () => {
            const context = { requestId: 'req-123' };
            const error = new Error('Test error');
            logger.error('Error message', context, error, 'test-module');
            const logEntry = mockHandler.handle.mock.calls[0][0];
            expect(logEntry).toMatchObject({
                level: logger_1.LogLevel.ERROR,
                message: 'Error message',
                context: expect.objectContaining(context),
                error,
                timestamp: expect.any(String),
                module: 'test-module'
            });
            // Verify timestamp is valid ISO string
            expect(new Date(logEntry.timestamp).toISOString()).toBe(logEntry.timestamp);
        });
    });
});
describe('ConsoleLogHandler', () => {
    let handler;
    let consoleSpy;
    beforeEach(() => {
        handler = new logger_1.ConsoleLogHandler();
        // Mock all console methods
        consoleSpy = {
            error: jest.spyOn(console, 'error').mockImplementation(),
            warn: jest.spyOn(console, 'warn').mockImplementation(),
            info: jest.spyOn(console, 'info').mockImplementation(),
            debug: jest.spyOn(console, 'debug').mockImplementation(),
            trace: jest.spyOn(console, 'trace').mockImplementation(),
            log: jest.spyOn(console, 'log').mockImplementation()
        };
    });
    afterEach(() => {
        Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    });
    it('should use appropriate console method for each log level', () => {
        const baseEntry = {
            message: 'Test message',
            timestamp: new Date().toISOString(),
            module: 'test'
        };
        // Test each log level
        handler.handle({ ...baseEntry, level: logger_1.LogLevel.ERROR });
        expect(consoleSpy.error).toHaveBeenCalled();
        handler.handle({ ...baseEntry, level: logger_1.LogLevel.WARN });
        expect(consoleSpy.warn).toHaveBeenCalled();
        handler.handle({ ...baseEntry, level: logger_1.LogLevel.INFO });
        expect(consoleSpy.info).toHaveBeenCalled();
        handler.handle({ ...baseEntry, level: logger_1.LogLevel.DEBUG });
        expect(consoleSpy.debug).toHaveBeenCalled();
        handler.handle({ ...baseEntry, level: logger_1.LogLevel.TRACE });
        expect(consoleSpy.trace).toHaveBeenCalled();
    });
    it('should format log messages properly', () => {
        const entry = {
            level: logger_1.LogLevel.INFO,
            message: 'Test message',
            timestamp: '2023-01-01T00:00:00.000Z',
            module: 'test',
            context: { requestId: 'req-123' }
        };
        handler.handle(entry);
        const loggedMessage = consoleSpy.info.mock.calls[0][1];
        expect(loggedMessage).toContain('Test message');
        expect(loggedMessage).toContain('2023-01-01T00:00:00.000Z');
        expect(loggedMessage).toContain('INFO');
        expect(loggedMessage).toContain('test');
        expect(loggedMessage).toContain('req-123');
    });
    it('should handle entries without context', () => {
        const entry = {
            level: logger_1.LogLevel.INFO,
            message: 'Simple message',
            timestamp: new Date().toISOString(),
            module: 'test'
        };
        expect(() => {
            handler.handle(entry);
        }).not.toThrow();
        expect(consoleSpy.info).toHaveBeenCalled();
    });
    it('should display error stack traces', () => {
        const error = new Error('Test error');
        const entry = {
            level: logger_1.LogLevel.ERROR,
            message: 'Error occurred',
            timestamp: new Date().toISOString(),
            module: 'test',
            error
        };
        handler.handle(entry);
        expect(consoleSpy.error).toHaveBeenCalledTimes(2);
        const secondCall = consoleSpy.error.mock.calls[1];
        expect(secondCall[1]).toContain('Test error');
    });
});
//# sourceMappingURL=logger.test.js.map