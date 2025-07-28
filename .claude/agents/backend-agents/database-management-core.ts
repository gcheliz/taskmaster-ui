import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Input validation schemas
export const schemaUpdateSchema = z.object({
  model: z.string(),
  action: z.enum(['create', 'update', 'delete']),
  fields: z.array(z.object({
    name: z.string(),
    type: z.string(),
    modifiers: z.array(z.string()).optional(), // @unique, @default, etc.
    relation: z.object({
      model: z.string(),
      fields: z.array(z.string()),
      references: z.array(z.string()),
    }).optional(),
  })).optional(),
  indexes: z.array(z.object({
    fields: z.array(z.string()),
    type: z.enum(['index', 'unique']).optional(),
  })).optional(),
});

export const migrationSchema = z.object({
  name: z.string(),
  description: z.string(),
  autoApply: z.boolean().default(false),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
});

export const seedDataSchema = z.object({
  model: z.string(),
  count: z.number().default(10),
  fields: z.record(z.union([
    z.string(), // Fixed value
    z.object({
      type: z.enum(['faker', 'sequence', 'random', 'relation']),
      options: z.any(),
    }),
  ])).optional(),
});

export type SchemaUpdateInput = z.infer<typeof schemaUpdateSchema>;
export type MigrationInput = z.infer<typeof migrationSchema>;
export type SeedDataInput = z.infer<typeof seedDataSchema>;

interface DatabaseOperationResult {
  success: boolean;
  message: string;
  files?: string[];
  migration?: {
    name: string;
    sql: string;
  };
  rollbackCommand?: string;
}

