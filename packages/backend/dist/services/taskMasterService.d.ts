import { EventEmitter } from 'events';
import { ITaskMasterService, TaskMasterConfig, TaskMasterResult, TaskInfo, ProjectInfo } from '../types/taskMaster';
import { CommandExecutor } from './commandExecutor';
import { TaskMasterCommandBuilder } from './taskMasterCommandBuilder';
import { TaskMasterOutputParser } from './taskMasterOutputParser';
/**
 * Facade Pattern Implementation for TaskMaster CLI Service
 * Demonstrates: Facade pattern, dependency injection, event-driven architecture
 */
export declare class TaskMasterService extends EventEmitter implements ITaskMasterService {
    private commandExecutor;
    private commandBuilder;
    private outputParser;
    private defaultConfig;
    constructor(executor?: CommandExecutor, builder?: TaskMasterCommandBuilder, parser?: TaskMasterOutputParser, config?: Partial<TaskMasterConfig>);
    /**
     * Initialize a new TaskMaster project
     */
    initProject(path: string, options?: {
        prdFile?: string;
    }): Promise<TaskMasterResult<ProjectInfo>>;
    /**
     * Get project status and overview
     */
    getProjectStatus(path: string): Promise<TaskMasterResult<ProjectInfo>>;
    /**
     * List tasks with filtering options
     */
    listTasks(path: string, options?: {
        status?: string;
        tag?: string;
    }): Promise<TaskMasterResult<TaskInfo[]>>;
    /**
     * Get detailed information about a specific task
     */
    getTask(path: string, taskId: string, options?: {
        tag?: string;
    }): Promise<TaskMasterResult<TaskInfo>>;
    /**
     * Update task status
     */
    updateTaskStatus(path: string, taskId: string, status: string, options?: {
        tag?: string;
    }): Promise<TaskMasterResult<TaskInfo>>;
    /**
     * Get next available task
     */
    getNextTask(path: string, options?: {
        tag?: string;
    }): Promise<TaskMasterResult<TaskInfo | null>>;
    parsePRD(path: string, prdFile: string, options?: {
        append?: boolean;
    }): Promise<TaskMasterResult>;
    expandTask(path: string, taskId: string, options?: {
        research?: boolean;
        force?: boolean;
        tag?: string;
    }): Promise<TaskMasterResult>;
    analyzeComplexity(path: string, options?: {
        from?: number;
        to?: number;
        research?: boolean;
        tag?: string;
    }): Promise<TaskMasterResult>;
    validateDependencies(path: string, options?: {
        tag?: string;
    }): Promise<TaskMasterResult>;
    generateReport(path: string, type: 'complexity' | 'progress', options?: {
        tag?: string;
    }): Promise<TaskMasterResult>;
    /**
     * Generic command execution helper
     */
    private executeGenericCommand;
    /**
     * Helper to create error results
     */
    private createErrorResult;
    /**
     * Generate unique request ID for tracking
     */
    private generateRequestId;
    /**
     * Validate repository path
     */
    private validateRepositoryPath;
    /**
     * Validate operation name
     */
    private validateOperation;
    /**
     * Extract tag from repository path
     */
    private extractTagFromPath;
    /**
     * Clean up resources
     */
    dispose(): void;
    /**
     * Health check for the service
     */
    healthCheck(): Promise<{
        healthy: boolean;
        details: any;
    }>;
}
export declare const taskMasterService: TaskMasterService;
//# sourceMappingURL=taskMasterService.d.ts.map