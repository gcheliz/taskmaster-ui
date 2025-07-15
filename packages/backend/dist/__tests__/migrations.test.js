"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../services/database"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
describe('MigrationService', () => {
    const testDbPath = path_1.default.join(process.cwd(), 'data', 'taskmaster.db');
    let migrationService;
    beforeEach(async () => {
        // Clean up test database if it exists
        if (fs_1.default.existsSync(testDbPath)) {
            fs_1.default.unlinkSync(testDbPath);
        }
        await database_1.default.connect();
        migrationService = database_1.default.getMigrationService();
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
        await database_1.default.run('INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)', ['Test Task', 'Test Description', 'pending']);
        const task = await database_1.default.get('SELECT * FROM tasks WHERE title = ?', ['Test Task']);
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
//# sourceMappingURL=migrations.test.js.map