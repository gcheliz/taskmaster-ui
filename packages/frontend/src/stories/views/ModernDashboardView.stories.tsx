import type { Meta, StoryObj } from '@storybook/react';
// import { useState } from 'react';
import { ModernDashboardView } from '../../components/Views/ModernDashboardView';
import { DashboardDemo } from '../../components/Views/DashboardDemo';

const meta = {
  title: 'Views/ModernDashboardView',
  component: ModernDashboardView,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f8fafc' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
    docs: {
      description: {
        component:
          'A modern, responsive dashboard built with dark theme atomic components featuring interactive widgets, statistics, and enhanced user experience.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    projectId: {
      control: 'text',
      description: 'The project ID to load dashboard data for',
    },
    projectTag: {
      control: 'text',
      description: 'Optional project tag for filtering',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof ModernDashboardView>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock the dashboard hook data
const mockDashboardData = {
  project: {
    name: 'TaskMaster UI',
    path: '/workspace/taskmaster-ui',
    lastUpdated: new Date().toISOString(),
  },
  taskMetrics: {
    total: 127,
    completed: 89,
    inProgress: 23,
    pending: 12,
    blocked: 3,
    deferred: 0,
    completionRate: 70.1,
    statusBreakdown: {
      done: 89,
      'in-progress': 23,
      pending: 12,
      blocked: 3,
    },
  },
  insights: {
    totalEstimatedHours: 340,
    averageTaskComplexity: 6.2,
    productivityScore: 84.5,
    recommendations: [
      'Consider reviewing the 3 blocked tasks to unblock progress',
      'Current completion rate is above target - great work!',
      'Team productivity has increased by 15% this sprint',
    ],
  },
  recentActivity: [
    {
      message: 'Task "Implement dark theme" completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      type: 'task_completed',
    },
    {
      message: 'New task "Add navigation components" created',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      type: 'task_created',
    },
    {
      message: 'Task "Update documentation" started',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      type: 'task_started',
    },
  ],
};

const mockHealthData = {
  score: 87,
  status: 'good',
};

// Mock the useDashboard hook
const mockUseDashboard = () => ({
  data: mockDashboardData,
  health: mockHealthData,
  loading: false,
  error: null,
  lastUpdated: new Date(),
  refresh: async () => {},
  refreshHealth: async () => {},
  clearError: () => {},
  isStale: false,
  retryCount: 0,
});

// Override the hook for stories
// const originalHook = require('../../hooks/useDashboard');
// beforeEach(() => {
//   originalHook.useDashboard = mockUseDashboard;
// });

export const Default: Story = {
  args: {
    projectId: 'taskmaster-ui',
    projectTag: 'frontend',
  },
  render: args => (
    <div className="min-h-screen">
      <ModernDashboardView {...args} />
    </div>
  ),
};

export const DarkTheme: Story = {
  args: {
    projectId: 'taskmaster-ui',
    projectTag: 'frontend',
  },
  parameters: {
    backgrounds: { default: 'light' },
  },
  render: args => (
    <div className="">
      <div className="min-h-screen">
        <ModernDashboardView {...args} />
      </div>
    </div>
  ),
};

export const LoadingState: Story = {
  args: {
    projectId: 'taskmaster-ui',
    projectTag: 'frontend',
  },
  render: args => {
    // Mock loading state
    const mockUseDashboardLoading = () => ({
      data: null,
      health: null,
      loading: true,
      error: null,
      lastUpdated: null,
      refresh: async () => {},
      refreshHealth: async () => {},
      clearError: () => {},
      isStale: false,
      retryCount: 0,
    });

    // originalHook.useDashboard = mockUseDashboardLoading;

    return (
      <div className="min-h-screen">
        <ModernDashboardView {...args} />
      </div>
    );
  },
};

export const ErrorState: Story = {
  args: {
    projectId: 'invalid-project',
    projectTag: 'frontend',
  },
  render: args => {
    // Mock error state
    const mockUseDashboardError = () => ({
      data: null,
      health: null,
      loading: false,
      error: new Error(
        'Failed to load dashboard data. Please check your network connection.'
      ),
      lastUpdated: null,
      refresh: async () => {},
      refreshHealth: async () => {},
      clearError: () => {},
      isStale: false,
      retryCount: 2,
    });

    // originalHook.useDashboard = mockUseDashboardError;

    return (
      <div className="min-h-screen">
        <ModernDashboardView {...args} />
      </div>
    );
  },
};

export const EmptyState: Story = {
  args: {
    projectId: 'empty-project',
    projectTag: 'frontend',
  },
  render: args => {
    // Mock empty state
    const mockUseDashboardEmpty = () => ({
      data: null,
      health: null,
      loading: false,
      error: null,
      lastUpdated: null,
      refresh: async () => {},
      refreshHealth: async () => {},
      clearError: () => {},
      isStale: false,
      retryCount: 0,
    });

    // originalHook.useDashboard = mockUseDashboardEmpty;

    return (
      <div className="min-h-screen">
        <ModernDashboardView {...args} />
      </div>
    );
  },
};

export const HighActivityProject: Story = {
  args: {
    projectId: 'high-activity-project',
    projectTag: 'frontend',
  },
  render: args => {
    // Mock high activity data
    const mockUseDashboardHighActivity = () => ({
      data: {
        ...mockDashboardData,
        taskMetrics: {
          ...mockDashboardData.taskMetrics,
          total: 250,
          completed: 180,
          inProgress: 45,
          pending: 20,
          blocked: 5,
          completionRate: 72.0,
          statusBreakdown: {
            done: 180,
            'in-progress': 45,
            pending: 20,
            blocked: 5,
          },
        },
        insights: {
          ...mockDashboardData.insights,
          totalEstimatedHours: 650,
          averageTaskComplexity: 7.8,
          productivityScore: 91.2,
          recommendations: [
            'Excellent progress! Team is performing above expectations',
            'Consider expanding team capacity for upcoming features',
            'Review blocked tasks to maintain momentum',
          ],
        },
      },
      health: {
        score: 93,
        status: 'excellent',
      },
      loading: false,
      error: null,
      lastUpdated: new Date(),
      refresh: async () => {},
      refreshHealth: async () => {},
      clearError: () => {},
      isStale: false,
      retryCount: 0,
    });

    // originalHook.useDashboard = mockUseDashboardHighActivity;

    return (
      <div className="min-h-screen">
        <ModernDashboardView {...args} />
      </div>
    );
  },
};

export const ResponsiveDemo: Story = {
  args: {
    projectId: 'responsive-demo',
    projectTag: 'frontend',
  },
  render: args => (
    <div className="space-y-8">
      <div className="text-center p-4">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
          Responsive Dashboard Demo
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400 mb-6">
          The dashboard adapts to different screen sizes automatically
        </p>
      </div>

      {/* Desktop View */}
      <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Desktop View (1200px+)
        </h3>
        <div className="w-full min-h-[600px] border border-secondary-200 dark:border-secondary-700 rounded-lg overflow-hidden">
          <ModernDashboardView {...args} />
        </div>
      </div>

      {/* Tablet View */}
      <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Tablet View (768px)
        </h3>
        <div className="w-full max-w-2xl min-h-[600px] border border-secondary-200 dark:border-secondary-700 rounded-lg overflow-hidden">
          <ModernDashboardView {...args} />
        </div>
      </div>

      {/* Mobile View */}
      <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Mobile View (375px)
        </h3>
        <div className="w-full max-w-sm min-h-[600px] border border-secondary-200 dark:border-secondary-700 rounded-lg overflow-hidden">
          <ModernDashboardView {...args} />
        </div>
      </div>
    </div>
  ),
};

export const InteractiveDemo: Story = {
  args: {
    projectId: 'interactive-demo',
    projectTag: 'frontend',
  },
  render: () => <DashboardDemo />,
};
