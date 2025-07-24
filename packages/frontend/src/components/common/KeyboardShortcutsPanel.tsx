import React, { useState, useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalClose } from '../ui/molecules/Modal'
import { useKeyboardShortcuts, type KeyboardShortcut } from '../../hooks/useKeyboardShortcuts'
import { cn } from '../../utils/cn'

export interface KeyboardShortcutsPanelProps {
  /** Whether the panel is open */
  open: boolean
  /** Callback when the panel open state changes */
  onOpenChange: (open: boolean) => void
  /** Additional shortcuts to display */
  additionalShortcuts?: KeyboardShortcut[]
  /** Additional CSS class name */
  className?: string
}

// Default keyboard shortcuts
const defaultShortcuts: KeyboardShortcut[] = [
  // Navigation
  { key: 'cmd+k', description: 'Open command palette / search', category: 'Navigation', handler: () => {} },
  { key: 'cmd+/', description: 'Show keyboard shortcuts', category: 'Navigation', handler: () => {} },
  { key: 'g h', description: 'Go to dashboard', category: 'Navigation', handler: () => {} },
  { key: 'g r', description: 'Go to repositories', category: 'Navigation', handler: () => {} },
  { key: 'g t', description: 'Go to tasks', category: 'Navigation', handler: () => {} },
  { key: 'g s', description: 'Go to settings', category: 'Navigation', handler: () => {} },
  
  // Task Board
  { key: 'ArrowLeft', description: 'Navigate to previous column', category: 'Task Board', handler: () => {} },
  { key: 'ArrowRight', description: 'Navigate to next column', category: 'Task Board', handler: () => {} },
  { key: 'ArrowUp', description: 'Navigate to previous task', category: 'Task Board', handler: () => {} },
  { key: 'ArrowDown', description: 'Navigate to next task', category: 'Task Board', handler: () => {} },
  { key: 'Enter', description: 'Select/open focused item', category: 'Task Board', handler: () => {} },
  
  // General
  { key: 'Escape', description: 'Close modal/dialog', category: 'General', handler: () => {} },
  { key: 'Tab', description: 'Move focus to next element', category: 'General', handler: () => {} },
  { key: 'Shift+Tab', description: 'Move focus to previous element', category: 'General', handler: () => {} },
  { key: 'Space', description: 'Activate focused button/link', category: 'General', handler: () => {} },
]

/**
 * Keyboard Shortcuts Panel Component
 * 
 * Displays a modal panel showing all available keyboard shortcuts
 * organized by category
 */
export const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({
  open,
  onOpenChange,
  additionalShortcuts = [],
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  // Combine default and additional shortcuts
  const shortcuts = [...defaultShortcuts, ...additionalShortcuts]

  // Don't register the shortcut here as it's already registered in AppLayout
  // This was causing an infinite loop

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(shortcut)
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  // Filter shortcuts based on search
  const filteredGroupedShortcuts = Object.entries(groupedShortcuts).reduce((acc, [category, shortcuts]) => {
    const filtered = shortcuts.filter(
      (shortcut) =>
        shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shortcut.key.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (filtered.length > 0) {
      acc[category] = filtered
    }
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  // Format key for display
  const formatKey = (key: string): string => {
    return key
      .split('+')
      .map((part) => {
        if (part === 'cmd' || part === 'meta') {
          return isMac ? '⌘' : 'Ctrl'
        }
        if (part === 'ctrl') {
          return 'Ctrl'
        }
        if (part === 'alt') {
          return isMac ? '⌥' : 'Alt'
        }
        if (part === 'shift') {
          return '⇧'
        }
        if (part === 'ArrowLeft') return '←'
        if (part === 'ArrowRight') return '→'
        if (part === 'ArrowUp') return '↑'
        if (part === 'ArrowDown') return '↓'
        return part.charAt(0).toUpperCase() + part.slice(1)
      })
      .join(' + ')
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg" className={className}>
        <ModalHeader>
          <ModalTitle>Keyboard Shortcuts</ModalTitle>
          <ModalClose />
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* Search */}
            <div className="sticky top-0 bg-white z-10 pb-4">
              <input
                type="text"
                placeholder="Search shortcuts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>

            {/* Shortcuts list */}
            {Object.entries(filteredGroupedShortcuts).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No shortcuts found matching "{searchQuery}"
              </div>
            ) : (
              Object.entries(filteredGroupedShortcuts).map(([category, shortcuts]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {shortcuts.map((shortcut, index) => (
                      <div
                        key={`${category}-${index}`}
                        className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50"
                      >
                        <span className="text-sm text-gray-700">{shortcut.description}</span>
                        <kbd
                          className={cn(
                            'inline-flex items-center px-2 py-1 text-xs font-semibold',
                            'text-gray-800 bg-gray-100 border border-gray-300 rounded',
                            'shadow-sm'
                          )}
                        >
                          {formatKey(shortcut.key)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* Tips */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Press Tab to navigate through interactive elements</li>
                <li>• Use arrow keys to navigate within lists and grids</li>
                <li>• Press Escape to close modals and cancel operations</li>
                <li>• Sequential shortcuts (like "g h") require pressing keys in order</li>
              </ul>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default KeyboardShortcutsPanel