import { EventEmitter } from 'events';
export interface CacheConfig {
    maxSize: number;
    defaultTTL: number;
    enableStatistics: boolean;
    compressionThreshold: number;
    enableCompression: boolean;
    gcInterval: number;
}
export interface CacheEntry<T = any> {
    key: string;
    value: T;
    timestamp: number;
    ttl: number;
    accessCount: number;
    lastAccessed: number;
    size: number;
    compressed: boolean;
}
export interface CacheStatistics {
    hits: number;
    misses: number;
    hitRate: number;
    totalOperations: number;
    evictions: number;
    memoryUsage: number;
    entryCount: number;
    averageResponseTime: number;
    compressionRatio: number;
}
export interface InvalidationStrategy {
    pattern?: RegExp;
    tags?: string[];
    dependencies?: string[];
    customPredicate?: (entry: CacheEntry) => boolean;
}
/**
 * Advanced LRU Cache with Performance Optimization
 */
export declare class AdvancedCacheManager<T = any> extends EventEmitter {
    private cache;
    private accessOrder;
    private statistics;
    private gcTimer?;
    private config;
    constructor(config?: Partial<CacheConfig>);
    /**
     * Get value from cache with performance tracking
     */
    get(key: string): Promise<T | null>;
    /**
     * Set value in cache with intelligent compression
     */
    set(key: string, value: T, ttl?: number): Promise<void>;
    /**
     * Delete specific key
     */
    delete(key: string): boolean;
    /**
     * Advanced cache invalidation with patterns
     */
    invalidate(strategy: InvalidationStrategy): number;
    /**
     * Bulk operations for better performance
     */
    mget(keys: string[]): Promise<Map<string, T | null>>;
    /**
     * Bulk set operation
     */
    mset(entries: Array<{
        key: string;
        value: T;
        ttl?: number;
    }>): Promise<void>;
    /**
     * Cache warming strategies
     */
    warm(warmupFunction: () => Promise<Array<{
        key: string;
        value: T;
    }>>): Promise<void>;
    /**
     * Get comprehensive cache statistics
     */
    getStatistics(): CacheStatistics;
    /**
     * Performance monitoring and analytics
     */
    getPerformanceMetrics(): any;
    /**
     * Clean up expired entries and optimize memory
     */
    cleanup(): number;
    /**
     * Reset cache and statistics
     */
    clear(): void;
    /**
     * Dispose cache and cleanup resources
     */
    dispose(): void;
    private isExpired;
    private ensureCapacity;
    private updateAccessOrder;
    private removeFromAccessOrder;
    private updateStatistics;
    private updateMemoryUsage;
    private calculateMemoryUsage;
    private calculateCompressionRatio;
    private calculateMemoryEfficiency;
    private calculateAgeDistribution;
    private hasMatchingTags;
    private compress;
    private decompress;
    private startGarbageCollection;
}
/**
 * Command Result Cache with intelligent invalidation
 */
export declare class CommandResultCache extends AdvancedCacheManager<any> {
    constructor();
    /**
     * Generate cache key for command
     */
    private generateCommandKey;
    /**
     * Cache command result
     */
    cacheCommandResult(repositoryPath: string, operation: string, args: any, result: any): Promise<void>;
    /**
     * Get cached command result
     */
    getCachedCommandResult(repositoryPath: string, operation: string, args: any): Promise<any | null>;
    /**
     * Invalidate cache for repository
     */
    invalidateRepository(repositoryPath: string): number;
    private getTTLForOperation;
    private hashObject;
    private escapeRegex;
}
export declare const globalCache: AdvancedCacheManager<any>;
export declare const commandCache: CommandResultCache;
//# sourceMappingURL=cacheManager.d.ts.map