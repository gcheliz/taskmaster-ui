import { APIDevelopmentAgent, GenerateEndpointInput } from '../api-development-core';
import { promises as fs } from 'fs';
import path from 'path';

describe('APIDevelopmentAgent', () => {
  let agent: APIDevelopmentAgent;
  const mockWorkspacePath = '/tmp/test-workspace';

  beforeEach(() => {
    agent = new APIDevelopmentAgent(mockWorkspacePath);
  });

  describe('generateEndpoint', () => {
    it('should generate all required files for a basic endpoint', async () => {
      const input: GenerateEndpointInput = {
        endpoint: '/users',
        method: 'GET',
        description: 'Get all users',
        authentication: true,
      };

      const result = await agent.generateEndpoint(input);

      expect(result.files).toHaveLength(4); // controller, service, route, and possibly validation
      expect(result.files.some(f => f.path.includes('usersController.ts'))).toBe(true);
      expect(result.files.some(f => f.path.includes('usersService.ts'))).toBe(true);
      expect(result.files.some(f => f.path.includes('usersRoutes.ts'))).toBe(true);
    });

    it('should generate validation files when validation is provided', async () => {
      const input: GenerateEndpointInput = {
        endpoint: '/users',
        method: 'POST',
        description: 'Create a new user',
        authentication: true,
        validation: {
          body: {
            email: 'z.string().email()',
            name: 'z.string().min(2)',
            password: 'z.string().min(8)',
          },
        },
      };

      const result = await agent.generateEndpoint(input);

      expect(result.files.some(f => f.path.includes('usersValidation.ts'))).toBe(true);
    });

    it('should extract resource name correctly from complex endpoints', () => {
      const testCases = [
        { endpoint: '/users', expected: 'users' },
        { endpoint: '/user-profiles', expected: 'userProfiles' },
        { endpoint: '/api/v1/users', expected: 'api' }, // Note: This might need adjustment
        { endpoint: '/tasks/:id', expected: 'tasks' },
      ];

      testCases.forEach(({ endpoint, expected }) => {
        const resourceName = (agent as any).extractResourceName(endpoint);
        expect(resourceName).toBe(expected);
      });
    });

    it('should generate proper Prisma operations when modelName is provided', async () => {
      const input: GenerateEndpointInput = {
        endpoint: '/tasks',
        method: 'POST',
        description: 'Create a new task',
        authentication: true,
        modelName: 'Task',
        validation: {
          body: {
            title: 'z.string()',
            description: 'z.string().optional()',
          },
        },
      };

      const result = await agent.generateEndpoint(input);
      const serviceFile = result.files.find(f => f.path.includes('Service.ts'));
      
      expect(serviceFile).toBeDefined();
      expect(serviceFile!.content).toContain('prisma.task.create');
    });

    it('should include authentication checks when authentication is true', async () => {
      const input: GenerateEndpointInput = {
        endpoint: '/protected',
        method: 'GET',
        description: 'Protected endpoint',
        authentication: true,
      };

      const result = await agent.generateEndpoint(input);
      const controllerFile = result.files.find(f => f.path.includes('Controller.ts'));
      
      expect(controllerFile).toBeDefined();
      expect(controllerFile!.content).toContain('AuthenticatedRequest');
      expect(controllerFile!.content).toContain('req.user?.userId');
    });

    it('should generate proper error handling', async () => {
      const input: GenerateEndpointInput = {
        endpoint: '/error-test',
        method: 'GET',
        description: 'Test error handling',
        authentication: false,
      };

      const result = await agent.generateEndpoint(input);
      const controllerFile = result.files.find(f => f.path.includes('Controller.ts'));
      
      expect(controllerFile).toBeDefined();
      expect(controllerFile!.content).toContain('try {');
      expect(controllerFile!.content).toContain('catch (error)');
      expect(controllerFile!.content).toContain('logger.error');
    });
  });

  describe('generateDocumentation', () => {
    it('should generate documentation object with all required fields', async () => {
      const input: GenerateEndpointInput = {
        endpoint: '/docs-test',
        method: 'POST',
        description: 'Documentation test endpoint',
        authentication: true,
        validation: {
          body: { test: 'z.string()' },
        },
        response: {
          success: { id: 'string', created: 'date' },
        },
      };

      const result = await agent.generateEndpoint(input);

      expect(result.documentation).toMatchObject({
        endpoint: '/docs-test',
        method: 'POST',
        description: 'Documentation test endpoint',
        authentication: true,
        requestSchema: input.validation,
        responseSchema: input.response,
      });
    });
  });
});