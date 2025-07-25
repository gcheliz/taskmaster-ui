import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { WebVitals } from '../WebVitals'
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals'

// Mock web-vitals
vi.mock('web-vitals', () => ({
  onCLS: vi.fn(),
  onFID: vi.fn(),
  onLCP: vi.fn(),
  onFCP: vi.fn(),
  onTTFB: vi.fn()
}))

describe('WebVitals', () => {
  const mockOnReport = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnReport.mockClear()
  })

  describe('Component Initialization', () => {
    it('initializes web vitals monitoring on mount', () => {
      render(<WebVitals onReport={mockOnReport} />)
      
      expect(onCLS).toHaveBeenCalled()
      expect(onFID).toHaveBeenCalled()
      expect(onLCP).toHaveBeenCalled()
      expect(onFCP).toHaveBeenCalled()
      expect(onTTFB).toHaveBeenCalled()
    })

    it('renders without visible content by default', () => {
      const { container } = render(<WebVitals onReport={mockOnReport} />)
      
      expect(container.firstChild).toBeEmptyDOMElement()
    })
  })

  describe('Metrics Collection', () => {
    it('reports LCP metric', async () => {
      render(<WebVitals onReport={mockOnReport} />)
      
      // Simulate LCP callback
      const lcpCallback = vi.mocked(onLCP).mock.calls[0][0]
      lcpCallback({
        name: 'LCP',
        value: 2500,
        rating: 'good',
        delta: 2500,
        id: 'v3-1234',
        entries: []
      })
      
      await waitFor(() => {
        expect(mockOnReport).toHaveBeenCalledWith({
          name: 'LCP',
          value: 2500,
          rating: 'good'
        })
      })
    })

    it('reports FID metric', async () => {
      render(<WebVitals onReport={mockOnReport} />)
      
      const fidCallback = vi.mocked(onFID).mock.calls[0][0]
      fidCallback({
        name: 'FID',
        value: 50,
        rating: 'good',
        delta: 50,
        id: 'v3-1235',
        entries: []
      })
      
      await waitFor(() => {
        expect(mockOnReport).toHaveBeenCalledWith({
          name: 'FID',
          value: 50,
          rating: 'good'
        })
      })
    })

    it('reports CLS metric', async () => {
      render(<WebVitals onReport={mockOnReport} />)
      
      const clsCallback = vi.mocked(onCLS).mock.calls[0][0]
      clsCallback({
        name: 'CLS',
        value: 0.05,
        rating: 'good',
        delta: 0.05,
        id: 'v3-1236',
        entries: []
      })
      
      await waitFor(() => {
        expect(mockOnReport).toHaveBeenCalledWith({
          name: 'CLS',
          value: 0.05,
          rating: 'good'
        })
      })
    })

    it('reports all metrics when collected', async () => {
      render(<WebVitals onReport={mockOnReport} />)
      
      // Simulate all metrics
      const metrics = [
        { name: 'LCP', value: 2500, rating: 'good' },
        { name: 'FID', value: 100, rating: 'good' },
        { name: 'CLS', value: 0.1, rating: 'good' },
        { name: 'FCP', value: 1800, rating: 'good' },
        { name: 'TTFB', value: 800, rating: 'good' }
      ]
      
      // Trigger all callbacks
      ;[onLCP, onFID, onCLS, onFCP, onTTFB].forEach((metricFn, index) => {
        const callback = vi.mocked(metricFn).mock.calls[0][0]
        callback({
          ...metrics[index],
          delta: metrics[index].value,
          id: `v3-${1234 + index}`,
          entries: []
        })
      })
      
      await waitFor(() => {
        expect(mockOnReport).toHaveBeenCalledTimes(5)
        metrics.forEach(metric => {
          expect(mockOnReport).toHaveBeenCalledWith(metric)
        })
      })
    })
  })

  describe('Display Mode', () => {
    it('shows metrics when showMetrics is true', () => {
      render(<WebVitals onReport={mockOnReport} showMetrics />)
      
      expect(screen.getByText('Web Vitals')).toBeInTheDocument()
      expect(screen.getByText('Collecting metrics...')).toBeInTheDocument()
    })

    it('displays collected metrics', async () => {
      render(<WebVitals onReport={mockOnReport} showMetrics />)
      
      // Simulate LCP metric
      const lcpCallback = vi.mocked(onLCP).mock.calls[0][0]
      lcpCallback({
        name: 'LCP',
        value: 2500,
        rating: 'good',
        delta: 2500,
        id: 'v3-1234',
        entries: []
      })
      
      await waitFor(() => {
        expect(screen.getByText('LCP')).toBeInTheDocument()
        expect(screen.getByText('2.5s')).toBeInTheDocument()
        expect(screen.getByText('Good')).toBeInTheDocument()
      })
    })

    it('shows inline metrics mode', () => {
      render(<WebVitals onReport={mockOnReport} showMetrics mode="inline" />)
      
      const container = screen.getByTestId('web-vitals-inline')
      expect(container).toHaveClass('web-vitals-inline')
    })
  })

  describe('Analytics Integration', () => {
    it('sends metrics to analytics when enabled', async () => {
      const mockAnalytics = {
        track: vi.fn()
      }
      
      render(
        <WebVitals 
          onReport={mockOnReport} 
          analytics={mockAnalytics}
          sendToAnalytics
        />
      )
      
      const lcpCallback = vi.mocked(onLCP).mock.calls[0][0]
      lcpCallback({
        name: 'LCP',
        value: 2500,
        rating: 'good',
        delta: 2500,
        id: 'v3-1234',
        entries: []
      })
      
      await waitFor(() => {
        expect(mockAnalytics.track).toHaveBeenCalledWith('Web Vitals', {
          metric_name: 'LCP',
          metric_value: 2500,
          metric_rating: 'good'
        })
      })
    })

    it('batches metrics before sending', async () => {
      const mockAnalytics = {
        track: vi.fn()
      }
      
      render(
        <WebVitals 
          onReport={mockOnReport} 
          analytics={mockAnalytics}
          sendToAnalytics
          batchMetrics
        />
      )
      
      // Send multiple metrics quickly
      ;['LCP', 'FID', 'CLS'].forEach((metricName, index) => {
        const callback = vi.mocked([onLCP, onFID, onCLS][index]).mock.calls[0][0]
        callback({
          name: metricName,
          value: 100 * (index + 1),
          rating: 'good',
          delta: 100 * (index + 1),
          id: `v3-${1234 + index}`,
          entries: []
        })
      })
      
      // Should batch the metrics
      await waitFor(() => {
        expect(mockAnalytics.track).toHaveBeenCalledTimes(1)
        expect(mockAnalytics.track).toHaveBeenCalledWith('Web Vitals Batch', {
          metrics: expect.arrayContaining([
            expect.objectContaining({ metric_name: 'LCP' }),
            expect.objectContaining({ metric_name: 'FID' }),
            expect.objectContaining({ metric_name: 'CLS' })
          ])
        })
      })
    })
  })

  describe('Threshold Configuration', () => {
    it('uses custom thresholds for ratings', async () => {
      const customThresholds = {
        LCP: { good: 2000, needsImprovement: 3000 },
        FID: { good: 50, needsImprovement: 100 },
        CLS: { good: 0.05, needsImprovement: 0.1 }
      }
      
      render(
        <WebVitals 
          onReport={mockOnReport} 
          thresholds={customThresholds}
          showMetrics
        />
      )
      
      // Report LCP that would be "needs improvement" with custom threshold
      const lcpCallback = vi.mocked(onLCP).mock.calls[0][0]
      lcpCallback({
        name: 'LCP',
        value: 2200, // Between 2000 and 3000
        rating: 'needs-improvement',
        delta: 2200,
        id: 'v3-1234',
        entries: []
      })
      
      await waitFor(() => {
        expect(screen.getByText('Needs Improvement')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles errors in metric collection gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<WebVitals onReport={mockOnReport} />)
      
      // Simulate error in callback
      const lcpCallback = vi.mocked(onLCP).mock.calls[0][0]
      expect(() => {
        lcpCallback(null as any) // Invalid metric
      }).not.toThrow()
      
      expect(consoleError).toHaveBeenCalled()
      consoleError.mockRestore()
    })

    it('continues collecting other metrics after error', async () => {
      render(<WebVitals onReport={mockOnReport} />)
      
      // First metric fails
      const lcpCallback = vi.mocked(onLCP).mock.calls[0][0]
      try {
        lcpCallback(null as any)
      } catch {}
      
      // Second metric succeeds
      const fidCallback = vi.mocked(onFID).mock.calls[0][0]
      fidCallback({
        name: 'FID',
        value: 50,
        rating: 'good',
        delta: 50,
        id: 'v3-1235',
        entries: []
      })
      
      await waitFor(() => {
        expect(mockOnReport).toHaveBeenCalledWith({
          name: 'FID',
          value: 50,
          rating: 'good'
        })
      })
    })
  })

  describe('Performance Impact', () => {
    it('uses passive event listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      
      render(<WebVitals onReport={mockOnReport} />)
      
      // Check if passive listeners are used
      const calls = addEventListenerSpy.mock.calls
      const passiveCalls = calls.filter(call => 
        call[2] && typeof call[2] === 'object' && call[2].passive === true
      )
      
      expect(passiveCalls.length).toBeGreaterThan(0)
      
      addEventListenerSpy.mockRestore()
    })

    it('cleans up listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      const { unmount } = render(<WebVitals onReport={mockOnReport} />)
      
      unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalled()
      
      removeEventListenerSpy.mockRestore()
    })
  })
})