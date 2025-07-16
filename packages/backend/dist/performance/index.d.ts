export { AdvancedCacheManager, CommandResultCache, globalCache, commandCache, type CacheConfig, type CacheEntry, type CacheStatistics, type InvalidationStrategy } from './cacheManager';
export { AdvancedConnectionPool, TaskMasterConnection, TaskMasterConnectionFactory, taskMasterPool, type PoolConfig, type Connection, type PoolStatistics, type ConnectionFactory } from './connectionPool';
export { AdvancedBatchProcessor, TaskMasterBatchProcessor, taskMasterBatchProcessor, type BatchConfig, type BatchItem, type BatchProcessor, type BatchStatistics } from './batchProcessor';
export { AdvancedMemoryManager, memoryManager, createObjectPool, trackMemoryUsage, getMemoryPressure, type MemoryConfig, type MemoryStatistics } from './memoryManager';
export declare class PerformanceMonitor {
    private static instance;
    private metrics;
    private startTimes;
    static getInstance(): PerformanceMonitor;
    /**
     * Start timing an operation
     */
    startTimer(operation: string): void;
    /**
     * End timing and record metric
     */
    endTimer(operation: string): number;
    /**
     * Record a metric value
     */
    recordMetric(name: string, value: number): void;
    /**
     * Get all recorded metrics
     */
    getMetrics(): Record<string, number>;
    /**
     * Reset all metrics
     */
    reset(): void;
}
export declare const performanceUtils: {
    /**
     * Measure execution time of an async function
     */
    measureAsync<T>(operation: string, fn: () => Promise<T>): Promise<{
        result: T;
        duration: number;
    }>;
    /**
     * Measure execution time of a sync function
     */
    measure<T>(operation: string, fn: () => T): {
        result: T;
        duration: number;
    };
    /**
     * Debounce function calls
     */
    debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
    /**
     * Throttle function calls
     */
    throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
    /**
     * Memoize function results
     */
    memoize<T extends (...args: any[]) => any>(func: T, keyGenerator?: (...args: Parameters<T>) => string): T;
};
export declare const performanceMonitor: PerformanceMonitor;
export declare const performanceConfig: {
    cache: {
        enabled: boolean;
        defaultTTL: number;
        maxSize: number;
    };
    connectionPool: {
        enabled: boolean;
        minConnections: number;
        maxConnections: number;
    };
    batchProcessing: {
        enabled: boolean;
        maxBatchSize: number;
        flushInterval: number;
    };
    memoryManagement: {
        enabled: boolean;
        warningThreshold: number;
        criticalThreshold: number;
    };
};
/**
 * Initialize all performance optimizations
 */
export declare function initializePerformanceOptimizations(): Promise<void>;
/**
 * Shutdown all performance optimizations gracefully
 */
export declare function shutdownPerformanceOptimizations(): Promise<void>;
//# sourceMappingURL=index.d.ts.map