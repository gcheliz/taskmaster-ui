import { DatabaseManagementAgent, SchemaUpdateInput, MigrationInput, SeedDataInput } from './database-management-core';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../../packages/backend/src/utils/winston-adapter';

export interface DatabaseCommand {
  name: string;
  description: string;
  execute: (args: any) => Promise<any>;
}

export class DatabaseManagementCommands {
  private agent: DatabaseManagementAgent;
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
    this.agent = new DatabaseManagementAgent(workspacePath);
  }

  /**
   * Get all available commands
   */
  getCommands(): DatabaseCommand[] {
    return [
      {
        name: 'schema',
        description: 'Update Prisma schema',
        execute: this.updateSchema.bind(this),
      },
      {
        name: 'migrate',
        description: 'Generate and manage migrations',
        execute: this.generateMigration.bind(this),
      },
      {
        name: 'seed',
        description: 'Generate seed data scripts',
        execute: this.generateSeed.bind(this),
      },
      {
        name: 'optimize',
        description: 'Analyze and optimize database queries',
        execute: this.optimizeQueries.bind(this),
      },
      {
        name: 'validate',
        description: 'Validate migration safety',
        execute: this.validateMigration.bind(this),
      },
      {
        name: 'apply',
        description: 'Apply pending migrations',
        execute: this.applyMigrations.bind(this),
      },
    ];
  }

  /**
   * Update schema command handler
   */
  private async updateSchema(args: SchemaUpdateInput): Promise<any> {
    try {
      const result = await this.agent.updateSchema(args);
      
      if (result.success) {
        // Auto-generate migration after schema update
        const migrationResult = await this.agent.generateMigration({
          name: `${args.action}_${args.model.toLowerCase()}`,
          description: `${args.action} ${args.model} model`,
          autoApply: false,
          environment: 'development',
        });
        
        return {
          ...result,
          migration: migrationResult.migration,
          message: `${result.message}. Migration generated: ${migrationResult.migration?.name}`,
        };
      }
      
      return result;
    } catch (error) {
      logger.error('Error updating schema:', error);
      throw error;
    }
  }

  /**
   * Generate migration command handler
   */
  private async generateMigration(args: MigrationInput): Promise<any> {
    try {
      const result = await this.agent.generateMigration(args);
      
      if (result.success && result.migration) {
        // Validate the migration
        const validationResult = await this.agent.validateMigration(
          path.join(this.workspacePath, 'packages', 'backend', 'prisma', 'migrations', result.migration.name, 'migration.sql')
        );
        
        return {
          ...result,
          validation: validationResult,
        };
      }
      
      return result;
    } catch (error) {
      logger.error('Error generating migration:', error);
      throw error;
    }
  }

  /**
   * Generate seed data command handler
   */
  private async generateSeed(args: SeedDataInput): Promise<any> {
    try {
      const result = await this.agent.generateSeedData(args);
      
      if (result.success) {
        // Update main seed file to include the new seed script
        await this.updateMainSeedFile(args.model);
      }
      
      return result;
    } catch (error) {
      logger.error('Error generating seed data:', error);
      throw error;
    }
  }

  /**
   * Optimize queries command handler
   */
  private async optimizeQueries(args: { model: string }): Promise<any> {
    try {
      if (!args.model) {
        throw new Error('Model name is required');
      }
      
      const result = await this.agent.analyzeQueries(args.model);
      
      if (result.success && result.files && result.files.length > 0) {
        // Generate optimization report
        const reportPath = path.join(this.workspacePath, 'docs', 'database', `${args.model.toLowerCase()}-optimization.md`);
        await fs.mkdir(path.dirname(reportPath), { recursive: true });
        
        const report = `# ${args.model} Query Optimization Report

Generated: ${new Date().toISOString()}

## Suggestions

${result.files.map((suggestion, i) => `${i + 1}. ${suggestion}`).join('\n')}

## Implementation Guide

${this.generateOptimizationGuide(result.files)}
`;
        
        await fs.writeFile(reportPath, report, 'utf-8');
        
        return {
          ...result,
          reportPath,
        };
      }
      
      return result;
    } catch (error) {
      logger.error('Error optimizing queries:', error);
      throw error;
    }
  }

  /**
   * Validate migration command handler
   */
  private async validateMigration(args: { path?: string; name?: string }): Promise<any> {
    try {
      let migrationPath: string;
      
      if (args.path) {
        migrationPath = args.path;
      } else if (args.name) {
        migrationPath = path.join(
          this.workspacePath,
          'packages',
          'backend',
          'prisma',
          'migrations',
          args.name,
          'migration.sql'
        );
      } else {
        // Get latest migration
        const migrationsDir = path.join(this.workspacePath, 'packages', 'backend', 'prisma', 'migrations');
        const migrations = await fs.readdir(migrationsDir);
        const latestMigration = migrations
          .filter(m => m.match(/^\d+_/))
          .sort()
          .pop();
        
        if (!latestMigration) {
          throw new Error('No migrations found');
        }
        
        migrationPath = path.join(migrationsDir, latestMigration, 'migration.sql');
      }
      
      return await this.agent.validateMigration(migrationPath);
    } catch (error) {
      logger.error('Error validating migration:', error);
      throw error;
    }
  }

  /**
   * Apply migrations command handler
   */
  private async applyMigrations(args: { environment?: string }): Promise<any> {
    try {
      if (args.environment && args.environment !== 'development') {
        return {
          success: false,
          message: `Cannot auto-apply migrations to ${args.environment}. Please use your deployment pipeline.`,
        };
      }
      
      return await this.agent.applyMigration();
    } catch (error) {
      logger.error('Error applying migrations:', error);
      throw error;
    }
  }

  /**
   * Update main seed file to include new seed scripts
   */
  private async updateMainSeedFile(modelName: string): Promise<void> {
    const seedPath = path.join(this.workspacePath, 'packages', 'backend', 'prisma', 'seed.ts');
    
    try {
      let seedContent = await fs.readFile(seedPath, 'utf-8');
      
      // Add import if not exists
      const importStatement = `import { seed${modelName} } from './seed-${modelName.toLowerCase()}';`;
      if (!seedContent.includes(importStatement)) {
        const lastImportIndex = seedContent.lastIndexOf('import');
        const nextNewlineIndex = seedContent.indexOf('\n', lastImportIndex);
        seedContent = seedContent.slice(0, nextNewlineIndex + 1) + importStatement + '\n' + seedContent.slice(nextNewlineIndex + 1);
        
        // Add seed call
        const seedCall = `  await seed${modelName}();`;
        const mainFunctionMatch = seedContent.match(/async function main\(\) \{([^}]+)\}/s);
        if (mainFunctionMatch) {
          const functionContent = mainFunctionMatch[1];
          const updatedContent = functionContent + '\n' + seedCall;
          seedContent = seedContent.replace(mainFunctionMatch[0], `async function main() {${updatedContent}\n}`);
        }
        
        await fs.writeFile(seedPath, seedContent, 'utf-8');
      }
    } catch (error) {
      // If main seed file doesn't exist, create it
      if (error.code === 'ENOENT') {
        const newSeedContent = `import { PrismaClient } from '@prisma/client';
import { seed${modelName} } from './seed-${modelName.toLowerCase()}';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');
  
  await seed${modelName}();
  
  console.log('Database seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;
        await fs.writeFile(seedPath, newSeedContent, 'utf-8');
      }
    }
  }

  /**
   * Generate optimization implementation guide
   */
  private generateOptimizationGuide(suggestions: string[]): string {
    let guide = '';
    
    suggestions.forEach(suggestion => {
      if (suggestion.includes('Add index')) {
        guide += `
### Adding Indexes

To implement the suggested index, add the following to your Prisma schema:

\`\`\`prisma
${suggestion.replace('Add index on foreign key field: ', '')}
\`\`\`

Then generate a migration:
\`\`\`bash
pnpm --filter=backend prisma migrate dev --name add_index_[field_name]
\`\`\`
`;
      } else if (suggestion.includes('@unique')) {
        const field = suggestion.match(/to (\w+) field/)?.[1];
        guide += `
### Adding Unique Constraints

To add a unique constraint to the ${field} field:

\`\`\`prisma
${field} String @unique
\`\`\`

Note: Ensure there are no duplicate values in existing data before applying this constraint.
`;
      }
    });
    
    return guide;
  }
}

/**
 * CLI command parser for database management
 */
export async function handleDatabaseCommand(command: string, args: any): Promise<any> {
  const workspacePath = process.cwd();
  const commands = new DatabaseManagementCommands(workspacePath);
  
  const availableCommands = commands.getCommands();
  const cmd = availableCommands.find(c => c.name === command);
  
  if (!cmd) {
    throw new Error(`Unknown command: ${command}. Available commands: ${availableCommands.map(c => c.name).join(', ')}`);
  }
  
  return cmd.execute(args);
}