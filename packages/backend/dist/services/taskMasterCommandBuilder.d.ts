import { TaskMasterCommand, ITaskMasterCommandBuilder } from '../types/taskMaster';
/**
 * Command Builder Pattern Implementation
 * Demonstrates: Fluent interface, command construction, validation
 */
export declare class TaskMasterCommandBuilder implements ITaskMasterCommandBuilder {
    private static readonly COMMANDS_REGISTRY;
    /**
     * Build a TaskMaster command with fluent interface
     */
    buildCommand(operation: string, args?: Record<string, any>): TaskMasterCommand;
    /**
     * Build arguments for specific operations with validation
     */
    private buildArgumentsForOperation;
    /**
     * Add tag flag if provided
     */
    private addTagFlag;
    /**
     * Validate a constructed command
     */
    validateCommand(command: TaskMasterCommand): boolean;
    /**
     * Validate arguments for specific operations
     */
    private validateOperationArguments;
    /**
     * Get all available commands
     */
    getAvailableCommands(): TaskMasterCommand[];
    /**
     * Fluent interface builder for common command patterns
     */
    static createBuilder(): CommandBuilderFluent;
}
/**
 * Fluent interface for building commands
 * Demonstrates: Fluent API pattern, method chaining
 */
declare class CommandBuilderFluent {
    private operationName;
    private args;
    operation(op: string): this;
    withId(id: string | number): this;
    withStatus(status: string): this;
    withTag(tag: string): this;
    withFile(file: string): this;
    withPrompt(prompt: string): this;
    withResearch(research?: boolean): this;
    withForce(force?: boolean): this;
    withRange(from: number, to: number): this;
    all(): this;
    build(): TaskMasterCommand;
}
export declare const taskMasterCommandBuilder: TaskMasterCommandBuilder;
export {};
//# sourceMappingURL=taskMasterCommandBuilder.d.ts.map