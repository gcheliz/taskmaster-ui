import React from 'react';
import './BranchList.css';

export interface BranchInfo {
  name: string;
  isLocal: boolean;
  isRemote: boolean;
  isCurrent: boolean;
  lastCommit: {
    hash: string;
    date: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
  };
  tracking?: {
    remote: string;
    ahead?: number;
    behind?: number;
  };
}

export interface BranchListProps {
  /** Array of branch information to display */
  branches: BranchInfo[];
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Additional CSS class name */
  className?: string;
  /** Click handler for branch selection */
  onBranchClick?: (branch: BranchInfo) => void;
  /** Click handler for checkout action */
  onCheckoutBranch?: (branchName: string) => void;
  /** Whether to show detailed commit information */
  showCommitDetails?: boolean;
  /** Whether to show tracking information */
  showTrackingInfo?: boolean;
  /** Maximum number of branches to display before pagination */
  maxDisplayCount?: number;
}

/**
 * Branch List Component
 * 
 * Displays a scrollable list of repository branches with:
 * - Visual distinction between local and remote branches
 * - Current branch highlighting
 * - Last commit information
 * - Branch tracking status (ahead/behind)
 * - Interactive checkout functionality
 */
export const BranchList: React.FC<BranchListProps> = ({
  branches,
  isLoading = false,
  error = null,
  className = '',
  onBranchClick,
  onCheckoutBranch,
  showCommitDetails = true,
  showTrackingInfo = true,
  maxDisplayCount = 50
}) => {
  const [displayCount, setDisplayCount] = React.useState(maxDisplayCount);

  if (isLoading) {
    return (
      <div className={`branch-list loading ${className}`}>
        <div className="branch-list__header">
          <h4 className="branch-list__title">Branches</h4>
        </div>
        <div className="branch-list__skeleton">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="branch-item__skeleton">
              <div className="skeleton-line skeleton-branch-name"></div>
              <div className="skeleton-line skeleton-commit-info"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`branch-list error ${className}`}>
        <div className="branch-list__header">
          <h4 className="branch-list__title">Branches</h4>
        </div>
        <div className="branch-list__error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
        </div>
      </div>
    );
  }

  const formatCommitHash = (hash: string, length: number = 7): string => {
    return hash.substring(0, length);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) {
        return 'just now';
      } else if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return dateString;
    }
  };

  const getBranchIcon = (branch: BranchInfo): string => {
    if (branch.isCurrent) {
      return '🌟';
    } else if (branch.isLocal && branch.isRemote) {
      return '🔗';
    } else if (branch.isLocal) {
      return '🌿';
    } else {
      return '☁️';
    }
  };

  const getBranchTypeLabel = (branch: BranchInfo): string => {
    if (branch.isCurrent) {
      return 'Current';
    } else if (branch.isLocal && branch.isRemote) {
      return 'Local + Remote';
    } else if (branch.isLocal) {
      return 'Local';
    } else {
      return 'Remote';
    }
  };

  const handleBranchClick = (branch: BranchInfo) => {
    if (onBranchClick) {
      onBranchClick(branch);
    }
  };

  const handleCheckoutClick = (e: React.MouseEvent, branchName: string) => {
    e.stopPropagation();
    if (onCheckoutBranch) {
      onCheckoutBranch(branchName);
    }
  };

  const displayedBranches = branches.slice(0, displayCount);
  const hasMoreBranches = branches.length > displayCount;

  // Sort branches: current first, then local, then remote
  const sortedBranches = [...displayedBranches].sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (!a.isCurrent && b.isCurrent) return 1;
    if (a.isLocal && !b.isLocal) return -1;
    if (!a.isLocal && b.isLocal) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className={`branch-list ${className}`}>
      <div className="branch-list__header">
        <h4 className="branch-list__title">
          Branches ({branches.length})
        </h4>
        {branches.length > 0 && (
          <div className="branch-list__summary">
            <span className="summary-item">
              🌿 {branches.filter(b => b.isLocal).length} local
            </span>
            <span className="summary-item">
              ☁️ {branches.filter(b => b.isRemote && !b.isLocal).length} remote
            </span>
          </div>
        )}
      </div>

      {branches.length === 0 ? (
        <div className="branch-list__empty">
          <span className="empty-icon">🌿</span>
          <span className="empty-message">No branches found</span>
        </div>
      ) : (
        <>
          <div className="branch-list__content">
            {sortedBranches.map((branch, index) => (
              <div
                key={`${branch.name}-${index}`}
                className={`branch-item ${branch.isCurrent ? 'current' : ''} ${
                  onBranchClick ? 'clickable' : ''
                }`}
                onClick={() => handleBranchClick(branch)}
                title={`${getBranchTypeLabel(branch)} branch: ${branch.name}`}
              >
                <div className="branch-item__header">
                  <div className="branch-info">
                    <span className="branch-icon" title={getBranchTypeLabel(branch)}>
                      {getBranchIcon(branch)}
                    </span>
                    <span className="branch-name">{branch.name}</span>
                    {branch.isCurrent && (
                      <span className="current-indicator" title="Current branch">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <div className="branch-actions">
                    {showTrackingInfo && branch.tracking && (
                      <div className="tracking-info">
                        {branch.tracking.ahead ? (
                          <span 
                            className="ahead" 
                            title={`${branch.tracking.ahead} commits ahead of ${branch.tracking.remote}`}
                          >
                            ↑{branch.tracking.ahead}
                          </span>
                        ) : null}
                        {branch.tracking.behind ? (
                          <span 
                            className="behind" 
                            title={`${branch.tracking.behind} commits behind ${branch.tracking.remote}`}
                          >
                            ↓{branch.tracking.behind}
                          </span>
                        ) : null}
                      </div>
                    )}
                    {!branch.isCurrent && branch.isLocal && onCheckoutBranch && (
                      <button
                        className="checkout-button"
                        onClick={(e) => handleCheckoutClick(e, branch.name)}
                        title={`Checkout branch: ${branch.name}`}
                      >
                        Checkout
                      </button>
                    )}
                  </div>
                </div>

                {showCommitDetails && (
                  <div className="branch-item__commit">
                    <div className="commit-info">
                      <span className="commit-hash" title={branch.lastCommit.hash}>
                        {formatCommitHash(branch.lastCommit.hash)}
                      </span>
                      <span className="commit-date">
                        {formatDate(branch.lastCommit.date)}
                      </span>
                    </div>
                    <div className="commit-message" title={branch.lastCommit.message}>
                      {branch.lastCommit.message}
                    </div>
                    <div className="commit-author">
                      by {branch.lastCommit.author.name}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {hasMoreBranches && (
            <div className="branch-list__pagination">
              <button
                className="load-more-button"
                onClick={() => setDisplayCount(prev => prev + maxDisplayCount)}
              >
                Load {Math.min(maxDisplayCount, branches.length - displayCount)} more branches
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BranchList;