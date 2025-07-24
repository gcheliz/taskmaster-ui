import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/winston-adapter';

const prisma = new PrismaClient();

export interface CreateUserSettingsData {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  location?: string | null;
  website?: string | null;
  timezone?: string | null;
  language?: string | null;
  theme?: string | null;
  colorScheme?: string | null;
  fontSize?: string | null;
  density?: string | null;
  animations?: boolean | null;
  glassmorphism?: boolean | null;
  emailNotifications?: boolean | null;
  pushNotifications?: boolean | null;
  slackNotifications?: boolean | null;
  desktopNotifications?: boolean | null;
  notificationSettings?: Record<string, unknown>;
  integrationSettings?: Record<string, unknown>;
  twoFactorEnabled?: boolean | null;
  loginNotifications?: boolean | null;
  securitySettings?: Record<string, unknown>;
  dashboardLayout?: string | null;
  cardsPerRow?: number | null;
  showQuickActions?: boolean | null;
  highContrast?: boolean | null;
  reducedMotion?: boolean | null;
  focusIndicators?: boolean | null;
}

export interface UpdateUserSettingsData
  extends Partial<CreateUserSettingsData> {
  // All fields are optional for updates
}

export interface UserSettingsResponse {
  id: string;
  userId: string;
  // Profile settings
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  location?: string | null;
  website?: string | null;
  timezone?: string | null;
  language?: string | null;
  // Appearance settings
  theme?: string | null;
  colorScheme?: string | null;
  fontSize?: string | null;
  density?: string | null;
  animations?: boolean | null;
  glassmorphism?: boolean | null;
  // Notification settings
  emailNotifications?: boolean | null;
  pushNotifications?: boolean | null;
  slackNotifications?: boolean | null;
  desktopNotifications?: boolean | null;
  notificationSettings?: Record<string, unknown>;
  // Integration settings
  integrationSettings?: Record<string, unknown>;
  // Security settings
  twoFactorEnabled?: boolean | null;
  loginNotifications?: boolean | null;
  securitySettings?: Record<string, unknown>;
  // Dashboard preferences
  dashboardLayout?: string | null;
  cardsPerRow?: number | null;
  showQuickActions?: boolean | null;
  // Accessibility
  highContrast?: boolean | null;
  reducedMotion?: boolean | null;
  focusIndicators?: boolean | null;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export class SettingsService {
  /**
   * Get user settings by user ID
   */
  static async getUserSettings(
    userId: string
  ): Promise<UserSettingsResponse | null> {
    try {
      const settings = await prisma.userSettings.findUnique({
        where: { userId },
      });

      return settings as UserSettingsResponse | null;
    } catch (error) {
      logger.error('Error getting user settings:', error);
      throw new Error('Failed to retrieve user settings');
    }
  }

  /**
   * Get or create user settings (ensures user always has settings)
   */
  static async getOrCreateUserSettings(
    userId: string
  ): Promise<UserSettingsResponse> {
    try {
      let settings = await prisma.userSettings.findUnique({
        where: { userId },
      });

      if (!settings) {
        settings = await this.createUserSettings({ userId });
      }

      return settings as UserSettingsResponse;
    } catch (error) {
      logger.error('Error getting or creating user settings:', error);
      throw new Error('Failed to retrieve or create user settings');
    }
  }

  /**
   * Create new user settings
   */
  static async createUserSettings(
    data: CreateUserSettingsData
  ): Promise<UserSettingsResponse> {
    try {
      const settings = await prisma.userSettings.create({
        data: {
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio,
          jobTitle: data.jobTitle,
          company: data.company,
          location: data.location,
          website: data.website,
          timezone: data.timezone,
          language: data.language,
          theme: data.theme,
          colorScheme: data.colorScheme,
          fontSize: data.fontSize,
          density: data.density,
          animations: data.animations,
          glassmorphism: data.glassmorphism,
          emailNotifications: data.emailNotifications,
          pushNotifications: data.pushNotifications,
          slackNotifications: data.slackNotifications,
          desktopNotifications: data.desktopNotifications,
          notificationSettings: data.notificationSettings,
          integrationSettings: data.integrationSettings,
          twoFactorEnabled: data.twoFactorEnabled,
          loginNotifications: data.loginNotifications,
          securitySettings: data.securitySettings,
          dashboardLayout: data.dashboardLayout,
          cardsPerRow: data.cardsPerRow,
          showQuickActions: data.showQuickActions,
          highContrast: data.highContrast,
          reducedMotion: data.reducedMotion,
          focusIndicators: data.focusIndicators,
        },
      });

      return settings as UserSettingsResponse;
    } catch (error) {
      logger.error('Error creating user settings:', error);
      throw new Error('Failed to create user settings');
    }
  }

  /**
   * Update user settings
   */
  static async updateUserSettings(
    userId: string,
    data: UpdateUserSettingsData
  ): Promise<UserSettingsResponse> {
    try {
      // Ensure user settings exist before updating
      await this.getOrCreateUserSettings(userId);

      const settings = await prisma.userSettings.update({
        where: { userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio,
          jobTitle: data.jobTitle,
          company: data.company,
          location: data.location,
          website: data.website,
          timezone: data.timezone,
          language: data.language,
          theme: data.theme,
          colorScheme: data.colorScheme,
          fontSize: data.fontSize,
          density: data.density,
          animations: data.animations,
          glassmorphism: data.glassmorphism,
          emailNotifications: data.emailNotifications,
          pushNotifications: data.pushNotifications,
          slackNotifications: data.slackNotifications,
          desktopNotifications: data.desktopNotifications,
          notificationSettings: data.notificationSettings,
          integrationSettings: data.integrationSettings,
          twoFactorEnabled: data.twoFactorEnabled,
          loginNotifications: data.loginNotifications,
          securitySettings: data.securitySettings,
          dashboardLayout: data.dashboardLayout,
          cardsPerRow: data.cardsPerRow,
          showQuickActions: data.showQuickActions,
          highContrast: data.highContrast,
          reducedMotion: data.reducedMotion,
          focusIndicators: data.focusIndicators,
        },
      });

      return settings as UserSettingsResponse;
    } catch (error) {
      logger.error('Error updating user settings:', error);
      throw new Error('Failed to update user settings');
    }
  }

  /**
   * Update specific settings category
   */
  static async updateSettingsCategory(
    userId: string,
    category: string,
    categoryData: Record<string, unknown>
  ): Promise<UserSettingsResponse> {
    try {
      let updateData: UpdateUserSettingsData = {};

      switch (category) {
        case 'profile':
          updateData = {
            firstName: categoryData.firstName,
            lastName: categoryData.lastName,
            bio: categoryData.bio,
            jobTitle: categoryData.jobTitle,
            company: categoryData.company,
            location: categoryData.location,
            website: categoryData.website,
            timezone: categoryData.timezone,
            language: categoryData.language,
          };
          break;

        case 'appearance':
          updateData = {
            theme: categoryData.theme,
            colorScheme: categoryData.colorScheme,
            fontSize: categoryData.fontSize,
            density: categoryData.density,
            animations: categoryData.animations,
            glassmorphism: categoryData.glassmorphism,
            dashboardLayout: categoryData.dashboardLayout,
            cardsPerRow: categoryData.cardsPerRow,
            showQuickActions: categoryData.showQuickActions,
            highContrast: categoryData.highContrast,
            reducedMotion: categoryData.reducedMotion,
            focusIndicators: categoryData.focusIndicators,
          };
          break;

        case 'notifications':
          updateData = {
            emailNotifications: categoryData.emailNotifications,
            pushNotifications: categoryData.pushNotifications,
            slackNotifications: categoryData.slackNotifications,
            desktopNotifications: categoryData.desktopNotifications,
            notificationSettings: categoryData.notificationSettings,
          };
          break;

        case 'integrations':
          updateData = {
            integrationSettings: categoryData.integrationSettings,
          };
          break;

        case 'security':
          updateData = {
            twoFactorEnabled: categoryData.twoFactorEnabled,
            loginNotifications: categoryData.loginNotifications,
            securitySettings: categoryData.securitySettings,
          };
          break;

        default:
          throw new Error(`Unknown settings category: ${category}`);
      }

      return await this.updateUserSettings(userId, updateData);
    } catch (error) {
      logger.error('Error updating settings category:', error);
      throw new Error(`Failed to update ${category} settings`);
    }
  }

  /**
   * Delete user settings
   */
  static async deleteUserSettings(userId: string): Promise<void> {
    try {
      await prisma.userSettings.delete({
        where: { userId },
      });
    } catch (error) {
      logger.error('Error deleting user settings:', error);
      throw new Error('Failed to delete user settings');
    }
  }

  /**
   * Check if user has settings
   */
  static async hasUserSettings(userId: string): Promise<boolean> {
    try {
      const settings = await prisma.userSettings.findUnique({
        where: { userId },
        select: { id: true },
      });

      return !!settings;
    } catch (error) {
      logger.error('Error checking user settings:', error);
      return false;
    }
  }

  /**
   * Get settings for multiple users (for admin purposes)
   */
  static async getUsersSettings(
    userIds: string[]
  ): Promise<UserSettingsResponse[]> {
    try {
      const settings = await prisma.userSettings.findMany({
        where: {
          userId: {
            in: userIds,
          },
        },
      });

      return settings as UserSettingsResponse[];
    } catch (error) {
      logger.error('Error getting users settings:', error);
      throw new Error('Failed to retrieve users settings');
    }
  }
}

export default SettingsService;
