import React, { useEffect, useRef, useState } from 'react'

interface FPSMonitorProps {
  enabled?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export const FPSMonitor = ({ 
  enabled = process.env.NODE_ENV === 'development',
  position = 'top-right' 
}: FPSMonitorProps) => {
  const [fps, setFps] = useState(60)
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())

  useEffect(() => {
    if (!enabled) return

    let animationId: number

    const measureFPS = () => {
      frameCount.current++
      const currentTime = performance.now()
      
      if (currentTime >= lastTime.current + 1000) {
        const measuredFps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current))
        setFps(measuredFps)
        frameCount.current = 0
        lastTime.current = currentTime
      }

      animationId = requestAnimationFrame(measureFPS)
    }

    animationId = requestAnimationFrame(measureFPS)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [enabled])

  if (!enabled) return null

  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2'
  }

  const getFpsColor = () => {
    if (fps >= 55) return 'text-green-400'
    if (fps >= 30) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div 
      className={`fixed ${positionClasses[position]} bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-md z-[9999] pointer-events-none select-none`}
      role="status"
      aria-label={`FPS: ${fps}`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-400 font-mono">FPS:</span>
        <span className={`text-sm font-mono font-bold ${getFpsColor()}`}>
          {fps}
        </span>
      </div>
    </div>
  )
}