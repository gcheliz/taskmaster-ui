import React, { useState } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent
} from '../ui/atoms/Card';
import { Button } from '../ui/atoms/Button';
import { Badge } from '../ui/atoms/Badge';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '../ui/molecules/Tabs';
import { 
  Icon,
  HomeFilledIcon,
  TaskIcon,
  CompleteIcon,
  WarningIcon,
  StarFilledIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  TimeIcon,
  NotificationIcon,
  SettingsIcon,
  DuplicateIcon,
  ArchiveIcon,
  PlusIcon
} from '../ui/atoms/Icon';
import { Spinner } from '../ui/atoms/Spinner';
import { 
  Breadcrumb, 
  BreadcrumbLink, 
  BreadcrumbSeparator 
} from '../ui/atoms/BreadcrumbLink';
import { ActivityTimeline } from '../ui/organisms/ActivityTimeline';
import { QuickActionsGrid } from '../ui/organisms/QuickActionsGrid';
import type { QuickAction } from '../ui/organisms/QuickActionsGrid';

export interface ModernDashboardViewProps {
  projectId: string;
  projectTag?: string;
  className?: string;
}

interface WelcomeHeaderProps {
  projectName: string;
  projectPath: string;
  lastUpdated: string;
  userAvatar?: string;
  userName?: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  projectName,
  projectPath,
  lastUpdated,
  userAvatar,
  userName = 'User'
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="mb-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-4">
        <BreadcrumbLink href="/" icon={HomeFilledIcon}>
          Home
        </BreadcrumbLink>
        <BreadcrumbSeparator />
        <BreadcrumbLink href="/projects" icon={TaskIcon}>
          Projects
        </BreadcrumbLink>
        <BreadcrumbSeparator />
        <BreadcrumbLink href="#" isCurrent>
          {projectName}
        </BreadcrumbLink>
      </Breadcrumb>

      {/* Welcome Header */}
      <Card variant="default" className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="w-12 h-12 rounded-full border-2 border-primary-200 dark:border-primary-700"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <Icon icon={UserCircleIcon} size="lg" color="primary" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  Welcome back, {userName}!
                </h1>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Here's what's happening with your project
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Last updated
                </p>
                <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                  {formatTime(lastUpdated)}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Icon icon={SettingsIcon} size="sm" className="mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon icon={TaskIcon} size="sm" color="primary" />
              <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                {projectName}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon icon={CalendarDaysIcon} size="sm" color="muted" />
              <span className="text-sm text-secondary-600 dark:text-secondary-400 font-mono">
                {projectPath}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface StatisticsGridProps {
  taskMetrics: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    blocked: number;
    completionRate: number;
  };
  insights: {
    totalEstimatedHours: number;
    averageTaskComplexity: number;
    productivityScore: number;
  };
  health?: {
    score: number;
    status: string;
  };
}

