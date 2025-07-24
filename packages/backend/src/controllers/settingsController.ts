import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../utils/winston-adapter';
import SettingsService, { CreateUserSettingsData, UpdateUserSettingsData } from '../services/settingsService';
import type { AuthenticatedRequest } from '../middleware/auth';

// Validation schemas
const updateSettingsSchema = z.object({
  // Profile settings
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  timezone: z.string().optional(),
  language: z.string().optional(),

  // Appearance settings
  theme: z.enum(['light', 'dark', 'system']).optional(),
  colorScheme: z.string().optional(),
  fontSize: z.enum(['sm', 'md', 'lg']).optional(),
  density: z.enum(['compact', 'comfortable', 'spacious']).optional(),
  animations: z.boolean().optional(),
  glassmorphism: z.boolean().optional(),

  // Notification settings
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  slackNotifications: z.boolean().optional(),
  desktopNotifications: z.boolean().optional(),
  notificationSettings: z.record(z.unknown()).optional(),

  // Integration settings
  integrationSettings: z.record(z.unknown()).optional(),

  // Security settings
  twoFactorEnabled: z.boolean().optional(),
  loginNotifications: z.boolean().optional(),
  securitySettings: z.record(z.unknown()).optional(),

  // Dashboard preferences
  dashboardLayout: z.enum(['grid', 'list']).optional(),
  cardsPerRow: z.number().min(1).max(6).optional(),
  showQuickActions: z.boolean().optional(),

  // Accessibility
  highContrast: z.boolean().optional(),
  reducedMotion: z.boolean().optional(),
  focusIndicators: z.boolean().optional(),
});

const updateCategorySchema = z.object({
  category: z.enum([
    'profile',
    'appearance',
    'notifications',
    'integrations',
    'security',
  ]),
  data: z.record(z.unknown()),
});

export class SettingsController {
  /**
   * Helper to get userId from request
   */
  private static getUserId(req: Request): string {
    const user = req.user;
    if (!user) throw new Error('User not authenticated');
    return (user as any).userId || (user as any).id || '';
  }
  /**
   * Get user settings
   * GET /api/settings
   */
  static async getSettings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const settings = await SettingsService.getOrCreateUserSettings(
        this.getUserId(req)
      );

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      logger.error('Error getting settings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve settings',
        },
      });
    }
  }

  /**
   * Update user settings
   * PUT /api/settings
   */
  static async updateSettings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      // Validate request body
      const validation = updateSettingsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid settings data',
            details: validation.error.issues,
          },
        });
      }

      const settings = await SettingsService.updateUserSettings(
        this.getUserId(req),
        validation.data as UpdateUserSettingsData
      );

      res.json({
        success: true,
        data: settings,
        message: 'Settings updated successfully',
      });
    } catch (error) {
      logger.error('Error updating settings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update settings',
        },
      });
    }
  }

  /**
   * Update specific settings category
   * PUT /api/settings/category
   */
  static async updateCategory(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      // Validate request body
      const validation = updateCategorySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid category data',
            details: validation.error.issues,
          },
        });
      }

      const { category, data } = validation.data;

      const settings = await SettingsService.updateSettingsCategory(
        this.getUserId(req),
        category,
        data
      );

      res.json({
        success: true,
        data: settings,
        message: `${category.charAt(0).toUpperCase() + category.slice(1)} settings updated successfully`,
      });
    } catch (error) {
      logger.error('Error updating settings category:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update settings category',
        },
      });
    }
  }

  /**
   * Create user settings
   * POST /api/settings
   */
  static async createSettings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      // Check if user already has settings
      const hasSettings = await SettingsService.hasUserSettings(
        req.user.userId
      );
      if (hasSettings) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'SETTINGS_EXIST',
            message: 'User settings already exist',
          },
        });
      }

      // Validate request body
      const validation = updateSettingsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid settings data',
            details: validation.error.issues,
          },
        });
      }

      const settings = await SettingsService.createUserSettings({
        userId: this.getUserId(req),
        ...validation.data,
      } as CreateUserSettingsData);

      res.status(201).json({
        success: true,
        data: settings,
        message: 'Settings created successfully',
      });
    } catch (error) {
      logger.error('Error creating settings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create settings',
        },
      });
    }
  }

  /**
   * Delete user settings
   * DELETE /api/settings
   */
  static async deleteSettings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      await SettingsService.deleteUserSettings(this.getUserId(req));

      res.json({
        success: true,
        message: 'Settings deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting settings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete settings',
        },
      });
    }
  }

  /**
   * Reset settings to defaults
   * POST /api/settings/reset
   */
  static async resetSettings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      // Delete existing settings and create new default settings
      try {
        await SettingsService.deleteUserSettings(this.getUserId(req));
      } catch (error) {
        // Settings might not exist, that's okay
      }

      const settings = await SettingsService.createUserSettings({
        userId: this.getUserId(req),
      });

      res.json({
        success: true,
        data: settings,
        message: 'Settings reset to defaults successfully',
      });
    } catch (error) {
      logger.error('Error resetting settings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to reset settings',
        },
      });
    }
  }

  /**
   * Get settings for a specific category
   * GET /api/settings/:category
   */
  static async getCategorySettings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const { category } = req.params;

      if (
        ![
          'profile',
          'appearance',
          'notifications',
          'integrations',
          'security',
        ].includes(category)
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CATEGORY',
            message: 'Invalid settings category',
          },
        });
      }

      const settings = await SettingsService.getOrCreateUserSettings(
        this.getUserId(req)
      );

      // Extract category-specific settings
      let categorySettings: any = {};

      switch (category) {
        case 'profile':
          categorySettings = {
            firstName: settings.firstName,
            lastName: settings.lastName,
            bio: settings.bio,
            jobTitle: settings.jobTitle,
            company: settings.company,
            location: settings.location,
            website: settings.website,
            timezone: settings.timezone,
            language: settings.language,
          };
          break;
        case 'appearance':
          categorySettings = {
            theme: settings.theme,
            colorScheme: settings.colorScheme,
            fontSize: settings.fontSize,
            density: settings.density,
            animations: settings.animations,
            glassmorphism: settings.glassmorphism,
            dashboardLayout: settings.dashboardLayout,
            cardsPerRow: settings.cardsPerRow,
            showQuickActions: settings.showQuickActions,
            highContrast: settings.highContrast,
            reducedMotion: settings.reducedMotion,
            focusIndicators: settings.focusIndicators,
          };
          break;
        case 'notifications':
          categorySettings = {
            emailNotifications: settings.emailNotifications,
            pushNotifications: settings.pushNotifications,
            slackNotifications: settings.slackNotifications,
            desktopNotifications: settings.desktopNotifications,
            notificationSettings: settings.notificationSettings,
          };
          break;
        case 'integrations':
          categorySettings = {
            integrationSettings: settings.integrationSettings,
          };
          break;
        case 'security':
          categorySettings = {
            twoFactorEnabled: settings.twoFactorEnabled,
            loginNotifications: settings.loginNotifications,
            securitySettings: settings.securitySettings,
          };
          break;
      }

      res.json({
        success: true,
        data: categorySettings,
      });
    } catch (error) {
      logger.error('Error getting category settings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve category settings',
        },
      });
    }
  }
}

export default SettingsController;
