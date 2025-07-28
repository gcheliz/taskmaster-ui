import { Router } from 'express';
import {{controllerName}} from '../controllers/{{controllerName}}';
{{#if authentication}}
import { authenticateJWT } from '../middleware/auth';
{{/if}}
{{#if rateLimiter}}
import { rateLimiter } from '../middleware/rateLimiter';
{{/if}}
{{#if validation}}
import { validateRequest } from '../middleware/validation';
import { {{resourceName}}ValidationSchemas } from '../types/validation/{{resourceName}}Validation';
{{/if}}

const router = Router();

/**
 * {{description}}
 * @route {{method}} {{endpoint}}
 * {{#if authentication}}@access Private{{else}}@access Public{{/if}}
 */
router.{{methodLower}}(
  '{{endpoint}}',
  {{#if rateLimiter}}rateLimiter,{{/if}}
  {{#if authentication}}authenticateJWT,{{/if}}
  {{#if validation}}validateRequest({{resourceName}}ValidationSchemas.{{methodName}}),{{/if}}
  {{controllerName}}.{{methodName}}
);

export default router;