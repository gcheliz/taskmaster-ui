import React, { useState } from 'react';
import {
  StatisticsGrid,
  type TaskMetrics,
  type ProjectInsights,
} from '../molecules/StatisticsGrid';
import {
  ProjectHealthIndicator,
  type ProjectHealthData,
} from '../molecules/ProjectHealthIndicator';
import { Card, CardHeader, CardTitle, CardContent } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import {
  Icon,
  TaskIcon,
  TimeIcon,
  CompleteIcon,
  WarningIcon,
} from '../atoms/Icon';

export interface ResponsiveStatsGridProps {
  taskMetrics: TaskMetrics;
  insights: ProjectInsights;
  health?: ProjectHealthData;
  className?: string;
  showHealthDetails?: boolean;
  showTaskBreakdown?: boolean;
  onRefresh?: () => void;
  loading?: boolean;
  lastUpdated?: Date;
}

const ResponsiveStatsGrid: React.FC<ResponsiveStatsGridProps> = ({
  taskMetrics,
  insights,
  health,
  className = '',
  showHealthDetails = true,
  showTaskBreakdown = true,
  onRefresh,
  loading = false,
  lastUpdated,
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'detailed'>(
    'overview'
  );

  const formatLastUpdated = (date: Date): string => {
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'done':
        return '#22c55e';
      case 'in-progress':
        return '#3b82f6';
      case 'pending':
        return '#f59e0b';
      case 'blocked':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string): string => {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            Project Statistics
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400">
            {lastUpdated && `Last updated ${formatLastUpdated(lastUpdated)}`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Button
              variant={activeView === 'overview' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveView('overview')}
            >
              Overview
            </Button>
            <Button
              variant={activeView === 'detailed' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveView('detailed')}
            >
              Detailed
            </Button>
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          )}
        </div>
      </div>

      {/* Overview Mode */}
      {activeView === 'overview' && (
        <div className="space-y-8">
          {/* Main Statistics Grid */}
          <StatisticsGrid
            taskMetrics={taskMetrics}
            insights={insights}
            health={health}
            showHealthIndicator={true}
            showProgressBars={true}
          />

          {/* Task Status Breakdown */}
          {showTaskBreakdown && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon icon={TaskIcon} size="md" color="primary" />
                  <span>Task Status Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(taskMetrics.statusBreakdown).map(
                    ([status, count]) => (
                      <div key={status} className="flex items-center space-x-4">
                        <div className="w-24 text-sm font-medium text-secondary-900 dark:text-secondary-100">
                          {getStatusLabel(status)}
                        </div>
                        <div className="flex-1 bg-secondary-200 dark:bg-surface-700 rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${(count / taskMetrics.total) * 100}%`,
                              backgroundColor: getStatusColor(status),
                            }}
                          />
                        </div>
                        <div className="w-16 text-sm font-semibold text-secondary-900 dark:text-secondary-100 text-right">
                          {count}
                        </div>
                        <div className="w-16 text-xs text-secondary-600 dark:text-secondary-400 text-right">
                          {Math.round((count / taskMetrics.total) * 100)}%
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="outline">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon icon={CompleteIcon} size="md" color="success" />
                  <span>Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success-600 dark:text-success-400 mb-2">
                  {Math.round(taskMetrics.completionRate)}%
                </div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  {taskMetrics.completed} of {taskMetrics.total} tasks completed
                </p>
              </CardContent>
            </Card>

            <Card variant="outline">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon icon={TimeIcon} size="md" color="warning" />
                  <span>Velocity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning-600 dark:text-warning-400 mb-2">
                  {insights.productivityScore}%
                </div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Current productivity score
                </p>
              </CardContent>
            </Card>

            <Card variant="outline">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon icon={WarningIcon} size="md" color="error" />
                  <span>Blockers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-error-600 dark:text-error-400 mb-2">
                  {taskMetrics.blocked}
                </div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Tasks requiring attention
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Detailed Mode */}
      {activeView === 'detailed' && (
        <div className="space-y-8">
          {/* Detailed Statistics Grid */}
          <StatisticsGrid
            taskMetrics={taskMetrics}
            insights={insights}
            health={health}
            showHealthIndicator={false}
            showProgressBars={true}
          />

          {/* Project Health Details */}
          {showHealthDetails && health && (
            <ProjectHealthIndicator
              health={health}
              showTrends={true}
              showBreakdown={true}
              showIssues={true}
              maxIssues={5}
            />
          )}

          {/* Detailed Task Breakdown */}
          {showTaskBreakdown && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Task Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(taskMetrics.statusBreakdown).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: getStatusColor(status),
                              }}
                            />
                            <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                              {getStatusLabel(status)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                              {count}
                            </span>
                            <Badge variant="secondary" size="sm">
                              {Math.round((count / taskMetrics.total) * 100)}%
                            </Badge>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                        Average Complexity
                      </span>
                      <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                        {insights.averageTaskComplexity.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                        Estimated Hours
                      </span>
                      <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                        {insights.totalEstimatedHours}h
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                        Productivity Score
                      </span>
                      <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                        {insights.productivityScore}%
                      </span>
                    </div>
                    {health && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                          Health Score
                        </span>
                        <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                          {Math.round(health.score)}%
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { ResponsiveStatsGrid };
