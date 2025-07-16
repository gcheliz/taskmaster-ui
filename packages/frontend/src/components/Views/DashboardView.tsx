import React, { useState } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { TaskCompletionChart } from '../Widgets';
import './DashboardView.css';

export interface DashboardViewProps {
  projectId: string;
  projectTag?: string;
  className?: string;
}

/**
 * Dashboard View Component
 * 
 * Main dashboard container that displays project metrics, charts, and insights.
 * Provides a comprehensive overview of project health and progress.
 */
export const DashboardView: React.FC<DashboardViewProps> = ({
  projectId,
  projectTag,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'activity'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const {
    data,
    health,
    loading,
    error,
    lastUpdated,
    refresh,
    clearError,
    isStale,
    retryCount
  } = useDashboard({
    projectId,
    projectTag,
    refreshInterval: 30000,
    autoRefresh: true,
    onError: (error) => {
      console.error('Dashboard error:', error);
    },
    onDataUpdate: (data) => {
      console.log('Dashboard data updated:', data);
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#22c55e';
      case 'good': return '#3b82f6';
      case 'fair': return '#f59e0b';
      case 'needs-attention': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return '#22c55e';
      case 'in-progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'blocked': return '#ef4444';
      case 'deferred': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString();
  };

  if (loading && !data) {
    return (
      <div className={`dashboard-view loading ${className}`}>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <h3>Loading Dashboard...</h3>
          <p>Fetching project data and metrics</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={`dashboard-view error ${className}`}>
        <div className="dashboard-error">
          <div className="error-icon">⚠️</div>
          <h3>Dashboard Error</h3>
          <p>{error.message}</p>
          <div className="error-actions">
            <button onClick={clearError} className="error-button">
              Clear Error
            </button>
            <button onClick={handleRefresh} className="error-button primary">
              Retry {retryCount > 0 && `(${retryCount})`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`dashboard-view empty ${className}`}>
        <div className="dashboard-empty">
          <div className="empty-icon">📊</div>
          <h3>No Dashboard Data</h3>
          <p>Unable to load dashboard data for this project.</p>
          <button onClick={handleRefresh} className="empty-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-view ${className}`}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-info">
          <h1>Project Dashboard</h1>
          <div className="project-info">
            <span className="project-name">{data.project.name}</span>
            <span className="project-path">{data.project.path}</span>
          </div>
        </div>
        <div className="header-actions">
          <div className="health-indicator">
            {health && (
              <div className="health-badge" style={{ backgroundColor: getHealthColor(health.status) }}>
                <span className="health-score">{Math.round(health.score)}</span>
                <span className="health-label">Health</span>
              </div>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
            title="Refresh Dashboard"
          >
            {refreshing ? '🔄' : '↻'}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="dashboard-status">
        <div className="status-item">
          <span className="status-label">Last Updated:</span>
          <span className="status-value">
            {lastUpdated ? formatTime(lastUpdated.toISOString()) : 'Never'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Project Updated:</span>
          <span className="status-value">
            {formatDate(data.project.lastUpdated)}
          </span>
        </div>
        {isStale && (
          <div className="status-item warning">
            <span className="status-label">Data Status:</span>
            <span className="status-value">Stale</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
        <button
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          🔔 Activity
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            {/* Metrics Cards */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <h3>Total Tasks</h3>
                  <div className="metric-icon">📋</div>
                </div>
                <div className="metric-value">{data.taskMetrics.total}</div>
                <div className="metric-detail">
                  {data.taskMetrics.completed} completed
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h3>Completion Rate</h3>
                  <div className="metric-icon">✅</div>
                </div>
                <div className="metric-value">
                  {formatPercentage(data.taskMetrics.completionRate)}
                </div>
                <div className="metric-detail">
                  {data.taskMetrics.inProgress} in progress
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h3>Estimated Hours</h3>
                  <div className="metric-icon">⏱️</div>
                </div>
                <div className="metric-value">{data.insights.totalEstimatedHours}h</div>
                <div className="metric-detail">
                  Avg complexity: {data.insights.averageTaskComplexity.toFixed(1)}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h3>Productivity Score</h3>
                  <div className="metric-icon">🎯</div>
                </div>
                <div className="metric-value">
                  {formatPercentage(data.insights.productivityScore)}
                </div>
                <div className="metric-detail">
                  {data.taskMetrics.blocked} blocked tasks
                </div>
              </div>
            </div>

            {/* Task Completion Chart Widget */}
            <div className="chart-widget-container">
              <TaskCompletionChart
                data={{
                  total: data.taskMetrics.total,
                  completed: data.taskMetrics.completed,
                  inProgress: data.taskMetrics.inProgress,
                  pending: data.taskMetrics.pending,
                  blocked: data.taskMetrics.blocked,
                  deferred: data.taskMetrics.deferred
                }}
                chartType="donut"
                showLegend={true}
                showTooltip={true}
                width={400}
                height={300}
              />
            </div>

            {/* Status Breakdown */}
            <div className="status-breakdown">
              <h3>Task Status Distribution</h3>
              <div className="status-bars">
                {Object.entries(data.taskMetrics.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="status-bar">
                    <div className="status-label">
                      <span className="status-name" style={{ color: getStatusColor(status) }}>
                        {status.replace('-', ' ')}
                      </span>
                      <span className="status-count">{count}</span>
                    </div>
                    <div className="status-progress">
                      <div
                        className="status-fill"
                        style={{
                          width: `${(count / data.taskMetrics.total) * 100}%`,
                          backgroundColor: getStatusColor(status)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {data.insights.recommendations.length > 0 && (
              <div className="recommendations">
                <h3>Recommendations</h3>
                <div className="recommendations-list">
                  {data.insights.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <div className="recommendation-icon">💡</div>
                      <div className="recommendation-text">{rec}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-content">
            {/* Priority Distribution */}
            <div className="chart-section">
              <h3>Priority Distribution</h3>
              <div className="priority-chart">
                {data.chartData.priorityDistribution.map((item) => (
                  <div key={item.priority} className="priority-item">
                    <div className="priority-label">{item.priority}</div>
                    <div className="priority-bar">
                      <div
                        className="priority-fill"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.priority === 'high' ? '#ef4444' : 
                                         item.priority === 'medium' ? '#f59e0b' : '#22c55e'
                        }}
                      />
                    </div>
                    <div className="priority-count">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complexity Breakdown */}
            <div className="chart-section">
              <h3>Complexity Breakdown</h3>
              <div className="complexity-chart">
                {data.chartData.complexityBreakdown.map((item) => (
                  <div key={item.complexity} className="complexity-item">
                    <div className="complexity-label">{item.complexity}</div>
                    <div className="complexity-bar">
                      <div
                        className="complexity-fill"
                        style={{
                          width: `${(item.count / data.taskMetrics.total) * 100}%`,
                          backgroundColor: item.complexity === 'high' ? '#ef4444' : 
                                         item.complexity === 'medium' ? '#f59e0b' : '#22c55e'
                        }}
                      />
                    </div>
                    <div className="complexity-stats">
                      <span className="complexity-count">{item.count}</span>
                      <span className="complexity-time">~{item.averageTime}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtask Metrics */}
            <div className="chart-section">
              <h3>Subtask Progress</h3>
              <div className="subtask-metrics">
                <div className="subtask-overview">
                  <div className="subtask-stat">
                    <span className="subtask-label">Total Subtasks:</span>
                    <span className="subtask-value">{data.subtaskMetrics.total}</span>
                  </div>
                  <div className="subtask-stat">
                    <span className="subtask-label">Completed:</span>
                    <span className="subtask-value">{data.subtaskMetrics.completed}</span>
                  </div>
                  <div className="subtask-stat">
                    <span className="subtask-label">Completion Rate:</span>
                    <span className="subtask-value">
                      {formatPercentage(data.subtaskMetrics.completionRate)}
                    </span>
                  </div>
                </div>
                <div className="subtask-progress">
                  <div
                    className="subtask-fill"
                    style={{
                      width: `${data.subtaskMetrics.completionRate}%`,
                      backgroundColor: '#3b82f6'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-content">
            <h3>Recent Activity</h3>
            {data.recentActivity.length === 0 ? (
              <div className="no-activity">
                <div className="no-activity-icon">📝</div>
                <p>No recent activity to display</p>
              </div>
            ) : (
              <div className="activity-feed">
                {data.recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'commit' ? '💾' : 
                       activity.type === 'task_update' ? '✅' : '🔄'}
                    </div>
                    <div className="activity-content">
                      <div className="activity-message">{activity.message}</div>
                      <div className="activity-meta">
                        <span className="activity-time">
                          {formatTime(activity.timestamp)}
                        </span>
                        {activity.author && (
                          <span className="activity-author">by {activity.author}</span>
                        )}
                        <span className="activity-type">{activity.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;