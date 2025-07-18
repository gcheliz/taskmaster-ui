import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormField } from '../../components/ui/molecules/FormField';
import { Icon, EyeIcon, CheckIcon } from '../../components/ui/atoms/Icon';

const meta: Meta<typeof FormField> = {
  title: 'Molecules/FormField',
  component: FormField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A complete form field molecule combining Label and Input atoms with proper accessibility and validation states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'inline'],
      description: 'Layout variant of the form field',
    },
    label: {
      control: { type: 'text' },
      description: 'Label text for the form field',
    },
    inputSize: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the input field',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the field is required',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the field is disabled',
    },
  },
  decorators: [
    Story => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
  },
};

export const Required: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    required: true,
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    description: 'Choose a unique username for your account',
  },
};

export const WithHelpText: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    type: 'password',
    helpText:
      'Must be at least 8 characters with uppercase, lowercase, and numbers',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
    error: 'Please enter a valid email address',
    value: 'invalid-email',
  },
};

export const WithSuccess: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    success: 'Username is available',
    value: 'john_doe',
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search tasks...',
    leftIcon: <Icon icon={EyeIcon} size="sm" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Validated Field',
    placeholder: 'Enter value',
    rightIcon: <Icon icon={CheckIcon} size="sm" color="success" />,
    success: 'Valid input',
  },
};

export const InlineVariant: Story = {
  args: {
    label: 'Remember me',
    variant: 'inline',
    type: 'checkbox',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    placeholder: 'This field is disabled',
    disabled: true,
    description: 'This field cannot be edited',
  },
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <FormField label="Small Field" placeholder="Small input" inputSize="sm" />
      <FormField
        label="Medium Field"
        placeholder="Medium input"
        inputSize="md"
      />
      <FormField label="Large Field" placeholder="Large input" inputSize="lg" />
    </div>
  ),
};

export const CompleteForm: Story = {
  render: () => (
    <form className="space-y-6 max-w-md">
      <FormField
        label="Full Name"
        placeholder="Enter your full name"
        required
      />

      <FormField
        label="Email Address"
        placeholder="john@example.com"
        type="email"
        required
        description="We'll use this to contact you about your account"
      />

      <FormField
        label="Password"
        placeholder="Enter secure password"
        type="password"
        required
        helpText="Must be at least 8 characters with uppercase, lowercase, and numbers"
      />

      <FormField
        label="Confirm Password"
        placeholder="Confirm your password"
        type="password"
        required
      />

      <FormField
        label="Phone Number"
        placeholder="+1 (555) 123-4567"
        type="tel"
        description="Optional - for account recovery"
      />

      <FormField
        label="Company"
        placeholder="Enter company name"
        description="Optional - helps us customize your experience"
      />
    </form>
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <FormField
        label="Valid Email"
        value="john@example.com"
        type="email"
        success="Email address is valid"
        rightIcon={<Icon icon={CheckIcon} size="sm" color="success" />}
      />

      <FormField
        label="Invalid Email"
        value="invalid-email"
        type="email"
        error="Please enter a valid email address"
      />

      <FormField
        label="Checking Username"
        value="john_doe"
        placeholder="Enter username"
        description="Checking availability..."
        leftIcon={<Icon icon={EyeIcon} size="sm" />}
      />

      <FormField
        label="Required Field"
        placeholder="This field is required"
        required
        error="This field is required"
      />
    </div>
  ),
};

export const AccessibilityExample: Story = {
  render: () => (
    <form className="space-y-6 max-w-md">
      <fieldset className="border border-secondary-200 rounded-lg p-4">
        <legend className="px-2 text-sm font-medium">
          Personal Information
        </legend>

        <div className="space-y-4">
          <FormField
            label="First Name"
            placeholder="Enter your first name"
            required
            helpText="Enter your legal first name as it appears on documents"
          />

          <FormField
            label="Last Name"
            placeholder="Enter your last name"
            required
            helpText="Enter your legal last name as it appears on documents"
          />

          <FormField
            label="Date of Birth"
            type="date"
            required
            description="Used for age verification and account security"
          />
        </div>
      </fieldset>

      <fieldset className="border border-secondary-200 rounded-lg p-4">
        <legend className="px-2 text-sm font-medium">
          Contact Information
        </legend>

        <div className="space-y-4">
          <FormField
            label="Email Address"
            placeholder="john@example.com"
            type="email"
            required
            description="Primary email for account notifications"
          />

          <FormField
            label="Phone Number"
            placeholder="+1 (555) 123-4567"
            type="tel"
            description="Optional - for SMS notifications and account recovery"
          />
        </div>
      </fieldset>
    </form>
  ),
};
