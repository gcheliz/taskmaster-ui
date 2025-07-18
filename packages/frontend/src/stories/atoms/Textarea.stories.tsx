import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '../../components/ui/atoms/Textarea';
import { Label } from '../../components/ui/atoms/Label';

const meta: Meta<typeof Textarea> = {
  title: 'Atoms/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible textarea component with variants, sizes, and proper accessibility. Features enhanced dark theme support, micro-interactions, and WCAG 2.1 AA compliance.',
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
      description: 'The visual variant of the textarea',
    },
    textareaSize: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'The size of the textarea',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the textarea',
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
    Story => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your message...',
  },
};

export const WithLabel: Story = {
  render: args => (
    <div className="space-y-2">
      <Label htmlFor="textarea-with-label">Message</Label>
      <Textarea
        id="textarea-with-label"
        placeholder="Type your message here..."
        {...args}
      />
    </div>
  ),
};

export const Required: Story = {
  render: args => (
    <div className="space-y-2">
      <Label htmlFor="required-textarea" required>
        Description
      </Label>
      <Textarea
        id="required-textarea"
        placeholder="Please provide a description..."
        {...args}
      />
    </div>
  ),
};

export const WithDescription: Story = {
  render: args => (
    <div className="space-y-2">
      <Label
        htmlFor="textarea-with-desc"
        description="Describe your project goals and requirements."
      >
        Project Description
      </Label>
      <Textarea
        id="textarea-with-desc"
        placeholder="Enter project details..."
        {...args}
      />
    </div>
  ),
};

export const WithHelpText: Story = {
  render: args => (
    <div className="space-y-2">
      <Label
        htmlFor="textarea-with-help"
        helpText="Maximum 500 characters"
      >
        Comments
      </Label>
      <Textarea
        id="textarea-with-help"
        placeholder="Add your comments..."
        maxLength={500}
        {...args}
      />
    </div>
  ),
};

export const ErrorState: Story = {
  render: args => (
    <div className="space-y-2">
      <Label
        htmlFor="error-textarea"
        error
        description="This field is required"
      >
        Required Field
      </Label>
      <Textarea
        id="error-textarea"
        placeholder="Enter required information..."
        error
        {...args}
      />
    </div>
  ),
};

export const SuccessState: Story = {
  render: args => (
    <div className="space-y-2">
      <Label
        htmlFor="success-textarea"
        success
        description="Looks good!"
      >
        Valid Input
      </Label>
      <Textarea
        id="success-textarea"
        value="This is a valid input with proper formatting."
        success
        {...args}
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: args => (
    <div className="space-y-2">
      <Label htmlFor="disabled-textarea">Disabled Textarea</Label>
      <Textarea
        id="disabled-textarea"
        placeholder="This textarea is disabled"
        disabled
        {...args}
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label size="sm">Small Textarea</Label>
        <Textarea textareaSize="sm" placeholder="Small textarea..." />
      </div>
      <div className="space-y-2">
        <Label size="md">Medium Textarea</Label>
        <Textarea textareaSize="md" placeholder="Medium textarea..." />
      </div>
      <div className="space-y-2">
        <Label size="lg">Large Textarea</Label>
        <Textarea textareaSize="lg" placeholder="Large textarea..." />
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="form-title" required>
          Title
        </Label>
        <Textarea
          id="form-title"
          textareaSize="sm"
          placeholder="Enter a brief title..."
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="form-description"
          required
          description="Provide a detailed description of your request"
        >
          Description
        </Label>
        <Textarea
          id="form-description"
          placeholder="Describe your needs in detail..."
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="form-notes"
          helpText="Any additional information or special requirements"
        >
          Additional Notes (Optional)
        </Label>
        <Textarea
          id="form-notes"
          placeholder="Add any extra details..."
          textareaSize="lg"
        />
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
        <h3 className="text-slate-900 text-lg font-semibold mb-4">Dark Theme Textarea</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-900">Default Textarea</Label>
            <Textarea placeholder="Enter text..." />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-900">Error State</Label>
            <Textarea placeholder="Invalid input..." error />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-900">Success State</Label>
            <Textarea placeholder="Valid input..." success />
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
        <p className="text-sm text-secondary-600">Use Tab to navigate, Enter for new lines</p>
        <div className="space-y-2">
          <Label htmlFor="accessible-textarea-1">First Textarea</Label>
          <Textarea id="accessible-textarea-1" placeholder="Tab to next textarea" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accessible-textarea-2">Second Textarea</Label>
          <Textarea id="accessible-textarea-2" placeholder="Continue navigation" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Screen Reader Labels</h3>
        <div className="space-y-2">
          <Label htmlFor="sr-textarea" required description="This field is required for form submission">
            Required Field
          </Label>
          <Textarea
            id="sr-textarea"
            placeholder="Enter required information"
            aria-describedby="sr-textarea-description"
          />
          <p id="sr-textarea-description" className="text-sm text-secondary-600">
            This description provides additional context for screen readers
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Focus Indicators</h3>
        <div className="space-y-2">
          <Label htmlFor="focus-textarea">Focus Test</Label>
          <Textarea
            id="focus-textarea"
            placeholder="Click or tab to focus"
            className="focus-visible:ring-4 focus-visible:ring-primary-500"
          />
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
          <Textarea placeholder="Hover over this textarea" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Focus Animations</h3>
        <div className="space-y-2">
          <Label>Focus for Scale & Ring</Label>
          <Textarea placeholder="Click to focus" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">State Transitions</h3>
        <div className="space-y-2">
          <Label>Error State Animation</Label>
          <Textarea placeholder="Smooth error transition" error />
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
        <p className="text-sm text-secondary-600">Textareas are optimized for mobile touch targets</p>
        <div className="space-y-2">
          <Label>Mobile Friendly Textarea</Label>
          <Textarea placeholder="Easy to tap and type" textareaSize="lg" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Resizable</h3>
        <div className="space-y-2">
          <Label>Vertical Resize</Label>
          <Textarea placeholder="Drag the bottom-right corner to resize" />
        </div>
      </div>
    </div>
  ),
};