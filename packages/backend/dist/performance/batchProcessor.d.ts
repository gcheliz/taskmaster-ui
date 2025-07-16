import { EventEmitter } from 'events';
export interface BatchConfig {
    maxBatchSize: number;
    flushInterval: number;
    maxWaitTime: number;
    concurrencyLimit: number;
    enableRetries: boolean;
    maxRetries: number;
    retryDelayMs: number;
    enableCompression: boolean;
    memoryThreshold: number;
}
export interface BatchItem<T = any, R = any> {
    id: string;
    data: T;
    timestamp: number;
    priority: number;
    retryCount: number;
    resolve: (result: R) => void;
    reject: (error: Error) => void;
    metadata?: Record<string, any>;
}
export interface BatchProcessor<T, R> {
    process(items: T[]): Promise<R[]>;
    canBatch?(item: T): boolean;
    estimateMemoryUsage?(item: T): number;
}
export interface BatchStatistics {
    totalBatches: number;
    totalItems: number;
    averageBatchSize: number;
    averageProcessingTime: number;
    successfulBatches: number;
    failedBatches: number;
    retryCount: number;
    memoryUsage: number;
    throughput: number;
    lastProcessedAt: string;
}
/**
 * Advanced Batch Processor with Request Optimization
 */
export declare class AdvancedBatchProcessor<T, R> extends EventEmitter {
    private processor;
    private pendingItems;
    private processingBatches;
    private flushTimer?;
    private statistics;
    private config;
    private currentMemoryUsage;
    constructor(processor: BatchProcessor<T, R>, config?: Partial<BatchConfig>);
    /**
     * Add item to batch queue
     */
    add(data: T, priority?: number, metadata?: Record<string, any>): Promise<R>;
    /**
     * Force flush all pending items
     */
    flush(): Promise<void>;
    /**
     * Get current batch statistics
     */
    getStatistics(): BatchStatistics;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): any;
    /**
     * Shutdown processor gracefully
     */
    shutdown(): Promise<void>;
    private processBatch;
    private handleBatchError;
    private processSingleItem;
    private startFlushTimer;
    private updateSuccessStatistics;
    private calculateThroughput;
    private estimateWaitTime;
    private generateId;
}
/**
 * TaskMaster CLI Batch Processor Implementation
 */
export declare class TaskMasterBatchProcessor implements BatchProcessor<any, any> {
    private cliService;
    constructor(cliService: any);
    process(items: any[]): Promise<any[]>;
    canBatch(item: any): boolean;
    estimateMemoryUsage(item: any): number;
    private groupByOperation;
    private processOperationBatch;
    private processList;
    private processShow;
    private processStatus;
    private processSingle;
    private groupItemsByRepository;
}
export declare const taskMasterBatchProcessor: AdvancedBatchProcessor<any, any>;
//# sourceMappingURL=batchProcessor.d.ts.map