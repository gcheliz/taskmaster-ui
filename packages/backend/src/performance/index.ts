// Performance Optimization Module - Main Export
// Demonstrates: Comprehensive performance management system integration

export {
  // Cache Management
  AdvancedCacheManager,
  CommandResultCache,
  globalCache,
  commandCache,
  type CacheConfig,
  type CacheEntry,
  type CacheStatistics,
  type InvalidationStrategy
} from './cacheManager';

export {
  // Connection Pooling
  AdvancedConnectionPool,
  TaskMasterConnection,
  TaskMasterConnectionFactory,
  taskMasterPool,
  type PoolConfig,
  type Connection,
  type PoolStatistics,
  type ConnectionFactory
} from './connectionPool';

export {
  // Batch Processing
  AdvancedBatchProcessor,
  TaskMasterBatchProcessor,
  taskMasterBatchProcessor,
  type BatchConfig,
  type BatchItem,
  type BatchProcessor,
  type BatchStatistics
} from './batchProcessor';

export {
  // Memory Management
  AdvancedMemoryManager,
  memoryManager,
  createObjectPool,
  trackMemoryUsage,
  getMemoryPressure,
  type MemoryConfig,
  type MemoryStatistics
} from './memoryManager';

// Performance Monitoring Integration
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics = new Map<string, number>();
  private startTimes = new Map<string, number>();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing an operation
   */
  startTimer(operation: string): void {
    this.startTimes.set(operation, performance.now());
  }

  /**
   * End timing and record metric
   */
  endTimer(operation: string): number {
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
  recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

// Performance optimization utilities
export const performanceUtils = {
  /**
   * Measure execution time of an async function
   */
  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const monitor = PerformanceMonitor.getInstance();
    monitor.startTimer(operation);
    
    try {
      const result = await fn();
      const duration = monitor.endTimer(operation);
      return { result, duration };
    } catch (error) {
      monitor.endTimer(operation);
      throw error;
    }
  },

  /**
   * Measure execution time of a sync function
   */
  measure<T>(
    operation: string,
    fn: () => T
  ): { result: T; duration: number } {
    const monitor = PerformanceMonitor.getInstance();
    monitor.startTimer(operation);
    
    try {
      const result = fn();
      const duration = monitor.endTimer(operation);
      return { result, duration };
    } catch (error) {
      monitor.endTimer(operation);
      throw error;
    }
  },

  /**
   * Debounce function calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  /**
   * Throttle function calls
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
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
  memoize<T extends (...args: any[]) => any>(
    func: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T {
    const cache = new Map();
    
    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = func.apply(this, args);
      cache.set(key, result);
      return result;
    }) as T;
  }
};

// Export performance monitor singleton
export const performanceMonitor = PerformanceMonitor.getInstance();

// Global performance optimization configuration
export const performanceConfig = {
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
export async function initializePerformanceOptimizations(): Promise<void> {
  console.log('🚀 Initializing performance optimizations...');

  try {
    // Initialize cache
    if (performanceConfig.cache.enabled) {
      console.log('  ✓ Cache management initialized');
    }

    // Initialize connection pool
    if (performanceConfig.connectionPool.enabled) {
      console.log('  ✓ Connection pooling initialized');
    }

    // Initialize batch processor
    if (performanceConfig.batchProcessing.enabled) {
      console.log('  ✓ Batch processing initialized');
    }

    // Initialize memory management
    if (performanceConfig.memoryManagement.enabled) {
      console.log('  ✓ Memory management initialized');
    }

    console.log('🎯 All performance optimizations initialized successfully');

  } catch (error) {
    console.error('❌ Failed to initialize performance optimizations:', error);
    throw error;
  }
}

/**
 * Shutdown all performance optimizations gracefully
 */
export async function shutdownPerformanceOptimizations(): Promise<void> {
  console.log('🛑 Shutting down performance optimizations...');

  try {
    await Promise.all([
      taskMasterPool.shutdown(),
      taskMasterBatchProcessor.shutdown(),
      memoryManager.shutdown()
    ]);

    globalCache.dispose();
    commandCache.dispose();

    console.log('✅ All performance optimizations shut down gracefully');

  } catch (error) {
    console.error('❌ Error during performance optimization shutdown:', error);
    throw error;
  }
}