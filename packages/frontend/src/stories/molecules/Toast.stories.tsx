import type { Meta, StoryObj } from '@storybook/react'
import { useState, useEffect } from 'react'
import { Toast } from '../../components/ui/molecules/Toast'
import { Button } from '../../components/ui/atoms/Button'

const meta: Meta<typeof Toast> = {
  title: 'Molecules/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A notification toast molecule that combines Icon atoms with content to provide temporary user feedback. Features auto-dismiss functionality, manual dismissal, customizable duration, and proper ARIA semantics for accessibility. Built with atomic design principles for consistent styling and behavior.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['info', 'success', 'warning', 'error'],
      description: 'Visual style and semantic type of the toast',
    },
    message: {
      control: { type: 'text' },
      description: 'Toast message content',
    },
    duration: {
      control: { type: 'number', min: 0, max: 10000, step: 500 },
      description: 'Auto-dismiss duration in milliseconds (0 = no auto-dismiss)',
    },
    onClose: {
      action: 'closed',
      description: 'Callback fired when toast is closed',
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-[120px] flex items-center justify-center">
        <div className="max-w-md w-full">
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: {
    type: 'success',
    message: 'Your changes have been saved successfully.',
    duration: 5000,
  },
}

export const Error: Story = {
  args: {
    type: 'error',
    message: 'An error occurred while processing your request.',
    duration: 5000,
  },
}

export const Warning: Story = {
  args: {
    type: 'warning',
    message: 'This action cannot be undone. Please proceed with caution.',
    duration: 5000,
  },
}

export const Info: Story = {
  args: {
    type: 'info',
    message: 'New features are available! Check out the latest updates.',
    duration: 5000,
  },
}

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-lg">
      <Toast type="success" message="Operation completed successfully!" duration={0} />

      <Toast type="error" message="Failed to save changes. Please try again." duration={0} />

      <Toast type="warning" message="Your session will expire in 5 minutes." duration={0} />

      <Toast type="info" message="System maintenance scheduled for tonight." duration={0} />
    </div>
  ),
}

export const DifferentDurations: Story = {
  render: () => {
    const [toasts, setToasts] = useState<
      Array<{
        id: number
        type: 'info' | 'success' | 'warning' | 'error'
        message: string
        duration: number
      }>
    >([])

    const addToast = (
      type: 'info' | 'success' | 'warning' | 'error',
      message: string,
      duration: number
    ) => {
      const id = Date.now()
      setToasts((prev) => [...prev, { id, type, message, duration }])
    }

    const removeToast = (id: number) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    return (
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Toast Duration Examples</h3>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => addToast('info', 'Quick notification (2s)', 2000)}
            >
              2 Second Toast
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addToast('success', 'Standard notification (5s)', 5000)}
            >
              5 Second Toast
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addToast('warning', 'Long notification (10s)', 10000)}
            >
              10 Second Toast
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addToast('error', 'Persistent notification - manual dismiss only', 0)}
            >
              No Auto-Dismiss
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              type={toast.type}
              message={toast.message}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          ))}

          {toasts.length === 0 && (
            <div className="text-center py-8 text-secondary-500">
              <p>No active toasts. Click the buttons above to see different durations!</p>
            </div>
          )}
        </div>
      </div>
    )
  },
}

