import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
// Forward declaration to avoid circular dependency
export class MigrationService {
  private dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }

  async getCurrentVersion(): Promise<number> {
    try {
      const result = await this.dbService.get(
        'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
      );
      return result ? result.version : 0;
    } catch (error) {
      // Table doesn't exist yet, start from version 0
      return 0;
    }
  }

  async runMigrations(): Promise<void> {
    // Import migrations here to avoid circular dependency
    const { migrations } = await import('./migrations');
    
    const currentVersion = await this.getCurrentVersion();
    const pendingMigrations = migrations.filter(
      (m) => m.version > currentVersion
    );

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }

    console.log(`Running ${pendingMigrations.length} migrations...`);

    for (const migration of pendingMigrations) {
      console.log(`Applying migration ${migration.version}: ${migration.description}`);
      
      try {
        await this.dbService.run(migration.up);
        await this.dbService.run(
          'INSERT INTO schema_version (version, description) VALUES (?, ?)',
          [migration.version, migration.description]
        );
        console.log(`Migration ${migration.version} applied successfully`);
      } catch (error) {
        console.error(`Failed to apply migration ${migration.version}:`, error);
        throw error;
      }
    }

    console.log('All migrations completed successfully');
  }
}

export class DatabaseService {
  private static instance: DatabaseService;
  private db: sqlite3.Database | null = null;
  private migrationService: MigrationService | null = null;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    if (this.db) {
      return;
    }

    let dbPath: string;
    
    // Use in-memory database for tests
    if (process.env.NODE_ENV === 'test') {
      dbPath = ':memory:';
    } else {
      const dataDir = path.join(process.cwd(), 'data');
      dbPath = path.join(dataDir, 'taskmaster.db');
      
      // Ensure data directory exists
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    }
    
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.migrationService = new MigrationService(this);
          resolve();
        }
      });
    });
  }

  public async disconnect(): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.db!.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
          reject(err);
        } else {
          console.log('Disconnected from SQLite database');
          this.db = null;
          resolve();
        }
      });
    });
  }

  public getDb(): sqlite3.Database {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  public async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }

    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  public async get(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }

    return new Promise((resolve, reject) => {
      this.db!.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  public async all(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }

    return new Promise((resolve, reject) => {
      this.db!.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  public async initializeSchema(): Promise<void> {
    if (!this.migrationService) {
      throw new Error('Database not connected. Call connect() first.');
    }
    
    await this.migrationService.runMigrations();
  }

  public getMigrationService(): MigrationService {
    if (!this.migrationService) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.migrationService;
  }
}

export default DatabaseService.getInstance();