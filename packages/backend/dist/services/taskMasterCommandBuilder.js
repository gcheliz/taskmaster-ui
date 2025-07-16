"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskMasterCommandBuilder = exports.TaskMasterCommandBuilder = void 0;
/**
 * Command Builder Pattern Implementation
 * Demonstrates: Fluent interface, command construction, validation
 */
class TaskMasterCommandBuilder {
    /**
     * Build a TaskMaster command with fluent interface
     */
    buildCommand(operation, args = {}) {
        const commandTemplate = TaskMasterCommandBuilder.COMMANDS_REGISTRY[operation];
        if (!commandTemplate) {
            throw new Error(`Unknown TaskMaster operation: ${operation}`);
        }
        const commandArgs = this.buildArgumentsForOperation(operation, args);
        return {
            ...commandTemplate,
            args: commandArgs
        };
    }
    /**
     * Build arguments for specific operations with validation
     */
    buildArgumentsForOperation(operation, args) {
        const commandArgs = [operation];
        switch (operation) {
            case 'init':
                if (args.prdFile) {
                    commandArgs.push(args.prdFile);
                }
                break;
            case 'list':
                if (args.status) {
                    commandArgs.push(args.status);
                }
                if (args.priority) {
                    commandArgs.push(args.priority);
                }
                this.addTagFlag(commandArgs, args.tag);
                break;
            case 'show':
                if (!args.id) {
                    throw new Error('Task ID is required for show command');
                }
                commandArgs.push(args.id.toString());
                this.addTagFlag(commandArgs, args.tag);
                break;
            case 'next':
                this.addTagFlag(commandArgs, args.tag);
                break;
            case 'set-status':
                if (!args.id) {
                    throw new Error('Task ID is required for set-status command');
                }
                if (!args.status) {
                    throw new Error('Status is required for set-status command');
                }
                commandArgs.push(`--id=${args.id}`);
                commandArgs.push(`--status=${args.status}`);
                this.addTagFlag(commandArgs, args.tag);
                break;
            case 'parse-prd':
                if (!args.file) {
                    throw new Error('PRD file path is required for parse-prd command');
                }
                commandArgs.push(args.file);
                if (args.append) {
                    commandArgs.push('--append');
                }
                this.addTagFlag(commandArgs, args.tag);
                break;
            case 'expand':
                if (args.id) {
                    commandArgs.push(`--id=${args.id}`);
                }
                else if (args.all) {
                    commandArgs.push('--all');
                }
                else {
                    throw new Error('Either task ID or --all flag is required for expand command');
                }
                if (args.research) {
                    commandArgs.push('--research');
                }
                if (args.force) {
                    commandArgs.push('--force');
                }
                this.addTagFlag(commandArgs, args.tag);
                break;
            case 'analyze-complexity':
                if (args.from) {
                    commandArgs.push(`--from=${args.from}`);
                }
                if (args.to) {
                    commandArgs.push(`--to=${args.to}`);
                }
                if (args.research) {
                    commandArgs.push('--research');
                }
                this.addTagFlag(commandArgs, args.tag);
                break;
            case 'complexity-report':
                this.addTagFlag(commandArgs, args.tag);
                break;
            case 'validate-dependencies':
                this.addTagFlag(commandArgs, args.tag);
                break;
            case 'update-task':
                if (!args.id) {
                    throw new Error('Task ID is required for update-task command');
                }
                if (!args.prompt) {
                    throw new Error('Prompt is required for update-task command');
                }
                commandArgs.push(`--id=${args.id}`);
                commandArgs.push(`--prompt=${args.prompt}`);
                this.addTagFlag(commandArgs, args.tag);
                break;
            case 'update-subtask':
                if (!args.id) {
                    throw new Error('Subtask ID is required for update-subtask command');
                }
                if (!args.prompt) {
                    throw new Error('Prompt is required for update-subtask command');
                }
                commandArgs.push(`--id=${args.id}`);
                commandArgs.push(`--prompt=${args.prompt}`);
                this.addTagFlag(commandArgs, args.tag);
                break;
            default:
                // For unknown operations, pass through all args as flags
                Object.entries(args).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        commandArgs.push(`--${key}=${value}`);
                    }
                });
        }
        return commandArgs;
    }
    /**
     * Add tag flag if provided
     */
    addTagFlag(commandArgs, tag) {
        if (tag) {
            commandArgs.push(`--tag=${tag}`);
        }
    }
    /**
     * Validate a constructed command
     */
    validateCommand(command) {
        // Basic validation
        if (!command.command || !command.args || !Array.isArray(command.args)) {
            return false;
        }
        // Check if command exists in registry
        const operation = command.args[0];
        const commandTemplate = TaskMasterCommandBuilder.COMMANDS_REGISTRY[operation];
        if (!commandTemplate) {
            return false;
        }
        // Validate required arguments based on operation
        return this.validateOperationArguments(operation, command.args);
    }
    /**
     * Validate arguments for specific operations
     */
    validateOperationArguments(operation, args) {
        switch (operation) {
            case 'show':
            case 'set-status':
            case 'update-task':
            case 'update-subtask':
                // These require an ID parameter
                return args.some(arg => arg.includes('--id=') || !arg.startsWith('--'));
            case 'parse-prd':
                // Requires a file path
                return args.length >= 2 && !args[1].startsWith('--');
            default:
                return true; // Other commands have optional parameters
        }
    }
    /**
     * Get all available commands
     */
    getAvailableCommands() {
        return Object.entries(TaskMasterCommandBuilder.COMMANDS_REGISTRY).map(([operation, template]) => ({
            ...template,
            args: [operation] // Base args with just the operation
        }));
    }
    /**
     * Fluent interface builder for common command patterns
     */
    static createBuilder() {
        return new CommandBuilderFluent();
    }
}
exports.TaskMasterCommandBuilder = TaskMasterCommandBuilder;
TaskMasterCommandBuilder.COMMANDS_REGISTRY = {
    'init': {
        command: 'task-master',
        description: 'Initialize a new TaskMaster project',
        requiresRepository: true
    },
    'list': {
        command: 'task-master',
        description: 'List tasks in the project',
        requiresRepository: true
    },
    'show': {
        command: 'task-master',
        description: 'Show detailed task information',
        requiresRepository: true
    },
    'next': {
        command: 'task-master',
        description: 'Get the next available task',
        requiresRepository: true
    },
    'set-status': {
        command: 'task-master',
        description: 'Update task status',
        requiresRepository: true
    },
    'parse-prd': {
        command: 'task-master',
        description: 'Parse PRD document and generate tasks',
        requiresRepository: true
    },
    'expand': {
        command: 'task-master',
        description: 'Expand a task into subtasks',
        requiresRepository: true
    },
    'analyze-complexity': {
        command: 'task-master',
        description: 'Analyze project complexity',
        requiresRepository: true
    },
    'complexity-report': {
        command: 'task-master',
        description: 'Generate complexity report',
        requiresRepository: true
    },
    'validate-dependencies': {
        command: 'task-master',
        description: 'Validate task dependencies',
        requiresRepository: true
    },
    'update-task': {
        command: 'task-master',
        description: 'Update task details',
        requiresRepository: true
    },
    'update-subtask': {
        command: 'task-master',
        description: 'Update subtask details',
        requiresRepository: true
    }
};
/**
 * Fluent interface for building commands
 * Demonstrates: Fluent API pattern, method chaining
 */
class CommandBuilderFluent {
    constructor() {
        this.operationName = '';
        this.args = {};
    }
    operation(op) {
        this.operationName = op;
        return this;
    }
    withId(id) {
        this.args.id = id;
        return this;
    }
    withStatus(status) {
        this.args.status = status;
        return this;
    }
    withTag(tag) {
        this.args.tag = tag;
        return this;
    }
    withFile(file) {
        this.args.file = file;
        return this;
    }
    withPrompt(prompt) {
        this.args.prompt = prompt;
        return this;
    }
    withResearch(research = true) {
        this.args.research = research;
        return this;
    }
    withForce(force = true) {
        this.args.force = force;
        return this;
    }
    withRange(from, to) {
        this.args.from = from;
        this.args.to = to;
        return this;
    }
    all() {
        this.args.all = true;
        return this;
    }
    build() {
        const builder = new TaskMasterCommandBuilder();
        return builder.buildCommand(this.operationName, this.args);
    }
}
// Export singleton instance for convenience
exports.taskMasterCommandBuilder = new TaskMasterCommandBuilder();
//# sourceMappingURL=taskMasterCommandBuilder.js.map