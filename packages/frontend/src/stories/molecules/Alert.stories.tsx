import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Alert } from '../../components/ui/molecules/Alert'
import { Button } from '../../components/ui/atoms/Button'
import {
  Icon,
  CheckIcon,
  XMarkIcon,
  WarningIcon,
  NotificationIcon,
  SettingsIcon,
} from '../../components/ui/atoms/Icon'

const meta: Meta<typeof Alert> = {
  title: 'Molecules/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile alert molecule that combines Icons, Buttons, and content to provide user feedback and notifications. Built with atomic design principles, it composes Icon and Button atoms with proper ARIA semantics for accessibility. Features multiple variants, dismissible functionality, custom actions, and comprehensive theming support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'error', 'info'],
      description: 'Visual style variant of the alert',
    },
    title: {
      control: { type: 'text' },
      description: 'Optional title for the alert',
    },
    dismissible: {
      control: { type: 'boolean' },
      description: 'Whether the alert can be dismissed',
    },
    onDismiss: {
      action: 'dismissed',
      description: 'Callback fired when alert is dismissed',
    },
    icon: {
      control: { type: 'boolean' },
      description: 'Custom icon element (set to false to disable default icon)',
      mapping: {
        true: <Icon icon={CheckIcon} />,
        false: null,
      },
    },
    actions: {
      control: { type: 'boolean' },
      description: 'Action buttons area',
      mapping: {
        true: (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost">
              Action
            </Button>
          </div>
        ),
        false: null,
      },
    },
    children: {
      control: { type: 'text' },
      description: 'Alert content/message',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-lg">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'This is a default alert with some important information.',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success!',
    children: 'Your changes have been saved successfully.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    children: 'This action cannot be undone. Please proceed with caution.',
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    children: 'There was an error processing your request. Please try again.',
  },
}

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    children: 'New features are available! Check out the latest updates.',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-2xl">
      <Alert variant="default" title="Default Alert">
        This is a default alert with neutral styling for general information.
      </Alert>

      <Alert variant="success" title="Success Alert">
        Your operation completed successfully. All changes have been saved.
      </Alert>

      <Alert variant="warning" title="Warning Alert">
        This action requires your attention. Please review before proceeding.
      </Alert>

      <Alert variant="error" title="Error Alert">
        An error occurred while processing your request. Please try again.
      </Alert>

      <Alert variant="info" title="Info Alert">
        Here's some helpful information about the current state of your project.
      </Alert>
    </div>
  ),
}

export const WithoutTitle: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-2xl">
      <Alert variant="success">Changes saved successfully without a title.</Alert>

      <Alert variant="warning">
        Warning message without title - the text is automatically emphasized.
      </Alert>

      <Alert variant="error">Error occurred - no title needed for simple messages.</Alert>
    </div>
  ),
}

export const WithCustomIcons: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-2xl">
      <Alert
        variant="info"
        title="System Update"
        icon={<Icon icon={SettingsIcon} className="h-4 w-4 text-primary-600" />}
      >
        A system update is available. Click here to install.
      </Alert>

      <Alert
        variant="success"
        title="Security Check"
        icon={<Icon icon={CheckIcon} className="h-4 w-4 text-success-600" />}
      >
        All security checks passed. Your system is secure.
      </Alert>

      <Alert
        variant="warning"
        title="New Notification"
        icon={<Icon icon={NotificationIcon} className="h-4 w-4 text-warning-600" />}
      >
        You have 3 unread notifications waiting for your attention.
      </Alert>
    </div>
  ),
}

export const WithoutIcons: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-2xl">
      <Alert variant="success" title="Clean Success" icon={null}>
        Success message without an icon for cleaner presentation.
      </Alert>

      <Alert variant="error" title="Simple Error" icon={null}>
        Error message with no icon - relies on color coding only.
      </Alert>

      <Alert variant="info" icon={null}>
        Info message without title or icon - minimal styling.
      </Alert>
    </div>
  ),
}

