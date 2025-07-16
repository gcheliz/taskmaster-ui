import { EventEmitter } from 'events';
export interface PoolConfig {
    minConnections: number;
    maxConnections: number;
    acquireTimeoutMs: number;
    idleTimeoutMs: number;
    connectionTimeoutMs: number;
    maxRetries: number;
    healthCheckInterval: number;
    enableMonitoring: boolean;
}
export interface Connection {
    id: string;
    createdAt: number;
    lastUsed: number;
    inUse: boolean;
    isHealthy: boolean;
    metadata: Record<string, any>;
    destroy(): Promise<void>;
    ping(): Promise<boolean>;
}
export interface PoolStatistics {
    totalConnections: number;
    availableConnections: number;
    busyConnections: number;
    pendingRequests: number;
    totalAcquired: number;
    totalReleased: number;
    totalCreated: number;
    totalDestroyed: number;
    averageAcquireTime: number;
    averageConnectionLifetime: number;
    healthyConnections: number;
    unhealthyConnections: number;
}
export interface ConnectionFactory<T extends Connection> {
    create(): Promise<T>;
    validate(connection: T): Promise<boolean>;
    destroy(connection: T): Promise<void>;
}
/**
 * Advanced Connection Pool with Resource Management
 */
export declare class AdvancedConnectionPool<T extends Connection> extends EventEmitter {
    private connectionFactory;
    private connections;
    private availableConnections;
    private pendingRequests;
    private statistics;
    private healthCheckTimer?;
    private config;
    constructor(connectionFactory: ConnectionFactory<T>, config?: Partial<PoolConfig>);
    /**
     * Acquire connection from pool with timeout
     */
    acquire(): Promise<T>;
    /**
     * Release connection back to pool
     */
    release(connection: T): Promise<void>;
    /**
     * Destroy specific connection
     */
    destroyConnection(connection: T): Promise<void>;
    /**
     * Health check and cleanup
     */
    performHealthCheck(): Promise<void>;
    /**
     * Get comprehensive pool statistics
     */
    getStatistics(): PoolStatistics;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): any;
    /**
     * Gracefully shutdown pool
     */
    shutdown(): Promise<void>;
    private startTime;
    private errorCount;
    private initializePool;
    private ensureMinimumConnections;
    private createConnection;
    private getAvailableConnection;
    private markConnectionAsUsed;
    private waitForConnection;
    private processPendingRequests;
    private removePendingRequest;
    private removeFromAvailable;
    private validateConnection;
    private updateAcquireStatistics;
    private updatePoolStatistics;
}
/**
 * TaskMaster CLI Connection (Example Implementation)
 */
export declare class TaskMasterConnection implements Connection {
    repositoryPath: string;
    processId?: number | undefined;
    id: string;
    createdAt: number;
    lastUsed: number;
    inUse: boolean;
    isHealthy: boolean;
    metadata: Record<string, any>;
    constructor(repositoryPath: string, processId?: number | undefined);
    destroy(): Promise<void>;
    ping(): Promise<boolean>;
}
/**
 * TaskMaster Connection Factory
 */
export declare class TaskMasterConnectionFactory implements ConnectionFactory<TaskMasterConnection> {
    private defaultRepositoryPath;
    constructor(defaultRepositoryPath: string);
    create(): Promise<TaskMasterConnection>;
    validate(connection: TaskMasterConnection): Promise<boolean>;
    destroy(connection: TaskMasterConnection): Promise<void>;
}
export declare const taskMasterPool: AdvancedConnectionPool<TaskMasterConnection>;
//# sourceMappingURL=connectionPool.d.ts.map