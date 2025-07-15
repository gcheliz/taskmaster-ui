import DatabaseService from '../services/database';
import fs from 'fs';
import path from 'path';

describe('DatabaseService', () => {
  const testDbPath = path.join(process.cwd(), 'data', 'taskmaster.db');

  beforeEach(async () => {
    // Clean up test database if it exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
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

  it('should connect to database successfully', async () => {
    await expect(DatabaseService.connect()).resolves.not.toThrow();
    // In test environment, we use in-memory database, so no file is created
    if (process.env.NODE_ENV !== 'test') {
      expect(fs.existsSync(testDbPath)).toBe(true);
    }
  });

  it('should throw error when trying to get db without connecting', () => {
    expect(() => DatabaseService.getDb()).toThrow('Database not connected. Call connect() first.');
  });

  it('should execute SQL queries successfully', async () => {
    await DatabaseService.connect();
    
    await expect(DatabaseService.run('CREATE TABLE test (id INTEGER, name TEXT)')).resolves.not.toThrow();
    await expect(DatabaseService.run('INSERT INTO test (id, name) VALUES (?, ?)', [1, 'Test'])).resolves.not.toThrow();
    
    const result = await DatabaseService.get('SELECT * FROM test WHERE id = ?', [1]);
    expect(result).toEqual({ id: 1, name: 'Test' });
  });

  it('should return all rows from query', async () => {
    await DatabaseService.connect();
    
    await DatabaseService.run('CREATE TABLE test (id INTEGER, name TEXT)');
    await DatabaseService.run('INSERT INTO test (id, name) VALUES (?, ?)', [1, 'Test1']);
    await DatabaseService.run('INSERT INTO test (id, name) VALUES (?, ?)', [2, 'Test2']);
    
    const results = await DatabaseService.all('SELECT * FROM test');
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({ id: 1, name: 'Test1' });
    expect(results[1]).toEqual({ id: 2, name: 'Test2' });
  });

  it('should disconnect gracefully', async () => {
    await DatabaseService.connect();
    await expect(DatabaseService.disconnect()).resolves.not.toThrow();
  });
});