import React from 'react';
import './RepositoryMetadata.css';

export interface CommitInfo {
  hash: string;
  date: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
}

export interface GitStatus {
  isClean: boolean;
  staged: number;
  unstaged: number;
  untracked: number;
  conflicted: number;
  ahead?: number;
  behind?: number;
}

export interface RepositoryMetadataData {
  name: string;
  path: string;
  currentBranch: string;
  lastCommit: CommitInfo;
  status: GitStatus;
}

export interface RepositoryMetadataProps {
  /** Repository metadata to display */
  repository: RepositoryMetadataData;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Additional CSS class name */
  className?: string;
  /** Whether to show the full path or just repository name */
  showFullPath?: boolean;
  /** Whether to show detailed commit information */
  showCommitDetails?: boolean;
  /** Click handler for the repository name/path */
  onRepositoryClick?: () => void;
  /** Click handler for the branch name */
  onBranchClick?: () => void;
}

/**
 * Repository Metadata Component
 * 
 * Displays essential repository information including:
 * - Repository name and path
 * - Current branch
 * - Last commit details (hash, author, message, date)
 * - Working directory status with visual indicator
 */
export const RepositoryMetadata: React.FC<RepositoryMetadataProps> = ({
  repository,
  isLoading = false,
  error = null,
  className = '',
  showFullPath = false,
  showCommitDetails = true,
  onRepositoryClick,
  onBranchClick
}) => {
  if (isLoading) {
    return (
      <div className={`repository-metadata loading ${className}`}>
        <div className="repository-metadata__skeleton">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-branch"></div>
          <div className="skeleton-line skeleton-commit"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`repository-metadata error ${className}`}>
        <div className="repository-metadata__error">
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

  const getStatusIndicator = () => {
    const { status } = repository;
    
    if (status.isClean) {
      return {
        className: 'status-clean',
        icon: '●',
        label: 'Clean',
        title: 'Working directory is clean'
      };
    }

    const totalChanges = status.staged + status.unstaged + status.untracked + status.conflicted;
    
    if (status.conflicted > 0) {
      return {
        className: 'status-conflicted',
        icon: '●',
        label: 'Conflicts',
        title: `${status.conflicted} conflicted file(s)`
      };
    }

    return {
      className: 'status-dirty',
      icon: '●',
      label: `${totalChanges} change${totalChanges === 1 ? '' : 's'}`,
      title: `${status.staged} staged, ${status.unstaged} unstaged, ${status.untracked} untracked`
    };
  };

  const statusIndicator = getStatusIndicator();

  const displayName = showFullPath ? repository.path : repository.name;

  return (
    <div className={`repository-metadata ${className}`}>
      <div className="repository-metadata__header">
        <div className="repository-metadata__name-section">
          <h3 
            className={`repository-name ${onRepositoryClick ? 'clickable' : ''}`}
            onClick={onRepositoryClick}
            title={showFullPath ? repository.name : repository.path}
          >
            📁 {displayName}
          </h3>
          <div 
            className={`status-indicator ${statusIndicator.className}`}
            title={statusIndicator.title}
          >
            <span className="status-icon">{statusIndicator.icon}</span>
            <span className="status-label">{statusIndicator.label}</span>
          </div>
        </div>
      </div>

      <div className="repository-metadata__branch">
        <span className="branch-label">Branch:</span>
        <span 
          className={`branch-name ${onBranchClick ? 'clickable' : ''}`}
          onClick={onBranchClick}
          title="Current branch"
        >
          🌿 {repository.currentBranch}
        </span>
        {(repository.status.ahead || repository.status.behind) && (
          <div className="branch-tracking">
            {repository.status.ahead ? (
              <span className="ahead" title={`${repository.status.ahead} commits ahead`}>
                ↑{repository.status.ahead}
              </span>
            ) : null}
            {repository.status.behind ? (
              <span className="behind" title={`${repository.status.behind} commits behind`}>
                ↓{repository.status.behind}
              </span>
            ) : null}
          </div>
        )}
      </div>

      {showCommitDetails && (
        <div className="repository-metadata__commit">
          <div className="commit-header">
            <span className="commit-hash" title={repository.lastCommit.hash}>
              {formatCommitHash(repository.lastCommit.hash)}
            </span>
            <span className="commit-date">
              {formatDate(repository.lastCommit.date)}
            </span>
          </div>
          <div className="commit-message" title={repository.lastCommit.message}>
            {repository.lastCommit.message}
          </div>
          <div className="commit-author">
            by {repository.lastCommit.author.name}
          </div>
        </div>
      )}

      {!repository.status.isClean && (
        <div className="repository-metadata__changes">
          <div className="changes-summary">
            {repository.status.staged > 0 && (
              <span className="staged" title="Staged files">
                📄 {repository.status.staged}
              </span>
            )}
            {repository.status.unstaged > 0 && (
              <span className="unstaged" title="Unstaged files">
                📝 {repository.status.unstaged}
              </span>
            )}
            {repository.status.untracked > 0 && (
              <span className="untracked" title="Untracked files">
                ❓ {repository.status.untracked}
              </span>
            )}
            {repository.status.conflicted > 0 && (
              <span className="conflicted" title="Conflicted files">
                ⚠️ {repository.status.conflicted}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoryMetadata;