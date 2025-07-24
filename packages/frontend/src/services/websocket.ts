/**
 * WebSocket Service for Real-Time Collaboration
 * Handles connection, message routing, and event management
 */

import {
  WebSocketState,
  WebSocketEventType,
  ConnectionError,
  ReconnectionError,
  MessageError,
} from '../types/websocket'
import type { WebSocketConfig, WebSocketService, WebSocketMessage, User } from '../types/websocket'

class TaskMasterWebSocketService implements WebSocketService {
  private socket: WebSocket | null = null
  private config: WebSocketConfig | null = null
  private state: WebSocketState = WebSocketState.DISCONNECTED
  private eventListeners: Map<WebSocketEventType, Set<(...args: unknown[]) => void>> = new Map()
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 1000
  private heartbeatInterval: number = 30000
  private connectedUsers: User[] = []
  private currentUser: User | null = null
  private messageQueue: WebSocketMessage[] = []

  constructor() {
    this.setupEventListeners()
  }

  /**
   * Connect to WebSocket server
   */
  async connect(config: WebSocketConfig): Promise<void> {
    this.config = config
    this.maxReconnectAttempts = config.options?.maxReconnectAttempts ?? 5
    this.reconnectDelay = config.options?.reconnectDelay ?? 1000
    this.heartbeatInterval = config.options?.heartbeatInterval ?? 30000

    return new Promise((resolve, reject) => {
      try {
        this.setState(WebSocketState.CONNECTING)

        this.socket = new WebSocket(config.url, config.protocols)

        this.socket.onopen = () => {
          console.log('✅ WebSocket connected')
          this.setState(WebSocketState.CONNECTED)
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.flushMessageQueue()
          resolve()
        }

        this.socket.onmessage = (event) => {
          this.handleMessage(event)
        }

        this.socket.onerror = (error) => {
          console.error('❌ WebSocket error:', error)
          this.setState(WebSocketState.ERROR)
          reject(new ConnectionError('Failed to connect to WebSocket', error))
        }

        this.socket.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason)
          this.setState(WebSocketState.DISCONNECTED)
          this.stopHeartbeat()

          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect()
          }
        }

        // Connection timeout
        const timeout = config.options?.timeout ?? 5000
        setTimeout(() => {
          if (this.state === WebSocketState.CONNECTING) {
            this.socket?.close()
            reject(new ConnectionError('Connection timeout'))
          }
        }, timeout)
      } catch (error) {
        this.setState(WebSocketState.ERROR)
        reject(new ConnectionError('Failed to initialize WebSocket', error))
      }
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.stopHeartbeat()

    if (this.socket) {
      this.socket.close(1000, 'User disconnected')
      this.socket = null
    }

    this.setState(WebSocketState.DISCONNECTED)
    this.connectedUsers = []
    this.currentUser = null
    this.messageQueue = []
  }

  /**
   * Send message to WebSocket server
   */
  send<T>(message: WebSocketMessage<T>): void {
    if (!this.socket || this.state !== WebSocketState.CONNECTED) {
      // Queue message for later if we're reconnecting
      if (this.state === WebSocketState.RECONNECTING) {
        this.messageQueue.push(message)
        return
      }
      throw new MessageError('WebSocket not connected')
    }

    try {
      const messageWithTimestamp = {
        ...message,
        timestamp: new Date().toISOString(),
        sessionId: this.generateSessionId(),
      }

      this.socket.send(JSON.stringify(messageWithTimestamp))
    } catch (error) {
      throw new MessageError('Failed to send message', error)
    }
  }

  /**
   * Subscribe to WebSocket events
   */
  subscribe<T>(eventType: WebSocketEventType, callback: (payload: T) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set())
    }

    this.eventListeners.get(eventType)!.add(callback as (...args: unknown[]) => void)

    // Return unsubscribe function
    return () => {
      this.unsubscribe(eventType, callback as (...args: unknown[]) => void)
    }
  }

  /**
   * Unsubscribe from WebSocket events
   */
  unsubscribe(eventType: WebSocketEventType, callback?: (...args: unknown[]) => void): void {
    if (!this.eventListeners.has(eventType)) {
      return
    }

    if (callback) {
      this.eventListeners.get(eventType)!.delete(callback)
    } else {
      this.eventListeners.get(eventType)!.clear()
    }
  }

  /**
   * Get current WebSocket state
   */
  getState(): WebSocketState {
    return this.state
  }

  /**
   * Get list of connected users
   */
  getConnectedUsers(): User[] {
    return [...this.connectedUsers]
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.state === WebSocketState.CONNECTED
  }

  /**
   * Set current user
   */
  setCurrentUser(user: User): void {
    this.currentUser = user
  }

  /**
   * Private Methods
   */

  private setState(newState: WebSocketState): void {
    if (this.state !== newState) {
      const previousState = this.state
      this.state = newState
      this.notifyStateChange(previousState, newState)
    }
  }

  private notifyStateChange(previousState: WebSocketState, newState: WebSocketState): void {
    this.emit(WebSocketEventType.CONNECT, {
      previousState,
      newState,
      timestamp: new Date().toISOString(),
    })
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      this.emit(message.type, message.payload)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
      this.emit(WebSocketEventType.ERROR, {
        error: new MessageError('Failed to parse message', error),
        rawData: event.data,
      })
    }
  }

  private emit(eventType: WebSocketEventType, payload: any): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(payload)
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error)
        }
      })
    }
  }

  private setupEventListeners(): void {
    // Handle user presence updates
    this.subscribe(WebSocketEventType.USER_JOINED, (payload: any) => {
      if (payload.user && !this.connectedUsers.find((u) => u.id === payload.user.id)) {
        this.connectedUsers.push(payload.user)
      }
    })

    this.subscribe(WebSocketEventType.USER_LEFT, (payload: any) => {
      this.connectedUsers = this.connectedUsers.filter((u) => u.id !== payload.userId)
    })

    // Handle connection events
    this.subscribe(WebSocketEventType.CONNECT, (payload: any) => {
      if (payload.user) {
        this.setCurrentUser(payload.user)
      }
      if (payload.connectedUsers) {
        this.connectedUsers = payload.connectedUsers
      }
    })
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached')
      this.setState(WebSocketState.ERROR)
      return
    }

    this.reconnectAttempts++
    this.setState(WebSocketState.RECONNECTING)

    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000)

    console.log(
      `🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    )

    this.reconnectTimer = setTimeout(async () => {
      if (this.config) {
        try {
          await this.connect(this.config)
        } catch (error) {
          console.error('❌ Reconnection failed:', error)
          this.attemptReconnect()
        }
      }
    }, delay)
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({
          type: WebSocketEventType.CONNECT,
          payload: { type: 'heartbeat' },
          timestamp: new Date().toISOString(),
        })
      }
    }, this.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (message) {
        this.send(message)
      }
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
export const webSocketService = new TaskMasterWebSocketService()
export default webSocketService
