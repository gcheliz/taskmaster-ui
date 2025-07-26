/**
 * React Profiler utilities for performance monitoring
 */

interface ProfilerData {
  id: string
  phase: 'mount' | 'update'
  actualDuration: number
  baseDuration: number
  startTime: number
  commitTime: number
  interactions?: Set<{ id: number; name: string; timestamp: number }>
}

// Store profiler data
const profilerData: Record<string, ProfilerData[]> = {}

/**
 * Record profiler data for a component
 */
export const recordProfilerData = (
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
  interactions?: Set<{ id: number; name: string; timestamp: number }>
): void => {
  if (!profilerData[id]) {
    profilerData[id] = []
  }

  profilerData[id].push({
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions
  })

  // Keep only last 100 entries per component
  if (profilerData[id].length > 100) {
    profilerData[id] = profilerData[id].slice(-100)
  }
}

/**
 * Export all profiler data
 */
export const exportProfilerData = (): Record<string, ProfilerData[]> => {
  return { ...profilerData }
}

/**
 * Clear all profiler data
 */
export const clearProfilerData = (): void => {
  Object.keys(profilerData).forEach(key => {
    delete profilerData[key]
  })
}

/**
 * Get profiler data for a specific component
 */
export const getComponentProfilerData = (componentId: string): ProfilerData[] => {
  return profilerData[componentId] || []
}

/**
 * Calculate average render time for a component
 */
export const getAverageRenderTime = (componentId: string): number => {
  const data = profilerData[componentId]
  if (!data || data.length === 0) return 0

  const total = data.reduce((sum, entry) => sum + entry.actualDuration, 0)
  return total / data.length
}

/**
 * Get slow renders (> 16ms)
 */
export const getSlowRenders = (threshold = 16): Record<string, ProfilerData[]> => {
  const slowRenders: Record<string, ProfilerData[]> = {}

  Object.entries(profilerData).forEach(([id, data]) => {
    const slow = data.filter(entry => entry.actualDuration > threshold)
    if (slow.length > 0) {
      slowRenders[id] = slow
    }
  })

  return slowRenders
}

/**
 * React Profiler onRender callback
 */
export const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
  interactions?: Set<{ id: number; name: string; timestamp: number }>
): void => {
  recordProfilerData(id, phase, actualDuration, baseDuration, startTime, commitTime, interactions)
}