"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../services/database"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
describe('DatabaseService', () => {
    const testDbPath = path_1.default.join(process.cwd(), 'data', 'taskmaster.db');
    beforeEach(async () => {
        // Clean up test database if it exists
        if (fs_1.default.existsSync(testDbPath)) {
            fs_1.default.unlinkSync(testDbPath);
        }
    });
    afterEach(async () => {
        try {
            await database_1.default.disconnect();
        }
        catch (error) {
            // Ignore errors during cleanup
        }
        // Clean up test database
        if (fs_1.default.existsSync(testDbPath)) {
            fs_1.default.unlinkSync(testDbPath);
        }
    });
    it('should connect to database successfully', async () => {
        await expect(database_1.default.connect()).resolves.not.toThrow();
        // In test environment, we use in-memory database, so no file is created
        if (process.env.NODE_ENV !== 'test') {
            expect(fs_1.default.existsSync(testDbPath)).toBe(true);
        }
    });
    it('should throw error when trying to get db without connecting', () => {
        expect(() => database_1.default.getDb()).toThrow('Database not connected. Call connect() first.');
    });
    it('should execute SQL queries successfully', async () => {
        await database_1.default.connect();
        await expect(database_1.default.run('CREATE TABLE test (id INTEGER, name TEXT)')).resolves.not.toThrow();
        await expect(database_1.default.run('INSERT INTO test (id, name) VALUES (?, ?)', [1, 'Test'])).resolves.not.toThrow();
        const result = await database_1.default.get('SELECT * FROM test WHERE id = ?', [1]);
        expect(result).toEqual({ id: 1, name: 'Test' });
    });
    it('should return all rows from query', async () => {
        await database_1.default.connect();
        await database_1.default.run('CREATE TABLE test (id INTEGER, name TEXT)');
        await database_1.default.run('INSERT INTO test (id, name) VALUES (?, ?)', [1, 'Test1']);
        await database_1.default.run('INSERT INTO test (id, name) VALUES (?, ?)', [2, 'Test2']);
        const results = await database_1.default.all('SELECT * FROM test');
        expect(results).toHaveLength(2);
        expect(results[0]).toEqual({ id: 1, name: 'Test1' });
        expect(results[1]).toEqual({ id: 2, name: 'Test2' });
    });
    it('should disconnect gracefully', async () => {
        await database_1.default.connect();
        await expect(database_1.default.disconnect()).resolves.not.toThrow();
    });
});
//# sourceMappingURL=database.test.js.map