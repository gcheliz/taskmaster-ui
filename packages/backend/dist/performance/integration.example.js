"use strict";
// Performance Optimization Integration Example
// Demonstrates: Real-world integration of all performance optimization techniques
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizedTaskMasterService = void 0;
exports.demonstrateOptimizedTaskMaster = demonstrateOptimizedTaskMaster;
const index_1 = require("./index");
/**
 * Integrated TaskMaster Performance Service
 * Combines all optimization techniques for maximum efficiency
 */
class OptimizedTaskMasterService {
    constructor() {
        // Initialize cache with intelligent configuration
        this.cache = new index_1.AdvancedCacheManager({
            maxSize: 2000,
            defaultTTL: 10 * 60 * 1000, // 10 minutes
            enableStatistics: true,
            enableCompression: true,
            compressionThreshold: 2048 // 2KB
        });
        // Initialize connection pool for CLI processes
        this.connectionPool = new index_1.AdvancedConnectionPool(new index_1.TaskMasterConnectionFactory('/default/repo'), {
            minConnections: 3,
            maxConnections: 15,
            acquireTimeoutMs: 8000,
            idleTimeoutMs: 600000, // 10 minutes
            healthCheckInterval: 90000 // 1.5 minutes
        });
        // Initialize batch processor for request optimization
        this.batchProcessor = new index_1.AdvancedBatchProcessor(new index_1.TaskMasterBatchProcessor(this), {
            maxBatchSize: 75,
            flushInterval: 800,
            maxWaitTime: 3000,
            concurrencyLimit: 8,
            enableRetries: true,
            maxRetries: 3
        });
        // Initialize memory manager for leak prevention
        this.memoryManager = new index_1.AdvancedMemoryManager({
            enableMonitoring: true,
            enableGCOptimization: true,
            warningThreshold: 0.75,
            criticalThreshold: 0.9,
            gcInterval: 45000 // 45 seconds
        });
        this.setupPerformanceMonitoring();
    }
    /**
     * High-performance task listing with all optimizations
     */
    async listTasks(repositoryPath, options = {}) {
        return index_1.performanceUtils.measureAsync('listTasks', async () => {
            // 1. Check cache first
            const cacheKey = this.generateCacheKey('list', repositoryPath, options);
            const cached = await this.cache.get(cacheKey);
            if (cached) {
                index_1.performanceMonitor.recordMetric('cache_hit_list', 1);
                return cached;
            }
            // 2. Use batch processing for multiple similar requests
            if (this.shouldBatch('list', options)) {
                return this.batchProcessor.add({
                    operation: 'list',
                    repositoryPath,
                    arguments: options
                }, this.calculatePriority('list', options));
            }
            // 3. Direct execution with connection pooling
            const connection = await this.connectionPool.acquire();
            try {
                const result = await this.executeOnConnection(connection, 'list', repositoryPath, options);
                // 4. Cache the result with intelligent TTL
                await this.cache.set(cacheKey, result, this.calculateTTL('list', result));
                index_1.performanceMonitor.recordMetric('cache_miss_list', 1);
                return result;
            }
            finally {
                await this.connectionPool.release(connection);
            }
        });
    }
    /**
     * Optimized task detail retrieval
     */
    async getTask(repositoryPath, taskId, options = {}) {
        return index_1.performanceUtils.measureAsync('getTask', async () => {
            const cacheKey = this.generateCacheKey('show', repositoryPath, { id: taskId, ...options });
            // Memory-efficient object tracking
            this.memoryManager.trackObject({ repositoryPath, taskId }, 'task_request');
            // Check cache with compression
            const cached = await this.cache.get(cacheKey);
            if (cached) {
                return cached;
            }
            // Batch similar requests
            const result = await this.batchProcessor.add({
                operation: 'show',
                repositoryPath,
                arguments: { id: taskId, ...options }
            }, this.calculatePriority('show', { id: taskId }));
            // Cache with task-specific TTL
            await this.cache.set(cacheKey, result, this.calculateTTL('show', result));
            return result;
        });
    }
    /**
     * Memory-optimized bulk operations
     */
    async processBulkTasks(operations) {
        const measureResult = await index_1.performanceUtils.measureAsync('processBulkTasks', async () => {
            // Check memory pressure before processing
            const memoryCheck = this.memoryManager.checkMemoryPressure();
            if (memoryCheck.level === 'critical') {
                await this.memoryManager.optimizeMemory();
            }
            // Group operations for optimal batching
            const groupedOps = this.groupOperations(operations);
            const results = [];
            for (const [batchType, ops] of groupedOps.entries()) {
                // Process each group with appropriate optimization
                const batchResults = await Promise.all(ops.map(op => this.batchProcessor.add(op, this.calculatePriority(op.operation, op.arguments))));
                results.push(...batchResults);
            }
            return results;
        });
        return measureResult.result;
    }
    /**
     * Intelligent cache invalidation
     */
    async invalidateCache(repositoryPath, operation) {
        const pattern = operation
            ? new RegExp(`^${this.escapeRegex(repositoryPath)}:${operation}:`)
            : new RegExp(`^${this.escapeRegex(repositoryPath)}:`);
        return this.cache.invalidate({ pattern });
    }
    /**
     * Get comprehensive performance metrics
     */
    getPerformanceReport() {
        return {
            timestamp: new Date().toISOString(),
            cache: this.cache.getPerformanceMetrics(),
            connectionPool: this.connectionPool.getPerformanceMetrics(),
            batchProcessor: this.batchProcessor.getPerformanceMetrics(),
            memory: this.memoryManager.generateMemoryReport(),
            generalMetrics: index_1.performanceMonitor.getMetrics(),
            recommendations: this.generateRecommendations()
        };
    }
    /**
     * Optimize all subsystems
     */
    async optimizePerformance() {
        const results = {
            cache: await this.optimizeCache(),
            memory: await this.memoryManager.optimizeMemory(),
            connections: await this.optimizeConnections(),
            timestamp: new Date().toISOString()
        };
        index_1.performanceMonitor.recordMetric('optimization_cycles', 1);
        return results;
    }
    /**
     * Graceful shutdown with cleanup
     */
    async shutdown() {
        console.log('🛑 Shutting down optimized TaskMaster service...');
        await Promise.all([
            this.batchProcessor.shutdown(),
            this.connectionPool.shutdown(),
            this.memoryManager.shutdown()
        ]);
        this.cache.dispose();
        console.log('✅ Optimized TaskMaster service shut down successfully');
    }
    // Private optimization methods
    setupPerformanceMonitoring() {
        // Monitor cache performance
        this.cache.on('cache:hit', () => {
            index_1.performanceMonitor.recordMetric('cache_hits_total', 1);
        });
        this.cache.on('cache:miss', () => {
            index_1.performanceMonitor.recordMetric('cache_misses_total', 1);
        });
        // Monitor memory pressure
        this.memoryManager.on('memory:warning', (data) => {
            console.warn('⚠️ Memory warning:', data);
        });
        this.memoryManager.on('memory:critical', (data) => {
            console.error('🚨 Critical memory pressure:', data);
            this.memoryManager.optimizeMemory();
        });
        // Monitor connection pool health
        this.connectionPool.on('connection:create:error', (data) => {
            console.error('❌ Connection creation failed:', data);
        });
    }
    generateCacheKey(operation, repositoryPath, args) {
        const argsHash = Buffer.from(JSON.stringify(args, Object.keys(args).sort())).toString('base64');
        return `${repositoryPath}:${operation}:${argsHash}`;
    }
    shouldBatch(operation, options) {
        // Only batch read operations
        const batchableOps = ['list', 'show', 'status', 'next'];
        return batchableOps.includes(operation) && !options.immediate;
    }
    calculatePriority(operation, args) {
        const priorityMap = {
            'next': 10, // Highest priority
            'show': 8, // High priority
            'status': 6, // Medium priority
            'list': 4, // Low priority
            'complexity': 2 // Lowest priority
        };
        let priority = priorityMap[operation] || 5;
        // Boost priority for urgent tasks
        if (args.urgent)
            priority += 3;
        if (args.id && args.id.includes('urgent'))
            priority += 2;
        return priority;
    }
    calculateTTL(operation, result) {
        const baseTTLs = {
            'list': 3 * 60 * 1000, // 3 minutes
            'show': 8 * 60 * 1000, // 8 minutes
            'status': 2 * 60 * 1000, // 2 minutes
            'complexity': 60 * 60 * 1000, // 1 hour
            'next': 45 * 1000 // 45 seconds
        };
        let ttl = baseTTLs[operation] || 5 * 60 * 1000;
        // Adjust TTL based on result characteristics
        if (result?.data?.length > 100)
            ttl *= 1.5; // Larger results cache longer
        if (result?.complexity === 'high')
            ttl *= 2; // Complex results cache longer
        return ttl;
    }
    groupOperations(operations) {
        const groups = new Map();
        for (const op of operations) {
            const groupKey = `${op.operation}:${op.repositoryPath}`;
            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
            }
            groups.get(groupKey).push(op);
        }
        return groups;
    }
    async executeOnConnection(connection, operation, repositoryPath, options) {
        // Simulate command execution
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        return {
            success: true,
            data: `${operation} result for ${repositoryPath}`,
            timestamp: new Date().toISOString(),
            connectionId: connection.id
        };
    }
    async optimizeCache() {
        const beforeStats = this.cache.getStatistics();
        const cleanedCount = this.cache.cleanup();
        const afterStats = this.cache.getStatistics();
        return {
            cleanedEntries: cleanedCount,
            memoryFreed: beforeStats.memoryUsage - afterStats.memoryUsage,
            beforeStats,
            afterStats
        };
    }
    async optimizeConnections() {
        await this.connectionPool.performHealthCheck();
        return this.connectionPool.getStatistics();
    }
    generateRecommendations() {
        const recommendations = [];
        const cacheStats = this.cache.getStatistics();
        const memoryReport = this.memoryManager.generateMemoryReport();
        const poolStats = this.connectionPool.getStatistics();
        // Cache recommendations
        if (cacheStats.hitRate < 0.7) {
            recommendations.push('Consider increasing cache TTL or cache size to improve hit rate');
        }
        // Memory recommendations
        if (memoryReport.summary.heapUtilization > 0.8) {
            recommendations.push('High memory usage detected - consider memory optimization');
        }
        // Connection pool recommendations
        if (poolStats.pendingRequests > 5) {
            recommendations.push('Consider increasing connection pool size to reduce wait times');
        }
        // Batch processing recommendations
        const batchStats = this.batchProcessor.getStatistics();
        if (batchStats.averageBatchSize < this.batchProcessor['config'].maxBatchSize * 0.5) {
            recommendations.push('Batch utilization is low - consider reducing flush interval');
        }
        return recommendations;
    }
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
exports.OptimizedTaskMasterService = OptimizedTaskMasterService;
// Usage Example
async function demonstrateOptimizedTaskMaster() {
    console.log('🚀 Starting TaskMaster Performance Optimization Demo');
    const service = new OptimizedTaskMasterService();
    try {
        // Simulate realistic workload
        console.log('📊 Processing sample workload...');
        const startTime = performance.now();
        // Mixed operations to demonstrate all optimizations
        const operations = [
            { repositoryPath: '/project/alpha', operation: 'list', arguments: {} },
            { repositoryPath: '/project/alpha', operation: 'show', arguments: { id: '1.1' } },
            { repositoryPath: '/project/beta', operation: 'list', arguments: { status: 'pending' } },
            { repositoryPath: '/project/alpha', operation: 'show', arguments: { id: '1.2' } },
            { repositoryPath: '/project/gamma', operation: 'status', arguments: {} }
        ];
        // Execute operations (should benefit from caching and batching)
        await service.processBulkTasks(operations);
        // Execute again to demonstrate cache hits
        await service.processBulkTasks(operations);
        const duration = performance.now() - startTime;
        // Generate performance report
        const report = service.getPerformanceReport();
        console.log('📈 Performance Report:');
        console.log(`   Total Duration: ${duration.toFixed(2)}ms`);
        console.log(`   Cache Hit Rate: ${(report.cache.hitRate * 100).toFixed(1)}%`);
        console.log(`   Memory Usage: ${(report.memory.summary.heapUtilization * 100).toFixed(1)}%`);
        console.log(`   Active Connections: ${report.connectionPool.totalConnections}`);
        console.log(`   Batch Efficiency: ${(report.batchProcessor.efficiency.batchUtilization * 100).toFixed(1)}%`);
        if (report.recommendations.length > 0) {
            console.log('💡 Recommendations:');
            report.recommendations.forEach((rec) => console.log(`   • ${rec}`));
        }
        // Demonstrate optimization
        console.log('🔧 Running optimization...');
        const optimizationResults = await service.optimizePerformance();
        console.log('   ✓ Optimization completed');
    }
    finally {
        await service.shutdown();
    }
    console.log('🎯 TaskMaster Performance Optimization Demo Completed!');
}
// Run demo if executed directly
if (require.main === module) {
    demonstrateOptimizedTaskMaster().catch(console.error);
}
//# sourceMappingURL=integration.example.js.map