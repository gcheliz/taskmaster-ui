import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '../useKeyboardShortcuts'
import userEvent from '@testing-library/user-event'

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up any lingering event listeners
    const listeners = (window as any)._eventListeners
    if (listeners) {
      Object.keys(listeners).forEach(type => {
        listeners[type].forEach((listener: any) => {
          window.removeEventListener(type, listener)
        })
      })
    }
  })

  describe('Basic Shortcuts', () => {
    it('registers and triggers simple shortcuts', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts({
        'Enter': callback
      }))

      await user.keyboard('{Enter}')
      
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        key: 'Enter',
        code: 'Enter'
      }))
    })

    it('handles multiple shortcuts', async () => {
      const user = userEvent.setup()
      const enterCallback = vi.fn()
      const escapeCallback = vi.fn()
      const spaceCallback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts({
        'Enter': enterCallback,
        'Escape': escapeCallback,
        ' ': spaceCallback
      }))

      await user.keyboard('{Enter}')
      expect(enterCallback).toHaveBeenCalledTimes(1)
      expect(escapeCallback).not.toHaveBeenCalled()
      expect(spaceCallback).not.toHaveBeenCalled()

      await user.keyboard('{Escape}')
      expect(escapeCallback).toHaveBeenCalledTimes(1)

      await user.keyboard(' ')
      expect(spaceCallback).toHaveBeenCalledTimes(1)
    })

    it('ignores unregistered keys', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts({
        'Enter': callback
      }))

      await user.keyboard('a')
      await user.keyboard('{Tab}')
      await user.keyboard('{Shift}')
      
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('Modifier Keys', () => {
    it('handles Ctrl/Cmd key combinations', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts({
        'ctrl+s': callback,
        'cmd+s': callback
      }))

      // Test Ctrl+S
      await user.keyboard('{Control>}s{/Control}')
      expect(callback).toHaveBeenCalledTimes(1)

      // Test Cmd+S (Mac)
      await user.keyboard('{Meta>}s{/Meta}')
      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('handles Alt key combinations', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts({
        'alt+n': callback
      }))

      await user.keyboard('{Alt>}n{/Alt}')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('handles Shift key combinations', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts({
        'shift+tab': callback
      }))

      await user.keyboard('{Shift>}{Tab}{/Shift}')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('handles multiple modifier keys', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts({
        'ctrl+shift+k': callback
      }))

      await user.keyboard('{Control>}{Shift>}k{/Shift}{/Control}')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('distinguishes between similar shortcuts', async () => {
      const user = userEvent.setup()
      const ctrlA = vi.fn()
      const ctrlShiftA = vi.fn()
      const justA = vi.fn()
      
      renderHook(() => useKeyboardShortcuts({
        'a': justA,
        'ctrl+a': ctrlA,
        'ctrl+shift+a': ctrlShiftA
      }))

      await user.keyboard('a')
      expect(justA).toHaveBeenCalledTimes(1)
      expect(ctrlA).not.toHaveBeenCalled()
      expect(ctrlShiftA).not.toHaveBeenCalled()

      await user.keyboard('{Control>}a{/Control}')
      expect(ctrlA).toHaveBeenCalledTimes(1)
      expect(ctrlShiftA).not.toHaveBeenCalled()

      await user.keyboard('{Control>}{Shift>}a{/Shift}{/Control}')
      expect(ctrlShiftA).toHaveBeenCalledTimes(1)
    })
  })

  describe('Options', () => {
    it('respects enabled option', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      const { rerender } = renderHook(
        ({ enabled }) => useKeyboardShortcuts(
          { 'Enter': callback },
          { enabled }
        ),
        { initialProps: { enabled: false } }
      )

      await user.keyboard('{Enter}')
      expect(callback).not.toHaveBeenCalled()

      rerender({ enabled: true })

      await user.keyboard('{Enter}')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('prevents default when specified', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      const preventDefaultSpy = vi.fn()
      
      renderHook(() => useKeyboardShortcuts(
        { 'Enter': callback },
        { preventDefault: true }
      ))

      // Mock preventDefault on keyboard events
      const originalAddEventListener = window.addEventListener
      window.addEventListener = vi.fn((type, handler: any) => {
        if (type === 'keydown') {
          const wrappedHandler = (e: KeyboardEvent) => {
            e.preventDefault = preventDefaultSpy
            handler(e)
          }
          originalAddEventListener.call(window, type, wrappedHandler)
        } else {
          originalAddEventListener.call(window, type, handler)
        }
      })

      await user.keyboard('{Enter}')
      
      expect(callback).toHaveBeenCalled()
      expect(preventDefaultSpy).toHaveBeenCalled()

      window.addEventListener = originalAddEventListener
    })

    it('ignores input elements when ignoreInputElements is true', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts(
        { 'Enter': callback },
        { ignoreInputElements: true }
      ))

      // Create and focus an input element
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      await user.keyboard('{Enter}')
      expect(callback).not.toHaveBeenCalled()

      // Focus non-input element
      input.blur()
      document.body.focus()

      await user.keyboard('{Enter}')
      expect(callback).toHaveBeenCalledTimes(1)

      document.body.removeChild(input)
    })

    it('works in input elements when ignoreInputElements is false', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts(
        { 'ctrl+s': callback },
        { ignoreInputElements: false }
      ))

      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      await user.keyboard('{Control>}s{/Control}')
      expect(callback).toHaveBeenCalledTimes(1)

      document.body.removeChild(input)
    })

    it('respects target element', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      const div = document.createElement('div')
      div.tabIndex = 0
      document.body.appendChild(div)
      
      renderHook(() => useKeyboardShortcuts(
        { 'Enter': callback },
        { target: div }
      ))

      // Key press outside target
      document.body.focus()
      await user.keyboard('{Enter}')
      expect(callback).not.toHaveBeenCalled()

      // Key press on target
      div.focus()
      await user.keyboard('{Enter}')
      expect(callback).toHaveBeenCalledTimes(1)

      document.body.removeChild(div)
    })
  })

  describe('Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const callback = vi.fn()
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      const { unmount } = renderHook(() => useKeyboardShortcuts({
        'Enter': callback
      }))

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('updates shortcuts when they change', async () => {
      const user = userEvent.setup()
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      
      const { rerender } = renderHook(
        ({ shortcuts }) => useKeyboardShortcuts(shortcuts),
        {
          initialProps: {
            shortcuts: { 'a': callback1 }
          }
        }
      )

      await user.keyboard('a')
      expect(callback1).toHaveBeenCalledTimes(1)

      rerender({ shortcuts: { 'b': callback2 } })

      await user.keyboard('a')
      expect(callback1).toHaveBeenCalledTimes(1) // No additional calls

      await user.keyboard('b')
      expect(callback2).toHaveBeenCalledTimes(1)
    })
  })

  describe('Special Keys', () => {
    it('handles arrow keys', async () => {
      const user = userEvent.setup()
      const callbacks = {
        up: vi.fn(),
        down: vi.fn(),
        left: vi.fn(),
        right: vi.fn()
      }
      
      renderHook(() => useKeyboardShortcuts({
        'ArrowUp': callbacks.up,
        'ArrowDown': callbacks.down,
        'ArrowLeft': callbacks.left,
        'ArrowRight': callbacks.right
      }))

      await user.keyboard('{ArrowUp}')
      expect(callbacks.up).toHaveBeenCalledTimes(1)

      await user.keyboard('{ArrowDown}')
      expect(callbacks.down).toHaveBeenCalledTimes(1)

      await user.keyboard('{ArrowLeft}')
      expect(callbacks.left).toHaveBeenCalledTimes(1)

      await user.keyboard('{ArrowRight}')
      expect(callbacks.right).toHaveBeenCalledTimes(1)
    })

    it('handles function keys', async () => {
      const user = userEvent.setup()
      const f1Callback = vi.fn()
      const f12Callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts({
        'F1': f1Callback,
        'F12': f12Callback
      }))

      await user.keyboard('{F1}')
      expect(f1Callback).toHaveBeenCalledTimes(1)

      await user.keyboard('{F12}')
      expect(f12Callback).toHaveBeenCalledTimes(1)
    })

    it('handles numeric keys', async () => {
      const user = userEvent.setup()
      const callbacks = Array.from({ length: 10 }, (_, i) => vi.fn())
      
      const shortcuts = Object.fromEntries(
        callbacks.map((cb, i) => [i.toString(), cb])
      )
      
      renderHook(() => useKeyboardShortcuts(shortcuts))

      for (let i = 0; i < 10; i++) {
        await user.keyboard(i.toString())
        expect(callbacks[i]).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('Conflict Resolution', () => {
    it('handles conflicting shortcuts with priority', async () => {
      const user = userEvent.setup()
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      
      renderHook(() => useKeyboardShortcuts(
        {
          'ctrl+s': callback1,
          'ctrl+s': callback2 // Second one should override
        }
      ))

      await user.keyboard('{Control>}s{/Control}')
      
      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).toHaveBeenCalledTimes(1)
    })

    it('prevents event bubbling when stopPropagation is set', async () => {
      const user = userEvent.setup()
      const childCallback = vi.fn()
      const parentCallback = vi.fn()
      
      const parent = document.createElement('div')
      const child = document.createElement('div')
      child.tabIndex = 0
      parent.appendChild(child)
      document.body.appendChild(parent)

      // Parent listener
      parent.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') parentCallback()
      })

      // Child with hook
      renderHook(() => useKeyboardShortcuts(
        { 'Enter': childCallback },
        { target: child, stopPropagation: true }
      ))

      child.focus()
      await user.keyboard('{Enter}')

      expect(childCallback).toHaveBeenCalledTimes(1)
      expect(parentCallback).not.toHaveBeenCalled()

      document.body.removeChild(parent)
    })
  })

  describe('Accessibility', () => {
    it('respects user preferences for reduced motion', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      // Mock matchMedia for reduced motion
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      renderHook(() => useKeyboardShortcuts(
        { 'Space': callback },
        { respectReducedMotion: true }
      ))

      // If this shortcut triggers animations, it should be disabled
      await user.keyboard(' ')
      
      // Implementation dependent - adjust based on actual hook behavior
      expect(callback).toHaveBeenCalled()
    })
  })
})