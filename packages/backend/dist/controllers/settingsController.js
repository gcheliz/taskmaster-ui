"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const zod_1 = require("zod");
const settingsService_1 = __importDefault(require("../services/settingsService"));
// Validation schemas
const updateSettingsSchema = zod_1.z.object({
    // Profile settings
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    jobTitle: zod_1.z.string().optional(),
    company: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    website: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    timezone: zod_1.z.string().optional(),
    language: zod_1.z.string().optional(),
    // Appearance settings
    theme: zod_1.z.enum(['light', 'dark', 'system']).optional(),
    colorScheme: zod_1.z.string().optional(),
    fontSize: zod_1.z.enum(['sm', 'md', 'lg']).optional(),
    density: zod_1.z.enum(['compact', 'comfortable', 'spacious']).optional(),
    animations: zod_1.z.boolean().optional(),
    glassmorphism: zod_1.z.boolean().optional(),
    // Notification settings
    emailNotifications: zod_1.z.boolean().optional(),
    pushNotifications: zod_1.z.boolean().optional(),
    slackNotifications: zod_1.z.boolean().optional(),
    desktopNotifications: zod_1.z.boolean().optional(),
    notificationSettings: zod_1.z.any().optional(),
    // Integration settings
    integrationSettings: zod_1.z.any().optional(),
    // Security settings
    twoFactorEnabled: zod_1.z.boolean().optional(),
    loginNotifications: zod_1.z.boolean().optional(),
    securitySettings: zod_1.z.any().optional(),
    // Dashboard preferences
    dashboardLayout: zod_1.z.enum(['grid', 'list']).optional(),
    cardsPerRow: zod_1.z.number().min(1).max(6).optional(),
    showQuickActions: zod_1.z.boolean().optional(),
    // Accessibility
    highContrast: zod_1.z.boolean().optional(),
    reducedMotion: zod_1.z.boolean().optional(),
    focusIndicators: zod_1.z.boolean().optional(),
});
const updateCategorySchema = zod_1.z.object({
    category: zod_1.z.enum(['profile', 'appearance', 'notifications', 'integrations', 'security']),
    data: zod_1.z.any(),
});
class SettingsController {
    /**
     * Get user settings
     * GET /api/settings
     */
    static async getSettings(req, res) {
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
            const settings = await settingsService_1.default.getOrCreateUserSettings(req.user.userId);
            res.json({
                success: true,
                data: settings,
            });
        }
        catch (error) {
            console.error('Error getting settings:', error);
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
    static async updateSettings(req, res) {
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
            const settings = await settingsService_1.default.updateUserSettings(req.user.userId, validation.data);
            res.json({
                success: true,
                data: settings,
                message: 'Settings updated successfully',
            });
        }
        catch (error) {
            console.error('Error updating settings:', error);
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
    static async updateCategory(req, res) {
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
            const settings = await settingsService_1.default.updateSettingsCategory(req.user.userId, category, data);
            res.json({
                success: true,
                data: settings,
                message: `${category.charAt(0).toUpperCase() + category.slice(1)} settings updated successfully`,
            });
        }
        catch (error) {
            console.error('Error updating settings category:', error);
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
    static async createSettings(req, res) {
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
            const hasSettings = await settingsService_1.default.hasUserSettings(req.user.userId);
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
            const settings = await settingsService_1.default.createUserSettings({
                userId: req.user.userId,
                ...validation.data,
            });
            res.status(201).json({
                success: true,
                data: settings,
                message: 'Settings created successfully',
            });
        }
        catch (error) {
            console.error('Error creating settings:', error);
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
    static async deleteSettings(req, res) {
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
            await settingsService_1.default.deleteUserSettings(req.user.userId);
            res.json({
                success: true,
                message: 'Settings deleted successfully',
            });
        }
        catch (error) {
            console.error('Error deleting settings:', error);
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
    static async resetSettings(req, res) {
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
                await settingsService_1.default.deleteUserSettings(req.user.userId);
            }
            catch (error) {
                // Settings might not exist, that's okay
            }
            const settings = await settingsService_1.default.createUserSettings({
                userId: req.user.userId,
            });
            res.json({
                success: true,
                data: settings,
                message: 'Settings reset to defaults successfully',
            });
        }
        catch (error) {
            console.error('Error resetting settings:', error);
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
    static async getCategorySettings(req, res) {
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
            if (!['profile', 'appearance', 'notifications', 'integrations', 'security'].includes(category)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_CATEGORY',
                        message: 'Invalid settings category',
                    },
                });
            }
            const settings = await settingsService_1.default.getOrCreateUserSettings(req.user.userId);
            // Extract category-specific settings
            let categorySettings = {};
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
        }
        catch (error) {
            console.error('Error getting category settings:', error);
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
exports.SettingsController = SettingsController;
exports.default = SettingsController;
//# sourceMappingURL=settingsController.js.map