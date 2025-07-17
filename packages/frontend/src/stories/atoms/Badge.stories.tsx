import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../../components/ui/atoms/Badge';
import { Icon, CheckIcon, XMarkIcon, PlusIcon, EyeIcon } from '../../components/ui/atoms/Icon';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A badge component for status indicators, labels, and notifications. Includes TaskMaster-specific status variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'success', 'warning', 'error', 'outline', 'pending', 'in-progress', 'done', 'blocked', 'deferred'],
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
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default',
  },
};

export const WithIcon: Story = {
  args: {
    children: 'Completed',
    variant: 'success',
    icon: <Icon icon={CheckIcon} size="xs" />,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

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
};

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
};

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
};

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
          <Badge variant="success" size="sm">Low</Badge>
          <Badge variant="warning" size="sm">Medium</Badge>
          <Badge variant="error" size="sm">High</Badge>
          <Badge variant="error" size="sm">Urgent</Badge>
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
};

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
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-6 max-w-lg">
      <div className="border border-secondary-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-secondary-900">Task #123: Implement user authentication</h4>
          <Badge variant="in-progress" size="sm">In Progress</Badge>
        </div>
        <p className="text-sm text-secondary-600 mb-3">
          Create login and registration forms with proper validation.
        </p>
        <div className="flex gap-2">
          <Badge variant="outline" size="sm">Frontend</Badge>
          <Badge variant="warning" size="sm">High Priority</Badge>
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
          <Badge variant="outline" size="sm">Documentation</Badge>
          <Badge variant="success" size="sm">Low Priority</Badge>
        </div>
      </div>
      
      <div className="border border-secondary-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-secondary-900">Task #125: Fix database performance</h4>
          <Badge variant="blocked" size="sm">Blocked</Badge>
        </div>
        <p className="text-sm text-secondary-600 mb-3">
          Optimize slow queries and improve database performance.
        </p>
        <div className="flex gap-2">
          <Badge variant="outline" size="sm">Backend</Badge>
          <Badge variant="error" size="sm">Critical</Badge>
        </div>
      </div>
    </div>
  ),
};

export const TeamMemberBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-secondary-900 mb-3">Team Roles</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Admin</Badge>
          <Badge variant="secondary">Developer</Badge>
          <Badge variant="success">Reviewer</Badge>
          <Badge variant="warning">Guest</Badge>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-secondary-900 mb-3">Status Indicators</h3>
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
  ),
};