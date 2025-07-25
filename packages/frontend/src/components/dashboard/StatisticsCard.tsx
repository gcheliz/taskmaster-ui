import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../ui/atoms/Card'
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter'
import { cn } from '../../utils/cn'

interface StatisticsCardProps {
  title: string
  value: number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'primary' | 'success' | 'warning' | 'error'
  delay?: number
}

export const StatisticsCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
  delay = 0,
}: StatisticsCardProps) => {
  const animatedValue = useAnimatedCounter(value, 1.5, delay)

  const colorClasses = {
    primary: 'text-primary-600 bg-primary-50',
    success: 'text-semantic-success bg-green-50',
    warning: 'text-semantic-warning bg-yellow-50',
    error: 'text-semantic-error bg-red-50',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-secondary-600">{title}</p>
              <motion.p className="text-3xl font-bold text-secondary-900 mt-2 tabular-nums">
                {animatedValue}
              </motion.p>
              {subtitle && <p className="text-sm text-secondary-500 mt-1">{subtitle}</p>}
              {trend && (
                <div className="flex items-center gap-1 mt-2">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      trend.isPositive ? 'text-semantic-success' : 'text-semantic-error'
                    )}
                  >
                    {trend.isPositive ? '+' : ''}
                    {trend.value}%
                  </span>
                  <svg
                    className={cn(
                      'w-4 h-4',
                      trend.isPositive ? 'text-semantic-success' : 'text-semantic-error',
                      !trend.isPositive && 'rotate-180'
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </div>
              )}
            </div>
            {icon && <div className={cn('p-3 rounded-lg', colorClasses[color])}>{icon}</div>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
