/**
 * Keyboard Navigation Utilities
 * 
 * Provides utilities for keyboard navigation detection and management
 * to improve accessibility throughout the application.
 */

let isKeyboardUser = false;
let hasInitialized = false;

/**
 * Initialize keyboard user detection
 * This should be called once at the app root level
 */
export const initializeKeyboardDetection = (): void => {
  if (hasInitialized) return;
  
  hasInitialized = true;
  
  // Detect keyboard usage
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      setKeyboardUser(true);
    }
  };

  // Detect mouse usage
  const handleMouseDown = () => {
    setKeyboardUser(false);
  };

  // Listen for keyboard navigation
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousedown', handleMouseDown);
  
  // Set initial class based on preference
  updateBodyClass();
};

/**
 * Set whether the user is currently using keyboard navigation
 */
const setKeyboardUser = (value: boolean): void => {
  isKeyboardUser = value;
  updateBodyClass();
};

/**
 * Update body class to reflect keyboard/mouse usage
 */
const updateBodyClass = (): void => {
  const body = document.body;
  if (isKeyboardUser) {
    body.classList.add('keyboard-user');
    body.classList.remove('mouse-user');
  } else {
    body.classList.add('mouse-user');
    body.classList.remove('keyboard-user');
  }
};

/**
 * Get whether the user is currently using keyboard navigation
 */
export const getIsKeyboardUser = (): boolean => {
  return isKeyboardUser;
};

/**
 * Focus trap utility for modals and dialogs
 */
export class FocusTrap {
  private element: HTMLElement;
  private focusableElements: HTMLElement[] = [];
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;
  private previousActiveElement: Element | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
    this.updateFocusableElements();
  }

  /**
   * Update the list of focusable elements within the trap
   */
  private updateFocusableElements(): void {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input[type="text"]:not([disabled])',
      'input[type="radio"]:not([disabled])',
      'input[type="checkbox"]:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(',');

    this.focusableElements = Array.from(
      this.element.querySelectorAll(focusableSelectors)
    ).filter((el) => {
      const element = el as HTMLElement;
      return (
        element.offsetWidth > 0 &&
        element.offsetHeight > 0 &&
        !element.hasAttribute('hidden') &&
        getComputedStyle(element).visibility !== 'hidden'
      );
    }) as HTMLElement[];

    this.firstFocusableElement = this.focusableElements[0] || null;
    this.lastFocusableElement = 
      this.focusableElements[this.focusableElements.length - 1] || null;
  }

  /**
   * Activate the focus trap
   */
  activate(): void {
    this.previousActiveElement = document.activeElement;
    
    // Focus the first element or the container
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    } else {
      this.element.focus();
    }

    // Add event listener for tab trapping
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Deactivate the focus trap
   */
  deactivate(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // Return focus to previous element
    if (this.previousActiveElement instanceof HTMLElement) {
      this.previousActiveElement.focus();
    }
  }

  /**
   * Handle keydown events for focus trapping
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab') return;

    this.updateFocusableElements();

    if (this.focusableElements.length === 0) {
      e.preventDefault();
      return;
    }

    if (e.shiftKey) {
      // Shift + Tab (backward)
      if (document.activeElement === this.firstFocusableElement) {
        e.preventDefault();
        this.lastFocusableElement?.focus();
      }
    } else {
      // Tab (forward)
      if (document.activeElement === this.lastFocusableElement) {
        e.preventDefault();
        this.firstFocusableElement?.focus();
      }
    }
  };
}

/**
 * Utility to manage focus for roving tabindex patterns
 */
export class RovingTabIndex {
  private container: HTMLElement;
  private items: HTMLElement[] = [];
  private currentIndex = 0;

  constructor(container: HTMLElement, itemSelector: string) {
    this.container = container;
    this.updateItems(itemSelector);
    this.setupEventListeners();
  }

  /**
   * Update the list of items
   */
  updateItems(itemSelector: string): void {
    this.items = Array.from(
      this.container.querySelectorAll(itemSelector)
    ) as HTMLElement[];
    
    this.items.forEach((item, index) => {
      item.tabIndex = index === this.currentIndex ? 0 : -1;
    });
  }

  /**
   * Set focus to specific item by index
   */
  focusItem(index: number): void {
    if (index < 0 || index >= this.items.length) return;
    
    this.items[this.currentIndex].tabIndex = -1;
    this.currentIndex = index;
    this.items[this.currentIndex].tabIndex = 0;
    this.items[this.currentIndex].focus();
  }

  /**
   * Setup keyboard event listeners
   */
  private setupEventListeners(): void {
    this.container.addEventListener('keydown', this.handleKeyDown);
    
    this.items.forEach((item, index) => {
      item.addEventListener('focus', () => {
        this.currentIndex = index;
        this.updateTabIndices();
      });
    });
  }

  /**
   * Update tab indices for all items
   */
  private updateTabIndices(): void {
    this.items.forEach((item, index) => {
      item.tabIndex = index === this.currentIndex ? 0 : -1;
    });
  }

  /**
   * Handle keydown for arrow key navigation
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    let newIndex = this.currentIndex;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = (this.currentIndex + 1) % this.items.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = this.currentIndex === 0 
          ? this.items.length - 1 
          : this.currentIndex - 1;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = this.items.length - 1;
        break;
      default:
        return;
    }

    this.focusItem(newIndex);
  };

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    this.container.removeEventListener('keydown', this.handleKeyDown);
  }
}

/**
 * Announce text to screen readers using live regions
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.textContent = message;
  
  document.body.appendChild(liveRegion);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(liveRegion);
  }, 1000);
};

/**
 * Skip link utility for programmatic navigation
 */
export const skipToContent = (targetId: string): void => {
  const target = document.getElementById(targetId);
  if (target) {
    target.focus();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

/**
 * Check if an element is visible and focusable
 */
export const isFocusable = (element: HTMLElement): boolean => {
  if (element.tabIndex < 0) return false;
  if (element.hasAttribute('disabled')) return false;
  if (element.hasAttribute('hidden')) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;
  
  const style = getComputedStyle(element);
  if (style.display === 'none') return false;
  if (style.visibility === 'hidden') return false;
  if (parseFloat(style.opacity) === 0) return false;
  
  return true;
};

/**
 * Get the next focusable element in the DOM
 */
export const getNextFocusableElement = (
  currentElement: HTMLElement,
  container?: HTMLElement
): HTMLElement | null => {
  const root = container || document.body;
  const focusableElements = root.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  const currentIndex = Array.from(focusableElements).indexOf(currentElement);
  const nextElement = focusableElements[currentIndex + 1] as HTMLElement;
  
  return nextElement && isFocusable(nextElement) ? nextElement : null;
};

/**
 * Get the previous focusable element in the DOM
 */
export const getPreviousFocusableElement = (
  currentElement: HTMLElement,
  container?: HTMLElement
): HTMLElement | null => {
  const root = container || document.body;
  const focusableElements = root.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  const currentIndex = Array.from(focusableElements).indexOf(currentElement);
  const previousElement = focusableElements[currentIndex - 1] as HTMLElement;
  
  return previousElement && isFocusable(previousElement) ? previousElement : null;
};