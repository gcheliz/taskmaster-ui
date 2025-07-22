"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskMasterTerminalController = exports.TaskMasterTerminalController = void 0;
const taskMasterTerminalService_1 = require("../services/taskMasterTerminalService");
const logger_1 = require("../utils/logger");
class TaskMasterTerminalController {
    /**
     * Create a new TaskMaster terminal session
     */
    async createSession(req, res) {
        try {
            const { workingDirectory, repositoryPath, projectTag } = req.body;
            const sessionId = taskMasterTerminalService_1.taskMasterTerminalService.createSession(workingDirectory, repositoryPath, projectTag);
            res.json({
                success: true,
                data: {
                    sessionId,
                    message: 'TaskMaster terminal session created successfully',
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to create TaskMaster terminal session:', {}, error instanceof Error ? error : new Error('Unknown error'));
            res.status(500).json({
                success: false,
                error: {
                    code: 'TASKMASTER_TERMINAL_SESSION_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to create TaskMaster terminal session',
                },
            });
        }
    }
    /**
     * Get TaskMaster terminal session information
     */
    async getSession(req, res) {
        try {
            const { sessionId } = req.params;
            const session = taskMasterTerminalService_1.taskMasterTerminalService.getSession(sessionId);
            if (!session) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'SESSION_NOT_FOUND',
                        message: `TaskMaster terminal session not found: ${sessionId}`,
                    },
                });
                return;
            }
            res.json({
                success: true,
                data: {
                    id: session.id,
                    workingDirectory: session.workingDirectory,
                    repositoryPath: session.repositoryPath,
                    projectTag: session.projectTag,
                    shell: session.shell,
                    isActive: session.isActive,
                    taskMasterIntegrated: session.taskMasterIntegrated,
                    createdAt: session.createdAt,
                    lastActivity: session.lastActivity,
                    commandHistoryLength: session.commandHistory.length,
                    environment: Object.keys(session.environment),
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to get TaskMaster terminal session:', {}, error instanceof Error ? error : new Error('Unknown error'));
            res.status(500).json({
                success: false,
                error: {
                    code: 'TASKMASTER_TERMINAL_SESSION_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to get TaskMaster terminal session',
                },
            });
        }
    }
    /**
     * Get all active TaskMaster terminal sessions
     */
    async getActiveSessions(req, res) {
        try {
            const sessions = taskMasterTerminalService_1.taskMasterTerminalService.getActiveSessions();
            const sessionData = sessions.map(session => ({
                id: session.id,
                workingDirectory: session.workingDirectory,
                repositoryPath: session.repositoryPath,
                projectTag: session.projectTag,
                shell: session.shell,
                isActive: session.isActive,
                taskMasterIntegrated: session.taskMasterIntegrated,
                createdAt: session.createdAt,
                lastActivity: session.lastActivity,
                commandHistoryLength: session.commandHistory.length,
            }));
            res.json({
                success: true,
                data: {
                    sessions: sessionData,
                    count: sessionData.length,
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to get active TaskMaster terminal sessions:', {}, error instanceof Error ? error : new Error('Unknown error'));
            res.status(500).json({
                success: false,
                error: {
                    code: 'TASKMASTER_TERMINAL_SESSION_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to get active TaskMaster terminal sessions',
                },
            });
        }
    }
    /**
     * Execute a command in a TaskMaster terminal session
     */
    async executeCommand(req, res) {
        try {
            const { sessionId } = req.params;
            const { command } = req.body;
            if (!command || typeof command !== 'string') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_COMMAND',
                        message: 'Command is required and must be a string',
                    },
                });
                return;
            }
            await taskMasterTerminalService_1.taskMasterTerminalService.executeCommand(sessionId, command);
            res.json({
                success: true,
                data: {
                    message: 'Command executed successfully',
                    isTaskMasterCommand: command.trim().startsWith('task-master'),
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to execute command in TaskMaster terminal:', {}, error instanceof Error ? error : new Error('Unknown error'));
            res.status(500).json({
                success: false,
                error: {
                    code: 'TASKMASTER_COMMAND_EXECUTION_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to execute command in TaskMaster terminal',
                },
            });
        }
    }
    /**
     * Get TaskMaster command suggestions
     */
    async getCommandSuggestions(req, res) {
        try {
            const { sessionId } = req.params;
            const { partialCommand = '' } = req.query;
            if (typeof partialCommand !== 'string') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_PARTIAL_COMMAND',
                        message: 'Partial command must be a string',
                    },
                });
                return;
            }
            const suggestions = taskMasterTerminalService_1.taskMasterTerminalService.getTaskMasterSuggestions(sessionId, partialCommand);
            res.json({
                success: true,
                data: {
                    suggestions,
                    count: suggestions.length,
                    partialCommand,
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to get TaskMaster command suggestions:', {}, error instanceof Error ? error : new Error('Unknown error'));
            res.status(500).json({
                success: false,
                error: {
                    code: 'TASKMASTER_SUGGESTIONS_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to get TaskMaster command suggestions',
                },
            });
        }
    }
    /**
     * Get command history for a session
     */
    async getCommandHistory(req, res) {
        try {
            const { sessionId } = req.params;
            const { limit = 50, offset = 0 } = req.query;
            const session = taskMasterTerminalService_1.taskMasterTerminalService.getSession(sessionId);
            if (!session) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'SESSION_NOT_FOUND',
                        message: `TaskMaster terminal session not found: ${sessionId}`,
                    },
                });
                return;
            }
            const limitNum = Math.max(1, Math.min(100, parseInt(String(limit))));
            const offsetNum = Math.max(0, parseInt(String(offset)));
            const history = session.commandHistory
                .slice()
                .reverse()
                .slice(offsetNum, offsetNum + limitNum);
            res.json({
                success: true,
                data: {
                    history,
                    totalCount: session.commandHistory.length,
                    limit: limitNum,
                    offset: offsetNum,
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to get command history:', {}, error instanceof Error ? error : new Error('Unknown error'));
            res.status(500).json({
                success: false,
                error: {
                    code: 'COMMAND_HISTORY_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to get command history',
                },
            });
        }
    }
    /**
     * Send input to a running process
     */
    async sendInput(req, res) {
        try {
            const { sessionId } = req.params;
            const { input } = req.body;
            if (!input || typeof input !== 'string') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_INPUT',
                        message: 'Input is required and must be a string',
                    },
                });
                return;
            }
            taskMasterTerminalService_1.taskMasterTerminalService.sendInput(sessionId, input);
            res.json({
                success: true,
                data: {
                    message: 'Input sent successfully',
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send input to TaskMaster terminal:', {}, error instanceof Error ? error : new Error('Unknown error'));
            res.status(500).json({
                success: false,
                error: {
                    code: 'TASKMASTER_INPUT_SEND_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to send input',
                },
            });
        }
    }
    /**
     * Kill a running process in a session
     */
    async killProcess(req, res) {
        try {
            const { sessionId } = req.params;
            taskMasterTerminalService_1.taskMasterTerminalService.killProcess(sessionId);
            res.json({
                success: true,
                data: {
                    message: 'Process killed successfully',
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to kill process in TaskMaster terminal:', {}, error instanceof Error ? error : new Error('Unknown error'));
            res.status(500).json({
                success: false,
                error: {
                    code: 'TASKMASTER_PROCESS_KILL_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to kill process',
                },
            });
        }
    }
    /**
     * Resize TaskMaster terminal
     */
    async resizeTerminal(req, res) {
        try {
            const { sessionId } = req.params;
            const { cols, rows } = req.body;
            if (!cols ||
                !rows ||
                typeof cols !== 'number' ||
                typeof rows !== 'number') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_TERMINAL_SIZE',
                        message: 'Cols and rows are required and must be numbers',
                    },
                });
                return;
            }
            taskMasterTerminalService_1.taskMasterTerminalService.resizeTerminal(sessionId, cols, rows);
            res.json({
                success: true,
                data: {
                    message: 'Terminal resized successfully',
                    size: { cols, rows },
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to resize TaskMaster terminal:', {}, error instanceof Error ? error : new Error('Unknown error'));
            res.status(500).json({
                success: false,
                error: {
                    code: 'TASKMASTER_TERMINAL_RESIZE_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to resize TaskMaster terminal',
                },
            });
        }
    }
    /**
     * Close a TaskMaster terminal session
     */
    async closeSession(req, res) {
        try {
            const { sessionId } = req.params;
            taskMasterTerminalService_1.taskMasterTerminalService.closeSession(sessionId);
            res.json({
                success: true,
                data: {
                    message: 'TaskMaster terminal session closed successfully',
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to close TaskMaster terminal session:', {}, error instanceof Error ? error : new Error('Unknown error'));
            res.status(500).json({
                success: false,
                error: {
                    code: 'TASKMASTER_TERMINAL_SESSION_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to close TaskMaster terminal session',
                },
            });
        }
    }
    /**
     * Get TaskMaster environment information for a session
     */
    async getEnvironment(req, res) {
        try {
            const { sessionId } = req.params;
            const session = taskMasterTerminalService_1.taskMasterTerminalService.getSession(sessionId);
            if (!session) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'SESSION_NOT_FOUND',
                        message: `TaskMaster terminal session not found: ${sessionId}`,
                    },
                });
                return;
            }
            res.json({
                success: true,
                data: {
                    environment: session.environment,
                    workingDirectory: session.workingDirectory,
                    projectTag: session.projectTag,
                    taskMasterIntegrated: session.taskMasterIntegrated,
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to get TaskMaster environment:', {}, error instanceof Error ? error : new Error('Unknown error'));
            res.status(500).json({
                success: false,
                error: {
                    code: 'TASKMASTER_ENVIRONMENT_ERROR',
                    message: error instanceof Error
                        ? error.message
                        : 'Failed to get TaskMaster environment',
                },
            });
        }
    }
}
exports.TaskMasterTerminalController = TaskMasterTerminalController;
exports.taskMasterTerminalController = new TaskMasterTerminalController();
//# sourceMappingURL=taskMasterTerminalController.js.map