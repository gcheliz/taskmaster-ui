import React, { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'
import { Button } from '../ui/atoms/Button'
import { Toggle } from '../ui/atoms/Toggle'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/atoms/Card'
import { Badge } from '../ui/atoms/Badge'
import { FormField } from '../ui/molecules/FormField'
import { useSettings } from '../../contexts/SettingsContext'

export interface IntegrationsSettingsProps {
  /**
   * Callback when settings are saved
   */
  onSave?: (settings: IntegrationsSettingsData) => void
  /**
   * Additional CSS classes
   */
  className?: string
}

export interface IntegrationsSettingsData {
  github: {
    enabled: boolean
    connected: boolean
    username?: string
    repositories: string[]
  }
  slack: {
    enabled: boolean
    connected: boolean
    workspace?: string
    channels: string[]
  }
  jira: {
    enabled: boolean
    connected: boolean
    server?: string
    project?: string
  }
  gitlab: {
    enabled: boolean
    connected: boolean
    server?: string
    groups: string[]
  }
  discord: {
    enabled: boolean
    connected: boolean
    server?: string
    channels: string[]
  }
  webhooks: {
    enabled: boolean
    endpoints: Array<{
      id: string
      name: string
      url: string
      events: string[]
      active: boolean
    }>
  }
}

interface Integration {
  id: keyof IntegrationsSettingsData
  name: string
  description: string
  icon: React.ReactNode
  color: string
  category: 'development' | 'communication' | 'project-management' | 'custom'
}

const integrations: Integration[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect repositories and sync issues automatically',
    color: 'bg-gray-900',
    category: 'development',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Sync with GitLab repositories and merge requests',
    color: 'bg-orange-600',
    category: 'development',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.918 1.263c-.135-.423-.73-.423-.867 0L1.387 9.452.045 13.587c-.121.375.014.789.331 1.023L12 23.054l11.624-8.443c.318-.235.452-.648.331-1.024" />
      </svg>
    ),
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notifications and updates in your Slack workspace',
    color: 'bg-purple-600',
    category: 'communication',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.521-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.523 2.521h-2.521V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.521A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.523v-2.521h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </svg>
    ),
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Sync tasks and issues with Atlassian Jira',
    color: 'bg-blue-600',
    category: 'project-management',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.53 2c0 2.4 1.97 4.37 4.37 4.37h.83v.83c0 2.4 1.97 4.37 4.37 4.37V2H11.53zM6.77 6.77c0 2.4 1.97 4.37 4.37 4.37h.83v.83c0 2.4 1.97 4.37 4.37 4.37V6.77H6.77zM2 11.53c0 2.4 1.97 4.37 4.37 4.37h.83v.83c0 2.4 1.97 4.37 4.37 4.37V11.53H2z" />
      </svg>
    ),
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Send notifications to Discord channels',
    color: 'bg-indigo-600',
    category: 'communication',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z" />
      </svg>
    ),
  },
]

