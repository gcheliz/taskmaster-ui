import type { Meta, StoryObj } from '@storybook/react'
import {
  RepositoryHealthIndicator,
  HealthScoreCompact,
} from '../../components/Repository/RepositoryHealthIndicator'
import type {
  RepositoryHealthMetrics,
  RepositoryStatistics,
} from '../../services/repositoryService'

const meta: Meta<typeof RepositoryHealthIndicator> = {
  title: 'Components/Repository/RepositoryHealthIndicator',
  component: RepositoryHealthIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A comprehensive component that calculates and displays repository health scores based on branch status, commit activity, code quality, and maintenance metrics.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    ahead: {
      control: { type: 'number', min: 0, max: 20 },
      description: 'Number of commits ahead of remote',
    },
    behind: {
      control: { type: 'number', min: 0, max: 20 },
      description: 'Number of commits behind remote',
    },
    isClean: {
      control: { type: 'boolean' },
      description: 'Whether working directory is clean',
    },
    conflicted: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'Number of conflicted files',
    },
    lastCommitDate: {
      control: { type: 'text' },
      description: 'Last commit date ISO string',
    },
    showDetails: {
      control: { type: 'boolean' },
      description: 'Show detailed breakdown and recommendations',
    },
    showScore: {
      control: { type: 'boolean' },
      description: 'Show numerical score in badge',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Helper to generate dates relative to now
const getRelativeDate = (hoursAgo: number) =>
  new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()

// Mock data for health metrics and statistics
const excellentHealthMetrics: RepositoryHealthMetrics = {
  score: 92,
  issues: [
    {
      severity: 'low',
      type: 'maintenance',
      message: 'Consider updating documentation',
    },
  ],
  metrics: {
    codeQuality: {
      score: 95,
      complexity: 2.1,
      duplication: 2,
      maintainabilityIndex: 85,
    },
    security: {
      score: 98,
      vulnerabilities: 0,
      outdatedDependencies: 1,
    },
    performance: {
      score: 90,
      bundleSize: 2.1,
      buildTime: 45,
    },
    testing: {
      score: 95,
      coverage: 95,
      testsCount: 432,
      passRate: 99.8,
    },
  },
  trends: {
    period: '30d',
    data: [
      {
        date: getRelativeDate(7 * 24),
        score: 90,
        commits: 15,
        contributors: 5,
      },
    ],
  },
}

const goodHealthMetrics: RepositoryHealthMetrics = {
  score: 76,
  issues: [
    {
      severity: 'medium',
      type: 'quality',
      message: 'Code coverage could be improved',
    },
    {
      severity: 'low',
      type: 'security',
      message: '1 minor vulnerability detected',
    },
  ],
  metrics: {
    codeQuality: {
      score: 78,
      complexity: 3.2,
      duplication: 8,
      maintainabilityIndex: 72,
    },
    security: {
      score: 85,
      vulnerabilities: 1,
      outdatedDependencies: 3,
    },
    performance: {
      score: 82,
      bundleSize: 3.4,
      buildTime: 72,
    },
    testing: {
      score: 75,
      coverage: 78,
      testsCount: 234,
      passRate: 96.2,
    },
  },
  trends: {
    period: '30d',
    data: [
      {
        date: getRelativeDate(7 * 24),
        score: 74,
        commits: 12,
        contributors: 3,
      },
    ],
  },
}

const poorHealthMetrics: RepositoryHealthMetrics = {
  score: 38,
  issues: [
    {
      severity: 'critical',
      type: 'security',
      message: '8 security vulnerabilities found',
    },
    {
      severity: 'high',
      type: 'quality',
      message: 'High code complexity detected',
    },
    {
      severity: 'medium',
      type: 'maintenance',
      message: 'Dependencies are severely outdated',
    },
  ],
  metrics: {
    codeQuality: {
      score: 45,
      complexity: 8.7,
      duplication: 25,
      maintainabilityIndex: 42,
    },
    security: {
      score: 25,
      vulnerabilities: 8,
      outdatedDependencies: 15,
    },
    performance: {
      score: 35,
      bundleSize: 12.3,
      buildTime: 210,
    },
    testing: {
      score: 30,
      coverage: 45,
      testsCount: 89,
      passRate: 82.1,
    },
  },
  trends: {
    period: '30d',
    data: [
      {
        date: getRelativeDate(7 * 24),
        score: 42,
        commits: 2,
        contributors: 1,
      },
    ],
  },
}

const activeStatistics: RepositoryStatistics = {
  commits: {
    total: 1247,
    thisWeek: 15,
    thisMonth: 67,
    byAuthor: [
      {
        author: 'john.doe@example.com',
        count: 234,
        percentage: 45.2,
      },
    ],
    byDay: [
      {
        date: getRelativeDate(24),
        count: 3,
      },
    ],
  },
  contributors: {
    total: 8,
    active: 5,
    list: [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        commits: 234,
        linesAdded: 12450,
        linesRemoved: 3422,
        lastActivity: getRelativeDate(2),
      },
    ],
  },
  files: {
    total: 456,
    byExtension: [
      {
        extension: '.ts',
        count: 234,
        size: 1024000,
      },
    ],
    largest: [
      {
        path: 'src/components/LargeComponent.tsx',
        size: 45000,
        lines: 1200,
      },
    ],
  },
  activity: {
    frequency: 'high',
    lastPush: getRelativeDate(2),
    averageCommitsPerWeek: 12.5,
    peakHour: 14,
    peakDay: 'Tuesday',
  },
}

