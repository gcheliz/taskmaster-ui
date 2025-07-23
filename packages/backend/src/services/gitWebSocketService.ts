import { gitMonitorService, GitEvent } from './gitMonitorService'
import { gitDataService } from './gitDataService'
import { repositoryService } from './repositoryService'
import { logger } from '../utils/logger'

export interface GitWebSocketConfig {
  autoAddRepositories?: boolean
  syncInterval?: number
}

export interface GitWebSocketMessage {
  type: 
    | 'git-event'
    | 'repository-state'
    | 'repository-sync'
    | 'repository-error'
  repositoryId?: string
  event?: string
  data?: unknown
  timestamp: string
}

class GitWebSocketService {
  private config: Required<GitWebSocketConfig> = {
    autoAddRepositories: true,
    syncInterval: 30000, // 30 seconds
  }
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map()
  private monitoredRepositories: Set<string> = new Set()
  private broadcastCallback: ((message: GitWebSocketMessage) => void) | null = null

  constructor(config?: GitWebSocketConfig) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  initialize(broadcastCallback: (message: GitWebSocketMessage) => void): void {
    this.broadcastCallback = broadcastCallback
    
    // Set up Git event listener
    gitMonitorService.on('git-event', this.handleGitEvent.bind(this))
    
    // Auto-add existing repositories if configured
    if (this.config.autoAddRepositories) {
      this.initializeRepositoryMonitoring()
    }
    
    logger.info('Git WebSocket service initialized')
  }
  
  async handleWebSocketMessage(clientId: string, message: any): Promise<GitWebSocketMessage | null> {
    try {
      const { type, repositoryId, data } = message
      
      switch (type) {
        case 'subscribe-repository':
          if (repositoryId) {
            await this.subscribeToRepository(clientId, repositoryId)
            return {
              type: 'repository-state',
              repositoryId,
              data: { subscribed: true },
              timestamp: new Date().toISOString(),
            }
          }
          break
          
        case 'unsubscribe-repository':
          if (repositoryId) {
            await this.unsubscribeFromRepository(clientId, repositoryId)
            return {
              type: 'repository-state',
              repositoryId,
              data: { subscribed: false },
              timestamp: new Date().toISOString(),
            }
          }
          break
          
        case 'refresh-repository':
          if (repositoryId) {
            await this.refreshRepository(repositoryId)
            return {
              type: 'repository-state',
              repositoryId,
              data: { refreshed: true },
              timestamp: new Date().toISOString(),
            }
          }
          break
          
        case 'get-repository-state':
          if (repositoryId) {
            const state = await this.getRepositoryState(repositoryId)
            return {
              type: 'repository-state',
              repositoryId,
              data: state,
              timestamp: new Date().toISOString(),
            }
          }
          break
      }
      
      return null
    } catch (error) {
      logger.error('Error handling WebSocket message:', error as any)
      return {
        type: 'repository-error',
        repositoryId: message.repositoryId,
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      }
    }
  }
  
  private async subscribeToRepository(clientId: string, repositoryId: string): Promise<void> {
    const repository = await repositoryService.getRepositoryById(repositoryId)
    if (repository && repository.path) {
      await this.startMonitoringRepository(repository.path)
    }
  }
  
  private async unsubscribeFromRepository(clientId: string, repositoryId: string): Promise<void> {
    // In this simple implementation, we keep monitoring even if no clients are subscribed
    // In a production system, you might want to stop monitoring when no clients are interested
  }
  
  private async refreshRepository(repositoryId: string): Promise<void> {
    const repository = await repositoryService.getRepositoryById(repositoryId)
    if (repository && repository.path) {
      // Remove and re-add to trigger immediate check
      await gitMonitorService.removeRepository(repository.path)
      await gitMonitorService.addRepository(repository.path)
    }
  }
  
  private async getRepositoryState(repositoryId: string): Promise<unknown> {
    const repository = await repositoryService.getRepositoryById(repositoryId)
    if (repository && repository.path) {
      const metadata = await gitDataService.getRepositoryMetadata(repository.path)
      return metadata
    }
    return null
  }
  
  private async initializeRepositoryMonitoring(): Promise<void> {
    try {
      const repositories = await repositoryService.getAllRepositories()
      
      for (const repo of repositories) {
        if (repo.path) {
          await this.startMonitoringRepository(repo.path)
        }
      }
      
      logger.info(`Started monitoring ${repositories.length} repositories`)
    } catch (error) {
      logger.error('Failed to initialize repository monitoring:', error as any)
    }
  }
  
  private async startMonitoringRepository(repositoryPath: string): Promise<void> {
    if (this.monitoredRepositories.has(repositoryPath)) {
      return
    }
    
    try {
      await gitMonitorService.addRepository(repositoryPath)
      this.monitoredRepositories.add(repositoryPath)
      
      // Set up periodic sync
      if (!this.syncIntervals.has(repositoryPath)) {
        const interval = setInterval(
          () => this.syncRepository(repositoryPath),
          this.config.syncInterval
        )
        this.syncIntervals.set(repositoryPath, interval)
      }
    } catch (error) {
      logger.error(`Failed to start monitoring repository ${repositoryPath}:`, error as any)
    }
  }
  
  private async syncRepository(repositoryPath: string): Promise<void> {
    try {
      // Find repository ID by path
      const repositories = await repositoryService.getAllRepositories()
      const repository = repositories.find(r => r.path === repositoryPath)
      
      if (repository && this.broadcastCallback) {
        // Emit sync event
        this.broadcastCallback({
          type: 'repository-sync',
          repositoryId: repository.id,
          data: {
            status: 'syncing',
          },
          timestamp: new Date().toISOString(),
        })
        
        // The actual sync is handled by gitMonitorService
        // which will emit events when changes are detected
        
        this.broadcastCallback({
          type: 'repository-sync',
          repositoryId: repository.id,
          data: {
            status: 'synced',
          },
          timestamp: new Date().toISOString(),
        })
      }
    } catch (error) {
      logger.error(`Failed to sync repository ${repositoryPath}:`, error as any)
    }
  }
  
  private async handleGitEvent(event: GitEvent): Promise<void> {
    if (!this.broadcastCallback) return
    
    try {
      // Find repository ID by path
      const repositories = await repositoryService.getAllRepositories()
      const repository = repositories.find(r => r.path === event.repository)
      
      if (repository) {
        // Broadcast the Git event
        this.broadcastCallback({
          type: 'git-event',
          repositoryId: repository.id,
          event: event.type,
          data: event.data,
          timestamp: event.data.timestamp,
        })
        
        logger.debug('Broadcasted Git event', {
          repositoryId: repository.id,
          type: event.type,
        })
      }
    } catch (error) {
      logger.error('Failed to handle Git event:', error as any)
    }
  }
  
  async shutdown(): Promise<void> {
    // Stop all sync intervals
    for (const interval of this.syncIntervals.values()) {
      clearInterval(interval)
    }
    this.syncIntervals.clear()
    
    // Stop monitoring
    await gitMonitorService.shutdown()
    
    this.monitoredRepositories.clear()
    
    logger.info('Git WebSocket service shut down')
  }
}

export const gitWebSocketService = new GitWebSocketService()