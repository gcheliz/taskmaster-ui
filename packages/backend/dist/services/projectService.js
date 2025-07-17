"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = exports.ProjectService = void 0;
const database_1 = require("./database");
/**
 * Project Service
 *
 * Handles project data persistence and retrieval from the database.
 * Provides CRUD operations for project management using Prisma.
 */
class ProjectService {
    constructor() {
        this.dbService = database_1.DatabaseService.getInstance();
    }
    /**
     * Create a new project
     */
    async createProject(data) {
        try {
            const prisma = this.dbService.getPrisma();
            const project = await prisma.project.create({
                data: {
                    name: data.name,
                    description: data.description,
                    path: data.path
                },
                include: {
                    repositories: true,
                    tasks: true
                }
            });
            return project;
        }
        catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }
    /**
     * Get project by ID
     */
    async getProjectById(id) {
        try {
            const prisma = this.dbService.getPrisma();
            const project = await prisma.project.findUnique({
                where: { id },
                include: {
                    repositories: {
                        include: {
                            commits: {
                                orderBy: { timestamp: 'desc' },
                                take: 5
                            }
                        }
                    },
                    tasks: {
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    },
                    _count: {
                        select: {
                            repositories: true,
                            tasks: true
                        }
                    }
                }
            });
            return project;
        }
        catch (error) {
            console.error('Error getting project by ID:', error);
            throw error;
        }
    }
    /**
     * Get project by name
     */
    async getProjectByName(name) {
        try {
            const prisma = this.dbService.getPrisma();
            const project = await prisma.project.findUnique({
                where: { name },
                include: {
                    repositories: true,
                    tasks: true
                }
            });
            return project;
        }
        catch (error) {
            console.error('Error getting project by name:', error);
            throw error;
        }
    }
    /**
     * Get project by path
     */
    async getProjectByPath(path) {
        try {
            const prisma = this.dbService.getPrisma();
            const project = await prisma.project.findUnique({
                where: { path },
                include: {
                    repositories: true,
                    tasks: true
                }
            });
            return project;
        }
        catch (error) {
            console.error('Error getting project by path:', error);
            throw error;
        }
    }
    /**
     * Get all projects
     */
    async getAllProjects() {
        try {
            const prisma = this.dbService.getPrisma();
            const projects = await prisma.project.findMany({
                include: {
                    repositories: {
                        include: {
                            commits: {
                                orderBy: { timestamp: 'desc' },
                                take: 3
                            }
                        }
                    },
                    tasks: {
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    },
                    _count: {
                        select: {
                            repositories: true,
                            tasks: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return projects;
        }
        catch (error) {
            console.error('Error getting all projects:', error);
            throw error;
        }
    }
    /**
     * Update project
     */
    async updateProject(id, updates) {
        try {
            const prisma = this.dbService.getPrisma();
            // Check if project exists
            const existing = await prisma.project.findUnique({
                where: { id }
            });
            if (!existing) {
                return null;
            }
            const project = await prisma.project.update({
                where: { id },
                data: updates,
                include: {
                    repositories: true,
                    tasks: true
                }
            });
            return project;
        }
        catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    }
    /**
     * Delete project
     */
    async deleteProject(id) {
        try {
            const prisma = this.dbService.getPrisma();
            // Check if project exists
            const existing = await prisma.project.findUnique({
                where: { id }
            });
            if (!existing) {
                return false;
            }
            // Delete project (repositories and tasks will be cascade deleted)
            await prisma.project.delete({
                where: { id }
            });
            return true;
        }
        catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }
    /**
     * Check if project exists by name
     */
    async projectExistsByName(name) {
        try {
            const project = await this.getProjectByName(name);
            return project !== null;
        }
        catch (error) {
            console.error('Error checking project existence by name:', error);
            throw error;
        }
    }
    /**
     * Check if project exists by path
     */
    async projectExistsByPath(path) {
        try {
            const project = await this.getProjectByPath(path);
            return project !== null;
        }
        catch (error) {
            console.error('Error checking project existence by path:', error);
            throw error;
        }
    }
    /**
     * Count total projects
     */
    async getProjectCount() {
        try {
            const prisma = this.dbService.getPrisma();
            const count = await prisma.project.count();
            return count;
        }
        catch (error) {
            console.error('Error counting projects:', error);
            throw error;
        }
    }
    /**
     * Get project statistics
     */
    async getProjectStats(id) {
        try {
            const prisma = this.dbService.getPrisma();
            const [repositoryCount, taskCount, completedTasks, pendingTasks, latestRepository, latestTask] = await Promise.all([
                prisma.repository.count({ where: { projectId: id } }),
                prisma.task.count({ where: { projectId: id } }),
                prisma.task.count({
                    where: {
                        projectId: id,
                        status: 'COMPLETED'
                    }
                }),
                prisma.task.count({
                    where: {
                        projectId: id,
                        status: 'PENDING'
                    }
                }),
                prisma.repository.findFirst({
                    where: { projectId: id },
                    orderBy: { createdAt: 'desc' },
                    select: {
                        name: true,
                        path: true,
                        createdAt: true
                    }
                }),
                prisma.task.findFirst({
                    where: { projectId: id },
                    orderBy: { createdAt: 'desc' },
                    select: {
                        title: true,
                        status: true,
                        createdAt: true
                    }
                })
            ]);
            return {
                repositoryCount,
                taskCount,
                completedTasks,
                pendingTasks,
                latestRepository: latestRepository || undefined,
                latestTask: latestTask || undefined
            };
        }
        catch (error) {
            console.error('Error getting project stats:', error);
            throw error;
        }
    }
    /**
     * Find or create project by path
     * Useful for TaskMaster CLI integration
     */
    async findOrCreateProject(data) {
        try {
            // Use transaction to ensure consistency
            return await this.dbService.transaction(async (prisma) => {
                // First try to find existing project by path
                const existing = await prisma.project.findUnique({
                    where: { path: data.path },
                    include: {
                        repositories: true,
                        tasks: true
                    }
                });
                if (existing) {
                    return existing;
                }
                // Create new project if not found
                const project = await prisma.project.create({
                    data: {
                        name: data.name,
                        description: data.description,
                        path: data.path
                    },
                    include: {
                        repositories: true,
                        tasks: true
                    }
                });
                return project;
            });
        }
        catch (error) {
            console.error('Error finding or creating project:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to find or create project: ${error.message}`);
            }
            throw new Error('Failed to find or create project: Unknown error');
        }
    }
    /**
     * Create project with repository in a transaction
     */
    async createProjectWithRepository(projectData, repositoryData) {
        try {
            return await this.dbService.transaction(async (prisma) => {
                // Create project first
                const project = await prisma.project.create({
                    data: {
                        name: projectData.name,
                        description: projectData.description,
                        path: projectData.path
                    }
                });
                // Create repository linked to the project
                const repository = await prisma.repository.create({
                    data: {
                        name: repositoryData.name,
                        url: repositoryData.url,
                        path: repositoryData.path,
                        branch: repositoryData.branch || 'main',
                        projectId: project.id
                    }
                });
                return { project, repository };
            });
        }
        catch (error) {
            console.error('Error creating project with repository:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to create project with repository: ${error.message}`);
            }
            throw new Error('Failed to create project with repository: Unknown error');
        }
    }
}
exports.ProjectService = ProjectService;
// Export singleton instance
exports.projectService = new ProjectService();
//# sourceMappingURL=projectService.js.map