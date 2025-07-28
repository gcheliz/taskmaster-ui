import type { Meta, StoryObj } from '@storybook/react';
import { GridLayout } from 'GridLayout';

/**
 * Responsive grid layout with configurable columns
 */
const meta = {
  title: 'Molecules/GridLayout',
  component: GridLayout,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Responsive grid layout with configurable columns',
      },
    },
    layout: 'centered',
  },
  tags: ['autodocs'],

  argTypes: {
    cols: {
      description: 'Column configuration',
      control: { type: 'object' },
    },
    gap: {
      control: { type: 'select', options: ['2', '4', '6', '8'] },
      defaultValue: '4',
    },
    className: {
      description: 'Additional classes',
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof GridLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default GridLayout story
 */
export const Default: Story = {
  args: {
    cols: undefined,
    gap: '4',
    children: 'Example content',
  },
};

/**
 * Playground story for experimenting with GridLayout
 */
export const Playground: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use the controls below to experiment with different prop combinations.',
      },
    },
  },
};
