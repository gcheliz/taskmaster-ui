import { EventEmitter } from 'events';
import { WorkflowContext } from '../types';
import { logger } from '../../utils/logger';

export interface ContextUpdate {
  path: string;
  value: any;
  updatedBy: string;
  timestamp: Date;
}

export interface ContextSnapshot {
  context: WorkflowContext;
  sharedData: Record<string, any>;
  metadata: Record<string, any>;
  timestamp: Date;
}

export class WorkflowContextManager extends EventEmitter {
  private baseContext: WorkflowContext;
  private sharedData: Map<string, any>;
  private metadata: Map<string, any>;
  private history: ContextUpdate[];
  private snapshots: ContextSnapshot[];
  private locks: Map<string, string>; // path -> agentId

  constructor(initialContext: WorkflowContext) {
    super();
    this.baseContext = { ...initialContext };
    this.sharedData = new Map();
    this.metadata = new Map();
    this.history = [];
    this.snapshots = [];
    this.locks = new Map();
  }

  getContext(): WorkflowContext {
    return {
      ...this.baseContext,
      variables: {
        ...this.baseContext.variables,
        ...this.getSharedDataObject(),
      },
      metadata: {
        ...this.baseContext.metadata,
        ...this.getMetadataObject(),
      },
    };
  }

  setSharedData(key: string, value: any, updatedBy: string): void {
    const locked = this.locks.get(key);
    if (locked && locked !== updatedBy) {
      throw new Error(`Key '${key}' is locked by ${locked}`);
    }

    const oldValue = this.sharedData.get(key);
    this.sharedData.set(key, value);

    const update: ContextUpdate = {
      path: `sharedData.${key}`,
      value,
      updatedBy,
      timestamp: new Date(),
    };

    this.history.push(update);
    this.emit('context.updated', { key, value, oldValue, updatedBy });

    logger.debug('Shared data updated', { key, updatedBy });
  }

  getSharedData(key: string): any {
    return this.sharedData.get(key);
  }

  deleteSharedData(key: string, deletedBy: string): boolean {
    const locked = this.locks.get(key);
    if (locked && locked !== deletedBy) {
      throw new Error(`Key '${key}' is locked by ${locked}`);
    }

    const existed = this.sharedData.delete(key);

    if (existed) {
      const update: ContextUpdate = {
        path: `sharedData.${key}`,
        value: undefined,
        updatedBy: deletedBy,
        timestamp: new Date(),
      };

      this.history.push(update);
      this.emit('context.deleted', { key, deletedBy });
    }

    return existed;
  }

  setMetadata(key: string, value: any, updatedBy: string): void {
    this.metadata.set(key, value);

    const update: ContextUpdate = {
      path: `metadata.${key}`,
      value,
      updatedBy,
      timestamp: new Date(),
    };

    this.history.push(update);
    this.emit('metadata.updated', { key, value, updatedBy });
  }

  getMetadata(key: string): any {
    return this.metadata.get(key);
  }

  updateVariable(name: string, value: any, updatedBy: string): void {
    if (!this.baseContext.variables) {
      this.baseContext.variables = {};
    }

    const oldValue = this.baseContext.variables[name];
    this.baseContext.variables[name] = value;

    const update: ContextUpdate = {
      path: `variables.${name}`,
      value,
      updatedBy,
      timestamp: new Date(),
    };

    this.history.push(update);
    this.emit('variable.updated', { name, value, oldValue, updatedBy });
  }

  acquireLock(key: string, agentId: string): boolean {
    const current = this.locks.get(key);

    if (current && current !== agentId) {
      return false;
    }

    this.locks.set(key, agentId);
    this.emit('lock.acquired', { key, agentId });

    logger.debug('Lock acquired', { key, agentId });
    return true;
  }

  releaseLock(key: string, agentId: string): boolean {
    const current = this.locks.get(key);

    if (current !== agentId) {
      return false;
    }

    this.locks.delete(key);
    this.emit('lock.released', { key, agentId });

    logger.debug('Lock released', { key, agentId });
    return true;
  }

  releaseAllLocks(agentId: string): number {
    let count = 0;

    for (const [key, owner] of this.locks.entries()) {
      if (owner === agentId) {
        this.locks.delete(key);
        count++;
      }
    }

    if (count > 0) {
      this.emit('locks.released', { agentId, count });
      logger.debug('All locks released', { agentId, count });
    }

    return count;
  }

  createSnapshot(name?: string): ContextSnapshot {
    const snapshot: ContextSnapshot = {
      context: this.getContext(),
      sharedData: this.getSharedDataObject(),
      metadata: this.getMetadataObject(),
      timestamp: new Date(),
    };

    this.snapshots.push(snapshot);

    if (name) {
      this.setMetadata(`snapshot.${name}`, snapshot, 'system');
    }

    this.emit('snapshot.created', { name, snapshot });
    return snapshot;
  }

  restoreSnapshot(index: number): void {
    if (index < 0 || index >= this.snapshots.length) {
      throw new Error(`Invalid snapshot index: ${index}`);
    }

    const snapshot = this.snapshots[index];

    // Restore base context
    this.baseContext = { ...snapshot.context };

    // Restore shared data
    this.sharedData.clear();
    for (const [key, value] of Object.entries(snapshot.sharedData)) {
      this.sharedData.set(key, value);
    }

    // Restore metadata
    this.metadata.clear();
    for (const [key, value] of Object.entries(snapshot.metadata)) {
      this.metadata.set(key, value);
    }

    this.emit('snapshot.restored', { index, snapshot });
  }

  getHistory(limit?: number): ContextUpdate[] {
    if (limit && limit > 0) {
      return this.history.slice(-limit);
    }
    return [...this.history];
  }

  getSnapshots(): ContextSnapshot[] {
    return [...this.snapshots];
  }

  private getSharedDataObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    for (const [key, value] of this.sharedData.entries()) {
      obj[key] = value;
    }
    return obj;
  }

  private getMetadataObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    for (const [key, value] of this.metadata.entries()) {
      obj[key] = value;
    }
    return obj;
  }

  merge(otherContext: WorkflowContext, mergedBy: string): void {
    // Merge variables
    if (otherContext.variables) {
      for (const [key, value] of Object.entries(otherContext.variables)) {
        this.updateVariable(key, value, mergedBy);
      }
    }

    // Merge metadata
    if (otherContext.metadata) {
      for (const [key, value] of Object.entries(otherContext.metadata)) {
        this.setMetadata(key, value, mergedBy);
      }
    }

    this.emit('context.merged', { mergedBy });
  }

  clear(): void {
    this.sharedData.clear();
    this.metadata.clear();
    this.history = [];
    this.locks.clear();

    this.emit('context.cleared');
  }

  getMetrics(): Record<string, any> {
    return {
      sharedDataKeys: this.sharedData.size,
      metadataKeys: this.metadata.size,
      historySize: this.history.length,
      snapshotCount: this.snapshots.length,
      activeLocks: this.locks.size,
    };
  }
}
