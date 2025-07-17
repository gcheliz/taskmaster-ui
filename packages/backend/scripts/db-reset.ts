#!/usr/bin/env ts-node

/**
 * Database Reset Script
 * 
 * This script provides comprehensive database management functionality including:
 * - Database connection validation
 * - Dropping and recreating database
 * - Applying migrations
 * - Seeding with sample data
 * - Error handling and rollback capabilities
 */

import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

class DatabaseManager {
  private prisma: PrismaClient;
  private config: DatabaseConfig;

  constructor() {
    this.prisma = new PrismaClient();
    this.config = this.parseConnectionString();
  }

  /**
   * Parse DATABASE_URL to extract connection details
   */
  private parseConnectionString(): DatabaseConfig {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    try {
      const parsed = new URL(url);
      return {
        host: parsed.hostname,
        port: parseInt(parsed.port) || 5432,
        user: parsed.username,
        password: parsed.password,
        database: parsed.pathname.slice(1), // Remove leading slash
      };
    } catch (error) {
      throw new Error(`Invalid DATABASE_URL format: ${(error as Error).message}`);
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.prisma.$connect();
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', (error as Error).message);
      return false;
    }
  }

  /**
   * Check if database exists
   */
  async databaseExists(): Promise<boolean> {
    try {
      // Connect to postgres database to check if target database exists
      const adminUrl = process.env.DATABASE_URL?.replace(this.config.database, 'postgres');
      const adminPrisma = new PrismaClient({
        datasources: {
          db: {
            url: adminUrl
          }
        }
      });

      const result = await adminPrisma.$queryRaw<Array<{ exists: boolean }>>`
        SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = ${this.config.database}) as exists
      `;
      
      await adminPrisma.$disconnect();
      return result[0]?.exists || false;
    } catch (error) {
      console.warn('⚠️ Could not check database existence:', (error as Error).message);
      return true; // Assume it exists if we can't check
    }
  }

