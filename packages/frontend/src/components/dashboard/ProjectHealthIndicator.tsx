import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { cn } from '../../utils/cn'

interface HealthMetric {
  name: string
  value: number
  max: number
  status: 'healthy' | 'warning' | 'critical'
}

interface ProjectHealthIndicatorProps {
  projectName: string
  metrics: HealthMetric[]
  overallHealth: number
  className?: string
}

const getHealthColor = (value: number) => {
  if (value >= 80) return 'text-semantic-success'
  if (value >= 60) return 'text-semantic-warning'
  return 'text-semantic-error'
}

const getHealthBackground = (value: number) => {
  if (value >= 80) return 'bg-semantic-success'
  if (value >= 60) return 'bg-semantic-warning'
  return 'bg-semantic-error'
}

const getStatusColor = (status: HealthMetric['status']) => {
  const colors = {
    healthy: 'text-semantic-success',
    warning: 'text-semantic-warning',
    critical: 'text-semantic-error',
  }
  return colors[status]
}

export const ProjectHealthIndicator: React.FC<ProjectHealthIndicatorProps> = ({
  projectName,
  metrics,
  overallHealth,
  className,
}) => {
  const radius = 80
  const strokeWidth = 8
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (overallHealth / 100) * circumference

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Project Health - {projectName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex justify-center">
            <div className="relative">
              <svg width="180" height="180" className="transform -rotate-90">
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  fill="none"
                  className="text-secondary-200"
                />
                <motion.circle
                  cx="90"
                  cy="90"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className={getHealthBackground(overallHealth)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.p
                    className={cn('text-4xl font-bold', getHealthColor(overallHealth))}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    {overallHealth}%
                  </motion.p>
                  <p className="text-sm text-secondary-600 mt-1">Overall Health</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-secondary-700">{metric.name}</span>
                  <span className={cn('text-sm font-medium', getStatusColor(metric.status))}>
                    {metric.value}/{metric.max}
                  </span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2">
                  <motion.div
                    className={cn(
                      'h-2 rounded-full',
                      getHealthBackground((metric.value / metric.max) * 100)
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${(metric.value / metric.max) * 100}%` }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.8 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
