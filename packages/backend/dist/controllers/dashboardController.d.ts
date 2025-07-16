import { Request, Response } from 'express';
export interface DashboardData {
    project: {
        id: string;
        name: string;
        path: string;
        lastUpdated: string;
    };
    taskMetrics: {
        total: number;
        completed: number;
        inProgress: number;
        pending: number;
        blocked: number;
        deferred: number;
        cancelled: number;
        completionRate: number;
        statusBreakdown: Record<string, number>;
        priorityBreakdown: Record<string, number>;
        complexityDistribution: Record<string, number>;
    };
    subtaskMetrics: {
        total: number;
        completed: number;
        inProgress: number;
        pending: number;
        completionRate: number;
    };
    recentActivity: Array<{
        id: string;
        type: 'commit' | 'task_update' | 'project_update';
        timestamp: string;
        message: string;
        author?: string;
        details?: any;
    }>;
    chartData: {
        taskCompletionTrend: Array<{
            date: string;
            completed: number;
            total: number;
            completionRate: number;
        }>;
        priorityDistribution: Array<{
            priority: string;
            count: number;
            percentage: number;
        }>;
        complexityBreakdown: Array<{
            complexity: string;
            count: number;
            averageTime: number;
        }>;
    };
    insights: {
        totalEstimatedHours: number;
        averageTaskComplexity: number;
        productivityScore: number;
        recommendations: string[];
    };
}
/**
 * Dashboard Controller
 *
 * Handles dashboard data aggregation and reporting endpoints
 */
export declare class DashboardController {
    /**
     * Get dashboard data for a specific project
     */
    getDashboardData(req: Request, res: Response): Promise<void>;
    /**
     * Get project health metrics
     */
    getProjectHealth(req: Request, res: Response): Promise<void>;
    /**
     * Read and parse tasks.json file
     */
    private readTasksFile;
    /**
     * Get recent Git activity
     */
    private getGitActivity;
    /**
     * Aggregate all dashboard data
     */
    private aggregateDashboardData;
    /**
     * Calculate task metrics
     */
    private calculateTaskMetrics;
    /**
     * Calculate subtask metrics
     */
    private calculateSubtaskMetrics;
    /**
     * Get recent task updates
     */
    private getRecentTaskUpdates;
    /**
     * Generate chart data
     */
    private generateChartData;
    /**
     * Generate completion trend data
     */
    private generateCompletionTrend;
    /**
     * Get average time for complexity level
     */
    private getAverageTimeForComplexity;
    /**
     * Calculate project insights
     */
    private calculateInsights;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Calculate project health score
     */
    private calculateProjectHealth;
}
export declare const dashboardController: DashboardController;
//# sourceMappingURL=dashboardController.d.ts.map