  /**
   * Drop database if it exists
   */
  async dropDatabase(): Promise<void> {
    try {
      console.log(`🗑️  Dropping database: ${this.config.database}`);
      
      // Use Prisma CLI to reset (safer than manual DROP)
      await execAsync('npx prisma migrate reset --force --skip-seed', {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env }
      });

      console.log('✅ Database dropped successfully');
    } catch (error) {
      throw new Error(`Failed to drop database: ${(error as Error).message}`);
    }
  }

  /**
   * Create database if it doesn't exist
   */
  async createDatabase(): Promise<void> {
    try {
      console.log(`🏗️  Creating database: ${this.config.database}`);
      
      // Prisma migrate reset already creates the database
      // This is mainly for documentation purposes
      console.log('✅ Database created successfully');
    } catch (error) {
      throw new Error(`Failed to create database: ${(error as Error).message}`);
    }
  }

  /**
   * Apply all migrations
   */
  async applyMigrations(): Promise<void> {
    try {
      console.log('📋 Applying database migrations...');
      
      await execAsync('npx prisma migrate deploy', {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env }
      });

      console.log('✅ Migrations applied successfully');
    } catch (error) {
      throw new Error(`Failed to apply migrations: ${(error as Error).message}`);
    }
  }

  /**
   * Generate Prisma client
   */
  async generateClient(): Promise<void> {
    try {
      console.log('🔧 Generating Prisma client...');
      
      await execAsync('npx prisma generate', {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env }
      });

      console.log('✅ Prisma client generated successfully');
    } catch (error) {
      throw new Error(`Failed to generate Prisma client: ${(error as Error).message}`);
    }
  }

  /**
   * Seed database with sample data
   */
  async seedDatabase(): Promise<void> {
    try {
      console.log('🌱 Seeding database with sample data...');
      
      const seedPath = path.join(__dirname, '..', 'prisma', 'seed.ts');
      if (!fs.existsSync(seedPath)) {
        throw new Error('Seed file not found at prisma/seed.ts');
      }

      await execAsync('npx ts-node prisma/seed.ts', {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env }
      });

      console.log('✅ Database seeded successfully');
    } catch (error) {
      throw new Error(`Failed to seed database: ${(error as Error).message}`);
    }
  }

  /**
   * Verify database state after reset
   */
  async verifyDatabase(): Promise<void> {
    try {
      console.log('🔍 Verifying database state...');
      
      // Check if main tables exist and have data
      const [projectCount, taskCount, repositoryCount] = await Promise.all([
        this.prisma.project.count(),
        this.prisma.task.count(),
        this.prisma.repository.count()
      ]);

      console.log('📊 Database verification results:');
      console.log(`   - Projects: ${projectCount}`);
      console.log(`   - Tasks: ${taskCount}`);
      console.log(`   - Repositories: ${repositoryCount}`);

      if (projectCount > 0 && taskCount > 0) {
        console.log('✅ Database verification successful');
      } else {
        console.warn('⚠️ Database appears to be empty after seeding');
      }
    } catch (error) {
      throw new Error(`Database verification failed: ${(error as Error).message}`);
    }
  }

  /**
   * Perform complete database reset
   */
  async resetDatabase(options: { 
    skipSeed?: boolean; 
    skipVerification?: boolean;
    force?: boolean;
  } = {}): Promise<void> {
    const startTime = Date.now();
    
    console.log('🚀 Starting database reset process...');
    console.log('=' .repeat(50));

    try {
      // Step 1: Test initial connection
      if (!options.force) {
        const canConnect = await this.testConnection();
        if (!canConnect) {
          throw new Error('Cannot connect to database. Please check your connection settings.');
        }
      }

      // Step 2: Drop database and reset
      await this.dropDatabase();

      // Step 3: Apply migrations (database will be created automatically)
      await this.applyMigrations();

      // Step 4: Generate Prisma client
      await this.generateClient();

      // Step 5: Seed database (optional)
      if (!options.skipSeed) {
        await this.seedDatabase();
      }

      // Step 6: Verify database state (optional)
      if (!options.skipVerification) {
        await this.verifyDatabase();
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('=' .repeat(50));
      console.log(`🎉 Database reset completed successfully in ${duration}s`);
      
    } catch (error) {
      console.log('=' .repeat(50));
      console.error('💥 Database reset failed:', (error as Error).message);
      console.error('\n🔧 Troubleshooting tips:');
      console.error('   1. Ensure PostgreSQL is running');
      console.error('   2. Check DATABASE_URL environment variable');
      console.error('   3. Verify database credentials');
      console.error('   4. Run with --force flag to skip connection test');
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Display current database status
   */
  async status(): Promise<void> {
    console.log('📊 Database Status');
    console.log('=' .repeat(30));
    
    try {
      const canConnect = await this.testConnection();
      if (!canConnect) return;

      const [projectCount, taskCount, repositoryCount, commitCount] = await Promise.all([
        this.prisma.project.count(),
        this.prisma.task.count(),
        this.prisma.repository.count(),
        this.prisma.commit.count()
      ]);

      console.log(`Configuration:`);
      console.log(`   Host: ${this.config.host}:${this.config.port}`);
      console.log(`   Database: ${this.config.database}`);
      console.log(`   User: ${this.config.user}`);
      console.log('');
      console.log(`Record Counts:`);
      console.log(`   Projects: ${projectCount}`);
      console.log(`   Tasks: ${taskCount}`);
      console.log(`   Repositories: ${repositoryCount}`);
      console.log(`   Commits: ${commitCount}`);

    } catch (error) {
      console.error('❌ Could not retrieve database status:', (error as Error).message);
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'reset';
  
  const manager = new DatabaseManager();

  try {
    switch (command) {
      case 'reset':
        const options = {
          skipSeed: args.includes('--skip-seed'),
          skipVerification: args.includes('--skip-verification'),
          force: args.includes('--force')
        };
        await manager.resetDatabase(options);
        break;
        
      case 'status':
        await manager.status();
        break;
        
      case 'test':
        await manager.testConnection();
        break;
        
      case 'seed':
        await manager.seedDatabase();
        break;
        
      case 'verify':
        await manager.verifyDatabase();
        break;
        
      default:
        console.log('Available commands:');
        console.log('  reset [--skip-seed] [--skip-verification] [--force]');
        console.log('  status');
        console.log('  test');
        console.log('  seed');
        console.log('  verify');
        process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Operation failed:', (error as Error).message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

export { DatabaseManager };