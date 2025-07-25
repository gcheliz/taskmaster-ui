"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const taskMasterRoutes_1 = require("../../routes/taskMasterRoutes");
const taskMasterController_1 = require("../taskMasterController");
const taskMasterService_1 = require("../../services/taskMasterService");
const projectService_1 = require("../../services/projectService");
const errorMiddleware_1 = require("../../middleware/errorMiddleware");
// Mock the services
jest.mock('../../services/taskMasterService');
jest.mock('../../services/projectService');
describe('Task Creation API Integration Tests', () => {
    let app;
    let mockTaskMasterService;
    let mockProjectService;
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        // Create Express app
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        // Create mocked services
        mockTaskMasterService = new taskMasterService_1.TaskMasterService();
        mockProjectService = new projectService_1.ProjectService({});
        // Create controller with mocked services
        const controller = new taskMasterController_1.TaskMasterController(mockTaskMasterService, mockProjectService);
        // Apply routes
        app.use('/api', (0, taskMasterRoutes_1.taskMasterRouter)(controller));
        app.use(errorMiddleware_1.errorMiddleware);
    });
    describe('POST /api/tasks', () => {
        const validTaskData = {
            repositoryPath: '/test/repo',
            title: 'New Test Task',
            description: 'This is a test task description',
            priority: 'high',
            status: 'pending',
            assignedTo: 'test@example.com',
            dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            estimatedHours: 8,
            tags: ['test', 'integration'],
            dependencies: [1, 2],
            details: 'Implementation details',
            testStrategy: 'Unit and integration tests',
        };
        describe('Success Cases', () => {
            it('should create a task successfully with all fields', async () => {
                // Mock service responses
                mockTaskMasterService.getProjectStatus.mockResolvedValue({
                    success: true,
                    data: { initialized: true },
                });
                mockTaskMasterService.listTasks.mockResolvedValue({
                    success: true,
                    data: [
                        { id: 1, title: 'Existing Task 1' },
                        { id: 2, title: 'Existing Task 2' },
                    ],
                });
                const createdTask = {
                    id: 3,
                    ...validTaskData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                mockTaskMasterService.createTask.mockResolvedValue({
                    success: true,
                    data: createdTask,
                });
                const response = await (0, supertest_1.default)(app)
                    .post('/api/tasks')
                    .send(validTaskData)
                    .expect(201);
                expect(response.body).toMatchObject({
                    task: expect.objectContaining({
                        id: 3,
                        title: validTaskData.title,
                        description: validTaskData.description,
                        priority: validTaskData.priority,
                        status: validTaskData.status,
                    }),
                    metadata: expect.objectContaining({
                        createdAt: expect.any(String),
                        taskNumber: '3',
                    }),
                });
                // Verify service calls
                expect(mockTaskMasterService.getProjectStatus).toHaveBeenCalledWith(validTaskData.repositoryPath);
                expect(mockTaskMasterService.listTasks).toHaveBeenCalledWith(validTaskData.repositoryPath, {});
                expect(mockTaskMasterService.createTask).toHaveBeenCalledWith(validTaskData.repositoryPath, expect.objectContaining({
                    prompt: validTaskData.title,
                    priority: validTaskData.priority,
                    status: validTaskData.status,
                    dependencies: '1,2',
                    tags: 'test,integration',
                }), {});
            });
            it('should create a task with minimal required fields', async () => {
                const minimalTaskData = {
                    repositoryPath: '/test/repo',
                    title: 'Minimal Task',
                    description: 'Minimal task description',
                    priority: 'medium',
                };
                mockTaskMasterService.getProjectStatus.mockResolvedValue({
                    success: true,
                    data: { initialized: true },
                });
                mockTaskMasterService.listTasks.mockResolvedValue({
                    success: true,
                    data: [],
                });
                mockTaskMasterService.createTask.mockResolvedValue({
                    success: true,
                    data: {
                        id: 1,
                        ...minimalTaskData,
                        status: 'pending',
                        tags: [],
                        dependencies: [],
                    },
                });
                const response = await (0, supertest_1.default)(app)
                    .post('/api/tasks')
                    .send(minimalTaskData)
                    .expect(201);
                expect(response.body.task).toMatchObject({
                    id: 1,
                    title: minimalTaskData.title,
                    description: minimalTaskData.description,
                    priority: minimalTaskData.priority,
                    status: 'pending',
                });
            });
        });
        describe('Validation Errors', () => {
            it('should return 400 for missing repository path', async () => {
                const invalidData = { ...validTaskData };
                delete invalidData.repositoryPath;
                const response = await (0, supertest_1.default)(app)
                    .post('/api/tasks')
                    .send(invalidData)
                    .expect(400);
                expect(response.body.error).toMatchObject({
                    code: 'VALIDATION_ERROR',
                    message: expect.stringContaining('repositoryPath'),
                });
            });
            it('should return 400 for title too short', async () => {
                const invalidData = {
                    ...validTaskData,
                    title: 'AB', // Less than 3 characters
                };
                const response = await (0, supertest_1.default)(app)
                    .post('/api/tasks')
                    .send(invalidData)
                    .expect(400);
                expect(response.body.error).toMatchObject({
                    code: 'VALIDATION_ERROR',
                    message: expect.stringContaining('at least 3 characters'),
                });
            });
            it('should return 400 for description too short', async () => {
                const invalidData = {
                    ...validTaskData,
                    description: 'Too short', // Less than 10 characters
                };
                const response = await (0, supertest_1.default)(app)
                    .post('/api/tasks')
                    .send(invalidData)
                    .expect(400);
                expect(response.body.error).toMatchObject({
                    code: 'VALIDATION_ERROR',
                    message: expect.stringContaining('at least 10 characters'),
                });
            });
            it('should return 400 for invalid priority', async () => {
                const invalidData = {
                    ...validTaskData,
                    priority: 'super-high', // Invalid priority
                };
                const response = await (0, supertest_1.default)(app)
                    .post('/api/tasks')
                    .send(invalidData)
                    .expect(400);
                expect(response.body.error).toMatchObject({
                    code: 'VALIDATION_ERROR',
                    message: expect.stringContaining('priority'),
                });
            });
            it('should return 400 for past due date', async () => {
                const invalidData = {
                    ...validTaskData,
                    dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                };
                const response = await (0, supertest_1.default)(app)
                    .post('/api/tasks')
                    .send(invalidData)
                    .expect(400);
                expect(response.body.error).toMatchObject({
                    code: 'VALIDATION_ERROR',
                    message: expect.stringContaining('past'),
                });
            });
            it('should return 400 for invalid tags', async () => {
                const invalidData = {
                    ...validTaskData,
                    tags: ['valid-tag', 'invalid tag!'], // Tag with invalid characters
                };
                const response = await (0, supertest_1.default)(app)
                    .post('/api/tasks')
                    .send(invalidData)
                    .expect(400);
                expect(response.body.error).toMatchObject({
                    code: 'VALIDATION_ERROR',
                    message: expect.stringContaining('tags'),
                });
            });
        });
        describe('Business Logic Errors', () => {
            it('should return 400 if TaskMaster not initialized', async () => {
                mockTaskMasterService.getProjectStatus.mockResolvedValue({
                    success: true,
                    data: { initialized: false },
                });
                const response = await (0, supertest_1.default)(app)
                    .post('/api/tasks')
                    .send(validTaskData)
                    .expect(400);
                expect(response.body.error).toMatchObject({
                    code: 'NOT_INITIALIZED',
                    message: expect.stringContaining('not initialized'),
                });
            });
            it('should return 400 for invalid dependencies', async () => {
                mockTaskMasterService.getProjectStatus.mockResolvedValue({
                    success: true,
                    data: { initialized: true },
                });
                mockTaskMasterService.listTasks.mockResolvedValue({
                    success: true,
                    data: [
                        { id: 1, title: 'Task 1' },
                        // Task 2 doesn't exist
                    ],
                });
                const response = await (0, supertest_1.default)(app)
                    .post('/api/tasks')
                    .send(validTaskData)
                    .expect(400);
                expect(response.body.error).toMatchObject({
                    code: 'INVALID_DEPENDENCY',
                    message: expect.stringContaining('Dependencies not found: 2'),
                });
            });
            it('should return 400 for circular dependency on subtask', async () => {
                const subtaskData = {
                    ...validTaskData,
                    dependencies: [1], // Depends on parent task
                };
                // Mock as subtask (ID format 1.1)
                mockTaskMasterService.getProjectStatus.mockResolvedValue({
                    success: true,
                    data: { initialized: true },
                });
                mockTaskMasterService.listTasks.mockResolvedValue({
                    success: true,
                    data: [
                        { id: 1, title: 'Parent Task' },
                        { id: 1.1, title: 'Current Subtask' }, // This would be the current task
                    ],
                });
                const response = await (0, supertest_1.default)(app)
                    .post('/api/tasks')
                    .send(subtaskData)
                    .expect(400);
                expect(response.body.error).toMatchObject({
                    code: 'CIRCULAR_DEPENDENCY',
                    message: expect.stringContaining('cannot depend on its parent'),
                });
            });
        });
        describe('Service Errors', () => {
            it('should return 500 for service failure', async () => {
                mockTaskMasterService.getProjectStatus.mockRejectedValue(new Error('Service unavailable'));
                const response = await (0, supertest_1.default)(app)
                    .post('/api/tasks')
                    .send(validTaskData)
                    .expect(500);
                expect(response.body.error).toMatchObject({
                    code: 'INTERNAL_ERROR',
                    message: 'An unexpected error occurred',
                });
            });
            it('should handle TaskMaster CLI errors', async () => {
                mockTaskMasterService.getProjectStatus.mockResolvedValue({
                    success: true,
                    data: { initialized: true },
                });
                mockTaskMasterService.listTasks.mockResolvedValue({
                    success: true,
                    data: [],
                });
                mockTaskMasterService.createTask.mockResolvedValue({
                    success: false,
                    error: 'TaskMaster CLI error: Invalid command',
                });
                const response = await (0, supertest_1.default)(app)
                    .post('/api/tasks')
                    .send(validTaskData)
                    .expect(500);
                expect(response.body.error).toMatchObject({
                    code: 'CREATE_FAILED',
                    message: expect.stringContaining('Failed to create task'),
                });
            });
        });
        describe('Edge Cases', () => {
            it('should handle special characters in task fields', async () => {
                const specialCharData = {
                    ...validTaskData,
                    title: 'Task with "quotes" and \'apostrophes\'',
                    description: 'Description with special chars: <>&$#@!',
                    details: 'Code snippet: `const x = "test"`',
                };
                mockTaskMasterService.getProjectStatus.mockResolvedValue({
                    success: true,
                    data: { initialized: true },
                });
                mockTaskMasterService.listTasks.mockResolvedValue({
                    success: true,
                    data: [],
                });
                mockTaskMasterService.createTask.mockResolvedValue({
                    success: true,
                    data: { id: 1, ...specialCharData },
                });
                const response = await (0, supertest_1.default)(app)
                    .post('/api/tasks')
                    .send(specialCharData)
                    .expect(201);
                expect(response.body.task.title).toBe(specialCharData.title);
                expect(response.body.task.description).toBe(specialCharData.description);
            });
            it('should handle maximum length fields', async () => {
                const maxLengthData = {
                    ...validTaskData,
                    title: 'A'.repeat(100), // Max length
                    description: 'B'.repeat(500), // Max length
                    repositoryPath: '/very/long/path/' + 'x'.repeat(450), // Near max of 500
                };
                mockTaskMasterService.getProjectStatus.mockResolvedValue({
                    success: true,
                    data: { initialized: true },
                });
                mockTaskMasterService.listTasks.mockResolvedValue({
                    success: true,
                    data: [],
                });
                mockTaskMasterService.createTask.mockResolvedValue({
                    success: true,
                    data: { id: 1, ...maxLengthData },
                });
                const response = await (0, supertest_1.default)(app)
                    .post('/api/tasks')
                    .send(maxLengthData)
                    .expect(201);
                expect(response.body.task.title).toHaveLength(100);
                expect(response.body.task.description).toHaveLength(500);
            });
            it('should handle concurrent task creation with ID generation', async () => {
                // First request
                mockTaskMasterService.getProjectStatus.mockResolvedValue({
                    success: true,
                    data: { initialized: true },
                });
                mockTaskMasterService.listTasks.mockResolvedValue({
                    success: true,
                    data: [
                        { id: 1, title: 'Task 1' },
                        { id: 2, title: 'Task 2' },
                    ],
                });
                // Simulate concurrent requests
                const promises = [
                    (0, supertest_1.default)(app).post('/api/tasks').send(validTaskData),
                    (0, supertest_1.default)(app).post('/api/tasks').send({ ...validTaskData, title: 'Concurrent Task 2' }),
                ];
                // Mock different responses for each call
                mockTaskMasterService.createTask
                    .mockResolvedValueOnce({
                    success: true,
                    data: { id: 3, ...validTaskData },
                })
                    .mockResolvedValueOnce({
                    success: true,
                    data: { id: 4, title: 'Concurrent Task 2' },
                });
                const responses = await Promise.all(promises);
                // Both should succeed with different IDs
                expect(responses[0].status).toBe(201);
                expect(responses[1].status).toBe(201);
                expect(responses[0].body.task.id).toBe(3);
                expect(responses[1].body.task.id).toBe(4);
            });
        });
    });
});
//# sourceMappingURL=taskMasterController.integration.test.js.map