const staleStatistics: RepositoryStatistics = {
  commits: {
    total: 342,
    thisWeek: 0,
    thisMonth: 2,
    byAuthor: [
      {
        author: 'maintainer@example.com',
        count: 180,
        percentage: 52.6,
      },
    ],
    byDay: [
      {
        date: getRelativeDate(24 * 15),
        count: 1,
      },
    ],
  },
  contributors: {
    total: 3,
    active: 1,
    list: [
      {
        name: 'Maintainer',
        email: 'maintainer@example.com',
        commits: 180,
        linesAdded: 5600,
        linesRemoved: 1200,
        lastActivity: getRelativeDate(24 * 15),
      },
    ],
  },
  files: {
    total: 123,
    byExtension: [
      {
        extension: '.js',
        count: 89,
        size: 340000,
      },
    ],
    largest: [
      {
        path: 'legacy/old-component.js',
        size: 23000,
        lines: 890,
      },
    ],
  },
  activity: {
    frequency: 'low',
    lastPush: getRelativeDate(24 * 15),
    averageCommitsPerWeek: 1.2,
    peakHour: 10,
    peakDay: 'Monday',
  },
}

export const ExcellentHealth: Story = {
  args: {
    ahead: 0,
    behind: 0,
    isClean: true,
    conflicted: 0,
    lastCommitDate: getRelativeDate(2),
    healthMetrics: excellentHealthMetrics,
    statistics: activeStatistics,
    showDetails: false,
    showScore: true,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Repository with excellent health score (90+) - clean, up-to-date, and well-maintained.',
      },
    },
  },
}

export const GoodHealth: Story = {
  args: {
    ahead: 1,
    behind: 0,
    isClean: true,
    conflicted: 0,
    lastCommitDate: getRelativeDate(12),
    healthMetrics: goodHealthMetrics,
    statistics: activeStatistics,
    showDetails: false,
    showScore: true,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Repository with good health score (75-89) - minor issues but generally well-maintained.',
      },
    },
  },
}

export const FairHealth: Story = {
  args: {
    ahead: 0,
    behind: 3,
    isClean: false,
    conflicted: 0,
    lastCommitDate: getRelativeDate(72),
    healthMetrics: {
      ...goodHealthMetrics,
      score: 65,
      metrics: {
        ...goodHealthMetrics.metrics,
        testing: {
          ...goodHealthMetrics.metrics.testing,
          coverage: 55,
        },
        security: {
          ...goodHealthMetrics.metrics.security,
          vulnerabilities: 3,
        },
      },
    },
    statistics: {
      ...activeStatistics,
      commits: {
        ...activeStatistics.commits,
        thisWeek: 2,
        thisMonth: 8,
      },
    },
    showDetails: false,
    showScore: true,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Repository with fair health score (60-74) - some maintenance needed.',
      },
    },
  },
}

export const PoorHealth: Story = {
  args: {
    ahead: 2,
    behind: 5,
    isClean: false,
    conflicted: 1,
    lastCommitDate: getRelativeDate(168), // 7 days
    healthMetrics: poorHealthMetrics,
    statistics: staleStatistics,
    showDetails: false,
    showScore: true,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Repository with poor health score (40-59) - significant issues requiring attention.',
      },
    },
  },
}

export const CriticalHealth: Story = {
  args: {
    ahead: 0,
    behind: 12,
    isClean: false,
    conflicted: 5,
    lastCommitDate: getRelativeDate(720), // 30 days
    healthMetrics: {
      ...poorHealthMetrics,
      score: 25,
      metrics: {
        ...poorHealthMetrics.metrics,
        testing: {
          ...poorHealthMetrics.metrics.testing,
          coverage: 15,
        },
        security: {
          ...poorHealthMetrics.metrics.security,
          vulnerabilities: 15,
        },
      },
    },
    statistics: {
      ...staleStatistics,
      commits: {
        ...staleStatistics.commits,
        thisWeek: 0,
        thisMonth: 0,
      },
    },
    showDetails: false,
    showScore: true,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Repository with critical health score (<40) - urgent attention required.',
      },
    },
  },
}

export const WithDetailedBreakdown: Story = {
  args: {
    ahead: 1,
    behind: 2,
    isClean: false,
    conflicted: 0,
    lastCommitDate: getRelativeDate(24),
    healthMetrics: goodHealthMetrics,
    statistics: activeStatistics,
    showDetails: true,
    showScore: true,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows detailed health breakdown including factor scores, issues, and recommendations.',
      },
    },
  },
}

export const WithoutScore: Story = {
  args: {
    ahead: 0,
    behind: 0,
    isClean: true,
    conflicted: 0,
    lastCommitDate: getRelativeDate(6),
    healthMetrics: excellentHealthMetrics,
    statistics: activeStatistics,
    showDetails: false,
    showScore: false,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Health indicator showing only the level badge without numerical score.',
      },
    },
  },
}

export const LargeSize: Story = {
  args: {
    ahead: 3,
    behind: 0,
    isClean: true,
    conflicted: 0,
    lastCommitDate: getRelativeDate(8),
    healthMetrics: goodHealthMetrics,
    statistics: activeStatistics,
    showDetails: true,
    showScore: true,
    size: 'lg',
  },
  parameters: {
    docs: {
      description: {
        story: 'Large size variant with detailed breakdown for dashboard displays.',
      },
    },
  },
}

export const SmallSize: Story = {
  args: {
    ahead: 0,
    behind: 1,
    isClean: true,
    conflicted: 0,
    lastCommitDate: getRelativeDate(4),
    healthMetrics: excellentHealthMetrics,
    statistics: activeStatistics,
    showDetails: false,
    showScore: true,
    size: 'sm',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small size variant for compact displays and cards.',
      },
    },
  },
}

// Health Score Compact component stories
const metaCompact: Meta<typeof HealthScoreCompact> = {
  title: 'Components/Repository/HealthScoreCompact',
  component: HealthScoreCompact,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A compact circular health score indicator designed for use in repository cards and compact layouts.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    score: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Health score from 0-100',
    },
    level: {
      control: { type: 'select' },
      options: ['excellent', 'good', 'fair', 'poor', 'critical'],
      description: 'Health level determining color scheme',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
  },
}

export const CompactExcellent: StoryObj<typeof metaCompact> = {
  args: {
    score: 92,
    level: 'excellent',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact health score for excellent repositories.',
      },
    },
  },
}

export const CompactGood: StoryObj<typeof metaCompact> = {
  args: {
    score: 78,
    level: 'good',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact health score for good repositories.',
      },
    },
  },
}

export const CompactFair: StoryObj<typeof metaCompact> = {
  args: {
    score: 65,
    level: 'fair',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact health score for fair repositories.',
      },
    },
  },
}

export const CompactPoor: StoryObj<typeof metaCompact> = {
  args: {
    score: 42,
    level: 'poor',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact health score for poor repositories.',
      },
    },
  },
}

export const CompactCritical: StoryObj<typeof metaCompact> = {
  args: {
    score: 28,
    level: 'critical',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact health score for critical repositories.',
      },
    },
  },
}

export const CompactSizes: StoryObj<typeof metaCompact> = {
  render: () => (
    <div className="flex items-center gap-4">
      <HealthScoreCompact score={85} level="good" size="sm" />
      <HealthScoreCompact score={85} level="good" size="md" />
      <HealthScoreCompact score={85} level="good" size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different size variants of the compact health score.',
      },
    },
  },
}
