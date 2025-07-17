"use strict";
// Advanced Batch Processing and Request Optimization
// Demonstrates: Request batching, parallel processing, memory management
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskMasterBatchProcessor = exports.TaskMasterBatchProcessor = exports.AdvancedBatchProcessor = void 0;
const events_1 = require("events");
/**
 * Advanced Batch Processor with Request Optimization
 */
class AdvancedBatchProcessor extends events_1.EventEmitter {
    constructor(processor, config = {}) {
        super();
        this.processor = processor;
        this.pendingItems = [];
        this.processingBatches = new Set();
        this.currentMemoryUsage = 0;
        this.config = {
            maxBatchSize: 100,
            flushInterval: 1000, // 1 second
            maxWaitTime: 5000, // 5 seconds
            concurrencyLimit: 3,
            enableRetries: true,
            maxRetries: 3,
            retryDelayMs: 1000,
            enableCompression: false,
            memoryThreshold: 50 * 1024 * 1024, // 50MB
            ...config
        };
        this.statistics = {
            totalBatches: 0,
            totalItems: 0,
            averageBatchSize: 0,
            averageProcessingTime: 0,
            successfulBatches: 0,
            failedBatches: 0,
            retryCount: 0,
            memoryUsage: 0,
            throughput: 0,
            lastProcessedAt: new Date().toISOString()
        };
        this.startFlushTimer();
    }
    /**
     * Add item to batch queue
     */
    async add(data, priority = 0, metadata) {
        return new Promise((resolve, reject) => {
            const item = {
                id: this.generateId(),
                data,
                timestamp: Date.now(),
                priority,
                retryCount: 0,
                resolve,
                reject,
                metadata
            };
            // Check if item can be batched
            if (this.processor.canBatch && !this.processor.canBatch(data)) {
                // Process immediately
                this.processSingleItem(item);
                return;
            }
            // Check memory threshold
            const estimatedMemory = this.processor.estimateMemoryUsage?.(data) || 1024;
            if (this.currentMemoryUsage + estimatedMemory > this.config.memoryThreshold) {
                this.flush();
            }
            this.currentMemoryUsage += estimatedMemory;
            this.pendingItems.push(item);
            // Sort by priority (higher priority first)
            this.pendingItems.sort((a, b) => b.priority - a.priority);
            this.emit('item:added', {
                itemId: item.id,
                queueSize: this.pendingItems.length,
                memoryUsage: this.currentMemoryUsage
            });
            // Flush if batch is full or memory threshold reached
            if (this.pendingItems.length >= this.config.maxBatchSize) {
                this.flush();
            }
        });
    }
    /**
     * Force flush all pending items
     */
    async flush() {
        if (this.pendingItems.length === 0) {
            return;
        }
        // Check concurrency limit
        if (this.processingBatches.size >= this.config.concurrencyLimit) {
            this.emit('batch:concurrency:limit', {
                currentBatches: this.processingBatches.size,
                limit: this.config.concurrencyLimit
            });
            return;
        }
        const itemsToProcess = this.pendingItems.splice(0, this.config.maxBatchSize);
        this.currentMemoryUsage = 0; // Reset memory usage
        if (itemsToProcess.length === 0) {
            return;
        }
        const batchId = this.generateId();
        this.processingBatches.add(batchId);
        this.emit('batch:start', {
            batchId,
            itemCount: itemsToProcess.length,
            remainingItems: this.pendingItems.length
        });
        try {
            await this.processBatch(batchId, itemsToProcess);
        }
        catch (error) {
            this.emit('batch:error', {
                batchId,
                error: error.message,
                itemCount: itemsToProcess.length
            });
        }
        finally {
            this.processingBatches.delete(batchId);
        }
    }
    /**
     * Get current batch statistics
     */
    getStatistics() {
        const now = Date.now();
        const startTime = now - 60000; // Last minute
        return {
            ...this.statistics,
            memoryUsage: this.currentMemoryUsage,
            throughput: this.calculateThroughput(),
            lastProcessedAt: this.statistics.lastProcessedAt
        };
    }
    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const stats = this.getStatistics();
        return {
            ...stats,
            efficiency: {
                batchUtilization: stats.averageBatchSize / this.config.maxBatchSize,
                successRate: stats.totalBatches > 0 ? stats.successfulBatches / stats.totalBatches : 0,
                averageRetryRate: stats.totalItems > 0 ? stats.retryCount / stats.totalItems : 0,
                memoryEfficiency: this.currentMemoryUsage / this.config.memoryThreshold
            },
            queuing: {
                currentQueueSize: this.pendingItems.length,
                currentBatches: this.processingBatches.size,
                concurrencyUtilization: this.processingBatches.size / this.config.concurrencyLimit,
                estimatedWaitTime: this.estimateWaitTime()
            },
            performance: {
                throughput: stats.throughput,
                averageLatency: stats.averageProcessingTime,
                memoryPressure: this.currentMemoryUsage / this.config.memoryThreshold
            }
        };
    }
    /**
     * Shutdown processor gracefully
     */
    async shutdown() {
        // Stop flush timer
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = undefined;
        }
        // Flush remaining items
        await this.flush();
        // Wait for active batches to complete
        while (this.processingBatches.size > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        // Reject any remaining items
        for (const item of this.pendingItems) {
            item.reject(new Error('Batch processor shutting down'));
        }
        this.pendingItems = [];
        this.emit('processor:shutdown');
    }
    // Private Implementation
    async processBatch(batchId, items) {
        const startTime = performance.now();
        try {
            const itemData = items.map(item => item.data);
            const results = await this.processor.process(itemData);
            if (results.length !== items.length) {
                throw new Error('Processor returned different number of results than input items');
            }
            // Resolve all items with their results
            items.forEach((item, index) => {
                item.resolve(results[index]);
            });
            this.updateSuccessStatistics(batchId, items.length, performance.now() - startTime);
            this.emit('batch:success', {
                batchId,
                itemCount: items.length,
                duration: performance.now() - startTime
            });
        }
        catch (error) {
            await this.handleBatchError(batchId, items, error, startTime);
        }
    }
    async handleBatchError(batchId, items, error, startTime) {
        this.statistics.failedBatches++;
        if (this.config.enableRetries) {
            // Separate items that can be retried
            const retryableItems = items.filter(item => item.retryCount < this.config.maxRetries &&
                (Date.now() - item.timestamp) < this.config.maxWaitTime);
            const failedItems = items.filter(item => !retryableItems.includes(item));
            // Reject failed items
            failedItems.forEach(item => {
                item.reject(new Error(`Batch failed after ${item.retryCount} retries: ${error.message}`));
            });
            // Retry retryable items
            if (retryableItems.length > 0) {
                setTimeout(() => {
                    retryableItems.forEach(item => {
                        item.retryCount++;
                        this.statistics.retryCount++;
                    });
                    // Add back to queue
                    this.pendingItems.unshift(...retryableItems);
                    this.emit('batch:retry', {
                        batchId,
                        retryCount: retryableItems.length,
                        failedCount: failedItems.length
                    });
                }, this.config.retryDelayMs);
            }
        }
        else {
            // Reject all items
            items.forEach(item => {
                item.reject(error);
            });
        }
        this.emit('batch:failed', {
            batchId,
            error: error.message,
            itemCount: items.length,
            duration: performance.now() - startTime
        });
    }
    async processSingleItem(item) {
        try {
            const results = await this.processor.process([item.data]);
            item.resolve(results[0]);
        }
        catch (error) {
            item.reject(error);
        }
    }
    startFlushTimer() {
        this.flushTimer = setInterval(() => {
            if (this.pendingItems.length > 0) {
                // Check if oldest item is too old
                const oldestItem = this.pendingItems[this.pendingItems.length - 1];
                if (Date.now() - oldestItem.timestamp > this.config.maxWaitTime) {
                    this.flush();
                }
            }
        }, this.config.flushInterval);
    }
    updateSuccessStatistics(batchId, itemCount, duration) {
        this.statistics.totalBatches++;
        this.statistics.successfulBatches++;
        this.statistics.totalItems += itemCount;
        this.statistics.lastProcessedAt = new Date().toISOString();
        // Update averages
        const totalBatches = this.statistics.totalBatches;
        this.statistics.averageBatchSize =
            (this.statistics.averageBatchSize * (totalBatches - 1) + itemCount) / totalBatches;
        this.statistics.averageProcessingTime =
            (this.statistics.averageProcessingTime * (totalBatches - 1) + duration) / totalBatches;
    }
    calculateThroughput() {
        // Items per second in the last minute
        const lastMinuteItems = this.statistics.totalItems; // Simplified calculation
        return lastMinuteItems / 60;
    }
    estimateWaitTime() {
        const queueSize = this.pendingItems.length;
        const avgBatchSize = this.statistics.averageBatchSize || this.config.maxBatchSize;
        const avgProcessingTime = this.statistics.averageProcessingTime || 1000;
        const estimatedBatches = Math.ceil(queueSize / avgBatchSize);
        return estimatedBatches * avgProcessingTime / this.config.concurrencyLimit;
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.AdvancedBatchProcessor = AdvancedBatchProcessor;
/**
 * TaskMaster CLI Batch Processor Implementation
 */
class TaskMasterBatchProcessor {
    constructor(cliService) {
        this.cliService = cliService;
    }
    async process(items) {
        // Group items by operation type for optimal batching
        const groupedItems = this.groupByOperation(items);
        const results = [];
        for (const [operation, operationItems] of groupedItems.entries()) {
            try {
                const operationResults = await this.processOperationBatch(operation, operationItems);
                results.push(...operationResults);
            }
            catch (error) {
                // Return errors for failed items
                const errorResults = operationItems.map(() => ({
                    success: false,
                    error: error.message
                }));
                results.push(...errorResults);
            }
        }
        return results;
    }
    canBatch(item) {
        // Only batch read operations
        const readOperations = ['list', 'show', 'status', 'next'];
        return readOperations.includes(item.operation);
    }
    estimateMemoryUsage(item) {
        // Estimate memory usage based on operation type
        const baseSize = 1024; // 1KB base
        const operationMultipliers = {
            'list': 5,
            'show': 3,
            'status': 2,
            'complexity': 10,
            'expand': 15
        };
        const multiplier = operationMultipliers[item.operation] || 1;
        return baseSize * multiplier;
    }
    groupByOperation(items) {
        const grouped = new Map();
        for (const item of items) {
            const operation = item.operation || 'unknown';
            if (!grouped.has(operation)) {
                grouped.set(operation, []);
            }
            grouped.get(operation).push(item);
        }
        return grouped;
    }
    async processOperationBatch(operation, items) {
        // Implement operation-specific batch processing
        switch (operation) {
            case 'list':
                return this.processList(items);
            case 'show':
                return this.processShow(items);
            case 'status':
                return this.processStatus(items);
            default:
                // Process items individually for operations that can't be batched
                return Promise.all(items.map(item => this.processSingle(item)));
        }
    }
    async processList(items) {
        // Batch multiple list requests efficiently
        const uniqueRepositories = [...new Set(items.map(item => item.repositoryPath))];
        const repositoryResults = new Map();
        for (const repo of uniqueRepositories) {
            try {
                const result = await this.cliService.listTasks(repo);
                repositoryResults.set(repo, result);
            }
            catch (error) {
                repositoryResults.set(repo, { success: false, error: error.message });
            }
        }
        return items.map(item => repositoryResults.get(item.repositoryPath));
    }
    async processShow(items) {
        // Batch show requests by repository
        const results = [];
        const repositoryItems = this.groupItemsByRepository(items);
        for (const [repo, repoItems] of repositoryItems.entries()) {
            try {
                // Process multiple shows for same repository in parallel
                const showPromises = repoItems.map(item => this.cliService.getTask(repo, item.arguments.id));
                const repoResults = await Promise.allSettled(showPromises);
                results.push(...repoResults.map(result => result.status === 'fulfilled' ? result.value : {
                    success: false,
                    error: result.reason?.message
                }));
            }
            catch (error) {
                const errorResults = repoItems.map(() => ({
                    success: false,
                    error: error.message
                }));
                results.push(...errorResults);
            }
        }
        return results;
    }
    async processStatus(items) {
        // Similar to list but for status requests
        return this.processList(items);
    }
    async processSingle(item) {
        // Fallback for individual processing
        try {
            return await this.cliService.executeCommand(item.repositoryPath, item.operation, item.arguments || {});
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    groupItemsByRepository(items) {
        const grouped = new Map();
        for (const item of items) {
            const repo = item.repositoryPath;
            if (!grouped.has(repo)) {
                grouped.set(repo, []);
            }
            grouped.get(repo).push(item);
        }
        return grouped;
    }
}
exports.TaskMasterBatchProcessor = TaskMasterBatchProcessor;
// Export batch processor instance
exports.taskMasterBatchProcessor = new AdvancedBatchProcessor(new TaskMasterBatchProcessor(null), // Will be injected with actual service
{
    maxBatchSize: 50,
    flushInterval: 500,
    maxWaitTime: 2000,
    concurrencyLimit: 5,
    enableRetries: true,
    maxRetries: 2
});
//# sourceMappingURL=batchProcessor.js.map