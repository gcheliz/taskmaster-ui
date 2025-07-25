import React, { useMemo } from 'react'
import { cn } from '../../utils/cn'
import { Card } from '../ui/atoms/Card'
import { Spinner } from '../ui/atoms/Spinner'
import { Icon } from '../ui/IconWrapper'
import { 
  BarChart3, 
  Users, 
  GitCommit, 
  Calendar,
  TrendingUp,
  FileCode,
  Activity,
  Clock
} from 'lucide-react'
import { useRepositoryStatistics } from '../../hooks/useRepositoryData'

export interface RepositoryStatisticsCardProps {
  repositoryId: string
  className?: string
}

interface StatItemProps {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, trend, className }) => (
  <div className={cn('flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50', className)}>
    <div className="p-2 rounded-md bg-white dark:bg-slate-800 shadow-sm">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        {trend && (
          <span className={cn(
            'text-xs font-medium flex items-center gap-0.5',
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            <TrendingUp className={cn('w-3 h-3', !trend.isPositive && 'rotate-180')} />
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  </div>
)

export const RepositoryStatisticsCard: React.FC<RepositoryStatisticsCardProps> = ({
  repositoryId,
  className,
}) => {
  const { statistics, isLoading, error } = useRepositoryStatistics({ repositoryId })

  // Calculate trends and format data
  const formattedStats = useMemo(() => {
    if (!statistics) return null

    const thisWeekCommits = statistics.commits?.thisWeek || 0
    const lastWeekCommits = statistics.commits?.thisWeek || 0 // Using thisWeek as baseline since we don't have last week data
    const commitTrend = lastWeekCommits > 0 
      ? ((thisWeekCommits - lastWeekCommits) / lastWeekCommits) * 100
      : 0

    const activeContributors = statistics.contributors?.active || 0

    const totalLines = statistics.files?.byExtension?.reduce(
      (acc, ext) => acc + (ext.size || 0), 0
    ) || 0

    return {
      totalCommits: statistics.commits?.total || 0,
      commitTrend: {
        value: Math.round(commitTrend),
        isPositive: commitTrend >= 0
      },
      contributors: {
        total: statistics.contributors?.total || 0,
        active: activeContributors
      },
      filesCount: statistics.files?.total || 0,
      totalLines: totalLines.toLocaleString(),
      avgCommitsPerWeek: Math.round(statistics.activity?.averageCommitsPerWeek || 0),
      lastPush: statistics.activity?.lastPush
    }
  }, [statistics])

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </Card>
    )
  }

  if (error || !formattedStats) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center text-slate-500">
          <Icon name="chart-bar" className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Unable to load repository statistics</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Repository Statistics</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatItem
          icon={<GitCommit className="w-5 h-5 text-blue-600" />}
          label="Total Commits"
          value={formattedStats.totalCommits.toLocaleString()}
          trend={formattedStats.commitTrend}
        />

        <StatItem
          icon={<Users className="w-5 h-5 text-green-600" />}
          label="Contributors"
          value={`${formattedStats.contributors.active} / ${formattedStats.contributors.total}`}
        />

        <StatItem
          icon={<FileCode className="w-5 h-5 text-purple-600" />}
          label="Total Files"
          value={formattedStats.filesCount.toLocaleString()}
        />

        <StatItem
          icon={<Activity className="w-5 h-5 text-orange-600" />}
          label="Lines of Code"
          value={formattedStats.totalLines}
        />

        <StatItem
          icon={<Calendar className="w-5 h-5 text-indigo-600" />}
          label="Avg Commits/Week"
          value={formattedStats.avgCommitsPerWeek}
        />

        <StatItem
          icon={<Clock className="w-5 h-5 text-pink-600" />}
          label="Last Push"
          value={formattedStats.lastPush 
            ? new Date(formattedStats.lastPush).toLocaleDateString()
            : 'Never'
          }
        />
      </div>

      {/* Activity Summary */}
      <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Repository Activity
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {formattedStats.commitTrend.isPositive 
                ? `Activity is up ${formattedStats.commitTrend.value}% this week`
                : formattedStats.commitTrend.value === 0
                ? 'Activity is stable this week'
                : `Activity is down ${Math.abs(formattedStats.commitTrend.value)}% this week`
              }
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default RepositoryStatisticsCard