import { v4 as uuidv4 } from 'uuid'
import { prisma } from './database'
import { exportService } from './exportService'
import { Queue } from 'bull'
import { Redis } from 'ioredis'
import { promises as fs } from 'fs'
import * as path from 'path'

// Export status types
export type ExportStatus = 'queued' | 'processing' | 'completed' | 'failed'

export interface ExportJob {
  id: string
  type: 'tasks' | 'analytics' | 'repository-activity'
  format: 'csv' | 'json'
  status: ExportStatus
  progress: number
  filters: Record<string, any>
  userId?: string
  notifyEmail?: string
  downloadUrl?: string
  error?: string
  createdAt: Date
  updatedAt: Date
}

// Redis client for export progress tracking
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
})

// Bull queue for background export jobs
const exportQueue = new Queue('export-jobs', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  }
})

class AsyncExportService {
  private readonly EXPORT_TTL = 24 * 60 * 60 // 24 hours
  private readonly PROGRESS_UPDATE_INTERVAL = 1000 // 1 second

  /**
   * Initiate an async export job
   */
  async initiateExport(options: {
    type: 'tasks' | 'analytics' | 'repository-activity'
    format: 'csv' | 'json'
    filters: Record<string, any>
    userId?: string
    notifyEmail?: string
  }): Promise<{ exportId: string; estimatedTime: number }> {
    const exportId = uuidv4()
    
    // Create export job record
    const exportJob: ExportJob = {
      id: exportId,
      type: options.type,
      format: options.format,
      status: 'queued',
      progress: 0,
      filters: options.filters,
      userId: options.userId,
      notifyEmail: options.notifyEmail,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Store in Redis
    await redis.setex(
      `export:${exportId}`,
      this.EXPORT_TTL,
      JSON.stringify(exportJob)
    )

    // Add to processing queue
    await exportQueue.add('process-export', {
      exportId,
      ...options
    })

    // Estimate time based on data size
    const estimatedTime = await this.estimateExportTime(options)

    return { exportId, estimatedTime }
  }

  /**
   * Get export progress
   */
  async getExportProgress(exportId: string): Promise<ExportJob | null> {
    const data = await redis.get(`export:${exportId}`)
    if (!data) return null
    
    return JSON.parse(data) as ExportJob
  }

  /**
   * Update export progress
   */
  async updateExportProgress(
    exportId: string, 
    updates: Partial<ExportJob>
  ): Promise<void> {
    const current = await this.getExportProgress(exportId)
    if (!current) return

    const updated: ExportJob = {
      ...current,
      ...updates,
      updatedAt: new Date()
    }

    await redis.setex(
      `export:${exportId}`,
      this.EXPORT_TTL,
      JSON.stringify(updated)
    )
  }

  /**
   * Process export job (called by queue worker)
   */
  async processExportJob(exportId: string, options: {
    type: 'tasks' | 'analytics' | 'repository-activity'
    format: 'csv' | 'json'
    filters: Record<string, any>
    userId?: string
    notifyEmail?: string
  }): Promise<void> {
    try {
      // Update status to processing
      await this.updateExportProgress(exportId, {
        status: 'processing',
        progress: 0
      })

      // Get total count for progress tracking
      const totalCount = await this.getExportItemCount(options)
      let processedCount = 0

      // Create progress callback
      const onProgress = async (count: number) => {
        processedCount = count
        const progress = Math.round((processedCount / totalCount) * 100)
        await this.updateExportProgress(exportId, { progress })
      }

      // Generate export based on type
      let result: Buffer
      let filename: string

      switch (options.type) {
        case 'tasks':
          result = await this.exportTasksWithProgress(
            options.filters,
            options.format,
            onProgress
          )
          filename = `tasks-export-${new Date().toISOString()}.${options.format}`
          break

        case 'analytics':
          result = await this.exportAnalyticsWithProgress(
            options.filters,
            options.format,
            onProgress
          )
          filename = `analytics-export-${new Date().toISOString()}.${options.format}`
          break

        case 'repository-activity':
          result = await this.exportRepositoryActivityWithProgress(
            options.filters,
            options.format,
            onProgress
          )
          filename = `repository-activity-${new Date().toISOString()}.${options.format}`
          break

        default:
          throw new Error('Invalid export type')
      }

      // Store the file (in production, upload to S3 or similar)
      const downloadUrl = await this.storeExportFile(exportId, filename, result)

      // Update export as completed
      await this.updateExportProgress(exportId, {
        status: 'completed',
        progress: 100,
        downloadUrl
      })

      // Send email notification if requested
      if (options.notifyEmail) {
        await this.sendExportCompletionEmail(
          options.notifyEmail,
          downloadUrl,
          filename
        )
      }

    } catch (error) {
      // Update export as failed
      await this.updateExportProgress(exportId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Export failed'
      })

      throw error
    }
  }

  /**
   * Estimate export time based on data size
   */
  private async estimateExportTime(options: {
    type: string
    filters: Record<string, any>
  }): Promise<number> {
    const count = await this.getExportItemCount(options)
    
    // Rough estimate: 100 items per second
    const seconds = Math.ceil(count / 100)
    
    // Add buffer time
    return Math.max(10, seconds + 5)
  }

  /**
   * Get total count of items to export
   */
  private async getExportItemCount(options: {
    type: string
    filters: Record<string, any>
  }): Promise<number> {
    switch (options.type) {
      case 'tasks':
        return await prisma.task.count({
          where: this.buildTaskWhereClause(options.filters)
        })

      case 'analytics': {
        // For analytics, estimate based on date range
        const dayCount = this.getDayCountFromFilters(options.filters)
        return dayCount * 10 // Assume 10 data points per day
      }

      case 'repository-activity':
        return await prisma.repositoryActivity.count({
          where: this.buildActivityWhereClause(options.filters)
        })

      default:
        return 0
    }
  }

  /**
   * Export tasks with progress tracking
   */
  private async exportTasksWithProgress(
    filters: Record<string, any>,
    format: 'csv' | 'json',
    onProgress: (count: number) => Promise<void>
  ): Promise<Buffer> {
    const pageSize = 100
    let page = 0
    let processedCount = 0
    const allTasks: any[] = []

    // Fetch tasks in batches
    let hasMore = true
    while (hasMore) {
      const tasks = await prisma.task.findMany({
        where: this.buildTaskWhereClause(filters),
        skip: page * pageSize,
        take: pageSize,
        include: {
          project: true,
          subtasks: true
        }
      })

      if (tasks.length === 0) {
        hasMore = false
        break
      }

      allTasks.push(...tasks)
      processedCount += tasks.length
      await onProgress(processedCount)
      
      page++
    }

    // Convert to desired format
    if (format === 'csv') {
      return Buffer.from(exportService.convertTasksToCSV(allTasks))
    } else {
      return Buffer.from(JSON.stringify(allTasks, null, 2))
    }
  }

  /**
   * Export analytics with progress tracking
   */
  private async exportAnalyticsWithProgress(
    filters: Record<string, any>,
    format: 'csv' | 'json',
    onProgress: (count: number) => Promise<void>
  ): Promise<Buffer> {
    // Implementation would fetch analytics data in batches
    // For now, return mock data
    const data = {
      dateRange: filters.dateRange,
      metrics: {
        totalTasks: 100,
        completedTasks: 75,
        averageCompletionTime: 3.5
      }
    }

    await onProgress(1)

    if (format === 'csv') {
      return Buffer.from('metric,value\ntotalTasks,100\ncompletedTasks,75')
    } else {
      return Buffer.from(JSON.stringify(data, null, 2))
    }
  }

  /**
   * Export repository activity with progress tracking
   */
  private async exportRepositoryActivityWithProgress(
    filters: Record<string, any>,
    format: 'csv' | 'json',
    onProgress: (count: number) => Promise<void>
  ): Promise<Buffer> {
    // Implementation would fetch activity data in batches
    const activities = await prisma.repositoryActivity.findMany({
      where: this.buildActivityWhereClause(filters),
      include: {
        repository: true
      }
    })

    await onProgress(activities.length)

    if (format === 'csv') {
      return Buffer.from(this.convertActivitiesToCSV(activities))
    } else {
      return Buffer.from(JSON.stringify(activities, null, 2))
    }
  }

  /**
   * Store export file and return download URL
   */
  private async storeExportFile(
    exportId: string,
    filename: string,
    data: Buffer
  ): Promise<string> {
    // In production, upload to S3 or similar
    // For now, store in local filesystem
    
    const exportDir = path.join(process.cwd(), 'exports')
    await fs.mkdir(exportDir, { recursive: true })
    
    const filepath = path.join(exportDir, `${exportId}-${filename}`)
    await fs.writeFile(filepath, data)
    
    // Return download URL
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001'
    return `${baseUrl}/api/export/download/${exportId}/${filename}`
  }

  /**
   * Send export completion email
   */
  private async sendExportCompletionEmail(
    email: string,
    downloadUrl: string,
    filename: string
  ): Promise<void> {
    // In production, use email service
    console.log(`Export completed: ${filename}`)
    console.log(`Download URL: ${downloadUrl}`)
    console.log(`Notification sent to: ${email}`)
  }

  /**
   * Build where clause for tasks
   */
  private buildTaskWhereClause(filters: Record<string, any>): any {
    const where: any = {}

    if (filters.projectId) {
      where.projectId = filters.projectId
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.priority) {
      where.priority = filters.priority
    }

    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo)
      }
    }

    return where
  }

  /**
   * Build where clause for activities
   */
  private buildActivityWhereClause(filters: Record<string, any>): any {
    const where: any = {}

    if (filters.repositoryId) {
      where.repositoryId = filters.repositoryId
    }

    if (filters.dateFrom || filters.dateTo) {
      where.timestamp = {}
      if (filters.dateFrom) {
        where.timestamp.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        where.timestamp.lte = new Date(filters.dateTo)
      }
    }

    return where
  }

  /**
   * Get day count from date filters
   */
  private getDayCountFromFilters(filters: Record<string, any>): number {
    if (!filters.dateFrom || !filters.dateTo) return 30 // Default 30 days

    const from = new Date(filters.dateFrom)
    const to = new Date(filters.dateTo)
    const diffTime = Math.abs(to.getTime() - from.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  /**
   * Convert activities to CSV
   */
  private convertActivitiesToCSV(activities: any[]): string {
    if (activities.length === 0) return 'No data'

    const headers = ['Repository', 'Type', 'Description', 'Timestamp']
    const rows = activities.map(activity => [
      activity.repository?.name || '',
      activity.type || '',
      activity.description || '',
      activity.timestamp?.toISOString() || ''
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }

  /**
   * Setup queue processor
   */
  setupQueueProcessor(): void {
    exportQueue.process('process-export', async (job) => {
      const { exportId, ...options } = job.data
      await this.processExportJob(exportId, options)
    })

    exportQueue.on('failed', (job, err) => {
      console.error(`Export job ${job.id} failed:`, err)
    })

    exportQueue.on('completed', (job) => {
      console.log(`Export job ${job.id} completed`)
    })
  }
}

export const asyncExportService = new AsyncExportService()

// Setup queue processor when module loads
asyncExportService.setupQueueProcessor()