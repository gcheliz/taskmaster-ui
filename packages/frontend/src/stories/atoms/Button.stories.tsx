import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../components/ui/atoms/Button';
import { Icon, PlusIcon, CheckIcon, TrashIcon } from '../../components/ui/atoms/Icon';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states. Built with Tailwind CSS and class-variance-authority for consistent styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: { type: 'text' },
      description: 'Button content',
    },
    onClick: {
      action: 'clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

export const Loading: Story = {
  args: {
    children: 'Processing...',
    variant: 'primary',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    variant: 'primary',
    disabled: true,
  },
};

export const WithLeftIcon: Story = {
  args: {
    children: 'Add Item',
    variant: 'primary',
    leftIcon: <Icon icon={PlusIcon} size="sm" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Save Changes',
    variant: 'primary',
    rightIcon: <Icon icon={CheckIcon} size="sm" />,
  },
};

export const IconOnly: Story = {
  args: {
    variant: 'outline',
    size: 'icon',
    children: <Icon icon={TrashIcon} size="sm" />,
    'aria-label': 'Delete item',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const InteractiveStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button variant="primary">Normal</Button>
        <Button variant="primary" className="hover:bg-primary-700">Hover</Button>
        <Button variant="primary" className="focus:ring-2 focus:ring-primary-500">Focus</Button>
      </div>
      <div className="flex gap-4">
        <Button variant="primary" loading>Loading</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </div>
    </div>
  ),
};