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
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'enter',
          description: 'Test enter key',
          handler: callback
        }
      ]))

      await user.keyboard('{Enter}')
      
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('handles multiple shortcuts', async () => {
      const user = userEvent.setup()
      const enterCallback = vi.fn()
      const escapeCallback = vi.fn()
      const spaceCallback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'enter',
          description: 'Test enter key',
          handler: enterCallback
        },
        {
          key: 'escape',
          description: 'Test escape key',
          handler: escapeCallback
        },
        {
          key: ' ',
          description: 'Test space key',
          handler: spaceCallback
        }
      ]))

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
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'enter',
          description: 'Test enter key',
          handler: callback
        }
      ]))

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
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'ctrl+s',
          description: 'Test ctrl+s',
          handler: callback
        },
        {
          key: 'cmd+s',
          description: 'Test cmd+s',
          handler: callback
        }
      ]))

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
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'alt+n',
          description: 'Test alt+n',
          handler: callback
        }
      ]))

      await user.keyboard('{Alt>}n{/Alt}')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('handles Shift key combinations', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'shift+tab',
          description: 'Test shift+tab',
          handler: callback
        }
      ]))

      await user.keyboard('{Shift>}{Tab}{/Shift}')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('handles multiple modifier keys', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'ctrl+shift+k',
          description: 'Test ctrl+shift+k',
          handler: callback
        }
      ]))

      await user.keyboard('{Control>}{Shift>}k{/Shift}{/Control}')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('distinguishes between similar shortcuts', async () => {
      const user = userEvent.setup()
      const ctrlA = vi.fn()
      const ctrlShiftA = vi.fn()
      const justA = vi.fn()
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'a',
          description: 'Test a',
          handler: justA
        },
        {
          key: 'ctrl+a',
          description: 'Test ctrl+a',
          handler: ctrlA
        },
        {
          key: 'ctrl+shift+a',
          description: 'Test ctrl+shift+a',
          handler: ctrlShiftA
        }
      ]))

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

  describe('Context Awareness', () => {
    it('prevents shortcuts when typing in inputs', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'a',
          description: 'Test a',
          handler: callback
        }
      ]))

      // Create and focus an input
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      await user.keyboard('a')
      expect(callback).not.toHaveBeenCalled()

      // Clean up
      document.body.removeChild(input)
    })

    it('prevents shortcuts when typing in textareas', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'enter',
          description: 'Test enter',
          handler: callback
        }
      ]))

      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.focus()

      await user.keyboard('{Enter}')
      expect(callback).not.toHaveBeenCalled()

      document.body.removeChild(textarea)
    })

    it('allows shortcuts with modifiers in inputs', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'ctrl+s',
          description: 'Test ctrl+s',
          handler: callback
        }
      ]))

      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      await user.keyboard('{Control>}s{/Control}')
      expect(callback).toHaveBeenCalledTimes(1)

      document.body.removeChild(input)
    })

    it.skip('prevents shortcuts in contenteditable elements', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'b',
          description: 'Test b',
          handler: callback
        }
      ]))

      const div = document.createElement('div')
      div.setAttribute('contenteditable', 'true')
      document.body.appendChild(div)
      div.focus()

      // Dispatch event directly on the contenteditable element
      const event = new KeyboardEvent('keydown', {
        key: 'b',
        bubbles: true,
        cancelable: true
      })
      div.dispatchEvent(event)
      
      expect(callback).not.toHaveBeenCalled()

      document.body.removeChild(div)
    })
  })

  describe('Event Handling', () => {
    it('prevents default when specified', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      const preventDefaultSpy = vi.fn()
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'ctrl+s',
          description: 'Test ctrl+s',
          handler: callback,
          preventDefault: true
        }
      ]))

      // Override preventDefault to spy on it
      const originalPreventDefault = Event.prototype.preventDefault
      Event.prototype.preventDefault = preventDefaultSpy

      await user.keyboard('{Control>}s{/Control}')
      
      expect(callback).toHaveBeenCalledTimes(1)
      expect(preventDefaultSpy).toHaveBeenCalled()

      // Restore original
      Event.prototype.preventDefault = originalPreventDefault
    })

    it('does not prevent default when set to false', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      const preventDefaultSpy = vi.fn()
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'ctrl+o',
          description: 'Test ctrl+o',
          handler: callback,
          preventDefault: false
        }
      ]))

      const originalPreventDefault = Event.prototype.preventDefault
      Event.prototype.preventDefault = preventDefaultSpy

      await user.keyboard('{Control>}o{/Control}')
      
      expect(callback).toHaveBeenCalledTimes(1)
      expect(preventDefaultSpy).not.toHaveBeenCalled()

      Event.prototype.preventDefault = originalPreventDefault
    })
  })

  describe('Hook Lifecycle', () => {
    it('updates shortcuts when they change', async () => {
      const user = userEvent.setup()
      const callbackA = vi.fn()
      const callbackB = vi.fn()
      
      const { rerender } = renderHook(
        ({ shortcuts }) => useKeyboardShortcuts(shortcuts),
        {
          initialProps: {
            shortcuts: [
              {
                key: 'a',
                description: 'Test a',
                handler: callbackA
              }
            ]
          }
        }
      )

      await user.keyboard('a')
      expect(callbackA).toHaveBeenCalledTimes(1)
      expect(callbackB).not.toHaveBeenCalled()

      // Change shortcuts
      rerender({
        shortcuts: [
          {
            key: 'b',
            description: 'Test b',
            handler: callbackB
          }
        ]
      })

      await user.keyboard('a')
      expect(callbackA).toHaveBeenCalledTimes(1) // Still 1

      await user.keyboard('b')
      expect(callbackB).toHaveBeenCalledTimes(1)
    })

    it('cleans up event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      const { unmount } = renderHook(() => useKeyboardShortcuts([
        {
          key: 'enter',
          description: 'Test enter',
          handler: vi.fn()
        }
      ]))

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('Special Keys', () => {
    it('handles arrow keys', async () => {
      const user = userEvent.setup()
      const callbacks = {
        up: vi.fn(),
        down: vi.fn(),
        left: vi.fn(),
        right: vi.fn(),
      }
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'arrowup',
          description: 'Test arrow up',
          handler: callbacks.up
        },
        {
          key: 'arrowdown',
          description: 'Test arrow down',
          handler: callbacks.down
        },
        {
          key: 'arrowleft',
          description: 'Test arrow left',
          handler: callbacks.left
        },
        {
          key: 'arrowright',
          description: 'Test arrow right',
          handler: callbacks.right
        }
      ]))

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
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'f1',
          description: 'Test F1',
          handler: callback
        }
      ]))

      await user.keyboard('{F1}')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('handles page navigation keys', async () => {
      const user = userEvent.setup()
      const callbacks = {
        home: vi.fn(),
        end: vi.fn(),
        pageUp: vi.fn(),
        pageDown: vi.fn(),
      }
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'home',
          description: 'Test home',
          handler: callbacks.home
        },
        {
          key: 'end',
          description: 'Test end',
          handler: callbacks.end
        },
        {
          key: 'pageup',
          description: 'Test page up',
          handler: callbacks.pageUp
        },
        {
          key: 'pagedown',
          description: 'Test page down',
          handler: callbacks.pageDown
        }
      ]))

      await user.keyboard('{Home}')
      expect(callbacks.home).toHaveBeenCalledTimes(1)

      await user.keyboard('{End}')
      expect(callbacks.end).toHaveBeenCalledTimes(1)

      await user.keyboard('{PageUp}')
      expect(callbacks.pageUp).toHaveBeenCalledTimes(1)

      await user.keyboard('{PageDown}')
      expect(callbacks.pageDown).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty shortcuts array', async () => {
      const user = userEvent.setup()
      
      renderHook(() => useKeyboardShortcuts([]))

      // Should not throw
      await user.keyboard('{Enter}')
      await user.keyboard('a')
      await user.keyboard('{Control>}s{/Control}')
    })

    it('handles duplicate shortcuts', async () => {
      const user = userEvent.setup()
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'ctrl+s',
          description: 'First handler',
          handler: callback1
        },
        {
          key: 'ctrl+s',
          description: 'Second handler',
          handler: callback2
        }
      ]))

      await user.keyboard('{Control>}s{/Control}')
      
      // Only first should be called due to break in loop
      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).not.toHaveBeenCalled()
    })

    it('handles rapid key presses', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'a',
          description: 'Test a',
          handler: callback
        }
      ]))

      // Rapid presses
      await user.keyboard('aaaaa')
      
      expect(callback).toHaveBeenCalledTimes(5)
    })

    it.skip('handles shortcuts during animation frames', async () => {
      const user = userEvent.setup()
      const callback = vi.fn()
      
      renderHook(() => useKeyboardShortcuts([
        {
          key: 'space',
          description: 'Test space',
          handler: callback
        }
      ]))

      // Dispatch a keyboard event directly
      const event = new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        bubbles: true
      })
      window.dispatchEvent(event)
      
      // Should work immediately
      expect(callback).toHaveBeenCalled()
    })
  })
})