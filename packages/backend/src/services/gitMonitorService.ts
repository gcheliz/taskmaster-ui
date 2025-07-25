import { EventEmitter } from 'events'
import * as chokidar from 'chokidar'
import * as path from 'path'
import * as fs from 'fs/promises'
import { gitDataService } from './gitDataService'
import { logger } from '../utils/logger'
import { debounce } from 'lodash'

export interface GitEvent {
  type: 
    | 'branch-changed'
    | 'commit-added'
    | 'status-changed'
    | 'remote-updated'
    | 'merge-conflict'
    | 'stash-changed'
  repository: string
  data: {
    previousValue?: unknown
    currentValue?: unknown
    changes?: unknown
    timestamp: string
  }
}

export interface GitMonitorOptions {
  pollingInterval?: number
  debounceDelay?: number
  watchGitDir?: boolean
  detectRemoteChanges?: boolean
}

interface RepositoryState {
  branch: string
  lastCommit: string
  status: {
    staged: string[]
    unstaged: string[]
    untracked: string[]
  }
  remoteStatus?: {
    ahead: number
    behind: number
  }
  stashCount: number
}

class GitMonitorService extends EventEmitter {
  private watchers: Map<string, chokidar.FSWatcher> = new Map()
  private repositoryStates: Map<string, RepositoryState> = new Map()
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map()
  private options: Required<GitMonitorOptions> = {
    pollingInterval: 10000, // 10 seconds
    debounceDelay: 1000, // 1 second
    watchGitDir: true,
    detectRemoteChanges: true,
  }

  constructor(options?: GitMonitorOptions) {
    super()
    if (options) {
      this.options = { ...this.options, ...options }
    }
    logger.info('GitMonitorService initialized', { options: this.options })
  }

  async addRepository(repositoryPath: string): Promise<void> {
    if (this.watchers.has(repositoryPath)) {
      logger.warn(`Repository already being monitored: ${repositoryPath}`)
      return
    }

    try {
      // Initialize repository state
      const initialState = await this.getRepositoryState(repositoryPath)
      this.repositoryStates.set(repositoryPath, initialState)

      // Watch .git directory for changes
      if (this.options.watchGitDir) {
        const gitPath = path.join(repositoryPath, '.git')
        const watcher = chokidar.watch(gitPath, {
          ignored: [
            '**/COMMIT_EDITMSG',
            '**/index.lock',
            '**/config.lock',
            '**/*.lock',
            '**/logs/**',
          ],
          persistent: true,
          ignoreInitial: true,
          depth: 3,
        })

        const debouncedHandler = debounce(
          () => this.handleGitChange(repositoryPath),
          this.options.debounceDelay
        )

        watcher
          .on('add', debouncedHandler)
          .on('change', debouncedHandler)
          .on('unlink', debouncedHandler)
          .on('error', (error) => {
            logger.error(`Git watcher error for ${repositoryPath}:`, error)
          })

        this.watchers.set(repositoryPath, watcher)
      }

      // Start polling for remote changes
      if (this.options.detectRemoteChanges) {
        const interval = setInterval(
          () => this.checkRemoteChanges(repositoryPath),
          this.options.pollingInterval
        )
        this.pollingIntervals.set(repositoryPath, interval)
      }

      logger.info(`Started monitoring repository: ${repositoryPath}`)
    } catch (error) {
      logger.error(`Failed to add repository for monitoring: ${repositoryPath}`, error as any)
      throw error
    }
  }

  async removeRepository(repositoryPath: string): Promise<void> {
    // Stop file watcher
    const watcher = this.watchers.get(repositoryPath)
    if (watcher) {
      await watcher.close()
      this.watchers.delete(repositoryPath)
    }

    // Stop polling interval
    const interval = this.pollingIntervals.get(repositoryPath)
    if (interval) {
      clearInterval(interval)
      this.pollingIntervals.delete(repositoryPath)
    }

    // Remove state
    this.repositoryStates.delete(repositoryPath)

    logger.info(`Stopped monitoring repository: ${repositoryPath}`)
  }

  private async getRepositoryState(repositoryPath: string): Promise<RepositoryState> {
    const metadata = await gitDataService.getRepositoryMetadata(repositoryPath)
    const stashCount = await this.getStashCount(repositoryPath)

    const state: RepositoryState = {
      branch: metadata.currentBranch || 'unknown',
      lastCommit: metadata.lastCommit?.hash || '',
      status: {
        staged: metadata.status?.staged ? ['staged'] : [],
        unstaged: metadata.status?.unstaged ? ['unstaged'] : [],
        untracked: metadata.status?.untracked ? ['untracked'] : [],
      },
      stashCount,
    }

    // Get remote status if available
    if (this.options.detectRemoteChanges) {
      try {
        const remoteStatus = await this.getRemoteStatus(repositoryPath)
        state.remoteStatus = remoteStatus
      } catch (error) {
        logger.debug(`Could not get remote status for ${repositoryPath}:`, error as any)
      }
    }

    return state
  }

