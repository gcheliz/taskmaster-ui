import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio } from '../../components/ui/atoms/Radio';
import { Label } from '../../components/ui/atoms/Label';

const meta: Meta<typeof Radio> = {
  title: 'Atoms/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A radio button component with support for different sizes and states. Designed for single selection from a group of options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'The size of the radio button',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'success'],
      description: 'The visual variant of the radio button',
    },
    checked: {
      control: { type: 'boolean' },
      description: 'Whether the radio button is selected',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the radio button is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'radio-default',
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    name: 'radio-checked',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    name: 'radio-disabled',
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
    name: 'radio-disabled-checked',
  },
};

export const WithLabel: Story = {
  render: args => (
    <div className="flex items-center space-x-2">
      <Radio id="radio-with-label" name="radio-label-example" {...args} />
      <Label htmlFor="radio-with-label" className="cursor-pointer">
        Option 1
      </Label>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center space-x-6">
      <div className="flex items-center space-x-2">
        <Radio size="sm" name="size-example" checked />
        <Label size="sm">Small</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Radio size="md" name="size-example" />
        <Label size="md">Medium</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Radio size="lg" name="size-example" />
        <Label size="lg">Large</Label>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Radio name="states-example" />
        <Label>Unselected</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Radio name="states-example" checked />
        <Label>Selected</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Radio name="states-disabled" disabled />
        <Label>Disabled</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Radio name="states-disabled" checked disabled />
        <Label>Disabled Selected</Label>
      </div>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Radio variant="default" name="variant-example" checked />
        <Label>Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Radio variant="error" name="variant-error" checked />
        <Label error>Error State</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Radio variant="success" name="variant-success" checked />
        <Label success>Success State</Label>
      </div>
    </div>
  ),
};

export const RadioGroup: Story = {
  render: () => (
    <fieldset className="space-y-4">
      <legend className="text-base font-medium text-secondary-900">
        Choose a plan
      </legend>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Radio id="plan-free" name="plan" value="free" defaultChecked />
          <div>
            <Label htmlFor="plan-free" className="cursor-pointer">
              Free Plan
            </Label>
            <p className="text-sm text-secondary-500">
              Perfect for getting started. Up to 5 projects.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Radio id="plan-pro" name="plan" value="pro" />
          <div>
            <Label htmlFor="plan-pro" className="cursor-pointer">
              Pro Plan
            </Label>
            <p className="text-sm text-secondary-500">
              For growing teams. Up to 50 projects and advanced features.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Radio id="plan-enterprise" name="plan" value="enterprise" />
          <div>
            <Label htmlFor="plan-enterprise" className="cursor-pointer">
              Enterprise Plan
            </Label>
            <p className="text-sm text-secondary-500">
              For large organizations. Unlimited projects and priority support.
            </p>
          </div>
        </div>
      </div>
    </fieldset>
  ),
};

export const TaskPriority: Story = {
  render: () => (
    <fieldset className="space-y-4">
      <legend className="text-base font-medium text-secondary-900">
        Task Priority
      </legend>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Radio
            id="priority-low"
            name="priority"
            value="low"
            variant="success"
          />
          <Label
            htmlFor="priority-low"
            className="cursor-pointer text-success-700"
          >
            Low Priority
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <Radio
            id="priority-medium"
            name="priority"
            value="medium"
            defaultChecked
          />
          <Label
            htmlFor="priority-medium"
            className="cursor-pointer text-warning-700"
          >
            Medium Priority
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <Radio
            id="priority-high"
            name="priority"
            value="high"
            variant="error"
          />
          <Label
            htmlFor="priority-high"
            className="cursor-pointer text-error-700"
          >
            High Priority
          </Label>
        </div>
      </div>
    </fieldset>
  ),
};

export const FormExample: Story = {
  render: () => (
    <form className="space-y-8 max-w-md">
      <fieldset className="space-y-4">
        <legend className="text-base font-medium text-secondary-900">
          Notification Frequency
        </legend>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Radio
              id="freq-immediate"
              name="frequency"
              value="immediate"
              defaultChecked
            />
            <Label htmlFor="freq-immediate" className="cursor-pointer">
              Immediate
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Radio id="freq-daily" name="frequency" value="daily" />
            <Label htmlFor="freq-daily" className="cursor-pointer">
              Daily Digest
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Radio id="freq-weekly" name="frequency" value="weekly" />
            <Label htmlFor="freq-weekly" className="cursor-pointer">
              Weekly Summary
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Radio id="freq-never" name="frequency" value="never" />
            <Label htmlFor="freq-never" className="cursor-pointer">
              Never
            </Label>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-base font-medium text-secondary-900">
          Theme Preference
        </legend>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Radio id="theme-light" name="theme" value="light" defaultChecked />
            <Label htmlFor="theme-light" className="cursor-pointer">
              Light Mode
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Radio id="theme-dark" name="theme" value="dark" />
            <Label htmlFor="theme-dark" className="cursor-pointer">
              Dark Mode
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Radio id="theme-system" name="theme" value="system" />
            <Label htmlFor="theme-system" className="cursor-pointer">
              System Default
            </Label>
          </div>
        </div>
      </fieldset>
    </form>
  ),
};
