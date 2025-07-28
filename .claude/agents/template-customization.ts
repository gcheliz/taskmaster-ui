import * as fs from 'fs/promises';
import * as path from 'path';
import { z } from 'zod';

// Schema for template customization
export const templateCustomizationSchema = z.object({
  projectName: z.string(),
  overrides: z.object({
    imports: z.object({
      order: z.array(z.string()).optional(),
      customImports: z.record(z.array(z.string())).optional(),
    }).optional(),
    naming: z.object({
      components: z.string().optional(),
      services: z.string().optional(),
      controllers: z.string().optional(),
      interfaces: z.string().optional(),
    }).optional(),
    validation: z.object({
      library: z.enum(['zod', 'joi', 'yup']).optional(),
      strictMode: z.boolean().optional(),
    }).optional(),
    middleware: z.object({
      authentication: z.string().optional(),
      errorHandler: z.string().optional(),
      rateLimit: z.string().optional(),
    }).optional(),
    database: z.object({
      orm: z.enum(['prisma', 'typeorm', 'sequelize']).optional(),
      seedStrategy: z.enum(['faker', 'fixture', 'manual']).optional(),
    }).optional(),
    testing: z.object({
      framework: z.enum(['jest', 'vitest', 'mocha']).optional(),
      coverage: z.number().min(0).max(100).optional(),
    }).optional(),
  }),
  templates: z.object({
    custom: z.record(z.string()).optional(), // Custom template paths
    disabled: z.array(z.string()).optional(), // Templates to disable
  }).optional(),
});

export type TemplateCustomization = z.infer<typeof templateCustomizationSchema>;

export class TemplateCustomizationManager {
  private customizationsPath: string;
  private cache: Map<string, TemplateCustomization> = new Map();

  constructor(workspacePath: string) {
    this.customizationsPath = path.join(workspacePath, '.claude', 'template-customizations.json');
  }

  /**
   * Load project-specific customizations
   */
  async loadCustomizations(projectName?: string): Promise<TemplateCustomization | null> {
    try {
      // Check cache first
      if (projectName && this.cache.has(projectName)) {
        return this.cache.get(projectName)!;
      }

      // Load from file
      const content = await fs.readFile(this.customizationsPath, 'utf-8');
      const allCustomizations = JSON.parse(content);

      if (projectName) {
        const customization = allCustomizations[projectName];
        if (customization) {
          const validated = templateCustomizationSchema.parse(customization);
          this.cache.set(projectName, validated);
          return validated;
        }
      }

      // Return default customization
      return allCustomizations.default || null;
    } catch (error) {
      // File doesn't exist or is invalid
      return null;
    }
  }

  /**
   * Save project customizations
   */
  async saveCustomization(customization: TemplateCustomization): Promise<void> {
    const validated = templateCustomizationSchema.parse(customization);

    // Ensure directory exists
    await fs.mkdir(path.dirname(this.customizationsPath), { recursive: true });

    // Load existing customizations
    let allCustomizations: Record<string, any> = {};
    try {
      const content = await fs.readFile(this.customizationsPath, 'utf-8');
      allCustomizations = JSON.parse(content);
    } catch (error) {
      // File doesn't exist yet
    }

    // Update with new customization
    allCustomizations[validated.projectName] = validated;

    // Save to file
    await fs.writeFile(
      this.customizationsPath,
      JSON.stringify(allCustomizations, null, 2),
      'utf-8'
    );

    // Update cache
    this.cache.set(validated.projectName, validated);
  }

  /**
   * Apply customizations to template variables
   */
  applyCustomizations(
    templateVars: Record<string, any>,
    customization: TemplateCustomization
  ): Record<string, any> {
    const customized = { ...templateVars };

    // Apply naming overrides
    if (customization.overrides?.naming) {
      customized.namingConventions = {
        ...customized.namingConventions,
        ...customization.overrides.naming,
      };
    }

    // Apply import overrides
    if (customization.overrides?.imports) {
      if (customization.overrides.imports.order) {
        customized.importOrder = customization.overrides.imports.order;
      }
      if (customization.overrides.imports.customImports) {
        customized.customImports = customization.overrides.imports.customImports;
      }
    }

    // Apply validation overrides
    if (customization.overrides?.validation) {
      customized.validation = {
        ...customized.validation,
        ...customization.overrides.validation,
      };
    }

    // Apply middleware overrides
    if (customization.overrides?.middleware) {
      customized.middleware = {
        ...customized.middleware,
        ...customization.overrides.middleware,
      };
    }

    // Apply database overrides
    if (customization.overrides?.database) {
      customized.database = {
        ...customized.database,
        ...customization.overrides.database,
      };
    }

    // Apply testing overrides
    if (customization.overrides?.testing) {
      customized.testing = {
        ...customized.testing,
        ...customization.overrides.testing,
      };
    }

    return customized;
  }

  /**
   * Get custom template path if defined
   */
  getCustomTemplatePath(
    templateName: string,
    customization: TemplateCustomization
  ): string | null {
    if (customization.templates?.custom?.[templateName]) {
      return customization.templates.custom[templateName];
    }
    return null;
  }

