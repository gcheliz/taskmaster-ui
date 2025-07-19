"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class SettingsService {
    /**
     * Get user settings by user ID
     */
    static async getUserSettings(userId) {
        try {
            const settings = await prisma.userSettings.findUnique({
                where: { userId },
            });
            return settings;
        }
        catch (error) {
            console.error('Error getting user settings:', error);
            throw new Error('Failed to retrieve user settings');
        }
    }
    /**
     * Get or create user settings (ensures user always has settings)
     */
    static async getOrCreateUserSettings(userId) {
        try {
            let settings = await prisma.userSettings.findUnique({
                where: { userId },
            });
            if (!settings) {
                settings = await this.createUserSettings({ userId });
            }
            return settings;
        }
        catch (error) {
            console.error('Error getting or creating user settings:', error);
            throw new Error('Failed to retrieve or create user settings');
        }
    }
    /**
     * Create new user settings
     */
    static async createUserSettings(data) {
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
            return settings;
        }
        catch (error) {
            console.error('Error creating user settings:', error);
            throw new Error('Failed to create user settings');
        }
    }
    /**
     * Update user settings
     */
    static async updateUserSettings(userId, data) {
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
            return settings;
        }
        catch (error) {
            console.error('Error updating user settings:', error);
            throw new Error('Failed to update user settings');
        }
    }
    /**
     * Update specific settings category
     */
    static async updateSettingsCategory(userId, category, categoryData) {
        try {
            let updateData = {};
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
        }
        catch (error) {
            console.error('Error updating settings category:', error);
            throw new Error(`Failed to update ${category} settings`);
        }
    }
    /**
     * Delete user settings
     */
    static async deleteUserSettings(userId) {
        try {
            await prisma.userSettings.delete({
                where: { userId },
            });
        }
        catch (error) {
            console.error('Error deleting user settings:', error);
            throw new Error('Failed to delete user settings');
        }
    }
    /**
     * Check if user has settings
     */
    static async hasUserSettings(userId) {
        try {
            const settings = await prisma.userSettings.findUnique({
                where: { userId },
                select: { id: true },
            });
            return !!settings;
        }
        catch (error) {
            console.error('Error checking user settings:', error);
            return false;
        }
    }
    /**
     * Get settings for multiple users (for admin purposes)
     */
    static async getUsersSettings(userIds) {
        try {
            const settings = await prisma.userSettings.findMany({
                where: {
                    userId: {
                        in: userIds,
                    },
                },
            });
            return settings;
        }
        catch (error) {
            console.error('Error getting users settings:', error);
            throw new Error('Failed to retrieve users settings');
        }
    }
}
exports.SettingsService = SettingsService;
exports.default = SettingsService;
//# sourceMappingURL=settingsService.js.map