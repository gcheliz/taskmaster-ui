import { Request, Response } from 'express';
import { CommandResult } from '../services/commandExecutor';
export interface CommandRequest {
    command: string;
    args?: string[];
    workingDirectory?: string;
    repositoryPath?: string;
    timeout?: number;
}
export interface CommandResponse {
    success: boolean;
    data?: {
        result: CommandResult;
        executionId: string;
    };
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}
export declare class CommandController {
    /**
     * Execute a predefined safe command
     */
    executeCommand(req: Request, res: Response): Promise<void>;
    /**
     * Get list of available commands
     */
    getAvailableCommands(req: Request, res: Response): Promise<void>;
    /**
     * Execute a sequence of commands
     */
    executeSequence(req: Request, res: Response): Promise<void>;
    /**
     * Get common command presets
     */
    getCommandPresets(req: Request, res: Response): Promise<void>;
    /**
     * Validate if a command is allowed and properly formatted
     */
    private validateCommand;
    /**
     * Get command configuration
     */
    private getCommandConfig;
    /**
     * Resolve and validate working directory
     */
    private resolveWorkingDirectory;
    /**
     * Check if directory is a Git repository
     */
    private isGitRepository;
}
export declare const commandController: CommandController;
//# sourceMappingURL=commandController.d.ts.map