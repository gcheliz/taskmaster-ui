import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Toggle } from '../ui/atoms/Toggle';
import { Button } from '../ui/atoms/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../ui/molecules/Card';
import { useSettings } from '../../contexts/SettingsContext';

export interface NotificationSettingsProps {
  /**
   * Callback when settings are saved
   */
  onSave?: (settings: NotificationSettingsData) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface NotificationSettingsData {
  email: {
    enabled: boolean;
    taskUpdates: boolean;
    projectUpdates: boolean;
    mentions: boolean;
    deadlines: boolean;
    digest: boolean;
    digestFrequency: 'daily' | 'weekly' | 'monthly';
  };
  push: {
    enabled: boolean;
    taskUpdates: boolean;
    mentions: boolean;
    deadlines: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  slack: {
    enabled: boolean;
    taskUpdates: boolean;
    mentions: boolean;
    deadlines: boolean;
    channel: string;
  };
  desktop: {
    enabled: boolean;
    taskUpdates: boolean;
    mentions: boolean;
    deadlines: boolean;
  };
}

interface NotificationCategory {
  id: keyof NotificationSettingsData;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const notificationCategories: NotificationCategory[] = [
  {
    id: 'email',
    title: 'Email Notifications',
    description: 'Receive updates and notifications via email',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: 'push',
    title: 'Push Notifications',
    description: 'Get instant notifications on your device',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: 'slack',
    title: 'Slack Notifications',
    description: 'Send notifications to your Slack workspace',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" />
      </svg>
    ),
  },
  {
    id: 'desktop',
    title: 'Desktop Notifications',
    description: 'Native desktop notifications',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onSave,
  className,
}) => {
  const { state, updateCategory, getSetting } = useSettings();
  const [settings, setSettings] = useState<NotificationSettingsData>({
    email: {
      enabled: false,
      taskUpdates: false,
      projectUpdates: false,
      mentions: false,
      deadlines: false,
      digest: false,
      digestFrequency: 'weekly',
    },
    push: {
      enabled: false,
      taskUpdates: false,
      mentions: false,
      deadlines: false,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    },
    slack: {
      enabled: false,
      taskUpdates: false,
      mentions: false,
      deadlines: false,
      channel: '#general',
    },
    desktop: {
      enabled: false,
      taskUpdates: false,
      mentions: false,
      deadlines: false,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load settings data when component mounts or settings change
  useEffect(() => {
    if (state.settings?.notificationSettings) {
      setSettings(state.settings.notificationSettings);
    } else if (state.settings) {
      // Map from flat structure to notification settings structure
      const notificationSettings: NotificationSettingsData = {
        email: {
          enabled: state.settings.emailNotifications || false,
          taskUpdates: true,
          projectUpdates: true,
          mentions: true,
          deadlines: true,
          digest: true,
          digestFrequency: 'weekly',
        },
        push: {
          enabled: state.settings.pushNotifications || false,
          taskUpdates: false,
          mentions: true,
          deadlines: true,
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00',
          },
        },
        slack: {
          enabled: state.settings.slackNotifications || false,
          taskUpdates: false,
          mentions: true,
          deadlines: true,
          channel: '#general',
        },
        desktop: {
          enabled: state.settings.desktopNotifications || false,
          taskUpdates: false,
          mentions: true,
          deadlines: true,
        },
      };
      setSettings(notificationSettings);
    }
  }, [state.settings]);

  const handleToggleCategory = async (
    categoryId: keyof NotificationSettingsData,
    enabled: boolean
  ) => {
    const updatedSettings = {
      ...settings,
      [categoryId]: {
        ...settings[categoryId],
        enabled,
      },
    };

    setSettings(updatedSettings);

    try {
      await updateCategory('notifications', updatedSettings);
    } catch (error) {
      console.error('Failed to update notification category:', error);
      // Revert on error
      setSettings(prev => ({
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          enabled: !enabled,
        },
      }));
    }
  };

  const handleToggleSetting = async (
    categoryId: keyof NotificationSettingsData,
    settingKey: string,
    value: boolean | string | object
  ) => {
    const updatedSettings = {
      ...settings,
      [categoryId]: {
        ...settings[categoryId],
        [settingKey]: value,
      },
    };

    setSettings(updatedSettings);

    try {
      await updateCategory('notifications', updatedSettings);
    } catch (error) {
      console.error('Failed to update notification setting:', error);
      // Revert on error
      setSettings(settings);
    }
  };

  const handleQuietHoursChange = async (
    field: 'start' | 'end',
    value: string
  ) => {
    const updatedSettings = {
      ...settings,
      push: {
        ...settings.push,
        quietHours: {
          ...settings.push.quietHours,
          [field]: value,
        },
      },
    };

    setSettings(updatedSettings);

    try {
      await updateCategory('notifications', updatedSettings);
    } catch (error) {
      console.error('Failed to update quiet hours:', error);
      // Revert on error
      setSettings(settings);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateCategory('notifications', settings);
      onSave?.(settings);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderNotificationOptions = (
    categoryId: keyof NotificationSettingsData
  ) => {
    const categorySettings = settings[categoryId];

    if (!categorySettings.enabled) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>
            Enable{' '}
            {notificationCategories.find(c => c.id === categoryId)?.title} to
            configure options
          </p>
        </div>
      );
    }

    const commonOptions = [
      {
        key: 'taskUpdates',
        label: 'Task Updates',
        description: 'When tasks are created, updated, or completed',
      },
      {
        key: 'mentions',
        label: 'Mentions',
        description: 'When you are mentioned in comments or descriptions',
      },
      {
        key: 'deadlines',
        label: 'Deadlines',
        description: 'Reminders for upcoming task deadlines',
      },
    ];

    return (
      <div className="space-y-4">
        {commonOptions.map(option => (
          <div
            key={option.key}
            className="flex items-center justify-between py-2"
          >
            <div className="flex-1">
              <div className="font-medium text-gray-900">{option.label}</div>
              <div className="text-sm text-gray-600">{option.description}</div>
            </div>
            <Toggle
              checked={
                categorySettings[
                  option.key as keyof typeof categorySettings
                ] as boolean
              }
              onCheckedChange={checked =>
                handleToggleSetting(categoryId, option.key, checked)
              }
              size="sm"
            />
          </div>
        ))}

        {/* Category-specific options */}
        {categoryId === 'email' && (
          <>
            <div className="flex items-center justify-between py-2">
              <div className="flex-1">
                <div className="font-medium text-gray-900">Project Updates</div>
                <div className="text-sm text-gray-600">
                  When projects are created or modified
                </div>
              </div>
              <Toggle
                checked={settings.email.projectUpdates}
                onCheckedChange={checked =>
                  handleToggleSetting('email', 'projectUpdates', checked)
                }
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex-1">
                <div className="font-medium text-gray-900">Email Digest</div>
                <div className="text-sm text-gray-600">
                  Periodic summary of activity
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={settings.email.digestFrequency}
                  onChange={e =>
                    handleToggleSetting(
                      'email',
                      'digestFrequency',
                      e.target.value
                    )
                  }
                  className="text-sm px-2 py-1 border border-gray-300 rounded bg-white/50 backdrop-blur-sm"
                  disabled={!settings.email.digest}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <Toggle
                  checked={settings.email.digest}
                  onCheckedChange={checked =>
                    handleToggleSetting('email', 'digest', checked)
                  }
                  size="sm"
                />
              </div>
            </div>
          </>
        )}

        {categoryId === 'push' && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between py-2 mb-4">
              <div className="flex-1">
                <div className="font-medium text-gray-900">Quiet Hours</div>
                <div className="text-sm text-gray-600">
                  Don't send notifications during these hours
                </div>
              </div>
              <Toggle
                checked={settings.push.quietHours.enabled}
                onCheckedChange={checked =>
                  handleToggleSetting('push', 'quietHours', {
                    ...settings.push.quietHours,
                    enabled: checked,
                  })
                }
                size="sm"
              />
            </div>

            {settings.push.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From
                  </label>
                  <input
                    type="time"
                    value={settings.push.quietHours.start}
                    onChange={e =>
                      handleQuietHoursChange('start', e.target.value)
                    }
                    className="w-full px-3 py-1 border border-gray-300 rounded bg-white/50 backdrop-blur-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To
                  </label>
                  <input
                    type="time"
                    value={settings.push.quietHours.end}
                    onChange={e =>
                      handleQuietHoursChange('end', e.target.value)
                    }
                    className="w-full px-3 py-1 border border-gray-300 rounded bg-white/50 backdrop-blur-sm text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {categoryId === 'slack' && (
          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <div className="font-medium text-gray-900">Channel</div>
              <div className="text-sm text-gray-600">
                Slack channel for notifications
              </div>
            </div>
            <input
              type="text"
              value={settings.slack.channel}
              onChange={e =>
                handleToggleSetting('slack', 'channel', e.target.value)
              }
              placeholder="#general"
              className="w-32 px-2 py-1 border border-gray-300 rounded bg-white/50 backdrop-blur-sm text-sm"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Notification Categories */}
      {notificationCategories.map(category => (
        <Card
          key={category.id}
          className="bg-white/50 backdrop-blur-sm border border-white/30"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-primary-600">{category.icon}</span>
                <div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </div>
              <Toggle
                checked={settings[category.id].enabled}
                onCheckedChange={enabled =>
                  handleToggleCategory(category.id, enabled)
                }
                size="md"
              />
            </div>
          </CardHeader>

          <CardContent>{renderNotificationOptions(category.id)}</CardContent>
        </Card>
      ))}

      {/* Test Notifications */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <CardTitle className="text-lg">Test Notifications</CardTitle>
          <CardDescription>
            Send test notifications to verify your settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {notificationCategories.map(category => (
              <Button
                key={category.id}
                variant="outline"
                size="sm"
                disabled={!settings[category.id].enabled}
                className="flex items-center space-x-2"
              >
                <span className="w-4 h-4">{category.icon}</span>
                <span>Test {category.title.split(' ')[0]}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button variant="outline">Cancel</Button>
        <Button
          onClick={handleSave}
          loading={isLoading}
          className={cn(
            'transition-all duration-200',
            isSaved && 'bg-green-600 hover:bg-green-700'
          )}
        >
          {isSaved ? (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Saved
            </>
          ) : (
            'Save Notification Settings'
          )}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
