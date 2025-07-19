import type { Meta, StoryObj } from '@storybook/react';
import { ProfileSettings } from '../../components/Settings/ProfileSettings';

const meta: Meta<typeof ProfileSettings> = {
  title: 'Settings/ProfileSettings',
  component: ProfileSettings,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The ProfileSettings component allows users to manage their profile information,
including basic details, professional information, and preferences.

## Features
- **Profile Picture**: Avatar display with upload functionality
- **Basic Information**: Name, email, username management
- **Professional Info**: Job title, company, bio, location, website
- **Preferences**: Timezone and language selection
- **Form Validation**: Real-time validation with error states
- **Save States**: Loading and success feedback
        `,
      },
    },
  },
  argTypes: {
    onSave: {
      action: 'profile-saved',
      description: 'Callback when profile settings are saved',
    },
  },
  decorators: [
    Story => (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ProfileSettings>;

/**
 * Default profile settings component
 */
export const Default: Story = {};

/**
 * Profile settings with custom save handler
 */
export const WithSaveHandler: Story = {
  args: {
    onSave: settings => {
      console.log('Profile settings saved:', settings);
      alert('Profile updated successfully!');
    },
  },
};

/**
 * Compact view for smaller screens
 */
export const CompactView: Story = {
  decorators: [
    Story => (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'mobile2',
    },
  },
};

/**
 * Profile settings in a modal-like container
 */
export const ModalStyle: Story = {
  decorators: [
    Story => (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};
