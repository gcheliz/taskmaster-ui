import React from 'react'
import { Badge } from '../ui/atoms/Badge'
import { cn } from '../../utils/cn'
import {
  calculateBranchStatus,
  getBranchStatusBadge,
  formatCommitAge,
  type BranchStatusInfo,
} from '../../utils/repositoryHealth'

export interface BranchStatusIndicatorProps {
  /** Number of commits ahead of remote */
  ahead?: number
  /** Number of commits behind remote */
  behind?: number
  /** Whether working directory is clean */
  isClean?: boolean
  /** Number of conflicted files */
  conflicted?: number
  /** Last commit date ISO string */
  lastCommitDate: string
  /** Show detailed information */
  showDetails?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

export const BranchStatusIndicator: React.FC<BranchStatusIndicatorProps> = ({
  ahead = 0,
  behind = 0,
  isClean = true,
  conflicted = 0,
  lastCommitDate,
  showDetails = false,
  size = 'md',
  className,
}) => {
  const branchStatus = calculateBranchStatus(ahead, behind, isClean, conflicted, lastCommitDate)
  const badgeInfo = getBranchStatusBadge(branchStatus.status)
  const commitAge = formatCommitAge(branchStatus.lastCommitAge)

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={cn('branch-status-indicator', sizeClasses[size], className)}>
      <div className="flex items-center gap-2">
        <Badge variant={badgeInfo.variant} size={size} title={branchStatus.description}>
          {badgeInfo.label}
        </Badge>

        {showDetails && (
          <div className="flex items-center gap-3 text-gray-600">
            {/* Commit counts */}
            {(ahead > 0 || behind > 0) && (
              <div className="flex items-center gap-2 text-xs">
                {ahead > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />+{ahead}
                  </span>
                )}
                {behind > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-orange-500 rounded-full" />-{behind}
                  </span>
                )}
              </div>
            )}

            {/* Conflict indicator */}
            {conflicted > 0 && (
              <span className="flex items-center gap-1 text-red-600 text-xs">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                {conflicted} conflict{conflicted > 1 ? 's' : ''}
              </span>
            )}

            {/* Working directory status */}
            {!isClean && conflicted === 0 && (
              <span className="flex items-center gap-1 text-yellow-600 text-xs">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                uncommitted changes
              </span>
            )}
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-1">
          <p className="text-xs text-gray-500">Last commit {commitAge}</p>
          {branchStatus.description && (
            <p className="text-xs text-gray-600 mt-0.5">{branchStatus.description}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default BranchStatusIndicator
