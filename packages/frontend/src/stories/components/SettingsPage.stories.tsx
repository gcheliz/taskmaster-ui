import type { Meta, StoryObj } from '@storybook/react';
import { SettingsPage } from '../../components/Settings/SettingsPage';

const meta: Meta<typeof SettingsPage> = {
  title: 'Settings/SettingsPage',
  component: SettingsPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The SettingsPage component provides a comprehensive settings interface with categorized sections
and glassmorphism design effects. It includes multiple settings categories like Profile, Security,
Notifications, Integrations, and Appearance.

## Features
- **Categorized Navigation**: Easy-to-use sidebar navigation between settings categories
- **Glassmorphism Design**: Beautiful semi-transparent effects with backdrop blur
- **Responsive Layout**: Adapts to different screen sizes with mobile-first approach
- **Form Components**: Consistent form elements throughout all settings sections
- **Real-time Updates**: Immediate visual feedback for setting changes

## Settings Categories
- **Profile**: Basic user information, professional details, and preferences
- **Security**: Password management, 2FA, sessions, and API keys
- **Notifications**: Email, push, Slack, and desktop notification preferences
- **Integrations**: Third-party service connections (GitHub, Slack, Jira, etc.)
- **Appearance**: Theme, colors, typography, and accessibility options
        `,
      },
    },
  },
  argTypes: {
    defaultCategory: {
      control: 'select',
      options: [
        'profile',
        'security',
        'notifications',
        'integrations',
        'appearance',
      ],
      description: 'The default category to show when the settings page loads',
    },
    onSettingsSave: {
      action: 'settings-saved',
      description: 'Callback function called when settings are saved',
    },
  },
  args: {
    defaultCategory: 'profile',
  },
};

export default meta;

type Story = StoryObj<typeof SettingsPage>;

/**
 * Default settings page showing the Profile category
 */
export const Default: Story = {
  args: {
    defaultCategory: 'profile',
  },
};

/**
 * Settings page starting with the Security category
 */
export const SecuritySettings: Story = {
  args: {
    defaultCategory: 'security',
  },
};

/**
 * Settings page starting with the Notifications category
 */
export const NotificationSettings: Story = {
  args: {
    defaultCategory: 'notifications',
  },
};

/**
 * Settings page starting with the Integrations category
 */
export const IntegrationsSettings: Story = {
  args: {
    defaultCategory: 'integrations',
  },
};

/**
 * Settings page starting with the Appearance category
 */
export const AppearanceSettings: Story = {
  args: {
    defaultCategory: 'appearance',
  },
};

/**
 * Settings page with custom event handling
 */
export const WithEventHandling: Story = {
  args: {
    defaultCategory: 'profile',
    onSettingsSave: (category: string, settings: any) => {
      console.log(`Settings saved for ${category}:`, settings);
      alert(`Settings saved for ${category} category!`);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates the settings save callback functionality.',
      },
    },
  },
};

/**
 * Mobile responsive view of the settings page
 */
export const MobileView: Story = {
  args: {
    defaultCategory: 'profile',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'Settings page optimized for mobile devices with responsive layout.',
      },
    },
  },
};

/**
 * Tablet view of the settings page
 */
export const TabletView: Story = {
  args: {
    defaultCategory: 'integrations',
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story:
          'Settings page on tablet-sized screens showing the integrations category.',
      },
    },
  },
};

/**
 * Settings page with dark background for contrast testing
 */
export const DarkBackground: Story = {
  args: {
    defaultCategory: 'appearance',
    className: 'bg-gray-900',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story:
          'Settings page with dark background to test glassmorphism effects and contrast.',
      },
    },
  },
};
