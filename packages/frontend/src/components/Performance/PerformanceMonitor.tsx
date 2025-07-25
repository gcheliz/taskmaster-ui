import React, { useState, useEffect } from 'react'
import { exportProfilerData, clearProfilerData } from '../../utils/profiler'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/atoms/Card'
import { Button } from '../ui/atoms/Button'
import { Badge } from '../ui/atoms/Badge'

interface PerformanceData {
  componentId: string
  renderCount: number
  averageTime: number
  maxTime: number
  minTime: number
  lastRender: number
}

/**
 * PerformanceMonitor Component
 * 
 * Displays real-time performance metrics from React Profiler
 * Only available in development mode
 */
export const PerformanceMonitor = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [isMinimized, setIsMinimized] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      const data = exportProfilerData()
      const processedData: PerformanceData[] = []

      Object.entries(data).forEach(([componentId, renders]) => {
        if (renders.length === 0) return

        const times = renders.map(r => r.actualDuration)
        processedData.push({
          componentId,
          renderCount: renders.length,
          averageTime: times.reduce((a, b) => a + b, 0) / times.length,
          maxTime: Math.max(...times),
          minTime: Math.min(...times),
          lastRender: renders[renders.length - 1].commitTime,
        })
      })

      setPerformanceData(processedData.sort((a, b) => b.averageTime - a.averageTime))
    }, 1000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const handleExport = () => {
    const data = exportProfilerData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-data-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    clearProfilerData()
    setPerformanceData([])
  }

  const getPerformanceBadge = (avgTime: number) => {
    if (avgTime < 16) return <Badge variant="success" size="sm">Good</Badge>
    if (avgTime < 50) return <Badge variant="warning" size="sm">Fair</Badge>
    return <Badge variant="error" size="sm">Slow</Badge>
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsMinimized(false)}
        >
          Show Performance Monitor
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 z-50">
      <Card variant="elevated" className="shadow-xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Performance Monitor
            {autoRefresh && (
              <span className="text-xs text-green-500">● Live</span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Pause' : 'Resume'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
            >
              Minimize
            </Button>
          </div>
        </CardHeader>
        <CardContent className="max-h-64 overflow-y-auto">
          {performanceData.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No performance data yet. Components will appear here as they render.
            </p>
          ) : (
            <div className="space-y-2">
              {performanceData.map((data) => (
                <div
                  key={data.componentId}
                  className="border border-gray-200 rounded p-2 text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{data.componentId}</span>
                    {getPerformanceBadge(data.averageTime)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Renders: {data.renderCount}</div>
                    <div>Avg: {data.averageTime.toFixed(1)}ms</div>
                    <div>Min: {data.minTime.toFixed(1)}ms</div>
                    <div>Max: {data.maxTime.toFixed(1)}ms</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <div className="border-t p-2 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            Export
          </Button>
        </div>
      </Card>
    </div>
  )
}