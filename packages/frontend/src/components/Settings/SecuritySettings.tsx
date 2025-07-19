import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/atoms/Button';
import { Toggle } from '../ui/atoms/Toggle';
import { FormField } from '../ui/molecules/FormField';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../ui/molecules/Card';
import { Badge } from '../ui/atoms/Badge';
import { useSettings } from '../../contexts/SettingsContext';

export interface SecuritySettingsProps {
  /**
   * Callback when settings are saved
   */
  onSave?: (settings: SecuritySettingsData) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface SecuritySettingsData {
  password: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  twoFactor: {
    enabled: boolean;
    method: 'app' | 'sms' | 'email';
    backupCodes: string[];
  };
  sessions: {
    currentSession: string;
    activeSessions: Array<{
      id: string;
      device: string;
      location: string;
      lastActive: string;
      current: boolean;
    }>;
  };
  loginNotifications: {
    enabled: boolean;
    newDevice: boolean;
    suspiciousActivity: boolean;
  };
  apiKeys: Array<{
    id: string;
    name: string;
    lastUsed: string;
    permissions: string[];
    active: boolean;
  }>;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  onSave,
  className,
}) => {
  const { state, updateCategory, getSetting } = useSettings();
  const [settings, setSettings] = useState<SecuritySettingsData>({
    password: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    twoFactor: {
      enabled: false,
      method: 'app',
      backupCodes: [],
    },
    sessions: {
      currentSession: '',
      activeSessions: [],
    },
    loginNotifications: {
      enabled: false,
      newDevice: false,
      suspiciousActivity: false,
    },
    apiKeys: [],
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load settings data when component mounts or settings change
  useEffect(() => {
    if (state.settings?.securitySettings) {
      setSettings(state.settings.securitySettings);
    } else if (state.settings) {
      // Map from flat structure to security settings structure
      const securitySettings: SecuritySettingsData = {
        password: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        },
        twoFactor: {
          enabled: state.settings.twoFactorEnabled || false,
          method: 'app',
          backupCodes: [],
        },
        sessions: {
          currentSession: '',
          activeSessions: [],
        },
        loginNotifications: {
          enabled: state.settings.loginNotifications || false,
          newDevice: true,
          suspiciousActivity: true,
        },
        apiKeys: [],
      };
      setSettings(securitySettings);
    }
  }, [state.settings]);

  const handlePasswordChange = (
    field: keyof typeof settings.password,
    value: string
  ) => {
    setSettings(prev => ({
      ...prev,
      password: {
        ...prev.password,
        [field]: value,
      },
    }));
  };

  const handleChangePassword = () => {
    // Validate password
    if (settings.password.newPassword !== settings.password.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    console.log('Changing password...');
    setShowPasswordForm(false);
    setSettings(prev => ({
      ...prev,
      password: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
    }));
  };

  const handleToggle2FA = async () => {
    const updatedSettings = {
      ...settings,
      twoFactor: {
        ...settings.twoFactor,
        enabled: !settings.twoFactor.enabled,
        backupCodes: !settings.twoFactor.enabled
          ? ['123456', '789012', '345678']
          : [],
      },
    };

    setSettings(updatedSettings);

    try {
      await updateCategory('security', updatedSettings);
    } catch (error) {
      console.error('Failed to toggle 2FA:', error);
      // Revert on error
      setSettings(settings);
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    setSettings(prev => ({
      ...prev,
      sessions: {
        ...prev.sessions,
        activeSessions: prev.sessions.activeSessions.filter(
          s => s.id !== sessionId
        ),
      },
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const generateApiKey = () => {
    if (!newApiKey.name) return;

    const apiKey = {
      id: `key_${Date.now()}`,
      name: newApiKey.name,
      lastUsed: 'Never',
      permissions: newApiKey.permissions,
      active: true,
    };

    setSettings(prev => ({
      ...prev,
      apiKeys: [...prev.apiKeys, apiKey],
    }));

    setNewApiKey({ name: '', permissions: [] });
    setShowApiKeyForm(false);

    // In real app, show the generated API key once
    alert(
      `API Key generated: sk_test_${Math.random().toString(36).substring(7)}`
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Password Settings */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <CardTitle className="text-lg">Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Last changed: January 1, 2024
                </p>
                <p className="text-xs text-gray-500">
                  Use a strong password with at least 8 characters
                </p>
              </div>
              <Button onClick={() => setShowPasswordForm(true)}>
                Change Password
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <FormField
                label="Current Password"
                type="password"
                value={settings.password.currentPassword}
                onChange={e =>
                  handlePasswordChange('currentPassword', e.target.value)
                }
                required
              />
              <FormField
                label="New Password"
                type="password"
                value={settings.password.newPassword}
                onChange={e =>
                  handlePasswordChange('newPassword', e.target.value)
                }
                required
              />
              <FormField
                label="Confirm New Password"
                type="password"
                value={settings.password.confirmPassword}
                onChange={e =>
                  handlePasswordChange('confirmPassword', e.target.value)
                }
                required
              />
              <div className="flex space-x-3 pt-4">
                <Button onClick={handleChangePassword}>Update Password</Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </div>
            <Toggle
              checked={settings.twoFactor.enabled}
              onCheckedChange={handleToggle2FA}
              size="md"
            />
          </div>
        </CardHeader>
        {settings.twoFactor.enabled && (
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="success">Enabled</Badge>
                <span className="text-sm text-gray-600">
                  Using{' '}
                  {settings.twoFactor.method === 'app'
                    ? 'Authenticator App'
                    : settings.twoFactor.method === 'sms'
                      ? 'SMS'
                      : 'Email'}
                </span>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Recovery Codes
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Save these codes in a secure place. You can use them to access
                  your account if you lose your device.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-mono text-sm">
                  {settings.twoFactor.backupCodes.map((code, index) => (
                    <div key={index} className="bg-gray-100 px-3 py-2 rounded">
                      {code}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  Generate New Codes
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Active Sessions */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <CardTitle className="text-lg">Active Sessions</CardTitle>
          <CardDescription>
            Manage devices that are signed into your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {settings.sessions.activeSessions.map(session => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/30 backdrop-blur-sm border border-white/20"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">
                      {session.device}
                    </h4>
                    {session.current && (
                      <Badge variant="success" size="sm">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{session.location}</p>
                  <p className="text-xs text-gray-500">
                    Last active: {formatDate(session.lastActive)}
                  </p>
                </div>
                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-200 mt-4">
            <Button variant="outline" className="w-full">
              Sign out of all other sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Login Notifications */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <CardTitle className="text-lg">Login Notifications</CardTitle>
          <CardDescription>
            Get notified about account security events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">
                Login Notifications
              </div>
              <div className="text-sm text-gray-600">
                Enable all login notifications
              </div>
            </div>
            <Toggle
              checked={settings.loginNotifications.enabled}
              onCheckedChange={async enabled => {
                const updatedSettings = {
                  ...settings,
                  loginNotifications: {
                    ...settings.loginNotifications,
                    enabled,
                  },
                };
                setSettings(updatedSettings);
                try {
                  await updateCategory('security', updatedSettings);
                } catch (error) {
                  console.error('Failed to update login notifications:', error);
                  setSettings(settings);
                }
              }}
            />
          </div>

          {settings.loginNotifications.enabled && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">New Device</div>
                  <div className="text-sm text-gray-600">
                    When you sign in from a new device
                  </div>
                </div>
                <Toggle
                  checked={settings.loginNotifications.newDevice}
                  onCheckedChange={async checked => {
                    const updatedSettings = {
                      ...settings,
                      loginNotifications: {
                        ...settings.loginNotifications,
                        newDevice: checked,
                      },
                    };
                    setSettings(updatedSettings);
                    try {
                      await updateCategory('security', updatedSettings);
                    } catch (error) {
                      console.error(
                        'Failed to update new device notifications:',
                        error
                      );
                      setSettings(settings);
                    }
                  }}
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    Suspicious Activity
                  </div>
                  <div className="text-sm text-gray-600">
                    When we detect unusual login patterns
                  </div>
                </div>
                <Toggle
                  checked={settings.loginNotifications.suspiciousActivity}
                  onCheckedChange={async checked => {
                    const updatedSettings = {
                      ...settings,
                      loginNotifications: {
                        ...settings.loginNotifications,
                        suspiciousActivity: checked,
                      },
                    };
                    setSettings(updatedSettings);
                    try {
                      await updateCategory('security', updatedSettings);
                    } catch (error) {
                      console.error(
                        'Failed to update suspicious activity notifications:',
                        error
                      );
                      setSettings(settings);
                    }
                  }}
                  size="sm"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">API Keys</CardTitle>
              <CardDescription>
                Manage API keys for integrations and automation
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowApiKeyForm(true)}>
              Create API Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {settings.apiKeys.map(apiKey => (
              <div
                key={apiKey.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/30 backdrop-blur-sm border border-white/20"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                    <Badge
                      variant={apiKey.active ? 'success' : 'secondary'}
                      size="sm"
                    >
                      {apiKey.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Permissions: {apiKey.permissions.join(', ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last used: {apiKey.lastUsed}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {showApiKeyForm && (
            <div className="mt-4 p-4 rounded-lg bg-white/40 backdrop-blur-sm border border-white/30">
              <h4 className="font-medium text-gray-900 mb-4">
                Create New API Key
              </h4>
              <div className="space-y-4">
                <FormField
                  label="Key Name"
                  value={newApiKey.name}
                  onChange={e =>
                    setNewApiKey(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. CI/CD Pipeline"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'read:tasks',
                      'write:tasks',
                      'read:projects',
                      'write:projects',
                    ].map(permission => (
                      <label
                        key={permission}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={newApiKey.permissions.includes(permission)}
                          onChange={e => {
                            if (e.target.checked) {
                              setNewApiKey(prev => ({
                                ...prev,
                                permissions: [...prev.permissions, permission],
                              }));
                            } else {
                              setNewApiKey(prev => ({
                                ...prev,
                                permissions: prev.permissions.filter(
                                  p => p !== permission
                                ),
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button onClick={generateApiKey}>Generate Key</Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowApiKeyForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button variant="outline">Cancel</Button>
        <Button
          onClick={async () => {
            setIsLoading(true);
            try {
              await updateCategory('security', settings);
              onSave?.(settings);
              setIsSaved(true);
              setTimeout(() => setIsSaved(false), 3000);
            } catch (error) {
              console.error('Failed to save security settings:', error);
            } finally {
              setIsLoading(false);
            }
          }}
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
            'Save Security Settings'
          )}
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettings;
