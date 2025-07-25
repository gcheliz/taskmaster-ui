import { TaskInfo } from '../types/taskMaster'
import { logger } from '../utils/logger'
import { Parser } from 'json2csv'
import { Readable } from 'stream'

export interface ExportOptions {
  format: 'csv' | 'json'
  projectId?: string
  status?: string
  priority?: string
  assigneeId?: string
  dateFrom?: Date
  dateTo?: Date
  includeSubtasks?: boolean
  fields?: string[]
}

export interface ExportResult {
  data: Buffer | string
  filename: string
  contentType: string
  totalCount: number
}

export class ExportService {
  /**
   * Export tasks in the specified format
   */
  async exportTasks(tasks: TaskInfo[], options: ExportOptions): Promise<ExportResult> {
    logger.info('Exporting tasks', { 
      count: tasks.length, 
      format: options.format 
    })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    if (options.format === 'csv') {
      return this.exportTasksAsCSV(tasks, timestamp, options)
    } else {
      return this.exportTasksAsJSON(tasks, timestamp, options)
    }
  }

  /**
   * Export tasks as CSV
   */
  private async exportTasksAsCSV(
    tasks: TaskInfo[], 
    timestamp: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      // Define CSV fields
      const fields = options.fields || [
        { label: 'ID', value: 'id' },
        { label: 'Title', value: 'title' },
        { label: 'Description', value: 'description' },
        { label: 'Status', value: 'status' },
        { label: 'Priority', value: 'priority' },
        { label: 'Complexity', value: 'complexity' },
        { label: 'Dependencies', value: (row: any) => row.dependencies?.join(', ') || '' },
        { label: 'Details', value: 'details' },
        { label: 'Test Strategy', value: 'testStrategy' }
      ]

      // Flatten tasks data for CSV
      const flattenedTasks = tasks.map(task => ({
        ...task
      }))

      // Include subtasks if requested
      if (options.includeSubtasks && flattenedTasks.some(t => t.subtasks?.length)) {
        const tasksWithSubtasks: any[] = []
        
        flattenedTasks.forEach(task => {
          tasksWithSubtasks.push(task)
          
          if (task.subtasks) {
            task.subtasks.forEach((subtask: any) => {
              tasksWithSubtasks.push({
                ...subtask,
                id: `${task.id}.${subtask.id}`,
                title: `  → ${subtask.title}`
              })
            })
          }
        })
        
        flattenedTasks.length = 0
        flattenedTasks.push(...tasksWithSubtasks)
      }

      // Create CSV parser
      const json2csvParser = new Parser({ 
        fields,
        delimiter: ',',
        quote: '"',
        header: true,
        withBOM: true // For Excel compatibility
      })

      const csv = json2csvParser.parse(flattenedTasks)

      return {
        data: Buffer.from(csv, 'utf8'),
        filename: `tasks-export-${timestamp}.csv`,
        contentType: 'text/csv',
        totalCount: tasks.length
      }
    } catch (error) {
      logger.error('Error generating CSV', error)
      throw new Error('Failed to generate CSV export')
    }
  }

  /**
   * Export tasks as JSON
   */
  private async exportTasksAsJSON(
    tasks: TaskInfo[], 
    timestamp: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const exportData = {
        data: tasks,
        metadata: {
          totalCount: tasks.length,
          exportedCount: tasks.length,
          exportDate: new Date().toISOString(),
          filters: {
            projectId: options.projectId,
            status: options.status,
            priority: options.priority,
            assigneeId: options.assigneeId,
            dateFrom: options.dateFrom,
            dateTo: options.dateTo
          }
        }
      }

      const jsonString = JSON.stringify(exportData, null, 2)

      return {
        data: Buffer.from(jsonString, 'utf8'),
        filename: `tasks-export-${timestamp}.json`,
        contentType: 'application/json',
        totalCount: tasks.length
      }
    } catch (error) {
      logger.error('Error generating JSON', error)
      throw new Error('Failed to generate JSON export')
    }
  }

  /**
   * Create a readable stream for large exports
   */
  createExportStream(tasks: TaskInfo[], options: ExportOptions): Readable {
    const stream = new Readable({
      read() {}
    })

    // Process in chunks to avoid memory issues
    const chunkSize = 1000
    let index = 0

    const processChunk = () => {
      const chunk = tasks.slice(index, index + chunkSize)
      
      if (chunk.length === 0) {
        stream.push(null) // End stream
        return
      }

      if (options.format === 'csv') {
        // For CSV, we need special handling for headers
        const isFirstChunk = index === 0
        const fields = this.getCSVFields(options)
        
        const parser = new Parser({ 
          fields,
          header: isFirstChunk,
          withBOM: isFirstChunk
        })
        
        const csv = parser.parse(chunk)
        stream.push(csv + '\n')
      } else {
        // For JSON streaming
        if (index === 0) {
          stream.push('{"data":[')
        }
        
        chunk.forEach((task, i) => {
          const isLast = index + i === tasks.length - 1
          stream.push(JSON.stringify(task) + (isLast ? '' : ','))
        })
        
        if (index + chunk.length === tasks.length) {
          stream.push('],"metadata":' + JSON.stringify(this.getMetadata(tasks, options)) + '}')
        }
      }

      index += chunkSize
      setImmediate(processChunk)
    }

    processChunk()
    return stream
  }

  /**
   * Get CSV field definitions
   */
  private getCSVFields(options: ExportOptions) {
    return options.fields || [
      { label: 'ID', value: 'id' },
      { label: 'Title', value: 'title' },
      { label: 'Description', value: 'description' },
      { label: 'Status', value: 'status' },
      { label: 'Priority', value: 'priority' },
      { label: 'Complexity', value: 'complexity' },
      { label: 'Dependencies', value: (row: any) => row.dependencies?.join(', ') || '' },
      { label: 'Details', value: 'details' },
      { label: 'Test Strategy', value: 'testStrategy' }
    ]
  }

  /**
   * Get export metadata
   */
  private getMetadata(tasks: TaskInfo[], options: ExportOptions) {
    return {
      totalCount: tasks.length,
      exportedCount: tasks.length,
      exportDate: new Date().toISOString(),
      filters: {
        projectId: options.projectId,
        status: options.status,
        priority: options.priority,
        assigneeId: options.assigneeId,
        dateFrom: options.dateFrom,
        dateTo: options.dateTo
      }
    }
  }

  /**
   * Validate export request
   */
  validateExportRequest(options: ExportOptions): void {
    const validFormats = ['csv', 'json']
    if (!validFormats.includes(options.format)) {
      throw new Error(`Invalid format. Valid formats: ${validFormats.join(', ')}`)
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'archived']
    if (options.status && !validStatuses.includes(options.status)) {
      throw new Error(`Invalid status. Valid statuses: ${validStatuses.join(', ')}`)
    }

    const validPriorities = ['low', 'medium', 'high']
    if (options.priority && !validPriorities.includes(options.priority)) {
      throw new Error(`Invalid priority. Valid priorities: ${validPriorities.join(', ')}`)
    }
  }
}

export const exportService = new ExportService()