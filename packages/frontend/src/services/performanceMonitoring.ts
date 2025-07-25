import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals'
import type { Metric } from 'web-vitals'
import * as Sentry from '@sentry/react'

// Performance thresholds based on Web Vitals recommendations
const PERFORMANCE_THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
  INP: { good: 200, needsImprovement: 500 }, // Interaction to Next Paint (ms)
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint (ms)
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint (ms)
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte (ms)
}

type MetricRating = 'good' | 'needs-improvement' | 'poor'

function getRating(metricName: string, value: number): MetricRating {
  const thresholds = PERFORMANCE_THRESHOLDS[metricName as keyof typeof PERFORMANCE_THRESHOLDS]
  if (!thresholds) return 'poor'
  
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.needsImprovement) return 'needs-improvement'
  return 'poor'
}

// Custom performance mark/measure utilities
export const performance = {
  mark(name: string) {
    if (window.performance && window.performance.mark) {
      window.performance.mark(name)
    }
  },
  
  measure(name: string, startMark: string, endMark?: string) {
    if (window.performance && window.performance.measure) {
      try {
        if (endMark) {
          window.performance.measure(name, startMark, endMark)
        } else {
          window.performance.measure(name, startMark)
        }
        
        // Get the measurement and report it
        const entries = window.performance.getEntriesByName(name, 'measure')
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          this.reportCustomMetric(name, lastEntry.duration)
        }
      } catch (error) {
        console.error('Performance measurement error:', error)
      }
    }
  },
  
  reportCustomMetric(name: string, value: number) {
    // Report to Sentry
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction()
    if (transaction) {
      transaction.setMeasurement(name, value, 'millisecond')
    }
    
    // Log in development
    if (import.meta.env.DEV) {
      console.log(`Performance metric - ${name}: ${value.toFixed(2)}ms`)
    }
    
    // Send to analytics if configured
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name,
        value: Math.round(value),
        event_category: 'Performance',
      })
    }
  },
}

// Report handler for Web Vitals
const reportWebVital = (metric: Metric) => {
  const rating = getRating(metric.name, metric.value)
  
  // Log in development
  if (import.meta.env.DEV) {
    console.log(`Web Vital - ${metric.name}:`, {
      value: metric.value,
      rating,
      delta: metric.delta,
    })
  }
  
  // Report to Sentry
  const transaction = Sentry.getCurrentHub().getScope()?.getTransaction()
  if (transaction) {
    transaction.setMeasurement(
      metric.name,
      metric.value,
      metric.name === 'CLS' ? '' : 'millisecond'
    )
    transaction.setTag(`webvital.${metric.name}.rating`, rating)
  }
  
  // Send to analytics if configured
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.delta),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: rating,
      event_category: 'Web Vitals',
      non_interaction: true,
    })
  }
}

// Initialize Web Vitals monitoring
export function initWebVitals() {
  onCLS(reportWebVital)
  onINP(reportWebVital)
  onFCP(reportWebVital)
  onLCP(reportWebVital)
  onTTFB(reportWebVital)
}

// Resource timing monitoring
export function monitorResourceTiming() {
  if (!window.PerformanceObserver) return
  
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming
          
          // Report slow resources
          if (resourceEntry.duration > 1000) {
            const transaction = Sentry.getCurrentHub().getScope()?.getTransaction()
            if (transaction) {
              transaction.setData('slowResource', {
                name: resourceEntry.name,
                duration: resourceEntry.duration,
                type: resourceEntry.initiatorType,
                size: resourceEntry.transferSize,
              })
            }
            
            if (import.meta.env.DEV) {
              console.warn('Slow resource detected:', {
                name: resourceEntry.name,
                duration: `${resourceEntry.duration.toFixed(2)}ms`,
                type: resourceEntry.initiatorType,
              })
            }
          }
        }
      }
    })
    
    observer.observe({ entryTypes: ['resource'] })
  } catch (error) {
    console.error('Failed to set up resource timing observer:', error)
  }
}

// Long task monitoring
export function monitorLongTasks() {
  if (!window.PerformanceObserver || !('PerformanceLongTaskTiming' in window)) return
  
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          const transaction = Sentry.getCurrentHub().getScope()?.getTransaction()
          if (transaction) {
            transaction.setData('longTask', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            })
          }
          
          if (import.meta.env.DEV) {
            console.warn('Long task detected:', {
              duration: `${entry.duration.toFixed(2)}ms`,
              startTime: entry.startTime,
            })
          }
        }
      }
    })
    
    observer.observe({ entryTypes: ['longtask'] })
  } catch (error) {
    console.error('Failed to set up long task observer:', error)
  }
}

// Custom metrics for specific features
export const metrics = {
  // Page load metrics
  pageLoad: {
    start() {
      performance.mark('page-load-start')
    },
    end() {
      performance.mark('page-load-end')
      performance.measure('page-load-time', 'page-load-start', 'page-load-end')
    },
  },
  
  // API call metrics
  apiCall: {
    start(endpoint: string) {
      performance.mark(`api-call-${endpoint}-start`)
    },
    end(endpoint: string) {
      performance.mark(`api-call-${endpoint}-end`)
      performance.measure(
        `api-call-${endpoint}`,
        `api-call-${endpoint}-start`,
        `api-call-${endpoint}-end`
      )
    },
  },
  
  // Component render metrics
  componentRender: {
    start(componentName: string) {
      performance.mark(`component-${componentName}-render-start`)
    },
    end(componentName: string) {
      performance.mark(`component-${componentName}-render-end`)
      performance.measure(
        `component-${componentName}-render`,
        `component-${componentName}-render-start`,
        `component-${componentName}-render-end`
      )
    },
  },
  
  // Custom interaction metrics
  interaction: {
    start(action: string) {
      performance.mark(`interaction-${action}-start`)
    },
    end(action: string) {
      performance.mark(`interaction-${action}-end`)
      performance.measure(
        `interaction-${action}`,
        `interaction-${action}-start`,
        `interaction-${action}-end`
      )
    },
  },
}

// React component performance profiler
export function ProfilerOnRender(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
  interactions: Set<any>
) {
  // Only report significant renders
  if (actualDuration > 16) { // More than one frame (16ms)
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction()
    if (transaction) {
      transaction.setMeasurement(
        `component.${id}.${phase}`,
        actualDuration,
        'millisecond'
      )
    }
    
    if (import.meta.env.DEV) {
      console.log(`Component ${id} ${phase}:`, {
        actualDuration: `${actualDuration.toFixed(2)}ms`,
        baseDuration: `${baseDuration.toFixed(2)}ms`,
      })
    }
  }
}

// Performance budget monitoring
export function checkPerformanceBudget() {
  if (!window.performance || !window.performance.getEntriesByType) return
  
  const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (!navigation) return
  
  const budgets = {
    pageLoad: 3000, // 3 seconds
    domContentLoaded: 1500, // 1.5 seconds
    firstPaint: 1000, // 1 second
  }
  
  const metrics = {
    pageLoad: navigation.loadEventEnd - navigation.fetchStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
    firstPaint: 0, // Will be set below
  }
  
  // Get first paint timing
  const paintEntries = window.performance.getEntriesByType('paint')
  const firstPaintEntry = paintEntries.find(entry => entry.name === 'first-paint')
  if (firstPaintEntry) {
    metrics.firstPaint = firstPaintEntry.startTime
  }
  
  // Check budgets and report violations
  Object.entries(budgets).forEach(([metric, budget]) => {
    const value = metrics[metric as keyof typeof metrics]
    if (value > budget) {
      console.warn(`Performance budget exceeded for ${metric}: ${value.toFixed(2)}ms (budget: ${budget}ms)`)
      
      // Report to Sentry
      Sentry.captureMessage(`Performance budget exceeded: ${metric}`, {
        level: 'warning',
        extra: {
          metric,
          value,
          budget,
          exceeded: value - budget,
        },
      })
    }
  })
}

// Initialize all performance monitoring
export function initPerformanceMonitoring() {
  // Initialize Web Vitals
  initWebVitals()
  
  // Monitor resources and long tasks
  if (document.readyState === 'complete') {
    monitorResourceTiming()
    monitorLongTasks()
  } else {
    window.addEventListener('load', () => {
      monitorResourceTiming()
      monitorLongTasks()
      
      // Check performance budget after load
      setTimeout(checkPerformanceBudget, 1000)
    })
  }
}