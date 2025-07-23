import type { Meta, StoryObj } from '@storybook/react'
import { RepositoryDashboard } from '../../components/Repository/RepositoryDashboard'
import { EnhancedRepositoryCard } from '../../components/Repository/EnhancedRepositoryCard'
import { RepositoryStatisticsCard } from '../../components/Repository/RepositoryStatisticsCard'
import { CommitActivityChart } from '../../components/Repository/CommitActivityChart'
import { ContributorsCard } from '../../components/Repository/ContributorsCard'

// Mock data
const mockRepositoryData = {
  id: '1',
  name: 'taskmaster-ui',
  description: 'A comprehensive task management UI with Git integration',
  language: 'TypeScript',
  stars: 128,
  forks: 24,
  defaultBranch: 'main',
  lastPush: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  gitStatus: {
    branch: 'main',
    ahead: 2,
    behind: 0,
    isClean: false,
  },
  stats: {
    totalCommits: 1847,
    totalContributors: 12,
  },
  status: 'connected' as const,
}

const meta = {
  title: 'Components/Repository/Dashboard',
  component: RepositoryDashboard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RepositoryDashboard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onAddRepository: () => console.log('Add repository'),
    onRepositoryDetails: (id) => console.log('View details:', id),
    onRepositorySettings: (id) => console.log('Settings:', id),
    onRepositoryRemove: (id) => console.log('Remove:', id),
  },
}

export const EnhancedCard: StoryObj<typeof EnhancedRepositoryCard> = {
  render: () => (
    <div className="max-w-md">
      <EnhancedRepositoryCard
        repositoryId="1"
        onViewDetails={() => console.log('View details')}
        onSettings={() => console.log('Settings')}
        onRemove={() => console.log('Remove')}
        onSync={() => console.log('Sync')}
        showBatchSelect
      />
    </div>
  ),
}

export const StatisticsCard: StoryObj<typeof RepositoryStatisticsCard> = {
  render: () => (
    <div className="max-w-2xl">
      <RepositoryStatisticsCard repositoryId="1" />
    </div>
  ),
}

export const ActivityChart: StoryObj<typeof CommitActivityChart> = {
  render: () => (
    <div className="max-w-4xl">
      <CommitActivityChart repositoryId="1" />
    </div>
  ),
}

export const Contributors: StoryObj<typeof ContributorsCard> = {
  render: () => (
    <div className="max-w-2xl">
      <ContributorsCard repositoryId="1" maxContributors={10} />
    </div>
  ),
}

export const CompleteDashboard: Story = {
  render: () => (
    <div className="space-y-8">
      <RepositoryDashboard
        onAddRepository={() => console.log('Add repository')}
        onRepositoryDetails={(id) => console.log('View details:', id)}
        onRepositorySettings={(id) => console.log('Settings:', id)}
        onRepositoryRemove={(id) => console.log('Remove:', id)}
      />
      
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-6">Individual Components</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RepositoryStatisticsCard repositoryId="1" />
          <CommitActivityChart repositoryId="1" />
          <ContributorsCard repositoryId="1" className="lg:col-span-2" />
        </div>
      </div>
    </div>
  ),
}