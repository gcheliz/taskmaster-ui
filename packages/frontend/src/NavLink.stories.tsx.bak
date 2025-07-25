import type { Meta, StoryObj } from '@storybook/react'
import { NavLink } from '../../components/ui/atoms/NavLink'
import {
  Icon,
  HomeFilledIcon,
  SettingsIcon,
  UserCircleIcon,
  NotificationIcon,
  TaskIcon,
  CompleteIcon,
  WarningIcon,
  StarFilledIcon,
} from '../../components/ui/atoms/Icon'

const meta = {
  title: 'Atoms/NavLink',
  component: NavLink,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'ghost', 'underline', 'active'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    rounded: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'full'],
    },
    isActive: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    external: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof NavLink>

export default meta
type Story = StoryObj<typeof meta>

// Basic NavLink Examples
export const Default: Story = {
  args: {
    variant: 'default',
    size: 'md',
    rounded: 'md',
    isActive: false,
    disabled: false,
    external: false,
    children: 'Home',
    href: '#',
  },
}

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Dashboard',
    href: '#',
  },
}

export const Active: Story = {
  args: {
    variant: 'default',
    size: 'md',
    isActive: true,
    children: 'Current Page',
    href: '#',
  },
}

export const WithIcon: Story = {
  args: {
    variant: 'default',
    size: 'md',
    icon: HomeFilledIcon,
    children: 'Home',
    href: '#',
  },
}

export const WithEndIcon: Story = {
  args: {
    variant: 'default',
    size: 'md',
    endIcon: SettingsIcon,
    children: 'Settings',
    href: '#',
  },
}

export const IconOnly: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    icon: NotificationIcon,
    href: '#',
    'aria-label': 'Notifications',
  },
}

export const External: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    external: true,
    children: 'External Link',
    href: 'https://example.com',
  },
}

export const Disabled: Story = {
  args: {
    variant: 'default',
    size: 'md',
    disabled: true,
    children: 'Disabled Link',
    href: '#',
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-wrap gap-4">
        <NavLink variant="default" href="#">
          Default
        </NavLink>
        <NavLink variant="primary" href="#">
          Primary
        </NavLink>
        <NavLink variant="ghost" href="#">
          Ghost
        </NavLink>
        <NavLink variant="underline" href="#">
          Underline
        </NavLink>
        <NavLink variant="active" href="#">
          Active
        </NavLink>
      </div>

      <div className="flex flex-wrap gap-4">
        <NavLink variant="default" isActive href="#">
          Default Active
        </NavLink>
        <NavLink variant="primary" isActive href="#">
          Primary Active
        </NavLink>
        <NavLink variant="ghost" isActive href="#">
          Ghost Active
        </NavLink>
        <NavLink variant="underline" isActive href="#">
          Underline Active
        </NavLink>
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <NavLink size="sm" href="#">
          Small
        </NavLink>
        <NavLink size="md" href="#">
          Medium
        </NavLink>
        <NavLink size="lg" href="#">
          Large
        </NavLink>
        <NavLink size="xl" href="#">
          Extra Large
        </NavLink>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <NavLink size="sm" icon={HomeFilledIcon} href="#">
          Small with Icon
        </NavLink>
        <NavLink size="md" icon={HomeFilledIcon} href="#">
          Medium with Icon
        </NavLink>
        <NavLink size="lg" icon={HomeFilledIcon} href="#">
          Large with Icon
        </NavLink>
        <NavLink size="xl" icon={HomeFilledIcon} href="#">
          XL with Icon
        </NavLink>
      </div>
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
        Navigation with Icons
      </h4>
      <div className="flex flex-wrap gap-4">
        <NavLink variant="default" icon={HomeFilledIcon} href="#">
          Home
        </NavLink>
        <NavLink variant="default" icon={TaskIcon} href="#">
          Tasks
        </NavLink>
        <NavLink variant="default" icon={UserCircleIcon} href="#">
          Profile
        </NavLink>
        <NavLink variant="default" icon={SettingsIcon} href="#">
          Settings
        </NavLink>
      </div>

      <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
        With Status Icons
      </h4>
      <div className="flex flex-wrap gap-4">
        <NavLink variant="primary" icon={CompleteIcon} href="#">
          Completed
        </NavLink>
        <NavLink variant="default" icon={WarningIcon} href="#">
          Pending
        </NavLink>
        <NavLink variant="default" icon={StarFilledIcon} href="#">
          Favorites
        </NavLink>
      </div>
    </div>
  ),
}

