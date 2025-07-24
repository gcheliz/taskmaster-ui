import type { Meta, StoryObj } from '@storybook/react'
import { AddRepository } from '../../components/Repository/AddRepository'

const meta: Meta<typeof AddRepository> = {
  title: 'Components/Repository/AddRepository',
  component: AddRepository,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Component for adding new repositories to the TaskMaster system. Used in the Repositories page modal.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onRepositoryAdd: {
      action: 'repository-added',
      description: 'Callback when repository is submitted',
    },
    isLoading: {
      control: 'boolean',
      description: 'Loading state of the form',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    clearOnSuccess: {
      control: 'boolean',
      description: 'Whether to clear form on successful submission',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    clearOnSuccess: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state of the AddRepository component.',
      },
    },
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'AddRepository component in loading state.',
      },
    },
  },
}

export const WithError: Story = {
  args: {
    error: 'Failed to connect repository. Please check the path and try again.',
  },
  parameters: {
    docs: {
      description: {
        story: 'AddRepository component displaying an error message.',
      },
    },
  },
}

export const Interactive: Story = {
  render: () => {
    const handleAdd = async (path: string) => {
      console.log('Adding repository:', path)
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Repository added successfully')
    }

    return (
      <div className="bg-white p-8 rounded-lg shadow-lg" style={{ width: '600px' }}>
        <AddRepository 
          onRepositoryAdd={handleAdd}
          clearOnSuccess={true}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example with async operation simulation.',
      },
    },
  },
}

export const InModal: Story = {
  render: () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <AddRepository 
            className="p-6"
            clearOnSuccess={true}
          />
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'AddRepository component as it appears inside a modal dialog.',
      },
    },
  },
}