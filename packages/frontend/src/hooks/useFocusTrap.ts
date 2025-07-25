import { useEffect, useRef } from 'react';

interface UseFocusTrapOptions {
  enabled?: boolean;
  returnFocus?: boolean;
  initialFocus?: string | HTMLElement | null;
  preventScroll?: boolean;
}

export const useFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  options: UseFocusTrapOptions = {}
) => {
  const {
    enabled = true,
    returnFocus = true,
    initialFocus = null,
    preventScroll = false,
  } = options;

  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    
    // Save the previously focused element
    if (returnFocus) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
    }

    // Get all focusable elements
    const getFocusableElements = () => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        'details',
        'summary',
      ].join(',');

      return Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter(element => {
        // Check if element is visible
        const style = window.getComputedStyle(element);
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0'
        );
      });
    };

    // Set initial focus
    const setInitialFocus = () => {
      const focusableElements = getFocusableElements();
      
      if (initialFocus) {
        if (typeof initialFocus === 'string') {
          const element = container.querySelector<HTMLElement>(initialFocus);
          element?.focus({ preventScroll });
        } else if (initialFocus instanceof HTMLElement) {
          initialFocus.focus({ preventScroll });
        }
      } else if (focusableElements.length > 0) {
        focusableElements[0].focus({ preventScroll });
      }
    };

    // Handle tab key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      // If shift+tab on first element, focus last
      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus({ preventScroll });
      }
      // If tab on last element, focus first
      else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus({ preventScroll });
      }
    };

    // Handle escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Let the modal handle the escape key
        container.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            cancelable: true,
          })
        );
      }
    };

    // Set up event listeners
    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('keydown', handleEscape);
    
    // Set initial focus after a small delay to ensure DOM is ready
    setTimeout(setInitialFocus, 50);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('keydown', handleEscape);
      
      // Return focus to previously focused element
      if (returnFocus && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus({ preventScroll });
      }
    };
  }, [enabled, containerRef, returnFocus, initialFocus, preventScroll]);
};

// Hook to disable scroll when focus trap is active
export const useScrollLock = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Get scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Lock scroll
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [enabled]);
};