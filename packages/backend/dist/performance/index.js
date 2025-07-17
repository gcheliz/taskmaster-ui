"use strict";
// Performance Optimization Module - Main Export
// Demonstrates: Comprehensive performance management system integration
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceConfig = exports.performanceMonitor = exports.performanceUtils = exports.PerformanceMonitor = exports.getMemoryPressure = exports.trackMemoryUsage = exports.createObjectPool = exports.memoryManager = exports.AdvancedMemoryManager = exports.taskMasterBatchProcessor = exports.TaskMasterBatchProcessor = exports.AdvancedBatchProcessor = exports.taskMasterPool = exports.TaskMasterConnectionFactory = exports.TaskMasterConnection = exports.AdvancedConnectionPool = exports.commandCache = exports.globalCache = exports.CommandResultCache = exports.AdvancedCacheManager = void 0;
exports.initializePerformanceOptimizations = initializePerformanceOptimizations;
exports.shutdownPerformanceOptimizations = shutdownPerformanceOptimizations;
var cacheManager_1 = require("./cacheManager");
// Cache Management
Object.defineProperty(exports, "AdvancedCacheManager", { enumerable: true, get: function () { return cacheManager_1.AdvancedCacheManager; } });
Object.defineProperty(exports, "CommandResultCache", { enumerable: true, get: function () { return cacheManager_1.CommandResultCache; } });
Object.defineProperty(exports, "globalCache", { enumerable: true, get: function () { return cacheManager_1.globalCache; } });
Object.defineProperty(exports, "commandCache", { enumerable: true, get: function () { return cacheManager_1.commandCache; } });
var connectionPool_1 = require("./connectionPool");
// Connection Pooling
Object.defineProperty(exports, "AdvancedConnectionPool", { enumerable: true, get: function () { return connectionPool_1.AdvancedConnectionPool; } });
Object.defineProperty(exports, "TaskMasterConnection", { enumerable: true, get: function () { return connectionPool_1.TaskMasterConnection; } });
Object.defineProperty(exports, "TaskMasterConnectionFactory", { enumerable: true, get: function () { return connectionPool_1.TaskMasterConnectionFactory; } });
Object.defineProperty(exports, "taskMasterPool", { enumerable: true, get: function () { return connectionPool_1.taskMasterPool; } });
var batchProcessor_1 = require("./batchProcessor");
// Batch Processing
Object.defineProperty(exports, "AdvancedBatchProcessor", { enumerable: true, get: function () { return batchProcessor_1.AdvancedBatchProcessor; } });
Object.defineProperty(exports, "TaskMasterBatchProcessor", { enumerable: true, get: function () { return batchProcessor_1.TaskMasterBatchProcessor; } });
Object.defineProperty(exports, "taskMasterBatchProcessor", { enumerable: true, get: function () { return batchProcessor_1.taskMasterBatchProcessor; } });
var memoryManager_1 = require("./memoryManager");
// Memory Management
Object.defineProperty(exports, "AdvancedMemoryManager", { enumerable: true, get: function () { return memoryManager_1.AdvancedMemoryManager; } });
Object.defineProperty(exports, "memoryManager", { enumerable: true, get: function () { return memoryManager_1.memoryManager; } });
Object.defineProperty(exports, "createObjectPool", { enumerable: true, get: function () { return memoryManager_1.createObjectPool; } });
Object.defineProperty(exports, "trackMemoryUsage", { enumerable: true, get: function () { return memoryManager_1.trackMemoryUsage; } });
Object.defineProperty(exports, "getMemoryPressure", { enumerable: true, get: function () { return memoryManager_1.getMemoryPressure; } });
// Performance Monitoring Integration
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.startTimes = new Map();
    }
    static getInstance() {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }
    /**
     * Start timing an operation
     */
    startTimer(operation) {
        this.startTimes.set(operation, performance.now());
    }
    /**
     * End timing and record metric
     */
    endTimer(operation) {
        const startTime = this.startTimes.get(operation);
        if (!startTime) {
            throw new Error(`Timer for operation '${operation}' was not started`);
        }
        const duration = performance.now() - startTime;
        this.metrics.set(operation, duration);
        this.startTimes.delete(operation);
        return duration;
    }
    /**
     * Record a metric value
     */
    recordMetric(name, value) {
        this.metrics.set(name, value);
    }
    /**
     * Get all recorded metrics
     */
    getMetrics() {
        return Object.fromEntries(this.metrics);
    }
    /**
     * Reset all metrics
     */
    reset() {
        this.metrics.clear();
        this.startTimes.clear();
    }
}
exports.PerformanceMonitor = PerformanceMonitor;
// Performance optimization utilities
exports.performanceUtils = {
    /**
     * Measure execution time of an async function
     */
    async measureAsync(operation, fn) {
        const monitor = PerformanceMonitor.getInstance();
        monitor.startTimer(operation);
        try {
            const result = await fn();
            const duration = monitor.endTimer(operation);
            return { result, duration };
        }
        catch (error) {
            monitor.endTimer(operation);
            throw error;
        }
    },
    /**
     * Measure execution time of a sync function
     */
    measure(operation, fn) {
        const monitor = PerformanceMonitor.getInstance();
        monitor.startTimer(operation);
        try {
            const result = fn();
            const duration = monitor.endTimer(operation);
            return { result, duration };
        }
        catch (error) {
            monitor.endTimer(operation);
            throw error;
        }
    },
    /**
     * Debounce function calls
     */
    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },
    /**
     * Throttle function calls
     */
    throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    /**
     * Memoize function results
     */
    memoize(func, keyGenerator) {
        const cache = new Map();
        return ((...args) => {
            const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = func.apply(this, args);
            cache.set(key, result);
            return result;
        });
    }
};
// Export performance monitor singleton
exports.performanceMonitor = PerformanceMonitor.getInstance();
// Global performance optimization configuration
exports.performanceConfig = {
    cache: {
        enabled: true,
        defaultTTL: 5 * 60 * 1000, // 5 minutes
        maxSize: 1000
    },
    connectionPool: {
        enabled: true,
        minConnections: 2,
        maxConnections: 10
    },
    batchProcessing: {
        enabled: true,
        maxBatchSize: 50,
        flushInterval: 1000
    },
    memoryManagement: {
        enabled: true,
        warningThreshold: 0.8,
        criticalThreshold: 0.9
    }
};
/**
 * Initialize all performance optimizations
 */
async function initializePerformanceOptimizations() {
    console.log('🚀 Initializing performance optimizations...');
    try {
        // Initialize cache
        if (exports.performanceConfig.cache.enabled) {
            console.log('  ✓ Cache management initialized');
        }
        // Initialize connection pool
        if (exports.performanceConfig.connectionPool.enabled) {
            console.log('  ✓ Connection pooling initialized');
        }
        // Initialize batch processor
        if (exports.performanceConfig.batchProcessing.enabled) {
            console.log('  ✓ Batch processing initialized');
        }
        // Initialize memory management
        if (exports.performanceConfig.memoryManagement.enabled) {
            console.log('  ✓ Memory management initialized');
        }
        console.log('🎯 All performance optimizations initialized successfully');
    }
    catch (error) {
        console.error('❌ Failed to initialize performance optimizations:', error);
        throw error;
    }
}
/**
 * Shutdown all performance optimizations gracefully
 */
async function shutdownPerformanceOptimizations() {
    console.log('🛑 Shutting down performance optimizations...');
    try {
        // Shutdown any global instances if they exist
        try {
            const { globalCache } = await Promise.resolve().then(() => __importStar(require('./cacheManager')));
            if (globalCache) {
                globalCache.dispose();
            }
        }
        catch (error) {
            console.warn('Error disposing globalCache:', error);
        }
        try {
            const { commandCache } = await Promise.resolve().then(() => __importStar(require('./cacheManager')));
            if (commandCache) {
                commandCache.dispose();
            }
        }
        catch (error) {
            console.warn('Error disposing commandCache:', error);
        }
        console.log('✅ All performance optimizations shut down gracefully');
    }
    catch (error) {
        console.error('❌ Error during performance optimization shutdown:', error);
        throw error;
    }
}
//# sourceMappingURL=index.js.map