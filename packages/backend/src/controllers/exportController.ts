import { Request, Response, NextFunction } from 'express'
import { exportService, ExportOptions } from '../services/exportService'
import { taskService } from '../services/taskService'
import { logger } from '../utils/logger'
import { AuthRequest } from '../types'
import { TaskInfo } from '../types/taskMaster'

export class ExportController {
  /**
   * Export tasks
   * GET /api/export/tasks
   */
  async exportTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const options: ExportOptions = {
        format: req.query.format as 'csv' | 'json',
        projectId: req.query.projectId as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        assigneeId: req.query.assigneeId as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        includeSubtasks: req.query.includeSubtasks === 'true',
        fields: req.query.fields ? (req.query.fields as string).split(',') : undefined
      }

      // Validate export request
      exportService.validateExportRequest(options)

      // Get tasks from TaskMaster service
      // For now, return mock data until TaskMaster integration is complete
      const tasks: TaskInfo[] = [
        {
          id: '1',
          title: 'Sample Task 1',
          description: 'Description for task 1',
          status: 'in-progress',
          priority: 'high',
          complexity: 5,
          dependencies: [],
          details: 'Implementation details',
          testStrategy: 'Unit tests required'
        },
        {
          id: '2',
          title: 'Sample Task 2',
          description: 'Description for task 2',
          status: 'pending',
          priority: 'medium',
          complexity: 3,
          dependencies: ['1'],
          details: 'Follow-up task',
          testStrategy: 'Integration tests'
        }
      ]
      
      // TODO: Replace with actual TaskMaster service call
      // const tasks = await taskMasterService.getTasks(options)

      // Check export size limit
      const EXPORT_LIMIT = 50000
      if (tasks.length > EXPORT_LIMIT) {
        return res.status(413).json({
          error: 'Export size exceeds limit',
          code: 'EXPORT_TOO_LARGE',
          recordCount: tasks.length,
          limit: EXPORT_LIMIT,
          suggestion: 'Use async export endpoint for large datasets'
        })
      }

      // Generate export
      const result = await exportService.exportTasks(tasks, options)

      // Set response headers
      res.setHeader('Content-Type', result.contentType)
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`)
      res.setHeader('X-Total-Count', result.totalCount.toString())

      // Send file
      res.send(result.data)

      logger.info('Tasks exported successfully', {
        userId: req.user!.id,
        format: options.format,
        count: result.totalCount
      })
    } catch (error) {
      logger.error('Error exporting tasks', error)
      next(error)
    }
  }

  /**
   * Export analytics data
   * GET /api/export/analytics
   */
  async exportAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        format,
        type,
        projectId,
        userId,
        dateFrom,
        dateTo,
        groupBy = 'day'
      } = req.query

      if (!format || !type || !dateFrom || !dateTo) {
        return res.status(400).json({
          error: 'Missing required parameters',
          required: ['format', 'type', 'dateFrom', 'dateTo']
        })
      }

      // TODO: Implement analytics export logic based on type
      // For now, return a sample response
      const analyticsData = {
        summary: {
          totalTasks: 500,
          completedTasks: 350,
          inProgressTasks: 100,
          pendingTasks: 50,
          completionRate: 0.70,
          averageCompletionTime: '5.2 days'
        },
        timeline: []
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      
      if (format === 'csv') {
        // Convert analytics to CSV format
        const csvData = this.analyticsToCSV(analyticsData)
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${timestamp}.csv"`)
        res.send(csvData)
      } else {
        // Return as JSON
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${timestamp}.json"`)
        res.json({
          data: analyticsData,
          metadata: {
            exportDate: new Date().toISOString(),
            period: { from: dateFrom, to: dateTo },
            type,
            groupBy
          }
        })
      }
    } catch (error) {
      logger.error('Error exporting analytics', error)
      next(error)
    }
  }

  /**
   * Get export progress for async exports
   * GET /api/export/progress/:exportId
   */
  async getExportProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { exportId } = req.params
      
      const { asyncExportService } = await import('../services/asyncExportService')
      const exportJob = await asyncExportService.getExportProgress(exportId)
      
      if (!exportJob) {
        return res.status(404).json({
          success: false,
          error: 'Export not found'
        })
      }

      res.json({
        status: exportJob.status,
        progress: exportJob.progress / 100, // Convert to 0-1 range
        downloadUrl: exportJob.downloadUrl,
        error: exportJob.error
      })
    } catch (error) {
      logger.error('Error getting export progress', error)
      next(error)
    }
  }

  /**
   * Initiate async export for large datasets
   * POST /api/export/async
   */
  async initiateAsyncExport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type, format, filters, notifyEmail } = req.body

      if (!type || !format) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['type', 'format']
        })
      }

      // Validate export type
      const validTypes = ['tasks', 'analytics', 'repository-activity']
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          error: 'Invalid export type',
          valid: validTypes
        })
      }

      // Validate format
      const validFormats = ['csv', 'json']
      if (!validFormats.includes(format)) {
        return res.status(400).json({
          error: 'Invalid export format',
          valid: validFormats
        })
      }

      const { asyncExportService } = await import('../services/asyncExportService')
      const result = await asyncExportService.initiateExport({
        type,
        format,
        filters: filters || {},
        userId: req.user?.id,
        notifyEmail
      })

      res.json({
        exportId: result.exportId,
        estimatedTime: result.estimatedTime
      })

      logger.info('Async export initiated', {
        userId: req.user?.id,
        exportId: result.exportId,
        type,
        format
      })
    } catch (error) {
      logger.error('Error initiating async export', error)
      next(error)
    }
  }

  /**
   * Download completed export file
   * GET /api/export/download/:exportId/:filename
   */
  async downloadExport(req: Request, res: Response, next: NextFunction) {
    try {
      const { exportId, filename } = req.params
      
      // Validate export exists and is completed
      const { asyncExportService } = await import('../services/asyncExportService')
      const exportJob = await asyncExportService.getExportProgress(exportId)
      
      if (!exportJob) {
        return res.status(404).json({
          success: false,
          error: 'Export not found'
        })
      }
      
      if (exportJob.status !== 'completed') {
        return res.status(400).json({
          success: false,
          error: 'Export not completed yet',
          status: exportJob.status
        })
      }
      
      // In production, redirect to S3 signed URL
      // For now, serve from local filesystem
      const path = require('path')
      const fs = require('fs')
      
      const filepath = path.join(process.cwd(), 'exports', `${exportId}-${filename}`)
      
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({
          success: false,
          error: 'Export file not found'
        })
      }
      
      // Set appropriate headers
      const contentType = filename.endsWith('.csv') ? 'text/csv' : 'application/json'
      res.setHeader('Content-Type', contentType)
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      
      // Stream the file
      const stream = fs.createReadStream(filepath)
      stream.pipe(res)
      
    } catch (error) {
      logger.error('Error downloading export', error)
      next(error)
    }
  }

  /**
   * Convert analytics data to CSV format
   */
  private analyticsToCSV(data: any): string {
    const rows: string[] = []
    
    // Add headers
    rows.push('Metric,Value')
    
    // Add summary data
    rows.push(`Total Tasks,${data.summary.totalTasks}`)
    rows.push(`Completed Tasks,${data.summary.completedTasks}`)
    rows.push(`In Progress Tasks,${data.summary.inProgressTasks}`)
    rows.push(`Pending Tasks,${data.summary.pendingTasks}`)
    rows.push(`Completion Rate,${(data.summary.completionRate * 100).toFixed(1)}%`)
    rows.push(`Average Completion Time,${data.summary.averageCompletionTime}`)
    
    return rows.join('\n')
  }
}

export const exportController = new ExportController()