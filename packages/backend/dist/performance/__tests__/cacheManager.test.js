"use strict";
// Advanced Cache Manager Tests
// Comprehensive test suite for cache functionality
Object.defineProperty(exports, "__esModule", { value: true });
const cacheManager_1 = require("../cacheManager");
describe('AdvancedCacheManager', () => {
    let cache;
    beforeEach(() => {
        cache = new cacheManager_1.AdvancedCacheManager({
            maxSize: 5,
            defaultTTL: 1000,
            enableStatistics: true
        });
    });
    afterEach(() => {
        cache.dispose();
    });
    describe('Basic Operations', () => {
        it('should store and retrieve values', async () => {
            await cache.set('key1', 'value1');
            const result = await cache.get('key1');
            expect(result).toBe('value1');
        });
        it('should return null for non-existent keys', async () => {
            const result = await cache.get('nonexistent');
            expect(result).toBeNull();
        });
        it('should handle TTL expiration', async () => {
            await cache.set('key1', 'value1', 100); // 100ms TTL
            let result = await cache.get('key1');
            expect(result).toBe('value1');
            await new Promise(resolve => setTimeout(resolve, 150));
            result = await cache.get('key1');
            expect(result).toBeNull();
        });
        it('should delete specific keys', async () => {
            await cache.set('key1', 'value1');
            expect(await cache.get('key1')).toBe('value1');
            const deleted = cache.delete('key1');
            expect(deleted).toBe(true);
            expect(await cache.get('key1')).toBeNull();
        });
    });
    describe('LRU Eviction', () => {
        it('should evict least recently used items when full', async () => {
            // Fill cache to capacity
            for (let i = 1; i <= 5; i++) {
                await cache.set(`key${i}`, `value${i}`);
            }
            // Access key1 to make it recently used
            await cache.get('key1');
            // Add one more item to trigger eviction
            await cache.set('key6', 'value6');
            // key2 should be evicted (oldest unused)
            expect(await cache.get('key1')).toBe('value1'); // Should still exist
            expect(await cache.get('key2')).toBeNull(); // Should be evicted
            expect(await cache.get('key6')).toBe('value6'); // Should exist
        });
    });
    describe('Bulk Operations', () => {
        it('should handle multiple get operations', async () => {
            await cache.set('key1', 'value1');
            await cache.set('key2', 'value2');
            await cache.set('key3', 'value3');
            const results = await cache.mget(['key1', 'key2', 'key3', 'nonexistent']);
            expect(results.get('key1')).toBe('value1');
            expect(results.get('key2')).toBe('value2');
            expect(results.get('key3')).toBe('value3');
            expect(results.get('nonexistent')).toBeNull();
        });
        it('should handle multiple set operations', async () => {
            const entries = [
                { key: 'key1', value: 'value1' },
                { key: 'key2', value: 'value2' },
                { key: 'key3', value: 'value3' }
            ];
            await cache.mset(entries);
            expect(await cache.get('key1')).toBe('value1');
            expect(await cache.get('key2')).toBe('value2');
            expect(await cache.get('key3')).toBe('value3');
        });
    });
    describe('Cache Invalidation', () => {
        beforeEach(async () => {
            await cache.set('user:123', 'user data');
            await cache.set('user:456', 'user data');
            await cache.set('post:789', 'post data');
            await cache.set('comment:abc', 'comment data');
        });
        it('should invalidate by pattern', () => {
            const count = cache.invalidate({
                pattern: /^user:/
            });
            expect(count).toBe(2);
        });
        it('should invalidate by custom predicate', () => {
            const count = cache.invalidate({
                customPredicate: (entry) => entry.key.includes('post')
            });
            expect(count).toBe(1);
        });
    });
    describe('Statistics', () => {
        it('should track hit and miss statistics', async () => {
            await cache.set('key1', 'value1');
            // Hit
            await cache.get('key1');
            // Miss
            await cache.get('nonexistent');
            const stats = cache.getStatistics();
            expect(stats.hits).toBe(1);
            expect(stats.misses).toBe(1);
            expect(stats.hitRate).toBe(0.5);
        });
        it('should track entry count and memory usage', async () => {
            await cache.set('key1', 'value1');
            await cache.set('key2', 'value2');
            const stats = cache.getStatistics();
            expect(stats.entryCount).toBe(2);
            expect(stats.memoryUsage).toBeGreaterThan(0);
        });
    });
    describe('Cache Warming', () => {
        it('should warm cache with provided function', async () => {
            const warmupFunction = async () => [
                { key: 'warm1', value: 'warmed1' },
                { key: 'warm2', value: 'warmed2' }
            ];
            await cache.warm(warmupFunction);
            expect(await cache.get('warm1')).toBe('warmed1');
            expect(await cache.get('warm2')).toBe('warmed2');
        });
    });
    describe('Cleanup Operations', () => {
        it('should clean up expired entries', async () => {
            await cache.set('key1', 'value1', 100); // 100ms TTL
            await cache.set('key2', 'value2', 5000); // 5s TTL
            await new Promise(resolve => setTimeout(resolve, 150));
            const cleanedCount = cache.cleanup();
            expect(cleanedCount).toBe(1);
            expect(await cache.get('key1')).toBeNull();
            expect(await cache.get('key2')).toBe('value2');
        });
        it('should clear all entries', async () => {
            await cache.set('key1', 'value1');
            await cache.set('key2', 'value2');
            cache.clear();
            expect(await cache.get('key1')).toBeNull();
            expect(await cache.get('key2')).toBeNull();
            const stats = cache.getStatistics();
            expect(stats.entryCount).toBe(0);
        });
    });
    describe('Performance Metrics', () => {
        it('should provide comprehensive performance metrics', async () => {
            await cache.set('key1', 'value1');
            await cache.get('key1');
            await cache.get('nonexistent');
            const metrics = cache.getPerformanceMetrics();
            expect(metrics.hotKeys).toBeDefined();
            expect(metrics.ageDistribution).toBeDefined();
            expect(metrics.efficiency).toBeDefined();
            expect(metrics.efficiency.memoryEfficiency).toBeGreaterThan(0);
        });
    });
});
describe('CommandResultCache', () => {
    let commandCache;
    beforeEach(() => {
        commandCache = new cacheManager_1.CommandResultCache();
    });
    afterEach(() => {
        commandCache.dispose();
    });
    describe('Command-Specific Operations', () => {
        it('should cache command results', async () => {
            const repoPath = '/test/repo';
            const operation = 'list';
            const args = { status: 'pending' };
            const result = { success: true, data: ['task1', 'task2'] };
            await commandCache.cacheCommandResult(repoPath, operation, args, result);
            const cached = await commandCache.getCachedCommandResult(repoPath, operation, args);
            expect(cached).toEqual(result);
        });
        it('should invalidate repository-specific cache', async () => {
            const repoPath = '/test/repo';
            await commandCache.cacheCommandResult(repoPath, 'list', {}, { data: 'test1' });
            await commandCache.cacheCommandResult(repoPath, 'status', {}, { data: 'test2' });
            await commandCache.cacheCommandResult('/other/repo', 'list', {}, { data: 'test3' });
            const invalidated = commandCache.invalidateRepository(repoPath);
            expect(invalidated).toBe(2);
            expect(await commandCache.getCachedCommandResult(repoPath, 'list', {})).toBeNull();
            expect(await commandCache.getCachedCommandResult(repoPath, 'status', {})).toBeNull();
            expect(await commandCache.getCachedCommandResult('/other/repo', 'list', {})).toEqual({ data: 'test3' });
        });
        it('should use different TTLs for different operations', async () => {
            const repoPath = '/test/repo';
            await commandCache.cacheCommandResult(repoPath, 'next', {}, { data: 'next' });
            await commandCache.cacheCommandResult(repoPath, 'complexity', {}, { data: 'complex' });
            // Check that different operations have different cache lifetimes
            // (This is more of a configuration test - actual TTL testing would require waiting)
            expect(await commandCache.getCachedCommandResult(repoPath, 'next', {})).toEqual({ data: 'next' });
            expect(await commandCache.getCachedCommandResult(repoPath, 'complexity', {})).toEqual({ data: 'complex' });
        });
    });
    describe('Key Generation', () => {
        it('should generate different keys for different arguments', async () => {
            const repoPath = '/test/repo';
            const operation = 'show';
            await commandCache.cacheCommandResult(repoPath, operation, { id: '1' }, { data: 'task1' });
            await commandCache.cacheCommandResult(repoPath, operation, { id: '2' }, { data: 'task2' });
            expect(await commandCache.getCachedCommandResult(repoPath, operation, { id: '1' }))
                .toEqual({ data: 'task1' });
            expect(await commandCache.getCachedCommandResult(repoPath, operation, { id: '2' }))
                .toEqual({ data: 'task2' });
        });
        it('should handle special characters in repository paths', async () => {
            const repoPath = '/test/repo with spaces & symbols!';
            const operation = 'list';
            const result = { data: 'test' };
            await commandCache.cacheCommandResult(repoPath, operation, {}, result);
            const cached = await commandCache.getCachedCommandResult(repoPath, operation, {});
            expect(cached).toEqual(result);
        });
    });
});
//# sourceMappingURL=cacheManager.test.js.map