  private async handleGitChange(repositoryPath: string): Promise<void> {
    try {
      const previousState = this.repositoryStates.get(repositoryPath)
      if (!previousState) return

      const currentState = await this.getRepositoryState(repositoryPath)
      this.repositoryStates.set(repositoryPath, currentState)

      // Detect branch change
      if (previousState.branch !== currentState.branch) {
        this.emitGitEvent({
          type: 'branch-changed',
          repository: repositoryPath,
          data: {
            previousValue: previousState.branch,
            currentValue: currentState.branch,
            timestamp: new Date().toISOString(),
          },
        })
      }

      // Detect new commit
      if (previousState.lastCommit !== currentState.lastCommit) {
        this.emitGitEvent({
          type: 'commit-added',
          repository: repositoryPath,
          data: {
            previousValue: previousState.lastCommit,
            currentValue: currentState.lastCommit,
            timestamp: new Date().toISOString(),
          },
        })
      }

      // Detect status changes
      if (this.hasStatusChanged(previousState.status, currentState.status)) {
        this.emitGitEvent({
          type: 'status-changed',
          repository: repositoryPath,
          data: {
            previousValue: previousState.status,
            currentValue: currentState.status,
            timestamp: new Date().toISOString(),
          },
        })
      }

      // Detect stash changes
      if (previousState.stashCount !== currentState.stashCount) {
        this.emitGitEvent({
          type: 'stash-changed',
          repository: repositoryPath,
          data: {
            previousValue: previousState.stashCount,
            currentValue: currentState.stashCount,
            timestamp: new Date().toISOString(),
          },
        })
      }
    } catch (error) {
      logger.error(`Error handling Git change for ${repositoryPath}:`, error as any)
    }
  }

  private async checkRemoteChanges(repositoryPath: string): Promise<void> {
    try {
      const previousState = this.repositoryStates.get(repositoryPath)
      if (!previousState) return

      // Fetch remote changes (without merging)
      await gitDataService.fetch(repositoryPath)

      const remoteStatus = await this.getRemoteStatus(repositoryPath)
      
      if (
        !previousState.remoteStatus ||
        previousState.remoteStatus.ahead !== remoteStatus.ahead ||
        previousState.remoteStatus.behind !== remoteStatus.behind
      ) {
        const currentState = await this.getRepositoryState(repositoryPath)
        this.repositoryStates.set(repositoryPath, currentState)

        this.emitGitEvent({
          type: 'remote-updated',
          repository: repositoryPath,
          data: {
            previousValue: previousState.remoteStatus,
            currentValue: remoteStatus,
            timestamp: new Date().toISOString(),
          },
        })
      }
    } catch (error) {
      logger.debug(`Error checking remote changes for ${repositoryPath}:`, error as any)
    }
  }

  private async getRemoteStatus(repositoryPath: string): Promise<{ ahead: number; behind: number }> {
    const metadata = await gitDataService.getRepositoryMetadata(repositoryPath)
    const currentBranchData = metadata.branches?.find(b => b.current)
    
    if (!currentBranchData?.tracking) {
      return { ahead: 0, behind: 0 }
    }

    return {
      ahead: currentBranchData.ahead || 0,
      behind: currentBranchData.behind || 0,
    }
  }

  private async getStashCount(repositoryPath: string): Promise<number> {
    try {
      const stashFile = path.join(repositoryPath, '.git', 'refs', 'stash')
      await fs.access(stashFile)
      // If file exists, there's at least one stash
      // For accurate count, we'd need to parse the stash log
      return 1
    } catch {
      return 0
    }
  }

  private hasStatusChanged(
    prev: RepositoryState['status'],
    curr: RepositoryState['status']
  ): boolean {
    return (
      !this.arraysEqual(prev.staged, curr.staged) ||
      !this.arraysEqual(prev.unstaged, curr.unstaged) ||
      !this.arraysEqual(prev.untracked, curr.untracked)
    )
  }

  private arraysEqual<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) return false
    const sortedA = [...a].sort()
    const sortedB = [...b].sort()
    return sortedA.every((val, index) => val === sortedB[index])
  }

  private emitGitEvent(event: GitEvent): void {
    this.emit('git-event', event)
    logger.debug('Git event emitted:', {
      type: event.type,
      repository: event.repository,
    })
  }

  async shutdown(): Promise<void> {
    const repositories = Array.from(this.watchers.keys())
    await Promise.all(repositories.map(repo => this.removeRepository(repo)))
    logger.info('GitMonitorService shut down')
  }
}

export const gitMonitorService = new GitMonitorService()