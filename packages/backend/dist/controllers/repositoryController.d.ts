import { EnhancedRequest, EnhancedResponse } from '../middleware';
export declare class RepositoryController {
    /**
     * Validate a repository path
     * POST /api/repositories/validate
     */
    validateRepository(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    /**
     * Get repository information
     * GET /api/repositories/info?repositoryPath=<path>
     */
    getRepositoryInfo(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    /**
     * Health check for repository service
     * GET /api/repositories/health
     */
    healthCheck(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
}
//# sourceMappingURL=repositoryController.d.ts.map