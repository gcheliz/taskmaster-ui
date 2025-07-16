import { NextFunction } from 'express';
import { RateLimitOptions } from './index';
import { EnhancedRequest, EnhancedResponse } from './index';
/**
 * Rate limiter factory for different endpoints
 */
export declare class RateLimiter {
    /**
     * Create a rate limiter with specific options
     */
    createLimiter(options: Partial<RateLimitOptions>): (req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => void | Promise<void>;
    /**
     * Strict rate limiter for resource-intensive operations
     */
    strictLimiter(): (req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => void | Promise<void>;
    /**
     * Moderate rate limiter for API endpoints
     */
    moderateLimiter(): (req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => void | Promise<void>;
    /**
     * Lenient rate limiter for read operations
     */
    lenientLimiter(): (req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => void | Promise<void>;
}
export declare const rateLimiter: RateLimiter;
//# sourceMappingURL=rateLimiter.d.ts.map