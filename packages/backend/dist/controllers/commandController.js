"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandController = exports.CommandController = void 0;
const commandExecutor_1 = require("../services/commandExecutor");
const logger_1 = require("../utils/logger");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Define allowed commands for security
const ALLOWED_COMMANDS = {
    git: {
        commands: ['pull', 'push', 'status', 'fetch', 'checkout', 'branch', 'log', 'diff', 'stash'],
        requiresRepo: true
    },
    'task-master': {
        commands: ['expand', 'list', 'next', 'show', 'set-status', 'analyze-complexity', 'generate'],
        requiresRepo: false
    },
    pnpm: {
        commands: ['install', 'build', 'test', 'lint', 'dev', 'start'],
        requiresRepo: false
    },
    npm: {
        commands: ['install', 'build', 'test', 'run'],
        requiresRepo: false
    }
};
class CommandController {
    /**
     * Execute a predefined safe command
     */
    async executeCommand(req, res) {
        try {
            const { command, args = [], workingDirectory, repositoryPath, timeout } = req.body;
            // Validate command
            const validationResult = this.validateCommand(command, args);
            if (!validationResult.isValid) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_COMMAND',
                        message: validationResult.message
                    }
                });
                return;
            }
            // Validate working directory
            const cwd = await this.resolveWorkingDirectory(workingDirectory, repositoryPath);
            if (!cwd) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_DIRECTORY',
                        message: 'Invalid or inaccessible working directory'
                    }
                });
                return;
            }
            // Check repository requirement
            const commandConfig = this.getCommandConfig(command);
            if (commandConfig?.requiresRepo && !repositoryPath) {
                const hasGitRepo = await this.isGitRepository(cwd);
                if (!hasGitRepo) {
                    res.status(400).json({
                        success: false,
                        error: {
                            code: 'REPOSITORY_REQUIRED',
                            message: 'This command requires a Git repository'
                        }
                    });
                    return;
                }
            }
            // Execute command
            const executionId = `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const options = {
                cwd,
                timeout: timeout || 60000, // 1 minute default
                shell: true
            };
            logger_1.logger.info('Executing command', {
                executionId,
                command,
                args,
                cwd,
                timeout
            });
            const result = await commandExecutor_1.commandExecutor.executeCommand(command, args, options);
            res.json({
                success: true,
                data: {
                    result,
                    executionId
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Command execution failed:', {}, error instanceof Error ? error : new Error('Unknown error'));
            res.status(500).json({
                success: false,
                error: {
                    code: 'EXECUTION_ERROR',
                    message: error instanceof Error ? error.message : 'Command execution failed',
                    details: error
                }
            });
        }
    }
    /**
     * Get list of available commands
     */
    async getAvailableCommands(req, res) {
        try {
            const { repositoryPath } = req.query;
            const commands = Object.entries(ALLOWED_COMMANDS).map(([cmd, config]) => ({
                command: cmd,
                subcommands: config.commands,
                requiresRepository: config.requiresRepo,
                available: !config.requiresRepo || Boolean(repositoryPath)
            }));
            res.json({
                success: true,
                data: {
                    commands
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to get available commands:', {}, error instanceof Error ? error : new Error('Unknown error'));
            res.status(500).json({
                success: false,
                error: {
                    code: 'COMMANDS_ERROR',
                    message: 'Failed to retrieve available commands'
                }
            });
        }
    }
    /**
     * Execute a sequence of commands
     */
    async executeSequence(req, res) {
        try {
            const { commands, workingDirectory, repositoryPath } = req.body;
            if (!Array.isArray(commands) || commands.length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_SEQUENCE',
                        message: 'Commands array is required and must not be empty'
                    }
                });
                return;
            }
            // Validate all commands first
            for (const cmd of commands) {
                const validationResult = this.validateCommand(cmd.command, cmd.args || []);
                if (!validationResult.isValid) {
                    res.status(400).json({
                        success: false,
                        error: {
                            code: 'INVALID_COMMAND_SEQUENCE',
                            message: `Invalid command in sequence: ${validationResult.message}`
                        }
                    });
                    return;
                }
            }
            // Resolve working directory
            const cwd = await this.resolveWorkingDirectory(workingDirectory, repositoryPath);
            if (!cwd) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_DIRECTORY',
                        message: 'Invalid or inaccessible working directory'
                    }
                });
                return;
            }
            const executionId = `seq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            logger_1.logger.info('Executing command sequence', {
                executionId,
                commands,
                cwd
            });
            // Execute commands in sequence
            const results = await commandExecutor_1.commandExecutor.executeSequence(commands.map(cmd => ({
                command: cmd.command,
                args: cmd.args || [],
                options: { cwd, shell: true }
            })));
            res.json({
                success: true,
                data: {
                    results,
                    executionId
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Command sequence execution failed:', {}, error instanceof Error ? error : new Error('Unknown error'));
            res.status(500).json({
                success: false,
                error: {
                    code: 'SEQUENCE_EXECUTION_ERROR',
                    message: error instanceof Error ? error.message : 'Command sequence execution failed',
                    details: error
                }
            });
        }
    }
    /**
     * Get common command presets
     */
    async getCommandPresets(req, res) {
        try {
            const presets = [
                {
                    name: 'Git Update',
                    description: 'Pull latest changes from remote',
                    commands: [
                        { command: 'git', args: ['fetch'] },
                        { command: 'git', args: ['pull'] }
                    ],
                    requiresRepository: true
                },
                {
                    name: 'Task Expand All',
                    description: 'Expand all pending tasks with research',
                    commands: [
                        { command: 'task-master', args: ['expand', '--all', '--research'] }
                    ],
                    requiresRepository: false
                },
                {
                    name: 'Build Project',
                    description: 'Install dependencies and build project',
                    commands: [
                        { command: 'pnpm', args: ['install'] },
                        { command: 'pnpm', args: ['build'] }
                    ],
                    requiresRepository: false
                },
                {
                    name: 'Run Tests',
                    description: 'Run all tests and linting',
                    commands: [
                        { command: 'pnpm', args: ['test'] },
                        { command: 'pnpm', args: ['lint'] }
                    ],
                    requiresRepository: false
                }
            ];
            res.json({
                success: true,
                data: { presets }
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to get command presets:', {}, error instanceof Error ? error : new Error('Unknown error'));
            res.status(500).json({
                success: false,
                error: {
                    code: 'PRESETS_ERROR',
                    message: 'Failed to retrieve command presets'
                }
            });
        }
    }
    /**
     * Validate if a command is allowed and properly formatted
     */
    validateCommand(command, args) {
        if (!command || typeof command !== 'string') {
            return { isValid: false, message: 'Command is required and must be a string' };
        }
        // Check if command is in allowed list
        const allowedCommand = ALLOWED_COMMANDS[command];
        if (!allowedCommand) {
            return {
                isValid: false,
                message: `Command '${command}' is not allowed. Allowed commands: ${Object.keys(ALLOWED_COMMANDS).join(', ')}`
            };
        }
        // Check if subcommand is valid (for commands that have subcommands)
        if (args.length > 0) {
            const subcommand = args[0];
            if (!allowedCommand.commands.includes(subcommand)) {
                return {
                    isValid: false,
                    message: `Subcommand '${subcommand}' is not allowed for '${command}'. Allowed: ${allowedCommand.commands.join(', ')}`
                };
            }
        }
        return { isValid: true };
    }
    /**
     * Get command configuration
     */
    getCommandConfig(command) {
        return ALLOWED_COMMANDS[command];
    }
    /**
     * Resolve and validate working directory
     */
    async resolveWorkingDirectory(workingDirectory, repositoryPath) {
        try {
            // Use repository path if provided, otherwise use working directory or current directory
            const targetPath = repositoryPath || workingDirectory || process.cwd();
            const resolvedPath = path_1.default.resolve(targetPath);
            // Check if directory exists and is accessible
            await fs_1.default.promises.access(resolvedPath, fs_1.default.constants.F_OK | fs_1.default.constants.R_OK);
            return resolvedPath;
        }
        catch (error) {
            logger_1.logger.warn('Invalid working directory:', { workingDirectory, repositoryPath, error });
            return null;
        }
    }
    /**
     * Check if directory is a Git repository
     */
    async isGitRepository(directory) {
        try {
            const gitPath = path_1.default.join(directory, '.git');
            await fs_1.default.promises.access(gitPath, fs_1.default.constants.F_OK);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.CommandController = CommandController;
exports.commandController = new CommandController();
//# sourceMappingURL=commandController.js.map