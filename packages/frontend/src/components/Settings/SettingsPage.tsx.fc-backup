import React, { useState } from 'react'
import { cn } from '../../utils/cn'
import { Card, CardContent } from '../ui/atoms/Card'
import { ProfileSettings } from './ProfileSettings'
import { IntegrationsSettings } from './IntegrationsSettings'
import { NotificationSettings } from './NotificationSettings'
import { SecuritySettings } from './SecuritySettings'
import { AppearanceSettings } from './AppearanceSettings'
import { SettingsProvider } from '../../contexts/SettingsContext'

export interface SettingsPageProps {
  /**
   * Default category to show
   * @default 'profile'
   */
  defaultCategory?: string
  /**
   * Callback when settings are saved
   */
  onSettingsSave?: (category: string, settings: any) => void
  /**
   * Additional CSS classes
   */
  className?: string
}

interface SettingsCategory {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  component: React.ComponentType<any>
}

const settingsCategories: SettingsCategory[] = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Manage your account information and preferences',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    component: ProfileSettings,
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Password, two-factor authentication, and login settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    component: SecuritySettings,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Control how and when you receive notifications',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-5 5v-5zM14.828 14.828a4 4 0 01-5.656 0M9 10a3 3 0 116 0v5a3 3 0 11-6 0v-5z"
        />
      </svg>
    ),
    component: NotificationSettings,
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect external services and manage API integrations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    ),
    component: IntegrationsSettings,
  },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Customize the interface theme and display preferences',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
        />
      </svg>
    ),
    component: AppearanceSettings,
  },
]

export const SettingsPage: React.FC<SettingsPageProps> = ({
  defaultCategory = 'profile',
  onSettingsSave,
  className,
}) => {
  const [activeCategory, setActiveCategory] = useState(defaultCategory)

  const currentCategory =
    settingsCategories.find((cat) => cat.id === activeCategory) || settingsCategories[0]
  const CurrentComponent = currentCategory.component

  const handleSettingsSave = (settings: any) => {
    onSettingsSave?.(activeCategory, settings)
  }

  return (
    <SettingsProvider>
      <div
        className={cn(
          'min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50',
          'relative',
          className
        )}
      >
        {/* Glassmorphism Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/3 to-pink-400/5" />

        <div className="relative container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <Card
                className={cn(
                  // Glassmorphism effects
                  'bg-white/80 backdrop-blur-xl',
                  'border border-white/20',
                  'shadow-lg shadow-black/5',
                  'sticky top-4'
                )}
              >
                <CardContent className="p-6">
                  <nav className="space-y-2">
                    {settingsCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={cn(
                          'w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200',
                          'hover:bg-white/50 hover:shadow-sm',
                          activeCategory === category.id
                            ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-200'
                            : 'text-gray-700 hover:text-gray-900'
                        )}
                      >
                        <span
                          className={cn(
                            'flex-shrink-0',
                            activeCategory === category.id ? 'text-primary-600' : 'text-gray-500'
                          )}
                        >
                          {category.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{category.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5 truncate">
                            {category.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <Card
                className={cn(
                  // Glassmorphism effects
                  'bg-white/80 backdrop-blur-xl',
                  'border border-white/20',
                  'shadow-lg shadow-black/5',
                  'min-h-[600px]'
                )}
              >
                <CardContent className="p-8">
                  {/* Category Header */}
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-primary-600">{currentCategory.icon}</span>
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {currentCategory.title}
                      </h2>
                    </div>
                    <p className="text-gray-600">{currentCategory.description}</p>
                  </div>

                  {/* Category Content */}
                  <CurrentComponent onSave={handleSettingsSave} className="space-y-6" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SettingsProvider>
  )
}

export default SettingsPage
