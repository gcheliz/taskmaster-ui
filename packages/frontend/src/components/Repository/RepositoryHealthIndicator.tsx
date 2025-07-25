import React from 'react'
import { Badge } from '../ui/atoms/Badge'
import { cn } from '../../utils/cn'
import {
  calculateBranchStatus,
  calculateRepositoryHealth,
  getHealthScoreBadge,
  type RepositoryHealthScore,
} from '../../utils/repositoryHealth'
import type {
  RepositoryHealthMetrics,
  RepositoryStatistics,
} from '../../services/repositoryService'

export interface RepositoryHealthIndicatorProps {
  /** Branch status data */
  ahead?: number
  behind?: number
  isClean?: boolean
  conflicted?: number
  lastCommitDate: string
  /** Health metrics from API */
  healthMetrics?: RepositoryHealthMetrics
  /** Repository statistics from API */
  statistics?: RepositoryStatistics
  /** Show detailed breakdown */
  showDetails?: boolean
  /** Show score number */
  showScore?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

export const RepositoryHealthIndicator = ({
  ahead = 0,
  behind = 0,
  isClean = true,
  conflicted = 0,
  lastCommitDate,
  healthMetrics,
  statistics,
  showDetails = false,
  showScore = true,
  size = 'md',
  className,
}: RepositoryHealthIndicatorProps) => {
  // Calculate branch status first
  const branchStatus = calculateBranchStatus(ahead, behind, isClean, conflicted, lastCommitDate)

  // Calculate overall health score
  const healthScore = calculateRepositoryHealth(branchStatus, statistics, healthMetrics)
  const badgeInfo = getHealthScoreBadge(healthScore.level)

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={cn('repository-health-indicator', sizeClasses[size], className)}>
      <div className="flex items-center gap-2">
        <Badge
          variant={badgeInfo.variant}
          size={size}
          title={`Health Score: ${healthScore.score}/100`}
          className="font-medium"
        >
          {showScore ? `${healthScore.score}` : badgeInfo.label}
        </Badge>

        {showDetails && (
          <div className="flex items-center">
            {/* Health level indicator */}
            <div
              className={cn('px-2 py-1 rounded-md text-xs font-medium border', healthScore.color)}
            >
              {healthScore.level.charAt(0).toUpperCase() + healthScore.level.slice(1)}
            </div>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-3 space-y-2">
          {/* Factor breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Branch Status:</span>
              <span className="font-medium">{healthScore.factors.branchStatus}/25</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Commit Activity:</span>
              <span className="font-medium">{healthScore.factors.commitActivity}/25</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Code Quality:</span>
              <span className="font-medium">{healthScore.factors.codeQuality}/25</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Maintenance:</span>
              <span className="font-medium">{healthScore.factors.maintenance}/25</span>
            </div>
          </div>

          {/* Issues and recommendations */}
          {healthScore.issues.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-gray-700 mb-1">Issues:</h4>
              <ul className="space-y-1">
                {healthScore.issues.slice(0, 3).map((issue, index) => (
                  <li key={index} className="text-xs text-red-600 flex items-start gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>{issue}</span>
                  </li>
                ))}
                {healthScore.issues.length > 3 && (
                  <li className="text-xs text-gray-500">
                    +{healthScore.issues.length - 3} more issues
                  </li>
                )}
              </ul>
            </div>
          )}

          {healthScore.recommendations.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-gray-700 mb-1">Recommendations:</h4>
              <ul className="space-y-1">
                {healthScore.recommendations.slice(0, 2).map((rec, index) => (
                  <li key={index} className="text-xs text-blue-600 flex items-start gap-1">
                    <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
                {healthScore.recommendations.length > 2 && (
                  <li className="text-xs text-gray-500">
                    +{healthScore.recommendations.length - 2} more recommendations
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Compact health score display for use in cards
 */
export interface HealthScoreCompactProps {
  score: number
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const HealthScoreCompact = ({
  score,
  level,
  size = 'md',
  className,
}: HealthScoreCompactProps) => {
  const badgeInfo = getHealthScoreBadge(level)

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const colorClasses = {
    excellent: 'bg-green-100 text-green-800 border-green-200',
    good: 'bg-blue-100 text-blue-800 border-blue-200',
    fair: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    poor: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <div
      className={cn(
        'health-score-compact',
        'rounded-full border flex items-center justify-center font-bold',
        sizeClasses[size],
        colorClasses[level],
        className
      )}
      title={`Health Score: ${score}/100 (${level})`}
    >
      {score}
    </div>
  )
}

export default RepositoryHealthIndicator
