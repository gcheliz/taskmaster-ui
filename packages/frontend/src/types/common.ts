// Common type definitions used throughout the application

// Generic API response types
export interface ApiResponse<T = unknown> {
  data: T
  status: number
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Common entity types
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface User extends BaseEntity {
  name: string
  email: string
  avatar?: string
  role: UserRole
  isActive: boolean
}

export type UserRole = 'developer' | 'team_lead' | 'manager'

// Task types
export interface Task extends BaseEntity {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: string
  assignee?: User
  projectId: string
  dueDate?: string
  tags: string[]
  completedAt?: string
  complexity?: number
  dependencies?: string[]
}

export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'blocked' | 'deferred'
export type TaskPriority = 'low' | 'medium' | 'high'

// Repository types
export interface Repository extends BaseEntity {
  name: string
  path: string
  url?: string
  branch: string
  status: RepositoryStatus
  lastSync?: string
  stats?: RepositoryStats
}

export interface RepositoryStats {
  commits: number
  branches: number
  contributors: number
  openPRs: number
  openIssues: number
}

export type RepositoryStatus = 'connected' | 'disconnected' | 'syncing' | 'error'

// Notification types
export interface Notification extends BaseEntity {
  title: string
  message: string
  type: NotificationType
  read: boolean
  userId: string
  actionUrl?: string
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

// Form types
export interface FormField<T = string> {
  value: T
  error?: string
  touched: boolean
}

export interface FormState<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
}

// Utility types
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

export type RequireOnlyOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> &
      Partial<Record<Exclude<Keys, K>, undefined>>
  }[Keys]

// Event types
export type EventHandler<T = Event> = (event: T) => void
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>

// Component prop types
export interface WithClassName {
  className?: string
}

export interface WithChildren {
  children: React.ReactNode
}

export interface WithStyle {
  style?: React.CSSProperties
}

export interface WithTestId {
  'data-testid'?: string
}