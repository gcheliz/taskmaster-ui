"use strict";
// Advanced Memory Management and Leak Prevention
// Demonstrates: Memory monitoring, garbage collection optimization, leak detection
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryManager = exports.AdvancedMemoryManager = void 0;
exports.createObjectPool = createObjectPool;
exports.trackMemoryUsage = trackMemoryUsage;
exports.getMemoryPressure = getMemoryPressure;
const events_1 = require("events");
// Weak Reference Tracker for Leak Detection
class WeakReferenceTracker {
    constructor() {
        this.references = new WeakSet();
        this.counters = new Map();
    }
    track(obj, category = 'default') {
        this.references.add(obj);
        this.counters.set(category, (this.counters.get(category) || 0) + 1);
    }
    getCount(category) {
        return this.counters.get(category) || 0;
    }
    getAllCounts() {
        return new Map(this.counters);
    }
    reset() {
        this.counters.clear();
    }
}
/**
 * Advanced Memory Manager with Leak Detection
 */
class AdvancedMemoryManager extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.samples = [];
        this.gcStartTime = 0;
        this.gcCount = 0;
        this.totalGCTime = 0;
        this.weakRefTracker = new WeakReferenceTracker();
        this.objectPools = new Map();
        this.config = {
            maxHeapSize: 1024 * 1024 * 1024, // 1GB
            gcInterval: 30000, // 30 seconds
            warningThreshold: 0.8, // 80%
            criticalThreshold: 0.95, // 95%
            leakDetectionInterval: 60000, // 1 minute
            retentionSamples: 100,
            enableMonitoring: true,
            enableGCOptimization: true,
            ...config
        };
        this.initializeMonitoring();
        this.setupGCListeners();
    }
    /**
     * Get current memory statistics
     */
    getStatistics() {
        const memUsage = process.memoryUsage();
        const heapUtilization = memUsage.heapUsed / memUsage.heapTotal;
        return {
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            heapUtilization,
            external: memUsage.external,
            rss: memUsage.rss,
            gcCount: this.gcCount,
            gcTime: this.totalGCTime,
            averageGCTime: this.gcCount > 0 ? this.totalGCTime / this.gcCount : 0,
            memoryLeakSuspected: this.detectMemoryLeak(),
            lastGC: this.getLastGCTime(),
            trend: this.analyzeTrend()
        };
    }
    /**
     * Force garbage collection (if exposed)
     */
    forceGC() {
        if (global.gc) {
            const beforeGC = process.memoryUsage().heapUsed;
            global.gc();
            const afterGC = process.memoryUsage().heapUsed;
            this.emit('gc:forced', {
                beforeGC,
                afterGC,
                freed: beforeGC - afterGC,
                timestamp: new Date().toISOString()
            });
            return true;
        }
        return false;
    }
    /**
     * Create object pool for reusable objects
     */
    createObjectPool(category, factory, reset, maxSize = 100) {
        const pool = [];
        const poolManager = {
            acquire: () => {
                const obj = pool.pop() || factory();
                this.weakRefTracker.track(obj, `pool:${category}`);
                return obj;
            },
            release: (obj) => {
                if (pool.length < maxSize) {
                    reset(obj);
                    pool.push(obj);
                }
            },
            size: () => pool.length,
            clear: () => {
                pool.length = 0;
            }
        };
        this.objectPools.set(category, pool);
        return poolManager;
    }
    /**
     * Track object for leak detection
     */
    trackObject(obj, category = 'tracked') {
        this.weakRefTracker.track(obj, category);
    }
    /**
     * Get object tracking statistics
     */
    getTrackingStatistics() {
        return this.weakRefTracker.getAllCounts();
    }
    /**
     * Optimize memory usage
     */
    async optimizeMemory() {
        const beforeStats = this.getStatistics();
        const optimizations = [];
        try {
            // Clear object pools if they're too large
            for (const [category, pool] of this.objectPools.entries()) {
                if (pool.length > 50) {
                    pool.length = Math.floor(pool.length / 2);
                    optimizations.push(`Reduced ${category} pool size`);
                }
            }
            // Force garbage collection if enabled
            if (this.config.enableGCOptimization && global.gc) {
                global.gc();
                optimizations.push('Forced garbage collection');
            }
            // Wait for GC to complete
            await new Promise(resolve => setTimeout(resolve, 100));
            const afterStats = this.getStatistics();
            this.emit('memory:optimized', {
                beforeStats,
                afterStats,
                optimizations,
                memoryFreed: beforeStats.heapUsed - afterStats.heapUsed
            });
            return {
                beforeOptimization: beforeStats,
                afterOptimization: afterStats,
                optimizations
            };
        }
        catch (error) {
            this.emit('memory:optimization:error', { error: error.message });
            throw error;
        }
    }
    /**
     * Monitor memory pressure and emit warnings
     */
    checkMemoryPressure() {
        const stats = this.getStatistics();
        const { heapUtilization } = stats;
        if (heapUtilization >= this.config.criticalThreshold) {
            this.emit('memory:critical', {
                utilization: heapUtilization,
                heapUsed: stats.heapUsed,
                heapTotal: stats.heapTotal
            });
            return {
                level: 'critical',
                action: 'Immediate cleanup required - consider forcing GC or reducing memory usage',
                statistics: stats
            };
        }
        if (heapUtilization >= this.config.warningThreshold) {
            this.emit('memory:warning', {
                utilization: heapUtilization,
                heapUsed: stats.heapUsed
            });
            return {
                level: 'warning',
                action: 'Monitor closely - consider cleanup operations',
                statistics: stats
            };
        }
        return {
            level: 'normal',
            action: 'Memory usage is normal',
            statistics: stats
        };
    }
    /**
     * Generate memory report
     */
    generateMemoryReport() {
        const stats = this.getStatistics();
        const recommendations = [];
        // Generate recommendations based on statistics
        if (stats.heapUtilization > this.config.warningThreshold) {
            recommendations.push('Consider implementing memory optimization strategies');
        }
        if (stats.memoryLeakSuspected) {
            recommendations.push('Potential memory leak detected - investigate object retention');
        }
        if (stats.averageGCTime > 100) {
            recommendations.push('High GC overhead - consider optimizing object allocation patterns');
        }
        if (this.objectPools.size === 0) {
            recommendations.push('Consider implementing object pooling for frequently allocated objects');
        }
        // Calculate growth rate
        const growthRate = this.calculateGrowthRate();
        const predictedExhaustion = this.predictMemoryExhaustion(growthRate);
        return {
            summary: stats,
            trends: {
                memoryTrend: stats.trend,
                averageGrowthRate: growthRate,
                predictedExhaustion
            },
            recommendations,
            objectPools: Object.fromEntries(Array.from(this.objectPools.entries()).map(([key, pool]) => [key, pool.length])),
            tracking: Object.fromEntries(this.weakRefTracker.getAllCounts())
        };
    }
    /**
     * Shutdown memory manager
     */
    shutdown() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = undefined;
        }
        if (this.leakDetectionTimer) {
            clearInterval(this.leakDetectionTimer);
            this.leakDetectionTimer = undefined;
        }
        // Clear all object pools
        this.objectPools.clear();
        this.weakRefTracker.reset();
        this.emit('memory:manager:shutdown');
    }
    // Private Implementation
    initializeMonitoring() {
        if (!this.config.enableMonitoring)
            return;
        // Memory monitoring
        this.monitoringTimer = setInterval(() => {
            this.collectMemorySample();
            this.checkMemoryPressure();
        }, this.config.gcInterval);
        // Leak detection
        this.leakDetectionTimer = setInterval(() => {
            this.performLeakDetection();
        }, this.config.leakDetectionInterval);
    }
    setupGCListeners() {
        // Hook into GC events if available
        if (process.env.NODE_ENV === 'development' && global.gc) {
            const originalGC = global.gc;
            global.gc = async () => {
                this.gcStartTime = performance.now();
                const result = originalGC();
                const gcTime = performance.now() - this.gcStartTime;
                this.gcCount++;
                this.totalGCTime += gcTime;
                this.emit('gc:complete', {
                    duration: gcTime,
                    count: this.gcCount,
                    memoryAfter: process.memoryUsage()
                });
                return result;
            };
        }
    }
    collectMemorySample() {
        const memUsage = process.memoryUsage();
        const sample = {
            timestamp: Date.now(),
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external,
            rss: memUsage.rss
        };
        this.samples.push(sample);
        // Keep only recent samples
        if (this.samples.length > this.config.retentionSamples) {
            this.samples.shift();
        }
    }
    detectMemoryLeak() {
        if (this.samples.length < 10)
            return false;
        // Simple leak detection: consistent growth over time
        const recent = this.samples.slice(-10);
        const growth = recent.map((sample, index) => index > 0 ? sample.heapUsed - recent[index - 1].heapUsed : 0).slice(1);
        const positiveGrowth = growth.filter(g => g > 0).length;
        return positiveGrowth > 7; // More than 70% of samples show growth
    }
    analyzeTrend() {
        if (this.samples.length < 5)
            return 'stable';
        const recent = this.samples.slice(-5);
        const first = recent[0].heapUsed;
        const last = recent[recent.length - 1].heapUsed;
        const change = (last - first) / first;
        if (change > 0.1)
            return 'increasing';
        if (change < -0.1)
            return 'decreasing';
        return 'stable';
    }
    getLastGCTime() {
        return new Date().toISOString(); // Simplified
    }
    performLeakDetection() {
        const stats = this.getStatistics();
        if (stats.memoryLeakSuspected) {
            this.emit('memory:leak:suspected', {
                heapUsed: stats.heapUsed,
                trend: stats.trend,
                trackingStats: this.getTrackingStatistics()
            });
        }
    }
    calculateGrowthRate() {
        if (this.samples.length < 2)
            return 0;
        const timespan = this.samples[this.samples.length - 1].timestamp - this.samples[0].timestamp;
        const memoryChange = this.samples[this.samples.length - 1].heapUsed - this.samples[0].heapUsed;
        return timespan > 0 ? (memoryChange / timespan) * 1000 : 0; // bytes per second
    }
    predictMemoryExhaustion(growthRate) {
        if (growthRate <= 0)
            return undefined;
        const currentUsage = process.memoryUsage().heapUsed;
        const remainingMemory = this.config.maxHeapSize - currentUsage;
        const timeToExhaustion = remainingMemory / growthRate; // seconds
        if (timeToExhaustion < 3600) { // Less than 1 hour
            const minutes = Math.floor(timeToExhaustion / 60);
            return `Approximately ${minutes} minutes`;
        }
        const hours = Math.floor(timeToExhaustion / 3600);
        return `Approximately ${hours} hours`;
    }
}
exports.AdvancedMemoryManager = AdvancedMemoryManager;
// Memory utilities
/**
 * Create a memory-efficient object pool
 */
function createObjectPool(factory, reset, maxSize = 100) {
    return exports.memoryManager.createObjectPool('default', factory, reset, maxSize);
}
/**
 * Monitor an object for memory leaks
 */
function trackMemoryUsage(obj, category) {
    exports.memoryManager.trackObject(obj, category);
}
/**
 * Get current memory pressure level
 */
function getMemoryPressure() {
    return exports.memoryManager.checkMemoryPressure();
}
// Export singleton instance
exports.memoryManager = new AdvancedMemoryManager({
    enableMonitoring: process.env.NODE_ENV !== 'test',
    enableGCOptimization: true,
    warningThreshold: 0.8,
    criticalThreshold: 0.9
});
//# sourceMappingURL=memoryManager.js.map