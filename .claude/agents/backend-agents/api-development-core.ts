import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { templateEngine } from '../template-engine';

// Input validation schemas
export const generateEndpointSchema = z.object({
  endpoint: z.string().regex(/^\/[a-zA-Z0-9\/-]+$/, 'Endpoint must start with / and contain only valid URL characters'),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  description: z.string(),
  authentication: z.boolean().default(true),
  validation: z.object({
    body: z.record(z.any()).optional(),
    params: z.record(z.any()).optional(),
    query: z.record(z.any()).optional(),
  }).optional(),
  response: z.object({
    success: z.record(z.any()),
    error: z.record(z.any()).optional(),
  }).optional(),
  modelName: z.string().optional(), // For Prisma model integration
});

export type GenerateEndpointInput = z.infer<typeof generateEndpointSchema>;

interface GeneratedFile {
  path: string;
  content: string;
  action: 'create' | 'update';
}

interface GenerationResult {
  files: GeneratedFile[];
  migrations: string[];
  documentation: {
    endpoint: string;
    method: string;
    description: string;
    authentication: boolean;
    requestSchema?: any;
    responseSchema?: any;
  };
}

export class APIDevelopmentAgent {
  private prisma: PrismaClient;
  private workspacePath: string;
  private backendPath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
    this.backendPath = path.join(workspacePath, 'packages', 'backend');
    this.prisma = new PrismaClient();
  }

  /**
   * Generate a new API endpoint with all necessary files
   */
  async generateEndpoint(input: GenerateEndpointInput): Promise<GenerationResult> {
    const validated = generateEndpointSchema.parse(input);
    const files: GeneratedFile[] = [];
    
    // Extract resource name from endpoint
    const resourceName = this.extractResourceName(validated.endpoint);
    const controllerName = `${resourceName}Controller`;
    const serviceName = `${resourceName}Service`;
    
    // Generate controller
    const controllerContent = await this.generateController({
      ...validated,
      controllerName,
      serviceName,
      resourceName,
    });
    files.push({
      path: path.join(this.backendPath, 'src', 'controllers', `${controllerName}.ts`),
      content: controllerContent,
      action: 'create',
    });
    
    // Generate service
    const serviceContent = await this.generateService({
      ...validated,
      serviceName,
      resourceName,
    });
    files.push({
      path: path.join(this.backendPath, 'src', 'services', `${serviceName}.ts`),
      content: serviceContent,
      action: 'create',
    });
    
    // Generate validation schemas if provided
    if (validated.validation) {
      const validationContent = this.generateValidationSchemas(validated.validation, resourceName);
      files.push({
        path: path.join(this.backendPath, 'src', 'types', 'validation', `${resourceName}Validation.ts`),
        content: validationContent,
        action: 'create',
      });
    }
    
    // Update or create route file
    const routeContent = await this.generateRoute({
      ...validated,
      controllerName,
      resourceName,
    });
    files.push({
      path: path.join(this.backendPath, 'src', 'routes', `${resourceName}Routes.ts`),
      content: routeContent,
      action: 'create',
    });
    
    // Generate API documentation
    const documentation = this.generateDocumentation(validated);
    
    return {
      files,
      migrations: [], // Will be populated when Database Management Agent is implemented
      documentation,
    };
  }

  /**
   * Extract resource name from endpoint path
   */
  private extractResourceName(endpoint: string): string {
    const segments = endpoint.split('/').filter(Boolean);
    if (segments.length === 0) return 'root';
    
    // Get the first meaningful segment (usually the resource)
    const resource = segments[0];
    
    // Convert to camelCase
    return resource.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * Generate controller code
   */
  private async generateController(params: any): Promise<string> {
    const { method, controllerName, serviceName, resourceName, authentication, description, endpoint, validation } = params;
    
    const templateVars = {
      resourceName,
      methods: [{
        name: `${method.toLowerCase()}${this.capitalize(resourceName)}`,
        description,
        method,
        endpoint,
        auth: authentication,
        params: this.extractParams(endpoint),
        body: method !== 'GET' && method !== 'DELETE',
        statusCode: this.getStatusCode(method),
        serviceMethod: `${method.toLowerCase()}${this.capitalize(resourceName)}`,
        validation: !!validation,
      }],
    };

    return await templateEngine.generate({
      name: 'controller',
      templatePath: path.join(__dirname, '../templates/backend/controller.hbs'),
      outputPath: path.join(this.backendPath, 'src', 'controllers', `${controllerName}.ts`),
      variables: templateVars,
      validationRules: {
        typescript: true,
        eslint: true,
      },
    });
  }

  /**
   * Generate service code
   */
  private async generateService(params: any): Promise<string> {
    const { serviceName, resourceName, modelName, method } = params;
    const usePrisma = !!modelName;
    
    return `import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/winston-adapter';
${params.validation ? `import { ${resourceName}ValidationSchemas } from '../types/validation/${resourceName}Validation';` : ''}

const prisma = new PrismaClient();

export class ${serviceName} {
  /**
   * ${params.description}
   */
  static async ${method.toLowerCase()}${resourceName}(data: any${params.authentication ? ', userId: string' : ''}): Promise<any> {
    try {
      ${usePrisma ? this.generatePrismaOperation(method, modelName) : this.generateBasicOperation(method, resourceName)}
    } catch (error) {
      logger.error('${serviceName}.${method.toLowerCase()}${resourceName} error:', error);
      throw error;
    }
  }
}

export default ${serviceName};
`;
  }

  /**
   * Generate Prisma database operation based on HTTP method
   */
  private generatePrismaOperation(method: string, modelName: string): string {
    const model = modelName.toLowerCase();
    
    switch (method) {
      case 'GET':
        return `
      // Fetch ${model} data
      const result = await prisma.${model}.findMany({
        where: data.params?.id ? { id: data.params.id } : {},
        take: data.query?.limit ? parseInt(data.query.limit) : 100,
        skip: data.query?.offset ? parseInt(data.query.offset) : 0,
      });
      
      return result;`;
      
      case 'POST':
        return `
      // Create new ${model}
      const result = await prisma.${model}.create({
        data: data.body,
      });
      
      return result;`;
      
      case 'PUT':
      case 'PATCH':
        return `
      // Update ${model}
      const result = await prisma.${model}.update({
        where: { id: data.params.id },
        data: data.body,
      });
      
      return result;`;
      
      case 'DELETE':
        return `
      // Delete ${model}
      const result = await prisma.${model}.delete({
        where: { id: data.params.id },
      });
      
      return result;`;
      
      default:
        return '// Implement service logic here\nreturn {};';
    }
  }

  /**
   * Generate basic operation for non-Prisma endpoints
   */
  private generateBasicOperation(method: string, resourceName: string): string {
    return `
      // Implement ${method} logic for ${resourceName}
      // This is a placeholder implementation
      
      return {
        message: '${method} ${resourceName} endpoint',
        timestamp: new Date().toISOString(),
      };`;
  }

  /**
   * Generate Zod validation schemas
   */
  private generateValidationSchemas(validation: any, resourceName: string): string {
    const capitalizedResource = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
    
    return `import { z } from 'zod';

// Request validation schemas for ${resourceName}
export const ${resourceName}ValidationSchemas = {
  ${validation.body ? `
  post: z.object({
    body: z.object(${JSON.stringify(validation.body, null, 2).replace(/"([^"]+)":/g, '$1:')}),
    params: z.object(${JSON.stringify(validation.params || {}, null, 2).replace(/"([^"]+)":/g, '$1:')}),
    query: z.object(${JSON.stringify(validation.query || {}, null, 2).replace(/"([^"]+)":/g, '$1:')}),
  }),
  ` : ''}
  
  ${validation.params ? `
  get: z.object({
    params: z.object(${JSON.stringify(validation.params, null, 2).replace(/"([^"]+)":/g, '$1:')}),
    query: z.object(${JSON.stringify(validation.query || {}, null, 2).replace(/"([^"]+)":/g, '$1:')}),
  }),
  ` : ''}
};

// Response schemas
export type ${capitalizedResource}Response = {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};
`;
  }

  /**
   * Generate route file
   */
  private async generateRoute(params: any): Promise<string> {
    const { endpoint, method, controllerName, resourceName, authentication } = params;
    
    return `import { Router } from 'express';
import ${controllerName} from '../controllers/${controllerName}';
${authentication ? "import { authenticateJWT } from '../middleware/auth';" : ''}

const router = Router();

// ${params.description}
router.${method.toLowerCase()}(
  '${endpoint}',
  ${authentication ? 'authenticateJWT,' : ''}
  ${controllerName}.${method.toLowerCase()}${resourceName}
);

export default router;
`;
  }

  /**
   * Generate API documentation
   */
  private generateDocumentation(input: GenerateEndpointInput): any {
    return {
      endpoint: input.endpoint,
      method: input.method,
      description: input.description,
      authentication: input.authentication,
      requestSchema: input.validation,
      responseSchema: input.response,
    };
  }

  /**
   * Update existing endpoint
   */
  async updateEndpoint(endpoint: string, changes: Partial<GenerateEndpointInput>): Promise<GenerationResult> {
    // This would analyze existing code and apply changes
    // For now, returning a placeholder
    throw new Error('Update endpoint not implemented yet');
  }

  /**
   * Generate API documentation for all endpoints
   */
  async generateAPIDocumentation(format: 'openapi' | 'markdown' = 'openapi'): Promise<string> {
    // This would scan all routes and generate comprehensive documentation
    // For now, returning a placeholder
    throw new Error('API documentation generation not implemented yet');
  }

  // Helper methods
  private extractParams(endpoint: string): string[] {
    const regex = /:([\w]+)/g;
    const params: string[] = [];
    let match;
    while ((match = regex.exec(endpoint)) !== null) {
      params.push(match[1]);
    }
    return params;
  }

  private getStatusCode(method: string): number {
    const statusCodes: Record<string, number> = {
      GET: 200,
      POST: 201,
      PUT: 200,
      PATCH: 200,
      DELETE: 204,
    };
    return statusCodes[method] || 200;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }