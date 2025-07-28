import type { Meta, StoryObj } from '@storybook/react';
import { FormInput } from 'FormInput';

/**
 * Form input with validation and error states
 */
const meta = {
  title: 'Atoms/FormInput',
  component: FormInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Form input with validation and error states',
      },
    },
    layout: 'centered',
  },
  tags: ['autodocs'],

  argTypes: {
    label: {
      description: 'Input label',
      control: { type: 'text' },
    },
    value: {
      description: 'Input value',
      control: { type: 'text' },
    },
    onChange: {
      description: 'Change handler',
      control: { type: 'object' },
    },
    type: {
      control: {
        type: 'select',
        options: ['text', 'email', 'password', 'number'],
      },
      defaultValue: 'text',
    },
    placeholder: {
      description: 'Placeholder text',
      control: { type: 'text' },
    },
    error: {
      description: 'Error message',
      control: { type: 'text' },
    },
    disabled: {
      description: 'Disable input',
      control: { type: 'boolean' },
    },
    required: {
      description: 'Required field',
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof FormInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default FormInput story
 */
export const Default: Story = {
  args: {
    label: 'Example label',
    value: 'Example value',
    onChange: undefined,
    type: 'text',
  },
};

/**
 * Input showing error state
 */
export const WithError: Story = {
  args: {
    ...Default.args,
    label: 'Email',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
  },
};

/**
 * Required input field
 */
export const Required: Story = {
  args: {
    ...Default.args,
    label: 'Username',
    value: '',
    required: true,
    placeholder: 'Enter your username',
  },
};

/**
 * Playground story for experimenting with FormInput
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
