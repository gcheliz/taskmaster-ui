export declare class RepositoryController {
    /**
     * Validate a repository path
     * POST /api/repositories/validate
     */
    validateRepository(req: any, res: any): Promise<void>;
    /**
     * Get repository information
     * GET /api/repositories/info?repositoryPath=<path>
     */
    getRepositoryInfo(req: any, res: any): Promise<void>;
    /**
     * Health check for repository service
     * GET /api/repositories/health
     */
    healthCheck(req: any, res: any): Promise<void>;
}
//# sourceMappingURL=repositoryController.d.ts.map