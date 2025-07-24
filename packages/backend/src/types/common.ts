// Common type definitions for the backend

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  message?: string
  metadata?: Record<string, unknown>
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface QueryFilter {
  [key: string]: string | number | boolean | Date | undefined
}

export interface GitActivity {
  date: string
  commits: number
  additions: number
  deletions: number
  author?: string
}

export interface PerformanceMetrics {
  queryCount: number
  averageQueryTime: number
  slowQueries: number
  connectionCount: number
  cacheHitRate?: number
  timestamp: Date
}

export interface TaskMasterOutput {
  stdout: string
  stderr: string
  exitCode: number
}

export interface CLIExecutionResult<T = unknown> {
  success: boolean
  output?: T
  error?: string
  raw?: string
}