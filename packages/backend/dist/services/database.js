"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const prisma_1 = require("../generated/prisma");
class DatabaseService {
    constructor() {
        this.prisma = null;
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    async connect() {
        if (this.prisma) {
            return;
        }
        try {
            this.prisma = new prisma_1.PrismaClient({
                log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
            });
            // Test the connection
            await this.prisma.$connect();
            console.log('Connected to PostgreSQL database via Prisma');
        }
        catch (error) {
            console.error('Error connecting to database:', error);
            throw error;
        }
    }
    async disconnect() {
        if (!this.prisma) {
            return;
        }
        try {
            await this.prisma.$disconnect();
            console.log('Disconnected from PostgreSQL database');
            this.prisma = null;
        }
        catch (error) {
            console.error('Error disconnecting from database:', error);
            throw error;
        }
    }
    getPrisma() {
        if (!this.prisma) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.prisma;
    }
    async healthCheck() {
        try {
            if (!this.prisma) {
                return false;
            }
            // Simple query to test database connectivity
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            console.error('Database health check failed:', error);
            return false;
        }
    }
    async getStats() {
        if (!this.prisma) {
            throw new Error('Database not connected. Call connect() first.');
        }
        try {
            const [projectCount, repositoryCount, taskCount, commitCount] = await Promise.all([
                this.prisma.project.count(),
                this.prisma.repository.count(),
                this.prisma.task.count(),
                this.prisma.commit.count(),
            ]);
            return {
                projectCount,
                repositoryCount,
                taskCount,
                commitCount,
            };
        }
        catch (error) {
            console.error('Error getting database stats:', error);
            throw error;
        }
    }
    /**
     * Transaction wrapper for complex operations
     */
    async transaction(fn) {
        if (!this.prisma) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.prisma.$transaction(fn);
    }
    /**
     * Initialize database schema using Prisma migrations
     * This should be called during application startup
     */
    async initializeSchema() {
        console.log('Schema initialization is handled by Prisma migrations');
        console.log('Use "prisma migrate deploy" in production or "prisma migrate dev" in development');
    }
}
exports.DatabaseService = DatabaseService;
exports.default = DatabaseService.getInstance();
//# sourceMappingURL=database.js.map