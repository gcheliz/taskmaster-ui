import type { ProfileSettingsData } from '../components/Settings/ProfileSettings'
import type { IntegrationsSettingsData } from '../components/Settings/IntegrationsSettings'
import type { NotificationSettingsData } from '../components/Settings/NotificationSettings'
import type { SecuritySettingsData } from '../components/Settings/SecuritySettings'
import type { AppearanceSettingsData } from '../components/Settings/AppearanceSettings'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface UserSettings {
  id: string
  userId: string
  // Profile settings
  firstName?: string
  lastName?: string
  bio?: string
  jobTitle?: string
  company?: string
  location?: string
  website?: string
  timezone?: string
  language?: string
  // Appearance settings
  theme?: string
  colorScheme?: string
  fontSize?: string
  density?: string
  animations?: boolean
  glassmorphism?: boolean
  // Notification settings
  emailNotifications?: boolean
  pushNotifications?: boolean
  slackNotifications?: boolean
  desktopNotifications?: boolean
  notificationSettings?: any
  // Integration settings
  integrationSettings?: any
  // Security settings
  twoFactorEnabled?: boolean
  loginNotifications?: boolean
  securitySettings?: any
  // Dashboard preferences
  dashboardLayout?: string
  cardsPerRow?: number
  showQuickActions?: boolean
  // Accessibility
  highContrast?: boolean
  reducedMotion?: boolean
  focusIndicators?: boolean
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any[]
  }
}

export type SettingsCategory =
  | 'profile'
  | 'appearance'
  | 'notifications'
  | 'integrations'
  | 'security'

class SettingsApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('Settings API error:', error)
      throw error
    }
  }

  /**
   * Get all user settings
   */
  async getSettings(): Promise<UserSettings> {
    const response = await this.makeRequest<UserSettings>('')
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch settings')
    }
    return response.data
  }

  /**
   * Update all user settings
   */
  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await this.makeRequest<UserSettings>('', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
    if (!response.success || !response.data) {
      throw new Error('Failed to update settings')
    }
    return response.data
  }

  /**
   * Update specific settings category
   */
  async updateCategory(category: SettingsCategory, data: any): Promise<UserSettings> {
    const response = await this.makeRequest<UserSettings>('/category', {
      method: 'PUT',
      body: JSON.stringify({ category, data }),
    })
    if (!response.success || !response.data) {
      throw new Error(`Failed to update ${category} settings`)
    }
    return response.data
  }

  /**
   * Get settings for specific category
   */
  async getCategorySettings(category: SettingsCategory): Promise<any> {
    const response = await this.makeRequest(`/${category}`)
    if (!response.success || !response.data) {
      throw new Error(`Failed to fetch ${category} settings`)
    }
    return response.data
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<UserSettings> {
    const response = await this.makeRequest<UserSettings>('/reset', {
      method: 'POST',
    })
    if (!response.success || !response.data) {
      throw new Error('Failed to reset settings')
    }
    return response.data
  }

  /**
   * Create initial settings
   */
  async createSettings(settings: Partial<UserSettings> = {}): Promise<UserSettings> {
    const response = await this.makeRequest<UserSettings>('', {
      method: 'POST',
      body: JSON.stringify(settings),
    })
    if (!response.success || !response.data) {
      throw new Error('Failed to create settings')
    }
    return response.data
  }

  /**
   * Delete user settings
   */
  async deleteSettings(): Promise<void> {
    const response = await this.makeRequest('', {
      method: 'DELETE',
    })
    if (!response.success) {
      throw new Error('Failed to delete settings')
    }
  }

  // Specific category update methods
  async updateProfileSettings(data: ProfileSettingsData): Promise<UserSettings> {
    return this.updateCategory('profile', {
      firstName: data.firstName,
      lastName: data.lastName,
      bio: data.bio,
      jobTitle: data.jobTitle,
      company: data.company,
      location: data.location,
      website: data.website,
      timezone: data.timezone,
      language: data.language,
    })
  }

  async updateAppearanceSettings(data: AppearanceSettingsData): Promise<UserSettings> {
    return this.updateCategory('appearance', {
      theme: data.theme,
      colorScheme: data.colorScheme,
      fontSize: data.fontSize,
      density: data.density,
      animations: data.animations,
      glassmorphism: data.glassmorphism,
      dashboardLayout: data.dashboard.layout,
      cardsPerRow: data.dashboard.cardsPerRow,
      showQuickActions: data.dashboard.showQuickActions,
      highContrast: data.accessibility.highContrast,
      reducedMotion: data.accessibility.reducedMotion,
      focusIndicators: data.accessibility.focusIndicators,
    })
  }

  async updateNotificationSettings(data: NotificationSettingsData): Promise<UserSettings> {
    return this.updateCategory('notifications', {
      emailNotifications: data.email.enabled,
      pushNotifications: data.push.enabled,
      slackNotifications: data.slack.enabled,
      desktopNotifications: data.desktop.enabled,
      notificationSettings: {
        email: data.email,
        push: data.push,
        slack: data.slack,
        desktop: data.desktop,
      },
    })
  }

  async updateIntegrationSettings(data: IntegrationsSettingsData): Promise<UserSettings> {
    return this.updateCategory('integrations', {
      integrationSettings: data,
    })
  }

  async updateSecuritySettings(data: SecuritySettingsData): Promise<UserSettings> {
    return this.updateCategory('security', {
      twoFactorEnabled: data.twoFactor.enabled,
      loginNotifications: data.loginNotifications.enabled,
      securitySettings: {
        twoFactor: data.twoFactor,
        sessions: data.sessions,
        loginNotifications: data.loginNotifications,
        apiKeys: data.apiKeys,
      },
    })
  }
}

export const settingsApi = new SettingsApiService()
export default settingsApi
