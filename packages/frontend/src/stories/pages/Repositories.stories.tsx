import type { Meta, StoryObj } from '@storybook/react'
import Repositories from '../../pages/Repositories'

const meta: Meta<typeof Repositories> = {
  title: 'Pages/Repositories',
  component: Repositories,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main Repositories page showing all connected repositories with their status, metrics, and actions.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The default Repositories view with sample repository data showing various states and metrics.',
      },
    },
  },
}

export const LoadingState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Repositories page in loading state (shows sample data after loading).',
      },
    },
  },
}

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Repositories page optimized for mobile devices with responsive card layout.',
      },
    },
  },
}

export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Repositories page on tablet-sized screens.',
      },
    },
  },
}

export const DarkMode: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Repositories page with dark mode styling.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
}