export class DatabaseManagementAgent {
  private workspacePath: string;
  private prismaPath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
    this.prismaPath = path.join(workspacePath, 'packages', 'backend', 'prisma');
  }

  /**
   * Update Prisma schema
   */
  async updateSchema(input: SchemaUpdateInput): Promise<DatabaseOperationResult> {
    const validated = schemaUpdateSchema.parse(input);
    
    try {
      const schemaPath = path.join(this.prismaPath, 'schema.prisma');
      let schemaContent = await fs.readFile(schemaPath, 'utf-8');
      
      switch (validated.action) {
        case 'create':
          schemaContent = await this.addModelToSchema(schemaContent, validated);
          break;
        case 'update':
          schemaContent = await this.updateModelInSchema(schemaContent, validated);
          break;
        case 'delete':
          schemaContent = await this.deleteModelFromSchema(schemaContent, validated.model);
          break;
      }
      
      // Write updated schema
      await fs.writeFile(schemaPath, schemaContent, 'utf-8');
      
      // Format schema
      await this.formatSchema();
      
      return {
        success: true,
        message: `Successfully ${validated.action}d model ${validated.model}`,
        files: [schemaPath],
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update schema: ${error.message}`,
      };
    }
  }

  /**
   * Generate and manage migrations
   */
  async generateMigration(input: MigrationInput): Promise<DatabaseOperationResult> {
    const validated = migrationSchema.parse(input);
    
    try {
      // Generate migration
      const { stdout, stderr } = await execAsync(
        `cd ${this.workspacePath} && pnpm --filter=backend prisma migrate dev --name ${validated.name} --create-only`,
        { env: { ...process.env, PRISMA_MIGRATION_SKIP_DEPLOY: 'true' } }
      );
      
      if (stderr && !stderr.includes('Created migration')) {
        throw new Error(stderr);
      }
      
      // Extract migration file path from output
      const migrationMatch = stdout.match(/migrations\/(\d+_\w+)/);
      if (!migrationMatch) {
        throw new Error('Could not extract migration name from output');
      }
      
      const migrationName = migrationMatch[1];
      const migrationPath = path.join(this.prismaPath, 'migrations', migrationName, 'migration.sql');
      const migrationContent = await fs.readFile(migrationPath, 'utf-8');
      
      // Apply migration if requested
      if (validated.autoApply && validated.environment === 'development') {
        await this.applyMigration();
      }
      
      return {
        success: true,
        message: `Generated migration: ${migrationName}`,
        files: [migrationPath],
        migration: {
          name: migrationName,
          sql: migrationContent,
        },
        rollbackCommand: `pnpm --filter=backend prisma migrate reset --skip-seed`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate migration: ${error.message}`,
      };
    }
  }

  /**
   * Apply pending migrations
   */
  async applyMigration(): Promise<DatabaseOperationResult> {
    try {
      const { stdout, stderr } = await execAsync(
        `cd ${this.workspacePath} && pnpm --filter=backend prisma migrate deploy`
      );
      
      if (stderr && !stderr.includes('All migrations have been successfully applied')) {
        throw new Error(stderr);
      }
      
      return {
        success: true,
        message: 'Successfully applied all pending migrations',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to apply migrations: ${error.message}`,
      };
    }
  }

  /**
   * Generate seed data
   */
  async generateSeedData(input: SeedDataInput): Promise<DatabaseOperationResult> {
    const validated = seedDataSchema.parse(input);
    
    try {
      const seedScript = this.generateSeedScript(validated);
      const seedPath = path.join(this.prismaPath, `seed-${validated.model.toLowerCase()}.ts`);
      
      await fs.writeFile(seedPath, seedScript, 'utf-8');
      
      return {
        success: true,
        message: `Generated seed script for ${validated.model}`,
        files: [seedPath],
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate seed data: ${error.message}`,
      };
    }
  }

  /**
   * Analyze queries and suggest optimizations
   */
  async analyzeQueries(modelName: string): Promise<DatabaseOperationResult> {
    try {
      const schemaPath = path.join(this.prismaPath, 'schema.prisma');
      const schemaContent = await fs.readFile(schemaPath, 'utf-8');
      
      const suggestions: string[] = [];
      
      // Parse model from schema
      const modelMatch = schemaContent.match(new RegExp(`model ${modelName} \\{([^}]+)\\}`, 's'));
      if (!modelMatch) {
        throw new Error(`Model ${modelName} not found in schema`);
      }
      
      const modelContent = modelMatch[1];
      
      // Check for missing indexes on foreign keys
      const relationFields = modelContent.match(/(\w+)\s+\w+\s+@relation\(fields:\s*\[(\w+)\]/g);
      if (relationFields) {
        relationFields.forEach(relation => {
          const fieldMatch = relation.match(/fields:\s*\[(\w+)\]/);
          if (fieldMatch) {
            const field = fieldMatch[1];
            if (!modelContent.includes(`@@index([${field}])`)) {
              suggestions.push(`Add index on foreign key field: @@index([${field}])`);
            }
          }
        });
      }
      
      // Check for composite indexes on commonly queried fields
      if (modelName === 'User' && !modelContent.includes('@@index([email, createdAt])')) {
        suggestions.push('Consider composite index for common queries: @@index([email, createdAt])');
      }
      
      // Check for missing unique constraints
      const uniqueFields = ['email', 'username', 'slug'];
      uniqueFields.forEach(field => {
        if (modelContent.includes(`${field} String`) && !modelContent.includes(`${field} String @unique`)) {
          suggestions.push(`Consider adding @unique constraint to ${field} field`);
        }
      });
      
      return {
        success: true,
        message: `Query optimization analysis for ${modelName}`,
        files: suggestions,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to analyze queries: ${error.message}`,
      };
    }
  }

  /**
   * Add a new model to the schema
   */
  private async addModelToSchema(schema: string, input: SchemaUpdateInput): Promise<string> {
    const modelDefinition = this.generateModelDefinition(input);
    
    // Find the last model or the end of the file
    const lastModelIndex = schema.lastIndexOf('}');
    if (lastModelIndex === -1) {
      return schema + '\n\n' + modelDefinition;
    }
    
    return schema.slice(0, lastModelIndex + 1) + '\n\n' + modelDefinition + schema.slice(lastModelIndex + 1);
  }

  /**
   * Update an existing model in the schema
   */
  private async updateModelInSchema(schema: string, input: SchemaUpdateInput): Promise<string> {
    const modelRegex = new RegExp(`model ${input.model} \\{[^}]+\\}`, 's');
    const modelMatch = schema.match(modelRegex);
    
    if (!modelMatch) {
      throw new Error(`Model ${input.model} not found in schema`);
    }
    
    const updatedModel = this.generateModelDefinition(input);
    return schema.replace(modelRegex, updatedModel);
  }

  /**
   * Delete a model from the schema
   */
  private async deleteModelFromSchema(schema: string, modelName: string): Promise<string> {
    const modelRegex = new RegExp(`\\n*model ${modelName} \\{[^}]+\\}`, 's');
    return schema.replace(modelRegex, '');
  }

  /**
   * Generate model definition
   */
  private generateModelDefinition(input: SchemaUpdateInput): string {
    let model = `model ${input.model} {\n`;
    
    // Add default fields
    model += `  id        String   @id @default(cuid())\n`;
    model += `  createdAt DateTime @default(now())\n`;
    model += `  updatedAt DateTime @updatedAt\n`;
    
    // Add custom fields
    if (input.fields) {
      input.fields.forEach(field => {
        model += `  ${field.name} ${field.type}`;
        
        if (field.modifiers) {
          field.modifiers.forEach(modifier => {
            model += ` ${modifier}`;
          });
        }
        
        model += '\n';
        
        // Add relation if specified
        if (field.relation) {
          model += `  ${field.relation.model.toLowerCase()} ${field.relation.model} @relation(fields: [${field.relation.fields.join(', ')}], references: [${field.relation.references.join(', ')}])\n`;
        }
      });
    }
    
    // Add indexes
    if (input.indexes) {
      model += '\n';
      input.indexes.forEach(index => {
        if (index.type === 'unique') {
          model += `  @@unique([${index.fields.join(', ')}])\n`;
        } else {
          model += `  @@index([${index.fields.join(', ')}])\n`;
        }
      });
    }
    
    model += `  @@map("${input.model.toLowerCase()}s")\n`;
    model += '}';
    
    return model;
  }

  /**
   * Generate seed script
   */
  private generateSeedScript(input: SeedDataInput): string {
    return `import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seed${input.model}(count: number = ${input.count}) {
  console.log('Seeding ${input.model}...');
  
  const data = Array.from({ length: count }, (_, i) => ({
    ${input.fields ? Object.entries(input.fields).map(([field, config]) => {
      if (typeof config === 'string') {
        return `${field}: '${config}'`;
      }
      
      switch (config.type) {
        case 'faker':
          return `${field}: faker.${config.options}()`;
        case 'sequence':
          return `${field}: \`${config.options.prefix || ''}$\{i + 1\}\``;
        case 'random':
          return `${field}: ${config.options.values}[Math.floor(Math.random() * ${config.options.values}.length)]`;
        default:
          return `${field}: null`;
      }
    }).join(',\n    ') : ''}
  }));
  
  await prisma.${input.model.toLowerCase()}.createMany({
    data,
    skipDuplicates: true,
  });
  
  console.log(\`Created $\{count\} ${input.model} records\`);
}

// Run if called directly
if (require.main === module) {
  seed${input.model}()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
`;
  }

  /**
   * Format Prisma schema
   */
  private async formatSchema(): Promise<void> {
    try {
      await execAsync(
        `cd ${this.workspacePath} && pnpm --filter=backend prisma format`
      );
    } catch (error) {
      console.warn('Failed to format schema:', error.message);
    }
  }

  /**
   * Validate migration safety
   */
  async validateMigration(migrationPath: string): Promise<DatabaseOperationResult> {
    try {
      const migrationContent = await fs.readFile(migrationPath, 'utf-8');
      const warnings: string[] = [];
      
      // Check for dangerous operations
      if (migrationContent.includes('DROP TABLE')) {
        warnings.push('Migration contains DROP TABLE - data will be lost');
      }
      
      if (migrationContent.includes('DROP COLUMN')) {
        warnings.push('Migration contains DROP COLUMN - data will be lost');
      }
      
      if (migrationContent.includes('ALTER TABLE') && migrationContent.includes('NOT NULL')) {
        warnings.push('Migration adds NOT NULL constraint - ensure existing data is compatible');
      }
      
      return {
        success: warnings.length === 0,
        message: warnings.length > 0 ? 'Migration has potential issues' : 'Migration is safe',
        files: warnings,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to validate migration: ${error.message}`,
      };
    }
  }
}