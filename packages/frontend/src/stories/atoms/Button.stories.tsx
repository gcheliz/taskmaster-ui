import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../../components/ui/atoms/Button'
import { Icon, PlusIcon, CheckIcon, TrashIcon } from '../../components/ui/atoms/Icon'

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile button component with multiple variants, sizes, and states. Built with Tailwind CSS and class-variance-authority for consistent styling. Features enhanced dark theme support, micro-interactions, and WCAG 2.1 AA compliance.',
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
    children: {
      control: { type: 'text' },
      description: 'Button content',
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'link', 'destructive'],
      description: 'Button variant',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', 'icon'],
      description: 'Button size',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Loading state',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disabled state',
    },
    onClick: {
      action: 'clicked',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
}

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
}

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
}

export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
}

export const Loading: Story = {
  args: {
    children: 'Processing...',
    variant: 'primary',
    loading: true,
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    variant: 'primary',
    disabled: true,
  },
}

export const WithLeftIcon: Story = {
  args: {
    children: 'Add Item',
    variant: 'primary',
    leftIcon: <Icon icon={PlusIcon} size="sm" />,
  },
}

export const WithRightIcon: Story = {
  args: {
    children: 'Save Changes',
    variant: 'primary',
    rightIcon: <Icon icon={CheckIcon} size="sm" />,
  },
}

export const IconOnly: Story = {
  args: {
    variant: 'outline',
    size: 'icon',
    children: <Icon icon={TrashIcon} size="sm" />,
    'aria-label': 'Delete item',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
}

export const InteractiveStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button variant="primary">Normal</Button>
        <Button variant="primary" className="hover:bg-primary-700">
          Hover
        </Button>
        <Button variant="primary" className="focus:ring-2 focus:ring-primary-500">
          Focus
        </Button>
      </div>
      <div className="flex gap-4">
        <Button variant="primary" loading>
          Loading
        </Button>
        <Button variant="primary" disabled>
          Disabled
        </Button>
      </div>
    </div>
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
        <h3 className="text-slate-900 text-lg font-semibold mb-4">Dark Theme Variants</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
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
        <h3 className="text-lg font-semibold">Keyboard Navigation Test</h3>
        <p className="text-sm text-secondary-600">Use Tab to navigate, Enter/Space to activate</p>
        <div className="flex gap-2">
          <Button variant="primary">First Button</Button>
          <Button variant="secondary">Second Button</Button>
          <Button variant="outline">Third Button</Button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Focus Indicators</h3>
        <div className="flex gap-2">
          <Button variant="primary" className="focus-visible:ring-4">
            Enhanced Focus
          </Button>
          <Button variant="secondary" disabled>
            Disabled (Not Focusable)
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Screen Reader Labels</h3>
        <div className="flex gap-2">
          <Button variant="primary" aria-label="Save document">
            Save
          </Button>
          <Button variant="destructive" aria-label="Delete item permanently">
            Delete
          </Button>
          <Button variant="outline" size="icon" aria-label="Close dialog">
            <Icon icon={TrashIcon} size="sm" />
          </Button>
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
        <div className="flex gap-2">
          <Button variant="primary">Hover for Scale & Shadow</Button>
          <Button variant="secondary">Hover for Smooth Transition</Button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Active States</h3>
        <div className="flex gap-2">
          <Button variant="primary">Click for Scale Down</Button>
          <Button variant="outline">Press & Hold</Button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Loading Animations</h3>
        <div className="flex gap-2">
          <Button variant="primary" loading>
            Processing...
          </Button>
          <Button variant="secondary" loading>
            Saving...
          </Button>
        </div>
      </div>
    </div>
  ),
}
