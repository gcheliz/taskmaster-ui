import axios from 'axios'
import { config } from '../config/environment'

const API_BASE_URL = config.apiBaseUrl

export interface ExportOptions {
  format: 'csv' | 'json'
  type?: 'tasks' | 'analytics' | 'repository'
  projectId?: string
  status?: string
  priority?: string
  assigneeId?: string
  dateFrom?: string
  dateTo?: string
  includeSubtasks?: boolean
  fields?: string[]
}

export interface ExportResult {
  filename: string
  data: Blob
}

/**
 * Export tasks with the specified options
 */
export async function exportTasks(options: ExportOptions): Promise<ExportResult> {
  try {
    const params = new URLSearchParams()
    
    // Build query parameters
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','))
        } else {
          params.append(key, String(value))
        }
      }
    })

    const response = await axios.get(`${API_BASE_URL}/export/tasks?${params.toString()}`, {
      responseType: 'blob',
      headers: {
        'Accept': options.format === 'csv' ? 'text/csv' : 'application/json'
      }
    })

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition']
    let filename = `export-${Date.now()}.${options.format}`
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    // Create a blob from the response data
    const blob = new Blob([response.data], {
      type: options.format === 'csv' ? 'text/csv' : 'application/json'
    })

    // Trigger download
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { filename, data: blob }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 413) {
        throw new Error('Export size is too large. Please use filters to reduce the data size.')
      } else if (error.response?.status === 429) {
        throw new Error('Export rate limit exceeded. Please try again later.')
      }
    }
    throw new Error('Failed to export data')
  }
}

/**
 * Export analytics data
 */
export async function exportAnalytics(options: ExportOptions & {
  analyticsType: string
  groupBy?: string
}): Promise<ExportResult> {
  try {
    const params = new URLSearchParams()
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })

    const response = await axios.get(`${API_BASE_URL}/export/analytics?${params.toString()}`, {
      responseType: 'blob'
    })

    const contentDisposition = response.headers['content-disposition']
    let filename = `analytics-${options.analyticsType}-${Date.now()}.${options.format}`
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    const blob = new Blob([response.data], {
      type: options.format === 'csv' ? 'text/csv' : 'application/json'
    })

    // Trigger download
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { filename, data: blob }
  } catch (error) {
    throw new Error('Failed to export analytics data')
  }
}

/**
 * Check export progress for async exports
 */
export async function checkExportProgress(exportId: string): Promise<{
  status: 'processing' | 'completed' | 'failed'
  progress: number
  downloadUrl?: string
  error?: string
}> {
  try {
    const response = await axios.get(`${API_BASE_URL}/export/progress/${exportId}`)
    return response.data
  } catch (error) {
    throw new Error('Failed to check export progress')
  }
}

/**
 * Initiate async export for large datasets
 */
export async function initiateAsyncExport(options: {
  type: 'tasks' | 'analytics' | 'repository-activity'
  format: 'csv' | 'json'
  filters: Record<string, any>
  notifyEmail?: string
}): Promise<{
  exportId: string
  estimatedTime: number
}> {
  try {
    const response = await axios.post(`${API_BASE_URL}/export/async`, options)
    return response.data
  } catch (error) {
    throw new Error('Failed to initiate export')
  }
}