  /**
   * Check if template is disabled
   */
  isTemplateDisabled(
    templateName: string,
    customization: TemplateCustomization
  ): boolean {
    return customization.templates?.disabled?.includes(templateName) || false;
  }

  /**
   * Generate example customization file
   */
  async generateExampleCustomization(): Promise<void> {
    const example: Record<string, TemplateCustomization> = {
      default: {
        projectName: 'default',
        overrides: {
          imports: {
            order: ['node', 'external', 'internal', 'parent', 'sibling', 'index'],
          },
          naming: {
            components: 'PascalCase',
            services: 'PascalCase',
            controllers: 'PascalCase',
            interfaces: 'IPascalCase',
          },
          validation: {
            library: 'zod',
            strictMode: true,
          },
          middleware: {
            authentication: 'authenticateJWT',
            errorHandler: 'errorHandler',
            rateLimit: 'rateLimiter',
          },
          database: {
            orm: 'prisma',
            seedStrategy: 'faker',
          },
          testing: {
            framework: 'jest',
            coverage: 80,
          },
        },
      },
      'taskmaster-ui': {
        projectName: 'taskmaster-ui',
        overrides: {
          imports: {
            order: ['node', 'external', '@taskmaster', 'internal', 'parent', 'sibling', 'index'],
            customImports: {
              '@taskmaster': ['@taskmaster/shared', '@taskmaster/types'],
            },
          },
          validation: {
            library: 'zod',
            strictMode: true,
          },
          testing: {
            framework: 'vitest',
            coverage: 80,
          },
        },
        templates: {
          custom: {
            'api-controller': './.claude/custom-templates/api-controller.hbs',
          },
        },
      },
    };

    await fs.mkdir(path.dirname(this.customizationsPath), { recursive: true });
    await fs.writeFile(
      this.customizationsPath,
      JSON.stringify(example, null, 2),
      'utf-8'
    );
  }

  /**
   * Validate template output against project rules
   */
  async validateTemplateOutput(
    content: string,
    fileType: string,
    customization: TemplateCustomization
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check naming conventions
    if (fileType === 'controller' && customization.overrides?.naming?.controllers) {
      const convention = customization.overrides.naming.controllers;
      const classRegex = /class\s+(\w+)/g;
      let match;
      while ((match = classRegex.exec(content)) !== null) {
        const className = match[1];
        if (!this.matchesNamingConvention(className, convention)) {
          errors.push(`Class name '${className}' does not match ${convention} convention`);
        }
      }
    }

    // Check import order
    if (customization.overrides?.imports?.order) {
      const importErrors = this.validateImportOrder(content, customization.overrides.imports.order);
      errors.push(...importErrors);
    }

    // Check validation library usage
    if (customization.overrides?.validation?.library) {
      const expectedLib = customization.overrides.validation.library;
      const hasCorrectLib = content.includes(`from '${expectedLib}'`);
      if (!hasCorrectLib && content.includes('validation')) {
        errors.push(`Expected to use ${expectedLib} for validation`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private matchesNamingConvention(name: string, convention: string): boolean {
    switch (convention) {
      case 'PascalCase':
        return /^[A-Z][a-zA-Z0-9]*$/.test(name);
      case 'camelCase':
        return /^[a-z][a-zA-Z0-9]*$/.test(name);
      case 'IPascalCase':
        return /^I[A-Z][a-zA-Z0-9]*$/.test(name);
      case 'UPPER_SNAKE_CASE':
        return /^[A-Z_]+$/.test(name);
      default:
        return true;
    }
  }

  private validateImportOrder(content: string, expectedOrder: string[]): string[] {
    const errors: string[] = [];
    const importRegex = /import.*from\s+['"]([^'"]+)['"]/g;
    const imports: { line: string; type: string; lineNum: number }[] = [];
    
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const match = importRegex.exec(line);
      if (match) {
        const importPath = match[1];
        const type = this.getImportType(importPath);
        imports.push({ line, type, lineNum: index + 1 });
      }
    });

    // Check order
    let lastTypeIndex = -1;
    imports.forEach((imp) => {
      const currentTypeIndex = expectedOrder.indexOf(imp.type);
      if (currentTypeIndex < lastTypeIndex) {
        errors.push(
          `Import order violation at line ${imp.lineNum}: ${imp.type} imports should come before ${expectedOrder[lastTypeIndex]} imports`
        );
      }
      lastTypeIndex = Math.max(lastTypeIndex, currentTypeIndex);
    });

    return errors;
  }

  private getImportType(importPath: string): string {
    if (importPath.startsWith('node:') || !importPath.includes('/')) {
      return 'node';
    } else if (importPath.startsWith('@taskmaster')) {
      return '@taskmaster';
    } else if (importPath.startsWith('@') || importPath.includes('node_modules')) {
      return 'external';
    } else if (importPath.startsWith('../')) {
      return 'parent';
    } else if (importPath.startsWith('./')) {
      return 'sibling';
    } else {
      return 'internal';
    }
  }
}

export const templateCustomization = new TemplateCustomizationManager(process.cwd());