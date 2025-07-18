import type { Meta, StoryObj } from '@storybook/react';
import {
  Icon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronDownIcon,
  LoadingIcon,
} from '../../components/ui/atoms/Icon';

const meta: Meta<typeof Icon> = {
  title: 'Atoms/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible icon component with size and color variants. Includes common TaskMaster icons with proper accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: { type: 'select' },
      options: [
        'CheckIcon',
        'XMarkIcon',
        'PlusIcon',
        'PencilIcon',
        'TrashIcon',
        'EyeIcon',
        'ChevronDownIcon',
        'LoadingIcon',
      ],
      mapping: {
        CheckIcon,
        XMarkIcon,
        PlusIcon,
        PencilIcon,
        TrashIcon,
        EyeIcon,
        ChevronDownIcon,
        LoadingIcon,
      },
      description: 'The icon component to render',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'The size of the icon',
    },
    color: {
      control: { type: 'select' },
      options: [
        'current',
        'primary',
        'secondary',
        'success',
        'warning',
        'error',
        'muted',
      ],
      description: 'The color of the icon',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: CheckIcon,
    size: 'md',
    color: 'current',
    'aria-label': 'Check mark',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon icon={CheckIcon} size="xs" aria-label="Extra small check" />
      <Icon icon={CheckIcon} size="sm" aria-label="Small check" />
      <Icon icon={CheckIcon} size="md" aria-label="Medium check" />
      <Icon icon={CheckIcon} size="lg" aria-label="Large check" />
      <Icon icon={CheckIcon} size="xl" aria-label="Extra large check" />
      <Icon icon={CheckIcon} size="2xl" aria-label="2X large check" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon icon={CheckIcon} color="current" aria-label="Current color" />
      <Icon icon={CheckIcon} color="primary" aria-label="Primary color" />
      <Icon icon={CheckIcon} color="secondary" aria-label="Secondary color" />
      <Icon icon={CheckIcon} color="success" aria-label="Success color" />
      <Icon icon={CheckIcon} color="warning" aria-label="Warning color" />
      <Icon icon={CheckIcon} color="error" aria-label="Error color" />
      <Icon icon={CheckIcon} color="muted" aria-label="Muted color" />
    </div>
  ),
};

export const CommonIcons: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-6">
      <div className="flex flex-col items-center gap-2">
        <Icon
          icon={CheckIcon}
          size="lg"
          color="success"
          aria-label="Check mark"
        />
        <span className="text-sm">Check</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={XMarkIcon} size="lg" color="error" aria-label="Close" />
        <span className="text-sm">Close</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={PlusIcon} size="lg" color="primary" aria-label="Add" />
        <span className="text-sm">Add</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={PencilIcon} size="lg" color="secondary" aria-label="Edit" />
        <span className="text-sm">Edit</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={TrashIcon} size="lg" color="error" aria-label="Delete" />
        <span className="text-sm">Delete</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={EyeIcon} size="lg" color="secondary" aria-label="View" />
        <span className="text-sm">View</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon
          icon={ChevronDownIcon}
          size="lg"
          color="secondary"
          aria-label="Expand"
        />
        <span className="text-sm">Expand</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon
          icon={LoadingIcon}
          size="lg"
          color="primary"
          aria-label="Loading"
        />
        <span className="text-sm">Loading</span>
      </div>
    </div>
  ),
};

export const InButtons: Story = {
  render: () => (
    <div className="flex gap-4">
      <button className="btn-primary flex items-center gap-2">
        <Icon icon={PlusIcon} size="sm" aria-label="" />
        Add Task
      </button>
      <button className="btn-secondary flex items-center gap-2">
        <Icon icon={PencilIcon} size="sm" aria-label="" />
        Edit
      </button>
      <button className="btn-outline flex items-center gap-2">
        <Icon icon={EyeIcon} size="sm" aria-label="" />
        View
      </button>
      <button className="bg-error-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-error-700">
        <Icon icon={TrashIcon} size="sm" aria-label="" />
        Delete
      </button>
    </div>
  ),
};

export const StatusIcons: Story = {
  render: () => (
    <div className="flex gap-6">
      <div className="flex items-center gap-2">
        <Icon
          icon={CheckIcon}
          size="md"
          color="success"
          aria-label="Completed"
        />
        <span className="text-success-700">Completed</span>
      </div>
      <div className="flex items-center gap-2">
        <Icon
          icon={LoadingIcon}
          size="md"
          color="warning"
          aria-label="In progress"
        />
        <span className="text-warning-700">In Progress</span>
      </div>
      <div className="flex items-center gap-2">
        <Icon icon={XMarkIcon} size="md" color="error" aria-label="Failed" />
        <span className="text-error-700">Failed</span>
      </div>
    </div>
  ),
};
