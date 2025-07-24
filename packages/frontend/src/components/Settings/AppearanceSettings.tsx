import React, { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'
import { Button } from '../ui/atoms/Button'
import { Toggle } from '../ui/atoms/Toggle'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/atoms/Card'
import { Badge } from '../ui/atoms/Badge'
import { useSettings } from '../../contexts/SettingsContext'

export interface AppearanceSettingsProps {
  /**
   * Callback when settings are saved
   */
  onSave?: (settings: AppearanceSettingsData) => void
  /**
   * Additional CSS classes
   */
  className?: string
}

export interface AppearanceSettingsData {
  theme: 'light' | 'dark' | 'system'
  colorScheme: string
  fontSize: 'sm' | 'md' | 'lg'
  density: 'compact' | 'comfortable' | 'spacious'
  animations: boolean
  glassmorphism: boolean
  sidebar: {
    position: 'left' | 'right'
    collapsed: boolean
    width: number
  }
  dashboard: {
    layout: 'grid' | 'list'
    cardsPerRow: number
    showQuickActions: boolean
  }
  accessibility: {
    highContrast: boolean
    reducedMotion: boolean
    focusIndicators: boolean
  }
}

interface ThemeOption {
  id: 'light' | 'dark' | 'system'
  name: string
  description: string
  preview: React.ReactNode
}

interface ColorScheme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
}

const themeOptions: ThemeOption[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright interface',
    preview: (
      <div className="w-full h-16 bg-white border border-gray-200 rounded-lg flex items-center px-3">
        <div className="w-3 h-3 bg-gray-300 rounded-full mr-2" />
        <div className="flex-1 space-y-1">
          <div className="w-3/4 h-2 bg-gray-300 rounded" />
          <div className="w-1/2 h-2 bg-gray-200 rounded" />
        </div>
      </div>
    ),
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes in low light',
    preview: (
      <div className="w-full h-16 bg-gray-900 border border-gray-700 rounded-lg flex items-center px-3">
        <div className="w-3 h-3 bg-gray-600 rounded-full mr-2" />
        <div className="flex-1 space-y-1">
          <div className="w-3/4 h-2 bg-gray-600 rounded" />
          <div className="w-1/2 h-2 bg-gray-700 rounded" />
        </div>
      </div>
    ),
  },
  {
    id: 'system',
    name: 'System',
    description: 'Matches your device settings',
    preview: (
      <div className="w-full h-16 bg-gradient-to-r from-white to-gray-900 border border-gray-300 rounded-lg flex items-center px-3">
        <div className="w-3 h-3 bg-gray-500 rounded-full mr-2" />
        <div className="flex-1 space-y-1">
          <div className="w-3/4 h-2 bg-gray-400 rounded" />
          <div className="w-1/2 h-2 bg-gray-500 rounded" />
        </div>
      </div>
    ),
  },
]

