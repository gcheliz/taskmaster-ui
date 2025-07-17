import type { Meta, StoryObj } from '@storybook/react-vite';

// Welcome Component for Storybook Validation
const Welcome = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-display-large text-primary-600 mb-4">
          TaskMaster UI Component Library
        </h1>
        <p className="text-body-large text-secondary-600 max-w-2xl mx-auto">
          Welcome to the TaskMaster UI component library built with React, TypeScript, 
          Tailwind CSS, and Storybook. This is your playground for developing and 
          testing UI components in isolation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="card-elevated p-6">
          <h3 className="text-headline-medium text-primary-700 mb-3">🎨 Design System</h3>
          <p className="text-body-medium text-secondary-600">
            Comprehensive design tokens with colors, typography, spacing, and components 
            built on Tailwind CSS v4.1.11.
          </p>
        </div>

        <div className="card-elevated p-6">
          <h3 className="text-headline-medium text-success-700 mb-3">📚 Component Library</h3>
          <p className="text-body-medium text-secondary-600">
            Atomic design methodology with atoms, molecules, and organisms for 
            scalable component architecture.
          </p>
        </div>

        <div className="card-elevated p-6">
          <h3 className="text-headline-medium text-warning-700 mb-3">♿ Accessibility</h3>
          <p className="text-body-medium text-secondary-600">
            WCAG-compliant components with focus management, ARIA attributes, 
            and screen reader support.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-headline-large text-center text-secondary-800">
          Component Examples
        </h2>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <button className="btn-primary">Primary Action</button>
          <button className="btn-secondary">Secondary Action</button>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <span className="status-pending px-3 py-1 rounded-md text-sm font-medium">
            Pending
          </span>
          <span className="status-in-progress px-3 py-1 rounded-md text-sm font-medium">
            In Progress
          </span>
          <span className="status-done px-3 py-1 rounded-md text-sm font-medium">
            Completed
          </span>
        </div>

        <div className="max-w-md mx-auto">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Sample Input
          </label>
          <input 
            type="text" 
            className="input-base focus-ring w-full"
            placeholder="Enter some text..."
          />
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-body-small text-secondary-500">
          Use the Controls panel to interact with component props, 
          and the Viewport addon to test responsive behavior.
        </p>
      </div>
    </div>
  );
};

const meta: Meta<typeof Welcome> = {
  title: 'Welcome/Getting Started',
  component: Welcome,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Welcome to the TaskMaster UI component library. This story demonstrates the design system integration and basic component usage.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DarkTheme: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const TaskMasterTheme: Story = {
  parameters: {
    backgrounds: { default: 'TaskMaster' },
  },
};