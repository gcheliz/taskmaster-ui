"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const projectController_1 = require("../projectController");
const repositoryService_1 = require("../../services/repositoryService");
const taskMasterService_1 = require("../../services/taskMasterService");
// Mock the repository service
jest.mock('../../services/repositoryService', () => ({
    repositoryService: {
        getRepositoryById: jest.fn(),
    },
}));
// Mock the TaskMaster service
jest.mock('../../services/taskMasterService', () => ({
    taskMasterService: {
        initProject: jest.fn(),
    },
}));
describe('ProjectController', () => {
    let projectController;
    let mockRequest;
    let mockResponse;
    let responseObject;
    beforeEach(() => {
        projectController = new projectController_1.ProjectController();
        responseObject = {};
        mockRequest = {
            body: {},
            params: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation((result) => {
                responseObject = result;
                return mockResponse;
            }),
        };
        jest.clearAllMocks();
    });
    describe('createProject', () => {
        it('should create project successfully with valid data', async () => {
            const mockRepository = {
                id: 'repo_123',
                path: '/Users/test/project',
                name: 'test-repo'
            };
            const mockTaskMasterResult = {
                success: true,
                data: {
                    name: 'Test Project',
                    path: '/Users/test/project',
                    taskCount: 5,
                    completedTasks: 0,
                    lastUpdated: new Date()
                },
                output: 'TaskMaster project initialized successfully',
                error: '',
                exitCode: 0,
                duration: 1500,
                command: 'task-master init',
                timestamp: new Date()
            };
            repositoryService_1.repositoryService.getRepositoryById.mockResolvedValue(mockRepository);
            taskMasterService_1.taskMasterService.initProject.mockResolvedValue(mockTaskMasterResult);
            mockRequest.body = {
                repositoryId: 'repo_123',
                projectName: 'Test Project'
            };
            await projectController.createProject(mockRequest, mockResponse);
            expect(taskMasterService_1.taskMasterService.initProject).toHaveBeenCalledWith('/Users/test/project');
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalled();
            // Verify response structure
            expect(responseObject).toHaveProperty('project');
            expect(responseObject).toHaveProperty('message');
            expect(responseObject).toHaveProperty('taskMasterInfo');
            expect(responseObject.project.status).toBe('active');
            expect(responseObject.taskMasterInfo.taskCount).toBe(5);
            expect(responseObject.taskMasterInfo.duration).toBe(1500);
            expect(responseObject.project).toBeDefined();
            expect(responseObject.project.name).toBe('Test Project');
            expect(responseObject.project.repositoryId).toBe('repo_123');
            expect(responseObject.project.repositoryPath).toBe('/Users/test/project');
            expect(responseObject.project.status).toBe('active');
            expect(responseObject.message).toBe('Project created and initialized successfully');
        });
        it('should return 500 when TaskMaster CLI initialization fails', async () => {
            const mockRepository = {
                id: 'repo_123',
                path: '/Users/test/project',
                name: 'test-repo'
            };
            const mockTaskMasterResult = {
                success: false,
                data: null,
                output: 'TaskMaster init failed: No git repository found',
                error: 'fatal: not a git repository',
                exitCode: 1,
                duration: 500,
                command: 'task-master init',
                timestamp: new Date()
            };
            repositoryService_1.repositoryService.getRepositoryById.mockResolvedValue(mockRepository);
            taskMasterService_1.taskMasterService.initProject.mockResolvedValue(mockTaskMasterResult);
            mockRequest.body = {
                repositoryId: 'repo_123',
                projectName: 'Test Project'
            };
            await projectController.createProject(mockRequest, mockResponse);
            expect(taskMasterService_1.taskMasterService.initProject).toHaveBeenCalledWith('/Users/test/project');
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject.error).toBe('Failed to initialize TaskMaster project');
            expect(responseObject.code).toBe('TASKMASTER_INIT_FAILED');
            expect(responseObject.details).toHaveProperty('output');
            expect(responseObject.details).toHaveProperty('error');
            expect(responseObject.details).toHaveProperty('exitCode');
        });
        it('should return 500 when TaskMaster CLI throws an error', async () => {
            const mockRepository = {
                id: 'repo_123',
                path: '/Users/test/project',
                name: 'test-repo'
            };
            const initError = new Error('TaskMaster CLI not found');
            repositoryService_1.repositoryService.getRepositoryById.mockResolvedValue(mockRepository);
            taskMasterService_1.taskMasterService.initProject.mockRejectedValue(initError);
            mockRequest.body = {
                repositoryId: 'repo_123',
                projectName: 'Test Project'
            };
            await projectController.createProject(mockRequest, mockResponse);
            expect(taskMasterService_1.taskMasterService.initProject).toHaveBeenCalledWith('/Users/test/project');
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject.error).toBe('Failed to initialize TaskMaster project');
            expect(responseObject.code).toBe('TASKMASTER_INIT_ERROR');
            expect(responseObject.details.message).toBe('TaskMaster CLI not found');
        });
        it('should return 400 when repositoryId is missing', async () => {
            mockRequest.body = {
                projectName: 'Test Project'
            };
            await projectController.createProject(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.error).toBe('Repository ID is required');
            expect(responseObject.code).toBe('MISSING_REPOSITORY_ID');
        });
        it('should return 400 when projectName is missing', async () => {
            mockRequest.body = {
                repositoryId: 'repo_123'
            };
            await projectController.createProject(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.error).toBe('Project name is required and must be a string');
            expect(responseObject.code).toBe('INVALID_PROJECT_NAME');
        });
        it('should return 400 when projectName is not a string', async () => {
            mockRequest.body = {
                repositoryId: 'repo_123',
                projectName: 123
            };
            await projectController.createProject(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.error).toBe('Project name is required and must be a string');
            expect(responseObject.code).toBe('INVALID_PROJECT_NAME');
        });
        it('should return 400 when projectName is too short', async () => {
            mockRequest.body = {
                repositoryId: 'repo_123',
                projectName: 'a'
            };
            await projectController.createProject(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.error).toBe('Project name must be at least 2 characters long');
            expect(responseObject.code).toBe('PROJECT_NAME_TOO_SHORT');
        });
        it('should return 400 when projectName is too long', async () => {
            mockRequest.body = {
                repositoryId: 'repo_123',
                projectName: 'a'.repeat(51)
            };
            await projectController.createProject(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.error).toBe('Project name must be less than 50 characters');
            expect(responseObject.code).toBe('PROJECT_NAME_TOO_LONG');
        });
        it('should return 400 when projectName has invalid characters', async () => {
            mockRequest.body = {
                repositoryId: 'repo_123',
                projectName: 'Test@Project!'
            };
            await projectController.createProject(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.error).toBe('Project name can only contain letters, numbers, spaces, hyphens, and underscores');
            expect(responseObject.code).toBe('INVALID_PROJECT_NAME_FORMAT');
        });
        it('should accept valid project names with allowed characters', async () => {
            const mockRepository = {
                id: 'repo_123',
                path: '/Users/test/project',
                name: 'test-repo'
            };
            const mockTaskMasterResult = {
                success: true,
                data: { taskCount: 3 },
                output: 'Project initialized',
                error: '',
                exitCode: 0,
                duration: 1000,
                command: 'task-master init',
                timestamp: new Date()
            };
            repositoryService_1.repositoryService.getRepositoryById.mockResolvedValue(mockRepository);
            taskMasterService_1.taskMasterService.initProject.mockResolvedValue(mockTaskMasterResult);
            const validNames = [
                'Test Project',
                'test-project',
                'test_project',
                'TestProject123',
                'Test Project-v2_final'
            ];
            for (const projectName of validNames) {
                mockRequest.body = {
                    repositoryId: 'repo_123',
                    projectName
                };
                await projectController.createProject(mockRequest, mockResponse);
                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(responseObject.project.name).toBe(projectName);
            }
        });
        it('should trim project name whitespace', async () => {
            const mockRepository = {
                id: 'repo_123',
                path: '/Users/test/project',
                name: 'test-repo'
            };
            const mockTaskMasterResult = {
                success: true,
                data: { taskCount: 3 },
                output: 'Project initialized',
                error: '',
                exitCode: 0,
                duration: 1000,
                command: 'task-master init',
                timestamp: new Date()
            };
            repositoryService_1.repositoryService.getRepositoryById.mockResolvedValue(mockRepository);
            taskMasterService_1.taskMasterService.initProject.mockResolvedValue(mockTaskMasterResult);
            mockRequest.body = {
                repositoryId: 'repo_123',
                projectName: '  Test Project  '
            };
            await projectController.createProject(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject.project.name).toBe('Test Project');
        });
        it('should return 404 when repository is not found', async () => {
            repositoryService_1.repositoryService.getRepositoryById.mockResolvedValue(null);
            mockRequest.body = {
                repositoryId: 'nonexistent_repo',
                projectName: 'Test Project'
            };
            await projectController.createProject(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject.error).toBe('Repository not found');
            expect(responseObject.code).toBe('REPOSITORY_NOT_FOUND');
        });
        it('should return 500 when repository service throws error', async () => {
            repositoryService_1.repositoryService.getRepositoryById.mockRejectedValue(new Error('Database error'));
            mockRequest.body = {
                repositoryId: 'repo_123',
                projectName: 'Test Project'
            };
            await projectController.createProject(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject.error).toBe('Internal server error during project creation');
            expect(responseObject.code).toBe('PROJECT_CREATION_ERROR');
        });
        it('should generate unique project IDs', async () => {
            const mockRepository = {
                id: 'repo_123',
                path: '/Users/test/project',
                name: 'test-repo'
            };
            const mockTaskMasterResult = {
                success: true,
                data: { taskCount: 3 },
                output: 'Project initialized',
                error: '',
                exitCode: 0,
                duration: 1000,
                command: 'task-master init',
                timestamp: new Date()
            };
            repositoryService_1.repositoryService.getRepositoryById.mockResolvedValue(mockRepository);
            taskMasterService_1.taskMasterService.initProject.mockResolvedValue(mockTaskMasterResult);
            mockRequest.body = {
                repositoryId: 'repo_123',
                projectName: 'Test Project'
            };
            // Create two projects
            await projectController.createProject(mockRequest, mockResponse);
            const firstProjectId = responseObject.project.id;
            await projectController.createProject(mockRequest, mockResponse);
            const secondProjectId = responseObject.project.id;
            expect(firstProjectId).not.toBe(secondProjectId);
            expect(firstProjectId).toMatch(/^proj_\d+_[a-z0-9]+$/);
            expect(secondProjectId).toMatch(/^proj_\d+_[a-z0-9]+$/);
        });
        it('should set correct tasksPath', async () => {
            const mockRepository = {
                id: 'repo_123',
                path: '/Users/test/my-project',
                name: 'my-project'
            };
            const mockTaskMasterResult = {
                success: true,
                data: { taskCount: 3 },
                output: 'Project initialized',
                error: '',
                exitCode: 0,
                duration: 1000,
                command: 'task-master init',
                timestamp: new Date()
            };
            repositoryService_1.repositoryService.getRepositoryById.mockResolvedValue(mockRepository);
            taskMasterService_1.taskMasterService.initProject.mockResolvedValue(mockTaskMasterResult);
            mockRequest.body = {
                repositoryId: 'repo_123',
                projectName: 'Test Project'
            };
            await projectController.createProject(mockRequest, mockResponse);
            expect(responseObject.project.tasksPath).toBe('/Users/test/my-project/.taskmaster/tasks/tasks.json');
        });
        it('should set createdAt timestamp', async () => {
            const mockRepository = {
                id: 'repo_123',
                path: '/Users/test/project',
                name: 'test-repo'
            };
            const mockTaskMasterResult = {
                success: true,
                data: { taskCount: 3 },
                output: 'Project initialized',
                error: '',
                exitCode: 0,
                duration: 1000,
                command: 'task-master init',
                timestamp: new Date()
            };
            repositoryService_1.repositoryService.getRepositoryById.mockResolvedValue(mockRepository);
            taskMasterService_1.taskMasterService.initProject.mockResolvedValue(mockTaskMasterResult);
            mockRequest.body = {
                repositoryId: 'repo_123',
                projectName: 'Test Project'
            };
            const beforeTime = new Date();
            await projectController.createProject(mockRequest, mockResponse);
            const afterTime = new Date();
            const createdAt = new Date(responseObject.project.createdAt);
            expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
            expect(createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
        });
    });
    describe('getProjects', () => {
        it('should return empty projects list', async () => {
            await projectController.getProjects(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject.projects).toEqual([]);
            expect(responseObject.count).toBe(0);
        });
        it('should return expected structure', async () => {
            await projectController.getProjects(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toHaveProperty('projects');
            expect(responseObject).toHaveProperty('count');
            expect(Array.isArray(responseObject.projects)).toBe(true);
        });
    });
    describe('getProjectById', () => {
        it('should return 400 when project ID is missing', async () => {
            mockRequest.params = {};
            await projectController.getProjectById(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.error).toBe('Project ID is required');
            expect(responseObject.code).toBe('MISSING_PROJECT_ID');
        });
        it('should return 404 when project is not found', async () => {
            mockRequest.params = { id: 'nonexistent_project' };
            await projectController.getProjectById(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject.error).toBe('Project not found');
            expect(responseObject.code).toBe('PROJECT_NOT_FOUND');
        });
        it('should validate project ID parameter', async () => {
            mockRequest.params = { id: 'some_project' };
            await projectController.getProjectById(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toHaveProperty('error');
            expect(responseObject).toHaveProperty('code');
        });
    });
    describe('deleteProject', () => {
        it('should return 400 when project ID is missing', async () => {
            mockRequest.params = {};
            await projectController.deleteProject(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.error).toBe('Project ID is required');
            expect(responseObject.code).toBe('MISSING_PROJECT_ID');
        });
        it('should return 404 when project is not found', async () => {
            mockRequest.params = { id: 'nonexistent_project' };
            await projectController.deleteProject(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject.error).toBe('Project not found');
            expect(responseObject.code).toBe('PROJECT_NOT_FOUND');
        });
        it('should validate project ID parameter', async () => {
            mockRequest.params = { id: 'some_project' };
            await projectController.deleteProject(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toHaveProperty('error');
            expect(responseObject).toHaveProperty('code');
        });
    });
});
//# sourceMappingURL=projectController.test.js.map