export const ToastNotificationSystem: Story = {
  render: () => {
    const [notifications, setNotifications] = useState<
      Array<{
        id: number
        type: 'info' | 'success' | 'warning' | 'error'
        message: string
        duration: number
      }>
    >([])

    const showNotification = (
      type: 'info' | 'success' | 'warning' | 'error',
      message: string,
      duration = 5000
    ) => {
      const id = Date.now() + Math.random()
      setNotifications((prev) => [...prev, { id, type, message, duration }])
    }

    const removeNotification = (id: number) => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id))
    }

    const clearAll = () => {
      setNotifications([])
    }

    const presetNotifications = [
      {
        type: 'success' as const,
        message: 'Project created successfully!',
        duration: 4000,
      },
      {
        type: 'error' as const,
        message: 'Failed to connect to server.',
        duration: 6000,
      },
      {
        type: 'warning' as const,
        message: 'Unsaved changes will be lost.',
        duration: 8000,
      },
      {
        type: 'info' as const,
        message: 'New team member joined the project.',
        duration: 5000,
      },
    ]

    return (
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Notification System Demo</h3>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {presetNotifications.map((notif, index) => (
              <Button
                key={index}
                size="sm"
                variant="outline"
                onClick={() => showNotification(notif.type, notif.message, notif.duration)}
              >
                {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)} Toast
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                showNotification('info', 'Multiple notifications can appear together', 3000)
                setTimeout(
                  () =>
                    showNotification(
                      'success',
                      'They stack vertically for better visibility',
                      4000
                    ),
                  500
                )
                setTimeout(
                  () => showNotification('warning', 'Each can be dismissed independently', 5000),
                  1000
                )
              }}
            >
              Show Multiple
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={clearAll}
              disabled={notifications.length === 0}
            >
              Clear All ({notifications.length})
            </Button>
          </div>
        </div>

        {/* Toast Container - Fixed positioned */}
        <div className="relative">
          <div className="border-2 border-dashed border-secondary-300 rounded-lg p-4 min-h-[200px] bg-secondary-50">
            <p className="text-sm text-secondary-600 text-center mb-4">Toast Notification Area</p>

            {notifications.length === 0 ? (
              <div className="text-center py-8 text-secondary-400">
                <p>No notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Toast
                    key={notification.id}
                    type={notification.type}
                    message={notification.message}
                    duration={notification.duration}
                    onClose={() => removeNotification(notification.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
}

export const RealWorldExamples: Story = {
  render: () => {
    const [activeToasts, setActiveToasts] = useState<
      Array<{
        id: number
        type: 'info' | 'success' | 'warning' | 'error'
        message: string
        duration: number
      }>
    >([])

    const showToast = (
      type: 'info' | 'success' | 'warning' | 'error',
      message: string,
      duration = 5000
    ) => {
      const id = Date.now() + Math.random()
      setActiveToasts((prev) => [...prev, { id, type, message, duration }])
    }

    const removeToast = (id: number) => {
      setActiveToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    const examples = [
      {
        category: 'Form Validation',
        scenarios: [
          {
            type: 'error' as const,
            message: 'Please fill in all required fields.',
            action: 'Validation Error',
          },
          {
            type: 'success' as const,
            message: 'Form submitted successfully!',
            action: 'Form Success',
          },
        ],
      },
      {
        category: 'File Operations',
        scenarios: [
          {
            type: 'info' as const,
            message: 'File upload started...',
            action: 'Upload Started',
          },
          {
            type: 'success' as const,
            message: 'File uploaded successfully!',
            action: 'Upload Success',
          },
          {
            type: 'error' as const,
            message: 'File upload failed. Please try again.',
            action: 'Upload Error',
          },
        ],
      },
      {
        category: 'System Status',
        scenarios: [
          {
            type: 'warning' as const,
            message: 'System maintenance in 10 minutes.',
            action: 'Maintenance Warning',
          },
          {
            type: 'info' as const,
            message: 'New features available in settings.',
            action: 'Feature Update',
          },
          {
            type: 'error' as const,
            message: 'Connection lost. Attempting to reconnect...',
            action: 'Connection Error',
          },
        ],
      },
      {
        category: 'User Actions',
        scenarios: [
          {
            type: 'success' as const,
            message: 'Task completed successfully!',
            action: 'Task Complete',
          },
          {
            type: 'info' as const,
            message: 'Changes saved automatically.',
            action: 'Auto Save',
          },
          {
            type: 'warning' as const,
            message: 'This action cannot be undone.',
            action: 'Destructive Action',
          },
        ],
      },
    ]

    return (
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <h3 className="font-semibold mb-4">Real-World Toast Examples</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {examples.map((category, categoryIndex) => (
              <div key={categoryIndex} className="border rounded-lg p-4">
                <h4 className="font-medium text-secondary-700 mb-3">{category.category}</h4>
                <div className="space-y-2">
                  {category.scenarios.map((scenario, scenarioIndex) => (
                    <Button
                      key={scenarioIndex}
                      size="sm"
                      variant="outline"
                      onClick={() => showToast(scenario.type, scenario.message)}
                      className="w-full justify-start text-left"
                    >
                      {scenario.action}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toast Display Area */}
        <div className="border-2 border-dashed border-secondary-300 rounded-lg p-4 min-h-[300px] bg-secondary-50/50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-secondary-700">Active Notifications</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setActiveToasts([])}
              disabled={activeToasts.length === 0}
            >
              Clear All
            </Button>
          </div>

          {activeToasts.length === 0 ? (
            <div className="text-center py-12 text-secondary-400">
              <p>Click any scenario button above to see toasts in action</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeToasts.map((toast) => (
                <Toast
                  key={toast.id}
                  type={toast.type}
                  message={toast.message}
                  duration={toast.duration}
                  onClose={() => removeToast(toast.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  },
}

export const AccessibilityExample: Story = {
  render: () => {
    const [accessibleToasts, setAccessibleToasts] = useState<
      Array<{
        id: number
        type: 'info' | 'success' | 'warning' | 'error'
        message: string
        duration: number
        ariaLive: 'polite' | 'assertive'
      }>
    >([])

    const showAccessibleToast = (
      type: 'info' | 'success' | 'warning' | 'error',
      message: string,
      ariaLive: 'polite' | 'assertive' = 'polite',
      duration = 5000
    ) => {
      const id = Date.now() + Math.random()
      setAccessibleToasts((prev) => [...prev, { id, type, message, duration, ariaLive }])
    }

    const removeAccessibleToast = (id: number) => {
      setAccessibleToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    return (
      <div className="space-y-6 w-full max-w-2xl">
        <div>
          <h3 className="font-semibold mb-3">Accessibility Features</h3>
          <p className="text-sm text-secondary-600 mb-4">
            Toasts include proper ARIA roles, live regions for screen reader announcements, and
            keyboard navigation support.
          </p>

          <div className="space-y-3 mb-6">
            <div>
              <h4 className="text-sm font-medium text-secondary-700 mb-2">ARIA Live Regions</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    showAccessibleToast(
                      'info',
                      'This is a polite announcement for screen readers.',
                      'polite'
                    )
                  }
                >
                  Polite Toast (aria-live="polite")
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    showAccessibleToast(
                      'error',
                      'This is an urgent announcement that interrupts screen readers.',
                      'assertive'
                    )
                  }
                >
                  Assertive Toast (aria-live="assertive")
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-secondary-700 mb-2">
                Screen Reader Examples
              </h4>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    showAccessibleToast(
                      'success',
                      'Form validation passed. All fields are correctly filled.',
                      'polite'
                    )
                  }
                >
                  Validation Success
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    showAccessibleToast(
                      'error',
                      'Critical error: Payment processing failed. Please contact support.',
                      'assertive'
                    )
                  }
                >
                  Critical Error
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    showAccessibleToast(
                      'warning',
                      'Session expires in 2 minutes. Please save your work.',
                      'assertive'
                    )
                  }
                >
                  Session Warning
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-primary-800 mb-2">Accessibility Features:</h4>
            <ul className="text-xs text-primary-700 space-y-1">
              <li>
                • <code>role="alert"</code> for immediate screen reader attention
              </li>
              <li>
                • <code>aria-live</code> regions for polite or assertive announcements
              </li>
              <li>• Keyboard accessible dismiss buttons with proper focus indicators</li>
              <li>• High contrast colors meeting WCAG 2.1 AA standards</li>
              <li>• Clear, descriptive text for screen reader users</li>
              <li>• Focus management for dismissible toasts</li>
            </ul>
          </div>
        </div>

        {/* Toast Display Area */}
        <div className="border border-secondary-300 rounded-lg p-4 min-h-[200px] bg-white">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-secondary-700">Accessible Toast Area</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAccessibleToasts([])}
              disabled={accessibleToasts.length === 0}
              aria-label={`Clear all notifications (${accessibleToasts.length} active)`}
            >
              Clear All
            </Button>
          </div>

          {accessibleToasts.length === 0 ? (
            <div className="text-center py-8 text-secondary-400">
              <p>No accessible toasts active</p>
            </div>
          ) : (
            <div className="space-y-3" role="log" aria-label="Notification log">
              {accessibleToasts.map((toast) => (
                <div key={toast.id} role="alert" aria-live={toast.ariaLive} className="relative">
                  <Toast
                    type={toast.type}
                    message={toast.message}
                    duration={toast.duration}
                    onClose={() => removeAccessibleToast(toast.id)}
                  />

                  {/* Screen reader only information */}
                  <div className="sr-only">
                    Toast notification: {toast.type} message. {toast.message}. Use Tab to navigate
                    to dismiss button if available.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-secondary-700 mb-2">Keyboard Testing</h4>
          <p className="text-xs text-secondary-500">
            Use Tab to navigate to toast dismiss buttons. Press Enter or Space to dismiss. Screen
            readers will announce toasts automatically based on their aria-live settings.
          </p>
        </div>
      </div>
    )
  },
}