export const DismissibleAlerts: Story = {
  render: () => {
    const [alerts, setAlerts] = useState([
      {
        id: 1,
        variant: 'success',
        title: 'Success!',
        message: 'Operation completed successfully.',
      },
      {
        id: 2,
        variant: 'warning',
        title: 'Warning',
        message: 'This alert can be dismissed.',
      },
      {
        id: 3,
        variant: 'info',
        title: 'Information',
        message: 'Click the X to dismiss this alert.',
      },
    ])

    const dismissAlert = (id: number) => {
      setAlerts(alerts.filter((alert) => alert.id !== id))
    }

    return (
      <div className="space-y-4 w-full max-w-2xl">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            variant={alert.variant as any}
            title={alert.title}
            dismissible
            onDismiss={() => dismissAlert(alert.id)}
          >
            {alert.message}
          </Alert>
        ))}

        {alerts.length === 0 && (
          <div className="text-center py-8 text-secondary-500">
            <p>All alerts have been dismissed!</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setAlerts([
                  {
                    id: 1,
                    variant: 'success',
                    title: 'Success!',
                    message: 'Operation completed successfully.',
                  },
                  {
                    id: 2,
                    variant: 'warning',
                    title: 'Warning',
                    message: 'This alert can be dismissed.',
                  },
                  {
                    id: 3,
                    variant: 'info',
                    title: 'Information',
                    message: 'Click the X to dismiss this alert.',
                  },
                ])
              }
              className="mt-2"
            >
              Reset Alerts
            </Button>
          </div>
        )}
      </div>
    )
  },
}

export const WithActions: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-2xl">
      <Alert
        variant="info"
        title="Update Available"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Update Now
            </Button>
            <Button size="sm" variant="ghost">
              Remind Later
            </Button>
          </div>
        }
      >
        A new version of the application is available with bug fixes and improvements.
      </Alert>

      <Alert
        variant="warning"
        title="Confirm Deletion"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="destructive">
              Delete
            </Button>
            <Button size="sm" variant="ghost">
              Cancel
            </Button>
          </div>
        }
      >
        Are you sure you want to delete this item? This action cannot be undone.
      </Alert>

      <Alert
        variant="success"
        title="Backup Complete"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              View Details
            </Button>
            <Button size="sm" variant="ghost">
              Download
            </Button>
          </div>
        }
      >
        Your data has been successfully backed up to cloud storage.
      </Alert>
    </div>
  ),
}

export const DismissibleWithActions: Story = {
  render: () => {
    const [showAlert, setShowAlert] = useState(true)

    if (!showAlert) {
      return (
        <div className="text-center py-8 text-secondary-500 max-w-2xl">
          <p>Alert was dismissed!</p>
          <Button variant="outline" size="sm" onClick={() => setShowAlert(true)} className="mt-2">
            Show Alert Again
          </Button>
        </div>
      )
    }

    return (
      <div className="w-full max-w-2xl">
        <Alert
          variant="warning"
          title="Account Expiring Soon"
          dismissible
          onDismiss={() => setShowAlert(false)}
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="primary">
                Renew Now
              </Button>
              <Button size="sm" variant="ghost">
                View Details
              </Button>
            </div>
          }
        >
          Your account will expire in 7 days. Renew now to continue using all features without
          interruption.
        </Alert>
      </div>
    )
  },
}