export const NavigationMenu: Story = {
  render: () => (
    <nav className="w-64 p-4 bg-white border-r border-secondary-200 dark:bg-white dark:border-surface-700">
      <div className="space-y-2">
        <NavLink
          variant="default"
          icon={HomeFilledIcon}
          href="#"
          isActive
          className="w-full justify-start"
        >
          Dashboard
        </NavLink>
        <NavLink variant="default" icon={TaskIcon} href="#" className="w-full justify-start">
          Tasks
        </NavLink>
        <NavLink variant="default" icon={UserCircleIcon} href="#" className="w-full justify-start">
          Team
        </NavLink>
        <NavLink variant="default" icon={SettingsIcon} href="#" className="w-full justify-start">
          Settings
        </NavLink>
      </div>
    </nav>
  ),
}

export const HorizontalNavigation: Story = {
  render: () => (
    <nav className="w-full p-4 bg-white border-b border-secondary-200 dark:bg-white dark:border-surface-700">
      <div className="flex space-x-6 overflow-x-auto">
        <NavLink variant="underline" href="#" isActive>
          Overview
        </NavLink>
        <NavLink variant="underline" href="#">
          Analytics
        </NavLink>
        <NavLink variant="underline" href="#">
          Reports
        </NavLink>
        <NavLink variant="underline" href="#">
          Settings
        </NavLink>
        <NavLink variant="underline" href="#" disabled>
          Coming Soon
        </NavLink>
      </div>
    </nav>
  ),
}

export const DarkThemeShowcase: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
  render: () => (
    <div className="">
      <div className="p-6 space-y-6">
        <h3 className="text-lg font-semibold text-secondary-100">Dark Theme Navigation</h3>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <NavLink variant="default" icon={HomeFilledIcon} href="#">
              Home
            </NavLink>
            <NavLink variant="primary" icon={TaskIcon} href="#">
              Tasks
            </NavLink>
            <NavLink variant="ghost" icon={UserCircleIcon} href="#">
              Profile
            </NavLink>
            <NavLink variant="underline" icon={SettingsIcon} href="#">
              Settings
            </NavLink>
          </div>

          <div className="flex flex-wrap gap-4">
            <NavLink variant="default" icon={HomeFilledIcon} href="#" isActive>
              Active Home
            </NavLink>
            <NavLink variant="primary" icon={TaskIcon} href="#" isActive>
              Active Tasks
            </NavLink>
            <NavLink variant="ghost" icon={UserCircleIcon} href="#" isActive>
              Active Profile
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  ),
}

export const ResponsiveNavigation: Story = {
  render: () => (
    <div className="w-full max-w-4xl mx-auto">
      <nav className="w-full p-4 bg-white border-b border-secondary-200 dark:bg-white dark:border-surface-700">
        <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
          <NavLink variant="underline" href="#" isActive className="sm:whitespace-nowrap">
            Dashboard
          </NavLink>
          <NavLink variant="underline" href="#" className="sm:whitespace-nowrap">
            Task Management
          </NavLink>
          <NavLink variant="underline" href="#" className="sm:whitespace-nowrap">
            Team Collaboration
          </NavLink>
          <NavLink variant="underline" href="#" className="sm:whitespace-nowrap">
            Analytics & Reports
          </NavLink>
          <NavLink variant="underline" href="#" className="sm:whitespace-nowrap">
            Settings & Configuration
          </NavLink>
        </div>
      </nav>
    </div>
  ),
}
