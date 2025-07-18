import type { Meta, StoryObj } from '@storybook/react';
import { Select } from '../../components/ui/atoms/Select';
import { Label } from '../../components/ui/atoms/Label';

const meta: Meta<typeof Select> = {
  title: 'Atoms/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible select component with variants, sizes, and proper accessibility. Features enhanced dark theme support, micro-interactions, and WCAG 2.1 AA compliance.',
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
      description: 'The visual variant of the select',
    },
    selectSize: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'The size of the select',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the select',
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
    children: (
      <>
        <option value="">Select an option</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </>
    ),
  },
};

export const WithLabel: Story = {
  render: args => (
    <div className="space-y-2">
      <Label htmlFor="select-with-label">Country</Label>
      <Select id="select-with-label" {...args}>
        <option value="">Select a country</option>
        <option value="us">United States</option>
        <option value="ca">Canada</option>
        <option value="uk">United Kingdom</option>
        <option value="de">Germany</option>
        <option value="fr">France</option>
      </Select>
    </div>
  ),
};

export const Required: Story = {
  render: args => (
    <div className="space-y-2">
      <Label htmlFor="required-select" required>
        Priority Level
      </Label>
      <Select id="required-select" {...args}>
        <option value="">Select priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </Select>
    </div>
  ),
};

export const WithDescription: Story = {
  render: args => (
    <div className="space-y-2">
      <Label
        htmlFor="select-with-desc"
        description="Choose the department that best fits your request."
      >
        Department
      </Label>
      <Select id="select-with-desc" {...args}>
        <option value="">Select department</option>
        <option value="engineering">Engineering</option>
        <option value="design">Design</option>
        <option value="marketing">Marketing</option>
        <option value="sales">Sales</option>
        <option value="support">Support</option>
      </Select>
    </div>
  ),
};

export const WithHelpText: Story = {
  render: args => (
    <div className="space-y-2">
      <Label
        htmlFor="select-with-help"
        helpText="This setting can be changed later in your profile"
      >
        Timezone
      </Label>
      <Select id="select-with-help" {...args}>
        <option value="">Select timezone</option>
        <option value="utc">UTC</option>
        <option value="est">Eastern Time</option>
        <option value="cst">Central Time</option>
        <option value="mst">Mountain Time</option>
        <option value="pst">Pacific Time</option>
      </Select>
    </div>
  ),
};

export const ErrorState: Story = {
  render: args => (
    <div className="space-y-2">
      <Label
        htmlFor="error-select"
        error
        description="Please select a valid option"
      >
        Required Selection
      </Label>
      <Select id="error-select" error {...args}>
        <option value="">Select an option</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </Select>
    </div>
  ),
};

export const SuccessState: Story = {
  render: args => (
    <div className="space-y-2">
      <Label
        htmlFor="success-select"
        success
        description="Great choice!"
      >
        Valid Selection
      </Label>
      <Select id="success-select" success value="option1" {...args}>
        <option value="">Select an option</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  render: args => (
    <div className="space-y-2">
      <Label htmlFor="disabled-select">Disabled Select</Label>
      <Select id="disabled-select" disabled {...args}>
        <option value="">This select is disabled</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </Select>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label size="sm">Small Select</Label>
        <Select selectSize="sm">
          <option value="">Small select...</option>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label size="md">Medium Select</Label>
        <Select selectSize="md">
          <option value="">Medium select...</option>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label size="lg">Large Select</Label>
        <Select selectSize="lg">
          <option value="">Large select...</option>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </Select>
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="form-category" required>
          Category
        </Label>
        <Select id="form-category">
          <option value="">Select category</option>
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Request</option>
          <option value="question">Question</option>
          <option value="other">Other</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="form-priority"
          required
          description="How urgent is this issue?"
        >
          Priority Level
        </Label>
        <Select id="form-priority">
          <option value="">Select priority</option>
          <option value="low">Low - Can wait</option>
          <option value="medium">Medium - Needs attention</option>
          <option value="high">High - Important</option>
          <option value="urgent">Urgent - Critical</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="form-assignee"
          helpText="Leave blank to auto-assign"
        >
          Assignee (Optional)
        </Label>
        <Select id="form-assignee">
          <option value="">Auto-assign</option>
          <option value="john">John Doe</option>
          <option value="jane">Jane Smith</option>
          <option value="bob">Bob Johnson</option>
        </Select>
      </div>
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
        <h3 className="text-slate-900 text-lg font-semibold mb-4">Dark Theme Select</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-900">Default Select</Label>
            <Select>
              <option value="">Select option...</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-900">Error State</Label>
            <Select error>
              <option value="">Invalid selection...</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-900">Success State</Label>
            <Select success value="option1">
              <option value="">Select option...</option>
              <option value="option1">Selected Option</option>
              <option value="option2">Option 2</option>
            </Select>
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
        <p className="text-sm text-secondary-600">Use Tab to navigate, Arrow keys to select</p>
        <div className="space-y-2">
          <Label htmlFor="accessible-select-1">First Select</Label>
          <Select id="accessible-select-1">
            <option value="">Navigate to next select</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="accessible-select-2">Second Select</Label>
          <Select id="accessible-select-2">
            <option value="">Continue navigation</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Screen Reader Labels</h3>
        <div className="space-y-2">
          <Label htmlFor="sr-select" required description="This field is required for form submission">
            Required Field
          </Label>
          <Select
            id="sr-select"
            aria-describedby="sr-select-description"
          >
            <option value="">Select required option</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </Select>
          <p id="sr-select-description" className="text-sm text-secondary-600">
            This description provides additional context for screen readers
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Focus Indicators</h3>
        <div className="space-y-2">
          <Label htmlFor="focus-select">Focus Test</Label>
          <Select
            id="focus-select"
            className="focus:ring-4 focus:ring-primary-500"
          >
            <option value="">Click or tab to focus</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </Select>
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
          <Label>Hover for Border & Shadow</Label>
          <Select>
            <option value="">Hover over this select</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Focus Animations</h3>
        <div className="space-y-2">
          <Label>Focus for Scale & Ring</Label>
          <Select>
            <option value="">Click to focus</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">State Transitions</h3>
        <div className="space-y-2">
          <Label>Error State Animation</Label>
          <Select error>
            <option value="">Smooth error transition</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </Select>
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
        <h3 className="text-lg font-semibold">Mobile First Design</h3>
        <p className="text-sm text-secondary-600">Selects are optimized for mobile touch targets</p>
        <div className="space-y-2">
          <Label>Mobile Friendly Select</Label>
          <Select selectSize="lg">
            <option value="">Easy to tap and select</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Flexible Width</h3>
        <div className="space-y-2">
          <Label>Full Width</Label>
          <Select className="w-full">
            <option value="">Takes full container width</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </Select>
        </div>
      </div>
    </div>
  ),
};