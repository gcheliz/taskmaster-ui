import { Request, Response } from 'express';
export interface PrdAnalysisRequest {
    repositoryPath: string;
    prdContent: string;
    options?: {
        tag?: string;
        append?: boolean;
        research?: boolean;
    };
}
export interface PrdAnalysisResponse {
    success: boolean;
    data?: {
        parsedTasks: any[];
        complexityAnalysis: any;
        summary: {
            totalTasks: number;
            averageComplexity: number;
            estimatedEffort: string;
        };
    };
    error?: string;
    executionTime: number;
}
export declare class PrdController {
    /**
     * Analyze PRD content by parsing and performing complexity analysis
     */
    analyzePrd(req: Request, res: Response): Promise<void>;
    /**
     * Extract tasks from parse-prd output
     */
    private extractTasksFromOutput;
    /**
     * Extract complexity analysis from output
     */
    private extractComplexityFromOutput;
    /**
     * Get complexity level from numeric value
     */
    private getComplexityLevel;
    /**
     * Calculate average complexity
     */
    private calculateAverageComplexity;
    /**
     * Calculate estimated effort
     */
    private calculateEstimatedEffort;
    /**
     * Health check endpoint
     */
    healthCheck(req: Request, res: Response): Promise<void>;
}
export declare const prdController: PrdController;
//# sourceMappingURL=prdController.d.ts.map