const colorSchemes: ColorScheme[] = [
  {
    id: 'blue',
    name: 'Ocean Blue',
    primary: '#3B82F6',
    secondary: '#64748B',
    accent: '#06B6D4',
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    primary: '#8B5CF6',
    secondary: '#64748B',
    accent: '#EC4899',
  },
  {
    id: 'green',
    name: 'Forest Green',
    primary: '#10B981',
    secondary: '#64748B',
    accent: '#F59E0B',
  },
  {
    id: 'orange',
    name: 'Sunset Orange',
    primary: '#F97316',
    secondary: '#64748B',
    accent: '#EF4444',
  },
  {
    id: 'teal',
    name: 'Ocean Teal',
    primary: '#14B8A6',
    secondary: '#64748B',
    accent: '#8B5CF6',
  },
  {
    id: 'pink',
    name: 'Cherry Blossom',
    primary: '#EC4899',
    secondary: '#64748B',
    accent: '#F97316',
  },
]

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ onSave, className }) => {
  const { state, updateCategory, getSetting } = useSettings()
  const [settings, setSettings] = useState<AppearanceSettingsData>({
    theme: 'light',
    colorScheme: 'blue',
    fontSize: 'md',
    density: 'comfortable',
    animations: true,
    glassmorphism: true,
    sidebar: {
      position: 'left',
      collapsed: false,
      width: 280,
    },
    dashboard: {
      layout: 'grid',
      cardsPerRow: 3,
      showQuickActions: true,
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      focusIndicators: true,
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Load settings data when component mounts or settings change
  useEffect(() => {
    if (state.settings) {
      const appearanceSettings: AppearanceSettingsData = {
        theme: (state.settings.theme as 'light' | 'dark' | 'system') || 'light',
        colorScheme: state.settings.colorScheme || 'blue',
        fontSize: (state.settings.fontSize as 'sm' | 'md' | 'lg') || 'md',
        density:
          (state.settings.density as 'compact' | 'comfortable' | 'spacious') || 'comfortable',
        animations: state.settings.animations ?? true,
        glassmorphism: state.settings.glassmorphism ?? true,
        sidebar: {
          position: 'left',
          collapsed: false,
          width: 280,
        },
        dashboard: {
          layout: (state.settings.dashboardLayout as 'grid' | 'list') || 'grid',
          cardsPerRow: state.settings.cardsPerRow || 3,
          showQuickActions: state.settings.showQuickActions ?? true,
        },
        accessibility: {
          highContrast: state.settings.highContrast ?? false,
          reducedMotion: state.settings.reducedMotion ?? false,
          focusIndicators: state.settings.focusIndicators ?? true,
        },
      }
      setSettings(appearanceSettings)
    }
  }, [state.settings])

  const handleSettingChange = async (path: string, value: any) => {
    const keys = path.split('.')
    const updatedSettings = { ...settings }
    let current: any = updatedSettings

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] }
      current = current[keys[i]]
    }

    current[keys[keys.length - 1]] = value
    setSettings(updatedSettings)

    try {
      await updateCategory('appearance', updatedSettings)
    } catch (error) {
      console.error('Failed to update appearance setting:', error)
      // Revert on error
      setSettings(settings)
    }
  }

  const resetToDefaults = async () => {
    const defaultSettings: AppearanceSettingsData = {
      theme: 'light',
      colorScheme: 'blue',
      fontSize: 'md',
      density: 'comfortable',
      animations: true,
      glassmorphism: true,
      sidebar: {
        position: 'left',
        collapsed: false,
        width: 280,
      },
      dashboard: {
        layout: 'grid',
        cardsPerRow: 3,
        showQuickActions: true,
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        focusIndicators: true,
      },
    }

    setSettings(defaultSettings)

    try {
      await updateCategory('appearance', defaultSettings)
    } catch (error) {
      console.error('Failed to reset appearance settings:', error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateCategory('appearance', settings)
      onSave?.(settings)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save appearance settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Theme Selection */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <CardTitle className="text-lg">Theme</CardTitle>
          <CardDescription>Choose how TaskMaster looks to you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleSettingChange('theme', theme.id)}
                className={cn(
                  'relative p-4 rounded-lg border-2 transition-all duration-200',
                  'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500',
                  settings.theme === theme.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                {settings.theme === theme.id && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="success" size="sm">
                      Selected
                    </Badge>
                  </div>
                )}
                <div className="mb-3">{theme.preview}</div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">{theme.name}</h3>
                  <p className="text-sm text-gray-600">{theme.description}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Scheme */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <CardTitle className="text-lg">Color Scheme</CardTitle>
          <CardDescription>Customize the accent colors throughout the interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {colorSchemes.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => handleSettingChange('colorScheme', scheme.id)}
                className={cn(
                  'relative p-3 rounded-lg border-2 transition-all duration-200',
                  'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
                  settings.colorScheme === scheme.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: scheme.primary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: scheme.accent }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: scheme.secondary }}
                  />
                </div>
                <h3 className="text-sm font-medium text-gray-900 text-left">{scheme.name}</h3>
                {settings.colorScheme === scheme.id && (
                  <div className="absolute top-1 right-1">
                    <svg
                      className="w-4 h-4 text-primary-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <CardTitle className="text-lg">Display</CardTitle>
          <CardDescription>Adjust the interface density and typography</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Font Size</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'sm', label: 'Small', example: 'text-sm' },
                { id: 'md', label: 'Medium', example: 'text-base' },
                { id: 'lg', label: 'Large', example: 'text-lg' },
              ].map((size) => (
                <button
                  key={size.id}
                  onClick={() => handleSettingChange('fontSize', size.id)}
                  className={cn(
                    'p-3 rounded-lg border text-center transition-all duration-200',
                    settings.fontSize === size.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <div className={cn('font-medium', size.example)}>{size.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Interface Density
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: 'compact',
                  label: 'Compact',
                  description: 'More content',
                },
                {
                  id: 'comfortable',
                  label: 'Comfortable',
                  description: 'Balanced',
                },
                {
                  id: 'spacious',
                  label: 'Spacious',
                  description: 'More space',
                },
              ].map((density) => (
                <button
                  key={density.id}
                  onClick={() => handleSettingChange('density', density.id)}
                  className={cn(
                    'p-3 rounded-lg border text-center transition-all duration-200',
                    settings.density === density.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <div className="font-medium">{density.label}</div>
                  <div className="text-xs text-gray-600">{density.description}</div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interface Settings */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <CardTitle className="text-lg">Interface</CardTitle>
          <CardDescription>Customize the behavior and visual effects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Animations</div>
              <div className="text-sm text-gray-600">Enable smooth transitions and animations</div>
            </div>
            <Toggle
              checked={settings.animations}
              onCheckedChange={(checked) => handleSettingChange('animations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Glassmorphism Effects</div>
              <div className="text-sm text-gray-600">Semi-transparent backgrounds with blur</div>
            </div>
            <Toggle
              checked={settings.glassmorphism}
              onCheckedChange={(checked) => handleSettingChange('glassmorphism', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Quick Actions</div>
              <div className="text-sm text-gray-600">Show quick action buttons on dashboard</div>
            </div>
            <Toggle
              checked={settings.dashboard.showQuickActions}
              onCheckedChange={(checked) =>
                handleSettingChange('dashboard.showQuickActions', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <CardTitle className="text-lg">Accessibility</CardTitle>
          <CardDescription>Settings to improve usability and accessibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">High Contrast</div>
              <div className="text-sm text-gray-600">Increase contrast for better visibility</div>
            </div>
            <Toggle
              checked={settings.accessibility.highContrast}
              onCheckedChange={(checked) =>
                handleSettingChange('accessibility.highContrast', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Reduced Motion</div>
              <div className="text-sm text-gray-600">
                Minimize animations for motion sensitivity
              </div>
            </div>
            <Toggle
              checked={settings.accessibility.reducedMotion}
              onCheckedChange={(checked) =>
                handleSettingChange('accessibility.reducedMotion', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Focus Indicators</div>
              <div className="text-sm text-gray-600">Enhanced keyboard navigation indicators</div>
            </div>
            <Toggle
              checked={settings.accessibility.focusIndicators}
              onCheckedChange={(checked) =>
                handleSettingChange('accessibility.focusIndicators', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save and Reset */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
        <div className="flex space-x-3">
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
              'Save Appearance Settings'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AppearanceSettings
