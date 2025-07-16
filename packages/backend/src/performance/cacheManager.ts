// Advanced Caching Layer with Performance Optimization
// Demonstrates: LRU cache, TTL management, cache invalidation, performance monitoring

import { EventEmitter } from 'events';

// Cache Configuration Interface
export interface CacheConfig {
  maxSize: number;
  defaultTTL: number; // milliseconds
  enableStatistics: boolean;
  compressionThreshold: number; // bytes
  enableCompression: boolean;
  gcInterval: number; // garbage collection interval
}

// Cache Entry Interface
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

// Cache Statistics
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

// Cache Invalidation Strategy
export interface InvalidationStrategy {
  pattern?: RegExp;
  tags?: string[];
  dependencies?: string[];
  customPredicate?: (entry: CacheEntry) => boolean;
}

/**
 * Advanced LRU Cache with Performance Optimization
 */
export class AdvancedCacheManager<T = any> extends EventEmitter {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder: string[] = [];
  private statistics: CacheStatistics;
  private gcTimer?: NodeJS.Timeout;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    super();
    
    this.config = {
      maxSize: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      enableStatistics: true,
      compressionThreshold: 1024, // 1KB
      enableCompression: true,
      gcInterval: 60 * 1000, // 1 minute
      ...config
    };

    this.statistics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalOperations: 0,
      evictions: 0,
      memoryUsage: 0,
      entryCount: 0,
      averageResponseTime: 0,
      compressionRatio: 0
    };

    this.startGarbageCollection();
  }

  /**
   * Get value from cache with performance tracking
   */
  async get(key: string): Promise<T | null> {
    const startTime = performance.now();
    
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        this.updateStatistics('miss', startTime);
        this.emit('cache:miss', { key });
        return null;
      }

      // Check TTL expiration
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        this.updateStatistics('miss', startTime);
        this.emit('cache:expired', { key, entry });
        return null;
      }

      // Update access information
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      
      // Move to end of access order (most recently used)
      this.updateAccessOrder(key);
      
      this.updateStatistics('hit', startTime);
      this.emit('cache:hit', { key, entry });
      
      // Decompress if needed
      const value = entry.compressed ? 
        await this.decompress(entry.value) : entry.value;
        
      return value;
      
    } catch (error) {
      this.emit('cache:error', { operation: 'get', key, error });
      throw error;
    }
  }

  /**
   * Set value in cache with intelligent compression
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    const startTime = performance.now();
    
    try {
      const now = Date.now();
      const entryTTL = ttl || this.config.defaultTTL;
      
      // Calculate size and compress if necessary
      const serializedValue = JSON.stringify(value);
      const size = Buffer.byteLength(serializedValue, 'utf8');
      
      let finalValue = value;
      let compressed = false;
      
      if (this.config.enableCompression && size > this.config.compressionThreshold) {
        finalValue = await this.compress(value);
        compressed = true;
      }

      const entry: CacheEntry<T> = {
        key,
        value: finalValue,
        timestamp: now,
        ttl: entryTTL,
        accessCount: 1,
        lastAccessed: now,
        size,
        compressed
      };

      // Check if we need to evict entries
      await this.ensureCapacity();
      
      // Store entry
      this.cache.set(key, entry);
      this.updateAccessOrder(key);
      
      this.updateMemoryUsage();
      this.emit('cache:set', { key, entry, compressionSaved: compressed ? size * 0.3 : 0 });
      
    } catch (error) {
      this.emit('cache:error', { operation: 'set', key, error });
      throw error;
    }
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.updateMemoryUsage();
      this.emit('cache:delete', { key, entry });
      return true;
    }
    return false;
  }

  /**
   * Advanced cache invalidation with patterns
   */
  invalidate(strategy: InvalidationStrategy): number {
    let invalidatedCount = 0;
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      let shouldInvalidate = false;

      // Pattern-based invalidation
      if (strategy.pattern && strategy.pattern.test(key)) {
        shouldInvalidate = true;
      }

      // Tag-based invalidation (would require tag tracking)
      if (strategy.tags && this.hasMatchingTags(entry, strategy.tags)) {
        shouldInvalidate = true;
      }

      // Custom predicate
      if (strategy.customPredicate && strategy.customPredicate(entry)) {
        shouldInvalidate = true;
      }

      if (shouldInvalidate) {
        keysToDelete.push(key);
      }
    }

    // Perform deletions
    keysToDelete.forEach(key => {
      this.delete(key);
      invalidatedCount++;
    });

    this.emit('cache:invalidated', { strategy, count: invalidatedCount });
    return invalidatedCount;
  }

  /**
   * Bulk operations for better performance
   */
  async mget(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();
    
    // Parallel processing for better performance
    const promises = keys.map(async (key) => {
      const value = await this.get(key);
      return { key, value };
    });

    const resolvedResults = await Promise.all(promises);
    
    resolvedResults.forEach(({ key, value }) => {
      results.set(key, value);
    });

    return results;
  }

  /**
   * Bulk set operation
   */
  async mset(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    const promises = entries.map(({ key, value, ttl }) => 
      this.set(key, value, ttl)
    );

    await Promise.all(promises);
  }

  /**
   * Cache warming strategies
   */
  async warm(warmupFunction: () => Promise<Array<{ key: string; value: T }>>): Promise<void> {
    try {
      this.emit('cache:warming:start');
      
      const entries = await warmupFunction();
      await this.mset(entries);
      
      this.emit('cache:warming:complete', { count: entries.length });
    } catch (error) {
      this.emit('cache:warming:error', { error });
      throw error;
    }
  }

  /**
   * Get comprehensive cache statistics
   */
  getStatistics(): CacheStatistics {
    const totalOps = this.statistics.hits + this.statistics.misses;
    
    return {
      ...this.statistics,
      hitRate: totalOps > 0 ? this.statistics.hits / totalOps : 0,
      totalOperations: totalOps,
      entryCount: this.cache.size,
      memoryUsage: this.calculateMemoryUsage(),
      compressionRatio: this.calculateCompressionRatio()
    };
  }

  /**
   * Performance monitoring and analytics
   */
  getPerformanceMetrics(): any {
    const stats = this.getStatistics();
    const now = Date.now();
    
    // Calculate hot keys (most accessed)
    const hotKeys = Array.from(this.cache.entries())
      .sort((a, b) => b[1].accessCount - a[1].accessCount)
      .slice(0, 10)
      .map(([key, entry]) => ({ key, accessCount: entry.accessCount }));

    // Calculate age distribution
    const ageDistribution = this.calculateAgeDistribution();

    return {
      ...stats,
      hotKeys,
      ageDistribution,
      efficiency: {
        memoryEfficiency: this.calculateMemoryEfficiency(),
        timeEfficiency: stats.averageResponseTime,
        compressionEfficiency: stats.compressionRatio
      }
    };
  }

  /**
   * Clean up expired entries and optimize memory
   */
  cleanup(): number {
    let cleanedCount = 0;
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.delete(key);
      cleanedCount++;
    });

    this.statistics.evictions += cleanedCount;
    this.emit('cache:cleanup', { cleanedCount });
    
    return cleanedCount;
  }

  /**
   * Reset cache and statistics
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.statistics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalOperations: 0,
      evictions: 0,
      memoryUsage: 0,
      entryCount: 0,
      averageResponseTime: 0,
      compressionRatio: 0
    };
    
    this.emit('cache:cleared');
  }

  /**
   * Dispose cache and cleanup resources
   */
  dispose(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
      this.gcTimer = undefined;
    }
    
    this.clear();
    this.removeAllListeners();
  }

  // Private Helper Methods

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private async ensureCapacity(): Promise<void> {
    while (this.cache.size >= this.config.maxSize) {
      const lruKey = this.accessOrder[0];
      if (lruKey) {
        this.delete(lruKey);
        this.statistics.evictions++;
      }
    }
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private updateStatistics(operation: 'hit' | 'miss', startTime: number): void {
    if (!this.config.enableStatistics) return;

    const duration = performance.now() - startTime;
    
    if (operation === 'hit') {
      this.statistics.hits++;
    } else {
      this.statistics.misses++;
    }

    // Update average response time
    const totalOps = this.statistics.hits + this.statistics.misses;
    this.statistics.averageResponseTime = 
      (this.statistics.averageResponseTime * (totalOps - 1) + duration) / totalOps;
  }

  private updateMemoryUsage(): void {
    this.statistics.memoryUsage = this.calculateMemoryUsage();
  }

  private calculateMemoryUsage(): number {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  private calculateCompressionRatio(): number {
    let compressedEntries = 0;
    let totalEntries = 0;
    
    for (const entry of this.cache.values()) {
      totalEntries++;
      if (entry.compressed) {
        compressedEntries++;
      }
    }
    
    return totalEntries > 0 ? compressedEntries / totalEntries : 0;
  }

  private calculateMemoryEfficiency(): number {
    const theoreticalSize = this.cache.size * 1024; // Assume 1KB per entry
    const actualSize = this.calculateMemoryUsage();
    return actualSize > 0 ? theoreticalSize / actualSize : 1;
  }

  private calculateAgeDistribution(): any {
    const now = Date.now();
    const buckets = { fresh: 0, medium: 0, old: 0 };
    
    for (const entry of this.cache.values()) {
      const age = now - entry.timestamp;
      const ageRatio = age / entry.ttl;
      
      if (ageRatio < 0.3) buckets.fresh++;
      else if (ageRatio < 0.7) buckets.medium++;
      else buckets.old++;
    }
    
    return buckets;
  }

  private hasMatchingTags(entry: CacheEntry<T>, tags: string[]): boolean {
    // This would require implementing tag tracking
    // For now, return false as a placeholder
    return false;
  }

  private async compress(value: T): Promise<T> {
    // Simple compression simulation
    // In production, use libraries like zlib or brotli
    return value;
  }

  private async decompress(value: T): Promise<T> {
    // Simple decompression simulation
    return value;
  }

  private startGarbageCollection(): void {
    if (this.config.gcInterval > 0) {
      this.gcTimer = setInterval(() => {
        this.cleanup();
      }, this.config.gcInterval);
    }
  }
}

// Specialized cache implementations

/**
 * Command Result Cache with intelligent invalidation
 */
export class CommandResultCache extends AdvancedCacheManager<any> {
  constructor() {
    super({
      maxSize: 500,
      defaultTTL: 10 * 60 * 1000, // 10 minutes
      enableCompression: true,
      compressionThreshold: 512
    });
  }

  /**
   * Generate cache key for command
   */
  private generateCommandKey(repositoryPath: string, operation: string, args: any): string {
    const argsHash = this.hashObject(args);
    return `cmd:${repositoryPath}:${operation}:${argsHash}`;
  }

  /**
   * Cache command result
   */
  async cacheCommandResult(
    repositoryPath: string, 
    operation: string, 
    args: any, 
    result: any
  ): Promise<void> {
    const key = this.generateCommandKey(repositoryPath, operation, args);
    await this.set(key, result, this.getTTLForOperation(operation));
  }

  /**
   * Get cached command result
   */
  async getCachedCommandResult(
    repositoryPath: string, 
    operation: string, 
    args: any
  ): Promise<any | null> {
    const key = this.generateCommandKey(repositoryPath, operation, args);
    return await this.get(key);
  }

  /**
   * Invalidate cache for repository
   */
  invalidateRepository(repositoryPath: string): number {
    return this.invalidate({
      pattern: new RegExp(`^cmd:${this.escapeRegex(repositoryPath)}:`)
    });
  }

  private getTTLForOperation(operation: string): number {
    // Different operations have different cache lifetimes
    const ttlMap: Record<string, number> = {
      'list': 2 * 60 * 1000,      // 2 minutes
      'show': 5 * 60 * 1000,      // 5 minutes
      'status': 1 * 60 * 1000,    // 1 minute
      'complexity': 30 * 60 * 1000, // 30 minutes
      'next': 30 * 1000           // 30 seconds
    };
    
    return ttlMap[operation] || (this as any).config.defaultTTL;
  }

  private hashObject(obj: any): string {
    return Buffer.from(JSON.stringify(obj, Object.keys(obj).sort())).toString('base64');
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Export instances
export const globalCache = new AdvancedCacheManager();
export const commandCache = new CommandResultCache();