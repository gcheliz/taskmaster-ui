import { Request, Response } from 'express';
import AuthService from '../services/authService';
import { env } from '../config/environment';
import { logger } from '../utils/winston-adapter';
import { ApiResponse } from '../types/common';
import { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: User & {
    id: string;
    userId?: string;
  };
}

export class AuthController {
  /**
   * Register a new user with email and password
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, name, password } = req.body;

      // Validate required fields
      if (!email || !name || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Email, name, and password are required',
          },
        });
      }

      // Validate password strength
      const passwordValidation = AuthService.validatePasswordStrength(password);
      if (passwordValidation.score < 75) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: 'Password does not meet strength requirements',
            details: passwordValidation,
          },
        });
      }

      // Create user
      const result = await AuthService.createUser({
        email,
        name,
        password,
        provider: 'local',
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully',
      });
    } catch (error) {
      logger.error('Registration error:', error);

      const message =
        error instanceof Error ? error.message : 'Registration failed';
      const statusCode = message.includes('already exists') ? 409 : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          code: statusCode === 409 ? 'USER_EXISTS' : 'REGISTRATION_FAILED',
          message,
        },
      });
    }
  }

  /**
   * Login with email and password
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_CREDENTIALS',
            message: 'Email and password are required',
          },
        });
      }

      // Authenticate user
      const result = await AuthService.loginWithCredentials({
        email,
        password,
      });

      res.json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error) {
      logger.error('Login error:', error);

      const message = error instanceof Error ? error.message : 'Login failed';

      res.status(401).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message,
        },
      });
    }
  }

  /**
   * Validate password strength
   */
  static async validatePassword(req: Request, res: Response) {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PASSWORD',
            message: 'Password is required',
          },
        });
      }

      const validation = AuthService.validatePasswordStrength(password);

      res.json({
        success: true,
        data: validation,
      });
    } catch (error) {
      logger.error('Password validation error:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password validation failed',
        },
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'User not authenticated',
          },
        });
      }

      const user = await AuthService.getUserById(
        req.user.userId || req.user.id
      );

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      logger.error('Profile fetch error:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'PROFILE_FETCH_FAILED',
          message: 'Failed to fetch user profile',
        },
      });
    }
  }

  /**
   * OAuth success callback - handles both Google and GitHub
   */
  static async oauthSuccess(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.redirect(`${env.CLIENT_URL}/auth?error=oauth_failed`);
      }

      // The user object contains the result from AuthService.findOrCreateOAuthUser
      const { user, token } = req.user;

      // Redirect to frontend with token and user data
      const redirectUrl = new URL(`${env.CLIENT_URL}/auth/callback`);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('user', JSON.stringify(user));

      res.redirect(redirectUrl.toString());
    } catch (error) {
      logger.error('OAuth success error:', error);
      res.redirect(`${env.CLIENT_URL}/auth?error=oauth_callback_failed`);
    }
  }

  /**
   * OAuth failure callback
   */
  static async oauthFailure(req: Request, res: Response) {
    logger.error('OAuth failure:', req.query);
    res.redirect(`${env.CLIENT_URL}/auth?error=oauth_failed`);
  }

  /**
   * Logout
   */
  static async logout(req: Request, res: Response) {
    try {
      // For session-based auth
      req.logout(err => {
        if (err) {
          logger.error('Logout error:', err);
        }
      });

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Logout error:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_FAILED',
          message: 'Logout failed',
        },
      });
    }
  }
}

export default AuthController;
