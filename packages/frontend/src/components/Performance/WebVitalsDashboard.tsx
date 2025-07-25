import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/atoms/Card'
import { Badge } from '../ui/atoms/Badge'
import { Progress } from '../ui/atoms/Progress'
import { useWebVitals } from './WebVitals'

interface WebVitalMetric {
  name: 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  timestamp: number
}

interface WebVitalsData {
  CLS: WebVitalMetric[]
  FCP: WebVitalMetric[]
  INP: WebVitalMetric[]
  LCP: WebVitalMetric[]
  TTFB: WebVitalMetric[]
}

const METRIC_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25, unit: '' },
  FCP: { good: 1800, poor: 3000, unit: 'ms' },
  INP: { good: 200, poor: 500, unit: 'ms' },
  LCP: { good: 2500, poor: 4000, unit: 'ms' },
  TTFB: { good: 800, poor: 1800, unit: 'ms' },
}

const METRIC_DESCRIPTIONS = {
  CLS: 'Cumulative Layout Shift',
  FCP: 'First Contentful Paint',
  INP: 'Interaction to Next Paint',
  LCP: 'Largest Contentful Paint',
  TTFB: 'Time to First Byte',
}

/**
 * WebVitalsDashboard Component
 * 
 * Displays a comprehensive dashboard of Core Web Vitals metrics
 */
export const WebVitalsDashboard = () => {
  const [vitalsData, setVitalsData] = useState<WebVitalsData>({
    CLS: [],
    FCP: [],
    INP: [],
    LCP: [],
    TTFB: [],
  })
  const [isVisible, setIsVisible] = useState(true)

  useWebVitals((metric) => {
    setVitalsData((prev) => ({
      ...prev,
      [metric.name]: [
        ...prev[metric.name as keyof WebVitalsData],
        {
          ...metric,
          timestamp: Date.now(),
        },
      ].slice(-10), // Keep last 10 measurements
    }))
  })

  const getLatestMetric = (metricName: keyof WebVitalsData): WebVitalMetric | null => {
    const metrics = vitalsData[metricName]
    return metrics.length > 0 ? metrics[metrics.length - 1] : null
  }

  const getAverageValue = (metricName: keyof WebVitalsData): number => {
    const metrics = vitalsData[metricName]
    if (metrics.length === 0) return 0
    const sum = metrics.reduce((acc, m) => acc + m.value, 0)
    return sum / metrics.length
  }

  const formatValue = (value: number, unit: string): string => {
    if (unit === 'ms') {
      return value >= 1000 ? `${(value / 1000).toFixed(2)}s` : `${Math.round(value)}ms`
    }
    return value.toFixed(3)
  }

  const getScorePercentage = (value: number, metricName: keyof typeof METRIC_THRESHOLDS): number => {
    const threshold = METRIC_THRESHOLDS[metricName]
    if (value <= threshold.good) return 100
    if (value >= threshold.poor) return 0
    
    const range = threshold.poor - threshold.good
    const normalized = (value - threshold.good) / range
    return Math.round((1 - normalized) * 100)
  }

  const getRatingColor = (rating: string): string => {
    switch (rating) {
      case 'good':
        return 'text-green-600'
      case 'needs-improvement':
        return 'text-yellow-600'
      case 'poor':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getBadgeVariant = (rating: string): 'success' | 'warning' | 'error' => {
    switch (rating) {
      case 'good':
        return 'success'
      case 'needs-improvement':
        return 'warning'
      case 'poor':
        return 'error'
      default:
        return 'warning'
    }
  }

  if (!isVisible) {
    return (
      <button
        className="fixed top-4 right-4 px-3 py-1 bg-blue-500 text-white rounded-md text-sm z-50"
        onClick={() => setIsVisible(true)}
      >
        Show Web Vitals
      </button>
    )
  }

  return (
    <div className="fixed top-4 right-4 w-80 z-50">
      <Card variant="elevated" className="shadow-xl">
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-lg">Core Web Vitals</CardTitle>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => setIsVisible(false)}
          >
            ×
          </button>
        </CardHeader>
        <CardContent className="space-y-3">
          {(Object.keys(METRIC_THRESHOLDS) as Array<keyof typeof METRIC_THRESHOLDS>).map((metricName) => {
            const latest = getLatestMetric(metricName)
            const average = getAverageValue(metricName)
            const threshold = METRIC_THRESHOLDS[metricName]
            const score = latest ? getScorePercentage(latest.value, metricName) : 0

            return (
              <div key={metricName} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{metricName}</span>
                    <span className="text-xs text-gray-500">
                      {METRIC_DESCRIPTIONS[metricName]}
                    </span>
                  </div>
                  {latest && (
                    <Badge variant={getBadgeVariant(latest.rating)} size="sm">
                      {latest.rating}
                    </Badge>
                  )}
                </div>
                
                {latest ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className={getRatingColor(latest.rating)}>
                        {formatValue(latest.value, threshold.unit)}
                      </span>
                      <span className="text-xs text-gray-500">
                        avg: {formatValue(average, threshold.unit)}
                      </span>
                    </div>
                    <Progress 
                      value={score} 
                      max={100}
                      size="md"
                      variant={latest.rating === 'good' ? 'success' : latest.rating === 'poor' ? 'error' : 'warning'}
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Good: {formatValue(threshold.good, threshold.unit)}</span>
                      <span>Poor: {formatValue(threshold.poor, threshold.unit)}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-400">Measuring...</div>
                )}
              </div>
            )
          })}
          
          <div className="pt-2 border-t text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span>Measurements: {Object.values(vitalsData).reduce((acc, arr) => acc + arr.length, 0)}</span>
              <button
                className="text-blue-500 hover:text-blue-600"
                onClick={() => setVitalsData({ CLS: [], FCP: [], INP: [], LCP: [], TTFB: [] })}
              >
                Clear
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}