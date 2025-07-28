/**
 * OpenAPI/Swagger Specification Generator Plugin
 * 
 * Generates OpenAPI 3.0 specifications from Express routes and API documentation
 */

import * as ts from 'typescript';
import * as path from 'path';
import {
  DocumentationPlugin,
  DocumentationType,
  PluginContext,
  DocumentationItem
} from '../core-engine';

export interface OpenAPISpec {
  openapi: string;
  info: OpenAPIInfo;
  servers?: OpenAPIServer[];
  paths: Record<string, Record<string, OpenAPIOperation>>;
  components?: OpenAPIComponents;
  security?: OpenAPISecurityRequirement[];
  tags?: OpenAPITag[];
}

export interface OpenAPIInfo {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: OpenAPIContact;
  license?: OpenAPILicense;
}

export interface OpenAPIContact {
  name?: string;
  url?: string;
  email?: string;
}

export interface OpenAPILicense {
  name: string;
  url?: string;
}

export interface OpenAPIServer {
  url: string;
  description?: string;
  variables?: Record<string, OpenAPIServerVariable>;
}

export interface OpenAPIServerVariable {
  enum?: string[];
  default: string;
  description?: string;
}

export interface OpenAPIOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses: Record<string, OpenAPIResponse>;
  callbacks?: Record<string, any>;
  deprecated?: boolean;
  security?: OpenAPISecurityRequirement[];
}

export interface OpenAPIParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  schema: OpenAPISchema;
  example?: any;
  examples?: Record<string, OpenAPIExample>;
}

export interface OpenAPIRequestBody {
  description?: string;
  content: Record<string, OpenAPIMediaType>;
  required?: boolean;
}

export interface OpenAPIResponse {
  description: string;
  headers?: Record<string, OpenAPIHeader>;
  content?: Record<string, OpenAPIMediaType>;
  links?: Record<string, any>;
}

export interface OpenAPIMediaType {
  schema: OpenAPISchema;
  example?: any;
  examples?: Record<string, OpenAPIExample>;
  encoding?: Record<string, any>;
}

export interface OpenAPISchema {
  type?: string;
  format?: string;
  title?: string;
  description?: string;
  default?: any;
  example?: any;
  enum?: any[];
  properties?: Record<string, OpenAPISchema>;
  additionalProperties?: boolean | OpenAPISchema;
  required?: string[];
  items?: OpenAPISchema;
  allOf?: OpenAPISchema[];
  oneOf?: OpenAPISchema[];
  anyOf?: OpenAPISchema[];
  not?: OpenAPISchema;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: boolean;
  $ref?: string;
}

export interface OpenAPIExample {
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: string;
}

export interface OpenAPIHeader {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  schema: OpenAPISchema;
}

export interface OpenAPIComponents {
  schemas?: Record<string, OpenAPISchema>;
  responses?: Record<string, OpenAPIResponse>;
  parameters?: Record<string, OpenAPIParameter>;
  examples?: Record<string, OpenAPIExample>;
  requestBodies?: Record<string, OpenAPIRequestBody>;
  headers?: Record<string, OpenAPIHeader>;
  securitySchemes?: Record<string, OpenAPISecurityScheme>;
  links?: Record<string, any>;
  callbacks?: Record<string, any>;
}

export interface OpenAPISecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  description?: string;
  name?: string;
  in?: 'query' | 'header' | 'cookie';
  scheme?: string;
  bearerFormat?: string;
  flows?: any;
  openIdConnectUrl?: string;
}

export interface OpenAPISecurityRequirement {
  [name: string]: string[];
}

export interface OpenAPITag {
  name: string;
  description?: string;
  externalDocs?: {
    description?: string;
    url: string;
  };
}

interface RouteInfo {
  method: string;
  path: string;
  handler: string;
  middleware?: string[];
  controller?: string;
  action?: string;
  file: string;
  line: number;
}

interface ApiEndpoint {
  route: RouteInfo;
  documentation?: any;
  parameters?: any[];
  requestBody?: any;
  responses?: any;
  security?: any[];
}

export class OpenAPIGeneratorPlugin implements DocumentationPlugin {
  name = 'openapi-generator';
  type = DocumentationType.API;
  description = 'Generates OpenAPI 3.0 specifications from Express routes and documentation';

  private routes: RouteInfo[] = [];
  private endpoints: Map<string, ApiEndpoint> = new Map();
  private schemas: Map<string, OpenAPISchema> = new Map();

