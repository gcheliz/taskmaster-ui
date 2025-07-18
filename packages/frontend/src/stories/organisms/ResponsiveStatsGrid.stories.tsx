import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResponsiveStatsGrid } from '../../components/ui/organisms/ResponsiveStatsGrid';

const meta = {
  title: 'Organisms/ResponsiveStatsGrid',
  component: ResponsiveStatsGrid,
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
        component: 'A comprehensive responsive statistics grid organism that combines statistics and health indicators with interactive view modes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    taskMetrics: {
      description: 'Task metrics and statistics',
      control: 'object',
    },
    insights: {
      description: 'Project insights and analytics',
      control: 'object',
    },
    health: {
      description: 'Project health data',
      control: 'object',
    },
    showHealthDetails: {
      control: 'boolean',
      description: 'Whether to show detailed health indicators',
    },
    showTaskBreakdown: {
      control: 'boolean',
      description: 'Whether to show task status breakdown',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the data is loading',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof ResponsiveStatsGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockTaskMetrics = {
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
};

const mockInsights = {
  totalEstimatedHours: 340,
  averageTaskComplexity: 6.2,
  productivityScore: 84.5,
  recommendations: [
    'Consider reviewing the 3 blocked tasks to unblock progress',
    'Current completion rate is above target - great work!',
    'Team productivity has increased by 15% this sprint',
  ],
};

const mockHealth = {
  score: 87,
  status: 'good' as const,
  lastChecked: new Date().toISOString(),
  issues: [
    'Some tests are failing in the CI pipeline',
    'Code coverage dropped below 80%',
  ],
  trends: {
    direction: 'stable' as const,
    percentage: 2,
    period: 'last week',
  },
  breakdown: {
    codeQuality: 85,
    testCoverage: 78,
    documentation: 82,
    performance: 83,
  },
};

export const Default: Story = {
  args: {
    taskMetrics: mockTaskMetrics,
    insights: mockInsights,
    health: mockHealth,
    showHealthDetails: true,
    showTaskBreakdown: true,
    loading: false,
    lastUpdated: new Date(),
    onRefresh: () => console.log('Refresh clicked'),
  },
  render: (args) => (
    <div className="p-8 min-h-screen">
      <ResponsiveStatsGrid {...args} />
    </div>
  ),
};

export const LoadingState: Story = {
  args: {
    taskMetrics: mockTaskMetrics,
    insights: mockInsights,
    health: mockHealth,
    showHealthDetails: true,
    showTaskBreakdown: true,
    loading: true,
    lastUpdated: new Date(),
    onRefresh: () => console.log('Refresh clicked'),
  },
  render: (args) => (
    <div className="p-8 min-h-screen">
      <ResponsiveStatsGrid {...args} />
    </div>
  ),
};

export const HighPerformanceProject: Story = {
  args: {
    taskMetrics: {
      ...mockTaskMetrics,
      total: 200,
      completed: 180,
      inProgress: 15,
      pending: 5,
      blocked: 0,
      completionRate: 90,
      statusBreakdown: {
        done: 180,
        'in-progress': 15,
        pending: 5,
        blocked: 0,
      },
    },
    insights: {
      ...mockInsights,
      totalEstimatedHours: 500,
      averageTaskComplexity: 8.5,
      productivityScore: 96.2,
    },
    health: {
      score: 95,
      status: 'excellent' as const,
      lastChecked: new Date().toISOString(),
      issues: [],
      trends: {
        direction: 'up' as const,
        percentage: 5,
        period: 'last week',
      },
      breakdown: {
        codeQuality: 92,
        testCoverage: 89,
        documentation: 96,
        performance: 98,
      },
    },
    showHealthDetails: true,
    showTaskBreakdown: true,
    loading: false,
    lastUpdated: new Date(),
    onRefresh: () => console.log('Refresh clicked'),
  },
  render: (args) => (
    <div className="p-8 min-h-screen">
      <ResponsiveStatsGrid {...args} />
    </div>
  ),
};

