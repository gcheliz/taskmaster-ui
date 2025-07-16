import React, { useState } from 'react';
import { RepositoryMetadata } from './RepositoryMetadata';
import { BranchList } from './BranchList';
import { useRepositoryData, useRepositoryActions } from '../../hooks/useRepositoryData';
import './RepositoryDetailsView.css';

export interface RepositoryDetailsViewProps {
  /** Repository ID to display */
  repositoryId: string;
  /** Additional CSS class name */
  className?: string;
  /** Auto-refresh interval in milliseconds (0 to disable) */
  refreshInterval?: number;
  /** Whether to show all features or just basic info */
  mode?: 'basic' | 'full';
  /** Callback when repository is clicked */
  onRepositoryClick?: (repositoryId: string) => void;
  /** Callback when branch is clicked */
  onBranchClick?: (repositoryId: string, branchName: string) => void;
}

/**
 * Repository Details View Component
 * 
 * Combines RepositoryMetadata and BranchList components to provide
 * a comprehensive view of repository information with integrated
 * backend data fetching and Git operations.
 */
export const RepositoryDetailsView: React.FC<RepositoryDetailsViewProps> = ({
  repositoryId,
  className = '',
  refreshInterval = 30000,
  mode = 'full',
  onRepositoryClick,
  onBranchClick
}) => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);

  const {
    metadata,
    branches,
    isLoading,
    error,
    isRefreshing,
    refresh,
    lastFetch
  } = useRepositoryData({
    repositoryId,
    refreshInterval,
    autoFetch: true,
  });

  const {
    checkoutBranch,
    fetchRemote,
    pullFromRemote,
    isActionLoading,
    currentAction
  } = useRepositoryActions({
    repositoryId,
    onSuccess: (message) => addNotification('success', message),
    onError: (error) => addNotification('error', error),
  });

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5

    // Auto-remove notifications after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleRepositoryClick = () => {
    if (onRepositoryClick && metadata) {
      onRepositoryClick(repositoryId);
    }
  };

  const handleBranchClick = (branchName: string) => {
    if (onBranchClick) {
      onBranchClick(repositoryId, branchName);
    }
  };

  const handleCheckoutBranch = async (branchName: string) => {
    await checkoutBranch(branchName);
    // Refresh data after successful checkout
    setTimeout(() => refresh(), 1000);
  };

  const handleRefresh = async () => {
    await refresh();
    addNotification('info', 'Repository data refreshed');
  };

  const handleFetchRemote = async () => {
    await fetchRemote();
    // Refresh data after fetch
    setTimeout(() => refresh(), 1000);
  };

  const handlePullFromRemote = async () => {
    await pullFromRemote();
    // Refresh data after pull
    setTimeout(() => refresh(), 1000);
  };

  const formatLastUpdate = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  if (error && !metadata) {
    return (
      <div className={`repository-details-view error ${className}`}>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h3>Failed to load repository</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={handleRefresh}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`repository-details-view ${className}`}>
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications">
          {notifications.map(notification => (
            <div 
              key={notification.id}
              className={`notification notification--${notification.type}`}
              onClick={() => dismissNotification(notification.id)}
            >
              <span className="notification-message">{notification.message}</span>
              <button className="notification-dismiss">×</button>
            </div>
          ))}
        </div>
      )}

      {/* Header with controls */}
      <div className="repository-details-view__header">
        <div className="header-info">
          {lastFetch && (
            <span className="last-update">
              Last updated: {formatLastUpdate(lastFetch)}
            </span>
          )}
          {isRefreshing && (
            <span className="refresh-indicator">Refreshing...</span>
          )}
          {isActionLoading && currentAction && (
            <span className="action-indicator">{currentAction}...</span>
          )}
        </div>
        
        <div className="header-actions">
          <button
            className="action-button"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            title="Refresh repository data"
          >
            🔄 Refresh
          </button>
          
          {mode === 'full' && (
            <>
              <button
                className="action-button"
                onClick={handleFetchRemote}
                disabled={isActionLoading}
                title="Fetch latest changes from remote"
              >
                📥 Fetch
              </button>
              
              <button
                className="action-button"
                onClick={handlePullFromRemote}
                disabled={isActionLoading}
                title="Pull changes from remote branch"
              >
                ⬇️ Pull
              </button>
            </>
          )}
        </div>
      </div>

      {/* Repository Metadata */}
      {metadata && (
        <RepositoryMetadata
          repository={metadata}
          isLoading={isLoading && !metadata}
          error={error}
          onRepositoryClick={handleRepositoryClick}
          onBranchClick={() => handleBranchClick(metadata.currentBranch)}
          showCommitDetails={true}
          showFullPath={false}
        />
      )}

      {/* Loading state for metadata */}
      {!metadata && isLoading && (
        <RepositoryMetadata
          repository={{
            name: '',
            path: '',
            currentBranch: '',
            lastCommit: {
              hash: '',
              date: '',
              message: '',
              author: { name: '', email: '' }
            },
            status: {
              isClean: true,
              staged: 0,
              unstaged: 0,
              untracked: 0,
              conflicted: 0
            }
          }}
          isLoading={true}
          error={null}
          showCommitDetails={true}
          showFullPath={false}
        />
      )}

      {/* Branch List */}
      {mode === 'full' && (
        <BranchList
          branches={branches}
          isLoading={isLoading && branches.length === 0}
          error={error && branches.length === 0 ? error : null}
          onBranchClick={(branch) => handleBranchClick(branch.name)}
          onCheckoutBranch={handleCheckoutBranch}
          showCommitDetails={true}
          showTrackingInfo={true}
          maxDisplayCount={20}
        />
      )}

      {/* Quick Stats (for basic mode) */}
      {mode === 'basic' && branches.length > 0 && (
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-label">Branches:</span>
            <span className="stat-value">{branches.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Local:</span>
            <span className="stat-value">{branches.filter(b => b.isLocal).length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Remote:</span>
            <span className="stat-value">{branches.filter(b => b.isRemote && !b.isLocal).length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoryDetailsView;