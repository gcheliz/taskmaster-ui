import { useEffect, useCallback, useRef } from 'react'
import { useNavigate } from "react-router"

export interface KeyboardShortcut {
  /** The key combination (e.g., 'cmd+k', 'ctrl+shift+p') */
  key: string
  /** Description of what this shortcut does */
  description: string
  /** Handler function to execute */
  handler: () => void
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean
  /** Category for grouping shortcuts in documentation */
  category?: string
}

/**
 * Parse a keyboard shortcut string into modifiers and key
 */
const parseShortcut = (shortcut: string) => {
  const parts = shortcut.toLowerCase().split('+')
  const key = parts[parts.length - 1]
  const modifiers = {
    ctrl: parts.includes('ctrl'),
    cmd: parts.includes('cmd') || parts.includes('meta'),
    alt: parts.includes('alt'),
    shift: parts.includes('shift'),
  }
  return { modifiers, key }
}

/**
 * Check if a keyboard event matches a shortcut
 */
const matchesShortcut = (event: KeyboardEvent, shortcut: string): boolean => {
  const { modifiers, key } = parseShortcut(shortcut)
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  // Check modifiers
  const ctrlKey = isMac ? event.metaKey : event.ctrlKey
  const cmdKey = isMac ? event.metaKey : event.ctrlKey

  if (modifiers.ctrl && !ctrlKey) return false
  if (modifiers.cmd && !cmdKey) return false
  if (modifiers.alt && !event.altKey) return false
  if (modifiers.shift && !event.shiftKey) return false

  // Check key
  return event.key.toLowerCase() === key
}

/**
 * Global keyboard shortcuts hook
 * 
 * Provides a centralized way to manage keyboard shortcuts throughout the application
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
                      target.isContentEditable

      if (isTyping && !event.metaKey && !event.ctrlKey) {
        return
      }

      // Check each shortcut
      for (const shortcut of shortcutsRef.current) {
        if (matchesShortcut(event, shortcut.key)) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          shortcut.handler()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}

/**
 * Built-in global shortcuts for the application
 */
export const useGlobalKeyboardShortcuts = () => {
  const navigate = useNavigate()

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'cmd+k',
      description: 'Open command palette / search',
      category: 'Navigation',
      handler: () => {
        // TODO: Open command palette/search modal
        console.log('Command palette triggered')
      },
    },
    // Removed cmd+/ as it's handled in AppLayout
    {
      key: 'g h',
      description: 'Go to dashboard',
      category: 'Navigation',
      handler: () => navigate('/'),
    },
    {
      key: 'g r',
      description: 'Go to repositories',
      category: 'Navigation',
      handler: () => navigate('/repositories'),
    },
    {
      key: 'g t',
      description: 'Go to tasks',
      category: 'Navigation',
      handler: () => navigate('/tasks'),
    },
    {
      key: 'g s',
      description: 'Go to settings',
      category: 'Navigation',
      handler: () => navigate('/settings'),
    },
    {
      key: 'escape',
      description: 'Close modal/dialog',
      category: 'General',
      handler: () => {
        // This will be handled by individual modals
      },
      preventDefault: false,
    },
  ]

  useKeyboardShortcuts(shortcuts)

  return shortcuts
}

/**
 * Sequential key detection for shortcuts like 'g h' (press g then h)
 */
export const useSequentialKeys = () => {
  const sequenceRef = useRef<string[]>([])
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const addKey = useCallback((key: string) => {
    sequenceRef.current.push(key)

    // Clear sequence after 800ms
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      sequenceRef.current = []
    }, 800)
  }, [])

  const matchesSequence = useCallback((sequence: string): boolean => {
    const keys = sequence.split(' ')
    const current = sequenceRef.current.join(' ')
    return current === sequence
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { addKey, matchesSequence }
}