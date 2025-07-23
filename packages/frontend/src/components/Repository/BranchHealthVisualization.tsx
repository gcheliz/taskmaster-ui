import React, { useMemo } from 'react'
import { cn } from '../../utils/cn'
import { Card } from '../ui/Card'
import { Badge } from '../ui/atoms/Badge'
import { Progress } from '../ui/atoms/Progress'
import { Spinner } from '../ui/atoms/Spinner'
import { Button } from '../ui/atoms/Button'
import { 
  GitBranch, 
  GitCommit, 
  GitMerge,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react'
import { useRepositoryBranches } from '../../hooks/useRepositoryData'
import { formatDistanceToNow } from 'date-fns'

export interface BranchHealthVisualizationProps {
  repositoryId: string
  className?: string
  maxBranches?: number
}

interface BranchHealthScoreProps {
  branch: {
    name: string
    isDefault: boolean
    isProtected: boolean
    lastCommit: {
      sha: string
      message: string
      author: string
      date: string
    }
    ahead: number
    behind: number
    hasConflicts: boolean
    pullRequests: {
      open: number
      merged: number
      closed: number
    }
  }
  defaultBranch: string
}

const calculateBranchHealth = (branch: BranchHealthScoreProps['branch']): number => {
  let score = 100

  // Deduct points for being behind
  if (branch.behind > 0) {
    score -= Math.min(branch.behind * 5, 30) // Max 30 points deduction
  }

  // Deduct points for conflicts
  if (branch.hasConflicts) {
    score -= 20
  }

  // Deduct points for old branches (no commits in last 30 days)
  const daysSinceLastCommit = Math.floor(
    (Date.now() - new Date(branch.lastCommit.date).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysSinceLastCommit > 30) {
    score -= Math.min(daysSinceLastCommit - 30, 20) // Max 20 points deduction
  }

  // Bonus points for merged PRs
  score += Math.min(branch.pullRequests.merged * 2, 10) // Max 10 points bonus

  return Math.max(0, Math.min(100, score))
}

const getHealthColor = (score: number): string => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

const getHealthBadgeVariant = (score: number): 'success' | 'warning' | 'error' => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'error'
}

const BranchHealthScore: React.FC<BranchHealthScoreProps> = ({ branch, defaultBranch }) => {
  const healthScore = calculateBranchHealth(branch)
  const daysSinceLastCommit = Math.floor(
    (Date.now() - new Date(branch.lastCommit.date).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      {/* Branch Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-slate-500" />
          <h4 className="font-medium text-slate-900 dark:text-slate-100">
            {branch.name}
          </h4>
          {branch.isDefault && (
            <Badge variant="primary" size="sm">Default</Badge>
          )}
          {branch.isProtected && (
            <Badge variant="secondary" size="sm">Protected</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-lg font-bold', getHealthColor(healthScore))}>
            {healthScore}%
          </span>
          <Badge variant={getHealthBadgeVariant(healthScore)} size="sm">
            {healthScore >= 80 ? 'Healthy' : healthScore >= 60 ? 'Fair' : 'Needs Attention'}
          </Badge>
        </div>
      </div>

      {/* Health Progress Bar */}
      <Progress value={healthScore} className="mb-3" />

      {/* Branch Status */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Sync Status */}
        <div className="flex items-center gap-2 text-sm">
          {branch.ahead > 0 || branch.behind > 0 ? (
            <>
              {branch.ahead > 0 && (
                <span className="flex items-center gap-1 text-green-600">
                  <ArrowUp className="w-3 h-3" />
                  {branch.ahead} ahead
                </span>
              )}
              {branch.behind > 0 && (
                <span className="flex items-center gap-1 text-red-600">
                  <ArrowDown className="w-3 h-3" />
                  {branch.behind} behind
                </span>
              )}
            </>
          ) : (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              Up to date
            </span>
          )}
        </div>

        {/* Conflict Status */}
        <div className="flex items-center gap-2 text-sm">
          {branch.hasConflicts ? (
            <span className="flex items-center gap-1 text-red-600">
              <XCircle className="w-3 h-3" />
              Has conflicts
            </span>
          ) : (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              No conflicts
            </span>
          )}
        </div>
      </div>

      {/* Last Commit */}
      <div className="mb-3">
        <p className="text-xs text-slate-500 mb-1">Last commit</p>
        <div className="flex items-start gap-2">
          <GitCommit className="w-3 h-3 text-slate-400 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
              {branch.lastCommit.message}
            </p>
            <p className="text-xs text-slate-500">
              by {branch.lastCommit.author} • {formatDistanceToNow(new Date(branch.lastCommit.date), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Pull Requests */}
      {(branch.pullRequests.open > 0 || branch.pullRequests.merged > 0) && (
        <div className="flex items-center gap-3 text-xs">
          <GitMerge className="w-3 h-3 text-slate-400" />
          {branch.pullRequests.open > 0 && (
            <span className="text-blue-600">{branch.pullRequests.open} open PRs</span>
          )}
          {branch.pullRequests.merged > 0 && (
            <span className="text-green-600">{branch.pullRequests.merged} merged</span>
          )}
          {branch.pullRequests.closed > 0 && (
            <span className="text-slate-500">{branch.pullRequests.closed} closed</span>
          )}
        </div>
      )}

      {/* Health Issues */}
      {(branch.behind > 5 || branch.hasConflicts || daysSinceLastCommit > 30) && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Health Issues:
          </p>
          {branch.behind > 5 && (
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <AlertCircle className="w-3 h-3" />
              <span>Branch is {branch.behind} commits behind {defaultBranch}</span>
            </div>
          )}
          {branch.hasConflicts && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span>Merge conflicts need to be resolved</span>
            </div>
          )}
          {daysSinceLastCommit > 30 && (
            <div className="flex items-center gap-1 text-xs text-yellow-600">
              <Clock className="w-3 h-3" />
              <span>No activity for {daysSinceLastCommit} days</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const BranchHealthVisualization: React.FC<BranchHealthVisualizationProps> = ({
  repositoryId,
  className,
  maxBranches = 6,
}) => {
  const { branches, isLoading, error } = useRepositoryBranches({ repositoryId })

  const sortedBranches = useMemo(() => {
    if (!branches) return []
    
    return [...branches]
      .map(branch => ({
        ...branch,
        healthScore: calculateBranchHealth(branch)
      }))
      .sort((a, b) => {
        // Default branch always first
        if (a.isDefault) return -1
        if (b.isDefault) return 1
        // Then by health score
        return a.healthScore - b.healthScore
      })
      .slice(0, maxBranches)
  }, [branches, maxBranches])

  const defaultBranch = branches?.find(b => b.isDefault)?.name || 'main'

  const overallHealth = useMemo(() => {
    if (!sortedBranches.length) return 0
    const totalScore = sortedBranches.reduce((sum, branch) => sum + branch.healthScore, 0)
    return Math.round(totalScore / sortedBranches.length)
  }, [sortedBranches])

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </Card>
    )
  }

  if (error || !branches) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center text-slate-500">
          <GitBranch className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Unable to load branch information</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Branch Health</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-slate-500">Overall Health</p>
            <p className={cn('text-2xl font-bold', getHealthColor(overallHealth))}>
              {overallHealth}%
            </p>
          </div>
          <Badge variant={getHealthBadgeVariant(overallHealth)} size="sm">
            {overallHealth >= 80 ? 'Excellent' : overallHealth >= 60 ? 'Good' : 'Needs Work'}
          </Badge>
        </div>
      </div>

      {/* Branch Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {branches.length}
          </p>
          <p className="text-xs text-slate-500">Total Branches</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {branches.filter(b => calculateBranchHealth(b) >= 80).length}
          </p>
          <p className="text-xs text-slate-500">Healthy</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">
            {branches.filter(b => calculateBranchHealth(b) < 60).length}
          </p>
          <p className="text-xs text-slate-500">Need Attention</p>
        </div>
      </div>

      {/* Branch List */}
      <div className="space-y-3">
        {sortedBranches.map(branch => (
          <BranchHealthScore
            key={branch.name}
            branch={branch}
            defaultBranch={defaultBranch}
          />
        ))}
      </div>

      {branches.length > maxBranches && (
        <div className="mt-4 text-center">
          <Button variant="secondary" size="sm">
            View All {branches.length} Branches
          </Button>
        </div>
      )}
    </Card>
  )
}

export default BranchHealthVisualization