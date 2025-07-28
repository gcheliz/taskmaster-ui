import type { Meta, StoryObj } from '@storybook/react';
import { ButtonPrimary } from './ButtonPrimary';

const meta = {
  title: 'Atoms/ButtonPrimary',
  component: ButtonPrimary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    onClick: { control: 'object' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: { control: 'object' },
  },
} satisfies Meta<typeof ButtonPrimary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'medium',
  },
};
