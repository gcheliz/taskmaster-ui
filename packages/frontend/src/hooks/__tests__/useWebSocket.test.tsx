import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useWebSocket } from '../useWebSocket'
import { webSocketService } from '../../services/websocket'
import { WebSocketState, WebSocketEventType } from '../../types/websocket'

// Mock the webSocketService
vi.mock('../../services/websocket', () => ({
  webSocketService: {
    connect: vi.fn(() => Promise.resolve()),
    disconnect: vi.fn(),
    send: vi.fn(),
    subscribe: vi.fn(() => vi.fn()), // Returns an unsubscribe function
    isConnected: vi.fn(() => false),
    getState: vi.fn(() => 'disconnected'), // Use string directly
    getConnectedUsers: vi.fn(() => []),
    setCurrentUser: vi.fn(),
  }
}))

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset default implementation
    vi.mocked(webSocketService.subscribe).mockImplementation(() => vi.fn())
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Connection Management', () => {
    it('returns initial disconnected state', () => {
      const { result } = renderHook(() => useWebSocket())

      expect(result.current.state).toBe(WebSocketState.DISCONNECTED)
      expect(result.current.isConnected).toBe(false)
      expect(result.current.connectedUsers).toEqual([])
      expect(result.current.error).toBeNull()
    })

    it('connects when autoConnect is true', async () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' }
      
      renderHook(() => useWebSocket({
        url: 'ws://localhost:3000',
        autoConnect: true,
        user: mockUser
      }))

      await waitFor(() => {
        expect(webSocketService.setCurrentUser).toHaveBeenCalledWith(mockUser)
        expect(webSocketService.connect).toHaveBeenCalledWith({
          url: 'ws://localhost:3000',
          options: {
            heartbeatInterval: 30000,
            reconnectDelay: 1000,
            maxReconnectAttempts: 5,
            timeout: 5000,
          }
        })
      })
    })

    it('does not connect when autoConnect is false', () => {
      renderHook(() => useWebSocket({
        url: 'ws://localhost:3000',
        autoConnect: false
      }))

      expect(webSocketService.connect).not.toHaveBeenCalled()
    })

    it('handles connection when already connected', () => {
      vi.mocked(webSocketService.isConnected).mockReturnValue(true)
      vi.mocked(webSocketService.getState).mockReturnValue('connected')

      renderHook(() => useWebSocket({
        url: 'ws://localhost:3000',
        autoConnect: true
      }))

      expect(webSocketService.connect).not.toHaveBeenCalled()
    })
  })

  describe('State Management', () => {
    it('subscribes to state changes', () => {
      const { result } = renderHook(() => useWebSocket())

      // Verify subscriptions were created
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        WebSocketEventType.CONNECT,
        expect.any(Function)
      )
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        WebSocketEventType.USER_JOINED,
        expect.any(Function)
      )
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        WebSocketEventType.USER_LEFT,
        expect.any(Function)
      )
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        WebSocketEventType.ERROR,
        expect.any(Function)
      )
    })

    it('updates connected users on connection established', () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' }
      ]

      let connectionCallback: any
      vi.mocked(webSocketService.subscribe).mockImplementation((event, callback) => {
        if (event === WebSocketEventType.CONNECT) {
          connectionCallback = callback
        }
        return vi.fn()
      })

      const { result } = renderHook(() => useWebSocket())

      act(() => {
        connectionCallback({ connectedUsers: mockUsers })
      })

      expect(result.current.connectedUsers).toEqual(mockUsers)
    })

    it('updates connected users when user joins or leaves', () => {
      const mockUsers = [{ id: '1', name: 'User 1', email: 'user1@example.com' }]
      vi.mocked(webSocketService.getConnectedUsers).mockReturnValue(mockUsers)

      let userJoinedCallback: any
      let userLeftCallback: any
      vi.mocked(webSocketService.subscribe).mockImplementation((event, callback) => {
        if (event === WebSocketEventType.USER_JOINED) {
          userJoinedCallback = callback
        } else if (event === WebSocketEventType.USER_LEFT) {
          userLeftCallback = callback
        }
        return vi.fn()
      })

      const { result } = renderHook(() => useWebSocket())

      act(() => {
        userJoinedCallback({})
      })

      expect(result.current.connectedUsers).toEqual(mockUsers)
    })

    it('handles errors', () => {
      let errorCallback: any
      vi.mocked(webSocketService.subscribe).mockImplementation((event, callback) => {
        if (event === WebSocketEventType.ERROR) {
          errorCallback = callback
        }
        return vi.fn()
      })

      const { result } = renderHook(() => useWebSocket())

      const testError = new Error('Test error')
      act(() => {
        errorCallback({ error: testError })
      })

      expect(result.current.error).toEqual(testError)
    })
  })

  describe('Message Handling', () => {
    it('sends messages using webSocketService', () => {
      const { result } = renderHook(() => useWebSocket())

      const message = { type: WebSocketEventType.TASK_UPDATED, payload: { id: '1' } }
      
      act(() => {
        result.current.send(message)
      })

      expect(webSocketService.send).toHaveBeenCalledWith(message)
    })

    it('handles send errors', () => {
      const sendError = new Error('Send failed')
      vi.mocked(webSocketService.send).mockImplementation(() => {
        throw sendError
      })

      const { result } = renderHook(() => useWebSocket())

      const message = { type: WebSocketEventType.TASK_UPDATED, payload: { id: '1' } }
      
      act(() => {
        result.current.send(message)
      })

      expect(result.current.error).toEqual(sendError)
    })

    it('clears error on successful send', () => {
      const { result } = renderHook(() => useWebSocket())

      // First set an error
      vi.mocked(webSocketService.send).mockImplementationOnce(() => {
        throw new Error('Send failed')
      })
      
      act(() => {
        result.current.send({ type: WebSocketEventType.TASK_UPDATED, payload: {} })
      })
      expect(result.current.error).not.toBeNull()

      // Then send successfully
      vi.mocked(webSocketService.send).mockImplementationOnce(() => {})
      
      act(() => {
        result.current.send({ type: WebSocketEventType.TASK_UPDATED, payload: {} })
      })
      expect(result.current.error).toBeNull()
    })
  })

  describe('Subscription Management', () => {
    it('subscribes to events', () => {
      const mockUnsubscribe = vi.fn()
      vi.mocked(webSocketService.subscribe).mockReturnValue(mockUnsubscribe)

      const { result } = renderHook(() => useWebSocket())

      const callback = vi.fn()
      const unsubscribe = result.current.subscribe(WebSocketEventType.TASK_UPDATED, callback)

      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        WebSocketEventType.TASK_UPDATED,
        callback
      )
      expect(unsubscribe).toBe(mockUnsubscribe)
    })

    it('cleans up subscriptions on unmount', () => {
      const unsubscribeFns = [vi.fn(), vi.fn(), vi.fn(), vi.fn()]
      let subscribeIndex = 0
      
      vi.mocked(webSocketService.subscribe).mockImplementation(() => {
        return unsubscribeFns[subscribeIndex++]
      })

      const { unmount } = renderHook(() => useWebSocket())

      unmount()

      unsubscribeFns.forEach(fn => {
        expect(fn).toHaveBeenCalled()
      })
    })
  })

  describe('Reconnection', () => {
    it('reconnects with config url', async () => {
      const { result } = renderHook(() => useWebSocket({
        url: 'ws://localhost:3000'
      }))

      await act(async () => {
        result.current.reconnect()
      })

      expect(webSocketService.connect).toHaveBeenCalledWith({
        url: 'ws://localhost:3000',
        options: {
          heartbeatInterval: 30000,
          reconnectDelay: 1000,
          maxReconnectAttempts: 5,
          timeout: 5000,
        }
      })
    })

    it('handles reconnect errors', async () => {
      const connectError = new Error('Connection failed')
      vi.mocked(webSocketService.connect).mockRejectedValue(connectError)

      const { result } = renderHook(() => useWebSocket({
        url: 'ws://localhost:3000'
      }))

      await act(async () => {
        result.current.reconnect()
      })

      await waitFor(() => {
        expect(result.current.error).toEqual(connectError)
      })
    })

    it('does not reconnect without url', () => {
      const { result } = renderHook(() => useWebSocket())

      result.current.reconnect()

      expect(webSocketService.connect).not.toHaveBeenCalled()
    })
  })
})