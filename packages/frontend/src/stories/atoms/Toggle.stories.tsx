import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from '../../components/ui/atoms/Toggle';
import { Label } from '../../components/ui/atoms/Label';
import { useState } from 'react';

const meta: Meta<typeof Toggle> = {
  title: 'Atoms/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A toggle switch component for binary on/off states. Provides smooth animations and proper accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'The size of the toggle switch',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'success'],
      description: 'The visual variant of the toggle switch',
    },
    checked: {
      control: { type: 'boolean' },
      description: 'Whether the toggle is on',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the toggle is disabled',
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
  render: args => {
    const [checked, setChecked] = useState(args.checked || false);

    return (
      <div className="flex items-center space-x-3">
        <Toggle
          id="toggle-with-label"
          checked={checked}
          onCheckedChange={setChecked}
          {...args}
        />
        <Label htmlFor="toggle-with-label" className="cursor-pointer">
          Enable notifications
        </Label>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [smallChecked, setSmallChecked] = useState(true);
    const [mediumChecked, setMediumChecked] = useState(false);
    const [largeChecked, setLargeChecked] = useState(true);

    return (
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <Toggle
            size="sm"
            checked={smallChecked}
            onCheckedChange={setSmallChecked}
          />
          <Label size="sm">Small</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Toggle
            size="md"
            checked={mediumChecked}
            onCheckedChange={setMediumChecked}
          />
          <Label size="md">Medium</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Toggle
            size="lg"
            checked={largeChecked}
            onCheckedChange={setLargeChecked}
          />
          <Label size="lg">Large</Label>
        </div>
      </div>
    );
  },
};

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Toggle checked={false} onCheckedChange={() => {}} />
        <Label>Off</Label>
      </div>
      <div className="flex items-center space-x-3">
        <Toggle checked={true} onCheckedChange={() => {}} />
        <Label>On</Label>
      </div>
      <div className="flex items-center space-x-3">
        <Toggle disabled />
        <Label>Disabled Off</Label>
      </div>
      <div className="flex items-center space-x-3">
        <Toggle checked disabled />
        <Label>Disabled On</Label>
      </div>
    </div>
  ),
};

export const Variants: Story = {
  render: () => {
    const [defaultChecked, setDefaultChecked] = useState(true);
    const [errorChecked, setErrorChecked] = useState(true);
    const [successChecked, setSuccessChecked] = useState(true);

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Toggle
            variant="default"
            checked={defaultChecked}
            onCheckedChange={setDefaultChecked}
          />
          <Label>Default</Label>
        </div>
        <div className="flex items-center space-x-3">
          <Toggle
            variant="error"
            checked={errorChecked}
            onCheckedChange={setErrorChecked}
          />
          <Label error>Error State</Label>
        </div>
        <div className="flex items-center space-x-3">
          <Toggle
            variant="success"
            checked={successChecked}
            onCheckedChange={setSuccessChecked}
          />
          <Label success>Success State</Label>
        </div>
      </div>
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const [isEnabled, setIsEnabled] = useState(false);

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Toggle checked={isEnabled} onCheckedChange={setIsEnabled} />
          <Label>Notifications are {isEnabled ? 'enabled' : 'disabled'}</Label>
        </div>
        <p className="text-sm text-secondary-600">
          Current state: {isEnabled ? 'ON' : 'OFF'}
        </p>
      </div>
    );
  },
};

export const FormExample: Story = {
  render: () => {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [autoSave, setAutoSave] = useState(true);

    return (
      <form className="space-y-8 max-w-md">
        <fieldset className="space-y-6">
          <legend className="text-base font-medium text-secondary-900">
            Notification Settings
          </legend>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="cursor-pointer">Email Notifications</Label>
                <p className="text-sm text-secondary-500">
                  Receive email updates about your tasks
                </p>
              </div>
              <Toggle
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="cursor-pointer">Push Notifications</Label>
                <p className="text-sm text-secondary-500">
                  Get browser notifications for updates
                </p>
              </div>
              <Toggle
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="cursor-pointer">SMS Notifications</Label>
                <p className="text-sm text-secondary-500">
                  Receive text messages for urgent updates
                </p>
              </div>
              <Toggle
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
                disabled
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-6">
          <legend className="text-base font-medium text-secondary-900">
            Preferences
          </legend>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="cursor-pointer">Dark Mode</Label>
                <p className="text-sm text-secondary-500">
                  Use dark theme for the interface
                </p>
              </div>
              <Toggle
                checked={darkMode}
                onCheckedChange={setDarkMode}
                variant="default"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="cursor-pointer">Auto-save</Label>
                <p className="text-sm text-secondary-500">
                  Automatically save your work
                </p>
              </div>
              <Toggle
                checked={autoSave}
                onCheckedChange={setAutoSave}
                variant="success"
              />
            </div>
          </div>
        </fieldset>
      </form>
    );
  },
};

export const AccessibilityExample: Story = {
  render: () => {
    const [isAccessible, setIsAccessible] = useState(true);

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Toggle
            id="accessibility-toggle"
            checked={isAccessible}
            onCheckedChange={setIsAccessible}
            aria-label="Toggle accessibility features"
            aria-describedby="accessibility-description"
          />
          <Label htmlFor="accessibility-toggle" className="cursor-pointer">
            Accessibility Features
          </Label>
        </div>
        <p
          id="accessibility-description"
          className="text-sm text-secondary-600"
        >
          {isAccessible
            ? 'Accessibility features are enabled. Screen readers and keyboard navigation are optimized.'
            : 'Accessibility features are disabled. Some users may have difficulty using the interface.'}
        </p>
      </div>
    );
  },
};
