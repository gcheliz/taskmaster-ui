import type { Meta, StoryObj } from '@storybook/react';
import { UserProfile } from './UserProfile';

const meta = {
  title: 'Organisms/UserProfile',
  component: UserProfile,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    userId: { control: 'text' },
    showActions: { control: 'boolean' },
  },
} satisfies Meta<typeof UserProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showActions: true,
  },
};
