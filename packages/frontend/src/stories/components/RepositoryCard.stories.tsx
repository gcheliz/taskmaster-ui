import type { Meta, StoryObj } from '@storybook/react-vite'
import { RepositoryCard } from '../../components/Repository/RepositoryCard'
import type { RepositoryCardProps } from '../../components/Repository/RepositoryCard'

const meta: Meta<typeof RepositoryCard> = {
  title: 'Components/Repository/RepositoryCard',
  component: RepositoryCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive repository card component with Git integration status, health metrics, and real-time updates.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Card size variant',
    },
    showDetails: {
      control: 'boolean',
      description: 'Whether to show detailed statistics',
    },
    showHealth: {
      control: 'boolean',
      description: 'Whether to show health metrics',
    },
    showIntegrations: {
      control: 'boolean',
      description: 'Whether to show integration status',
    },
    enableRealtime: {
      control: 'boolean',
      description: 'Whether to enable real-time updates',
    },
    onClick: { action: 'clicked' },
    onRefresh: { action: 'refresh' },
    onViewDetails: { action: 'view details' },
    onViewCommits: { action: 'view commits' },
    onManage: { action: 'manage' },
  },
}

export default meta
type Story = StoryObj<typeof RepositoryCard>

// Sample repository data
const sampleRepository: RepositoryCardProps['repository'] = {
  id: 'repo-1',
  name: 'taskmaster-ui',
  description: 'A modern task management interface built with React and TypeScript',
  path: '/Users/user/projects/taskmaster-ui',
  currentBranch: 'main',
  lastCommit: {
    hash: 'a1b2c3d',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    message: 'Add repository card components with enhanced Git integration',
    author: {
      name: 'John Doe',
      email: 'john@example.com',
    },
  },
  status: {
    isClean: true,
    staged: 0,
    unstaged: 0,
    untracked: 0,
    conflicted: 0,
    ahead: 0,
    behind: 0,
  },
  url: 'https://github.com/company/taskmaster-ui',
  starCount: 127,
  forkCount: 23,
  language: 'TypeScript',
  isPrivate: false,
  size: 2048, // 2MB
}

const privateRepository: RepositoryCardProps['repository'] = {
  ...sampleRepository,
  id: 'repo-2',
  name: 'internal-tools',
  description: 'Internal development tools and utilities',
  isPrivate: true,
  starCount: 8,
  forkCount: 2,
  language: 'Python',
  currentBranch: 'develop',
  status: {
    isClean: false,
    staged: 3,
    unstaged: 2,
    untracked: 1,
    conflicted: 0,
    ahead: 2,
    behind: 0,
  },
}

const outdatedRepository: RepositoryCardProps['repository'] = {
  ...sampleRepository,
  id: 'repo-3',
  name: 'legacy-system',
  description: 'Legacy system requiring updates and maintenance',
  language: 'JavaScript',
  lastCommit: {
    ...sampleRepository.lastCommit,
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    message: 'Fix critical security vulnerability',
  },
  status: {
    isClean: true,
    staged: 0,
    unstaged: 0,
    untracked: 0,
    conflicted: 0,
    ahead: 0,
    behind: 5,
  },
  starCount: 45,
  forkCount: 12,
}

export const Default: Story = {
  args: {
    repository: sampleRepository,
    size: 'md',
    showDetails: false,
    showHealth: false,
    showIntegrations: false,
    enableRealtime: false,
  },
}

export const WithDetails: Story = {
  args: {
    repository: sampleRepository,
    size: 'md',
    showDetails: true,
    showHealth: false,
    showIntegrations: false,
    enableRealtime: false,
  },
}

export const WithHealth: Story = {
  args: {
    repository: sampleRepository,
    size: 'md',
    showDetails: false,
    showHealth: true,
    showIntegrations: false,
    enableRealtime: false,
  },
}

export const WithIntegrations: Story = {
  args: {
    repository: sampleRepository,
    size: 'md',
    showDetails: false,
    showHealth: false,
    showIntegrations: true,
    enableRealtime: false,
  },
}

export const FullyEnhanced: Story = {
  args: {
    repository: sampleRepository,
    size: 'lg',
    showDetails: true,
    showHealth: true,
    showIntegrations: true,
    enableRealtime: true,
  },
}

export const PrivateRepository: Story = {
  args: {
    repository: privateRepository,
    size: 'md',
    showDetails: true,
    showHealth: false,
    showIntegrations: false,
    enableRealtime: false,
  },
}

export const OutdatedRepository: Story = {
  args: {
    repository: outdatedRepository,
    size: 'md',
    showDetails: true,
    showHealth: false,
    showIntegrations: false,
    enableRealtime: false,
  },
}

export const SmallSize: Story = {
  args: {
    repository: sampleRepository,
    size: 'sm',
    showDetails: false,
    showHealth: false,
    showIntegrations: false,
    enableRealtime: false,
  },
}

export const LargeSize: Story = {
  args: {
    repository: sampleRepository,
    size: 'lg',
    showDetails: true,
    showHealth: true,
    showIntegrations: true,
    enableRealtime: true,
  },
}

// Multiple repositories in different states
export const MultipleStates: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <RepositoryCard
        repository={sampleRepository}
        size="md"
        showDetails={true}
        showHealth={true}
      />
      <RepositoryCard
        repository={privateRepository}
        size="md"
        showDetails={true}
        showIntegrations={true}
      />
      <RepositoryCard
        repository={outdatedRepository}
        size="md"
        showDetails={true}
        showHealth={true}
      />
    </div>
  ),
}

export const InteractiveExample: Story = {
  args: {
    repository: sampleRepository,
    size: 'md',
    showDetails: true,
    showHealth: true,
    showIntegrations: true,
    enableRealtime: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'An interactive repository card with all features enabled. Click the action buttons to see the interactions.',
      },
    },
  },
}
