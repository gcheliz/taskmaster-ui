import { Request, Response, NextFunction } from 'express';
import { ApiError, ApiMetadata, ValidationError } from '../types/api';
export interface EnhancedRequest extends Request {
    requestId: string;
    startTime: number;
    user?: any;
    rateLimit?: any;
    validatedBody?: any;
    repositoryPath?: string;
    correlationId?: string;
}
export interface EnhancedResponse extends Response {
    apiResponse: <T>(data?: T, error?: ApiError) => void;
    apiError: (error: ApiError, statusCode?: number) => void;
    apiSuccess: <T>(data: T, metadata?: Partial<ApiMetadata>) => void;
}
export type MiddlewareFactory<T = any> = (options?: T) => (req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => void | Promise<void>;
export declare class RequestContext {
    readonly requestId: string;
    readonly startTime: number;
    readonly correlationId?: string | undefined;
    private static contexts;
    constructor(requestId: string, startTime: number, correlationId?: string | undefined);
    static create(req: EnhancedRequest): RequestContext;
    static get(requestId: string): RequestContext | undefined;
    static cleanup(requestId: string): void;
    getDuration(): number;
}
export declare const requestIdMiddleware: MiddlewareFactory;
export declare const apiResponseMiddleware: MiddlewareFactory;
export interface ValidationOptions {
    bodySchema?: any;
    querySchema?: any;
    paramSchema?: any;
    customValidators?: Array<(req: EnhancedRequest) => ValidationError[]>;
}
export declare const validationMiddleware: MiddlewareFactory<ValidationOptions>;
export interface RateLimitOptions {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (req: EnhancedRequest) => string;
    skipSuccessful?: boolean;
    skipFailed?: boolean;
}
export declare const rateLimitMiddleware: MiddlewareFactory<RateLimitOptions>;
export declare const securityHeadersMiddleware: MiddlewareFactory;
export declare const errorHandlingMiddleware: (error: Error, req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => void;
export declare const loggingMiddleware: MiddlewareFactory;
export declare function composeMiddleware(...middlewares: Array<(req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => void>): (req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => void;
//# sourceMappingURL=index.d.ts.map