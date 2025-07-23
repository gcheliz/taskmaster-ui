import type { Meta, StoryObj } from '@storybook/react'
import { ProjectHealthIndicator } from '../../components/ui/molecules/ProjectHealthIndicator'

const meta = {
  title: 'Molecules/ProjectHealthIndicator',
  component: ProjectHealthIndicator,
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
          'A comprehensive project health indicator component that displays health scores, trends, breakdowns, and issues.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    health: {
      description: 'Project health data',
      control: 'object',
    },
    showTrends: {
      control: 'boolean',
      description: 'Whether to show health trends',
    },
    showBreakdown: {
      control: 'boolean',
      description: 'Whether to show health breakdown metrics',
    },
    showIssues: {
      control: 'boolean',
      description: 'Whether to show health issues',
    },
    maxIssues: {
      control: 'number',
      description: 'Maximum number of issues to display',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof ProjectHealthIndicator>

export default meta
type Story = StoryObj<typeof meta>

const mockHealthExcellent = {
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
}

const mockHealthGood = {
  score: 82,
  status: 'good' as const,
  lastChecked: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  issues: [
    'Minor code smell detected in authentication module',
    'Documentation coverage could be improved',
  ],
  trends: {
    direction: 'stable' as const,
    percentage: 2,
    period: 'last month',
  },
  breakdown: {
    codeQuality: 85,
    testCoverage: 78,
    documentation: 82,
    performance: 83,
  },
}

const mockHealthFair = {
  score: 65,
  status: 'fair' as const,
  lastChecked: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  issues: [
    'Test coverage below recommended threshold',
    'Several code quality issues in recent commits',
    'Performance regression in API endpoints',
  ],
  trends: {
    direction: 'down' as const,
    percentage: 8,
    period: 'last 2 weeks',
  },
  breakdown: {
    codeQuality: 68,
    testCoverage: 55,
    documentation: 70,
    performance: 67,
  },
}

const mockHealthNeedsAttention = {
  score: 42,
  status: 'needs-attention' as const,
  lastChecked: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  issues: [
    'Critical security vulnerability found in dependencies',
    'Multiple failing tests in CI pipeline',
    'Code coverage dropped significantly',
    'High technical debt ratio',
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
}

export const Excellent: Story = {
  args: {
    health: mockHealthExcellent,
    showTrends: true,
    showBreakdown: true,
    showIssues: true,
    maxIssues: 3,
  },
}

export const Good: Story = {
  args: {
    health: mockHealthGood,
    showTrends: true,
    showBreakdown: true,
    showIssues: true,
    maxIssues: 3,
  },
}

export const Fair: Story = {
  args: {
    health: mockHealthFair,
    showTrends: true,
    showBreakdown: true,
    showIssues: true,
    maxIssues: 3,
  },
}

export const NeedsAttention: Story = {
  args: {
    health: mockHealthNeedsAttention,
    showTrends: true,
    showBreakdown: true,
    showIssues: true,
    maxIssues: 3,
  },
}

export const WithoutTrends: Story = {
  args: {
    health: mockHealthGood,
    showTrends: false,
    showBreakdown: true,
    showIssues: true,
    maxIssues: 3,
  },
}

export const WithoutBreakdown: Story = {
  args: {
    health: mockHealthGood,
    showTrends: true,
    showBreakdown: false,
    showIssues: true,
    maxIssues: 3,
  },
}

export const WithoutIssues: Story = {
  args: {
    health: mockHealthGood,
    showTrends: true,
    showBreakdown: true,
    showIssues: false,
    maxIssues: 3,
  },
}

export const MinimalView: Story = {
  args: {
    health: mockHealthGood,
    showTrends: false,
    showBreakdown: false,
    showIssues: false,
    maxIssues: 3,
  },
}

export const DarkTheme: Story = {
  args: {
    health: mockHealthGood,
    showTrends: true,
    showBreakdown: true,
    showIssues: true,
    maxIssues: 3,
  },
  parameters: {
    backgrounds: { default: 'light' },
  },
  render: (args) => (
    <div className="">
      <ProjectHealthIndicator {...args} />
    </div>
  ),
}

export const AllHealthLevels: Story = {
  args: {
    health: mockHealthGood,
    showTrends: true,
    showBreakdown: true,
    showIssues: true,
    maxIssues: 3,
  },
  render: (args) => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
          Project Health Levels
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400 mb-6">
          Different health statuses and their visual representations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Excellent Health
          </h3>
          <ProjectHealthIndicator {...args} health={mockHealthExcellent} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Good Health
          </h3>
          <ProjectHealthIndicator {...args} health={mockHealthGood} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Fair Health
          </h3>
          <ProjectHealthIndicator {...args} health={mockHealthFair} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Needs Attention
          </h3>
          <ProjectHealthIndicator {...args} health={mockHealthNeedsAttention} />
        </div>
      </div>
    </div>
  ),
}