  async generate(context: PluginContext): Promise<DocumentationItem[]> {
    // Clear previous data
    this.routes = [];
    this.endpoints.clear();
    this.schemas.clear();

    // Extract routes and API documentation
    await this.extractRoutes(context);
    await this.extractApiDocumentation(context);
    
    // Generate OpenAPI specification
    const spec = this.generateOpenAPISpec(context);
    
    // Create documentation item
    const specItem: DocumentationItem = {
      id: 'openapi-spec',
      name: 'OpenAPI Specification',
      type: 'openapi',
      category: 'API Documentation',
      description: 'OpenAPI 3.0 specification for the API',
      tags: ['api', 'openapi', 'swagger'],
      metadata: {
        spec,
        format: 'openapi-3.0',
        version: context.config.version
      }
    };

    // Create endpoint documentation items
    const endpointItems = this.createEndpointDocumentation();

    return [specItem, ...endpointItems];
  }

  /**
   * Extract Express routes from the codebase
   */
  private async extractRoutes(context: PluginContext): Promise<void> {
    for (const [filePath, sourceFile] of context.astCache) {
      if (this.isRouteFile(filePath)) {
        this.extractRoutesFromFile(sourceFile, filePath);
      }
    }
  }

  /**
   * Check if file is likely to contain routes
   */
  private isRouteFile(filePath: string): boolean {
    const routePatterns = [
      /routes?\//i,
      /\.routes?\./i,
      /router/i,
      /api\//i,
      /controllers?\//i
    ];
    
    return routePatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * Extract routes from a single file
   */
  private extractRoutesFromFile(sourceFile: ts.SourceFile, filePath: string): void {
    const visit = (node: ts.Node) => {
      // Look for router method calls (get, post, put, delete, etc.)
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
        const methodName = node.expression.name.text;
        const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'all', 'use'];
        
        if (httpMethods.includes(methodName)) {
          const routeInfo = this.extractRouteInfo(node, methodName, filePath, sourceFile);
          if (routeInfo) {
            this.routes.push(routeInfo);
          }
        }
      }
      
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
  }

  /**
   * Extract route information from a router method call
   */
  private extractRouteInfo(
    node: ts.CallExpression,
    method: string,
    filePath: string,
    sourceFile: ts.SourceFile
  ): RouteInfo | null {
    const args = node.arguments;
    if (args.length < 2) return null;
    
    // Extract path
    const pathArg = args[0];
    let routePath = '';
    
    if (ts.isStringLiteral(pathArg)) {
      routePath = pathArg.text;
    } else if (ts.isTemplateExpression(pathArg)) {
      // Handle template literals
      routePath = this.extractTemplateLiteral(pathArg);
    } else {
      return null;
    }
    
    // Extract handler and middleware
    const handlers: string[] = [];
    const middleware: string[] = [];
    
    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      const handlerName = this.extractHandlerName(arg);
      
      if (handlerName) {
        if (i === args.length - 1) {
          handlers.push(handlerName);
        } else {
          middleware.push(handlerName);
        }
      }
    }
    
