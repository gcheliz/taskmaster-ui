import type { Meta, StoryObj } from '@storybook/react'
import TaskBoard from '../../pages/TaskBoard'

const meta: Meta<typeof TaskBoard> = {
  title: 'Pages/TaskBoard',
  component: TaskBoard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main Task Board page with drag and drop functionality, filtering, and sorting capabilities.',
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
        story: 'The default Task Board view with sample tasks in different columns.',
      },
    },
  },
}

export const EmptyBoard: Story = {
  render: () => {
    // We can't easily override the initial tasks, so this will still show the default tasks
    return <TaskBoard />
  },
  parameters: {
    docs: {
      description: {
        story: 'Task Board with initial state (contains sample tasks by default).',
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
        story: 'Task Board optimized for mobile devices with responsive layout.',
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
        story: 'Task Board on tablet-sized screens.',
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
        story: 'Task Board with dark mode styling.',
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