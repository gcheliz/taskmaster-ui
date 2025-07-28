import type { Meta, StoryObj } from '@storybook/react';
import { FeatureCard } from 'FeatureCard';

/**
 * Feature showcase card with icon and hover effects
 */
const meta = {
  title: 'Molecules/FeatureCard',
  component: FeatureCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Feature showcase card with icon and hover effects',
      },
    },
    layout: 'centered',
  },
  tags: ['autodocs'],

  argTypes: {
    title: {
      description: 'Feature title',
      control: { type: 'text' },
    },
    description: {
      description: 'Feature description',
      control: { type: 'text' },
    },
    icon: {
      description: 'Feature icon',
      control: { type: 'text' },
    },
    href: {
      description: 'Link URL',
      control: { type: 'text' },
    },
    highlighted: {
      description: 'Highlight card',
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof FeatureCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default FeatureCard story
 */
export const Default: Story = {
  args: {
    title: 'Example title',
    description: 'Example description',
    children: 'Example content',
  },
};

/**
 * Playground story for experimenting with FeatureCard
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
