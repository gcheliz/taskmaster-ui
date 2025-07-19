import { Router } from 'express';
import passport from '../config/passport';
import AuthController from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Local authentication routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/validate-password', AuthController.validatePassword);
router.post('/logout', AuthController.logout);

// Protected routes
router.get('/profile', authenticateJWT, AuthController.getProfile);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/failure',
    session: false,
  }),
  AuthController.oauthSuccess
);

// GitHub OAuth routes
router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['user:email'],
  })
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/api/auth/failure',
    session: false,
  }),
  AuthController.oauthSuccess
);

// OAuth failure route
router.get('/failure', AuthController.oauthFailure);

// Health check for auth service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
