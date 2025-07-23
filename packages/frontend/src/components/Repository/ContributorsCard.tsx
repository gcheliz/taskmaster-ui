import React, { useMemo } from 'react'
import { cn } from '../../utils/cn'
import { Card } from '../ui/molecules/Card'
import { Spinner } from '../ui/atoms/Spinner'
import { Badge } from '../ui/atoms/Badge'
import { Users, GitCommit, Calendar } from 'lucide-react'
import { useRepositoryStatistics } from '../../hooks/useRepositoryData'

export interface ContributorsCardProps {
  repositoryId: string
  className?: string
  maxContributors?: number
}

interface ContributorItemProps {
  contributor: {
    name: string
    email: string
    commits: number
    additions: number
    deletions: number
    firstCommitDate: string
    lastCommitDate: string
  }
  totalCommits: number
  isTopContributor: boolean
}

const ContributorItem: React.FC<ContributorItemProps> = ({ 
  contributor, 
  totalCommits,
  isTopContributor 
}) => {
  const percentage = Math.round((contributor.commits / totalCommits) * 100)
  const lastCommitDays = Math.floor(
    (Date.now() - new Date(contributor.lastCommitDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  const getActivityStatus = () => {
    if (lastCommitDays <= 7) return { label: 'Active', color: 'success' }
    if (lastCommitDays <= 30) return { label: 'Recent', color: 'primary' }
    if (lastCommitDays <= 90) return { label: 'Inactive', color: 'warning' }
    return { label: 'Dormant', color: 'secondary' }
  }

  const activityStatus = getActivityStatus()

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
      {/* Avatar */}
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold',
        isTopContributor ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-slate-400'
      )}>
        {contributor.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-slate-900 dark:text-slate-100">
            {contributor.name}
          </h4>
          {isTopContributor && (
            <Badge variant="primary" size="sm">Top Contributor</Badge>
          )}
          <Badge variant={activityStatus.color as any} size="sm">
            {activityStatus.label}
          </Badge>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {contributor.commits} commits ({percentage}%)
        </p>
      </div>

      {/* Stats */}
      <div className="text-right">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-green-600">+{contributor.additions.toLocaleString()}</span>
          <span className="text-slate-400">/</span>
          <span className="text-red-600">-{contributor.deletions.toLocaleString()}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {lastCommitDays === 0 ? 'Today' : `${lastCommitDays}d ago`}
        </p>
      </div>
    </div>
  )
}

export const ContributorsCard: React.FC<ContributorsCardProps> = ({
  repositoryId,
  className,
  maxContributors = 10,
}) => {
  const { statistics, isLoading, error } = useRepositoryStatistics({ repositoryId })

  const sortedContributors = useMemo(() => {
    if (!statistics?.contributors) return []
    
    return [...(statistics.contributors?.list || [])]
      .sort((a, b) => b.commits - a.commits)
      .slice(0, maxContributors)
  }, [statistics, maxContributors])

  const contributorStats = useMemo(() => {
    if (!statistics?.contributors) return null

    const activeCount = statistics.contributors?.active || 0

    return {
      total: statistics.contributors?.total || 0,
      active: activeCount,
      totalCommits: statistics.commits?.total || 0,
    }
  }, [statistics])

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </Card>
    )
  }

  if (error || !statistics || !contributorStats) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center text-slate-500">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Unable to load contributors</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Contributors</h3>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Total:</span>
              <span className="font-semibold">{contributorStats.total}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Active:</span>
              <span className="font-semibold text-green-600">{contributorStats.active}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Summary */}
      <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitCommit className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Collaboration Overview
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {contributorStats.active} active contributors out of {contributorStats.total} total
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {Math.round((contributorStats.active / contributorStats.total) * 100)}%
            </p>
            <p className="text-xs text-slate-500">Activity Rate</p>
          </div>
        </div>
      </div>

      {/* Contributors List */}
      <div className="space-y-2">
        {sortedContributors.map((contributor, index) => (
          <ContributorItem
            key={contributor.email}
            contributor={{
              name: contributor.name,
              email: contributor.email,
              commits: contributor.commits,
              additions: contributor.linesAdded,
              deletions: contributor.linesRemoved,
              firstCommitDate: contributor.lastActivity, // Using lastActivity as we don't have firstCommitDate
              lastCommitDate: contributor.lastActivity
            }}
            totalCommits={contributorStats.totalCommits}
            isTopContributor={index === 0}
          />
        ))}
      </div>

      {statistics.contributors.list && statistics.contributors.list.length > maxContributors && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-center text-slate-500">
            And {statistics.contributors.list.length - maxContributors} more contributors...
          </p>
        </div>
      )}
    </Card>
  )
}

export default ContributorsCard