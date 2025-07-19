import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Icon, StarFilledIcon, WarningIcon } from '../atoms/Icon';

export interface ProjectHealthData {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'needs-attention';
  lastChecked?: string;
  issues?: string[];
  trends?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: string;
  };
  breakdown?: {
    codeQuality: number;
    testCoverage: number;
    documentation: number;
    performance: number;
  };
}

export interface ProjectHealthIndicatorProps {
  health: ProjectHealthData;
  className?: string;
  showTrends?: boolean;
  showBreakdown?: boolean;
  showIssues?: boolean;
  maxIssues?: number;
}

const ProjectHealthIndicator: React.FC<ProjectHealthIndicatorProps> = ({
  health,
  className = '',
  showTrends = true,
  showBreakdown = true,
  showIssues = true,
  maxIssues = 3,
}) => {
  const getHealthColor = (
    status: string
  ): 'success' | 'primary' | 'warning' | 'error' | 'secondary' => {
    switch (status) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'primary';
      case 'fair':
        return 'warning';
      case 'needs-attention':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const getHealthStatusText = (status: string): string => {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-success-600 dark:text-success-400';
    if (score >= 70) return 'text-primary-600 dark:text-primary-400';
    if (score >= 50) return 'text-warning-600 dark:text-warning-400';
    return 'text-error-600 dark:text-error-400';
  };

  const getProgressBarColor = (score: number): string => {
    if (score >= 90) return 'bg-success-500';
    if (score >= 70) return 'bg-primary-500';
    if (score >= 50) return 'bg-warning-500';
    return 'bg-error-500';
  };

  const formatLastChecked = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const healthColor = getHealthColor(health.status);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Health Score */}
      <Card
        variant="elevated"
        className="hover:shadow-lg transition-all duration-200"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Icon icon={StarFilledIcon} size="md" color={healthColor} />
              <span>Project Health</span>
            </CardTitle>
            {health.lastChecked && (
              <span className="text-xs text-secondary-500 dark:text-secondary-400">
                {formatLastChecked(health.lastChecked)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div
              className={`text-4xl font-bold ${getScoreColor(health.score)}`}
            >
              {Math.round(health.score)}
            </div>
            <div className="text-right">
              <Badge variant={healthColor} size="md" className="mb-2">
                {getHealthStatusText(health.status)}
              </Badge>
              {showTrends && health.trends && (
                <div className="flex items-center space-x-1 text-sm text-secondary-600 dark:text-secondary-400">
                  <span>{getTrendIcon(health.trends.direction)}</span>
                  <span>{health.trends.percentage}%</span>
                  <span className="text-xs">({health.trends.period})</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-secondary-200 dark:bg-surface-700 rounded-full h-3 mb-4">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${getProgressBarColor(health.score)}`}
              style={{ width: `${health.score}%` }}
            />
          </div>

          {/* Health Breakdown */}
          {showBreakdown && health.breakdown && (
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                Health Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(health.breakdown).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-secondary-600 dark:text-secondary-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={`font-medium ${getScoreColor(value)}`}>
                      {value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issues */}
          {showIssues && health.issues && health.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-secondary-900 dark:text-secondary-100 flex items-center space-x-2">
                <Icon icon={WarningIcon} size="sm" color="warning" />
                <span>Issues ({health.issues.length})</span>
              </h4>
              <div className="space-y-1">
                {health.issues.slice(0, maxIssues).map((issue, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-2 text-sm text-secondary-700 dark:text-secondary-300 p-2 bg-warning-50 dark:bg-warning-900/20 rounded-lg"
                  >
                    <span className="text-warning-500 mt-0.5">•</span>
                    <span>{issue}</span>
                  </div>
                ))}
                {health.issues.length > maxIssues && (
                  <div className="text-xs text-secondary-500 dark:text-secondary-400 text-center pt-2">
                    +{health.issues.length - maxIssues} more issues
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Metrics Grid */}
      {showBreakdown && health.breakdown && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(health.breakdown).map(([key, value]) => (
            <Card
              key={key}
              variant="outline"
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold mb-1 ${getScoreColor(value)}`}
                  >
                    {value}%
                  </div>
                  <div className="text-xs text-secondary-600 dark:text-secondary-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="w-full bg-secondary-200 dark:bg-surface-700 rounded-full h-1 mt-2">
                    <div
                      className={`h-1 rounded-full transition-all duration-500 ${getProgressBarColor(value)}`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export { ProjectHealthIndicator };
