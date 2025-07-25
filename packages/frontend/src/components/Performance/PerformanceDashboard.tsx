import React, { useState, useEffect } from 'react'
import { exportProfilerData, clearProfilerData } from '../../utils/profiler'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/atoms/Card'
import { Button } from '../ui/atoms/Button'
import { Badge } from '../ui/atoms/Badge'
import { Progress } from '../ui/atoms/Progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/molecules/Tabs'
import { useWebVitals } from './WebVitals'
import { cn } from '../../utils/cn'

interface PerformanceMetrics {
  fps: number
  memory: {
    used: number
    total: number
    limit: number
  }
  renderCount: number
  slowRenders: number
  webVitals: {
    CLS?: number
    FCP?: number
    INP?: number
    LCP?: number
    TTFB?: number
  }
  profilerData: Record<string, any>
}

/**
 * PerformanceDashboard Component
 * 
 * Comprehensive performance monitoring dashboard
 */
export const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: { used: 0, total: 0, limit: 0 },
    renderCount: 0,
    slowRenders: 0,
    webVitals: {},
    profilerData: {},
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [isVisible, setIsVisible] = useState(false)

  // Collect FPS data
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime >= lastTime + 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round(frameCount * 1000 / (currentTime - lastTime)),
        }))
        frameCount = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(measureFPS)
    }

    const animationId = requestAnimationFrame(measureFPS)
    return () => cancelAnimationFrame(animationId)
  }, [])

  // Collect memory data
  useEffect(() => {
    const updateMemory = () => {
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memory: {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
          },
        }))
      }
    }

    updateMemory()
    const interval = setInterval(updateMemory, 1000)
    return () => clearInterval(interval)
  }, [])

  // Collect profiler data
  useEffect(() => {
    const updateProfilerData = () => {
      const data = exportProfilerData()
      let totalRenders = 0
      let slowRenders = 0

      Object.values(data).forEach((renders: any[]) => {
        totalRenders += renders.length
        slowRenders += renders.filter(r => r.actualDuration > 16).length
      })

      setMetrics(prev => ({
        ...prev,
        renderCount: totalRenders,
        slowRenders,
        profilerData: data,
      }))
    }

    updateProfilerData()
    const interval = setInterval(updateProfilerData, 1000)
    return () => clearInterval(interval)
  }, [])

  // Collect web vitals
  useWebVitals((metric) => {
    setMetrics(prev => ({
      ...prev,
      webVitals: {
        ...prev.webVitals,
        [metric.name]: metric.value,
      },
    }))
  })

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const getFPSStatus = (fps: number): { color: string; status: string } => {
    if (fps >= 55) return { color: 'text-green-600', status: 'Smooth' }
    if (fps >= 30) return { color: 'text-yellow-600', status: 'Fair' }
    return { color: 'text-red-600', status: 'Poor' }
  }

  const getMemoryPercentage = (): number => {
    if (metrics.memory.limit === 0) return 0
    return Math.round((metrics.memory.used / metrics.memory.limit) * 100)
  }

  if (!isVisible) {
    return (
      <button
        className="fixed bottom-4 left-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50"
        onClick={() => setIsVisible(true)}
      >
        Performance Dashboard
      </button>
    )
  }

  return (
    <div className="fixed inset-4 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
            Close
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="px-6 pt-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="profiler">React Profiler</TabsTrigger>
              <TabsTrigger value="webvitals">Web Vitals</TabsTrigger>
              <TabsTrigger value="memory">Memory</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* FPS Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Frame Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className={cn('text-2xl font-bold', getFPSStatus(metrics.fps).color)}>
                        {metrics.fps}
                      </span>
                      <span className="text-sm text-gray-500">FPS</span>
                    </div>
                    <Badge variant={metrics.fps >= 55 ? 'success' : metrics.fps >= 30 ? 'warning' : 'error'} size="sm">
                      {getFPSStatus(metrics.fps).status}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Memory Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {getMemoryPercentage()}%
                      </div>
                      <Progress 
                        value={getMemoryPercentage()} 
                        max={100}
                        variant={getMemoryPercentage() < 70 ? 'success' : getMemoryPercentage() < 90 ? 'warning' : 'error'}
                      />
                      <div className="text-xs text-gray-500">
                        {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.limit)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Renders Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Component Renders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{metrics.renderCount}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant={metrics.slowRenders === 0 ? 'success' : 'warning'} size="sm">
                          {metrics.slowRenders} slow
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Web Vitals Summary Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Web Vitals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      {Object.entries(metrics.webVitals).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key}</span>
                          <span className="font-medium">{value?.toFixed(0)}ms</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profiler Tab */}
            <TabsContent value="profiler" className="px-6 py-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(metrics.profilerData).map(([componentId, renders]: [string, any[]]) => {
                  const avgTime = renders.reduce((a, r) => a + r.actualDuration, 0) / renders.length || 0
                  const maxTime = Math.max(...renders.map(r => r.actualDuration), 0)
                  
                  return (
                    <Card key={componentId}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{componentId}</CardTitle>
                          <Badge 
                            variant={avgTime < 16 ? 'success' : avgTime < 50 ? 'warning' : 'error'} 
                            size="sm"
                          >
                            {avgTime.toFixed(1)}ms avg
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Renders:</span>
                            <span className="ml-2 font-medium">{renders.length}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Max:</span>
                            <span className="ml-2 font-medium">{maxTime.toFixed(1)}ms</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Type:</span>
                            <span className="ml-2 font-medium">
                              {renders[renders.length - 1]?.phase || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => clearProfilerData()}>
                  Clear Data
                </Button>
              </div>
            </TabsContent>

            {/* Web Vitals Tab */}
            <TabsContent value="webvitals" className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(metrics.webVitals).map(([metric, value]) => (
                  <Card key={metric}>
                    <CardHeader>
                      <CardTitle className="text-lg">{metric}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {value?.toFixed(metric === 'CLS' ? 3 : 0)}
                        {metric !== 'CLS' && 'ms'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Memory Tab */}
            <TabsContent value="memory" className="px-6 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Memory Usage Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Used Heap</span>
                        <span className="font-medium">{formatBytes(metrics.memory.used)}</span>
                      </div>
                      <Progress 
                        value={metrics.memory.used} 
                        max={metrics.memory.limit}
                        variant="primary"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Total Heap</span>
                        <span className="font-medium">{formatBytes(metrics.memory.total)}</span>
                      </div>
                      <Progress 
                        value={metrics.memory.total} 
                        max={metrics.memory.limit}
                        variant="warning"
                      />
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Heap Limit</span>
                        <span className="font-medium">{formatBytes(metrics.memory.limit)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}