import React, { useState } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import {
  TaskCompletionChart,
  ProgressVisualizationWidget,
  RecentActivityFeedWidget,
} from '../Widgets'

export interface DashboardViewProps {
  projectId: string
  projectTag?: string
  className?: string
}

/**
 * Dashboard View Component
 *
 * Main dashboard container that displays project metrics, charts, and insights.
 * Provides a comprehensive overview of project health and progress.
 */
export const DashboardView = ({
  projectId,
  projectTag,
  className = '',
}: DashboardViewProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'activity'>('overview')
  const [refreshing, setRefreshing] = useState(false)

  // Hook for dashboard data
  const { data, loading, error, lastUpdated, isStale, refresh } = useDashboard({
    projectId,
    projectTag,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }

  // Format dates
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-sm text-red-700">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // No data state
  if (!data) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600 mb-4">No dashboard data found for this project.</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Project: {data.project.name || projectId}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors ${refreshing ? 'animate-spin' : ''}`}
            title="Refresh Dashboard"
          >
            {refreshing ? '🔄' : '↻'}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg mb-6 text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 font-medium">Last Updated:</span>
          <span className="text-gray-900">
            {lastUpdated ? formatTime(lastUpdated.toISOString()) : 'Never'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 font-medium">Project Updated:</span>
          <span className="text-gray-900">{formatDate(data.project.lastUpdated)}</span>
        </div>
        {isStale && (
          <div className="flex items-center space-x-2 text-amber-600">
            <span className="font-medium">Data Status:</span>
            <span>Stale</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'activity' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setActiveTab('activity')}
        >
          🔔 Activity
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Total Tasks</h3>
                  <div className="text-2xl">📋</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {data.taskMetrics.total}
                </div>
                <div className="text-sm text-gray-500">
                  {data.taskMetrics.pending} pending, {data.taskMetrics.inProgress} in progress
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Completed</h3>
                  <div className="text-2xl">✅</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {data.taskMetrics.completed}
                </div>
                <div className="text-sm text-gray-500">
                  {((data.taskMetrics.completed / data.taskMetrics.total) * 100).toFixed(1)}%
                  completion rate
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Avg Time</h3>
                  <div className="text-2xl">⏱️</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {data.insights?.totalEstimatedHours || '0'}h
                </div>
                <div className="text-sm text-gray-500">Total estimated hours</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Productivity</h3>
                  <div className="text-2xl">🎯</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {data.insights?.productivityScore || '0'}%
                </div>
                <div className="text-sm text-gray-500">Overall productivity score</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion</h3>
                <TaskCompletionChart data={data.taskMetrics} />
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
                <ProgressVisualizationWidget data={data.chartData.taskCompletionTrend} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h3>
              <p className="text-gray-600">Advanced analytics features coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <RecentActivityFeedWidget activities={data.recentActivity} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardView
