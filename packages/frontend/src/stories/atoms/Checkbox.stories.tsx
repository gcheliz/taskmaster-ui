import type { Meta, StoryObj } from '@storybook/react';
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
          'A checkbox component with support for different sizes, states, and indeterminate state. Features enhanced dark theme support, micro-interactions, and WCAG 2.1 AA compliance. Built with proper accessibility features.',
      },
    },
    // Dark theme testing
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
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
    error: {
      control: { type: 'boolean' },
      description: 'Shows error state',
    },
    success: {
      control: { type: 'boolean' },
      description: 'Shows success state',
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

// Dark theme specific stories
export const DarkThemeVariants: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
  render: () => (
    <div className="">
      <div className="bg-white p-6 rounded-lg space-y-4">
        <h3 className="text-slate-900 text-lg font-semibold mb-4">
          Dark Theme Checkboxes
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox id="dark-checkbox-1" />
            <Label
              htmlFor="dark-checkbox-1"
              className="text-slate-900 cursor-pointer"
            >
              Unchecked
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox id="dark-checkbox-2" checked />
            <Label
              htmlFor="dark-checkbox-2"
              className="text-slate-900 cursor-pointer"
            >
              Checked
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox id="dark-checkbox-3" indeterminate />
            <Label
              htmlFor="dark-checkbox-3"
              className="text-slate-900 cursor-pointer"
            >
              Indeterminate
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox id="dark-checkbox-4" error checked />
            <Label
              htmlFor="dark-checkbox-4"
              className="text-slate-900 cursor-pointer"
            >
              Error State
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox id="dark-checkbox-5" success checked />
            <Label
              htmlFor="dark-checkbox-5"
              className="text-slate-900 cursor-pointer"
            >
              Success State
            </Label>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Accessibility testing story
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Keyboard Navigation</h3>
        <p className="text-sm text-secondary-600">
          Use Tab to navigate, Space to toggle
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="accessible-checkbox-1" />
            <Label htmlFor="accessible-checkbox-1" className="cursor-pointer">
              First checkbox
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="accessible-checkbox-2" />
            <Label htmlFor="accessible-checkbox-2" className="cursor-pointer">
              Second checkbox
            </Label>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Screen Reader Support</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sr-checkbox"
              aria-describedby="sr-checkbox-description"
            />
            <Label htmlFor="sr-checkbox" className="cursor-pointer">
              Accept terms and conditions
            </Label>
          </div>
          <p
            id="sr-checkbox-description"
            className="text-sm text-secondary-600 ml-6"
          >
            By checking this box, you agree to our terms of service and privacy
            policy
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Focus Indicators</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="focus-checkbox"
              className="focus-visible:ring-4 focus-visible:ring-primary-500"
            />
            <Label htmlFor="focus-checkbox" className="cursor-pointer">
              Enhanced focus indicator
            </Label>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Micro-interactions showcase
export const MicroInteractions: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Hover Effects</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="hover-checkbox" />
            <Label htmlFor="hover-checkbox" className="cursor-pointer">
              Hover for scale and shadow
            </Label>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">State Transitions</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="transition-checkbox" />
            <Label htmlFor="transition-checkbox" className="cursor-pointer">
              Smooth check animation
            </Label>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Responsive design showcase
export const ResponsiveDesign: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Mobile Touch Targets</h3>
        <p className="text-sm text-secondary-600">
          Checkboxes are optimized for touch interfaces
        </p>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox id="mobile-checkbox-1" size="lg" />
            <Label htmlFor="mobile-checkbox-1" className="cursor-pointer">
              Large checkbox for mobile
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox id="mobile-checkbox-2" size="lg" />
            <Label htmlFor="mobile-checkbox-2" className="cursor-pointer">
              Easy to tap target
            </Label>
          </div>
        </div>
      </div>
    </div>
  ),
};
