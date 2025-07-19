"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.optionalAuth = exports.authenticateJWT = void 0;
const authService_1 = __importDefault(require("../services/authService"));
/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header
 */
const authenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'NO_TOKEN',
                    message: 'Authorization header is required',
                },
            });
        }
        // Extract token from "Bearer TOKEN" format
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;
        if (!token) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN_FORMAT',
                    message: 'Token must be provided in Bearer format',
                },
            });
        }
        // Verify JWT token
        const payload = authService_1.default.verifyToken(token);
        req.user = payload;
        next();
    }
    catch (error) {
        console.error('JWT authentication error:', error);
        let errorCode = 'INVALID_TOKEN';
        let message = 'Invalid or expired token';
        if (error instanceof Error) {
            if (error.name === 'TokenExpiredError') {
                errorCode = 'TOKEN_EXPIRED';
                message = 'Token has expired';
            }
            else if (error.name === 'JsonWebTokenError') {
                errorCode = 'MALFORMED_TOKEN';
                message = 'Malformed token';
            }
        }
        res.status(401).json({
            success: false,
            error: {
                code: errorCode,
                message,
            },
        });
    }
};
exports.authenticateJWT = authenticateJWT;
/**
 * Optional JWT Authentication Middleware
 * Verifies JWT token if present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.startsWith('Bearer ')
                ? authHeader.slice(7)
                : authHeader;
            if (token) {
                try {
                    const payload = authService_1.default.verifyToken(token);
                    req.user = payload;
                }
                catch (error) {
                    // Silent fail for optional auth
                    console.warn('Optional auth failed:', error);
                }
            }
        }
        next();
    }
    catch (error) {
        // Silent fail for optional auth
        console.warn('Optional auth middleware error:', error);
        next();
    }
};
exports.optionalAuth = optionalAuth;
/**
 * Role-based authorization middleware
 */
const requireRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'NOT_AUTHENTICATED',
                        message: 'Authentication required',
                    },
                });
            }
            // Get user with roles
            const user = await authService_1.default.getUserById(req.user.userId);
            // For now, we'll use a simple role check
            // This can be expanded based on project-specific roles
            const userRole = 'user'; // Default role
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'INSUFFICIENT_PERMISSIONS',
                        message: 'Insufficient permissions for this action',
                    },
                });
            }
            next();
        }
        catch (error) {
            console.error('Role authorization error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'AUTHORIZATION_ERROR',
                    message: 'Authorization check failed',
                },
            });
        }
    };
};
exports.requireRole = requireRole;
exports.default = {
    authenticateJWT: exports.authenticateJWT,
    optionalAuth: exports.optionalAuth,
    requireRole: exports.requireRole,
};
//# sourceMappingURL=auth.js.map