"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settingsController_1 = __importDefault(require("../controllers/settingsController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All settings routes require authentication
router.use(auth_1.authenticateJWT);
/**
 * @route GET /api/settings
 * @desc Get current user's settings
 * @access Private
 */
router.get('/', settingsController_1.default.getSettings);
/**
 * @route PUT /api/settings
 * @desc Update current user's settings
 * @access Private
 */
router.put('/', settingsController_1.default.updateSettings);
/**
 * @route POST /api/settings
 * @desc Create settings for current user
 * @access Private
 */
router.post('/', settingsController_1.default.createSettings);
/**
 * @route DELETE /api/settings
 * @desc Delete current user's settings
 * @access Private
 */
router.delete('/', settingsController_1.default.deleteSettings);
/**
 * @route POST /api/settings/reset
 * @desc Reset settings to defaults
 * @access Private
 */
router.post('/reset', settingsController_1.default.resetSettings);
/**
 * @route PUT /api/settings/category
 * @desc Update specific settings category
 * @access Private
 */
router.put('/category', settingsController_1.default.updateCategory);
/**
 * @route GET /api/settings/:category
 * @desc Get settings for specific category
 * @access Private
 */
router.get('/:category', settingsController_1.default.getCategorySettings);
exports.default = router;
//# sourceMappingURL=settingsRoutes.js.map