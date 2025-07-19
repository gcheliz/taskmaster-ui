"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("../config/passport"));
const authController_1 = __importDefault(require("../controllers/authController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Local authentication routes
router.post('/register', authController_1.default.register);
router.post('/login', authController_1.default.login);
router.post('/validate-password', authController_1.default.validatePassword);
router.post('/logout', authController_1.default.logout);
// Protected routes
router.get('/profile', auth_1.authenticateJWT, authController_1.default.getProfile);
// Google OAuth routes
router.get('/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
}));
router.get('/google/callback', passport_1.default.authenticate('google', {
    failureRedirect: '/api/auth/failure',
    session: false,
}), authController_1.default.oauthSuccess);
// GitHub OAuth routes
router.get('/github', passport_1.default.authenticate('github', {
    scope: ['user:email'],
}));
router.get('/github/callback', passport_1.default.authenticate('github', {
    failureRedirect: '/api/auth/failure',
    session: false,
}), authController_1.default.oauthSuccess);
// OAuth failure route
router.get('/failure', authController_1.default.oauthFailure);
// Health check for auth service
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Auth service is healthy',
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map