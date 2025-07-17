"use strict";
// Advanced Connection Pooling and Resource Management
// Demonstrates: Connection pooling, resource lifecycle management, performance monitoring
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskMasterPool = exports.TaskMasterConnectionFactory = exports.TaskMasterConnection = exports.AdvancedConnectionPool = void 0;
const events_1 = require("events");
/**
 * Advanced Connection Pool with Resource Management
 */
class AdvancedConnectionPool extends events_1.EventEmitter {
    constructor(connectionFactory, config = {}) {
        super();
        this.connectionFactory = connectionFactory;
        this.connections = new Map();
        this.availableConnections = [];
        this.pendingRequests = [];
        // Private Implementation
        this.startTime = Date.now();
        this.errorCount = 0;
        this.config = {
            minConnections: 2,
            maxConnections: 10,
            acquireTimeoutMs: 5000,
            idleTimeoutMs: 300000, // 5 minutes
            connectionTimeoutMs: 10000,
            maxRetries: 3,
            healthCheckInterval: 60000, // 1 minute
            enableMonitoring: true,
            ...config
        };
        this.statistics = {
            totalConnections: 0,
            availableConnections: 0,
            busyConnections: 0,
            pendingRequests: 0,
            totalAcquired: 0,
            totalReleased: 0,
            totalCreated: 0,
            totalDestroyed: 0,
            averageAcquireTime: 0,
            averageConnectionLifetime: 0,
            healthyConnections: 0,
            unhealthyConnections: 0
        };
        this.initializePool();
    }
    /**
     * Acquire connection from pool with timeout
     */
    async acquire() {
        const startTime = performance.now();
        try {
            // Check for available connection
            const availableConnection = this.getAvailableConnection();
            if (availableConnection) {
                this.markConnectionAsUsed(availableConnection);
                this.updateAcquireStatistics(startTime);
                this.emit('connection:acquired', { connectionId: availableConnection.id });
                return availableConnection;
            }
            // Create new connection if possible
            if (this.connections.size < this.config.maxConnections) {
                const newConnection = await this.createConnection();
                this.markConnectionAsUsed(newConnection);
                this.updateAcquireStatistics(startTime);
                this.emit('connection:acquired', { connectionId: newConnection.id });
                return newConnection;
            }
            // Wait for available connection
            return await this.waitForConnection(startTime);
        }
        catch (error) {
            this.emit('connection:acquire:error', { error, duration: performance.now() - startTime });
            throw error;
        }
    }
    /**
     * Release connection back to pool
     */
    async release(connection) {
        try {
            if (!this.connections.has(connection.id)) {
                throw new Error('Connection not managed by this pool');
            }
            connection.inUse = false;
            connection.lastUsed = Date.now();
            // Check connection health before returning to pool
            const isHealthy = await this.validateConnection(connection);
            if (!isHealthy) {
                await this.destroyConnection(connection);
                this.emit('connection:unhealthy', { connectionId: connection.id });
                return;
            }
            this.availableConnections.push(connection);
            this.statistics.totalReleased++;
            this.updatePoolStatistics();
            // Process pending requests
            await this.processPendingRequests();
            this.emit('connection:released', { connectionId: connection.id });
        }
        catch (error) {
            this.emit('connection:release:error', {
                connectionId: connection.id,
                error: error.message
            });
            throw error;
        }
    }
    /**
     * Destroy specific connection
     */
    async destroyConnection(connection) {
        try {
            this.connections.delete(connection.id);
            this.removeFromAvailable(connection);
            await this.connectionFactory.destroy(connection);
            this.statistics.totalDestroyed++;
            this.updatePoolStatistics();
            this.emit('connection:destroyed', { connectionId: connection.id });
            // Maintain minimum connections
            await this.ensureMinimumConnections();
        }
        catch (error) {
            this.emit('connection:destroy:error', {
                connectionId: connection.id,
                error: error.message
            });
        }
    }
    /**
     * Health check and cleanup
     */
    async performHealthCheck() {
        try {
            const unhealthyConnections = [];
            const idleTimeoutThreshold = Date.now() - this.config.idleTimeoutMs;
            for (const [id, connection] of this.connections.entries()) {
                // Check for idle timeout
                if (!connection.inUse && connection.lastUsed < idleTimeoutThreshold) {
                    unhealthyConnections.push(connection);
                    continue;
                }
                // Ping connection if not in use
                if (!connection.inUse) {
                    try {
                        const isHealthy = await connection.ping();
                        if (!isHealthy) {
                            unhealthyConnections.push(connection);
                        }
                    }
                    catch (error) {
                        unhealthyConnections.push(connection);
                    }
                }
            }
            // Destroy unhealthy connections
            for (const connection of unhealthyConnections) {
                await this.destroyConnection(connection);
            }
            // Ensure minimum connections
            await this.ensureMinimumConnections();
            this.emit('health:check:complete', {
                checkedConnections: this.connections.size,
                destroyedConnections: unhealthyConnections.length
            });
        }
        catch (error) {
            this.emit('health:check:error', { error: error.message });
        }
    }
    /**
     * Get comprehensive pool statistics
     */
    getStatistics() {
        this.updatePoolStatistics();
        return { ...this.statistics };
    }
    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const stats = this.getStatistics();
        const now = Date.now();
        // Calculate connection age distribution
        const connectionAges = Array.from(this.connections.values()).map(conn => now - conn.createdAt);
        const avgAge = connectionAges.length > 0
            ? connectionAges.reduce((sum, age) => sum + age, 0) / connectionAges.length
            : 0;
        return {
            ...stats,
            poolEfficiency: {
                utilizationRate: stats.totalConnections > 0
                    ? stats.busyConnections / stats.totalConnections
                    : 0,
                averageConnectionAge: avgAge,
                connectionTurnover: stats.totalDestroyed > 0
                    ? stats.totalCreated / stats.totalDestroyed
                    : 0,
                waitingRequestsRatio: stats.pendingRequests / Math.max(1, stats.totalConnections)
            },
            performance: {
                averageAcquireTime: stats.averageAcquireTime,
                throughput: stats.totalAcquired / Math.max(1, (now - this.startTime) / 1000),
                errorRate: this.errorCount / Math.max(1, stats.totalAcquired)
            }
        };
    }
    /**
     * Gracefully shutdown pool
     */
    async shutdown() {
        try {
            // Stop health checks
            if (this.healthCheckTimer) {
                clearInterval(this.healthCheckTimer);
                this.healthCheckTimer = undefined;
            }
            // Reject pending requests
            for (const pending of this.pendingRequests) {
                pending.reject(new Error('Pool is shutting down'));
            }
            this.pendingRequests = [];
            // Destroy all connections
            const destroyPromises = Array.from(this.connections.values()).map(connection => this.connectionFactory.destroy(connection));
            await Promise.allSettled(destroyPromises);
            this.connections.clear();
            this.availableConnections = [];
            this.emit('pool:shutdown');
        }
        catch (error) {
            this.emit('pool:shutdown:error', { error: error.message });
            throw error;
        }
    }
    async initializePool() {
        try {
            // Create minimum connections
            await this.ensureMinimumConnections();
            // Start health check timer
            if (this.config.healthCheckInterval > 0) {
                this.healthCheckTimer = setInterval(() => {
                    this.performHealthCheck().catch(error => {
                        this.emit('health:check:error', { error: error.message });
                    });
                }, this.config.healthCheckInterval);
            }
            this.emit('pool:initialized', { minConnections: this.config.minConnections });
        }
        catch (error) {
            this.emit('pool:initialization:error', { error: error.message });
            throw error;
        }
    }
    async ensureMinimumConnections() {
        const currentCount = this.connections.size;
        const needed = this.config.minConnections - currentCount;
        if (needed > 0) {
            const createPromises = Array(needed).fill(null).map(() => this.createConnection());
            const results = await Promise.allSettled(createPromises);
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    this.emit('connection:create:error', {
                        error: result.reason?.message,
                        attempt: index + 1
                    });
                }
            });
        }
    }
    async createConnection() {
        try {
            const connection = await this.connectionFactory.create();
            connection.createdAt = Date.now();
            connection.lastUsed = Date.now();
            connection.inUse = false;
            connection.isHealthy = true;
            this.connections.set(connection.id, connection);
            this.statistics.totalCreated++;
            this.emit('connection:created', { connectionId: connection.id });
            return connection;
        }
        catch (error) {
            this.errorCount++;
            this.emit('connection:create:error', { error: error.message });
            throw error;
        }
    }
    getAvailableConnection() {
        return this.availableConnections.shift() || null;
    }
    markConnectionAsUsed(connection) {
        connection.inUse = true;
        connection.lastUsed = Date.now();
        this.statistics.totalAcquired++;
        this.updatePoolStatistics();
    }
    async waitForConnection(startTime) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.removePendingRequest(resolve);
                reject(new Error('Connection acquire timeout'));
            }, this.config.acquireTimeoutMs);
            const pendingRequest = {
                resolve: (connection) => {
                    clearTimeout(timeout);
                    this.updateAcquireStatistics(startTime);
                    resolve(connection);
                },
                reject: (error) => {
                    clearTimeout(timeout);
                    reject(error);
                },
                timestamp: Date.now()
            };
            this.pendingRequests.push(pendingRequest);
            this.statistics.pendingRequests = this.pendingRequests.length;
        });
    }
    async processPendingRequests() {
        while (this.pendingRequests.length > 0 && this.availableConnections.length > 0) {
            const pending = this.pendingRequests.shift();
            const connection = this.availableConnections.shift();
            if (pending && connection) {
                this.markConnectionAsUsed(connection);
                pending.resolve(connection);
                this.statistics.pendingRequests = this.pendingRequests.length;
            }
        }
    }
    removePendingRequest(resolve) {
        const index = this.pendingRequests.findIndex(req => req.resolve === resolve);
        if (index > -1) {
            this.pendingRequests.splice(index, 1);
            this.statistics.pendingRequests = this.pendingRequests.length;
        }
    }
    removeFromAvailable(connection) {
        const index = this.availableConnections.findIndex(c => c.id === connection.id);
        if (index > -1) {
            this.availableConnections.splice(index, 1);
        }
    }
    async validateConnection(connection) {
        try {
            return await this.connectionFactory.validate(connection);
        }
        catch (error) {
            return false;
        }
    }
    updateAcquireStatistics(startTime) {
        const duration = performance.now() - startTime;
        const totalAcquired = this.statistics.totalAcquired;
        this.statistics.averageAcquireTime =
            (this.statistics.averageAcquireTime * (totalAcquired - 1) + duration) / totalAcquired;
    }
    updatePoolStatistics() {
        this.statistics.totalConnections = this.connections.size;
        this.statistics.availableConnections = this.availableConnections.length;
        this.statistics.busyConnections = Array.from(this.connections.values())
            .filter(c => c.inUse).length;
        this.statistics.healthyConnections = Array.from(this.connections.values())
            .filter(c => c.isHealthy).length;
        this.statistics.unhealthyConnections = this.statistics.totalConnections -
            this.statistics.healthyConnections;
    }
}
exports.AdvancedConnectionPool = AdvancedConnectionPool;
/**
 * TaskMaster CLI Connection (Example Implementation)
 */
