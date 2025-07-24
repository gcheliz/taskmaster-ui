/**
 * Accessibility utility functions and constants
 */

/**
 * Generates a unique ID for form field associations
 * @param prefix - Prefix for the ID
 * @returns Unique ID string
 */
export const generateId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Combines multiple aria-describedby IDs
 * @param ids - Array of IDs to combine
 * @returns Space-separated string of IDs or undefined if empty
 */
export const combineAriaDescribedBy = (...ids: (string | undefined)[]): string | undefined => {
  const validIds = ids.filter(Boolean)
  return validIds.length > 0 ? validIds.join(' ') : undefined
}

/**
 * Gets appropriate ARIA attributes for different UI states
 * @param state - Current state of the component
 * @returns Object with appropriate ARIA attributes
 */
export const getAriaStateAttributes = (state: {
  isLoading?: boolean
  isDisabled?: boolean
  isExpanded?: boolean
  isSelected?: boolean
  isPressed?: boolean
  hasError?: boolean
  isRequired?: boolean
}) => {
  const attrs: Record<string, unknown> = {}

  if (state.isLoading !== undefined) attrs['aria-busy'] = state.isLoading
  if (state.isDisabled !== undefined) attrs['aria-disabled'] = state.isDisabled
  if (state.isExpanded !== undefined) attrs['aria-expanded'] = state.isExpanded
  if (state.isSelected !== undefined) attrs['aria-selected'] = state.isSelected
  if (state.isPressed !== undefined) attrs['aria-pressed'] = state.isPressed
  if (state.hasError !== undefined) attrs['aria-invalid'] = state.hasError
  if (state.isRequired !== undefined) attrs['aria-required'] = state.isRequired

  return attrs
}

/**
 * Screen reader only text for common UI patterns
 */
export const srOnlyText = {
  loading: 'Loading...',
  newWindow: '(opens in new window)',
  required: '(required)',
  error: 'Error: ',
  success: 'Success: ',
  warning: 'Warning: ',
  info: 'Information: ',
  close: 'Close',
  menu: 'Menu',
  navigation: 'Navigation',
  search: 'Search',
  sortAscending: 'Sort ascending',
  sortDescending: 'Sort descending',
  page: (current: number, total: number) => `Page ${current} of ${total}`,
  results: (count: number) => `${count} result${count === 1 ? '' : 's'} found`,
}

/**
 * Common ARIA labels for interactive elements
 */
export const ariaLabels = {
  closeModal: 'Close modal',
  closeNotification: 'Close notification',
  toggleMenu: 'Toggle navigation menu',
  toggleTheme: 'Toggle dark mode',
  nextPage: 'Go to next page',
  previousPage: 'Go to previous page',
  firstPage: 'Go to first page',
  lastPage: 'Go to last page',
  expandAll: 'Expand all sections',
  collapseAll: 'Collapse all sections',
  selectAll: 'Select all items',
  deselectAll: 'Deselect all items',
  refresh: 'Refresh content',
  delete: 'Delete item',
  edit: 'Edit item',
  save: 'Save changes',
  cancel: 'Cancel',
  submit: 'Submit form',
  upload: 'Upload file',
  download: 'Download file',
  filter: 'Filter options',
  sort: 'Sort options',
  moreOptions: 'More options',
}

/**
 * Announces a message to screen readers using a temporary live region
 * @param message - Message to announce
 * @param politeness - ARIA live region politeness setting
 */
export const announceToScreenReader = (
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', politeness)
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove the announcement after it's been read
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Traps focus within a container element
 * @param container - Container element to trap focus within
 * @returns Cleanup function to remove event listeners
 */
export const trapFocus = (container: HTMLElement): (() => void) => {
  const focusableElements = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  
  const firstFocusable = focusableElements[0] as HTMLElement
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable?.focus()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable?.focus()
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown)
  firstFocusable?.focus()

  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Checks if user prefers reduced motion
 * @returns true if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Gets appropriate transition duration based on user preferences
 * @param duration - Default duration in milliseconds
 * @returns Adjusted duration based on user preferences
 */
export const getTransitionDuration = (duration: number): number => {
  return prefersReducedMotion() ? 0 : duration
}