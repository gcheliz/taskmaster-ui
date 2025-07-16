import { EventEmitter } from 'events';
export interface MemoryConfig {
    maxHeapSize: number;
    gcInterval: number;
    warningThreshold: number;
    criticalThreshold: number;
    leakDetectionInterval: number;
    retentionSamples: number;
    enableMonitoring: boolean;
    enableGCOptimization: boolean;
}
export interface MemoryStatistics {
    heapUsed: number;
    heapTotal: number;
    heapUtilization: number;
    external: number;
    rss: number;
    gcCount: number;
    gcTime: number;
    averageGCTime: number;
    memoryLeakSuspected: boolean;
    lastGC: string;
    trend: 'increasing' | 'decreasing' | 'stable';
}
/**
 * Advanced Memory Manager with Leak Detection
 */
export declare class AdvancedMemoryManager extends EventEmitter {
    private samples;
    private gcStartTime;
    private gcCount;
    private totalGCTime;
    private config;
    private monitoringTimer?;
    private leakDetectionTimer?;
    private weakRefTracker;
    private objectPools;
    constructor(config?: Partial<MemoryConfig>);
    /**
     * Get current memory statistics
     */
    getStatistics(): MemoryStatistics;
    /**
     * Force garbage collection (if exposed)
     */
    forceGC(): boolean;
    /**
     * Create object pool for reusable objects
     */
    createObjectPool<T>(category: string, factory: () => T, reset: (obj: T) => void, maxSize?: number): {
        acquire: () => T;
        release: (obj: T) => void;
        size: () => number;
        clear: () => void;
    };
    /**
     * Track object for leak detection
     */
    trackObject(obj: object, category?: string): void;
    /**
     * Get object tracking statistics
     */
    getTrackingStatistics(): Map<string, number>;
    /**
     * Optimize memory usage
     */
    optimizeMemory(): Promise<{
        beforeOptimization: MemoryStatistics;
        afterOptimization: MemoryStatistics;
        optimizations: string[];
    }>;
    /**
     * Monitor memory pressure and emit warnings
     */
    checkMemoryPressure(): {
        level: 'normal' | 'warning' | 'critical';
        action: string;
        statistics: MemoryStatistics;
    };
    /**
     * Generate memory report
     */
    generateMemoryReport(): {
        summary: MemoryStatistics;
        trends: {
            memoryTrend: string;
            averageGrowthRate: number;
            predictedExhaustion?: string;
        };
        recommendations: string[];
        objectPools: Record<string, number>;
        tracking: Record<string, number>;
    };
    /**
     * Shutdown memory manager
     */
    shutdown(): void;
    private initializeMonitoring;
    private setupGCListeners;
    private collectMemorySample;
    private detectMemoryLeak;
    private analyzeTrend;
    private getLastGCTime;
    private performLeakDetection;
    private calculateGrowthRate;
    private predictMemoryExhaustion;
}
/**
 * Create a memory-efficient object pool
 */
export declare function createObjectPool<T>(factory: () => T, reset: (obj: T) => void, maxSize?: number): {
    acquire: () => T;
    release: (obj: T) => void;
    size: () => number;
    clear: () => void;
};
/**
 * Monitor an object for memory leaks
 */
export declare function trackMemoryUsage(obj: object, category?: string): void;
/**
 * Get current memory pressure level
 */
export declare function getMemoryPressure(): {
    level: "normal" | "warning" | "critical";
    action: string;
    statistics: MemoryStatistics;
};
export declare const memoryManager: AdvancedMemoryManager;
//# sourceMappingURL=memoryManager.d.ts.map