import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react'

interface FocusContextType {
  /** Last focused element before modal/dialog opened */
  lastFocusedElement: HTMLElement | null
  /** Save current focus */
  saveFocus: () => void
  /** Restore saved focus */
  restoreFocus: () => void
  /** Focus visible state */
  isFocusVisible: boolean
  /** Set focus visible state */
  setFocusVisible: (visible: boolean) => void
  /** Focus trap stack for nested modals */
  focusTrapStack: HTMLElement[]
  /** Push element to focus trap stack */
  pushFocusTrap: (element: HTMLElement) => void
  /** Pop element from focus trap stack */
  popFocusTrap: () => void
}

const FocusContext = createContext<FocusContextType | undefined>(undefined)

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null)
  const [isFocusVisible, setFocusVisible] = useState(false)
  const [focusTrapStack, setFocusTrapStack] = useState<HTMLElement[]>([])
  const focusStackRef = useRef<HTMLElement[]>([])

  const saveFocus = useCallback(() => {
    const currentFocus = document.activeElement as HTMLElement
    if (currentFocus && currentFocus !== document.body) {
      setLastFocusedElement(currentFocus)
      focusStackRef.current.push(currentFocus)
    }
  }, [])

  const restoreFocus = useCallback(() => {
    if (focusStackRef.current.length > 0) {
      const elementToFocus = focusStackRef.current.pop()
      if (elementToFocus && elementToFocus.focus) {
        // Ensure element is still in DOM and focusable
        if (document.body.contains(elementToFocus)) {
          elementToFocus.focus()
        }
      }
    } else if (lastFocusedElement && lastFocusedElement.focus) {
      if (document.body.contains(lastFocusedElement)) {
        lastFocusedElement.focus()
      }
    }
  }, [lastFocusedElement])

  const pushFocusTrap = useCallback((element: HTMLElement) => {
    setFocusTrapStack(prev => [...prev, element])
  }, [])

  const popFocusTrap = useCallback(() => {
    setFocusTrapStack(prev => prev.slice(0, -1))
  }, [])

  const value: FocusContextType = useMemo(() => ({
    lastFocusedElement,
    saveFocus,
    restoreFocus,
    isFocusVisible,
    setFocusVisible,
    focusTrapStack,
    pushFocusTrap,
    popFocusTrap,
  }), [lastFocusedElement, saveFocus, restoreFocus, isFocusVisible, focusTrapStack, pushFocusTrap, popFocusTrap])

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
}

export const useFocus = () => {
  const context = useContext(FocusContext)
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider')
  }
  return context
}

/**
 * Hook to create a focus scope
 * Useful for complex components that need isolated focus management
 */
export const useFocusScope = (scopeName: string) => {
  const { saveFocus, restoreFocus } = useFocus()
  const scopeRef = useRef<HTMLElement | null>(null)
  const [isActive, setIsActive] = useState(false)

  const activateScope = useCallback(() => {
    if (!isActive) {
      saveFocus()
      setIsActive(true)
      
      // Focus first focusable element in scope
      if (scopeRef.current) {
        const firstFocusable = scopeRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement
        
        if (firstFocusable) {
          firstFocusable.focus()
        }
      }
    }
  }, [isActive, saveFocus])

  const deactivateScope = useCallback(() => {
    if (isActive) {
      setIsActive(false)
      restoreFocus()
    }
  }, [isActive, restoreFocus])

  return {
    scopeRef,
    isActive,
    activateScope,
    deactivateScope,
  }
}