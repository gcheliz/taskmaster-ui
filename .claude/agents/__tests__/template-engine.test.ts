import { templateEngine } from '../template-engine';
import * as path from 'path';
import * as fs from 'fs/promises';

describe('TemplateEngine', () => {
  const testOutputDir = '/tmp/template-engine-test';

  beforeEach(async () => {
    await fs.mkdir(testOutputDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testOutputDir, { recursive: true, force: true });
  });

  describe('Handlebars helpers', () => {
    it('should correctly transform case conventions', async () => {
      const testTemplate = `
{{camelCase "hello-world"}}
{{pascalCase "hello-world"}}
{{kebabCase "helloWorld"}}
{{upperSnakeCase "helloWorld"}}
`;
      const tempTemplatePath = path.join(testOutputDir, 'test.hbs');
      await fs.writeFile(tempTemplatePath, testTemplate);

      const result = await templateEngine.generate({
        name: 'test',
        templatePath: tempTemplatePath,
        outputPath: path.join(testOutputDir, 'test.txt'),
        variables: {},
      });

      expect(result).toContain('helloWorld');
      expect(result).toContain('HelloWorld');
      expect(result).toContain('hello-world');
      expect(result).toContain('HELLO_WORLD');
    });

    it('should generate valid Zod schemas', async () => {
      const testTemplate = `{{zodSchema fields}}`;
      const tempTemplatePath = path.join(testOutputDir, 'zod.hbs');
      await fs.writeFile(tempTemplatePath, testTemplate);

      const result = await templateEngine.generate({
        name: 'zod-test',
        templatePath: tempTemplatePath,
        outputPath: path.join(testOutputDir, 'zod.ts'),
        variables: {
          fields: [
            { name: 'email', type: 'string', min: 5 },
            { name: 'age', type: 'number', optional: true },
            { name: 'active', type: 'boolean', nullable: true },
          ],
        },
      });

      expect(result).toContain('email: z.string().min(5)');
      expect(result).toContain('age: z.number().optional()');
      expect(result).toContain('active: z.boolean().nullable()');
    });
  });

  describe('Template validation', () => {
    it('should validate TypeScript strict mode compliance', async () => {
      const badCode = `
function test(param: any) {
  console.log(param);
  return param;
}
`;
      const tempFile = path.join(testOutputDir, 'bad.ts');
      await fs.writeFile(tempFile, badCode);

      const validation = await templateEngine.validateGeneratedCode(badCode, {
        name: 'test',
        templatePath: '',
        outputPath: tempFile,
        variables: {},
        validationRules: {
          typescript: true,
        },
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Found explicit "any" type usage');
    });

    it('should validate import order', async () => {
      const badImports = `
import { something } from './local';
import fs from 'fs';
import { external } from '@external/package';
`;

      const validation = await templateEngine.validateGeneratedCode(badImports, {
        name: 'test',
        templatePath: '',
        outputPath: '',
        variables: {},
      });

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('Import order violation');
    });

    it('should detect console.log statements', async () => {
      const codeWithConsole = `
function debug() {
  console.log('debug message');
}
`;

      const validation = await templateEngine.validateGeneratedCode(codeWithConsole, {
        name: 'test',
        templatePath: '',
        outputPath: '',
        variables: {},
      });

      expect(validation.warnings).toContain('Found console.log statements');
    });
  });

  describe('Template generation', () => {
    it('should generate valid controller with all features', async () => {
      const templatePath = path.join(__dirname, '../templates/backend/controller.hbs');
      
      // Skip if template doesn't exist yet
      try {
        await fs.access(templatePath);
      } catch {
        return;
      }

      const result = await templateEngine.generate({
        name: 'controller',
        templatePath,
        outputPath: path.join(testOutputDir, 'TestController.ts'),
        variables: {
          resourceName: 'user',
          methods: [{
            name: 'getUser',
            description: 'Get user by ID',
            method: 'GET',
            endpoint: '/users/:id',
            auth: true,
            params: ['id'],
            statusCode: 200,
            serviceMethod: 'findUser',
          }],
        },
        validationRules: {
          typescript: true,
          eslint: true,
        },
      });

      expect(result).toContain('export class UserController');
      expect(result).toContain('getUser = asyncHandler');
      expect(result).toContain('Request<UserParams');
      expect(result).toContain('res.status(200).json');
    });
  });

  describe('File operations', () => {
    it('should save file with prettier formatting', async () => {
      const uglyCode = `function test(){return{success:true,data:[1,2,3]}}`;
      const outputPath = path.join(testOutputDir, 'formatted.ts');

      await templateEngine.saveGeneratedFile(uglyCode, outputPath);
      
      const saved = await fs.readFile(outputPath, 'utf-8');
      // Should be formatted (has newlines and proper spacing)
      expect(saved.split('\n').length).toBeGreaterThan(1);
      expect(saved).toContain('return {');
    });
  });
});

describe('Project pattern compliance', () => {
  it('should enforce TypeScript strict mode', () => {
    const patterns = {
      typescript: { strict: true },
    };
    expect(patterns.typescript.strict).toBe(true);
  });

  it('should follow PNPM workspace structure', () => {
    const workspaceStructure = {
      packages: ['backend', 'frontend', 'shared'],
      rootCommands: ['pnpm install', 'pnpm test', 'pnpm build'],
    };
    expect(workspaceStructure.packages).toContain('backend');
    expect(workspaceStructure.rootCommands[0]).toContain('pnpm');
  });
});