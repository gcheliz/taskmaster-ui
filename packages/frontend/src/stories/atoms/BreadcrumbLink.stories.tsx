import type { Meta, StoryObj } from '@storybook/react'
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '../../components/ui/atoms/BreadcrumbLink'
import {
  Icon,
  HomeFilledIcon,
  TaskIcon,
  UserCircleIcon,
  SettingsIcon,
  CompleteIcon,
  WarningIcon,
} from '../../components/ui/atoms/Icon'

const meta = {
  title: 'Atoms/BreadcrumbLink',
  component: Breadcrumb,
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
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    maxItems: {
      control: 'number',
    },
    responsive: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

// Basic Breadcrumb Examples
export const Default: Story = {
  args: {
    size: 'md',
    responsive: true,
  },
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbLink href="#">Home</BreadcrumbLink>
      <BreadcrumbSeparator />
      <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
      <BreadcrumbSeparator />
      <BreadcrumbLink href="#" isCurrent>
        Current Page
      </BreadcrumbLink>
    </Breadcrumb>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbLink href="#" icon={HomeFilledIcon}>
        Home
      </BreadcrumbLink>
      <BreadcrumbSeparator />
      <BreadcrumbLink href="#" icon={TaskIcon}>
        Tasks
      </BreadcrumbLink>
      <BreadcrumbSeparator />
      <BreadcrumbLink href="#" icon={UserCircleIcon}>
        Team
      </BreadcrumbLink>
      <BreadcrumbSeparator />
      <BreadcrumbLink href="#" icon={SettingsIcon} isCurrent>
        Settings
      </BreadcrumbLink>
    </Breadcrumb>
  ),
}

export const CustomSeparator: Story = {
  render: () => (
    <Breadcrumb separator="›">
      <BreadcrumbLink href="#">Home</BreadcrumbLink>
      <BreadcrumbSeparator>›</BreadcrumbSeparator>
      <BreadcrumbLink href="#">Products</BreadcrumbLink>
      <BreadcrumbSeparator>›</BreadcrumbSeparator>
      <BreadcrumbLink href="#">Electronics</BreadcrumbLink>
      <BreadcrumbSeparator>›</BreadcrumbSeparator>
      <BreadcrumbLink href="#" isCurrent>
        Laptops
      </BreadcrumbLink>
    </Breadcrumb>
  ),
}

export const ArrowSeparator: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbLink href="#">Home</BreadcrumbLink>
      <BreadcrumbSeparator>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </BreadcrumbSeparator>
      <BreadcrumbLink href="#">Projects</BreadcrumbLink>
      <BreadcrumbSeparator>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </BreadcrumbSeparator>
      <BreadcrumbLink href="#" isCurrent>
        Task Management
      </BreadcrumbLink>
    </Breadcrumb>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">Small</p>
        <Breadcrumb size="sm">
          <BreadcrumbLink href="#" size="sm">
            Home
          </BreadcrumbLink>
          <BreadcrumbSeparator size="sm" />
          <BreadcrumbLink href="#" size="sm">
            Dashboard
          </BreadcrumbLink>
          <BreadcrumbSeparator size="sm" />
          <BreadcrumbLink href="#" size="sm" isCurrent>
            Current
          </BreadcrumbLink>
        </Breadcrumb>
      </div>

      <div>
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">Medium</p>
        <Breadcrumb size="md">
          <BreadcrumbLink href="#" size="md">
            Home
          </BreadcrumbLink>
          <BreadcrumbSeparator size="md" />
          <BreadcrumbLink href="#" size="md">
            Dashboard
          </BreadcrumbLink>
          <BreadcrumbSeparator size="md" />
          <BreadcrumbLink href="#" size="md" isCurrent>
            Current
          </BreadcrumbLink>
        </Breadcrumb>
      </div>

      <div>
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">Large</p>
        <Breadcrumb size="lg">
          <BreadcrumbLink href="#" size="lg">
            Home
          </BreadcrumbLink>
          <BreadcrumbSeparator size="lg" />
          <BreadcrumbLink href="#" size="lg">
            Dashboard
          </BreadcrumbLink>
          <BreadcrumbSeparator size="lg" />
          <BreadcrumbLink href="#" size="lg" isCurrent>
            Current
          </BreadcrumbLink>
        </Breadcrumb>
      </div>
    </div>
  ),
}

export const CollapsedBreadcrumb: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">
          Collapsed (max 4 items)
        </p>
        <Breadcrumb maxItems={4}>
          <BreadcrumbLink href="#" icon={HomeFilledIcon}>
            Home
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#">Level 1</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#">Level 2</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#">Level 3</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#">Level 4</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#" isCurrent>
            Current Page
          </BreadcrumbLink>
        </Breadcrumb>
      </div>

      <div>
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">
          Collapsed (max 3 items)
        </p>
        <Breadcrumb maxItems={3}>
          <BreadcrumbLink href="#" icon={HomeFilledIcon}>
            Home
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#">Projects</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#">Task Management</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#">Sprint Planning</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#">Backlog Review</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#" isCurrent>
            Current Sprint
          </BreadcrumbLink>
        </Breadcrumb>
      </div>
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">Default</p>
        <Breadcrumb>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#" isCurrent>
            Current
          </BreadcrumbLink>
        </Breadcrumb>
      </div>

      <div>
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">Primary</p>
        <Breadcrumb>
          <BreadcrumbLink href="#" variant="primary">
            Home
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#" variant="primary">
            Dashboard
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#" variant="primary" isCurrent>
            Current
          </BreadcrumbLink>
        </Breadcrumb>
      </div>
    </div>
  ),
}

export const TaskManagementBreadcrumb: Story = {
  render: () => (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbLink href="#" icon={HomeFilledIcon}>
          Dashboard
        </BreadcrumbLink>
        <BreadcrumbSeparator />
        <BreadcrumbLink href="#" icon={TaskIcon}>
          Projects
        </BreadcrumbLink>
        <BreadcrumbSeparator />
        <BreadcrumbLink href="#" icon={CompleteIcon}>
          Task Management UI
        </BreadcrumbLink>
        <BreadcrumbSeparator />
        <BreadcrumbLink href="#" icon={WarningIcon} isCurrent>
          Component Development
        </BreadcrumbLink>
      </Breadcrumb>
    </div>
  ),
}

export const ResponsiveBreadcrumb: Story = {
  render: () => (
    <div className="w-full max-w-4xl mx-auto">
      <div className="p-4 bg-white border border-secondary-200 rounded-lg dark:bg-white dark:border-surface-700">
        <Breadcrumb responsive>
          <BreadcrumbLink href="#" icon={HomeFilledIcon}>
            Home
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#">Project Management</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#">Task Management System</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#">User Interface Components</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="#" isCurrent>
            Navigation Components
          </BreadcrumbLink>
        </Breadcrumb>
      </div>
    </div>
  ),
}

export const DarkThemeShowcase: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
  render: () => (
    <div className="">
      <div className="p-6 space-y-6">
        <h3 className="text-lg font-semibold text-secondary-100">Dark Theme Breadcrumbs</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-secondary-400 mb-2">Basic Dark Theme</p>
            <Breadcrumb>
              <BreadcrumbLink href="#" icon={HomeFilledIcon}>
                Home
              </BreadcrumbLink>
              <BreadcrumbSeparator />
              <BreadcrumbLink href="#" icon={TaskIcon}>
                Tasks
              </BreadcrumbLink>
              <BreadcrumbSeparator />
              <BreadcrumbLink href="#" icon={UserCircleIcon} isCurrent>
                Team Settings
              </BreadcrumbLink>
            </Breadcrumb>
          </div>

          <div>
            <p className="text-sm text-secondary-400 mb-2">Primary Variant</p>
            <Breadcrumb>
              <BreadcrumbLink href="#" variant="primary" icon={HomeFilledIcon}>
                Dashboard
              </BreadcrumbLink>
              <BreadcrumbSeparator />
              <BreadcrumbLink href="#" variant="primary" icon={TaskIcon}>
                Analytics
              </BreadcrumbLink>
              <BreadcrumbSeparator />
              <BreadcrumbLink href="#" variant="primary" icon={CompleteIcon} isCurrent>
                Reports
              </BreadcrumbLink>
            </Breadcrumb>
          </div>

          <div>
            <p className="text-sm text-secondary-400 mb-2">Collapsed with Custom Separator</p>
            <Breadcrumb maxItems={3} separator="›">
              <BreadcrumbLink href="#" icon={HomeFilledIcon}>
                Home
              </BreadcrumbLink>
              <BreadcrumbSeparator>›</BreadcrumbSeparator>
              <BreadcrumbLink href="#">Projects</BreadcrumbLink>
              <BreadcrumbSeparator>›</BreadcrumbSeparator>
              <BreadcrumbLink href="#">Task Management</BreadcrumbLink>
              <BreadcrumbSeparator>›</BreadcrumbSeparator>
              <BreadcrumbLink href="#">Components</BreadcrumbLink>
              <BreadcrumbSeparator>›</BreadcrumbSeparator>
              <BreadcrumbLink href="#" isCurrent>
                Navigation
              </BreadcrumbLink>
            </Breadcrumb>
          </div>
        </div>
      </div>
    </div>
  ),
}
