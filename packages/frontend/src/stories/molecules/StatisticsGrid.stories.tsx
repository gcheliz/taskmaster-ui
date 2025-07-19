import type { Meta, StoryObj } from '@storybook/react';
import { StatisticsGrid } from '../../components/ui/molecules/StatisticsGrid';

const meta = {
  title: 'Molecules/StatisticsGrid',
  component: StatisticsGrid,
  parameters: {
    layout: 'padded',
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
          'A responsive statistics grid component that displays key project metrics with interactive cards and progress indicators.',
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
    showHealthIndicator: {
      control: 'boolean',
      description: 'Whether to show the health indicator card',
    },
    showProgressBars: {
      control: 'boolean',
      description: 'Whether to show progress bars in cards',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof StatisticsGrid>;

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
};

export const Default: Story = {
  args: {
    taskMetrics: mockTaskMetrics,
    insights: mockInsights,
    health: mockHealth,
    showHealthIndicator: true,
    showProgressBars: true,
  },
};

export const WithoutHealthIndicator: Story = {
  args: {
    taskMetrics: mockTaskMetrics,
    insights: mockInsights,
    showHealthIndicator: false,
    showProgressBars: true,
  },
};

export const WithoutProgressBars: Story = {
  args: {
    taskMetrics: mockTaskMetrics,
    insights: mockInsights,
    health: mockHealth,
    showHealthIndicator: true,
    showProgressBars: false,
  },
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
    },
    showHealthIndicator: true,
    showProgressBars: true,
  },
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
      ],
    },
    showHealthIndicator: true,
    showProgressBars: true,
  },
};

export const DarkTheme: Story = {
  args: {
    taskMetrics: mockTaskMetrics,
    insights: mockInsights,
    health: mockHealth,
    showHealthIndicator: true,
    showProgressBars: true,
  },
  parameters: {
    backgrounds: { default: 'light' },
  },
  render: args => (
    <div className="">
      <StatisticsGrid {...args} />
    </div>
  ),
};

export const ResponsiveDemo: Story = {
  args: {
    taskMetrics: mockTaskMetrics,
    insights: mockInsights,
    health: mockHealth,
    showHealthIndicator: true,
    showProgressBars: true,
  },
  render: args => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
          Responsive Statistics Grid Demo
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400 mb-6">
          The grid adapts from 1 column (mobile) to 2 columns (tablet) to 4
          columns (desktop)
        </p>
      </div>

      {/* Mobile View */}
      <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Mobile View (1 column)
        </h3>
        <div className="max-w-sm">
          <StatisticsGrid {...args} />
        </div>
      </div>

      {/* Tablet View */}
      <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Tablet View (2 columns)
        </h3>
        <div className="max-w-2xl">
          <StatisticsGrid {...args} />
        </div>
      </div>

      {/* Desktop View */}
      <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Desktop View (4 columns)
        </h3>
        <div className="w-full">
          <StatisticsGrid {...args} />
        </div>
      </div>
    </div>
  ),
};
