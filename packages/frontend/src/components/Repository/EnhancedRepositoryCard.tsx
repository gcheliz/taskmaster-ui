import React, { useState } from 'react'
import { cn } from '../../utils/cn'
import { Card } from '../ui/molecules/Card'
import { Badge } from '../ui/atoms/Badge'
import { Button } from '../ui/atoms/Button'
import { Checkbox } from '../ui/atoms/Checkbox'
import { 
  GitBranch, 
  GitCommit, 
  Users, 
  Star, 
  GitFork,
  MoreVertical,
  RefreshCw,
  Settings,
  Trash2,
  ExternalLink,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { useRepositoryData, useRepositoryHealth } from '../../hooks/useRepositoryData'
import { Dropdown } from '../ui/molecules/Dropdown'
import { formatDistanceToNow } from 'date-fns'

export interface EnhancedRepositoryCardProps {
  repositoryId: string
  onSelect?: (selected: boolean) => void
  isSelected?: boolean
  onSync?: () => void
  onSettings?: () => void
  onRemove?: () => void
  onViewDetails?: () => void
  className?: string
  showBatchSelect?: boolean
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

const ConnectionStatusIndicator: React.FC<{ status: 'connected' | 'syncing' | 'error' }> = ({ status }) => {
  const config = {
    connected: { icon: CheckCircle, color: 'text-green-500', label: 'Connected' },
    syncing: { icon: RefreshCw, color: 'text-blue-500 animate-spin', label: 'Syncing' },
    error: { icon: XCircle, color: 'text-red-500', label: 'Error' }
  }

  const { icon: Icon, color, label } = config[status]

  return (
    <div className={cn('flex items-center gap-1', color)}>
      <Icon className="w-4 h-4" />
      <span className="text-xs">{label}</span>
    </div>
  )
}

export const EnhancedRepositoryCard: React.FC<EnhancedRepositoryCardProps> = ({
  repositoryId,
  onSelect,
  isSelected = false,
  onSync,
  onSettings,
  onRemove,
  onViewDetails,
  className,
  showBatchSelect = false,
}) => {
  const { repository, loading, error } = useRepositoryData(repositoryId)
  const { health } = useRepositoryHealth(repositoryId)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await onSync?.()
    } finally {
      setIsSyncing(false)
    }
  }

  if (loading) {
    return (
      <Card className={cn('p-6 animate-pulse', className)}>
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-4" />
        <div className="h-3 bg-slate-200 rounded w-1/2 mb-6" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-slate-200 rounded" />
          <div className="h-16 bg-slate-200 rounded" />
          <div className="h-16 bg-slate-200 rounded" />
        </div>
      </Card>
    )
  }

  if (error || !repository) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center text-slate-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
          <p>Failed to load repository</p>
        </div>
      </Card>
    )
  }

  const connectionStatus = error ? 'error' : isSyncing ? 'syncing' : 'connected'
  const healthScore = health?.overall || 0

  return (
    <Card 
      className={cn(
        'p-6 transition-all hover:shadow-lg',
        isSelected && 'ring-2 ring-blue-500',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {showBatchSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect?.(checked as boolean)}
              className="mt-1"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {repository.name}
              </h3>
              <ConnectionStatusIndicator status={connectionStatus} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
              {repository.description || 'No description available'}
            </p>
          </div>
        </div>

        {/* Actions Dropdown */}
        <Dropdown>
          <Dropdown.Trigger asChild>
            <Button variant="ghost" size="sm" className="p-1">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </Dropdown.Trigger>
          <Dropdown.Content align="end">
            <Dropdown.Item onSelect={handleSync} disabled={isSyncing}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Repository
            </Dropdown.Item>
            <Dropdown.Item onSelect={onViewDetails}>
              <ExternalLink className="w-4 h-4 mr-2" />
              View Details
            </Dropdown.Item>
            <Dropdown.Item onSelect={onSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Dropdown.Item>
            <Dropdown.Separator />
            <Dropdown.Item onSelect={onRemove} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      </div>

      {/* Repository Info */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <GitBranch className="w-4 h-4 text-slate-400" />
          <span className="font-medium">{repository.defaultBranch}</span>
        </div>
        {repository.language && (
          <Badge variant="secondary" size="sm">
            {repository.language}
          </Badge>
        )}
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>{repository.stars}</span>
        </div>
        <div className="flex items-center gap-1">
          <GitFork className="w-4 h-4 text-slate-400" />
          <span>{repository.forks}</span>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <GitCommit className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-slate-500">Commits</span>
          </div>
          <p className="text-lg font-semibold">{repository.stats?.totalCommits?.toLocaleString() || 0}</p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-green-600" />
            <span className="text-xs text-slate-500">Contributors</span>
          </div>
          <p className="text-lg font-semibold">{repository.stats?.totalContributors || 0}</p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-slate-500">Health</span>
          </div>
          <p className={cn('text-lg font-semibold', getHealthColor(healthScore))}>
            {healthScore}%
          </p>
        </div>
      </div>

      {/* Branch Status */}
      {repository.gitStatus && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">{repository.gitStatus.branch}</span>
            {repository.gitStatus.isClean ? (
              <Badge variant="success" size="xs">Clean</Badge>
            ) : (
              <Badge variant="warning" size="xs">Changes</Badge>
            )}
          </div>
          {(repository.gitStatus.ahead > 0 || repository.gitStatus.behind > 0) && (
            <div className="flex items-center gap-2 text-xs">
              {repository.gitStatus.ahead > 0 && (
                <span className="text-green-600">↑{repository.gitStatus.ahead}</span>
              )}
              {repository.gitStatus.behind > 0 && (
                <span className="text-red-600">↓{repository.gitStatus.behind}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Last Activity */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>
            Last push {repository.lastPush 
              ? formatDistanceToNow(new Date(repository.lastPush), { addSuffix: true })
              : 'Never'
            }
          </span>
        </div>
        <Button 
          variant="primary" 
          size="sm"
          onClick={onViewDetails}
        >
          View Details
        </Button>
      </div>
    </Card>
  )
}

export default EnhancedRepositoryCard