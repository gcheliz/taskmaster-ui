import type { Meta, StoryObj } from '@storybook/react';
import { ActionButton } from 'ActionButton';

/**
 * Versatile action button with multiple variants and sizes
 */
const meta = {
  title: 'Atoms/ActionButton',
  component: ActionButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Versatile action button with multiple variants and sizes',
      },
    },
    layout: 'centered',
  },
  tags: ['autodocs'],

  argTypes: {
    label: {
      description: 'Button text',
      control: { type: 'text' },
    },
    onClick: {
      description: 'Click handler',
      control: { type: 'action' },
    },
    variant: {
      control: {
        type: 'select',
        options: ['primary', 'secondary', 'danger', 'success', 'ghost'],
      },
      defaultValue: 'primary',
    },
    size: {
      control: { type: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      defaultValue: 'md',
    },
    loading: {
      description: 'Show loading spinner',
      control: { type: 'boolean' },
    },
    disabled: {
      description: 'Disable button',
      control: { type: 'boolean' },
    },
    fullWidth: {
      description: 'Full width button',
      control: { type: 'boolean' },
    },
    icon: {
      description: 'Icon to display',
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof ActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default ActionButton story
 */
export const Default: Story = {
  args: {
    label: 'Example label',
    onClick: () => console.log('Clicked'),
    variant: 'primary',
    size: 'md',
  },
};

/**
 * Button with an icon
 */
export const WithIcon: Story = {
  args: {
    ...Default.args,
    label: 'Save Changes',
    icon: '<SaveIcon />',
  },
};

/**
 * Button in loading state
 */
export const LoadingState: Story = {
  args: {
    ...Default.args,
    label: 'Processing...',
    loading: true,
    disabled: true,
  },
};

/**
 * Playground story for experimenting with ActionButton
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
