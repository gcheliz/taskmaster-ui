import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

interface WebVitalsConfig {
  enabled?: boolean;
  onReport?: (metric: Metric) => void;
  threshold?: {
    CLS?: number;
    FCP?: number;
    INP?: number;
    LCP?: number;
    TTFB?: number;
  };
  debug?: boolean;
}

const defaultThresholds = {
  CLS: 0.1,     // Good < 0.1, Poor > 0.25
  FCP: 1800,    // Good < 1.8s, Poor > 3s
  INP: 200,     // Good < 200ms, Poor > 500ms
  LCP: 2500,    // Good < 2.5s, Poor > 4s
  TTFB: 800,    // Good < 0.8s, Poor > 1.8s
};

export const WebVitalsMonitor: React.FC<WebVitalsConfig> = ({
  enabled = true,
  onReport,
  threshold = defaultThresholds,
  debug = false,
}) => {
  useEffect(() => {
    if (!enabled) return;

    const reportMetric = (metric: Metric) => {
      const isGood = metric.value <= (threshold[metric.name as keyof typeof threshold] || defaultThresholds[metric.name as keyof typeof defaultThresholds]);
      
      // Log to console in development or debug mode
      if (debug || process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          isGood,
        });
      }

      // Send to analytics service
      if ('gtag' in window && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.rating,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }

      // Custom reporting
      if (onReport) {
        onReport(metric);
      }

      // Log warnings for poor performance
      if (!isGood && metric.rating === 'poor') {
        console.warn(`[Web Vitals] Poor ${metric.name} detected:`, metric.value);
      }
    };

    // Register all Web Vitals
    onCLS(reportMetric);
    onFCP(reportMetric);
    onINP(reportMetric);
    onLCP(reportMetric);
    onTTFB(reportMetric);
  }, [enabled, onReport, threshold, debug]);

  return null;
};

// Hook for custom Web Vitals reporting
export const useWebVitals = (callback?: (metric: Metric) => void) => {
  useEffect(() => {
    if (!callback) return;

    onCLS(callback);
    onFCP(callback);
    onINP(callback);
    onLCP(callback);
    onTTFB(callback);
  }, [callback]);
};

// Performance observer for custom metrics
export const measurePerformance = (name: string, startMark?: string) => {
  if (!('performance' in window)) return;

  const endMark = `${name}-end`;
  performance.mark(endMark);

  if (startMark) {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name).pop();
    
    if (measure && process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
    }
    
    return measure?.duration;
  }
};

// Component render time measurement
export const useRenderTime = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Render Time] ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
};