export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-2xl">
      <div>
        <h3 className="font-semibold mb-3">Form Validation</h3>
        <Alert
          variant="error"
          title="Form Validation Failed"
          icon={<Icon icon={WarningIcon} className="h-4 w-4 text-error-600" />}
        >
          Please check the following fields: Email address, Password confirmation, and Terms of
          service acceptance.
        </Alert>
      </div>

      <div>
        <h3 className="font-semibold mb-3">System Notification</h3>
        <Alert
          variant="info"
          title="Scheduled Maintenance"
          dismissible
          onDismiss={() => console.log('Maintenance alert dismissed')}
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Learn More
              </Button>
            </div>
          }
        >
          System maintenance is scheduled for tonight from 2:00 AM to 4:00 AM EST. Some features may
          be temporarily unavailable.
        </Alert>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Success Confirmation</h3>
        <Alert
          variant="success"
          title="Project Created Successfully"
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                View Project
              </Button>
              <Button size="sm" variant="ghost">
                Create Another
              </Button>
            </div>
          }
        >
          Your new project "TaskMaster Dashboard" has been created and is ready to use. Team members
          have been notified.
        </Alert>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Security Alert</h3>
        <Alert
          variant="warning"
          title="Unusual Login Activity"
          icon={<Icon icon={CheckIcon} className="h-4 w-4 text-warning-600" />}
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="primary">
                Secure Account
              </Button>
              <Button size="sm" variant="ghost">
                This Was Me
              </Button>
            </div>
          }
        >
          We detected a login from a new device in New York, NY. If this wasn't you, please secure
          your account immediately.
        </Alert>
      </div>
    </div>
  ),
}

export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-2xl">
      <div>
        <h3 className="font-semibold mb-3">Screen Reader Compatibility</h3>
        <p className="text-sm text-secondary-600 mb-4">
          All alerts include proper ARIA roles and live regions for screen reader accessibility.
        </p>

        <Alert variant="error" title="Accessibility Focus" role="alert" aria-live="assertive">
          This error alert has <code>role="alert"</code> and <code>aria-live="assertive"</code>
          for immediate screen reader announcement.
        </Alert>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Keyboard Navigation</h3>
        <Alert
          variant="info"
          title="Keyboard Accessible"
          dismissible
          onDismiss={() => console.log('Alert dismissed via keyboard')}
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Tab to focus
              </Button>
              <Button size="sm" variant="ghost">
                Navigate with Tab
              </Button>
            </div>
          }
        >
          Use Tab to navigate between action buttons and the dismiss button. Press Enter or Space to
          activate.
        </Alert>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Focus Management</h3>
        <Alert
          variant="success"
          title="Focus Indicator"
          dismissible
          onDismiss={() => console.log('Alert dismissed')}
        >
          The dismiss button and action buttons have clear focus indicators for keyboard users.
        </Alert>
      </div>
    </div>
  ),
}

export const NotificationSystem: Story = {
  render: () => {
    const [notifications, setNotifications] = useState([
      {
        id: 1,
        type: 'info',
        title: 'Welcome!',
        message: 'Welcome to TaskMaster. Start by creating your first project.',
        actions: true,
      },
      {
        id: 2,
        type: 'warning',
        title: 'Low Storage',
        message: 'You are running low on storage space. Consider upgrading your plan.',
        actions: true,
      },
    ])

    const addNotification = (type: string) => {
      const messages = {
        success: 'Operation completed successfully!',
        error: 'An error occurred. Please try again.',
        warning: 'This action requires your attention.',
        info: 'Here is some helpful information.',
      }

      const newNotification = {
        id: Date.now(),
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
        message: messages[type as keyof typeof messages],
        actions: false,
      }

      setNotifications((prev) => [...prev, newNotification])
    }

    const removeNotification = (id: number) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }

    return (
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Notification System Demo</h3>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => addNotification('success')}>
              Add Success
            </Button>
            <Button size="sm" variant="outline" onClick={() => addNotification('error')}>
              Add Error
            </Button>
            <Button size="sm" variant="outline" onClick={() => addNotification('warning')}>
              Add Warning
            </Button>
            <Button size="sm" variant="outline" onClick={() => addNotification('info')}>
              Add Info
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <Alert
              key={notification.id}
              variant={notification.type as any}
              title={notification.title}
              dismissible
              onDismiss={() => removeNotification(notification.id)}
              actions={
                notification.actions ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Take Action
                    </Button>
                    <Button size="sm" variant="ghost">
                      Learn More
                    </Button>
                  </div>
                ) : undefined
              }
            >
              {notification.message}
            </Alert>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-8 text-secondary-500">
              <p>No notifications. Add some using the buttons above!</p>
            </div>
          )}
        </div>
      </div>
    )
  },
}
