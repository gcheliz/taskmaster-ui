import React, { Profiler, ProfilerOnRenderCallback } from 'react'

interface ProfilerData {
  id: string
  phase: 'mount' | 'update' | 'nested-update'
  actualDuration: number
  baseDuration: number
  startTime: number
  commitTime: number
  interactions: Set<any>
}

// Store for profiler data
const profilerData: Map<string, ProfilerData[]> = new Map()

// Enable profiler data collection only in development
const ENABLE_PROFILING = process.env.NODE_ENV === 'development' && 
  import.meta.env.VITE_ENABLE_PROFILER === 'true'

/**
 * Callback function for React Profiler
 * Collects performance metrics for components
 */
const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
  interactions
) => {
  if (!ENABLE_PROFILING) return

  const data: ProfilerData = {
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions,
  }

  // Store profiler data
  if (!profilerData.has(id)) {
    profilerData.set(id, [])
  }
  profilerData.get(id)!.push(data)

  // Log slow renders in development
  if (actualDuration > 16) {
    console.warn(
      `[Performance] Slow render detected in "${id}"`,
      {
        phase,
        actualDuration: `${actualDuration.toFixed(2)}ms`,
        baseDuration: `${baseDuration.toFixed(2)}ms`,
      }
    )
  }
}

/**
 * Get profiler data for a specific component
 */
export function getProfilerData(componentId: string): ProfilerData[] {
  return profilerData.get(componentId) || []
}

/**
 * Get average render time for a component
 */
export function getAverageRenderTime(componentId: string): number {
  const data = getProfilerData(componentId)
  if (data.length === 0) return 0

  const total = data.reduce((sum, item) => sum + item.actualDuration, 0)
  return total / data.length
}

/**
 * Clear all profiler data
 */
export function clearProfilerData(): void {
  profilerData.clear()
}

/**
 * Export profiler data for analysis
 */
export function exportProfilerData(): Record<string, ProfilerData[]> {
  const result: Record<string, ProfilerData[]> = {}
  profilerData.forEach((value, key) => {
    result[key] = value
  })
  return result
}

/**
 * ProfilerWrapper component for wrapping components with React Profiler
 */
interface ProfilerWrapperProps {
  id: string
  children: React.ReactNode
  onRender?: ProfilerOnRenderCallback
}

export const ProfilerWrapper = ({ 
  id, 
  children, 
  onRender = onRenderCallback 
}: ProfilerWrapperProps) => {
  if (!ENABLE_PROFILING) {
    return children
  }

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  )
}

/**
 * Hook to use profiler data
 */
export function useProfiler(componentId: string) {
  const [data, setData] = React.useState<ProfilerData[]>([])

  React.useEffect(() => {
    if (!ENABLE_PROFILING) return

    const interval = setInterval(() => {
      setData(getProfilerData(componentId))
    }, 1000)

    return () => clearInterval(interval)
  }, [componentId])

  return {
    data,
    averageRenderTime: getAverageRenderTime(componentId),
    clearData: () => {
      profilerData.delete(componentId)
      setData([])
    },
  }
}

// Expose functions to window in development
if (ENABLE_PROFILING && typeof window !== 'undefined') {
  (window as any).__PROFILER__ = {
    getProfilerData,
    getAverageRenderTime,
    clearProfilerData,
    exportProfilerData,
  }
}