import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from '../../components/ui/atoms/Input'
import { Label } from '../../components/ui/atoms/Label'
import { Icon, EyeIcon, CheckIcon } from '../../components/ui/atoms/Icon'

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible input component with variants, sizes, and icon support. Features enhanced dark theme support, micro-interactions, and WCAG 2.1 AA compliance. Built with proper accessibility and form integration.',
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
    error: {
      control: { type: 'boolean' },
      description: 'Shows error state',
    },
    success: {
      control: { type: 'boolean' },
      description: 'Shows success state',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithLabel: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="input-with-label">Email Address</Label>
      <Input id="input-with-label" type="email" placeholder="john@example.com" {...args} />
    </div>
  ),
}

export const Required: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="required-input" required>
        Password
      </Label>
      <Input id="required-input" type="password" placeholder="Enter password" {...args} />
    </div>
  ),
}

export const WithDescription: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="input-with-desc" description="We'll never share your email with anyone else.">
        Email Address
      </Label>
      <Input id="input-with-desc" type="email" placeholder="john@example.com" {...args} />
    </div>
  ),
}

export const WithHelpText: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="input-with-help" helpText="Must be at least 8 characters long">
        Password
      </Label>
      <Input id="input-with-help" type="password" placeholder="Enter password" {...args} />
    </div>
  ),
}

export const ErrorState: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="error-input" error description="Please enter a valid email address">
        Email Address
      </Label>
      <Input id="error-input" type="email" placeholder="john@example.com" error {...args} />
    </div>
  ),
}

export const SuccessState: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="success-input" success description="Email address is valid">
        Email Address
      </Label>
      <Input id="success-input" type="email" value="john@example.com" success {...args} />
    </div>
  ),
}

export const Disabled: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="disabled-input">Disabled Input</Label>
      <Input id="disabled-input" placeholder="This input is disabled" disabled {...args} />
    </div>
  ),
}

export const WithLeftIcon: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="icon-left-input">Search</Label>
      <Input
        id="icon-left-input"
        placeholder="Search tasks..."
        leftIcon={<Icon icon={EyeIcon} size="sm" />}
        {...args}
      />
    </div>
  ),
}

export const WithRightIcon: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="icon-right-input">Validated Input</Label>
      <Input
        id="icon-right-input"
        placeholder="Enter value..."
        rightIcon={<Icon icon={CheckIcon} size="sm" color="success" />}
        success
        {...args}
      />
    </div>
  ),
}

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
}

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
}

export const FormExample: Story = {
  render: () => (
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="form-name" required>
          Full Name
        </Label>
        <Input id="form-name" type="text" placeholder="John Doe" />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="form-email"
          required
          description="We'll use this to contact you about your account"
        >
          Email Address
        </Label>
        <Input id="form-email" type="email" placeholder="john@example.com" />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="form-password"
          required
          helpText="Must be at least 8 characters with uppercase, lowercase, and numbers"
        >
          Password
        </Label>
        <Input id="form-password" type="password" placeholder="Enter secure password" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="form-bio">Bio (Optional)</Label>
        <Input id="form-bio" type="text" placeholder="Tell us about yourself..." />
      </div>
    </form>
  ),
}

// Dark theme specific stories
export const DarkThemeVariants: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
  render: () => (
    <div className="">
      <div className="bg-white p-6 rounded-lg space-y-4">
        <h3 className="text-slate-900 text-lg font-semibold mb-4">Dark Theme Form Elements</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-900">Default Input</Label>
            <Input placeholder="Enter text..." />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-900">Error State</Label>
            <Input placeholder="Invalid input..." error />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-900">Success State</Label>
            <Input placeholder="Valid input..." success />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-900">With Icons</Label>
            <Input
              placeholder="Search..."
              leftIcon={<Icon icon={EyeIcon} size="sm" />}
              rightIcon={<Icon icon={CheckIcon} size="sm" />}
            />
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
        <h3 className="text-lg font-semibold">Keyboard Navigation</h3>
        <p className="text-sm text-secondary-600">Use Tab to navigate, Enter to submit</p>
        <div className="space-y-2">
          <Label htmlFor="accessible-input-1">First Input</Label>
          <Input id="accessible-input-1" placeholder="Tab to next input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accessible-input-2">Second Input</Label>
          <Input id="accessible-input-2" placeholder="Continue navigation" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Screen Reader Labels</h3>
        <div className="space-y-2">
          <Label
            htmlFor="sr-input"
            required
            description="This field is required for form submission"
          >
            Required Field
          </Label>
          <Input
            id="sr-input"
            placeholder="Enter required information"
            aria-describedby="sr-input-description"
          />
          <p id="sr-input-description" className="text-sm text-secondary-600">
            This description provides additional context for screen readers
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Focus Indicators</h3>
        <div className="space-y-2">
          <Label htmlFor="focus-input">Focus Test</Label>
          <Input
            id="focus-input"
            placeholder="Click or tab to focus"
            className="focus-visible:ring-4 focus-visible:ring-primary-500"
          />
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
        <div className="space-y-2">
          <Label>Hover for Border & Shadow</Label>
          <Input placeholder="Hover over this input" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Focus Animations</h3>
        <div className="space-y-2">
          <Label>Focus for Scale & Ring</Label>
          <Input placeholder="Click to focus" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">State Transitions</h3>
        <div className="space-y-2">
          <Label>Error State Animation</Label>
          <Input placeholder="Smooth error transition" error />
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
        <h3 className="text-lg font-semibold">Mobile First Design</h3>
        <p className="text-sm text-secondary-600">Inputs are optimized for mobile touch targets</p>
        <div className="space-y-2">
          <Label>Mobile Friendly Input</Label>
          <Input placeholder="Easy to tap and type" inputSize="lg" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Flexible Width</h3>
        <div className="space-y-2">
          <Label>Full Width</Label>
          <Input placeholder="Takes full container width" className="w-full" />
        </div>
      </div>
    </div>
  ),
}
