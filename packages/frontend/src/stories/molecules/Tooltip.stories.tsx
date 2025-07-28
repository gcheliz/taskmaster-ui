import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tooltip } from '../../components/ui/Tooltip'
import { Button } from '../../components/ui/atoms/Button'

const meta: Meta<typeof Tooltip> = {
  title: 'Molecules/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A tooltip component that displays helpful information on hover.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: { type: 'text' },
      description: 'Content to display in the tooltip',
    },
    placement: {
      control: { type: 'select' },
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Placement of the tooltip relative to the trigger',
    },
    delay: {
      control: { type: 'number' },
      description: 'Delay in milliseconds before showing the tooltip',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content: 'This is a helpful tooltip',
    children: <Button>Hover me</Button>,
  },
}

export const TopPlacement: Story = {
  args: {
    content: 'Tooltip on top',
    placement: 'top',
    children: <Button>Top tooltip</Button>,
  },
}

export const RightPlacement: Story = {
  args: {
    content: 'Tooltip on right',
    placement: 'right',
    children: <Button>Right tooltip</Button>,
  },
}

export const BottomPlacement: Story = {
  args: {
    content: 'Tooltip on bottom',
    placement: 'bottom',
    children: <Button>Bottom tooltip</Button>,
  },
}

export const LeftPlacement: Story = {
  args: {
    content: 'Tooltip on left',
    placement: 'left',
    children: <Button>Left tooltip</Button>,
  },
}

export const LongContent: Story = {
  args: {
    content: 'This is a very long tooltip content that should wrap nicely when displayed',
    children: <Button>Long tooltip</Button>,
  },
}

export const NoDelay: Story = {
  args: {
    content: 'Instant tooltip',
    delay: 0,
    children: <Button>Instant</Button>,
  },
}

export const CustomDelay: Story = {
  args: {
    content: 'Delayed tooltip',
    delay: 1000,
    children: <Button>1s delay</Button>,
  },
}