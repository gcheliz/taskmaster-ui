"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.validatePrdAnalysisRequest = void 0;
const index_1 = require("./index");
/**
 * Validation middleware for PRD analysis requests
 */
exports.validatePrdAnalysisRequest = (0, index_1.validationMiddleware)({
    bodySchema: {
        required: ['repositoryPath', 'prdContent']
    },
    customValidators: [
        (req) => {
            const errors = [];
            const { repositoryPath, prdContent, options } = req.body;
            // Validate repository path
            if (repositoryPath && typeof repositoryPath !== 'string') {
                errors.push({
                    field: 'repositoryPath',
                    code: 'INVALID_TYPE',
                    message: 'Repository path must be a string',
                    value: repositoryPath
                });
            }
            // Validate PRD content
            if (prdContent && typeof prdContent !== 'string') {
                errors.push({
                    field: 'prdContent',
                    code: 'INVALID_TYPE',
                    message: 'PRD content must be a string',
                    value: prdContent
                });
            }
            if (prdContent && prdContent.length === 0) {
                errors.push({
                    field: 'prdContent',
                    code: 'EMPTY_CONTENT',
                    message: 'PRD content cannot be empty',
                    value: prdContent
                });
            }
            if (prdContent && prdContent.length > 1000000) { // 1MB limit
                errors.push({
                    field: 'prdContent',
                    code: 'CONTENT_TOO_LARGE',
                    message: 'PRD content cannot exceed 1MB',
                    value: prdContent.length
                });
            }
            // Validate options if provided
            if (options && typeof options !== 'object') {
                errors.push({
                    field: 'options',
                    code: 'INVALID_TYPE',
                    message: 'Options must be an object',
                    value: options
                });
            }
            if (options) {
                // Validate tag
                if (options.tag && typeof options.tag !== 'string') {
                    errors.push({
                        field: 'options.tag',
                        code: 'INVALID_TYPE',
                        message: 'Tag must be a string',
                        value: options.tag
                    });
                }
                // Validate append
                if (options.append !== undefined && typeof options.append !== 'boolean') {
                    errors.push({
                        field: 'options.append',
                        code: 'INVALID_TYPE',
                        message: 'Append must be a boolean',
                        value: options.append
                    });
                }
                // Validate research
                if (options.research !== undefined && typeof options.research !== 'boolean') {
                    errors.push({
                        field: 'options.research',
                        code: 'INVALID_TYPE',
                        message: 'Research must be a boolean',
                        value: options.research
                    });
                }
            }
            return errors;
        }
    ]
});
/**
 * Basic auth middleware (placeholder - implement proper auth as needed)
 */
const authMiddleware = (req, res, next) => {
    // For now, just pass through
    // In production, implement proper authentication
    next();
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=validation.js.map