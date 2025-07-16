"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrations = void 0;
exports.migrations = [
    {
        version: 1,
        description: 'Create schema_version table',
        up: `
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        description TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `,
        down: `
      DROP TABLE IF EXISTS schema_version;
    `,
    },
    {
        version: 2,
        description: 'Create tasks table',
        up: `
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        priority TEXT NOT NULL DEFAULT 'medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    `,
        down: `
      DROP INDEX IF EXISTS idx_tasks_priority;
      DROP INDEX IF EXISTS idx_tasks_status;
      DROP TABLE IF EXISTS tasks;
    `,
    },
    {
        version: 3,
        description: 'Create repositories table',
        up: `
      CREATE TABLE IF NOT EXISTS repositories (
        id TEXT PRIMARY KEY,
        path TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_repositories_path ON repositories(path);
      CREATE INDEX IF NOT EXISTS idx_repositories_name ON repositories(name);
    `,
        down: `
      DROP INDEX IF EXISTS idx_repositories_name;
      DROP INDEX IF EXISTS idx_repositories_path;
      DROP TABLE IF EXISTS repositories;
    `,
    },
];
//# sourceMappingURL=migrations.js.map