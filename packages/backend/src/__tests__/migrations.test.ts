import DatabaseService, { MigrationService } from '../services/database';
import fs from 'fs';
import path from 'path';

describe('MigrationService', () => {
  const testDbPath = path.join(process.cwd(), 'data', 'taskmaster.db');
  let migrationService: MigrationService;

  beforeEach(async () => {
    // Clean up test database if it exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    
    await DatabaseService.connect();
    migrationService = DatabaseService.getMigrationService();
  });

  afterEach(async () => {
    try {
      await DatabaseService.disconnect();
    } catch (error) {
      // Ignore errors during cleanup
    }
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it('should start with version 0', async () => {
    const version = await migrationService.getCurrentVersion();
    expect(version).toBe(0);
  });

  it('should run migrations successfully', async () => {
    await migrationService.runMigrations();
    const version = await migrationService.getCurrentVersion();
    expect(version).toBeGreaterThan(0);
  });

  it('should create tasks table after migrations', async () => {
    await migrationService.runMigrations();
    
    // Test that we can insert and retrieve from tasks table
    await DatabaseService.run(
      'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)',
      ['Test Task', 'Test Description', 'pending']
    );
    
    const task = await DatabaseService.get('SELECT * FROM tasks WHERE title = ?', ['Test Task']);
    expect(task).toBeDefined();
    expect(task.title).toBe('Test Task');
    expect(task.description).toBe('Test Description');
    expect(task.status).toBe('pending');
  });

  it('should not run migrations if already up to date', async () => {
    await migrationService.runMigrations();
    const version1 = await migrationService.getCurrentVersion();
    
    await migrationService.runMigrations();
    const version2 = await migrationService.getCurrentVersion();
    
    expect(version1).toBe(version2);
  });
});