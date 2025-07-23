import type { Meta, StoryObj } from '@storybook/react'
import { IntegrationsSettings } from '../../components/Settings/IntegrationsSettings'

const meta: Meta<typeof IntegrationsSettings> = {
  title: 'Settings/IntegrationsSettings',
  component: IntegrationsSettings,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The IntegrationsSettings component manages third-party service connections
and custom webhook configurations.

## Features
- **Service Categories**: Development, Communication, Project Management
- **OAuth Connections**: GitHub, GitLab, Slack, Jira, Discord integrations
- **Webhook Management**: Custom webhook endpoints with event filtering
- **Connection Status**: Visual indicators for connected/disconnected services
- **Toggle Controls**: Easy enable/disable for each integration
        `,
      },
    },
  },
  argTypes: {
    onSave: {
      action: 'integrations-saved',
      description: 'Callback when integration settings are saved',
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof IntegrationsSettings>

/**
 * Default integrations settings
 */
export const Default: Story = {}

/**
 * All integrations connected
 */
export const AllConnected: Story = {
  // This would require modifying the component to accept initial state
  // For now, it's the same as default but could be extended
}

/**
 * Mobile responsive view
 */
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-full mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
}
