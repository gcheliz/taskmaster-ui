import '@testing-library/jest-dom'
import { toHaveNoViolations } from 'jest-axe'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return []
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Add custom matchers for accessibility testing
expect.extend({
  toHaveAccessibleName(received, expected) {
    const element = received as HTMLElement
    const name = element.getAttribute('aria-label') || 
                 element.getAttribute('aria-labelledby') ||
                 element.textContent?.trim()
    
    const pass = name === expected
    
    return {
      pass,
      message: () => 
        pass
          ? `expected element not to have accessible name "${expected}"`
          : `expected element to have accessible name "${expected}", but got "${name}"`,
    }
  },
  
  toHaveFocus(received) {
    const element = received as HTMLElement
    const pass = document.activeElement === element
    
    return {
      pass,
      message: () =>
        pass
          ? `expected element not to have focus`
          : `expected element to have focus`,
    }
  },
})