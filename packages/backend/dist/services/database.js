"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const queryAnalyzer_1 = __importDefault(require("./queryAnalyzer"));
const environment_1 = require("../config/environment");
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
            // Get database configuration with SSL support
            const dbConfig = (0, environment_1.getDatabaseConfig)();
            // Use enhanced Prisma client with query analysis and SSL configuration
            this.prisma = queryAnalyzer_1.default.createEnhancedPrismaClient(dbConfig);
            // Test the connection
            await this.prisma.$connect();
            console.log('Connected to PostgreSQL database via Prisma');
            if (environment_1.env.DATABASE_SSL === 'true') {
                console.log('🔒 SSL/TLS encryption enabled for database connection');
            }
            if (queryAnalyzer_1.default.getEnabled()) {
                console.log('🔍 Query performance analysis enabled');
            }
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
            // Get connection pool information
            let connectionInfo = null;
            try {
                // Query PostgreSQL stats for connection monitoring
                const poolStats = await this.prisma.$queryRaw `
          SELECT 
            application_name,
            state,
            count(*) as connection_count,
            ssl
          FROM pg_stat_activity 
          WHERE application_name = 'taskmaster-ui-backend'
          GROUP BY application_name, state, ssl
        `;
                connectionInfo = poolStats;
            }
            catch (poolError) {
                console.warn('Could not retrieve connection pool stats:', poolError);
            }
            return {
                projectCount,
                repositoryCount,
                taskCount,
                commitCount,
                connectionInfo,
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
        // Validate database connection security in production
        if (environment_1.env.NODE_ENV === 'production' && environment_1.env.DATABASE_SSL !== 'true') {
            console.warn('⚠️  Database SSL is disabled in production environment');
        }
    }
    /**
     * Get query performance analysis
     */
    getQueryAnalysis() {
        return queryAnalyzer_1.default.getPerformanceSummary();
    }
    /**
     * Record performance metric for an operation
     */
    recordPerformanceMetric(metric) {
        queryAnalyzer_1.default.recordPerformanceMetric(metric);
    }
    /**
     * Clear query logs and metrics
     */
    clearQueryLogs() {
        queryAnalyzer_1.default.clearLogs();
    }
    /**
     * Export query logs for analysis
     */
    exportQueryLogs(outputPath) {
        queryAnalyzer_1.default.exportLogs(outputPath);
    }
}
exports.DatabaseService = DatabaseService;
exports.default = DatabaseService.getInstance();
//# sourceMappingURL=database.js.map