export const IntegrationsSettings: React.FC<IntegrationsSettingsProps> = ({
  onSave,
  className,
}) => {
  const { state, updateCategory, getSetting } = useSettings()
  const [settings, setSettings] = useState<IntegrationsSettingsData>({
    github: {
      enabled: false,
      connected: false,
      username: '',
      repositories: [],
    },
    slack: {
      enabled: false,
      connected: false,
      workspace: '',
      channels: [],
    },
    jira: {
      enabled: false,
      connected: false,
      server: '',
      project: '',
    },
    gitlab: {
      enabled: false,
      connected: false,
      server: '',
      groups: [],
    },
    discord: {
      enabled: false,
      connected: false,
      server: '',
      channels: [],
    },
    webhooks: {
      enabled: false,
      endpoints: [],
    },
  })

  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
  })

  const [showWebhookForm, setShowWebhookForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Load settings data when component mounts or settings change
  useEffect(() => {
    if (state.settings?.integrationSettings) {
      setSettings(state.settings.integrationSettings)
    }
  }, [state.settings])

  const handleToggleIntegration = async (
    integrationId: keyof IntegrationsSettingsData,
    enabled: boolean
  ) => {
    const updatedSettings = {
      ...settings,
      [integrationId]: {
        ...settings[integrationId],
        enabled,
      },
    }

    setSettings(updatedSettings)

    try {
      await updateCategory('integrations', updatedSettings)
    } catch (error) {
      console.error('Failed to update integration settings:', error)
      // Revert on error
      setSettings((prev) => ({
        ...prev,
        [integrationId]: {
          ...prev[integrationId],
          enabled: !enabled,
        },
      }))
    }
  }

  const handleConnect = (integrationId: string) => {
    // Simulate OAuth flow
    console.log(`Connecting to ${integrationId}...`)
    // In real app, this would trigger OAuth flow
  }

  const handleDisconnect = async (integrationId: keyof IntegrationsSettingsData) => {
    const updatedSettings = {
      ...settings,
      [integrationId]: {
        ...settings[integrationId],
        connected: false,
      },
    }

    setSettings(updatedSettings)

    try {
      await updateCategory('integrations', updatedSettings)
    } catch (error) {
      console.error('Failed to disconnect integration:', error)
      // Revert on error
      setSettings((prev) => ({
        ...prev,
        [integrationId]: {
          ...prev[integrationId],
          connected: true,
        },
      }))
    }
  }

  const handleAddWebhook = async () => {
    if (newWebhook.name && newWebhook.url) {
      const webhook = {
        id: Date.now().toString(),
        ...newWebhook,
        active: true,
      }

      const updatedSettings = {
        ...settings,
        webhooks: {
          ...settings.webhooks,
          endpoints: [...settings.webhooks.endpoints, webhook],
        },
      }

      setSettings(updatedSettings)

      try {
        await updateCategory('integrations', updatedSettings)
        setNewWebhook({ name: '', url: '', events: [] })
        setShowWebhookForm(false)
      } catch (error) {
        console.error('Failed to add webhook:', error)
        // Revert on error
        setSettings(settings)
      }
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateCategory('integrations', settings)
      onSave?.(settings)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save integration settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const categoryLabels = {
    development: 'Development',
    communication: 'Communication',
    'project-management': 'Project Management',
    custom: 'Custom',
  }

  const groupedIntegrations = integrations.reduce(
    (acc, integration) => {
      if (!acc[integration.category]) {
        acc[integration.category] = []
      }
      acc[integration.category].push(integration)
      return acc
    },
    {} as Record<string, Integration[]>
  )

  return (
    <div className={cn('space-y-6', className)}>
      {/* Integration Categories */}
      {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
        <Card key={category} className="bg-white/50 backdrop-blur-sm border border-white/30">
          <CardHeader>
            <CardTitle className="text-lg">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </CardTitle>
            <CardDescription>
              Connect and manage your {category.replace('-', ' ')} tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryIntegrations.map((integration) => {
              const integrationSettings = settings[integration.id]
              const isConnected =
                'connected' in integrationSettings ? integrationSettings.connected : false
              const isEnabled = integrationSettings?.enabled || false

              return (
                <div
                  key={integration.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border border-white/20',
                    'bg-white/30 backdrop-blur-sm transition-all duration-200',
                    'hover:bg-white/40 hover:shadow-sm'
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className={cn('p-2 rounded-lg text-white', integration.color)}>
                      {integration.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{integration.name}</h3>
                        {isConnected && (
                          <Badge variant="success" size="sm">
                            Connected
                          </Badge>
                        )}
                        {!isConnected && isEnabled && (
                          <Badge variant="warning" size="sm">
                            Not Connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{integration.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Toggle
                      checked={isEnabled}
                      onCheckedChange={(enabled) =>
                        handleToggleIntegration(integration.id, enabled)
                      }
                      size="sm"
                    />
                    {isEnabled && (
                      <>
                        {isConnected ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleConnect(integration.id)}>
                            Connect
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}

      {/* Webhooks Section */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Webhooks</CardTitle>
              <CardDescription>
                Configure custom webhook endpoints for real-time notifications
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Toggle
                checked={settings.webhooks.enabled}
                onCheckedChange={(enabled) =>
                  setSettings((prev) => ({
                    ...prev,
                    webhooks: { ...prev.webhooks, enabled },
                  }))
                }
                size="sm"
              />
              {settings.webhooks.enabled && (
                <Button size="sm" onClick={() => setShowWebhookForm(true)}>
                  Add Webhook
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {settings.webhooks.enabled && (
          <CardContent>
            {/* Existing Webhooks */}
            <div className="space-y-3 mb-6">
              {settings.webhooks.endpoints.map((webhook) => (
                <div
                  key={webhook.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/30 backdrop-blur-sm border border-white/20"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{webhook.name}</h4>
                      <Badge variant={webhook.active ? 'success' : 'secondary'} size="sm">
                        {webhook.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 font-mono">{webhook.url}</p>
                    <p className="text-xs text-gray-500">Events: {webhook.events.join(', ')}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Webhook Form */}
            {showWebhookForm && (
              <div className="p-4 rounded-lg bg-white/40 backdrop-blur-sm border border-white/30 space-y-4">
                <h4 className="font-medium text-gray-900">Add New Webhook</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Webhook Name"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Deploy Webhook"
                  />
                  <FormField
                    label="Endpoint URL"
                    type="url"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="https://api.example.com/webhook"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" size="sm" onClick={() => setShowWebhookForm(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAddWebhook}>
                    Add Webhook
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
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
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            'Save Integration Settings'
          )}
        </Button>
      </div>
    </div>
  )
}

export default IntegrationsSettings
