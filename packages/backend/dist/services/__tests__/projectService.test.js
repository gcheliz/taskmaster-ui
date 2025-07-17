"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const projectService_1 = require("../projectService");
const database_1 = require("../database");
// Mock the database service
jest.mock('../database');
describe('ProjectService', () => {
    let projectService;
    let mockPrisma;
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        // Create mock Prisma client
        mockPrisma = {
            project: {
                create: jest.fn(),
                findUnique: jest.fn(),
                findMany: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                count: jest.fn(),
            },
            $transaction: jest.fn(),
        };
        // Mock DatabaseService
        const mockDbService = {
            getPrisma: jest.fn().mockReturnValue(mockPrisma),
            transaction: jest.fn().mockImplementation((callback) => callback(mockPrisma)),
        };
        database_1.DatabaseService.getInstance.mockReturnValue(mockDbService);
        projectService = new projectService_1.ProjectService();
    });
    describe('createProject', () => {
        it('should create a project successfully', async () => {
            const projectData = {
                name: 'Test Project',
                description: 'A test project',
                path: '/test/path'
            };
            const mockProject = {
                id: 'proj_123',
                name: 'Test Project',
                description: 'A test project',
                path: '/test/path',
                createdAt: new Date(),
                updatedAt: new Date(),
                repositories: [],
                tasks: []
            };
            mockPrisma.project.create.mockResolvedValue(mockProject);
            const result = await projectService.createProject(projectData);
            expect(mockPrisma.project.create).toHaveBeenCalledWith({
                data: {
                    name: projectData.name,
                    description: projectData.description,
                    path: projectData.path
                },
                include: {
                    repositories: true,
                    tasks: true
                }
            });
            expect(result).toEqual(mockProject);
        });
        it('should handle database errors gracefully', async () => {
            const projectData = {
                name: 'Test Project',
                path: '/test/path'
            };
            const dbError = new Error('Database connection failed');
            mockPrisma.project.create.mockRejectedValue(dbError);
            await expect(projectService.createProject(projectData)).rejects.toThrow(dbError);
            expect(mockPrisma.project.create).toHaveBeenCalled();
        });
    });
    describe('getProjectById', () => {
        it('should return a project when found', async () => {
            const projectId = 'proj_123';
            const mockProject = {
                id: projectId,
                name: 'Test Project',
                path: '/test/path',
                repositories: [],
                tasks: [],
                _count: { repositories: 0, tasks: 0 }
            };
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            const result = await projectService.getProjectById(projectId);
            expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
                where: { id: projectId },
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
            expect(result).toEqual(mockProject);
        });
        it('should return null when project not found', async () => {
            const projectId = 'nonexistent';
            mockPrisma.project.findUnique.mockResolvedValue(null);
            const result = await projectService.getProjectById(projectId);
            expect(result).toBeNull();
        });
    });
    describe('findOrCreateProject', () => {
        it('should return existing project if found', async () => {
            const projectData = {
                name: 'Test Project',
                path: '/test/path'
            };
            const existingProject = {
                id: 'proj_123',
                name: 'Test Project',
                path: '/test/path',
                repositories: [],
                tasks: []
            };
            mockPrisma.project.findUnique.mockResolvedValue(existingProject);
            const result = await projectService.findOrCreateProject(projectData);
            expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
                where: { path: projectData.path },
                include: {
                    repositories: true,
                    tasks: true
                }
            });
            expect(mockPrisma.project.create).not.toHaveBeenCalled();
            expect(result).toEqual(existingProject);
        });
        it('should create new project if not found', async () => {
            const projectData = {
                name: 'Test Project',
                path: '/test/path',
                description: 'A test project'
            };
            const newProject = {
                id: 'proj_456',
                name: 'Test Project',
                path: '/test/path',
                description: 'A test project',
                repositories: [],
                tasks: []
            };
            mockPrisma.project.findUnique.mockResolvedValue(null);
            mockPrisma.project.create.mockResolvedValue(newProject);
            const result = await projectService.findOrCreateProject(projectData);
            expect(mockPrisma.project.findUnique).toHaveBeenCalled();
            expect(mockPrisma.project.create).toHaveBeenCalledWith({
                data: {
                    name: projectData.name,
                    description: projectData.description,
                    path: projectData.path
                },
                include: {
                    repositories: true,
                    tasks: true
                }
            });
            expect(result).toEqual(newProject);
        });
    });
    describe('deleteProject', () => {
        it('should delete project successfully when it exists', async () => {
            const projectId = 'proj_123';
            const existingProject = { id: projectId, name: 'Test' };
            mockPrisma.project.findUnique.mockResolvedValue(existingProject);
            mockPrisma.project.delete.mockResolvedValue(existingProject);
            const result = await projectService.deleteProject(projectId);
            expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
                where: { id: projectId }
            });
            expect(mockPrisma.project.delete).toHaveBeenCalledWith({
                where: { id: projectId }
            });
            expect(result).toBe(true);
        });
        it('should return false when project does not exist', async () => {
            const projectId = 'nonexistent';
            mockPrisma.project.findUnique.mockResolvedValue(null);
            const result = await projectService.deleteProject(projectId);
            expect(mockPrisma.project.findUnique).toHaveBeenCalled();
            expect(mockPrisma.project.delete).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });
    describe('projectExistsByPath', () => {
        it('should return true when project exists', async () => {
            const path = '/test/path';
            const mockProject = { id: 'proj_123', path };
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            const result = await projectService.projectExistsByPath(path);
            expect(result).toBe(true);
        });
        it('should return false when project does not exist', async () => {
            const path = '/test/path';
            mockPrisma.project.findUnique.mockResolvedValue(null);
            const result = await projectService.projectExistsByPath(path);
            expect(result).toBe(false);
        });
    });
    describe('getProjectCount', () => {
        it('should return correct project count', async () => {
            const count = 5;
            mockPrisma.project.count.mockResolvedValue(count);
            const result = await projectService.getProjectCount();
            expect(mockPrisma.project.count).toHaveBeenCalled();
            expect(result).toBe(count);
        });
    });
    describe('error handling', () => {
        it('should throw descriptive errors for database failures', async () => {
            const projectData = {
                name: 'Test Project',
                path: '/test/path'
            };
            const dbError = new Error('Connection failed');
            mockPrisma.project.findUnique.mockRejectedValue(dbError);
            await expect(projectService.findOrCreateProject(projectData))
                .rejects
                .toThrow('Failed to find or create project: Connection failed');
        });
        it('should handle unknown errors gracefully', async () => {
            const projectData = {
                name: 'Test Project',
                path: '/test/path'
            };
            mockPrisma.project.findUnique.mockRejectedValue('unknown error');
            await expect(projectService.findOrCreateProject(projectData))
                .rejects
                .toThrow('Failed to find or create project: Unknown error');
        });
    });
});
//# sourceMappingURL=projectService.test.js.map