import React from 'react';
import { cn } from '../../utils/cn';
import { Card, CardContent } from '../ui/molecules/Card';
import { Badge } from '../ui/atoms/Badge';
import { Button } from '../ui/atoms/Button';
import type { RepositoryCardProps } from './RepositoryCard';

export interface RepositoryCardCompactProps
  extends Omit<
    RepositoryCardProps,
    'size' | 'showDetails' | 'showHealth' | 'showIntegrations'
  > {
  /** Whether to show minimal information only */
  minimal?: boolean;
}

export const RepositoryCardCompact: React.FC<RepositoryCardCompactProps> = ({
  repository,
  minimal = false,
  enableRealtime = false,
  onClick,
  onViewDetails,
  className,
}) => {
  const getBranchStatusColor = (status: typeof repository.status): string => {
    if (!status.isClean) return 'text-red-500';
    if (status.ahead && status.ahead > 0) return 'text-yellow-500';
    if (status.behind && status.behind > 0) return 'text-yellow-500';
    return 'text-green-500';
  };

  const formatLastCommitDate = (date: string): string => {
    const commitDate = new Date(date);
    const now = new Date();
    const diffInHours =
      (now.getTime() - commitDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}d`;
    return `${Math.floor(diffInHours / (24 * 7))}w`;
  };

  const getLanguageColor = (language: string): string => {
    const colors: Record<string, string> = {
      typescript: '#3178c6',
      javascript: '#f1e05a',
      python: '#3572a5',
      java: '#b07219',
      'c++': '#f34b7d',
      go: '#00add8',
      rust: '#dea584',
      react: '#61dafb',
    };
    return colors[language.toLowerCase()] || '#6b7280';
  };

  return (
    <Card
      className={cn(
        'group hover:shadow-md transition-all duration-200',
        'bg-white/70 backdrop-blur-sm border border-white/20',
        'hover:bg-white/80 hover:border-white/30',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={() => onClick?.(repository)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {repository.name}
              </h4>
              {repository.isPrivate && (
                <Badge variant="secondary" size="sm">
                  Private
                </Badge>
              )}
            </div>

            {!minimal && repository.description && (
              <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                {repository.description}
              </p>
            )}
          </div>

          {/* Real-time indicator */}
          {enableRealtime && (
            <div className="ml-2 flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            </div>
          )}
        </div>

        {/* Repository metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center space-x-2">
            {repository.language && (
              <span className="flex items-center">
                <span
                  className="w-2 h-2 rounded-full mr-1"
                  style={{
                    backgroundColor: getLanguageColor(repository.language),
                  }}
                />
                {repository.language}
              </span>
            )}
            {repository.starCount !== undefined && (
              <span>{repository.starCount} ★</span>
            )}
          </div>
          <span>{formatLastCommitDate(repository.lastCommit.date)}</span>
        </div>

        {/* Branch status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <BranchIcon className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600">
              {repository.currentBranch}
            </span>
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                getBranchStatusColor(repository.status)
              )}
              title={repository.status.isClean ? 'Clean' : 'Modified'}
            />
          </div>

          {!minimal && (
            <Button
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                onViewDetails?.(repository.id);
              }}
              className="text-xs px-2 py-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
            >
              View
            </Button>
          )}
        </div>

        {/* Last commit (only if not minimal) */}
        {!minimal && (
          <div className="bg-gray-50/50 rounded px-2 py-1">
            <p className="text-xs text-gray-700 truncate">
              {repository.lastCommit.message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Simple branch icon
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

export default RepositoryCardCompact;
