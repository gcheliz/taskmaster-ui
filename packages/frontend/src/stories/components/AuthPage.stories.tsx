import type { Meta, StoryObj } from '@storybook/react'
import { AuthPage } from '../../components/Auth/AuthPage'

const meta: Meta<typeof AuthPage> = {
  title: 'Components/AuthPage',
  component: AuthPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A complete authentication page with tabbed login/registration forms, glassmorphism effects, social login options, and password strength indicators.',
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        {
          name: 'gradient',
          value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    defaultTab: {
      control: { type: 'select' },
      options: ['login', 'register'],
      description: 'Default tab to show when the page loads',
    },
    showSocialLogins: {
      control: { type: 'boolean' },
      description: 'Whether to show social login options',
    },
    backgroundImage: {
      control: { type: 'text' },
      description: 'Custom background image URL',
    },
    onAuthSuccess: {
      action: 'authSuccess',
      description: 'Callback when authentication is successful',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultTab: 'login',
    showSocialLogins: true,
  },
}

export const RegisterDefault: Story = {
  args: {
    defaultTab: 'register',
    showSocialLogins: true,
  },
}

export const WithoutSocialLogins: Story = {
  args: {
    defaultTab: 'login',
    showSocialLogins: false,
  },
}

export const CustomBackground: Story = {
  args: {
    defaultTab: 'login',
    showSocialLogins: true,
    backgroundImage:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2574&q=80',
  },
}

export const GlassmorphismShowcase: Story = {
  parameters: {
    backgrounds: { default: 'gradient' },
  },
  args: {
    defaultTab: 'login',
    showSocialLogins: true,
  },
  render: (args) => (
    <div
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
      }}
    >
      <AuthPage {...args} />
    </div>
  ),
}

export const InteractiveDemo: Story = {
  args: {
    defaultTab: 'login',
    showSocialLogins: true,
  },
  play: async ({ canvasElement, step }) => {
    // This would be used for interactive testing
    console.log('Interactive demo: Authentication page loaded')
  },
}

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile2',
    },
  },
  args: {
    defaultTab: 'register',
    showSocialLogins: true,
  },
}

export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  args: {
    defaultTab: 'login',
    showSocialLogins: true,
  },
}

export const DesktopView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
  args: {
    defaultTab: 'register',
    showSocialLogins: true,
  },
}
