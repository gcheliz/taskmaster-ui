"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = exports.MigrationService = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Forward declaration to avoid circular dependency
class MigrationService {
    constructor(dbService) {
        this.dbService = dbService;
    }
    async getCurrentVersion() {
        try {
            const result = await this.dbService.get('SELECT version FROM schema_version ORDER BY version DESC LIMIT 1');
            return result ? result.version : 0;
        }
        catch (error) {
            // Table doesn't exist yet, start from version 0
            return 0;
        }
    }
    async runMigrations() {
        // Import migrations here to avoid circular dependency
        const { migrations } = await Promise.resolve().then(() => __importStar(require('./migrations')));
        const currentVersion = await this.getCurrentVersion();
        const pendingMigrations = migrations.filter((m) => m.version > currentVersion);
        if (pendingMigrations.length === 0) {
            console.log('No pending migrations');
            return;
        }
        console.log(`Running ${pendingMigrations.length} migrations...`);
        for (const migration of pendingMigrations) {
            console.log(`Applying migration ${migration.version}: ${migration.description}`);
            try {
                await this.dbService.run(migration.up);
                await this.dbService.run('INSERT INTO schema_version (version, description) VALUES (?, ?)', [migration.version, migration.description]);
                console.log(`Migration ${migration.version} applied successfully`);
            }
            catch (error) {
                console.error(`Failed to apply migration ${migration.version}:`, error);
                throw error;
            }
        }
        console.log('All migrations completed successfully');
    }
}
exports.MigrationService = MigrationService;
class DatabaseService {
    constructor() {
        this.db = null;
        this.migrationService = null;
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    async connect() {
        if (this.db) {
            return;
        }
        let dbPath;
        // Use in-memory database for tests
        if (process.env.NODE_ENV === 'test') {
            dbPath = ':memory:';
        }
        else {
            const dataDir = path_1.default.join(process.cwd(), 'data');
            dbPath = path_1.default.join(dataDir, 'taskmaster.db');
            // Ensure data directory exists
            if (!fs_1.default.existsSync(dataDir)) {
                fs_1.default.mkdirSync(dataDir, { recursive: true });
            }
        }
        return new Promise((resolve, reject) => {
            this.db = new sqlite3_1.default.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    reject(err);
                }
                else {
                    console.log('Connected to SQLite database');
                    this.migrationService = new MigrationService(this);
                    resolve();
                }
            });
        });
    }
    async disconnect() {
        if (!this.db) {
            return;
        }
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                    reject(err);
                }
                else {
                    console.log('Disconnected from SQLite database');
                    this.db = null;
                    resolve();
                }
            });
        });
    }
    getDb() {
        if (!this.db) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.db;
    }
    async run(sql, params = []) {
        if (!this.db) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this);
                }
            });
        });
    }
    async get(sql, params = []) {
        if (!this.db) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            });
        });
    }
    async all(sql, params = []) {
        if (!this.db) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    async initializeSchema() {
        if (!this.migrationService) {
            throw new Error('Database not connected. Call connect() first.');
        }
        await this.migrationService.runMigrations();
    }
    getMigrationService() {
        if (!this.migrationService) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.migrationService;
    }
}
exports.DatabaseService = DatabaseService;
exports.default = DatabaseService.getInstance();
//# sourceMappingURL=database.js.map