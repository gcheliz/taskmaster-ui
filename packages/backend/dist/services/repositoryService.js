"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositoryService = exports.RepositoryService = void 0;
const database_1 = require("./database");
/**
 * Repository Service
 *
 * Handles repository data persistence and retrieval from the database.
 * Provides CRUD operations for repository management using Prisma.
 */
class RepositoryService {
    constructor() {
        this.dbService = database_1.DatabaseService.getInstance();
    }
    /**
     * Get repository by ID
     */
    async getRepositoryById(id) {
        try {
            const prisma = this.dbService.getPrisma();
            const repository = await prisma.repository.findUnique({
                where: { id },
                include: {
                    project: true,
                    commits: {
                        orderBy: { timestamp: 'desc' },
                        take: 10, // Include last 10 commits
                    },
                },
            });
            return repository;
        }
        catch (error) {
            console.error('Error getting repository by ID:', error);
            throw error;
        }
    }
    /**
     * Get all repositories
     */
    async getAllRepositories() {
        try {
            const prisma = this.dbService.getPrisma();
            const repositories = await prisma.repository.findMany({
                include: {
                    project: true,
                    commits: {
                        orderBy: { timestamp: 'desc' },
                        take: 5, // Include last 5 commits for each repo
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            return repositories;
        }
        catch (error) {
            console.error('Error getting all repositories:', error);
            throw error;
        }
    }
    /**
     * Get repository by path
     */
    async getRepositoryByPath(path) {
        try {
            const prisma = this.dbService.getPrisma();
            const repository = await prisma.repository.findUnique({
                where: { path },
                include: {
                    project: true,
                    commits: {
                        orderBy: { timestamp: 'desc' },
                        take: 10,
                    },
                },
            });
            return repository;
        }
        catch (error) {
            console.error('Error getting repository by path:', error);
            throw error;
        }
    }
    /**
     * Get repositories by project ID
     */
    async getRepositoriesByProjectId(projectId) {
        try {
            const prisma = this.dbService.getPrisma();
            const repositories = await prisma.repository.findMany({
                where: { projectId },
                include: {
                    project: true,
                    commits: {
                        orderBy: { timestamp: 'desc' },
                        take: 5,
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            return repositories;
        }
        catch (error) {
            console.error('Error getting repositories by project ID:', error);
            throw error;
        }
    }
    /**
     * Create a new repository
     */
    async createRepository(data) {
        try {
            const prisma = this.dbService.getPrisma();
            const repository = await prisma.repository.create({
                data: {
                    name: data.name,
                    url: data.url,
                    path: data.path,
                    branch: data.branch || 'main',
                    projectId: data.projectId,
                },
                include: {
                    project: true,
                    commits: true,
                },
            });
            return repository;
        }
        catch (error) {
            console.error('Error creating repository:', error);
            throw error;
        }
    }
    /**
     * Update repository
     */
    async updateRepository(id, updates) {
        try {
            const prisma = this.dbService.getPrisma();
            // Check if repository exists
            const existing = await prisma.repository.findUnique({
                where: { id },
            });
            if (!existing) {
                return null;
            }
            const repository = await prisma.repository.update({
                where: { id },
                data: updates,
                include: {
                    project: true,
                    commits: {
                        orderBy: { timestamp: 'desc' },
                        take: 10,
                    },
                },
            });
            return repository;
        }
        catch (error) {
            console.error('Error updating repository:', error);
            throw error;
        }
    }
    /**
     * Delete repository
     */
    async deleteRepository(id) {
        try {
            const prisma = this.dbService.getPrisma();
            // Check if repository exists
            const existing = await prisma.repository.findUnique({
                where: { id },
            });
            if (!existing) {
                return false;
            }
            // Delete repository (commits will be cascade deleted due to foreign key constraint)
            await prisma.repository.delete({
                where: { id },
            });
            return true;
        }
        catch (error) {
            console.error('Error deleting repository:', error);
            throw error;
        }
    }
    /**
     * Check if repository exists by path
     */
    async repositoryExistsByPath(path) {
        try {
            const repository = await this.getRepositoryByPath(path);
            return repository !== null;
        }
        catch (error) {
            console.error('Error checking repository existence:', error);
            throw error;
        }
    }
    /**
     * Count total repositories
     */
    async getRepositoryCount() {
        try {
            const prisma = this.dbService.getPrisma();
            const count = await prisma.repository.count();
            return count;
        }
        catch (error) {
            console.error('Error counting repositories:', error);
            throw error;
        }
    }
    /**
     * Get repository statistics
     */
    async getRepositoryStats(id) {
        try {
            const prisma = this.dbService.getPrisma();
            const [commitCount, latestCommit] = await Promise.all([
                prisma.commit.count({
                    where: { repositoryId: id },
                }),
                prisma.commit.findFirst({
                    where: { repositoryId: id },
                    orderBy: { timestamp: 'desc' },
                    select: {
                        hash: true,
                        message: true,
                        author: true,
                        timestamp: true,
                    },
                }),
            ]);
            return {
                commitCount,
                latestCommit: latestCommit || undefined,
            };
        }
        catch (error) {
            console.error('Error getting repository stats:', error);
            throw error;
        }
    }
}
exports.RepositoryService = RepositoryService;
// Export singleton instance
exports.repositoryService = new RepositoryService();
//# sourceMappingURL=repositoryService.js.map