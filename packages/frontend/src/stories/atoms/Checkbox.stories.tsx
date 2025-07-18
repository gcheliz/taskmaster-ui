import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '../../components/ui/atoms/Checkbox';
import { Label } from '../../components/ui/atoms/Label';

const meta: Meta<typeof Checkbox> = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A checkbox component with support for different sizes, states, and indeterminate state. Built with proper accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'The size of the checkbox',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'success'],
      description: 'The visual variant of the checkbox',
    },
    checked: {
      control: { type: 'boolean' },
      description: 'Whether the checkbox is checked',
    },
    indeterminate: {
      control: { type: 'boolean' },
      description: 'Whether the checkbox is in indeterminate state',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the checkbox is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: args => (
    <div className="flex items-center space-x-2">
      <Checkbox id="checkbox-with-label" {...args} />
      <Label htmlFor="checkbox-with-label" className="cursor-pointer">
        Accept terms and conditions
      </Label>
    </div>
  ),
  args: {
    checked: false,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center space-x-6">
      <div className="flex items-center space-x-2">
        <Checkbox size="sm" checked />
        <Label size="sm">Small</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox size="md" checked />
        <Label size="md">Medium</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox size="lg" checked />
        <Label size="lg">Large</Label>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox checked={false} />
        <Label>Unchecked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox checked={true} />
        <Label>Checked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox indeterminate={true} />
        <Label>Indeterminate</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox disabled />
        <Label>Disabled</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox checked disabled />
        <Label>Disabled Checked</Label>
      </div>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox variant="default" checked />
        <Label>Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox variant="error" checked />
        <Label error>Error State</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox variant="success" checked />
        <Label success>Success State</Label>
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <form className="space-y-6 max-w-md">
      <fieldset>
        <legend className="text-base font-medium text-secondary-900 mb-4">
          Notification Preferences
        </legend>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox id="email-notifications" defaultChecked />
            <div>
              <Label htmlFor="email-notifications" className="cursor-pointer">
                Email notifications
              </Label>
              <p className="text-sm text-secondary-500">
                Get notified when someone mentions you in a comment.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox id="push-notifications" />
            <div>
              <Label htmlFor="push-notifications" className="cursor-pointer">
                Push notifications
              </Label>
              <p className="text-sm text-secondary-500">
                Get push notifications in your browser.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox id="sms-notifications" disabled />
            <div>
              <Label htmlFor="sms-notifications" className="cursor-pointer">
                SMS notifications
              </Label>
              <p className="text-sm text-secondary-500">
                Get text messages for urgent updates. (Coming soon)
              </p>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-base font-medium text-secondary-900 mb-4">
          Task Management
        </legend>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox id="all-tasks" indeterminate />
            <Label htmlFor="all-tasks" className="cursor-pointer">
              Select all tasks
            </Label>
          </div>

          <div className="ml-6 space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox id="task-1" defaultChecked />
              <Label htmlFor="task-1" className="cursor-pointer">
                Task 1: Setup project
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox id="task-2" defaultChecked />
              <Label htmlFor="task-2" className="cursor-pointer">
                Task 2: Design components
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox id="task-3" />
              <Label htmlFor="task-3" className="cursor-pointer">
                Task 3: Implement features
              </Label>
            </div>
          </div>
        </div>
      </fieldset>
    </form>
  ),
};
