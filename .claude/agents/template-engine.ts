import * as Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface TemplateConfig {
  name: string;
  templatePath: string;
  outputPath: string;
  variables: Record<string, any>;
  validationRules?: {
    eslint?: boolean;
    typescript?: boolean;
    prettier?: boolean;
  };
  overrides?: {
    imports?: string[];
    exports?: string[];
    customSections?: Record<string, string>;
  };
}

export interface TemplateValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class TemplateEngine {
  private handlebars: typeof Handlebars;
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();
  private projectConfig: ProjectConfig;

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerHelpers();
    this.loadProjectConfig();
  }

  private loadProjectConfig(): void {
    this.projectConfig = {
      typescript: {
        strict: true,
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
      },
      eslint: {
        extends: ['@taskmaster/eslint-config'],
        rules: {
          '@typescript-eslint/explicit-function-return-type': 'error',
          '@typescript-eslint/no-explicit-any': 'error',
          'no-console': ['warn', { allow: ['warn', 'error'] }],
        },
      },
      prettier: {
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
      },
      patterns: {
        imports: {
          order: ['node', 'external', 'internal', 'parent', 'sibling', 'index'],
          newlinesBetween: 'always',
        },
        exports: {
          namedFirst: true,
          defaultLast: true,
        },
        naming: {
          components: 'PascalCase',
          hooks: 'camelCase',
          constants: 'UPPER_SNAKE_CASE',
          types: 'PascalCase',
          interfaces: 'IPascalCase',
        },
      },
    };
  }

  private registerHelpers(): void {
    // Case transformation helpers
    this.handlebars.registerHelper('camelCase', (str: string) => {
      return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    });

    this.handlebars.registerHelper('pascalCase', (str: string) => {
      const camel = str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      return camel.charAt(0).toUpperCase() + camel.slice(1);
    });

    this.handlebars.registerHelper('kebabCase', (str: string) => {
      return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    });

    this.handlebars.registerHelper('upperSnakeCase', (str: string) => {
      return str.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
    });

    // Type helpers
    this.handlebars.registerHelper('tsType', (type: string) => {
      const typeMap: Record<string, string> = {
        string: 'string',
        number: 'number',
        boolean: 'boolean',
        date: 'Date',
        array: 'any[]',
        object: 'Record<string, any>',
      };
      return typeMap[type.toLowerCase()] || 'any';
    });

    // Import organization helper
    this.handlebars.registerHelper('organizeImports', (imports: string[]) => {
      const organized = {
        node: [] as string[],
        external: [] as string[],
        internal: [] as string[],
      };

      imports.forEach((imp) => {
        if (imp.startsWith('node:') || !imp.includes('/')) {
          organized.node.push(imp);
        } else if (imp.startsWith('@') || imp.includes('node_modules')) {
          organized.external.push(imp);
        } else {
          organized.internal.push(imp);
        }
      });

      const sections = [];
      if (organized.node.length) sections.push(organized.node.join('\n'));
      if (organized.external.length) sections.push(organized.external.join('\n'));
      if (organized.internal.length) sections.push(organized.internal.join('\n'));

      return sections.join('\n\n');
    });

    // Validation helper
    this.handlebars.registerHelper('zodSchema', (fields: any[]) => {
      const schemaFields = fields.map((field) => {
        let zodType = `z.${field.type}()`;
        if (field.optional) zodType += '.optional()';
        if (field.nullable) zodType += '.nullable()';
        if (field.min) zodType += `.min(${field.min})`;
        if (field.max) zodType += `.max(${field.max})`;
        return `  ${field.name}: ${zodType},`;
      });
      return `z.object({\n${schemaFields.join('\n')}\n})`;
    });
  }

  async loadTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate> {
    if (this.templateCache.has(templatePath)) {
      return this.templateCache.get(templatePath)!;
    }

    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const compiled = this.handlebars.compile(templateContent);
    this.templateCache.set(templatePath, compiled);
    return compiled;
  }

  async generate(config: TemplateConfig): Promise<string> {
    const template = await this.loadTemplate(config.templatePath);
    
    // Merge project patterns with template variables
    const context = {
      ...config.variables,
      project: this.projectConfig,
      overrides: config.overrides,
    };

    // Generate content
    let content = template(context);

    // Apply overrides
    if (config.overrides) {
      content = this.applyOverrides(content, config.overrides);
    }

    // Validate if requested
    if (config.validationRules) {
      const validation = await this.validateGeneratedCode(content, config);
      if (!validation.valid) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }
    }

    return content;
  }

  private applyOverrides(content: string, overrides: TemplateConfig['overrides']): string {
    let modified = content;

    // Add custom imports
    if (overrides?.imports) {
      const importSection = overrides.imports
        .map((imp) => `import ${imp};`)
        .join('\n');
      modified = importSection + '\n\n' + modified;
    }

    // Add custom exports
    if (overrides?.exports) {
      const exportSection = '\n\n' + overrides.exports
        .map((exp) => `export ${exp};`)
        .join('\n');
      modified += exportSection;
    }

    // Insert custom sections
    if (overrides?.customSections) {
      Object.entries(overrides.customSections).forEach(([marker, content]) => {
        modified = modified.replace(`{{${marker}}}`, content);
      });
    }

    return modified;
  }

  async validateGeneratedCode(
    code: string,
    config: TemplateConfig
  ): Promise<TemplateValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Save temporary file for validation
    const tempFile = path.join('/tmp', `validate-${Date.now()}.ts`);
    await fs.writeFile(tempFile, code);

    try {
      // TypeScript validation
      if (config.validationRules?.typescript) {
        try {
          await execAsync(`pnpm tsc --noEmit --strict ${tempFile}`);
        } catch (error: any) {
          errors.push(`TypeScript errors: ${error.message}`);
        }
      }

      // ESLint validation
      if (config.validationRules?.eslint) {
        try {
          await execAsync(`pnpm eslint ${tempFile}`);
        } catch (error: any) {
          const output = error.stdout || error.message;
          if (output.includes('error')) {
            errors.push(`ESLint errors found`);
          } else {
            warnings.push(`ESLint warnings found`);
          }
        }
      }

      // Prettier validation
      if (config.validationRules?.prettier) {
        try {
          await execAsync(`pnpm prettier --check ${tempFile}`);
        } catch (error: any) {
          warnings.push('Code formatting issues detected');
        }
      }

      // Pattern validation
      this.validatePatterns(code, errors, warnings);

    } finally {
      // Clean up temp file
      await fs.unlink(tempFile).catch(() => {});
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validatePatterns(code: string, errors: string[], warnings: string[]): void {
    // Check import organization
    const importRegex = /import[\s\S]*?from\s+['"]([^'"]+)['"]/g;
    const imports: string[] = [];
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      imports.push(match[1]);
    }

    // Verify import order
    let lastType = '';
    imports.forEach((imp) => {
      const type = this.getImportType(imp);
      if (this.projectConfig.patterns.imports.order.indexOf(type) <
          this.projectConfig.patterns.imports.order.indexOf(lastType)) {
        warnings.push(`Import order violation: ${imp} should come before ${lastType} imports`);
      }
      lastType = type;
    });

    // Check naming conventions
    const componentRegex = /export\s+(?:default\s+)?(?:class|function)\s+(\w+)/g;
    while ((match = componentRegex.exec(code)) !== null) {
      const name = match[1];
      if (!this.isPascalCase(name) && code.includes('Component')) {
        errors.push(`Component naming violation: ${name} should be PascalCase`);
      }
    }

    // Check for console.log
    if (code.match(/console\.log/g)) {
      warnings.push('Found console.log statements');
    }

    // Check for any type
    if (code.match(/:\s*any\b/g)) {
      errors.push('Found explicit "any" type usage');
    }
  }

  private getImportType(importPath: string): string {
    if (importPath.startsWith('node:') || !importPath.includes('/')) {
      return 'node';
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

  private isPascalCase(str: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str);
  }

  async saveGeneratedFile(content: string, outputPath: string): Promise<void> {
    // Ensure directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Format with prettier before saving
    try {
      const { stdout } = await execAsync(
        `echo '${content.replace(/'/g, "'\\''")}' | pnpm prettier --stdin-filepath ${outputPath}`
      );
      content = stdout;
    } catch (error) {
      console.warn('Prettier formatting failed, saving unformatted');
    }

    // Save file
    await fs.writeFile(outputPath, content, 'utf-8');
  }

  // Get available templates
  async getAvailableTemplates(category?: string): Promise<string[]> {
    const templatesDir = path.join(__dirname, 'templates');
    const templates: string[] = [];

    async function scanDir(dir: string): Promise<void> {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!category || entry.name === category) {
            await scanDir(fullPath);
          }
        } else if (entry.name.endsWith('.hbs')) {
          templates.push(fullPath);
        }
      }
    }

    await scanDir(templatesDir);
    return templates;
  }
}

interface ProjectConfig {
  typescript: {
    strict: boolean;
    target: string;
    module: string;
    moduleResolution: string;
  };
  eslint: {
    extends: string[];
    rules: Record<string, any>;
  };
  prettier: {
    semi: boolean;
    singleQuote: boolean;
    tabWidth: number;
    trailingComma: string;
  };
  patterns: {
    imports: {
      order: string[];
      newlinesBetween: string;
    };
    exports: {
      namedFirst: boolean;
      defaultLast: boolean;
    };
    naming: {
      components: string;
      hooks: string;
      constants: string;
      types: string;
      interfaces: string;
    };
  };
}

export const templateEngine = new TemplateEngine();