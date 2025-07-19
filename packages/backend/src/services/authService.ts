import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/environment';

const prisma = new PrismaClient();

export interface CreateUserData {
  email: string;
  name: string;
  password?: string;
  provider?: string;
  providerId?: string;
  avatar?: string;
  emailVerified?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export class AuthService {
  private static readonly JWT_SECRET: string =
    env.JWT_SECRET || 'your-secret-key';
  private static readonly JWT_EXPIRES_IN = env.JWT_EXPIRES_IN || '7d';
  private static readonly BCRYPT_ROUNDS = 12;

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: '7d',
      issuer: 'taskmaster-api',
      audience: 'taskmaster-ui',
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, this.JWT_SECRET, {
      issuer: 'taskmaster-api',
      audience: 'taskmaster-ui',
    }) as JWTPayload;
  }

  /**
   * Create a new user
   */
  static async createUser(data: CreateUserData) {
    const {
      email,
      name,
      password,
      provider = 'local',
      providerId,
      avatar,
      emailVerified = false,
    } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password if provided (for local auth)
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await this.hashPassword(password);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        provider,
        providerId,
        avatar,
        emailVerified,
      },
    });

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Login with email and password
   */
  static async loginWithCredentials(credentials: LoginCredentials) {
    const { email, password } = credentials;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user has a password (local auth)
    if (!user.password) {
      throw new Error('Please login with your social account');
    }

    // Verify password
    const isValidPassword = await this.comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Find or create OAuth user
   */
  static async findOrCreateOAuthUser(oauthData: {
    provider: string;
    providerId: string;
    email: string;
    name: string;
    avatar?: string;
  }) {
    const { provider, providerId, email, name, avatar } = oauthData;

    // First, try to find user by OAuth provider and ID
    let user = await prisma.user.findFirst({
      where: {
        provider,
        providerId,
      },
    });

    // If not found, try to find by email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
      });

      // If user exists with same email but different provider, update OAuth info
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider,
            providerId,
            avatar: avatar || user.avatar,
            emailVerified: true, // OAuth emails are typically verified
          },
        });
      }
    }

    // If still not found, create new user
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          avatar,
          provider,
          providerId,
          emailVerified: true, // OAuth emails are typically verified
        },
      });
    }

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      projects: user.projects.map(up => ({
        id: up.project.id,
        name: up.project.name,
        role: up.role,
      })),
    };
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    score: number;
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) {
      score += 25;
    } else {
      feedback.push('At least 8 characters');
    }

    // Uppercase letter
    if (/[A-Z]/.test(password)) {
      score += 25;
    } else {
      feedback.push('One uppercase letter');
    }

    // Lowercase letter
    if (/[a-z]/.test(password)) {
      score += 25;
    } else {
      feedback.push('One lowercase letter');
    }

    // Number or special character
    if (/[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      score += 25;
    } else {
      feedback.push('One number or special character');
    }

    return { score, feedback };
  }
}

export default AuthService;
