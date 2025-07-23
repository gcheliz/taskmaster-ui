import type { Meta, StoryObj } from '@storybook/react'
import { QuickActionsGrid } from '../../components/ui/organisms/QuickActionsGrid'
import {
  TaskIcon,
  NotificationIcon,
  UserCircleIcon,
  DuplicateIcon,
  PlusIcon,
  SettingsIcon,
  ArchiveIcon,
} from '../../components/ui/atoms/Icon'
import type { QuickAction } from '../../components/ui/organisms/QuickActionsGrid'

const meta: Meta<typeof QuickActionsGrid> = {
  title: 'Organisms/QuickActionsGrid',
  component: QuickActionsGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A quick actions grid organism that combines multiple button atoms and icon atoms to create an actionable dashboard interface. Assembles various action molecules with responsive grid layout to provide users with immediate access to common project operations. Demonstrates atomic design principles through systematic composition.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
    },
    loading: { control: 'boolean' },
    showCategories: { control: 'boolean' },
    maxItems: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const sampleActions: QuickAction[] = [
  {
    id: 'create-task',
    title: 'Create Task',
    description: 'Add a new task to your project',
    icon: TaskIcon,
    iconColor: 'primary',
    variant: 'primary',
    shortcut: 'Ctrl+N',
    category: 'task',
    onClick: () => console.log('Create task clicked'),
  },
  {
    id: 'view-reports',
    title: 'View Reports',
    description: 'Access project analytics and reports',
    icon: NotificationIcon,
    iconColor: 'success',
    variant: 'outline',
    shortcut: 'Ctrl+R',
    category: 'project',
    onClick: () => console.log('View reports clicked'),
  },
  {
    id: 'manage-team',
    title: 'Manage Team',
    description: 'Add or remove team members',
    icon: UserCircleIcon,
    iconColor: 'warning',
    variant: 'outline',
    badge: {
      text: 'Admin',
      variant: 'warning',
    },
    shortcut: 'Ctrl+T',
    category: 'team',
    onClick: () => console.log('Manage team clicked'),
  },
  {
    id: 'export-data',
    title: 'Export Data',
    description: 'Download project data in various formats',
    icon: DuplicateIcon,
    iconColor: 'secondary',
    variant: 'outline',
    shortcut: 'Ctrl+E',
    category: 'system',
    onClick: () => console.log('Export data clicked'),
  },
  {
    id: 'add-member',
    title: 'Add Member',
    description: 'Invite new team members to the project',
    icon: PlusIcon,
    iconColor: 'success',
    variant: 'outline',
    category: 'team',
    onClick: () => console.log('Add member clicked'),
  },
  {
    id: 'project-settings',
    title: 'Project Settings',
    description: 'Configure project preferences and settings',
    icon: SettingsIcon,
    iconColor: 'muted',
    variant: 'outline',
    category: 'system',
    onClick: () => console.log('Project settings clicked'),
  },
  {
    id: 'archive-project',
    title: 'Archive Project',
    description: 'Archive completed or inactive projects',
    icon: ArchiveIcon,
    iconColor: 'error',
    variant: 'outline',
    category: 'project',
    disabled: true,
    onClick: () => console.log('Archive project clicked'),
  },
]

export const Default: Story = {
  args: {
    actions: sampleActions,
  },
}

export const Loading: Story = {
  args: {
    loading: true,
  },
}

export const Empty: Story = {
  args: {
    actions: [],
  },
}

export const TwoColumns: Story = {
  args: {
    actions: sampleActions,
    columns: 2,
  },
}

export const ThreeColumns: Story = {
  args: {
    actions: sampleActions,
    columns: 3,
  },
}

export const SixColumns: Story = {
  args: {
    actions: sampleActions,
    columns: 6,
  },
}

export const WithCategories: Story = {
  args: {
    actions: sampleActions,
    showCategories: true,
  },
}

export const LimitedItems: Story = {
  args: {
    actions: sampleActions,
    maxItems: 4,
  },
}

export const CustomTitle: Story = {
  args: {
    actions: sampleActions,
    title: 'Project Actions',
    description: 'Manage your project with these powerful tools',
  },
}

export const OnlyTaskActions: Story = {
  args: {
    actions: sampleActions.filter((action) => action.category === 'task'),
    title: 'Task Management',
    description: 'Actions related to task management',
  },
}

export const OnlyTeamActions: Story = {
  args: {
    actions: sampleActions.filter((action) => action.category === 'team'),
    title: 'Team Management',
    description: 'Actions for managing your team',
  },
}

export const OnlySystemActions: Story = {
  args: {
    actions: sampleActions.filter((action) => action.category === 'system'),
    title: 'System Actions',
    description: 'System configuration and management',
  },
}

export const SingleColumn: Story = {
  args: {
    actions: sampleActions.slice(0, 4),
    columns: 1,
  },
}

export const MixedVariants: Story = {
  args: {
    actions: [
      {
        id: 'primary-action',
        title: 'Primary Action',
        description: 'Main action with primary styling',
        icon: TaskIcon,
        iconColor: 'primary',
        variant: 'primary',
        onClick: () => console.log('Primary action clicked'),
      },
      {
        id: 'success-action',
        title: 'Success Action',
        description: 'Action with success styling',
        icon: PlusIcon,
        iconColor: 'success',
        variant: 'success',
        onClick: () => console.log('Success action clicked'),
      },
      {
        id: 'warning-action',
        title: 'Warning Action',
        description: 'Action with warning styling',
        icon: SettingsIcon,
        iconColor: 'warning',
        variant: 'warning',
        onClick: () => console.log('Warning action clicked'),
      },
      {
        id: 'error-action',
        title: 'Error Action',
        description: 'Action with error styling',
        icon: ArchiveIcon,
        iconColor: 'error',
        variant: 'error',
        onClick: () => console.log('Error action clicked'),
      },
    ],
  },
}

export const WithBadgesAndShortcuts: Story = {
  args: {
    actions: sampleActions.map((action) => ({
      ...action,
      badge: action.badge || {
        text: 'Available',
        variant: 'secondary' as const,
      },
    })),
    title: 'Enhanced Actions',
    description: 'All actions with badges and shortcuts',
  },
}
