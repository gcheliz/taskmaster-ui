import { Request, Response, NextFunction } from 'express';
import { EnhancedRequest, EnhancedResponse } from './index';
/**
 * Validation middleware for PRD analysis requests
 */
export declare const validatePrdAnalysisRequest: (req: EnhancedRequest, res: EnhancedResponse, next: NextFunction) => void | Promise<void>;
/**
 * Basic auth middleware (placeholder - implement proper auth as needed)
 */
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map