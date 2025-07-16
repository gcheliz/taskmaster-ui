import { RepositoryValidationResult } from '../types/api';
export interface RepositoryValidationOptions {
    validateGit?: boolean;
    validateTaskMaster?: boolean;
    checkPermissions?: boolean;
}
export declare class RepositoryValidationService {
    private static instance;
    static getInstance(): RepositoryValidationService;
    /**
     * Validate a repository path with comprehensive checks
     */
    validateRepository(repositoryPath: string, options?: RepositoryValidationOptions): Promise<RepositoryValidationResult>;
    /**
     * Validate that the path exists and is accessible
     */
    private validatePath;
    /**
     * Validate that the path is a directory
     */
    private validateDirectory;
    /**
     * Validate read/write permissions
     */
    private validatePermissions;
    /**
     * Validate that the directory is a Git repository
     */
    private validateGitRepository;
    /**
     * Validate that the directory is a TaskMaster project
     */
    private validateTaskMasterProject;
    /**
     * Get detailed Git information
     */
    private getGitInfo;
    /**
     * Get TaskMaster project configuration
     */
    private getTaskMasterConfig;
    /**
     * Create a validation result
     */
    private createResult;
    /**
     * Generate unique request ID for tracking
     */
    private generateRequestId;
}
export declare const repositoryValidationService: RepositoryValidationService;
//# sourceMappingURL=repositoryValidationService.d.ts.map