"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const environment_1 = require("../config/environment");
const prisma = new client_1.PrismaClient();
class AuthService {
    /**
     * Hash password using bcrypt
     */
    static async hashPassword(password) {
        return bcryptjs_1.default.hash(password, this.BCRYPT_ROUNDS);
    }
    /**
     * Compare password with hash
     */
    static async comparePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    /**
     * Generate JWT token
     */
    static generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, {
            expiresIn: '7d',
            issuer: 'taskmaster-api',
            audience: 'taskmaster-ui',
        });
    }
    /**
     * Verify JWT token
     */
    static verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, this.JWT_SECRET, {
            issuer: 'taskmaster-api',
            audience: 'taskmaster-ui',
        });
    }
    /**
     * Create a new user
     */
    static async createUser(data) {
        const { email, name, password, provider = 'local', providerId, avatar, emailVerified = false } = data;
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        // Hash password if provided (for local auth)
        let hashedPassword;
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
    static async loginWithCredentials(credentials) {
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
    static async findOrCreateOAuthUser(oauthData) {
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
    static async getUserById(userId) {
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
    static validatePasswordStrength(password) {
        let score = 0;
        const feedback = [];
        // Length check
        if (password.length >= 8) {
            score += 25;
        }
        else {
            feedback.push('At least 8 characters');
        }
        // Uppercase letter
        if (/[A-Z]/.test(password)) {
            score += 25;
        }
        else {
            feedback.push('One uppercase letter');
        }
        // Lowercase letter
        if (/[a-z]/.test(password)) {
            score += 25;
        }
        else {
            feedback.push('One lowercase letter');
        }
        // Number or special character
        if (/[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
            score += 25;
        }
        else {
            feedback.push('One number or special character');
        }
        return { score, feedback };
    }
}
exports.AuthService = AuthService;
AuthService.JWT_SECRET = environment_1.env.JWT_SECRET || 'your-secret-key';
AuthService.JWT_EXPIRES_IN = environment_1.env.JWT_EXPIRES_IN || '7d';
AuthService.BCRYPT_ROUNDS = 12;
exports.default = AuthService;
//# sourceMappingURL=authService.js.map