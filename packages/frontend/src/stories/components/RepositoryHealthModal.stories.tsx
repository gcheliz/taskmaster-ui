import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { RepositoryHealthModal } from '../../components/Repository/RepositoryHealthModal'
import { Button } from '../../components/ui/atoms/Button'
import type {
  RepositoryHealthMetrics,
  RepositoryStatistics,
} from '../../services/repositoryService'

// Mock repository health data for Storybook
const mockHealthData: RepositoryHealthMetrics = {
  score: 85,
  issues: [
    {
      severity: 'medium',
      type: 'security',
      message: 'Outdated dependency detected: axios@0.21.1 has known security vulnerabilities',
      file: 'package.json',
      line: 24,
    },
    {
      severity: 'low',
      type: 'quality',
      message: 'High cyclomatic complexity detected in UserService.ts',
      file: 'src/services/UserService.ts',
      line: 45,
    },
    {
      severity: 'high',
      type: 'performance',
      message: 'Bundle size exceeds recommended limit (2.5MB > 2MB)',
    },
  ],
  metrics: {
    codeQuality: {
      score: 88,
      complexity: 12,
      duplication: 3.2,
      maintainabilityIndex: 75,
    },
    security: {
      score: 78,
      vulnerabilities: 2,
      outdatedDependencies: 5,
    },
    performance: {
      score: 82,
      bundleSize: 2621440, // 2.5MB in bytes
      buildTime: 45000, // 45 seconds in ms
    },
    testing: {
      score: 91,
      coverage: 87.5,
      testsCount: 245,
      passRate: 98.8,
    },
  },
  trends: {
    period: '30d',
    data: [
      {
        date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
        score: 78,
        commits: 15,
        contributors: 3,
      },
      {
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        score: 80,
        commits: 22,
        contributors: 4,
      },
      {
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        score: 82,
        commits: 18,
        contributors: 3,
      },
      {
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        score: 85,
        commits: 25,
        contributors: 5,
      },
      {
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        score: 83,
        commits: 12,
        contributors: 2,
      },
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        score: 85,
        commits: 20,
        contributors: 4,
      },
      {
        date: new Date().toISOString(),
        score: 85,
        commits: 8,
        contributors: 2,
      },
    ],
  },
}

const mockStatisticsData: RepositoryStatistics = {
  commits: {
    total: 1247,
    thisWeek: 8,
    thisMonth: 42,
    byAuthor: [
      { author: 'John Developer', count: 324, percentage: 26.0 },
      { author: 'Jane Smith', count: 298, percentage: 23.9 },
      { author: 'Bob Johnson', count: 245, percentage: 19.6 },
      { author: 'Alice Wilson', count: 198, percentage: 15.9 },
      { author: 'Others', count: 182, percentage: 14.6 },
    ],
    byDay: [
      { date: '2024-01-15', count: 5 },
      { date: '2024-01-16', count: 8 },
      { date: '2024-01-17', count: 12 },
      { date: '2024-01-18', count: 6 },
      { date: '2024-01-19', count: 9 },
      { date: '2024-01-20', count: 15 },
      { date: '2024-01-21', count: 3 },
    ],
  },
  contributors: {
    total: 12,
    active: 6,
    list: [
      {
        name: 'John Developer',
        email: 'john@company.com',
        commits: 324,
        linesAdded: 12450,
        linesRemoved: 3240,
        lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        name: 'Jane Smith',
        email: 'jane@company.com',
        commits: 298,
        linesAdded: 9870,
        linesRemoved: 2100,
        lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  files: {
    total: 456,
    byExtension: [
      { extension: '.tsx', count: 124, size: 891234 },
      { extension: '.ts', count: 89, size: 567890 },
      { extension: '.css', count: 23, size: 125678 },
      { extension: '.json', count: 15, size: 45123 },
      { extension: '.md', count: 8, size: 23456 },
    ],
    largest: [
      { path: 'src/components/Dashboard.tsx', size: 45123, lines: 1247 },
      { path: 'src/services/ApiService.ts', size: 38975, lines: 1089 },
      { path: 'src/utils/helpers.ts', size: 32456, lines: 856 },
    ],
  },
  activity: {
    frequency: 'high',
    lastPush: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    averageCommitsPerWeek: 12.5,
    peakHour: 14,
    peakDay: 'Tuesday',
  },
}

// Mock unhealthy repository data
const mockUnhealthyData: RepositoryHealthMetrics = {
  score: 42,
  issues: [
    {
      severity: 'critical',
      type: 'security',
      message: 'Critical security vulnerability in lodash@4.17.15',
      file: 'package.json',
      line: 18,
    },
    {
      severity: 'critical',
      type: 'security',
      message: 'SQL injection vulnerability in database query',
      file: 'src/controllers/UserController.ts',
      line: 127,
    },
    {
      severity: 'high',
      type: 'quality',
      message: 'Extremely high cyclomatic complexity (CC: 45)',
      file: 'src/utils/DataProcessor.ts',
      line: 89,
    },
    {
      severity: 'high',
      type: 'performance',
      message: 'Memory leak detected in EventListener',
      file: 'src/services/EventService.ts',
      line: 234,
    },
    {
      severity: 'medium',
      type: 'maintenance',
      message: 'Deprecated API usage detected',
      file: 'src/api/LegacyApi.ts',
      line: 56,
    },
    {
      severity: 'medium',
      type: 'quality',
      message: 'Code duplication detected across multiple files',
    },
    {
      severity: 'low',
      type: 'quality',
      message: 'Inconsistent code formatting',
    },
  ],
  metrics: {
    codeQuality: {
      score: 35,
      complexity: 28,
      duplication: 15.7,
      maintainabilityIndex: 42,
    },
    security: {
      score: 25,
      vulnerabilities: 12,
      outdatedDependencies: 23,
    },
    performance: {
      score: 58,
      bundleSize: 5242880, // 5MB
      buildTime: 180000, // 3 minutes
    },
    testing: {
      score: 48,
      coverage: 42.3,
      testsCount: 87,
      passRate: 78.5,
    },
  },
  trends: {
    period: '30d',
    data: [
      {
        date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
        score: 65,
        commits: 8,
        contributors: 2,
      },
      {
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        score: 58,
        commits: 5,
        contributors: 1,
      },
      {
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        score: 52,
        commits: 12,
        contributors: 3,
      },
      {
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        score: 48,
        commits: 3,
        contributors: 1,
      },
      {
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        score: 45,
        commits: 2,
        contributors: 1,
      },
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        score: 42,
        commits: 1,
        contributors: 1,
      },
      {
        date: new Date().toISOString(),
        score: 42,
        commits: 0,
        contributors: 0,
      },
    ],
  },
}

// Perfect repository data
const mockPerfectData: RepositoryHealthMetrics = {
  score: 98,
  issues: [],
  metrics: {
    codeQuality: {
      score: 96,
      complexity: 8,
      duplication: 1.2,
      maintainabilityIndex: 92,
    },
    security: {
      score: 100,
      vulnerabilities: 0,
      outdatedDependencies: 0,
    },
    performance: {
      score: 94,
      bundleSize: 1048576, // 1MB
      buildTime: 25000, // 25 seconds
    },
    testing: {
      score: 98,
      coverage: 95.8,
      testsCount: 456,
      passRate: 100,
    },
  },
  trends: {
    period: '30d',
    data: [
      {
        date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
        score: 92,
        commits: 45,
        contributors: 8,
      },
      {
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        score: 94,
        commits: 38,
        contributors: 7,
      },
      {
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        score: 95,
        commits: 42,
        contributors: 9,
      },
      {
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        score: 96,
        commits: 51,
        contributors: 10,
      },
      {
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        score: 97,
        commits: 36,
        contributors: 8,
      },
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        score: 98,
        commits: 29,
        contributors: 6,
      },
      {
        date: new Date().toISOString(),
        score: 98,
        commits: 15,
        contributors: 4,
      },
    ],
  },
}

// Mock services for Storybook
const createMockService = (
  healthData: RepositoryHealthMetrics,
  statisticsData: RepositoryStatistics
) => ({
  getRepositoryHealth: async (repositoryId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      success: true,
      data: healthData,
    }
  },
  getRepositoryStatistics: async (repositoryId: string, period: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return {
      success: true,
      data: statisticsData,
    }
  },
})

const meta: Meta<typeof RepositoryHealthModal> = {
  title: 'Components/Repository/RepositoryHealthModal',
  component: RepositoryHealthModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The RepositoryHealthModal provides a comprehensive health dashboard for repositories with the following features:

### Overview Tab
- **Overall Health Score**: Visual grade (A+ to F) with radial progress indicator
- **Metrics Summary Cards**: Quick overview of Code Quality, Security, Performance, and Testing scores
- **Repository Activity Stats**: Basic statistics from the current period

### Metrics Tab
- **Comparative Bar Chart**: Visual comparison of all health metrics
- **Detailed Breakdowns**: Specific metrics for each category with values and explanations

### Issues Tab
- **Issues by Severity**: Pie chart showing distribution of issues
- **Detailed Issue List**: Complete list with severity badges, types, messages, and file locations
- **Empty State**: Congratulatory message when no issues are found

### Trends Tab
- **Period Selector**: Choose between 7d, 30d, 90d, and 1y time periods
- **Health Trend Line Chart**: Shows health score evolution over time
- **Activity Charts**: Separate area charts for commits and contributors

### Features
- **Real-time Data**: Hooks into repository health and statistics APIs
- **Interactive Charts**: Built with Recharts for responsive, interactive visualizations
- **Multiple Views**: Tabbed interface for different aspects of repository health
- **Loading States**: Proper loading indicators and error handling
- **Responsive Design**: Works across all device sizes
- **Color-coded Metrics**: Intuitive color system (green/yellow/red) based on scores
        `,
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the modal is open',
    },
    repositoryId: {
      control: 'text',
      description: 'Repository ID to fetch health data for',
    },
    repositoryName: {
      control: 'text',
      description: 'Repository name for display',
    },
  },
}

export default meta
type Story = StoryObj<typeof RepositoryHealthModal>

// Interactive story for healthy repository
const HealthyRepositoryDemo = (args: any, healthData: RepositoryHealthMetrics) => {
  const [isOpen, setIsOpen] = useState(false)

  // Set up mock service
  ;(window as any).__STORYBOOK_REPOSITORY_SERVICE__ = createMockService(
    healthData,
    mockStatisticsData
  )

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} variant="primary">
        Open Health Dashboard
      </Button>

      <RepositoryHealthModal {...args} open={isOpen} onOpenChange={setIsOpen} />
    </div>
  )
}

export const HealthyRepository: Story = {
  render: (args) => HealthyRepositoryDemo(args, mockHealthData),
  args: {
    repositoryId: 'healthy-repo',
    repositoryName: 'Healthy Repository',
  },
}

export const UnhealthyRepository: Story = {
  render: (args) => HealthyRepositoryDemo(args, mockUnhealthyData),
  args: {
    repositoryId: 'unhealthy-repo',
    repositoryName: 'Project with Issues',
  },
}

export const PerfectRepository: Story = {
  render: (args) => HealthyRepositoryDemo(args, mockPerfectData),
  args: {
    repositoryId: 'perfect-repo',
    repositoryName: 'Perfect Repository',
  },
}

// Story that opens the modal automatically for easier development
export const AlwaysOpen: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    repositoryId: 'demo-repo',
    repositoryName: 'Demo Repository',
  },
  render: (args) => {
    // Set up mock service
    ;(window as any).__STORYBOOK_REPOSITORY_SERVICE__ = createMockService(
      mockHealthData,
      mockStatisticsData
    )
    return <RepositoryHealthModal {...args} />
  },
}

// Story showing error state
export const WithError: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false)

    // Override the mock service to simulate an error
    ;(window as any).__STORYBOOK_REPOSITORY_SERVICE__ = {
      getRepositoryHealth: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return {
          success: false,
          error:
            'Failed to fetch repository health data. The analysis service may be temporarily unavailable.',
        }
      },
      getRepositoryStatistics: async () => {
        await new Promise((resolve) => setTimeout(resolve, 800))
        return {
          success: false,
          error: 'Statistics service error',
        }
      },
    }

    return (
      <div>
        <Button onClick={() => setIsOpen(true)} variant="primary">
          Open Dashboard (Error State)
        </Button>

        <RepositoryHealthModal {...args} open={isOpen} onOpenChange={setIsOpen} />
      </div>
    )
  },
  args: {
    repositoryId: 'error-repo',
    repositoryName: 'Error Repository',
  },
}

// Story showing loading state
export const LoadingState: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false)

    // Override the mock service to simulate slow loading
    ;(window as any).__STORYBOOK_REPOSITORY_SERVICE__ = {
      getRepositoryHealth: async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000)) // 10 second delay
        return {
          success: true,
          data: mockHealthData,
        }
      },
      getRepositoryStatistics: async () => {
        await new Promise((resolve) => setTimeout(resolve, 8000))
        return {
          success: true,
          data: mockStatisticsData,
        }
      },
    }

    return (
      <div>
        <Button onClick={() => setIsOpen(true)} variant="primary">
          Open Dashboard (Slow Loading)
        </Button>

        <RepositoryHealthModal {...args} open={isOpen} onOpenChange={setIsOpen} />
      </div>
    )
  },
  args: {
    repositoryId: 'slow-repo',
    repositoryName: 'Slow Repository',
  },
}

// Story showing empty data state
export const NoHealthData: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false)

    // Override the mock service to return no health data
    ;(window as any).__STORYBOOK_REPOSITORY_SERVICE__ = {
      getRepositoryHealth: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return {
          success: true,
          data: null,
        }
      },
      getRepositoryStatistics: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300))
        return {
          success: true,
          data: mockStatisticsData,
        }
      },
    }

    return (
      <div>
        <Button onClick={() => setIsOpen(true)} variant="primary">
          Open Dashboard (No Data)
        </Button>

        <RepositoryHealthModal {...args} open={isOpen} onOpenChange={setIsOpen} />
      </div>
    )
  },
  args: {
    repositoryId: 'empty-repo',
    repositoryName: 'Repository Without Health Data',
  },
}
