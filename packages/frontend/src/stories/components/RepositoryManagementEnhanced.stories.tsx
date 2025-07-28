import type { Meta, StoryObj } from '@storybook/react-vite'
import { RepositoryManagementEnhanced } from '../../components/Repository/RepositoryManagementEnhanced'
// Storybook interactions temporarily disabled due to missing dependencies

const meta = {
  title: 'Components/Repository/Repository Management Enhanced',
  component: RepositoryManagementEnhanced,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RepositoryManagementEnhanced>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onAddRepository: () => console.log('Add repository clicked'),
  },
}

export const WithSearch: Story = {
  args: {
    onAddRepository: () => console.log('Add repository clicked'),
  },
  // Interactions disabled temporarily
}

export const WithFilters: Story = {
  args: {
    onAddRepository: () => console.log('Add repository clicked'),
  },
  // Interactions disabled temporarily
}

export const WithSelection: Story = {
  args: {
    onAddRepository: () => console.log('Add repository clicked'),
  },
  // Interactions disabled temporarily
}

export const BatchOperations: Story = {
  args: {
    onAddRepository: () => console.log('Add repository clicked'),
  },
  // Interactions disabled temporarily
}

export const EmptyState: Story = {
  args: {
    onAddRepository: () => console.log('Add repository clicked'),
  },
  parameters: {
    mockData: {
      repositories: [],
    },
  },
}

export const LoadingState: Story = {
  args: {
    onAddRepository: () => console.log('Add repository clicked'),
  },
  parameters: {
    mockData: {
      loading: true,
    },
  },
}

export const WithOperationResult: Story = {
  args: {
    onAddRepository: () => console.log('Add repository clicked'),
  },
  parameters: {
    mockData: {
      operationResult: {
        successful: ['repo1', 'repo2', 'repo3'],
        failed: [
          { id: 'repo4', error: 'Permission denied' },
          { id: 'repo5', error: 'Repository not found' },
        ],
        total: 5,
      },
    },
  },
}