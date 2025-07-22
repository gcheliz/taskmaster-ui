import type { Meta, StoryObj } from '@storybook/react';
import { RepositoryManagementDemoView } from '../../components/Views/RepositoryManagementDemoView';

const meta: Meta<typeof RepositoryManagementDemoView> = {
  title: 'Views/Repository Management Demo',
  component: RepositoryManagementDemoView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive demo of the repository management interface showcasing various repository states, Git statistics, health indicators, and interactive features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: { type: 'text' },
      description: 'Additional CSS class names for styling',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'The default repository management view with mock data showcasing all features including repository cards, statistics, health indicators, and filtering capabilities.',
      },
    },
  },
};

export const FullScreenDemo: Story = {
  args: {
    className: 'p-6 min-h-screen bg-gray-50',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A full-screen demo showing how the repository management interface would look in a complete application layout.',
      },
    },
  },
};

export const CompactView: Story = {
  args: {
    className: 'p-4',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A more compact version of the repository management view suitable for embedding within other interfaces.',
      },
    },
  },
};
