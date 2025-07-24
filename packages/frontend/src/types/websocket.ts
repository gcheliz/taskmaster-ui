/**
 * WebSocket Event Types and Interfaces for Real-Time Collaboration
 * Used for TaskMaster Kanban Board real-time updates
 */

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  color?: string
}

export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'blocked' | 'deferred'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee?: User
  createdAt: string
  updatedAt: string
  position: number
  column: string
  complexity?: number
  tags?: string[]
}

export interface TaskUpdate {
  taskId: string
  previousStatus: Task['status']
  newStatus: Task['status']
  previousPosition: number
  newPosition: number
  previousColumn: string
  newColumn: string
  updatedBy: User
  timestamp: string
}

export interface UserPresence {
  userId: string
  user: User
  lastSeen: string
  isActive: boolean
  currentPage?: string
  cursor?: {
    x: number
    y: number
  }
}

// WebSocket Event Types
export const WebSocketEventType = {
  // Connection Events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  RECONNECT: 'reconnect',

  // Task Events
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_MOVED: 'task:moved',
  TASK_ASSIGNED: 'task:assigned',

  // User Presence Events
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  USER_PRESENCE_UPDATE: 'user:presence:update',
  USER_CURSOR_MOVE: 'user:cursor:move',

  // Board Events
  BOARD_UPDATED: 'board:updated',
  BOARD_LOCKED: 'board:locked',
  BOARD_UNLOCKED: 'board:unlocked',

  // Collaboration Events
  COLLABORATION_START: 'collaboration:start',
  COLLABORATION_END: 'collaboration:end',
  BULK_UPDATE: 'bulk:update',

  // Additional Events
  TASK_UPDATE: 'task-update',
  REPOSITORY_SUBSCRIBE: 'repository:subscribe',
  REPOSITORY_UNSUBSCRIBE: 'repository:unsubscribe',
} as const

export type WebSocketEventType = (typeof WebSocketEventType)[keyof typeof WebSocketEventType]

// WebSocket Message Interfaces
export interface WebSocketMessage<T = any> {
  type: WebSocketEventType
  payload: T
  timestamp: string
  userId?: string
  sessionId?: string
}

export interface TaskCreatedPayload {
  task: Task
  createdBy: User
}

export interface TaskUpdatedPayload {
  task: Task
  changes: Partial<Task>
  updatedBy: User
}

export interface TaskDeletedPayload {
  taskId: string
  deletedBy: User
}

export interface TaskMovedPayload {
  taskId: string
  fromColumn: string
  toColumn: string
  fromPosition: number
  toPosition: number
  movedBy: User
}

export interface UserJoinedPayload {
  user: User
  presence: UserPresence
}

export interface UserLeftPayload {
  userId: string
  leftAt: string
}

export interface UserPresenceUpdatePayload {
  userId: string
  presence: Partial<UserPresence>
}

export interface UserCursorMovePayload {
  userId: string
  cursor: {
    x: number
    y: number
  }
}

export interface BoardUpdatedPayload {
  boardId: string
  tasks: Task[]
  updatedBy: User
  changes: {
    added: Task[]
    modified: Task[]
    removed: string[]
  }
}

// WebSocket Connection States
export const WebSocketState = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
} as const

export type WebSocketState = (typeof WebSocketState)[keyof typeof WebSocketState]

// WebSocket Configuration
export interface WebSocketConfig {
  url: string
  protocols?: string[]
  options?: {
    heartbeatInterval?: number
    reconnectDelay?: number
    maxReconnectAttempts?: number
    timeout?: number
  }
}

// WebSocket Service Interface
export interface WebSocketService {
  connect(config: WebSocketConfig): Promise<void>
  disconnect(): void
  send<T>(message: WebSocketMessage<T>): void
  subscribe<T>(eventType: WebSocketEventType, callback: (payload: T) => void): () => void
  unsubscribe(eventType: WebSocketEventType, callback?: (...args: unknown[]) => void): void
  getState(): WebSocketState
  getConnectedUsers(): User[]
  getCurrentUser(): User | null
  isConnected(): boolean
}

// React Hook Types
export interface UseWebSocketReturn {
  state: WebSocketState
  isConnected: boolean
  connectedUsers: User[]
  send: <T>(message: WebSocketMessage<T>) => void
  subscribe: <T>(eventType: WebSocketEventType, callback: (payload: T) => void) => () => void
  error: Error | null
  reconnect: () => void
}

export interface UseTaskCollaborationReturn {
  tasks: Task[]
  updateTask: (taskId: string, updates: Partial<Task>) => void
  moveTask: (taskId: string, toColumn: string, toPosition: number) => void
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  deleteTask: (taskId: string) => void
  isLoading: boolean
  error: Error | null
  connectedUsers: User[]
  lastUpdate: string | null
  state?: WebSocketState
  isConnected?: boolean
}

export interface UseUserPresenceReturn {
  connectedUsers: User[]
  userPresence: Record<string, UserPresence>
  updatePresence: (presence: Partial<UserPresence>) => void
  isUserActive: (userId: string) => boolean
  getUserCursor: (userId: string) => { x: number; y: number } | null
}

// Error Types
export class WebSocketError extends Error {
  code?: string
  details?: any

  constructor(message: string, code?: string, details?: any) {
    super(message)
    this.name = 'WebSocketError'
    this.code = code
    this.details = details
  }
}

export class ConnectionError extends WebSocketError {
  constructor(message: string, details?: any) {
    super(message, 'CONNECTION_ERROR', details)
    this.name = 'ConnectionError'
  }
}

export class ReconnectionError extends WebSocketError {
  constructor(message: string, details?: any) {
    super(message, 'RECONNECTION_ERROR', details)
    this.name = 'ReconnectionError'
  }
}

export class MessageError extends WebSocketError {
  constructor(message: string, details?: any) {
    super(message, 'MESSAGE_ERROR', details)
    this.name = 'MessageError'
  }
}
