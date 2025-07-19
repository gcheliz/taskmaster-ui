import { Router } from 'express';
import SettingsController from '../controllers/settingsController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// All settings routes require authentication
router.use(authenticateJWT);

/**
 * @route GET /api/settings
 * @desc Get current user's settings
 * @access Private
 */
router.get('/', SettingsController.getSettings);

/**
 * @route PUT /api/settings
 * @desc Update current user's settings
 * @access Private
 */
router.put('/', SettingsController.updateSettings);

/**
 * @route POST /api/settings
 * @desc Create settings for current user
 * @access Private
 */
router.post('/', SettingsController.createSettings);

/**
 * @route DELETE /api/settings
 * @desc Delete current user's settings
 * @access Private
 */
router.delete('/', SettingsController.deleteSettings);

/**
 * @route POST /api/settings/reset
 * @desc Reset settings to defaults
 * @access Private
 */
router.post('/reset', SettingsController.resetSettings);

/**
 * @route PUT /api/settings/category
 * @desc Update specific settings category
 * @access Private
 */
router.put('/category', SettingsController.updateCategory);

/**
 * @route GET /api/settings/:category
 * @desc Get settings for specific category
 * @access Private
 */
router.get('/:category', SettingsController.getCategorySettings);

export default router;
