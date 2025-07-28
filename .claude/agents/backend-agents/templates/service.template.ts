import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/winston-adapter';
{{#if validation}}
import { {{resourceName}}ValidationSchemas } from '../types/validation/{{resourceName}}Validation';
{{/if}}

const prisma = new PrismaClient();

export class {{serviceName}} {
  /**
   * {{description}}
   */
  static async {{methodName}}(data: any{{#if authentication}}, userId: string{{/if}}): Promise<any> {
    try {
      {{#if usePrisma}}
      // Prisma operation for {{method}} on {{modelName}}
      {{#equals method "GET"}}
      const result = await prisma.{{modelNameLower}}.findMany({
        where: {
          {{#if authentication}}userId,{{/if}}
          ...(data.params?.id && { id: data.params.id }),
        },
        take: data.query?.limit ? parseInt(data.query.limit) : 100,
        skip: data.query?.offset ? parseInt(data.query.offset) : 0,
        orderBy: { createdAt: 'desc' },
      });
      {{/equals}}
      
      {{#equals method "POST"}}
      const result = await prisma.{{modelNameLower}}.create({
        data: {
          {{#if authentication}}userId,{{/if}}
          ...data.body,
        },
      });
      {{/equals}}
      
      {{#equals method "PUT"}}
      const result = await prisma.{{modelNameLower}}.update({
        where: { 
          id: data.params.id,
          {{#if authentication}}userId,{{/if}}
        },
        data: data.body,
      });
      {{/equals}}
      
      {{#equals method "PATCH"}}
      const result = await prisma.{{modelNameLower}}.update({
        where: { 
          id: data.params.id,
          {{#if authentication}}userId,{{/if}}
        },
        data: data.body,
      });
      {{/equals}}
      
      {{#equals method "DELETE"}}
      const result = await prisma.{{modelNameLower}}.delete({
        where: { 
          id: data.params.id,
          {{#if authentication}}userId,{{/if}}
        },
      });
      {{/equals}}
      {{else}}
      // Custom service logic for {{resourceName}}
      const result = {
        message: '{{method}} {{resourceName}} endpoint',
        timestamp: new Date().toISOString(),
        {{#if authentication}}userId,{{/if}}
      };
      {{/if}}
      
      return result;
    } catch (error) {
      logger.error('{{serviceName}}.{{methodName}} error:', error);
      
      if (error.code === 'P2025') {
        const err = new Error('Resource not found');
        (err as any).statusCode = 404;
        throw err;
      }
      
      throw error;
    }
  }
}

export default {{serviceName}};