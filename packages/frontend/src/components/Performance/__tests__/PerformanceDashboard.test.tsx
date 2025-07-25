import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PerformanceDashboard } from '../PerformanceDashboard'
import userEvent from '@testing-library/user-event'

// Mock the chart library
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
}))

// Mock performance observer
const mockWebVitals = {
  LCP: { value: 2500, rating: 'good' },
  FID: { value: 100, rating: 'good' },
  CLS: { value: 0.1, rating: 'good' },
  FCP: { value: 1800, rating: 'good' },
  TTFB: { value: 800, rating: 'good' }
}

describe('PerformanceDashboard', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Mock performance API
    Object.defineProperty(window, 'performance', {
      writable: true,
      value: {
        memory: {
          usedJSHeapSize: 50 * 1024 * 1024,
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 2048 * 1024 * 1024
        },
        getEntriesByType: vi.fn(() => [
          { name: 'https://api.example.com/tasks', duration: 250 },
          { name: 'https://api.example.com/users', duration: 150 }
        ])
      }
    })
  })

  describe('Dashboard Rendering', () => {
    it('renders all performance sections', () => {
      render(<PerformanceDashboard />)
      
      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Web Vitals')).toBeInTheDocument()
      expect(screen.getByText('Render Performance')).toBeInTheDocument()
      expect(screen.getByText('Memory Usage')).toBeInTheDocument()
      expect(screen.getByText('Network Performance')).toBeInTheDocument()
    })

    it('displays loading state initially', () => {
      render(<PerformanceDashboard />)
      
      expect(screen.getByText('Collecting metrics...')).toBeInTheDocument()
    })

    it('shows metrics after loading', async () => {
      render(<PerformanceDashboard webVitals={mockWebVitals} />)
      
      await waitFor(() => {
        expect(screen.getByText('2.50s')).toBeInTheDocument() // LCP
        expect(screen.getByText('100ms')).toBeInTheDocument() // FID
        expect(screen.getByText('0.100')).toBeInTheDocument() // CLS
      })
    })
  })

  describe('Web Vitals Display', () => {
    it('shows correct rating colors', () => {
      const vitalsWithRatings = {
        LCP: { value: 2500, rating: 'good' },
        FID: { value: 200, rating: 'needs-improvement' },
        CLS: { value: 0.3, rating: 'poor' }
      }
      
      render(<PerformanceDashboard webVitals={vitalsWithRatings} />)
      
      const lcpCard = screen.getByText('Largest Contentful Paint').closest('.metric-card')
      const fidCard = screen.getByText('First Input Delay').closest('.metric-card')
      const clsCard = screen.getByText('Cumulative Layout Shift').closest('.metric-card')
      
      expect(lcpCard).toHaveClass('border-green-200')
      expect(fidCard).toHaveClass('border-yellow-200')
      expect(clsCard).toHaveClass('border-red-200')
    })

    it('displays metric descriptions', () => {
      render(<PerformanceDashboard webVitals={mockWebVitals} />)
      
      expect(screen.getByText(/Loading performance/)).toBeInTheDocument()
      expect(screen.getByText(/Interactivity/)).toBeInTheDocument()
      expect(screen.getByText(/Visual stability/)).toBeInTheDocument()
    })
  })

  describe('Render Performance', () => {
    it('shows component render times', async () => {
      const renderMetrics = [
        { component: 'TaskBoard', renderTime: 45, count: 10 },
        { component: 'TaskCard', renderTime: 12, count: 50 }
      ]
      
      render(<PerformanceDashboard renderMetrics={renderMetrics} />)
      
      await waitFor(() => {
        expect(screen.getByText('TaskBoard')).toBeInTheDocument()
        expect(screen.getByText('45ms')).toBeInTheDocument()
        expect(screen.getByText('10 renders')).toBeInTheDocument()
      })
    })

    it('sorts components by render time', () => {
      const renderMetrics = [
        { component: 'FastComponent', renderTime: 5, count: 100 },
        { component: 'SlowComponent', renderTime: 150, count: 5 }
      ]
      
      render(<PerformanceDashboard renderMetrics={renderMetrics} />)
      
      const components = screen.getAllByTestId('render-metric')
      expect(components[0]).toHaveTextContent('SlowComponent')
      expect(components[1]).toHaveTextContent('FastComponent')
    })
  })

  describe('Memory Usage', () => {
    it('displays memory metrics', () => {
      render(<PerformanceDashboard />)
      
      expect(screen.getByText('Heap Used')).toBeInTheDocument()
      expect(screen.getByText('50 MB')).toBeInTheDocument()
      expect(screen.getByText('Heap Total')).toBeInTheDocument()
      expect(screen.getByText('100 MB')).toBeInTheDocument()
    })

    it('shows memory usage percentage', () => {
      render(<PerformanceDashboard />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '50')
      expect(progressBar).toHaveAttribute('aria-label', 'Memory usage: 50%')
    })
  })

  describe('Network Performance', () => {
    it('displays API request metrics', async () => {
      render(<PerformanceDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Average Response Time')).toBeInTheDocument()
        expect(screen.getByText('200ms')).toBeInTheDocument() // Average of 250 and 150
        expect(screen.getByText('Total Requests')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
      })
    })

    it('shows individual request details', async () => {
      render(<PerformanceDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('/tasks')).toBeInTheDocument()
        expect(screen.getByText('250ms')).toBeInTheDocument()
        expect(screen.getByText('/users')).toBeInTheDocument()
        expect(screen.getByText('150ms')).toBeInTheDocument()
      })
    })
  })

  describe('Interactive Features', () => {
    it('allows time range selection', async () => {
      const user = userEvent.setup()
      render(<PerformanceDashboard />)
      
      const timeRangeSelect = screen.getByRole('combobox', { name: /time range/i })
      await user.selectOptions(timeRangeSelect, '1h')
      
      expect(timeRangeSelect).toHaveValue('1h')
    })

    it('refreshes metrics on demand', async () => {
      const user = userEvent.setup()
      const onRefresh = vi.fn()
      render(<PerformanceDashboard onRefresh={onRefresh} />)
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      await user.click(refreshButton)
      
      expect(onRefresh).toHaveBeenCalled()
    })

    it('exports performance report', async () => {
      const user = userEvent.setup()
      const onExport = vi.fn()
      render(<PerformanceDashboard onExport={onExport} />)
      
      const exportButton = screen.getByRole('button', { name: /export report/i })
      await user.click(exportButton)
      
      expect(onExport).toHaveBeenCalledWith(expect.objectContaining({
        webVitals: expect.any(Object),
        timestamp: expect.any(String)
      }))
    })
  })

  describe('Charts and Visualizations', () => {
    it('renders performance trend chart', () => {
      const trendData = [
        { time: '10:00', lcp: 2500, fid: 100, cls: 0.1 },
        { time: '10:05', lcp: 2300, fid: 90, cls: 0.08 }
      ]
      
      render(<PerformanceDashboard trendData={trendData} />)
      
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.getAllByTestId('line')).toHaveLength(3) // LCP, FID, CLS
    })

    it('renders memory usage chart', () => {
      const memoryData = [
        { time: '10:00', used: 50, total: 100 },
        { time: '10:05', used: 60, total: 100 }
      ]
      
      render(<PerformanceDashboard memoryData={memoryData} />)
      
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<PerformanceDashboard webVitals={mockWebVitals} />)
      
      expect(screen.getByRole('region', { name: /performance metrics/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /performance dashboard/i })).toBeInTheDocument()
    })

    it('announces metric updates', async () => {
      const { rerender } = render(<PerformanceDashboard webVitals={mockWebVitals} />)
      
      const updatedVitals = {
        ...mockWebVitals,
        LCP: { value: 2000, rating: 'good' }
      }
      
      rerender(<PerformanceDashboard webVitals={updatedVitals} />)
      
      await waitFor(() => {
        const liveRegion = screen.getByRole('status')
        expect(liveRegion).toHaveTextContent(/performance metrics updated/i)
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<PerformanceDashboard />)
      
      // Tab through interactive elements
      await user.tab()
      expect(screen.getByRole('combobox')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('button', { name: /refresh/i })).toHaveFocus()
    })
  })

  describe('Error Handling', () => {
    it('handles missing performance API gracefully', () => {
      // Remove performance API
      Object.defineProperty(window, 'performance', {
        writable: true,
        value: undefined
      })
      
      render(<PerformanceDashboard />)
      
      expect(screen.getByText('Performance API not available')).toBeInTheDocument()
    })

    it('shows error state when metrics fail to load', async () => {
      const onError = vi.fn()
      render(<PerformanceDashboard onError={onError} />)
      
      // Simulate error
      onError(new Error('Failed to load metrics'))
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load performance metrics')).toBeInTheDocument()
      })
    })
  })
})