class TaskMasterConnection {
    constructor(repositoryPath, processId) {
        this.repositoryPath = repositoryPath;
        this.processId = processId;
        this.inUse = false;
        this.isHealthy = true;
        this.metadata = {};
        this.id = `tm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.createdAt = Date.now();
        this.lastUsed = Date.now();
    }
    async destroy() {
        // Cleanup any resources associated with this connection
        this.isHealthy = false;
    }
    async ping() {
        try {
            // In a real implementation, this would ping the TaskMaster CLI process
            // For now, simulate a health check
            return this.isHealthy && (Date.now() - this.lastUsed) < 300000; // 5 minutes
        }
        catch (error) {
            return false;
        }
    }
}
exports.TaskMasterConnection = TaskMasterConnection;
/**
 * TaskMaster Connection Factory
 */
class TaskMasterConnectionFactory {
    constructor(defaultRepositoryPath) {
        this.defaultRepositoryPath = defaultRepositoryPath;
    }
    async create() {
        // In a real implementation, this would initialize a TaskMaster CLI process
        const connection = new TaskMasterConnection(this.defaultRepositoryPath);
        // Simulate connection setup time
        await new Promise(resolve => setTimeout(resolve, 100));
        return connection;
    }
    async validate(connection) {
        return connection.ping();
    }
    async destroy(connection) {
        await connection.destroy();
    }
}
exports.TaskMasterConnectionFactory = TaskMasterConnectionFactory;
// Export pool instance for TaskMaster CLI
exports.taskMasterPool = new AdvancedConnectionPool(new TaskMasterConnectionFactory('/default/repo/path'), {
    minConnections: 2,
    maxConnections: 8,
    acquireTimeoutMs: 5000,
    idleTimeoutMs: 300000,
    healthCheckInterval: 60000
});
//# sourceMappingURL=connectionPool.js.map