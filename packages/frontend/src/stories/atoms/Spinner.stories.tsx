import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner, PulseSpinner, DotsSpinner } from '../../components/ui/atoms/Spinner';
import { Button } from '../../components/ui/atoms/Button';

const meta: Meta<typeof Spinner> = {
  title: 'Atoms/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Loading spinner components for indicating progress and loading states. Includes multiple variants for different use cases.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'The size of the spinner',
    },
    spinnerColor: {
      control: { type: 'select' },
      options: ['current', 'primary', 'secondary', 'success', 'warning', 'error', 'white', 'muted'],
      description: 'The color of the spinner',
    },
    'aria-label': {
      control: { type: 'text' },
      description: 'Accessible label for screen readers',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'md',
    spinnerColor: 'primary',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Spinner size="xs" spinnerColor="primary" />
        <span className="text-xs text-secondary-600">XS</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="sm" spinnerColor="primary" />
        <span className="text-xs text-secondary-600">SM</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="md" spinnerColor="primary" />
        <span className="text-xs text-secondary-600">MD</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="lg" spinnerColor="primary" />
        <span className="text-xs text-secondary-600">LG</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="xl" spinnerColor="primary" />
        <span className="text-xs text-secondary-600">XL</span>
      </div>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-6">
      <div className="flex flex-col items-center gap-2">
        <Spinner spinnerColor="primary" />
        <span className="text-xs text-secondary-600">Primary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner spinnerColor="secondary" />
        <span className="text-xs text-secondary-600">Secondary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner spinnerColor="success" />
        <span className="text-xs text-secondary-600">Success</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner spinnerColor="warning" />
        <span className="text-xs text-secondary-600">Warning</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner spinnerColor="error" />
        <span className="text-xs text-secondary-600">Error</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner spinnerColor="muted" />
        <span className="text-xs text-secondary-600">Muted</span>
      </div>
      <div className="flex flex-col items-center gap-2 bg-secondary-800 p-4 rounded">
        <Spinner spinnerColor="white" />
        <span className="text-xs text-white">White</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner spinnerColor="current" className="text-primary-600" />
        <span className="text-xs text-secondary-600">Current</span>
      </div>
    </div>
  ),
};

export const SpinnerVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-secondary-900 mb-4">Default Spinner</h3>
        <div className="flex items-center gap-6">
          <Spinner size="sm" spinnerColor="primary" />
          <Spinner size="md" spinnerColor="primary" />
          <Spinner size="lg" spinnerColor="primary" />
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-secondary-900 mb-4">Pulse Spinner</h3>
        <div className="flex items-center gap-6">
          <PulseSpinner size="sm" pulseColor="primary" />
          <PulseSpinner size="md" pulseColor="primary" />
          <PulseSpinner size="lg" pulseColor="primary" />
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-secondary-900 mb-4">Dots Spinner</h3>
        <div className="flex items-center gap-6">
          <DotsSpinner size="sm" color="primary" />
          <DotsSpinner size="md" color="primary" />
          <DotsSpinner size="lg" color="primary" />
        </div>
      </div>
    </div>
  ),
};

export const InButtons: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button disabled>
        <Spinner size="sm" spinnerColor="white" className="mr-2" />
        Loading...
      </Button>
      <Button variant="secondary" disabled>
        <Spinner size="sm" spinnerColor="current" className="mr-2" />
        Processing
      </Button>
      <Button variant="outline" disabled>
        <DotsSpinner size="sm" color="current" className="mr-2" />
        Saving
      </Button>
    </div>
  ),
};

export const LoadingStates: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="border border-secondary-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" spinnerColor="primary" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Loading Tasks</h3>
            <p className="text-secondary-600">Please wait while we fetch your tasks...</p>
          </div>
        </div>
      </div>
      
      <div className="border border-secondary-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <DotsSpinner size="lg" color="success" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Syncing Data</h3>
            <p className="text-secondary-600">Synchronizing with the server...</p>
          </div>
        </div>
      </div>
      
      <div className="border border-secondary-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <PulseSpinner size="lg" pulseColor="warning" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Processing</h3>
            <p className="text-secondary-600">Analyzing your project structure...</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const InlineSpinners: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Spinner size="sm" spinnerColor="primary" />
        <span className="text-sm text-secondary-600">Loading your dashboard...</span>
      </div>
      
      <div className="flex items-center gap-2">
        <DotsSpinner size="sm" color="success" />
        <span className="text-sm text-secondary-600">Saving changes...</span>
      </div>
      
      <div className="flex items-center gap-2">
        <PulseSpinner size="sm" pulseColor="warning" />
        <span className="text-sm text-secondary-600">Connecting to server...</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Spinner size="sm" spinnerColor="error" />
        <span className="text-sm text-secondary-600">Retrying connection...</span>
      </div>
    </div>
  ),
};

export const OverlaySpinner: Story = {
  render: () => (
    <div className="relative">
      <div className="border border-secondary-200 rounded-lg p-6 bg-secondary-50">
        <h3 className="text-lg font-medium text-secondary-900 mb-4">Task Board</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium mb-2">To Do</h4>
            <div className="space-y-2">
              <div className="bg-secondary-100 p-2 rounded">Task 1</div>
              <div className="bg-secondary-100 p-2 rounded">Task 2</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium mb-2">In Progress</h4>
            <div className="space-y-2">
              <div className="bg-secondary-100 p-2 rounded">Task 3</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium mb-2">Done</h4>
            <div className="space-y-2">
              <div className="bg-secondary-100 p-2 rounded">Task 4</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <Spinner size="lg" spinnerColor="primary" className="mx-auto mb-4" />
          <p className="text-secondary-600">Updating board...</p>
        </div>
      </div>
    </div>
  ),
};

export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Spinner 
          size="md" 
          spinnerColor="primary" 
          aria-label="Loading user data"
        />
        <span className="text-sm text-secondary-600">
          Loading user data...
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <DotsSpinner 
          size="md" 
          color="success" 
          aria-label="Uploading file, please wait"
        />
        <span className="text-sm text-secondary-600">
          Uploading file...
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <PulseSpinner 
          size="md" 
          pulseColor="warning" 
          aria-label="Processing payment"
        />
        <span className="text-sm text-secondary-600">
          Processing payment...
        </span>
      </div>
    </div>
  ),
};