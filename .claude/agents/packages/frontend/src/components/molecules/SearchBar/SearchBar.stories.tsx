import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from './SearchBar';

const meta = {
  title: 'Molecules/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    "value: { control: 'text' },
    onChange: { control: 'object' },
    placeholder: { control: 'object' },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    
    children: 'Example content',
  },
};
