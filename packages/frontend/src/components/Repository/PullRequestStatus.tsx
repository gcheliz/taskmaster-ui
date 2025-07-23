import React, { useMemo } from 'react'
import { cn } from '../../utils/cn'
import { Card } from '../ui/Card'
import { Badge } from '../ui/atoms/Badge'
import { Spinner } from '../ui/atoms/Spinner'
import { Button } from '../ui/atoms/Button'
import { Icon } from '../ui/IconWrapper'
import { 
  GitPullRequest,
  GitMerge,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Users,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Eye
} from 'lucide-react'
import { useRepositoryPullRequests } from '../../hooks/useRepositoryData'
import { formatDistanceToNow } from 'date-fns'

export interface PullRequestStatusProps {
  repositoryId: string
  className?: string
  maxPullRequests?: number
}

interface PullRequestItemProps {
  pr: {
    id: string
    number: number
    title: string
    author: {
      name: string
      avatar?: string
    }
    state: 'open' | 'merged' | 'closed'
    draft: boolean
    createdAt: string
    updatedAt: string
    mergeable: boolean
    reviews: {
      approved: number
      changesRequested: number
      commented: number
      pending: number
    }
    checks: {
      passed: number
      failed: number
      pending: number
      total: number
    }
    comments: number
    additions: number
    deletions: number
    changedFiles: number
    labels: Array<{
      name: string
      color: string
    }>
  }
}

const getPRStateIcon = (state: string, draft: boolean) => {
  if (draft) return <GitPullRequest className="w-4 h-4 text-slate-400" />
  switch (state) {
    case 'open':
      return <GitPullRequest className="w-4 h-4 text-green-600" />
    case 'merged':
      return <GitMerge className="w-4 h-4 text-purple-600" />
    case 'closed':
      return <XCircle className="w-4 h-4 text-red-600" />
    default:
      return <GitPullRequest className="w-4 h-4 text-slate-400" />
  }
}

const getPRStateBadge = (state: string, draft: boolean) => {
  if (draft) return <Badge variant="secondary" size="sm">Draft</Badge>
  switch (state) {
    case 'open':
      return <Badge variant="success" size="sm">Open</Badge>
    case 'merged':
      return <Badge variant="primary" size="sm">Merged</Badge>
    case 'closed':
      return <Badge variant="error" size="sm">Closed</Badge>
    default:
      return null
  }
}

