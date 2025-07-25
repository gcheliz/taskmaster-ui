import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useWebSocket } from '../useWebSocket'

// Mock WebSocket
class MockWebSocket {
  url: string
  readyState: number = WebSocket.CONNECTING
  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null

  constructor(url: string) {
    this.url = url
    setTimeout(() => {
      this.readyState = WebSocket.OPEN
      this.onopen?.(new Event('open'))
    }, 0)
  }

  send(data: string) {
    if (this.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open')
    }
  }

  close(code?: number, reason?: string) {
    this.readyState = WebSocket.CLOSED
    this.onclose?.(new CloseEvent('close', { code, reason }))
  }

  // Helper to simulate receiving a message
  receiveMessage(data: any) {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }))
  }

  // Helper to simulate error
  triggerError() {
    this.onerror?.(new Event('error'))
  }
}

global.WebSocket = MockWebSocket as any

describe('useWebSocket', () => {
  let mockWebSocket: MockWebSocket

  beforeEach(() => {
    vi.clearAllMocks()
    // Capture WebSocket instance when created
    const OriginalWebSocket = global.WebSocket
    global.WebSocket = vi.fn().mockImplementation((url: string) => {
      mockWebSocket = new MockWebSocket(url)
      return mockWebSocket
    }) as any
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Connection Management', () => {
    it('establishes connection on mount', async () => {
      const { result } = renderHook(() => useWebSocket('ws://localhost:3000'))

      expect(result.current.readyState).toBe(WebSocket.CONNECTING)

      await waitFor(() => {
        expect(result.current.readyState).toBe(WebSocket.OPEN)
        expect(result.current.isConnected).toBe(true)
      })
    })

    it('closes connection on unmount', async () => {
      const { result, unmount } = renderHook(() => useWebSocket('ws://localhost:3000'))

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      unmount()

      expect(mockWebSocket.readyState).toBe(WebSocket.CLOSED)
    })

    it('handles connection with options', async () => {
      const onOpen = vi.fn()
      const onClose = vi.fn()
      const onError = vi.fn()

      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:3000', {
          onOpen,
          onClose,
          onError,
          reconnectInterval: 1000,
          maxReconnectAttempts: 3
        })
      )

      await waitFor(() => {
        expect(onOpen).toHaveBeenCalled()
        expect(result.current.isConnected).toBe(true)
      })
    })
  })

  describe('Message Handling', () => {
    it('sends messages when connected', async () => {
      const sendSpy = vi.spyOn(MockWebSocket.prototype, 'send')
      const { result } = renderHook(() => useWebSocket('ws://localhost:3000'))

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      const message = { type: 'test', data: 'hello' }
      result.current.sendMessage(message)

      expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(message))
    })

    it('queues messages when not connected', () => {
      const { result } = renderHook(() => useWebSocket('ws://localhost:3000'))

      // Send before connection is established
      const message = { type: 'test', data: 'hello' }
      result.current.sendMessage(message)

      // Message should be queued
      expect(result.current.messageQueue).toContainEqual(message)
    })

    it('sends queued messages after connection', async () => {
      const sendSpy = vi.spyOn(MockWebSocket.prototype, 'send')
      const { result } = renderHook(() => useWebSocket('ws://localhost:3000'))

      // Queue messages before connection
      const message1 = { type: 'test1', data: 'hello1' }
      const message2 = { type: 'test2', data: 'hello2' }
      
      result.current.sendMessage(message1)
      result.current.sendMessage(message2)

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      // Queued messages should be sent
      expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(message1))
      expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(message2))
      expect(result.current.messageQueue).toHaveLength(0)
    })

    it('receives and parses messages', async () => {
      const onMessage = vi.fn()
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:3000', { onMessage })
      )

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      const testMessage = { type: 'update', data: { id: 1, status: 'complete' } }
      
      act(() => {
        mockWebSocket.receiveMessage(testMessage)
      })

      expect(onMessage).toHaveBeenCalledWith(testMessage)
      expect(result.current.lastMessage).toEqual(testMessage)
    })

    it('stores message history', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:3000', { keepHistory: true })
      )

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      const messages = [
        { type: 'msg1', data: 'data1' },
        { type: 'msg2', data: 'data2' },
        { type: 'msg3', data: 'data3' }
      ]

      act(() => {
        messages.forEach(msg => mockWebSocket.receiveMessage(msg))
      })

      expect(result.current.messageHistory).toEqual(messages)
    })

    it('limits message history size', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:3000', { 
          keepHistory: true,
          historyLimit: 2 
        })
      )

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      const messages = [
        { type: 'msg1', data: 'data1' },
        { type: 'msg2', data: 'data2' },
        { type: 'msg3', data: 'data3' }
      ]

      act(() => {
        messages.forEach(msg => mockWebSocket.receiveMessage(msg))
      })

      // Should only keep last 2 messages
      expect(result.current.messageHistory).toEqual([
        messages[1],
        messages[2]
      ])
    })
  })

  describe('Error Handling', () => {
    it('handles connection errors', async () => {
      const onError = vi.fn()
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:3000', { onError })
      )

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      act(() => {
        mockWebSocket.triggerError()
      })

      expect(onError).toHaveBeenCalled()
      expect(result.current.error).toBeDefined()
    })

    it('handles invalid JSON messages', async () => {
      const onError = vi.fn()
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:3000', { onError })
      )

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      // Send invalid JSON
      act(() => {
        mockWebSocket.onmessage?.(new MessageEvent('message', { data: 'invalid json' }))
      })

      expect(onError).toHaveBeenCalled()
    })

    it('handles send errors gracefully', async () => {
      const { result } = renderHook(() => useWebSocket('ws://localhost:3000'))

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      // Force connection to close
      act(() => {
        mockWebSocket.readyState = WebSocket.CLOSED
      })

      // Try to send message
      expect(() => {
        result.current.sendMessage({ type: 'test' })
      }).not.toThrow()

      // Message should be queued
      expect(result.current.messageQueue).toHaveLength(1)
    })
  })

  describe('Reconnection', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    it('attempts to reconnect after disconnect', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:3000', {
          reconnectInterval: 1000,
          maxReconnectAttempts: 3
        })
      )

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      // Simulate disconnect
      act(() => {
        mockWebSocket.close(1006) // Abnormal closure
      })

      expect(result.current.isConnected).toBe(false)
      expect(result.current.reconnectAttempt).toBe(1)

      // Fast forward to trigger reconnect
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
        expect(result.current.reconnectAttempt).toBe(0)
      })
    })

    it('stops reconnecting after max attempts', async () => {
      const onError = vi.fn()
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:3000', {
          reconnectInterval: 1000,
          maxReconnectAttempts: 2,
          onError
        })
      )

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      // Mock connection failures
      let connectionAttempts = 0
      global.WebSocket = vi.fn().mockImplementation(() => {
        connectionAttempts++
        const ws = new MockWebSocket('ws://localhost:3000')
        if (connectionAttempts > 1) {
          setTimeout(() => ws.triggerError(), 0)
        }
        return ws
      }) as any

      // Trigger disconnect
      act(() => {
        mockWebSocket.close(1006)
      })

      // Attempt 1
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      await waitFor(() => {
        expect(result.current.reconnectAttempt).toBe(1)
      })

      // Attempt 2
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(result.current.reconnectAttempt).toBe(2)
      })

      // Should not attempt 3rd time
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.reconnectAttempt).toBe(2)
      expect(onError).toHaveBeenCalled()
    })

    it('resets reconnect attempts on successful connection', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:3000', {
          reconnectInterval: 1000,
          maxReconnectAttempts: 5
        })
      )

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      // Set reconnect attempts
      act(() => {
        result.current.reconnectAttempt = 3
      })

      // Successful reconnection should reset attempts
      act(() => {
        mockWebSocket.onopen?.(new Event('open'))
      })

      expect(result.current.reconnectAttempt).toBe(0)
    })
  })

  describe('Binary Data', () => {
    it('handles binary data when enabled', async () => {
      const onMessage = vi.fn()
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:3000', {
          binaryType: 'arraybuffer',
          onMessage
        })
      )

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      const binaryData = new ArrayBuffer(8)
      const view = new DataView(binaryData)
      view.setInt32(0, 42)

      act(() => {
        mockWebSocket.onmessage?.(new MessageEvent('message', { data: binaryData }))
      })

      expect(onMessage).toHaveBeenCalledWith(binaryData)
    })

    it('sends binary data', async () => {
      const sendSpy = vi.spyOn(MockWebSocket.prototype, 'send')
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:3000', { binaryType: 'arraybuffer' })
      )

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      const binaryData = new ArrayBuffer(8)
      result.current.sendBinaryData(binaryData)

      expect(sendSpy).toHaveBeenCalledWith(binaryData)
    })
  })

  describe('Utility Functions', () => {
    it('manually closes connection', async () => {
      const { result } = renderHook(() => useWebSocket('ws://localhost:3000'))

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      act(() => {
        result.current.disconnect()
      })

      expect(result.current.isConnected).toBe(false)
      expect(mockWebSocket.readyState).toBe(WebSocket.CLOSED)
    })

    it('manually reconnects', async () => {
      const { result } = renderHook(() => useWebSocket('ws://localhost:3000'))

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      // Disconnect first
      act(() => {
        result.current.disconnect()
      })

      expect(result.current.isConnected).toBe(false)

      // Manual reconnect
      act(() => {
        result.current.reconnect()
      })

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })
    })

    it('clears message history', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:3000', { keepHistory: true })
      )

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })

      // Add some messages
      act(() => {
        mockWebSocket.receiveMessage({ type: 'test1' })
        mockWebSocket.receiveMessage({ type: 'test2' })
      })

      expect(result.current.messageHistory).toHaveLength(2)

      // Clear history
      act(() => {
        result.current.clearHistory()
      })

      expect(result.current.messageHistory).toHaveLength(0)
    })
  })
})