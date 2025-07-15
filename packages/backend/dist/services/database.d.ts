import sqlite3 from 'sqlite3';
export declare class MigrationService {
    private dbService;
    constructor(dbService: DatabaseService);
    getCurrentVersion(): Promise<number>;
    runMigrations(): Promise<void>;
}
export declare class DatabaseService {
    private static instance;
    private db;
    private migrationService;
    private constructor();
    static getInstance(): DatabaseService;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getDb(): sqlite3.Database;
    run(sql: string, params?: any[]): Promise<sqlite3.RunResult>;
    get(sql: string, params?: any[]): Promise<any>;
    all(sql: string, params?: any[]): Promise<any[]>;
    initializeSchema(): Promise<void>;
    getMigrationService(): MigrationService;
}
declare const _default: DatabaseService;
export default _default;
//# sourceMappingURL=database.d.ts.map