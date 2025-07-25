import React from 'react'
import { cn } from '../../../utils/cn'

export interface HealthSummaryCardProps {
  title: string
  score: number
  trend?: 'up' | 'down' | 'stable'
  subtitle?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  icon?: React.ReactNode
}

export const HealthSummaryCard: React.FC<HealthSummaryCardProps> = ({
  title,
  score,
  trend,
  subtitle,
  color = 'blue',
  icon,
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpIcon className="w-4 h-4 text-green-500" />
    if (trend === 'down') return <ArrowDownIcon className="w-4 h-4 text-red-500" />
    return <ArrowRightIcon className="w-4 h-4 text-gray-500" />
  }

  return (
    <div
      className={cn('rounded-lg border p-4 transition-[box-shadow] hover:shadow-md', colorClasses[color])}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="font-medium">{title}</h3>
        </div>
        {trend && getTrendIcon()}
      </div>

      <div className="flex items-baseline space-x-1">
        <span className={cn('text-2xl font-bold', getScoreColor(score))}>{score}</span>
        <span className="text-sm text-gray-500">/100</span>
      </div>

      {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
    </div>
  )
}

const ArrowUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14l5-5 5 5" />
  </svg>
)

const ArrowDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l-5 5-5-5" />
  </svg>
)

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)