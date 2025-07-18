import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from '../../components/ui/atoms/Label';
import { Input } from '../../components/ui/atoms/Input';

const meta: Meta<typeof Label> = {
  title: 'Atoms/Label',
  component: Label,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A label component with support for different states, descriptions, and help text. Designed to work seamlessly with form inputs.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'success', 'muted'],
      description: 'The visual variant of the label',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'The size of the label text',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Shows required asterisk',
    },
    children: {
      control: { type: 'text' },
      description: 'Label text content',
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
    children: 'Default Label',
  },
};

export const Required: Story = {
  args: {
    children: 'Required Field',
    required: true,
  },
};

export const WithDescription: Story = {
  args: {
    children: 'Email Address',
    description: "We'll never share your email with anyone else.",
  },
};

export const WithHelpText: Story = {
  args: {
    children: 'Password',
    helpText: 'Must be at least 8 characters long',
  },
};

export const ErrorState: Story = {
  args: {
    children: 'Email Address',
    error: true,
    description: 'Please enter a valid email address',
  },
};

export const SuccessState: Story = {
  args: {
    children: 'Email Address',
    success: true,
    description: 'Email address is valid and available',
  },
};

export const Muted: Story = {
  args: {
    children: 'Optional Field',
    variant: 'muted',
    description: 'This field is optional',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Label size="sm">Small Label Text</Label>
      <Label size="md">Medium Label Text</Label>
      <Label size="lg">Large Label Text</Label>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Label variant="default">Default Label</Label>
      <Label variant="error">Error Label</Label>
      <Label variant="success">Success Label</Label>
      <Label variant="muted">Muted Label</Label>
    </div>
  ),
};

export const ComplexLabels: Story = {
  render: () => (
    <div className="space-y-6">
      <Label
        required
        description="This will be displayed publicly on your profile"
        helpText="Use your real name so people can recognize you"
      >
        Display Name
      </Label>

      <Label
        error
        required
        description="Please enter a valid email address"
        helpText="Must be a working email for account verification"
      >
        Email Address
      </Label>

      <Label
        success
        description="Password strength: Strong"
        helpText="Should contain uppercase, lowercase, numbers, and symbols"
      >
        Password
      </Label>
    </div>
  ),
};

export const WithInputs: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="input1" required>
          First Name
        </Label>
        <Input id="input1" placeholder="Enter your first name" />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="input2"
          required
          description="We'll use this to contact you"
        >
          Email Address
        </Label>
        <Input id="input2" type="email" placeholder="john@example.com" />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="input3"
          error
          description="Password must be at least 8 characters"
        >
          Password
        </Label>
        <Input id="input3" type="password" placeholder="Enter password" error />
      </div>

      <div className="space-y-2">
        <Label htmlFor="input4" success description="Username is available">
          Username
        </Label>
        <Input id="input4" placeholder="john_doe" success />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="input5"
          variant="muted"
          helpText="This field is optional"
        >
          Bio
        </Label>
        <Input id="input5" placeholder="Tell us about yourself..." />
      </div>
    </div>
  ),
};

export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-6">
      <fieldset className="border border-secondary-200 rounded-lg p-4">
        <legend className="px-2 text-sm font-medium">
          Personal Information
        </legend>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accessibility-name" required>
              Full Name
            </Label>
            <Input
              id="accessibility-name"
              placeholder="Enter your full name"
              aria-describedby="name-description"
            />
            <p id="name-description" className="text-xs text-secondary-600">
              Enter your legal name as it appears on official documents
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessibility-email" required>
              Email Address
            </Label>
            <Input
              id="accessibility-email"
              type="email"
              placeholder="john@example.com"
              aria-describedby="email-description"
            />
            <p id="email-description" className="text-xs text-secondary-600">
              We'll send important account updates to this address
            </p>
          </div>
        </div>
      </fieldset>
    </div>
  ),
};
