import { Request, Response, NextFunction } from 'express';
import { rateLimitMiddleware, RateLimitOptions } from './index';
import { EnhancedRequest, EnhancedResponse } from './index';

/**
 * Rate limiter factory for different endpoints
 */
export class RateLimiter {
  /**
   * Create a rate limiter with specific options
   */
  createLimiter(options: Partial<RateLimitOptions>) {
    return rateLimitMiddleware({
      windowMs: 15 * 60 * 1000, // 15 minutes default
      maxRequests: 100, // 100 requests per window default
      ...options
    });
  }

  /**
   * Strict rate limiter for resource-intensive operations
   */
  strictLimiter() {
    return this.createLimiter({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5, // 5 requests per minute
      keyGenerator: (req: EnhancedRequest) => {
        // Use IP + User Agent for more precise rate limiting
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        return `${ip}:${userAgent}`;
      }
    });
  }

  /**
   * Moderate rate limiter for API endpoints
   */
  moderateLimiter() {
    return this.createLimiter({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10, // 10 requests per minute
    });
  }

  /**
   * Lenient rate limiter for read operations
   */
  lenientLimiter() {
    return this.createLimiter({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60, // 60 requests per minute
    });
  }
}

export const rateLimiter = new RateLimiter();