export const ProblematicProject: Story = {
  args: {
    taskMetrics: {
      ...mockTaskMetrics,
      total: 150,
      completed: 45,
      inProgress: 30,
      pending: 50,
      blocked: 25,
      completionRate: 30,
      statusBreakdown: {
        done: 45,
        'in-progress': 30,
        pending: 50,
        blocked: 25,
      },
    },
    insights: {
      ...mockInsights,
      totalEstimatedHours: 800,
      averageTaskComplexity: 9.2,
      productivityScore: 45.8,
    },
    health: {
      score: 35,
      status: 'needs-attention' as const,
      lastChecked: new Date().toISOString(),
      issues: [
        'Multiple critical bugs in production',
        'High technical debt ratio',
        'Team velocity below expectations',
        'Code quality metrics declining',
        'Performance issues affecting user experience',
      ],
      trends: {
        direction: 'down' as const,
        percentage: 15,
        period: 'last month',
      },
      breakdown: {
        codeQuality: 45,
        testCoverage: 32,
        documentation: 48,
        performance: 43,
      },
    },
    showHealthDetails: true,
    showTaskBreakdown: true,
    loading: false,
    lastUpdated: new Date(),
    onRefresh: () => console.log('Refresh clicked'),
  },
  render: (args) => (
    <div className="p-8 min-h-screen">
      <ResponsiveStatsGrid {...args} />
    </div>
  ),
};

export const WithoutHealthDetails: Story = {
  args: {
    taskMetrics: mockTaskMetrics,
    insights: mockInsights,
    health: mockHealth,
    showHealthDetails: false,
    showTaskBreakdown: true,
    loading: false,
    lastUpdated: new Date(),
    onRefresh: () => console.log('Refresh clicked'),
  },
  render: (args) => (
    <div className="p-8 min-h-screen">
      <ResponsiveStatsGrid {...args} />
    </div>
  ),
};

export const WithoutTaskBreakdown: Story = {
  args: {
    taskMetrics: mockTaskMetrics,
    insights: mockInsights,
    health: mockHealth,
    showHealthDetails: true,
    showTaskBreakdown: false,
    loading: false,
    lastUpdated: new Date(),
    onRefresh: () => console.log('Refresh clicked'),
  },
  render: (args) => (
    <div className="p-8 min-h-screen">
      <ResponsiveStatsGrid {...args} />
    </div>
  ),
};

export const DarkTheme: Story = {
  args: {
    taskMetrics: mockTaskMetrics,
    insights: mockInsights,
    health: mockHealth,
    showHealthDetails: true,
    showTaskBreakdown: true,
    loading: false,
    lastUpdated: new Date(),
    onRefresh: () => console.log('Refresh clicked'),
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: (args) => (
    <div className="dark">
      <div className="p-8 min-h-screen bg-surface-950">
        <ResponsiveStatsGrid {...args} />
      </div>
    </div>
  ),
};

export const ResponsiveDemo: Story = {
  args: {
    taskMetrics: mockTaskMetrics,
    insights: mockInsights,
    health: mockHealth,
    showHealthDetails: true,
    showTaskBreakdown: true,
    loading: false,
    lastUpdated: new Date(),
    onRefresh: () => console.log('Refresh clicked'),
  },
  render: (args) => (
    <div className="space-y-8 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
          Responsive Statistics Grid Demo
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400 mb-6">
          The grid adapts to different screen sizes and provides overview and detailed views
        </p>
      </div>
      
      {/* Desktop View */}
      <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Desktop View
        </h3>
        <div className="w-full">
          <ResponsiveStatsGrid {...args} />
        </div>
      </div>

      {/* Tablet View */}
      <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Tablet View
        </h3>
        <div className="max-w-4xl">
          <ResponsiveStatsGrid {...args} />
        </div>
      </div>

      {/* Mobile View */}
      <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Mobile View
        </h3>
        <div className="max-w-md">
          <ResponsiveStatsGrid {...args} />
        </div>
      </div>
    </div>
  ),
};