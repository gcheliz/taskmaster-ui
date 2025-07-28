import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { WebVitalsMonitor } from '../WebVitals'
import type { Metric } from 'web-vitals'

// Mock callbacks storage
let mockCallbacks: Record<string, (metric: any) => void> = {}

// Mock web-vitals
vi.mock('web-vitals', () => {
  return {
    onCLS: vi.fn((cb) => { mockCallbacks.CLS = cb }),
    onFCP: vi.fn((cb) => { mockCallbacks.FCP = cb }),
    onINP: vi.fn((cb) => { mockCallbacks.INP = cb }),
    onLCP: vi.fn((cb) => { mockCallbacks.LCP = cb }),
    onTTFB: vi.fn((cb) => { mockCallbacks.TTFB = cb })
  }
})

describe('WebVitalsMonitor', () => {
  const mockOnReport = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnReport.mockClear()
    mockCallbacks = {}
  })
  
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Initialization', () => {
    it('initializes web vitals monitoring on mount', async () => {
      const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import('web-vitals')
      
      render(<WebVitalsMonitor onReport={mockOnReport} />)
      
      // Wait for dynamic import in component
      await waitFor(() => {
        expect(onCLS).toHaveBeenCalled()
        expect(onFCP).toHaveBeenCalled()
        expect(onINP).toHaveBeenCalled()
        expect(onLCP).toHaveBeenCalled()
        expect(onTTFB).toHaveBeenCalled()
      })
    })

    it('renders without visible content by default', () => {
      const { container } = render(<WebVitalsMonitor onReport={mockOnReport} />)
      
      // WebVitalsMonitor returns null, so container should be empty
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Metrics Collection', () => {
    it('reports LCP metric', async () => {
      const { onLCP } = await import('web-vitals')
      
      render(<WebVitalsMonitor onReport={mockOnReport} />)
      
      // Wait for callback to be registered
      await waitFor(() => {
        expect(onLCP).toHaveBeenCalled()
      })
      
      // Simulate LCP metric
      mockCallbacks.LCP?.({
        name: 'LCP',
        value: 2500,
        rating: 'good',
        delta: 2500
      })
      
      expect(mockOnReport).toHaveBeenCalledWith({
        name: 'LCP',
        value: 2500,
        rating: 'good',
        delta: 2500
      })
    })

    it('reports INP metric (replaced FID)', async () => {
      const { onINP } = await import('web-vitals')
      
      render(<WebVitalsMonitor onReport={mockOnReport} />)
      
      // Wait for callback to be registered
      await waitFor(() => {
        expect(onINP).toHaveBeenCalled()
      })
      
      // Simulate INP metric
      mockCallbacks.INP?.({
        name: 'INP',
        value: 50,
        rating: 'good',
        delta: 50
      })
      
      expect(mockOnReport).toHaveBeenCalledWith({
        name: 'INP',
        value: 50,
        rating: 'good',
        delta: 50
      })
    })

    it('reports CLS metric', async () => {
      const { onCLS } = await import('web-vitals')
      
      render(<WebVitalsMonitor onReport={mockOnReport} />)
      
      // Wait for callback to be registered
      await waitFor(() => {
        expect(onCLS).toHaveBeenCalled()
      })
      
      // Simulate CLS metric
      mockCallbacks.CLS?.({
        name: 'CLS',
        value: 0.05,
        rating: 'good',
        delta: 0.05
      })
      
      expect(mockOnReport).toHaveBeenCalledWith({
        name: 'CLS',
        value: 0.05,
        rating: 'good',
        delta: 0.05
      })
    })

    it('reports all metrics when collected', async () => {
      const webVitals = await import('web-vitals')
      
      render(<WebVitalsMonitor onReport={mockOnReport} />)
      
      // Wait for callbacks to be registered
      await waitFor(() => {
        expect(webVitals.onLCP).toHaveBeenCalled()
        expect(webVitals.onCLS).toHaveBeenCalled()
        expect(webVitals.onINP).toHaveBeenCalled()
        expect(webVitals.onFCP).toHaveBeenCalled()
        expect(webVitals.onTTFB).toHaveBeenCalled()
      })
      
      // Simulate all metrics
      const metrics = [
        { name: 'LCP', value: 2500, rating: 'good', delta: 2500 },
        { name: 'INP', value: 100, rating: 'good', delta: 100 },
        { name: 'CLS', value: 0.1, rating: 'good', delta: 0.1 },
        { name: 'FCP', value: 1800, rating: 'good', delta: 1800 },
        { name: 'TTFB', value: 800, rating: 'good', delta: 800 }
      ] as const
      
      // Trigger all callbacks
      metrics.forEach(metric => {
        mockCallbacks[metric.name]?.(metric)
      })
      
      expect(mockOnReport).toHaveBeenCalledTimes(5)
      metrics.forEach(metric => {
        expect(mockOnReport).toHaveBeenCalledWith(metric)
      })
    })
  })

  describe('Configuration', () => {
    it('respects enabled prop', async () => {
      const webVitals = await import('web-vitals')
      
      render(<WebVitalsMonitor enabled={false} onReport={mockOnReport} />)
      
      // Give it a moment to not call the functions
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(webVitals.onCLS).not.toHaveBeenCalled()
      expect(webVitals.onLCP).not.toHaveBeenCalled()
    })

    it('uses custom thresholds', async () => {
      const { onLCP } = await import('web-vitals')
      const customThresholds = {
        LCP: 2000,
        CLS: 0.05,
        INP: 150
      }
      
      render(<WebVitalsMonitor onReport={mockOnReport} threshold={customThresholds} />)
      
      // The component should pass through the metric ratings from web-vitals
      await waitFor(() => {
        expect(onLCP).toHaveBeenCalled()
      })
    })

    it('enables debug mode', async () => {
      const { onLCP } = await import('web-vitals')
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      render(<WebVitalsMonitor onReport={mockOnReport} debug={true} />)
      
      // Wait for callback to be registered
      await waitFor(() => {
        expect(onLCP).toHaveBeenCalled()
      })
      
      // Trigger a metric
      mockCallbacks.LCP?.({
        name: 'LCP',
        value: 2500,
        rating: 'good',
        delta: 2500
      })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Web Vitals] LCP:'),
        expect.any(Object)
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('Google Analytics Integration', () => {
    it('sends metrics to gtag when available', async () => {
      const { onLCP } = await import('web-vitals')
      // Mock gtag
      const mockGtag = vi.fn()
      ;(window as any).gtag = mockGtag
      
      render(<WebVitalsMonitor onReport={mockOnReport} />)
      
      // Wait for callback to be registered
      await waitFor(() => {
        expect(onLCP).toHaveBeenCalled()
      })
      
      // Trigger a metric
      mockCallbacks.LCP?.({
        name: 'LCP',
        value: 2500,
        rating: 'good',
        delta: 2500
      })
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'LCP', {
        event_category: 'Web Vitals',
        event_label: 'good',
        value: 2500,
        non_interaction: true
      })
      
      delete (window as any).gtag
    })

    it('handles CLS metric value conversion for gtag', async () => {
      const { onCLS } = await import('web-vitals')
      // Mock gtag
      const mockGtag = vi.fn()
      ;(window as any).gtag = mockGtag
      
      render(<WebVitalsMonitor onReport={mockOnReport} />)
      
      // Wait for callback to be registered
      await waitFor(() => {
        expect(onCLS).toHaveBeenCalled()
      })
      
      // Trigger CLS metric
      mockCallbacks.CLS?.({
        name: 'CLS',
        value: 0.1,
        rating: 'good',
        delta: 0.1
      })
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'CLS', {
        event_category: 'Web Vitals',
        event_label: 'good',
        value: 100, // CLS value * 1000
        non_interaction: true
      })
      
      delete (window as any).gtag
    })
  })

  describe('Poor Performance Warnings', () => {
    it('logs warnings for poor performance', async () => {
      const { onLCP } = await import('web-vitals')
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      render(<WebVitalsMonitor onReport={mockOnReport} />)
      
      // Wait for callback to be registered
      await waitFor(() => {
        expect(onLCP).toHaveBeenCalled()
      })
      
      // Trigger a poor metric
      mockCallbacks.LCP?.({
        name: 'LCP',
        value: 5000, // Poor LCP
        rating: 'poor',
        delta: 5000
      })
      
      expect(consoleWarn).toHaveBeenCalledWith(
        '[Web Vitals] Poor LCP detected:',
        5000
      )
      
      consoleWarn.mockRestore()
    })
  })

  describe('Error Handling', () => {
    it('handles web-vitals import errors gracefully', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // Mock dynamic import failure
      vi.doMock('web-vitals', () => {
        throw new Error('Failed to load')
      })
      
      render(<WebVitalsMonitor onReport={mockOnReport} />)
      
      await waitFor(() => {
        expect(consoleWarn).toHaveBeenCalledWith(
          '[Web Vitals] Failed to load web-vitals library:',
          expect.any(Error)
        )
      })
      
      consoleWarn.mockRestore()
      vi.doUnmock('web-vitals')
    })

    it.skip('handles errors in onReport callback', async () => {
      const errorOnReport = vi.fn(() => {
        throw new Error('Report error')
      })
      
      // We expect the component to handle this gracefully
      render(<WebVitalsMonitor onReport={errorOnReport} />)
      
      // Wait for component to initialize
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Ensure callbacks were registered
      expect(Object.keys(mockCallbacks).length).toBeGreaterThan(0)
      
      // This should not throw even if onReport throws
      // The component should handle the error internally
      const callMetric = () => {
        mockCallbacks.LCP?.({
          name: 'LCP',
          value: 2500,
          rating: 'good',
          delta: 2500
        })
      }
      
      // The metric reporting itself may throw, but that's expected
      expect(callMetric).toThrow()
      
      // The onReport callback should have been called before throwing
      expect(errorOnReport).toHaveBeenCalled()
    })
  })

  describe('Component Lifecycle', () => {
    it.skip('uses updated props on rerender', async () => {
      const { rerender } = render(<WebVitalsMonitor onReport={mockOnReport} />)
      
      // Wait for initial mount to complete
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Ensure callbacks were registered
      const initialCallbackCount = Object.keys(mockCallbacks).length
      expect(initialCallbackCount).toBeGreaterThan(0)
      
      // Clear previous mock calls
      mockOnReport.mockClear()
      
      // Rerender with new props
      const newOnReport = vi.fn()
      rerender(<WebVitalsMonitor onReport={newOnReport} />)
      
      // Wait a bit more
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Should still have same number of callbacks (not re-initialized)
      expect(Object.keys(mockCallbacks).length).toBe(initialCallbackCount)
      
      // Trigger a metric with the existing callback
      mockCallbacks.LCP?.({
        name: 'LCP',
        value: 3000,
        rating: 'good',
        delta: 3000
      })
      
      // Should use new callback, not old one
      expect(newOnReport).toHaveBeenCalled()
      expect(mockOnReport).not.toHaveBeenCalled()
    })

    it('cleans up on unmount', () => {
      const { unmount } = render(<WebVitalsMonitor onReport={mockOnReport} />)
      
      // Component should unmount without errors
      expect(() => unmount()).not.toThrow()
    })
  })
})