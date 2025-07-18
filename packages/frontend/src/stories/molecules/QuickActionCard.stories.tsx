import type { Meta, StoryObj } from '@storybook/react-vite';
import { QuickActionCard } from '../../components/ui/molecules/QuickActionCard';
import { TaskIcon, NotificationIcon, UserCircleIcon, DuplicateIcon, PlusIcon, SettingsIcon, ArchiveIcon } from '../../components/ui/atoms/Icon';

const meta: Meta<typeof QuickActionCard> = {
  title: 'UI/Molecules/QuickActionCard',
  component: QuickActionCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error', 'outline'],
    },
    iconColor: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error', 'muted'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'create-task',
    title: 'Create Task',
    description: 'Add a new task to your project',
    icon: TaskIcon,
    iconColor: 'primary',
    variant: 'outline',
    onClick: () => console.log('Card clicked'),
  },
};

export const Primary: Story = {
  args: {
    id: 'create-task',
    title: 'Create Task',
    description: 'Add a new task to your project',
    icon: TaskIcon,
    iconColor: 'primary',
    variant: 'primary',
    onClick: () => console.log('Primary card clicked'),
  },
};

export const WithBadge: Story = {
  args: {
    id: 'manage-team',
    title: 'Manage Team',
    description: 'Add or remove team members',
    icon: UserCircleIcon,
    iconColor: 'warning',
    variant: 'outline',
    badge: {
      text: 'Admin',
      variant: 'warning'
    },
    onClick: () => console.log('Manage team clicked'),
  },
};

export const WithShortcut: Story = {
  args: {
    id: 'export-data',
    title: 'Export Data',
    description: 'Download project data in various formats',
    icon: DuplicateIcon,
    iconColor: 'secondary',
    variant: 'outline',
    shortcut: 'Ctrl+E',
    onClick: () => console.log('Export data clicked'),
  },
};

export const Success: Story = {
  args: {
    id: 'add-member',
    title: 'Add Member',
    description: 'Invite new team members to the project',
    icon: PlusIcon,
    iconColor: 'success',
    variant: 'success',
    onClick: () => console.log('Add member clicked'),
  },
};

export const Warning: Story = {
  args: {
    id: 'project-settings',
    title: 'Project Settings',
    description: 'Configure project preferences and settings',
    icon: SettingsIcon,
    iconColor: 'warning',
    variant: 'warning',
    onClick: () => console.log('Project settings clicked'),
  },
};

export const Error: Story = {
  args: {
    id: 'archive-project',
    title: 'Archive Project',
    description: 'Archive completed or inactive projects',
    icon: ArchiveIcon,
    iconColor: 'error',
    variant: 'error',
    onClick: () => console.log('Archive project clicked'),
  },
};

export const Disabled: Story = {
  args: {
    id: 'disabled-action',
    title: 'Disabled Action',
    description: 'This action is currently disabled',
    icon: ArchiveIcon,
    iconColor: 'muted',
    variant: 'outline',
    disabled: true,
    onClick: () => console.log('This should not be called'),
  },
};

export const Loading: Story = {
  args: {
    id: 'loading-action',
    title: 'Loading Action',
    description: 'This action is currently loading',
    icon: TaskIcon,
    iconColor: 'primary',
    variant: 'primary',
    loading: true,
    onClick: () => console.log('Loading action clicked'),
  },
};

export const LongTitle: Story = {
  args: {
    id: 'long-title',
    title: 'Generate Comprehensive Project Report',
    description: 'Create detailed analytics and insights report for the current project with all metrics and performance data included',
    icon: NotificationIcon,
    iconColor: 'success',
    variant: 'outline',
    onClick: () => console.log('Long title clicked'),
  },
};

export const NoDescription: Story = {
  args: {
    id: 'no-description',
    title: 'Simple Action',
    icon: TaskIcon,
    iconColor: 'primary',
    variant: 'outline',
    onClick: () => console.log('Simple action clicked'),
  },
};

export const WithShortcutAndBadge: Story = {
  args: {
    id: 'complex-action',
    title: 'Complex Action',
    description: 'An action with both shortcut and badge',
    icon: SettingsIcon,
    iconColor: 'primary',
    variant: 'outline',
    shortcut: 'Ctrl+Shift+A',
    badge: {
      text: 'New',
      variant: 'success'
    },
    onClick: () => console.log('Complex action clicked'),
  },
};