const PullRequestItem: React.FC<PullRequestItemProps> = ({ pr }) => {
  const checksStatus = useMemo(() => {
    if (pr.checks.total === 0) return 'none'
    if (pr.checks.failed > 0) return 'failed'
    if (pr.checks.pending > 0) return 'pending'
    return 'passed'
  }, [pr.checks])

  const reviewStatus = useMemo(() => {
    if (pr.reviews.changesRequested > 0) return 'changes'
    if (pr.reviews.approved > 0 && pr.reviews.changesRequested === 0) return 'approved'
    if (pr.reviews.pending > 0) return 'pending'
    return 'none'
  }, [pr.reviews])

  return (
    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      {/* PR Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {getPRStateIcon(pr.state, pr.draft)}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
              <span className="text-slate-500 mr-2">#{pr.number}</span>
              {pr.title}
            </h4>
            <p className="text-sm text-slate-500">
              opened {formatDistanceToNow(new Date(pr.createdAt), { addSuffix: true })} by {pr.author.name}
            </p>
          </div>
        </div>
        {getPRStateBadge(pr.state, pr.draft)}
      </div>

      {/* PR Stats */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        {/* Changes */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs">
            <span className="text-green-600">+{pr.additions}</span>
            <span className="text-slate-400">/</span>
            <span className="text-red-600">-{pr.deletions}</span>
          </div>
          <p className="text-xs text-slate-500">{pr.changedFiles} files</p>
        </div>

        {/* Reviews */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            {reviewStatus === 'approved' && <CheckCircle className="w-4 h-4 text-green-600" />}
            {reviewStatus === 'changes' && <XCircle className="w-4 h-4 text-red-600" />}
            {reviewStatus === 'pending' && <Clock className="w-4 h-4 text-yellow-600" />}
            {reviewStatus === 'none' && <Users className="w-4 h-4 text-slate-400" />}
          </div>
          <p className="text-xs text-slate-500">
            {pr.reviews.approved > 0 ? `${pr.reviews.approved} approved` : 'No reviews'}
          </p>
        </div>

        {/* Checks */}
        <div className="text-center">
          <div className="flex items-center justify-center">
            {checksStatus === 'passed' && <CheckCircle className="w-4 h-4 text-green-600" />}
            {checksStatus === 'failed' && <XCircle className="w-4 h-4 text-red-600" />}
            {checksStatus === 'pending' && <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />}
            {checksStatus === 'none' && <AlertCircle className="w-4 h-4 text-slate-400" />}
          </div>
          <p className="text-xs text-slate-500">
            {pr.checks.total > 0 ? `${pr.checks.passed}/${pr.checks.total} checks` : 'No checks'}
          </p>
        </div>

        {/* Comments */}
        <div className="text-center">
          <div className="flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xs text-slate-500">
            {pr.comments} {pr.comments === 1 ? 'comment' : 'comments'}
          </p>
        </div>
      </div>

      {/* Labels */}
      {pr.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {pr.labels.map(label => (
            <span
              key={label.name}
              className="px-2 py-0.5 text-xs rounded-full text-white"
              style={{ backgroundColor: `#${label.color}` }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Status Indicators */}
      {pr.state === 'open' && (
        <div className="flex items-center gap-3 text-xs">
          {!pr.mergeable && (
            <span className="flex items-center gap-1 text-red-600">
              <AlertCircle className="w-3 h-3" />
              Cannot merge
            </span>
          )}
          {pr.mergeable && reviewStatus === 'approved' && checksStatus === 'passed' && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              Ready to merge
            </span>
          )}
          {pr.draft && (
            <span className="flex items-center gap-1 text-slate-500">
              <Eye className="w-3 h-3" />
              Work in progress
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export const PullRequestStatus: React.FC<PullRequestStatusProps> = ({
  repositoryId,
  className,
  maxPullRequests = 5,
}) => {
  const { pullRequests, isLoading, error } = useRepositoryPullRequests({ repositoryId })

  const prStats = useMemo(() => {
    if (!pullRequests) return null

    const open = pullRequests.filter(pr => pr.state === 'open' && !pr.draft)
    const draft = pullRequests.filter(pr => pr.draft)
    const merged = pullRequests.filter(pr => pr.state === 'merged')
    const closed = pullRequests.filter(pr => pr.state === 'closed' && pr.state !== 'merged')

    // Calculate merge rate
    const totalCompleted = merged.length + closed.length
    const mergeRate = totalCompleted > 0 ? (merged.length / totalCompleted) * 100 : 0

    // Calculate average time to merge (for merged PRs in last 30 days)
    const recentMerged = merged.filter(pr => 
      new Date(pr.updatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )
    const avgTimeToMerge = recentMerged.length > 0
      ? recentMerged.reduce((sum, pr) => {
          const created = new Date(pr.createdAt).getTime()
          const updated = new Date(pr.updatedAt).getTime()
          return sum + (updated - created)
        }, 0) / recentMerged.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0

    return {
      total: pullRequests.length,
      open: open.length,
      draft: draft.length,
      merged: merged.length,
      closed: closed.length,
      mergeRate: Math.round(mergeRate),
      avgTimeToMerge: Math.round(avgTimeToMerge * 10) / 10,
    }
  }, [pullRequests])

  const displayPRs = useMemo(() => {
    if (!pullRequests) return []
    
    // Prioritize open PRs, then recent merged/closed
    return [...pullRequests]
      .sort((a, b) => {
        // Open PRs first
        if (a.state === 'open' && b.state !== 'open') return -1
        if (a.state !== 'open' && b.state === 'open') return 1
        // Then by updated date
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
      .slice(0, maxPullRequests)
  }, [pullRequests, maxPullRequests])

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </Card>
    )
  }

  if (error || !pullRequests || !prStats) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center text-slate-500">
          <GitPullRequest className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Unable to load pull requests</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <GitPullRequest className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Pull Requests</h3>
        </div>
        <Button variant="primary" size="sm">
          New Pull Request
        </Button>
      </div>

      {/* PR Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{prStats.open}</p>
              <p className="text-xs text-green-700 dark:text-green-400">Open</p>
            </div>
            <GitPullRequest className="w-8 h-8 text-green-600/20" />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">{prStats.merged}</p>
              <p className="text-xs text-purple-700 dark:text-purple-400">Merged</p>
            </div>
            <GitMerge className="w-8 h-8 text-purple-600/20" />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">{prStats.mergeRate}%</p>
              <p className="text-xs text-blue-700 dark:text-blue-400">Merge Rate</p>
            </div>
            {prStats.mergeRate >= 70 ? (
              <TrendingUp className="w-8 h-8 text-blue-600/20" />
            ) : (
              <TrendingDown className="w-8 h-8 text-blue-600/20" />
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600">{prStats.avgTimeToMerge}d</p>
              <p className="text-xs text-orange-700 dark:text-orange-400">Avg Merge Time</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600/20" />
          </div>
        </div>
      </div>

      {/* PR List */}
      {displayPRs.length > 0 ? (
        <div className="space-y-3">
          {displayPRs.map(pr => (
            <PullRequestItem key={pr.id} pr={pr} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <GitPullRequest className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No pull requests yet</p>
          <Button variant="primary" size="sm" className="mt-2">
            Create First Pull Request
          </Button>
        </div>
      )}

      {pullRequests.length > maxPullRequests && (
        <div className="mt-4 text-center">
          <Button variant="secondary" size="sm">
            View All {pullRequests.length} Pull Requests
          </Button>
        </div>
      )}
    </Card>
  )
}

export default PullRequestStatus