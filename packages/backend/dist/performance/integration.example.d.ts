/**
 * Integrated TaskMaster Performance Service
 * Combines all optimization techniques for maximum efficiency
 */
export declare class OptimizedTaskMasterService {
    private cache;
    private connectionPool;
    private batchProcessor;
    private memoryManager;
    constructor();
    /**
     * High-performance task listing with all optimizations
     */
    listTasks(repositoryPath: string, options?: any): Promise<any>;
    /**
     * Optimized task detail retrieval
     */
    getTask(repositoryPath: string, taskId: string, options?: any): Promise<any>;
    /**
     * Memory-optimized bulk operations
     */
    processBulkTasks(operations: Array<{
        repositoryPath: string;
        operation: string;
        arguments: any;
    }>): Promise<any[]>;
    /**
     * Intelligent cache invalidation
     */
    invalidateCache(repositoryPath: string, operation?: string): Promise<number>;
    /**
     * Get comprehensive performance metrics
     */
    getPerformanceReport(): any;
    /**
     * Optimize all subsystems
     */
    optimizePerformance(): Promise<any>;
    /**
     * Graceful shutdown with cleanup
     */
    shutdown(): Promise<void>;
    private setupPerformanceMonitoring;
    private generateCacheKey;
    private shouldBatch;
    private calculatePriority;
    private calculateTTL;
    private groupOperations;
    private executeOnConnection;
    private optimizeCache;
    private optimizeConnections;
    private generateRecommendations;
    private escapeRegex;
}
export declare function demonstrateOptimizedTaskMaster(): Promise<void>;
//# sourceMappingURL=integration.example.d.ts.map