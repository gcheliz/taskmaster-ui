import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from '../../components/ui/atoms/Badge'
import { Icon, CheckIcon, XMarkIcon, PlusIcon, EyeIcon } from '../../components/ui/atoms/Icon'

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A badge component for status indicators, labels, and notifications. Features enhanced dark theme support, micro-interactions, and WCAG 2.1 AA compliance. Includes TaskMaster-specific status variants.',
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'TaskMaster', value: '#f8fafc' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'default',
        'secondary',
        'success',
        'warning',
        'error',
        'outline',
        'pending',
        'in-progress',
        'done',
        'blocked',
        'deferred',
      ],
      description: 'The visual variant of the badge',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'The size of the badge',
    },
    children: {
      control: { type: 'text' },
      description: 'Badge content',
    },
    icon: {
      control: { type: 'object' },
      description: 'Optional icon to display',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Default',
  },
}

export const WithIcon: Story = {
  args: {
    children: 'Completed',
    variant: 'success',
    icon: <Icon icon={CheckIcon} size="xs" />,
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
}

export const TaskMasterStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="pending">Pending</Badge>
      <Badge variant="in-progress">In Progress</Badge>
      <Badge variant="done">Done</Badge>
      <Badge variant="blocked">Blocked</Badge>
      <Badge variant="deferred">Deferred</Badge>
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="success" icon={<Icon icon={CheckIcon} size="xs" />}>
        Completed
      </Badge>
      <Badge variant="error" icon={<Icon icon={XMarkIcon} size="xs" />}>
        Failed
      </Badge>
      <Badge variant="default" icon={<Icon icon={PlusIcon} size="xs" />}>
        New
      </Badge>
      <Badge variant="secondary" icon={<Icon icon={EyeIcon} size="xs" />}>
        Viewed
      </Badge>
    </div>
  ),
}

export const TaskStatusExamples: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-secondary-900 mb-3">Task Statuses</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="pending">To Do</Badge>
          <Badge variant="in-progress">In Progress</Badge>
          <Badge variant="done" icon={<Icon icon={CheckIcon} size="xs" />}>
            Completed
          </Badge>
          <Badge variant="blocked">Blocked</Badge>
          <Badge variant="deferred">On Hold</Badge>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-secondary-900 mb-3">Priority Levels</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success" size="sm">
            Low
          </Badge>
          <Badge variant="warning" size="sm">
            Medium
          </Badge>
          <Badge variant="error" size="sm">
            High
          </Badge>
          <Badge variant="error" size="sm">
            Urgent
          </Badge>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-secondary-900 mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Frontend</Badge>
          <Badge variant="outline">Backend</Badge>
          <Badge variant="outline">Design</Badge>
          <Badge variant="outline">Testing</Badge>
          <Badge variant="outline">Documentation</Badge>
        </div>
      </div>
    </div>
  ),
}

export const NotificationBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <button className="p-2 text-secondary-600 hover:text-secondary-900">
            <Icon icon={EyeIcon} size="md" />
          </button>
          <Badge
            variant="error"
            size="sm"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            3
          </Badge>
        </div>

        <div className="relative">
          <button className="p-2 text-secondary-600 hover:text-secondary-900">
            <Icon icon={PlusIcon} size="md" />
          </button>
          <Badge
            variant="warning"
            size="sm"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            12
          </Badge>
        </div>
      </div>
    </div>
  ),
}

export const InContext: Story = {
  render: () => (
    <div className="space-y-6 max-w-lg">
      <div className="border border-secondary-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-secondary-900">
            Task #123: Implement user authentication
          </h4>
          <Badge variant="in-progress" size="sm">
            In Progress
          </Badge>
        </div>
        <p className="text-sm text-secondary-600 mb-3">
          Create login and registration forms with proper validation.
        </p>
        <div className="flex gap-2">
          <Badge variant="outline" size="sm">
            Frontend
          </Badge>
          <Badge variant="warning" size="sm">
            High Priority
          </Badge>
        </div>
      </div>

      <div className="border border-secondary-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-secondary-900">Task #124: Write API documentation</h4>
          <Badge variant="done" size="sm" icon={<Icon icon={CheckIcon} size="xs" />}>
            Completed
          </Badge>
        </div>
        <p className="text-sm text-secondary-600 mb-3">
          Document all API endpoints with examples and response schemas.
        </p>
        <div className="flex gap-2">
          <Badge variant="outline" size="sm">
            Documentation
          </Badge>
          <Badge variant="success" size="sm">
            Low Priority
          </Badge>
        </div>
      </div>

      <div className="border border-secondary-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-secondary-900">Task #125: Fix database performance</h4>
          <Badge variant="blocked" size="sm">
            Blocked
          </Badge>
        </div>
        <p className="text-sm text-secondary-600 mb-3">
          Optimize slow queries and improve database performance.
        </p>
        <div className="flex gap-2">
          <Badge variant="outline" size="sm">
            Backend
          </Badge>
          <Badge variant="error" size="sm">
            Critical
          </Badge>
        </div>
      </div>
    </div>
  ),
}

export const TeamMemberBadges: Story = {
  render: () => (
    <div className="bg-white p-6 rounded-lg border border-slate-200">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Team Roles</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Admin</Badge>
            <Badge variant="secondary">Developer</Badge>
            <Badge variant="success">Reviewer</Badge>
            <Badge variant="warning">Guest</Badge>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Status Indicators</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success" icon={<Icon icon={CheckIcon} size="xs" />}>
              Online
            </Badge>
            <Badge variant="warning">Away</Badge>
            <Badge variant="error">Busy</Badge>
            <Badge variant="secondary">Offline</Badge>
          </div>
        </div>
      </div>
    </div>
  ),
}

// TaskMaster Recreation - clean light theme design
export const TaskMasterRecreation: Story = {
  render: () => (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 rounded-t-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Icon icon={CheckIcon} size="sm" className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">TaskMaster UI</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">GZ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="bg-white rounded-b-lg p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-20 h-20 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Team Roles</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                <Badge variant="default" size="md">
                  Admin
                </Badge>
                <Badge variant="secondary" size="md">
                  Developer
                </Badge>
                <Badge variant="success" size="md">
                  Reviewer
                </Badge>
                <Badge variant="warning" size="md">
                  Guest
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Status Indicators</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                <Badge variant="success" size="md" icon={<Icon icon={CheckIcon} size="xs" />}>
                  Online
                </Badge>
                <Badge variant="warning" size="md">
                  Away
                </Badge>
                <Badge variant="error" size="md">
                  Busy
                </Badge>
                <Badge variant="secondary" size="md">
                  Offline
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
}

// Accessibility testing story
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Screen Reader Support</h3>
        <p className="text-sm text-secondary-600">
          All badges include proper ARIA labels and role attributes
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success" aria-label="Status: Task completed successfully">
            Completed
          </Badge>
          <Badge variant="error" aria-label="Status: Task failed with errors">
            Failed
          </Badge>
          <Badge variant="warning" aria-label="Status: Task requires attention">
            Needs Review
          </Badge>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Color Contrast</h3>
        <p className="text-sm text-secondary-600">
          All badges meet WCAG 2.1 AA color contrast requirements
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">4.5:1 Contrast</Badge>
          <Badge variant="secondary">4.5:1 Contrast</Badge>
          <Badge variant="outline">4.5:1 Contrast</Badge>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Focus Indicators</h3>
        <p className="text-sm text-secondary-600">
          Badges with interactive behavior have focus indicators
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" tabIndex={0} className="focus:ring-2 focus:ring-primary-500">
            Focusable Badge
          </Badge>
          <Badge variant="secondary" tabIndex={0} className="focus:ring-2 focus:ring-secondary-500">
            Interactive Badge
          </Badge>
        </div>
      </div>
    </div>
  ),
}

// Micro-interactions showcase
export const MicroInteractions: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Hover Effects</h3>
        <p className="text-sm text-secondary-600">Hover to see scale and shadow animations</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Hover for Scale</Badge>
          <Badge variant="success">Hover for Shadow</Badge>
          <Badge variant="warning">Smooth Transitions</Badge>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Status Animations</h3>
        <p className="text-sm text-secondary-600">
          TaskMaster status badges with enhanced visual feedback
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="pending">Pending</Badge>
          <Badge variant="in-progress">In Progress</Badge>
          <Badge variant="done" icon={<Icon icon={CheckIcon} size="xs" />}>
            Completed
          </Badge>
        </div>
      </div>
    </div>
  ),
}

// Responsive design showcase
export const ResponsiveDesign: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Size Variations</h3>
        <p className="text-sm text-secondary-600">
          Badges maintain proportions across different sizes
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Badge size="sm" variant="default">
            Small
          </Badge>
          <Badge size="md" variant="default">
            Medium
          </Badge>
          <Badge size="lg" variant="default">
            Large
          </Badge>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Mobile First</h3>
        <p className="text-sm text-secondary-600">Badges are optimized for mobile touch targets</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" size="lg">
            Touch Friendly
          </Badge>
          <Badge variant="secondary" size="lg">
            Easy to Tap
          </Badge>
        </div>
      </div>
    </div>
  ),
}