    if (handlers.length === 0) return null;
    
    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    
    return {
      method: method === 'all' || method === 'use' ? '*' : method.toUpperCase(),
      path: routePath,
      handler: handlers[0],
      middleware: middleware.length > 0 ? middleware : undefined,
      file: filePath,
      line: line + 1
    };
  }

  /**
   * Extract template literal value
   */
  private extractTemplateLiteral(node: ts.TemplateExpression): string {
    let result = node.head.text;
    
    for (const span of node.templateSpans) {
      // Use placeholder for expressions
      result += '${...}';
      if (ts.isTemplateMiddle(span.literal) || ts.isTemplateTail(span.literal)) {
        result += span.literal.text;
      }
    }
    
    return result;
  }

  /**
   * Extract handler name from argument
   */
  private extractHandlerName(arg: ts.Expression): string | null {
    if (ts.isIdentifier(arg)) {
      return arg.text;
    } else if (ts.isPropertyAccessExpression(arg)) {
      return arg.getText();
    } else if (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg)) {
      return '<anonymous>';
    }
    
    return null;
  }

  /**
   * Extract API documentation from controllers and handlers
   */
  private async extractApiDocumentation(context: PluginContext): Promise<void> {
    for (const route of this.routes) {
      const endpoint: ApiEndpoint = {
        route,
        documentation: {}
      };
      
      // Try to find controller method documentation
      const controllerDoc = await this.findControllerDocumentation(route, context);
      if (controllerDoc) {
        endpoint.documentation = controllerDoc.documentation;
        endpoint.parameters = controllerDoc.parameters;
        endpoint.requestBody = controllerDoc.requestBody;
        endpoint.responses = controllerDoc.responses;
        endpoint.security = controllerDoc.security;
      }
      
      // Generate unique key for endpoint
      const key = `${route.method} ${route.path}`;
      this.endpoints.set(key, endpoint);
    }
  }

  /**
   * Find controller documentation
   */
  private async findControllerDocumentation(
    route: RouteInfo,
    context: PluginContext
  ): Promise<any> {
    // This is simplified - in a real implementation, you would:
    // 1. Parse the handler name to find the controller and method
    // 2. Look up the controller file in the AST cache
    // 3. Extract JSDoc comments from the method
    // 4. Parse @swagger or @api annotations
    
    // For now, return mock documentation based on route
    return this.generateMockDocumentation(route);
  }

  /**
   * Generate mock documentation for demo
   */
  private generateMockDocumentation(route: RouteInfo): any {
    const doc: any = {
      documentation: {},
      parameters: [],
      responses: {}
    };
    
    // Extract path parameters
    const pathParams = route.path.match(/:(\w+)/g);
    if (pathParams) {
      doc.parameters = pathParams.map(param => ({
        name: param.substring(1),
        in: 'path',
        required: true,
        schema: { type: 'string' }
      }));
    }
    
    // Generate default responses
    doc.responses = {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: { type: 'object' }
              }
            }
          }
        }
      },
      '400': {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      '401': {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      '500': {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      }
    };
    
    // Add request body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(route.method)) {
      doc.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {}
            }
          }
        }
      };
    }
    
    // Add common query parameters
    if (route.method === 'GET' && route.path.includes('/')) {
      doc.parameters.push(
        {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          schema: { type: 'integer', default: 1 }
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          schema: { type: 'integer', default: 20 }
        }
      );
    }
    
    return doc;
  }

  /**
   * Generate OpenAPI specification
   */
  private generateOpenAPISpec(context: PluginContext): OpenAPISpec {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: {
        title: context.config.title || 'API Documentation',
        version: context.config.version || '1.0.0',
        description: context.config.description
      },
      servers: this.generateServers(),
      paths: this.generatePaths(),
      components: this.generateComponents(),
      tags: this.generateTags()
    };
    
    // Add security if configured
    const security = this.generateSecurity();
    if (security.length > 0) {
      spec.security = security;
    }
    
    return spec;
  }

  /**
   * Generate server configuration
   */
  private generateServers(): OpenAPIServer[] {
    return [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.example.com',
        description: 'Production server'
      }
    ];
  }

  /**
   * Generate paths section
   */
  private generatePaths(): Record<string, Record<string, OpenAPIOperation>> {
    const paths: Record<string, Record<string, OpenAPIOperation>> = {};
    
    for (const [key, endpoint] of this.endpoints) {
      const [method, path] = key.split(' ');
      const openApiPath = this.convertToOpenAPIPath(path);
      
      if (!paths[openApiPath]) {
        paths[openApiPath] = {};
      }
      
      const operation: OpenAPIOperation = {
        operationId: this.generateOperationId(method, path),
        summary: this.generateSummary(endpoint),
        description: endpoint.documentation?.description,
        tags: this.getEndpointTags(endpoint),
        responses: this.convertResponses(endpoint.responses || {})
      };
      
      if (endpoint.parameters && endpoint.parameters.length > 0) {
        operation.parameters = endpoint.parameters;
      }
      
      if (endpoint.requestBody) {
        operation.requestBody = endpoint.requestBody;
      }
      
      if (endpoint.security) {
        operation.security = endpoint.security;
      }
      
      if (endpoint.documentation?.deprecated) {
        operation.deprecated = true;
      }
      
      paths[openApiPath][method.toLowerCase()] = operation;
    }
    
    return paths;
  }

  /**
   * Convert Express path to OpenAPI path
   */
  private convertToOpenAPIPath(path: string): string {
    // Convert :param to {param}
    return path.replace(/:(\w+)/g, '{$1}');
  }

  /**
   * Generate operation ID
   */
  private generateOperationId(method: string, path: string): string {
    const parts = path.split('/').filter(Boolean);
    const pathParts = parts.map(part => {
      if (part.startsWith(':')) {
        return 'By' + this.capitalize(part.substring(1));
      }
      return this.capitalize(part);
    });
    
    return method.toLowerCase() + pathParts.join('');
  }

  /**
   * Generate summary from endpoint
   */
  private generateSummary(endpoint: ApiEndpoint): string {
    if (endpoint.documentation?.summary) {
      return endpoint.documentation.summary;
    }
    
    const { method, path } = endpoint.route;
    const resource = this.extractResourceName(path);
    
    switch (method) {
      case 'GET':
        return path.includes(':') ? `Get ${resource} by ID` : `List ${resource}`;
      case 'POST':
        return `Create new ${resource}`;
      case 'PUT':
        return `Update ${resource}`;
      case 'PATCH':
        return `Partially update ${resource}`;
      case 'DELETE':
        return `Delete ${resource}`;
      default:
        return `${method} ${resource}`;
    }
  }

  /**
   * Extract resource name from path
   */
  private extractResourceName(path: string): string {
    const parts = path.split('/').filter(Boolean);
    if (parts.length > 0) {
      const resource = parts[parts.length - 1];
      if (resource.startsWith(':')) {
        return parts.length > 1 ? parts[parts.length - 2] : 'resource';
      }
      return resource;
    }
    return 'resource';
  }

  /**
   * Get endpoint tags
   */
  private getEndpointTags(endpoint: ApiEndpoint): string[] {
    if (endpoint.documentation?.tags) {
      return endpoint.documentation.tags;
    }
    
    // Extract tag from path
    const parts = endpoint.route.path.split('/').filter(Boolean);
    if (parts.length > 0) {
      return [this.capitalize(parts[0])];
    }
    
    return ['Default'];
  }

  /**
   * Convert responses to OpenAPI format
   */
  private convertResponses(responses: any): Record<string, OpenAPIResponse> {
    if (Object.keys(responses).length === 0) {
      return {
        '200': {
          description: 'Successful response'
        }
      };
    }
    
    const openApiResponses: Record<string, OpenAPIResponse> = {};
    
    for (const [code, response] of Object.entries(responses)) {
      openApiResponses[code] = response as OpenAPIResponse;
    }
    
    return openApiResponses;
  }

  /**
   * Generate components section
   */
  private generateComponents(): OpenAPIComponents {
    return {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'object' }
              },
              required: ['code', 'message']
            }
          },
          required: ['error']
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' }
          },
          required: ['page', 'limit', 'total', 'totalPages']
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key authorization'
        }
      }
    };
  }

  /**
   * Generate tags
   */
  private generateTags(): OpenAPITag[] {
    const tagSet = new Set<string>();
    
    // Collect all unique tags
    for (const endpoint of this.endpoints.values()) {
      const tags = this.getEndpointTags(endpoint);
      tags.forEach(tag => tagSet.add(tag));
    }
    
    // Convert to OpenAPI tags
    return Array.from(tagSet).map(tag => ({
      name: tag,
      description: `${tag} operations`
    }));
  }

  /**
   * Generate security requirements
   */
  private generateSecurity(): OpenAPISecurityRequirement[] {
    return [
      { bearerAuth: [] }
    ];
  }

  /**
   * Create endpoint documentation items
   */
  private createEndpointDocumentation(): DocumentationItem[] {
    const items: DocumentationItem[] = [];
    
    for (const [key, endpoint] of this.endpoints) {
      const [method, path] = key.split(' ');
      
      const item: DocumentationItem = {
        id: `endpoint-${this.generateOperationId(method, path)}`,
        name: `${method} ${path}`,
        type: 'endpoint',
        category: this.getEndpointTags(endpoint)[0] || 'API Endpoints',
        description: this.generateSummary(endpoint),
        source: {
          file: endpoint.route.file,
          line: endpoint.route.line
        },
        tags: ['api', 'endpoint', method.toLowerCase(), ...this.getEndpointTags(endpoint)],
        metadata: {
          method,
          path,
          handler: endpoint.route.handler,
          middleware: endpoint.route.middleware,
          parameters: endpoint.parameters,
          requestBody: endpoint.requestBody,
          responses: endpoint.responses,
          security: endpoint.security
        }
      };
      
      items.push(item);
    }
    
    return items;
  }

  /**
   * Capitalize string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Export singleton instance
export const openAPIGeneratorPlugin = new OpenAPIGeneratorPlugin();