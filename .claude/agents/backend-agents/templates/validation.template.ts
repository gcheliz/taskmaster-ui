import { z } from 'zod';

/**
 * Validation schemas for {{resourceName}} endpoints
 */
export const {{resourceName}}ValidationSchemas = {
  {{#each endpoints}}
  {{this.name}}: z.object({
    {{#if this.body}}
    body: z.object({
      {{#each this.body}}
      {{@key}}: {{this}},
      {{/each}}
    }),
    {{/if}}
    {{#if this.params}}
    params: z.object({
      {{#each this.params}}
      {{@key}}: {{this}},
      {{/each}}
    }),
    {{/if}}
    {{#if this.query}}
    query: z.object({
      {{#each this.query}}
      {{@key}}: {{this}},
      {{/each}}
    }),
    {{/if}}
  }),
  {{/each}}
};

/**
 * TypeScript types derived from validation schemas
 */
{{#each endpoints}}
export type {{../resourceNameCapitalized}}{{this.nameCapitalized}}Input = z.infer<typeof {{../resourceName}}ValidationSchemas.{{this.name}}>;
{{/each}}

/**
 * Response types for {{resourceName}} endpoints
 */
export interface {{resourceNameCapitalized}}Response<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

{{#if modelName}}
/**
 * Prisma model type re-export for convenience
 */
export type { {{modelName}} } from '@prisma/client';
{{/if}}