const StatisticsGrid: React.FC<StatisticsGridProps> = ({
  taskMetrics,
  insights,
  health
}) => {
  const getHealthColor = (status: string) => {
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

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Tasks */}
      <Card variant="elevated" className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
              Total Tasks
            </CardTitle>
            <Icon icon={TaskIcon} size="lg" color="primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            {taskMetrics.total}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="success" size="sm">
              {taskMetrics.completed} completed
            </Badge>
            <Badge variant="secondary" size="sm">
              {taskMetrics.inProgress} active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card variant="elevated" className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
              Completion Rate
            </CardTitle>
            <Icon icon={CompleteIcon} size="lg" color="success" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            {formatPercentage(taskMetrics.completionRate)}
          </div>
          <div className="w-full bg-secondary-200 dark:bg-surface-700 rounded-full h-2 mb-2">
            <div 
              className="bg-success-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${taskMetrics.completionRate}%` }}
            />
          </div>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            {taskMetrics.pending} pending tasks
          </p>
        </CardContent>
      </Card>

      {/* Estimated Hours */}
      <Card variant="elevated" className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
              Estimated Hours
            </CardTitle>
            <Icon icon={TimeIcon} size="lg" color="warning" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            {insights.totalEstimatedHours}h
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="warning" size="sm">
              Avg: {insights.averageTaskComplexity.toFixed(1)}
            </Badge>
            <Badge variant="secondary" size="sm">
              {taskMetrics.blocked} blocked
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Project Health */}
      <Card variant="elevated" className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
              Project Health
            </CardTitle>
            <Icon icon={StarFilledIcon} size="lg" color={health ? getHealthColor(health.status) as any : 'muted'} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            {health ? Math.round(health.score) : '--'}
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={health ? getHealthColor(health.status) as any : 'secondary'} 
              size="sm"
            >
              {health ? health.status.replace('-', ' ') : 'Unknown'}
            </Badge>
            <Badge variant="default" size="sm">
              Score: {formatPercentage(insights.productivityScore)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


/**
 * Modern Dashboard View Component
 * 
 * A comprehensive dashboard built with the new dark theme atomic components,
 * featuring responsive design, interactive widgets, and enhanced user experience.
 */
export const ModernDashboardView: React.FC<ModernDashboardViewProps> = ({
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

  const handleCreateTask = () => {
    // TODO: Implement create task functionality
    console.log('Create task action triggered');
    // Navigate to task creation page or open modal
  };

  const handleViewReports = () => {
    // TODO: Implement view reports functionality
    console.log('View reports action triggered');
    // Navigate to reports dashboard
  };

  const handleManageTeam = () => {
    // TODO: Implement manage team functionality
    console.log('Manage team action triggered');
    // Navigate to team management page
  };

  const handleExportData = () => {
    // TODO: Implement export data functionality
    console.log('Export data action triggered');
    // Trigger export process
  };

  const handleAddMember = () => {
    // TODO: Implement add member functionality
    console.log('Add member action triggered');
    // Open add member modal
  };

  const handleProjectSettings = () => {
    // TODO: Implement project settings functionality
    console.log('Project settings action triggered');
    // Navigate to project settings page
  };

  // const handleArchiveProject = () => {
  //   // TODO: Implement archive project functionality
  //   console.log('Archive project action triggered');
  //   // Show confirmation dialog and archive
  // };

  // Define quick actions with proper handlers
  const quickActions: QuickAction[] = [
    {
      id: 'create-task',
      title: 'Create Task',
      description: 'Add a new task to your project',
      icon: TaskIcon,
      iconColor: 'primary',
      variant: 'primary',
      shortcut: 'Ctrl+N',
      category: 'task',
      onClick: handleCreateTask
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Access project analytics and reports',
      icon: NotificationIcon,
      iconColor: 'success',
      variant: 'outline',
      shortcut: 'Ctrl+R',
      category: 'project',
      onClick: handleViewReports
    },
    {
      id: 'manage-team',
      title: 'Manage Team',
      description: 'Add or remove team members',
      icon: UserCircleIcon,
      iconColor: 'warning',
      variant: 'outline',
      badge: {
        text: 'Admin',
        variant: 'warning'
      },
      shortcut: 'Ctrl+T',
      category: 'team',
      onClick: handleManageTeam
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download project data in various formats',
      icon: DuplicateIcon,
      iconColor: 'secondary',
      variant: 'outline',
      shortcut: 'Ctrl+E',
      category: 'system',
      onClick: handleExportData
    },
    {
      id: 'add-member',
      title: 'Add Member',
      description: 'Invite new team members to the project',
      icon: PlusIcon,
      iconColor: 'success',
      variant: 'outline',
      category: 'team',
      onClick: handleAddMember
    },
    {
      id: 'project-settings',
      title: 'Project Settings',
      description: 'Configure project preferences and settings',
      icon: SettingsIcon,
      iconColor: 'muted',
      variant: 'outline',
      category: 'system',
      onClick: handleProjectSettings
    }
  ];

  // Loading State
  if (loading && !data) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 ${className}`}>
        <Card variant="elevated" className="w-96">
          <CardContent className="text-center py-12">
            <Spinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
              Loading Dashboard
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400">
              Fetching your project data and insights...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State
  if (error && !data) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 ${className}`}>
        <Card variant="elevated" className="w-96">
          <CardContent className="text-center py-12">
            <Icon icon={WarningIcon} size="2xl" color="error" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-error-600 dark:text-error-400 mb-2">
              Dashboard Error
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              {error.message}
            </p>
            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={clearError}>
                Clear Error
              </Button>
              <Button variant="primary" onClick={handleRefresh}>
                Retry {retryCount > 0 && `(${retryCount})`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty State
  if (!data) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 ${className}`}>
        <Card variant="elevated" className="w-96">
          <CardContent className="text-center py-12">
            <Icon icon={ArchiveIcon} size="2xl" color="muted" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
              No Dashboard Data
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              Unable to load dashboard data for this project.
            </p>
            <Button variant="primary" onClick={handleRefresh}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-surface-50 dark:bg-surface-950 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <WelcomeHeader
          projectName={data.project.name}
          projectPath={data.project.path}
          lastUpdated={lastUpdated?.toISOString() || data.project.lastUpdated}
          userName="TaskMaster User"
        />

        {/* Statistics Grid */}
        <StatisticsGrid
          taskMetrics={data.taskMetrics}
          insights={data.insights}
          health={health || undefined}
        />

        {/* Quick Actions Grid */}
        <QuickActionsGrid
          actions={quickActions}
          title="Quick Actions"
          description="Perform common tasks quickly and efficiently"
          columns={4}
          showCategories={false}
          className="mb-8"
        />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Icon icon={TaskIcon} size="md" color="primary" />
                  <span>Project Analytics</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {isStale && (
                    <Badge variant="warning" size="sm">
                      Data Stale
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? (
                      <Spinner size="sm" className="mr-2" />
                    ) : (
                      <Icon icon={DuplicateIcon} size="sm" className="mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TabsList className="mb-6">
                <TabsTrigger value="overview" icon={HomeFilledIcon}>
                  Overview
                </TabsTrigger>
                <TabsTrigger value="analytics" icon={NotificationIcon}>
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="activity" icon={TimeIcon} badge={data.recentActivity?.length || 0}>
                  Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                  {/* Task Status Distribution */}
                  <Card variant="outline">
                    <CardHeader>
                      <CardTitle>Task Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(data.taskMetrics.statusBreakdown).map(([status, count]) => (
                          <div key={status} className="flex items-center space-x-4">
                            <div className="w-20 text-sm font-medium text-secondary-900 dark:text-secondary-100 capitalize">
                              {status.replace('-', ' ')}
                            </div>
                            <div className="flex-1 bg-secondary-200 dark:bg-surface-700 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${(count / data.taskMetrics.total) * 100}%`,
                                  backgroundColor: status === 'done' ? '#22c55e' : 
                                                 status === 'in-progress' ? '#3b82f6' :
                                                 status === 'pending' ? '#f59e0b' :
                                                 status === 'blocked' ? '#ef4444' : '#6b7280'
                                }}
                              />
                            </div>
                            <div className="w-12 text-sm font-semibold text-secondary-900 dark:text-secondary-100 text-right">
                              {count}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  {data.insights.recommendations.length > 0 && (
                    <Card variant="outline">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Icon icon={StarFilledIcon} size="md" color="warning" />
                          <span>Recommendations</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {data.insights.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg border-l-4 border-warning-500">
                              <Icon icon={StarFilledIcon} size="sm" color="warning" className="mt-0.5" />
                              <p className="text-sm text-secondary-700 dark:text-secondary-300">
                                {rec}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="space-y-6">
                  {/* Placeholder for analytics content */}
                  <Card variant="outline">
                    <CardHeader>
                      <CardTitle>Analytics Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Icon icon={NotificationIcon} size="2xl" color="muted" className="mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                          Analytics Coming Soon
                        </h3>
                        <p className="text-secondary-600 dark:text-secondary-400">
                          Advanced analytics and insights will be available in the next update.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <div className="space-y-6">
                  {/* Recent Activity Timeline */}
                  <ActivityTimeline
                    activities={data.recentActivity || []}
                    loading={loading}
                    error={error?.message}
                    maxItems={10}
                    showFilters={true}
                    showAvatar={true}
                    showTimestamp={true}
                    groupByDate={false}
                    onRefresh={handleRefresh}
                    onViewAll={() => console.log('View all activities')}
                  />
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default ModernDashboardView;