// Advanced Connection Pooling and Resource Management
// Demonstrates: Connection pooling, resource lifecycle management, performance monitoring

import { EventEmitter } from 'events';

// Connection Pool Configuration
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

// Connection Interface
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

// Pool Statistics
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

// Connection Factory Interface
export interface ConnectionFactory<T extends Connection> {
  create(): Promise<T>;
  validate(connection: T): Promise<boolean>;
  destroy(connection: T): Promise<void>;
}

/**
 * Advanced Connection Pool with Resource Management
 */
export class AdvancedConnectionPool<T extends Connection> extends EventEmitter {
  private connections: Map<string, T> = new Map();
  private availableConnections: T[] = [];
  private pendingRequests: Array<{
    resolve: (connection: T) => void;
    reject: (error: Error) => void;
    timestamp: number;
  }> = [];
  
  private statistics: PoolStatistics;
  private healthCheckTimer?: NodeJS.Timeout;
  private config: PoolConfig;

  constructor(
    private connectionFactory: ConnectionFactory<T>,
    config: Partial<PoolConfig> = {}
  ) {
    super();
    
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
  async acquire(): Promise<T> {
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

    } catch (error) {
      this.emit('connection:acquire:error', { error, duration: performance.now() - startTime });
      throw error;
    }
  }

  /**
   * Release connection back to pool
   */
  async release(connection: T): Promise<void> {
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

    } catch (error) {
      this.emit('connection:release:error', { 
        connectionId: connection.id, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Destroy specific connection
   */
  async destroyConnection(connection: T): Promise<void> {
    try {
      this.connections.delete(connection.id);
      this.removeFromAvailable(connection);
      
      await this.connectionFactory.destroy(connection);
      
      this.statistics.totalDestroyed++;
      this.updatePoolStatistics();
      
      this.emit('connection:destroyed', { connectionId: connection.id });

      // Maintain minimum connections
      await this.ensureMinimumConnections();

    } catch (error) {
      this.emit('connection:destroy:error', { 
        connectionId: connection.id, 
        error: (error as Error).message 
      });
    }
  }

  /**
   * Health check and cleanup
   */
  async performHealthCheck(): Promise<void> {
    try {
      const unhealthyConnections: T[] = [];
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
          } catch (error) {
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

    } catch (error) {
      this.emit('health:check:error', { error: (error as Error).message });
    }
  }

  /**
   * Get comprehensive pool statistics
   */
  getStatistics(): PoolStatistics {
    this.updatePoolStatistics();
    return { ...this.statistics };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): any {
    const stats = this.getStatistics();
    const now = Date.now();
    
    // Calculate connection age distribution
    const connectionAges = Array.from(this.connections.values()).map(conn => 
      now - conn.createdAt
    );
    
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
  async shutdown(): Promise<void> {
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
      const destroyPromises = Array.from(this.connections.values()).map(connection =>
        this.connectionFactory.destroy(connection)
      );
      
      await Promise.allSettled(destroyPromises);
      
      this.connections.clear();
      this.availableConnections = [];
      
      this.emit('pool:shutdown');

    } catch (error) {
      this.emit('pool:shutdown:error', { error: (error as Error).message });
      throw error;
    }
  }

  // Private Implementation

  private startTime = Date.now();
  private errorCount = 0;

  private async initializePool(): Promise<void> {
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

    } catch (error) {
      this.emit('pool:initialization:error', { error: (error as Error).message });
      throw error;
    }
  }

  private async ensureMinimumConnections(): Promise<void> {
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

  private async createConnection(): Promise<T> {
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

    } catch (error) {
      this.errorCount++;
      this.emit('connection:create:error', { error: (error as Error).message });
      throw error;
    }
  }

  private getAvailableConnection(): T | null {
    return this.availableConnections.shift() || null;
  }

  private markConnectionAsUsed(connection: T): void {
    connection.inUse = true;
    connection.lastUsed = Date.now();
    this.statistics.totalAcquired++;
    this.updatePoolStatistics();
  }

  private async waitForConnection(startTime: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.removePendingRequest(resolve);
        reject(new Error('Connection acquire timeout'));
      }, this.config.acquireTimeoutMs);

      const pendingRequest = {
        resolve: (connection: T) => {
          clearTimeout(timeout);
          this.updateAcquireStatistics(startTime);
          resolve(connection);
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        },
        timestamp: Date.now()
      };

      this.pendingRequests.push(pendingRequest);
      this.statistics.pendingRequests = this.pendingRequests.length;
    });
  }

  private async processPendingRequests(): Promise<void> {
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

  private removePendingRequest(resolve: Function): void {
    const index = this.pendingRequests.findIndex(req => req.resolve === resolve);
    if (index > -1) {
      this.pendingRequests.splice(index, 1);
      this.statistics.pendingRequests = this.pendingRequests.length;
    }
  }

  private removeFromAvailable(connection: T): void {
    const index = this.availableConnections.findIndex(c => c.id === connection.id);
    if (index > -1) {
      this.availableConnections.splice(index, 1);
    }
  }

  private async validateConnection(connection: T): Promise<boolean> {
    try {
      return await this.connectionFactory.validate(connection);
    } catch (error) {
      return false;
    }
  }

  private updateAcquireStatistics(startTime: number): void {
    const duration = performance.now() - startTime;
    const totalAcquired = this.statistics.totalAcquired;
    
    this.statistics.averageAcquireTime = 
      (this.statistics.averageAcquireTime * (totalAcquired - 1) + duration) / totalAcquired;
  }

  private updatePoolStatistics(): void {
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

/**
 * TaskMaster CLI Connection (Example Implementation)
 */
export class TaskMasterConnection implements Connection {
  public id: string;
  public createdAt: number;
  public lastUsed: number;
  public inUse: boolean = false;
  public isHealthy: boolean = true;
  public metadata: Record<string, any> = {};

  constructor(
    public repositoryPath: string,
    public processId?: number
  ) {
    this.id = `tm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.createdAt = Date.now();
    this.lastUsed = Date.now();
  }

  async destroy(): Promise<void> {
    // Cleanup any resources associated with this connection
    this.isHealthy = false;
  }

  async ping(): Promise<boolean> {
    try {
      // In a real implementation, this would ping the TaskMaster CLI process
      // For now, simulate a health check
      return this.isHealthy && (Date.now() - this.lastUsed) < 300000; // 5 minutes
    } catch (error) {
      return false;
    }
  }
}

/**
 * TaskMaster Connection Factory
 */
export class TaskMasterConnectionFactory implements ConnectionFactory<TaskMasterConnection> {
  constructor(private defaultRepositoryPath: string) {}

  async create(): Promise<TaskMasterConnection> {
    // In a real implementation, this would initialize a TaskMaster CLI process
    const connection = new TaskMasterConnection(this.defaultRepositoryPath);
    
    // Simulate connection setup time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return connection;
  }

  async validate(connection: TaskMasterConnection): Promise<boolean> {
    return connection.ping();
  }

  async destroy(connection: TaskMasterConnection): Promise<void> {
    await connection.destroy();
  }
}

// Export pool instance for TaskMaster CLI
export const taskMasterPool = new AdvancedConnectionPool(
  new TaskMasterConnectionFactory('/default/repo/path'),
  {
    minConnections: 2,
    maxConnections: 8,
    acquireTimeoutMs: 5000,
    idleTimeoutMs: 300000,
    healthCheckInterval: 60000
  }
);