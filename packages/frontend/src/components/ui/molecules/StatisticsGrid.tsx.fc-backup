import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../atoms/Card'
import { Badge } from '../atoms/Badge'
import { Icon, TaskIcon, CompleteIcon, TimeIcon, StarFilledIcon } from '../atoms/Icon'

export interface TaskMetrics {
  total: number
  completed: number
  inProgress: number
  pending: number
  blocked: number
  deferred?: number
  completionRate: number
  statusBreakdown: Record<string, number>
}

export interface ProjectInsights {
  totalEstimatedHours: number
  averageTaskComplexity: number
  productivityScore: number
  recommendations: string[]
}

export interface ProjectHealth {
  score: number
  status: 'excellent' | 'good' | 'fair' | 'needs-attention'
  lastChecked?: string
  issues?: string[]
}

export interface StatisticsGridProps {
  taskMetrics: TaskMetrics
  insights: ProjectInsights
  health?: ProjectHealth
  className?: string
  showHealthIndicator?: boolean
  showProgressBars?: boolean
}

const StatisticsGrid: React.FC<StatisticsGridProps> = ({
  taskMetrics,
  insights,
  health,
  className = '',
  showHealthIndicator = true,
  showProgressBars = true,
}) => {
  const getHealthColor = (
    status: string
  ): 'success' | 'primary' | 'warning' | 'error' | 'secondary' => {
    switch (status) {
      case 'excellent':
        return 'success'
      case 'good':
        return 'primary'
      case 'fair':
        return 'warning'
      case 'needs-attention':
        return 'error'
      default:
        return 'secondary'
    }
  }

  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`
  }

  const getHealthStatusText = (status: string): string => {
    return status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const statCards = [
    {
      id: 'total-tasks',
      title: 'Total Tasks',
      value: taskMetrics.total,
      icon: TaskIcon,
      color: 'primary' as 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted',
      badges: [
        {
          variant: 'success' as const,
          text: `${taskMetrics.completed} completed`,
        },
        {
          variant: 'secondary' as const,
          text: `${taskMetrics.inProgress} active`,
        },
      ],
      description: 'Total number of tasks in the project',
    },
    {
      id: 'completion-rate',
      title: 'Completion Rate',
      value: formatPercentage(taskMetrics.completionRate),
      icon: CompleteIcon,
      color: 'success' as 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted',
      progressBar: showProgressBars
        ? {
            percentage: taskMetrics.completionRate,
            color: 'success',
          }
        : undefined,
      description: `${taskMetrics.pending} pending tasks`,
      badges: [],
    },
    {
      id: 'estimated-hours',
      title: 'Estimated Hours',
      value: `${insights.totalEstimatedHours}h`,
      icon: TimeIcon,
      color: 'warning' as 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted',
      badges: [
        {
          variant: 'warning' as const,
          text: `Avg: ${insights.averageTaskComplexity.toFixed(1)}`,
        },
        {
          variant: 'secondary' as const,
          text: `${taskMetrics.blocked} blocked`,
        },
      ],
      description: 'Total estimated work hours',
    },
  ]

  // Add health indicator if enabled
  if (showHealthIndicator) {
    const healthVariant = health ? getHealthColor(health.status) : 'secondary'

    const healthBadgeVariant =
      healthVariant === 'error'
        ? ('warning' as const)
        : healthVariant === 'primary'
          ? ('success' as const)
          : ('secondary' as const)
    const healthBadges = [
      {
        variant: healthBadgeVariant,
        text: health ? getHealthStatusText(health.status) : 'Unknown',
      },
      {
        variant: 'secondary' as const,
        text: `Score: ${formatPercentage(insights.productivityScore)}`,
      },
    ]

    ;(statCards as any).push({
      id: 'project-health',
      title: 'Project Health',
      value: health ? Math.round(health.score).toString() : '--',
      icon: StarFilledIcon,
      color: healthVariant as 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted',
      badges: healthBadges,
      description: health?.lastChecked
        ? `Last checked: ${new Date(health.lastChecked).toLocaleDateString()}`
        : 'Project health metrics',
    })
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {statCards.map((card) => (
        <Card
          key={card.id}
          variant="elevated"
          className="hover:shadow-lg transition-[box-shadow,transform] duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                {card.title}
              </CardTitle>
              <Icon
                icon={card.icon}
                size="lg"
                color={card.color}
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
              {card.value}
            </div>

            {/* Progress Bar */}
            {card.progressBar && (
              <div className="w-full bg-secondary-200 dark:bg-surface-700 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-[width] duration-500 ${
                    card.progressBar.color === 'success'
                      ? 'bg-success-500'
                      : card.progressBar.color === 'warning'
                        ? 'bg-warning-500'
                        : card.progressBar.color === 'error'
                          ? 'bg-error-500'
                          : 'bg-primary-500'
                  }`}
                  style={{ width: `${card.progressBar.percentage}%` }}
                />
              </div>
            )}

            {/* Badges */}
            {card.badges.length > 0 && (
              <div className="flex items-center space-x-2 mb-2">
                {card.badges.map((badge, index) => (
                  <Badge
                    key={index}
                    variant={badge.variant}
                    size="sm"
                    className="animate-in fade-in-50 duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {badge.text}
                  </Badge>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-secondary-600 dark:text-secondary-400">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export { StatisticsGrid }
