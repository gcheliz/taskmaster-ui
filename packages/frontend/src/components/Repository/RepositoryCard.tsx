import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Card, CardContent } from '../ui/molecules/Card';
import { Badge } from '../ui/atoms/Badge';
import { Button } from '../ui/atoms/Button';
import { Spinner } from '../ui/atoms/Spinner';
import {
  useRepositoryHealth,
  useRepositoryStatistics,
  useRepositoryIntegrations,
  useRepositoryRealtime,
} from '../../hooks/useRepositoryData';
import type {
  RepositoryHealthMetrics,
  RepositoryStatistics,
  RepositoryIntegrationStatus,
} from '../../services/repositoryService';
import type { RepositoryMetadataData } from './RepositoryMetadata';

export interface RepositoryCardData {
  id: string;
  description?: string;
  url?: string;
  starCount?: number;
  forkCount?: number;
  language?: string;
  isPrivate?: boolean;
  size?: number; // in KB
}

export interface RepositoryCardProps {
  /** Repository metadata */
  repository: RepositoryMetadataData & RepositoryCardData;
  /** Card size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show detailed statistics */
  showDetails?: boolean;
  /** Whether to show health metrics */
  showHealth?: boolean;
  /** Whether to show integration status */
  showIntegrations?: boolean;
  /** Whether to enable real-time updates */
  enableRealtime?: boolean;
  /** Click handler for repository selection */
  onClick?: (repository: RepositoryCardProps['repository']) => void;
  /** Action handlers */
  onRefresh?: (repositoryId: string) => void;
  onViewDetails?: (repositoryId: string) => void;
  onViewCommits?: (repositoryId: string) => void;
  onManage?: (repositoryId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

export interface RepositoryCardEnhancedData {
  id: string;
  name: string;
  description?: string;
  path: string;
  currentBranch: string;
  lastCommit: {
    hash: string;
    date: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
  };
  status: {
    isClean: boolean;
    staged: number;
    unstaged: number;
    untracked: number;
    conflicted: number;
    ahead?: number;
    behind?: number;
  };
  url?: string;
  starCount?: number;
  forkCount?: number;
  language?: string;
  isPrivate?: boolean;
  size?: number;
  health?: RepositoryHealthMetrics;
  statistics?: RepositoryStatistics;
  integrations?: RepositoryIntegrationStatus;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repository,
  size = 'md',
  showDetails = false,
  showHealth = false,
  showIntegrations = false,
  enableRealtime = false,
  onClick,
  onRefresh,
  onViewDetails,
  onViewCommits,
  onManage,
  className,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Conditionally fetch enhanced data based on props
  const { health, isLoading: healthLoading } = useRepositoryHealth({
    repositoryId: repository.id,
    autoFetch: showHealth,
  });

  const { statistics, isLoading: statsLoading } = useRepositoryStatistics({
    repositoryId: repository.id,
    autoFetch: showDetails,
  });

  const { integrations, isLoading: integrationsLoading } =
    useRepositoryIntegrations({
      repositoryId: repository.id,
      autoFetch: showIntegrations,
    });

  const { isConnected, latestUpdate } = useRepositoryRealtime({
    repositoryId: repository.id,
    autoWatch: enableRealtime,
    onUpdate: data => {
      // Handle real-time updates
      console.log('Repository update:', data);
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      onRefresh?.(repository.id);
      // Add a small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsRefreshing(false);
    }
  };

  const getHealthBadgeVariant = (
    score?: number
  ): 'success' | 'warning' | 'error' | 'secondary' => {
    if (!score) return 'secondary';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getBranchStatusVariant = (
    status: typeof repository.status
  ): 'success' | 'warning' | 'error' | 'secondary' => {
    if (!status.isClean) return 'error';
    if (status.ahead && status.ahead > 0) return 'warning';
    if (status.behind && status.behind > 0) return 'warning';
    return 'success';
  };

  const getIntegrationStatusVariant = (
    status?: string
  ): 'success' | 'warning' | 'error' | 'secondary' => {
    switch (status) {
      case 'passing':
      case 'deployed':
        return 'success';
      case 'pending':
      case 'deploying':
        return 'warning';
      case 'failing':
      case 'failed':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const formatSize = (sizeInKB?: number): string => {
    if (!sizeInKB) return 'Unknown';
    if (sizeInKB < 1024) return `${sizeInKB} KB`;
    if (sizeInKB < 1024 * 1024) return `${(sizeInKB / 1024).toFixed(1)} MB`;
    return `${(sizeInKB / (1024 * 1024)).toFixed(1)} GB`;
  };

  const formatLastCommitDate = (date: string): string => {
    const commitDate = new Date(date);
    const now = new Date();
    const diffInHours =
      (now.getTime() - commitDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}d ago`;
    if (diffInHours < 24 * 30)
      return `${Math.floor(diffInHours / (24 * 7))}w ago`;
    return commitDate.toLocaleDateString();
  };

  const cardSizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <Card
      className={cn(
        'relative group hover:shadow-lg transition-all duration-300',
        'bg-white/80 backdrop-blur-xl border border-white/20',
        'hover:bg-white/90 hover:border-white/30',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={() => onClick?.(repository)}
    >
      <CardContent className={cn(cardSizeClasses[size], 'space-y-4')}>
        {/* Real-time connection indicator */}
        {enableRealtime && (
          <div className="absolute top-3 right-3">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-gray-400'
              )}
              title={
                isConnected ? 'Real-time connected' : 'Real-time disconnected'
              }
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {repository.name}
              </h3>
              {repository.isPrivate && (
                <Badge variant="secondary" size="sm">
                  Private
                </Badge>
              )}
              {showHealth && health && (
                <Badge
                  variant={getHealthBadgeVariant(health.score)}
                  size="sm"
                  title={`Health Score: ${health.score}/100`}
                >
                  {health.score}
                </Badge>
              )}
            </div>

            {repository.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {repository.description}
              </p>
            )}

            {/* Repository Stats Row */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              {repository.language && (
                <span className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-1"
                    style={{
                      backgroundColor: getLanguageColor(repository.language),
                    }}
                  />
                  {repository.language}
                </span>
              )}
              {repository.starCount !== undefined && (
                <span className="flex items-center">
                  <StarIcon className="w-4 h-4 mr-1" />
                  {repository.starCount}
                </span>
              )}
              {repository.forkCount !== undefined && (
                <span className="flex items-center">
                  <ForkIcon className="w-4 h-4 mr-1" />
                  {repository.forkCount}
                </span>
              )}
              {repository.size && <span>{formatSize(repository.size)}</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                handleRefresh();
              }}
              disabled={isRefreshing}
              title="Refresh repository data"
            >
              {isRefreshing ? (
                <Spinner size="sm" />
              ) : (
                <RefreshIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Branch Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              <BranchIcon className="w-4 h-4 inline mr-1" />
              {repository.currentBranch}
            </span>
            <Badge
              variant={getBranchStatusVariant(repository.status)}
              size="sm"
            >
              {repository.status.isClean ? 'Clean' : 'Modified'}
              {repository.status.ahead ? ` +${repository.status.ahead}` : ''}
              {repository.status.behind ? ` -${repository.status.behind}` : ''}
            </Badge>
          </div>

          <span className="text-xs text-gray-500">
            {formatLastCommitDate(repository.lastCommit.date)}
          </span>
        </div>

        {/* Last Commit */}
        <div className="bg-gray-50/50 rounded-lg p-3">
          <p className="text-sm text-gray-900 mb-1 truncate">
            {repository.lastCommit.message}
          </p>
          <p className="text-xs text-gray-500">
            by {repository.lastCommit.author.name} •{' '}
            {repository.lastCommit.hash.substring(0, 7)}
          </p>
        </div>

        {/* Enhanced Statistics */}
        {showDetails && statistics && !statsLoading && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {statistics.commits.total}
              </div>
              <div className="text-xs text-gray-500">Total Commits</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {statistics.contributors.total}
              </div>
              <div className="text-xs text-gray-500">Contributors</div>
            </div>
          </div>
        )}

        {/* Integration Status */}
        {showIntegrations && integrations && !integrationsLoading && (
          <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
            {integrations.ci.status !== 'unknown' && (
              <Badge
                variant={getIntegrationStatusVariant(integrations.ci.status)}
                size="sm"
                title={`CI: ${integrations.ci.status}`}
              >
                CI
              </Badge>
            )}
            {integrations.deployment.status !== 'unknown' && (
              <Badge
                variant={getIntegrationStatusVariant(
                  integrations.deployment.status
                )}
                size="sm"
                title={`Deploy: ${integrations.deployment.status}`}
              >
                Deploy
              </Badge>
            )}
            {integrations.security.vulnerabilities !== null && (
              <Badge
                variant={
                  integrations.security.vulnerabilities === 0
                    ? 'success'
                    : 'error'
                }
                size="sm"
                title={`Security: ${integrations.security.vulnerabilities} vulnerabilities`}
              >
                Security
              </Badge>
            )}
          </div>
        )}

        {/* Loading States */}
        {(healthLoading || statsLoading || integrationsLoading) && (
          <div className="flex items-center justify-center py-4">
            <Spinner size="sm" />
            <span className="ml-2 text-sm text-gray-500">Loading...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              onViewDetails?.(repository.id);
            }}
          >
            Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              onViewCommits?.(repository.id);
            }}
          >
            Commits
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              onManage?.(repository.id);
            }}
          >
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get language color
function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    typescript: '#3178c6',
    javascript: '#f1e05a',
    python: '#3572a5',
    java: '#b07219',
    'c++': '#f34b7d',
    'c#': '#239120',
    go: '#00add8',
    rust: '#dea584',
    php: '#4f5d95',
    ruby: '#701516',
    swift: '#fa7343',
    kotlin: '#f18e33',
    dart: '#00b4ab',
    html: '#e34c26',
    css: '#1572b6',
    shell: '#89e051',
  };
  return colors[language.toLowerCase()] || '#6b7280';
}

// Simple SVG icons as components
const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ForkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16l-4-4m0 0l4-4m-4 4h18"
    />
  </svg>
);

const BranchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 9l3 3-3 3m5 0h3"
    />
  </svg>
);

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

export default RepositoryCard;
