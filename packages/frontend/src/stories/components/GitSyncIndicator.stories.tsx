import type { Meta, StoryObj } from '@storybook/react-vite'
import { GitSyncIndicator } from '../../components/Repository/GitSyncIndicator'
import { WebSocketProvider } from '../../providers/WebSocketProvider'

const meta = {
  title: 'Components/Repository/Git Sync Indicator',
  component: GitSyncIndicator,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <WebSocketProvider>
        <Story />
      </WebSocketProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    repositoryId: {
      control: 'text',
      description: 'Repository ID to monitor',
    },
    showEvents: {
      control: 'boolean',
      description: 'Show event log',
    },
    compact: {
      control: 'boolean',
      description: 'Use compact view',
    },
  },
} satisfies Meta<typeof GitSyncIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    repositoryId: '1',
    showEvents: true,
    compact: false,
  },
}

export const Compact: Story = {
  args: {
    repositoryId: '1',
    compact: true,
  },
}

export const WithoutEvents: Story = {
  args: {
    repositoryId: '1',
    showEvents: false,
  },
}

export const MultipleIndicators: Story = {
  args: {
    repositoryId: '1',
  },
  render: () => (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Repository 1</h3>
        <GitSyncIndicator repositoryId="1" showEvents={true} />
      </div>
      
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Repository 2</h3>
        <GitSyncIndicator repositoryId="2" showEvents={true} />
      </div>
      
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Compact Indicators</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Repo 1:</span>
            <GitSyncIndicator repositoryId="1" compact />
          </div>
          <div className="flex items-center justify-between">
            <span>Repo 2:</span>
            <GitSyncIndicator repositoryId="2" compact />
          </div>
          <div className="flex items-center justify-between">
            <span>Repo 3:</span>
            <GitSyncIndicator repositoryId="3" compact />
          </div>
        </div>
      </div>
    </div>
  ),
}

export const InDashboard: Story = {
  args: {
    repositoryId: '1',
  },
  render: () => (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Repository Dashboard</h2>
          <GitSyncIndicator repositoryId="1" compact />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Branch Status</h3>
            <p className="text-sm text-slate-600">main (default)</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Last Commit</h3>
            <p className="text-sm text-slate-600">2 hours ago</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Open PRs</h3>
            <p className="text-sm text-slate-600">3 pull requests</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Git Activity Monitor</h3>
        <GitSyncIndicator repositoryId="1" showEvents />
      </div>
    </div>
  ),
}