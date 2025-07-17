"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskMasterService = exports.TaskMasterService = void 0;
const events_1 = require("events");
const commandExecutor_1 = require("./commandExecutor");
const taskMasterCommandBuilder_1 = require("./taskMasterCommandBuilder");
const taskMasterOutputParser_1 = require("./taskMasterOutputParser");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../utils/errorHandler");
/**
 * Facade Pattern Implementation for TaskMaster CLI Service
 * Demonstrates: Facade pattern, dependency injection, event-driven architecture
 */
class TaskMasterService extends events_1.EventEmitter {
    constructor(executor, builder, parser, config) {
        super();
        // Dependency injection with defaults (IoC pattern)
        this.commandExecutor = executor || commandExecutor_1.commandExecutor;
        this.commandBuilder = builder || taskMasterCommandBuilder_1.taskMasterCommandBuilder;
        this.outputParser = parser || taskMasterOutputParser_1.taskMasterOutputParser;
        this.defaultConfig = config || {
            timeout: 60000, // 60 seconds
            verbose: false
        };
        // Set up event forwarding from command executor
        this.commandExecutor.on('progress', (processId, progress) => {
            this.emit('commandProgress', processId, progress);
        });
    }
    /**
     * Initialize a new TaskMaster project
     */
    async initProject(path, options = {}) {
        const startTime = Date.now();
        const requestId = this.generateRequestId();
        const context = {
            requestId,
            repositoryPath: path,
            operation: 'init',
            prdFile: options.prdFile
        };
        logger_1.logger.info('Initializing TaskMaster project', context, 'service');
        try {
            // Validate inputs
            this.validateRepositoryPath(path, context);
            this.emit('operationStart', 'initProject', { path, options });
            logger_1.logger.logCliExecution('init', path, context);
            const command = this.commandBuilder.buildCommand('init', {
                prdFile: options.prdFile
            });
            logger_1.logger.debug('Built init command', { ...context, command: command.command }, 'service');
            const result = await this.commandExecutor.executeCommand(command.command, command.args, {
                cwd: path,
                timeout: this.defaultConfig.timeout
            });
            const duration = Date.now() - startTime;
            if (!result.success) {
                const error = new Error(result.stderr || 'Initialization failed');
                const taskMasterError = errorHandler_1.errorHandler.handleCliError(error, {
                    ...context,
                    stdout: result.stdout,
                    stderr: result.stderr,
                    exitCode: result.exitCode
                });
                logger_1.logger.logCliResult('init', false, duration, context, taskMasterError);
                throw taskMasterError;
            }
            // Parse output with error handling
            let projectInfo = null;
            try {
                projectInfo = this.outputParser.extractProjectInfo(result.stdout);
            }
            catch (parseError) {
                const taskMasterError = errorHandler_1.errorHandler.handleParsingError(result.stdout, 'init', parseError, context);
                logger_1.logger.warn('Failed to parse init output, using defaults', context, 'service');
                // Continue with default project info instead of failing
            }
            const finalProjectInfo = projectInfo || {
                name: 'TaskMaster Project',
                path,
                taskCount: 0,
                completedTasks: 0,
                lastUpdated: new Date()
            };
            const taskMasterResult = {
                success: true,
                data: finalProjectInfo,
                output: result.stdout,
                error: result.stderr,
                exitCode: result.exitCode || 0,
                duration,
                command: `${command.command} ${command.args.join(' ')}`,
                timestamp: new Date()
            };
            logger_1.logger.logCliResult('init', true, duration, context);
            this.emit('operationComplete', 'initProject', taskMasterResult);
            return taskMasterResult;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const taskMasterError = error instanceof errorHandler_1.TaskMasterError ?
                error :
                errorHandler_1.errorHandler.normalizeError(error, context);
            logger_1.logger.logCliResult('init', false, duration, context, taskMasterError);
            const errorResult = this.createErrorResult(taskMasterError, 'initProject', path, startTime);
            this.emit('operationError', 'initProject', errorResult);
            throw taskMasterError;
        }
    }
    /**
     * Get project status and overview
     */
    async getProjectStatus(path) {
        const startTime = Date.now();
        try {
            this.emit('operationStart', 'getProjectStatus', { path });
            const command = this.commandBuilder.buildCommand('list', {
                tag: this.extractTagFromPath(path)
            });
            const result = await this.commandExecutor.executeCommand(command.command, command.args, {
                cwd: path,
                timeout: this.defaultConfig.timeout
            });
            const projectInfo = this.outputParser.extractProjectInfo(result.stdout) || {
                name: 'TaskMaster Project',
                path,
                taskCount: 0,
                completedTasks: 0,
                lastUpdated: new Date()
            };
            // Enhance project info with path
            projectInfo.path = path;
            const taskMasterResult = {
                success: result.success,
                data: projectInfo,
                output: result.stdout,
                error: result.stderr,
                exitCode: result.exitCode || 0,
                duration: Date.now() - startTime,
                command: `${command.command} ${command.args.join(' ')}`,
                timestamp: new Date()
            };
            this.emit('operationComplete', 'getProjectStatus', taskMasterResult);
            return taskMasterResult;
        }
        catch (error) {
            const errorResult = this.createErrorResult(error, 'getProjectStatus', path, startTime);
            this.emit('operationError', 'getProjectStatus', errorResult);
            throw error;
        }
    }
    /**
     * List tasks with filtering options
     */
    async listTasks(path, options = {}) {
        const startTime = Date.now();
        try {
            this.emit('operationStart', 'listTasks', { path, options });
            const command = this.commandBuilder.buildCommand('list', {
                status: options.status,
                tag: options.tag || this.extractTagFromPath(path)
            });
            const result = await this.commandExecutor.executeCommand(command.command, command.args, {
                cwd: path,
                timeout: this.defaultConfig.timeout
            });
            const parsedOutput = this.outputParser.parseOutput(result.stdout, 'list');
            const tasks = parsedOutput
                .filter(p => p.metadata?.type === 'task')
                .map(p => p.data);
            const taskMasterResult = {
                success: result.success,
                data: tasks,
                output: result.stdout,
                error: result.stderr,
                exitCode: result.exitCode || 0,
                duration: Date.now() - startTime,
                command: `${command.command} ${command.args.join(' ')}`,
                timestamp: new Date()
            };
            this.emit('operationComplete', 'listTasks', taskMasterResult);
            return taskMasterResult;
        }
        catch (error) {
            const errorResult = this.createErrorResult(error, 'listTasks', path, startTime);
            this.emit('operationError', 'listTasks', errorResult);
            throw error;
        }
    }
    /**
     * Get detailed information about a specific task
     */
    async getTask(path, taskId, options = {}) {
        const startTime = Date.now();
        try {
            this.emit('operationStart', 'getTask', { path, taskId, options });
            const command = this.commandBuilder.buildCommand('show', {
                id: taskId,
                tag: options.tag || this.extractTagFromPath(path)
            });
            const result = await this.commandExecutor.executeCommand(command.command, command.args, {
                cwd: path,
                timeout: this.defaultConfig.timeout
            });
            const taskInfo = this.outputParser.extractTaskInfo(result.stdout);
            if (!taskInfo) {
                throw new Error(`Task ${taskId} not found or could not be parsed`);
            }
            const taskMasterResult = {
                success: result.success,
                data: taskInfo,
                output: result.stdout,
                error: result.stderr,
                exitCode: result.exitCode || 0,
                duration: Date.now() - startTime,
                command: `${command.command} ${command.args.join(' ')}`,
                timestamp: new Date()
            };
            this.emit('operationComplete', 'getTask', taskMasterResult);
            return taskMasterResult;
        }
        catch (error) {
            const errorResult = this.createErrorResult(error, 'getTask', `${path}:${taskId}`, startTime);
            this.emit('operationError', 'getTask', errorResult);
            throw error;
        }
    }
    /**
     * Update task status
     */
    async updateTaskStatus(path, taskId, status, options = {}) {
        const startTime = Date.now();
        try {
            this.emit('operationStart', 'updateTaskStatus', { path, taskId, status, options });
            const command = this.commandBuilder.buildCommand('set-status', {
                id: taskId,
                status,
                tag: options.tag || this.extractTagFromPath(path)
            });
            const result = await this.commandExecutor.executeCommand(command.command, command.args, {
                cwd: path,
                timeout: this.defaultConfig.timeout
            });
            // Get updated task info
            const updatedTask = await this.getTask(path, taskId, options);
            const taskMasterResult = {
                success: result.success,
                data: updatedTask.data,
                output: result.stdout,
                error: result.stderr,
                exitCode: result.exitCode || 0,
                duration: Date.now() - startTime,
                command: `${command.command} ${command.args.join(' ')}`,
                timestamp: new Date()
            };
            this.emit('operationComplete', 'updateTaskStatus', taskMasterResult);
            return taskMasterResult;
        }
        catch (error) {
            const errorResult = this.createErrorResult(error, 'updateTaskStatus', `${path}:${taskId}`, startTime);
            this.emit('operationError', 'updateTaskStatus', errorResult);
            throw error;
        }
    }
    /**
     * Get next available task
     */
    async getNextTask(path, options = {}) {
        const startTime = Date.now();
        try {
            this.emit('operationStart', 'getNextTask', { path, options });
            const command = this.commandBuilder.buildCommand('next', {
                tag: options.tag || this.extractTagFromPath(path)
            });
            const result = await this.commandExecutor.executeCommand(command.command, command.args, {
                cwd: path,
                timeout: this.defaultConfig.timeout
            });
            const taskInfo = this.outputParser.extractTaskInfo(result.stdout);
            const taskMasterResult = {
                success: result.success,
                data: taskInfo,
                output: result.stdout,
                error: result.stderr,
                exitCode: result.exitCode || 0,
                duration: Date.now() - startTime,
                command: `${command.command} ${command.args.join(' ')}`,
                timestamp: new Date()
            };
            this.emit('operationComplete', 'getNextTask', taskMasterResult);
            return taskMasterResult;
        }
        catch (error) {
            const errorResult = this.createErrorResult(error, 'getNextTask', path, startTime);
            this.emit('operationError', 'getNextTask', errorResult);
            throw error;
        }
    }
    // Additional methods for advanced operations...
    async parsePRD(path, prdFile, options = {}) {
        return this.executeGenericCommand('parse-prd', path, {
            file: prdFile,
            append: options.append
        });
    }
    async expandTask(path, taskId, options = {}) {
        return this.executeGenericCommand('expand', path, {
            id: taskId,
            research: options.research,
            force: options.force,
            tag: options.tag || this.extractTagFromPath(path)
        });
    }
    async analyzeComplexity(path, options = {}) {
        return this.executeGenericCommand('analyze-complexity', path, {
            from: options.from,
            to: options.to,
            research: options.research,
            tag: options.tag || this.extractTagFromPath(path)
        });
    }
    async validateDependencies(path, options = {}) {
        return this.executeGenericCommand('validate-dependencies', path, {
            tag: options.tag || this.extractTagFromPath(path)
        });
    }
    async generateReport(path, type, options = {}) {
        const command = type === 'complexity' ? 'complexity-report' : 'list';
        return this.executeGenericCommand(command, path, {
            tag: options.tag || this.extractTagFromPath(path)
        });
    }
    /**
     * Generic command execution helper
     */
    async executeGenericCommand(operation, path, args) {
        const startTime = Date.now();
        try {
            this.emit('operationStart', operation, { path, args });
            const command = this.commandBuilder.buildCommand(operation, args);
            const result = await this.commandExecutor.executeCommand(command.command, command.args, {
                cwd: path,
                timeout: this.defaultConfig.timeout
            });
            const taskMasterResult = {
                success: result.success,
                output: result.stdout,
                error: result.stderr,
                exitCode: result.exitCode || 0,
                duration: Date.now() - startTime,
                command: `${command.command} ${command.args.join(' ')}`,
                timestamp: new Date()
            };
            this.emit('operationComplete', operation, taskMasterResult);
            return taskMasterResult;
        }
        catch (error) {
            const errorResult = this.createErrorResult(error, operation, path, startTime);
            this.emit('operationError', operation, errorResult);
            throw error;
        }
    }
    /**
     * Helper to create error results
     */
    createErrorResult(error, operation, context, startTime) {
        const taskMasterError = error instanceof errorHandler_1.TaskMasterError ?
            error :
            errorHandler_1.errorHandler.normalizeError(error, { operation, context });
        return {
            success: false,
            error: taskMasterError.userMessage,
            output: '',
            exitCode: 1,
            duration: Date.now() - startTime,
            command: operation,
            timestamp: new Date()
        };
    }
    /**
     * Generate unique request ID for tracking
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Validate repository path
     */
    validateRepositoryPath(path, context) {
        if (!path || typeof path !== 'string') {
            throw errorHandler_1.errorHandler.handleValidationError('repositoryPath', path, 'Repository path is required and must be a string', context);
        }
        if (path.trim().length === 0) {
            throw errorHandler_1.errorHandler.handleValidationError('repositoryPath', path, 'Repository path cannot be empty', context);
        }
        // Security check - prevent directory traversal
        if (path.includes('..') || path.includes('~')) {
            throw errorHandler_1.errorHandler.handleSecurityError('Directory traversal attempt detected', { ...context, suspiciousPath: path }, 'high');
        }
        // Check for reasonable path length
        if (path.length > 500) {
            throw errorHandler_1.errorHandler.handleValidationError('repositoryPath', path, 'Repository path is too long (max 500 characters)', context);
        }
    }
    /**
     * Validate operation name
     */
    validateOperation(operation, context) {
        const validOperations = [
            'init', 'list', 'show', 'set-status', 'next', 'parse-prd',
            'expand', 'analyze-complexity', 'validate-dependencies'
        ];
        if (!validOperations.includes(operation)) {
            throw errorHandler_1.errorHandler.handleValidationError('operation', operation, `Invalid operation. Valid operations: ${validOperations.join(', ')}`, context);
        }
    }
    /**
     * Extract tag from repository path
     */
    extractTagFromPath(path) {
        // Extract project name from path to use as tag
        const pathParts = path.split('/');
        return pathParts[pathParts.length - 1] || 'default';
    }
    /**
     * Clean up resources
     */
    dispose() {
        logger_1.logger.info('Disposing TaskMaster service', {}, 'service');
        try {
            this.commandExecutor.killAllProcesses();
            this.removeAllListeners();
            logger_1.logger.info('TaskMaster service disposed successfully', {}, 'service');
        }
        catch (error) {
            logger_1.logger.error('Error disposing TaskMaster service', {}, error, 'service');
        }
    }
    /**
     * Health check for the service
     */
    async healthCheck() {
        const context = {
            requestId: this.generateRequestId(),
            operation: 'health-check'
        };
        try {
            logger_1.logger.debug('Performing health check', context, 'service');
            // Test CLI availability by checking version or help
            const command = this.commandBuilder.buildCommand('help', {});
            const result = await this.commandExecutor.executeCommand(command.command, ['--version'], {
                timeout: 5000 // Short timeout for health check
            });
            const healthy = result.success;
            const details = {
                cliAvailable: healthy,
                version: healthy ? result.stdout.trim() : 'unknown',
                lastCheck: new Date().toISOString(),
                executorHealthy: true, // this.commandExecutor.isHealthy(),
                activeProcesses: this.commandExecutor.getActiveProcessCount()
            };
            logger_1.logger.info('Health check completed', { ...context, healthy, details }, 'service');
            return { healthy, details };
        }
        catch (error) {
            const taskMasterError = errorHandler_1.errorHandler.normalizeError(error, context);
            logger_1.logger.error('Health check failed', context, taskMasterError, 'service');
            return {
                healthy: false,
                details: {
                    error: taskMasterError.message,
                    cliAvailable: false,
                    lastCheck: new Date().toISOString()
                }
            };
        }
    }
}
exports.TaskMasterService = TaskMasterService;
// Export singleton instance for convenience
exports.taskMasterService = new TaskMasterService();
//# sourceMappingURL=taskMasterService.js.map