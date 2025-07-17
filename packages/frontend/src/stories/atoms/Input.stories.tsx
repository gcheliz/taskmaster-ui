import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../../components/ui/atoms/Input';
import { Label } from '../../components/ui/atoms/Label';
import { Icon, EyeIcon, CheckIcon } from '../../components/ui/atoms/Icon';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with variants, sizes, and icon support. Built with proper accessibility and form integration.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'success'],
      description: 'The visual variant of the input',
    },
    inputSize: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'The size of the input',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the input',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text',
    },
  },
  decorators: [
    (Story) => (
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
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="input-with-label">Email Address</Label>
      <Input id="input-with-label" type="email" placeholder="john@example.com" {...args} />
    </div>
  ),
};

export const Required: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="required-input" required>
        Password
      </Label>
      <Input id="required-input" type="password" placeholder="Enter password" {...args} />
    </div>
  ),
};

export const WithDescription: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label 
        htmlFor="input-with-desc" 
        description="We'll never share your email with anyone else."
      >
        Email Address
      </Label>
      <Input id="input-with-desc" type="email" placeholder="john@example.com" {...args} />
    </div>
  ),
};

export const WithHelpText: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label 
        htmlFor="input-with-help" 
        helpText="Must be at least 8 characters long"
      >
        Password
      </Label>
      <Input id="input-with-help" type="password" placeholder="Enter password" {...args} />
    </div>
  ),
};

export const ErrorState: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label 
        htmlFor="error-input" 
        error
        description="Please enter a valid email address"
      >
        Email Address
      </Label>
      <Input 
        id="error-input" 
        type="email" 
        placeholder="john@example.com" 
        error
        {...args} 
      />
    </div>
  ),
};

export const SuccessState: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label 
        htmlFor="success-input" 
        success
        description="Email address is valid"
      >
        Email Address
      </Label>
      <Input 
        id="success-input" 
        type="email" 
        value="john@example.com"
        success
        {...args} 
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="disabled-input">
        Disabled Input
      </Label>
      <Input 
        id="disabled-input" 
        placeholder="This input is disabled" 
        disabled
        {...args} 
      />
    </div>
  ),
};

export const WithLeftIcon: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="icon-left-input">
        Search
      </Label>
      <Input 
        id="icon-left-input" 
        placeholder="Search tasks..." 
        leftIcon={<Icon icon={EyeIcon} size="sm" />}
        {...args} 
      />
    </div>
  ),
};

export const WithRightIcon: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="icon-right-input">
        Validated Input
      </Label>
      <Input 
        id="icon-right-input" 
        placeholder="Enter value..." 
        rightIcon={<Icon icon={CheckIcon} size="sm" color="success" />}
        success
        {...args} 
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label size="sm">Small Input</Label>
        <Input inputSize="sm" placeholder="Small input..." />
      </div>
      <div className="space-y-2">
        <Label size="md">Medium Input</Label>
        <Input inputSize="md" placeholder="Medium input..." />
      </div>
      <div className="space-y-2">
        <Label size="lg">Large Input</Label>
        <Input inputSize="lg" placeholder="Large input..." />
      </div>
    </div>
  ),
};

export const InputTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Text Input</Label>
        <Input type="text" placeholder="Enter text..." />
      </div>
      <div className="space-y-2">
        <Label>Email Input</Label>
        <Input type="email" placeholder="john@example.com" />
      </div>
      <div className="space-y-2">
        <Label>Password Input</Label>
        <Input type="password" placeholder="Enter password..." />
      </div>
      <div className="space-y-2">
        <Label>Number Input</Label>
        <Input type="number" placeholder="0" />
      </div>
      <div className="space-y-2">
        <Label>Date Input</Label>
        <Input type="date" />
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="form-name" required>
          Full Name
        </Label>
        <Input 
          id="form-name" 
          type="text" 
          placeholder="John Doe" 
        />
      </div>
      
      <div className="space-y-2">
        <Label 
          htmlFor="form-email" 
          required
          description="We'll use this to contact you about your account"
        >
          Email Address
        </Label>
        <Input 
          id="form-email" 
          type="email" 
          placeholder="john@example.com" 
        />
      </div>
      
      <div className="space-y-2">
        <Label 
          htmlFor="form-password" 
          required
          helpText="Must be at least 8 characters with uppercase, lowercase, and numbers"
        >
          Password
        </Label>
        <Input 
          id="form-password" 
          type="password" 
          placeholder="Enter secure password" 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="form-bio">
          Bio (Optional)
        </Label>
        <Input 
          id="form-bio" 
          type="text" 
          placeholder="Tell us about yourself..." 
        />
      </div>
    </form>
  ),
};