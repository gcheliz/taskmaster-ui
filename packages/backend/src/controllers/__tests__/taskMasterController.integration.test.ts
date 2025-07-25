import request from 'supertest'
import express from 'express'
import { createTaskMasterRoutes } from '../../routes/taskMasterRoutes'
import { TaskMasterController } from '../taskMasterController'
import { TaskMasterService } from '../../services/taskMasterService'
import { ProjectService } from '../../services/projectService'
import { errorMiddleware } from '../../middleware/errorMiddleware'
import type { TaskInfo, TaskMasterResult } from '../../types/taskMaster'

// Mock the services
jest.mock('../../services/taskMasterService')
jest.mock('../../services/projectService')

describe('TaskInfo Creation API Integration Tests', () => {
  let app: express.Application
  let mockTaskMasterService: jest.Mocked<TaskMasterService>
  let mockProjectService: jest.Mocked<ProjectService>

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Create Express app
    app = express()
    app.use(express.json())

    // Create mocked services
    mockTaskMasterService = new TaskMasterService() as jest.Mocked<TaskMasterService>
    mockProjectService = new ProjectService() as jest.Mocked<ProjectService>

    // Create routes with mocked services
    const taskMasterRoutes = createTaskMasterRoutes(mockTaskMasterService)

    // Apply routes
    app.use('/api', taskMasterRoutes)
    app.use(errorMiddleware)
  })

  describe('POST /api/tasks', () => {
    const validTaskInfoData = {
      repositoryPath: '/test/repo',
      title: 'New Test TaskInfo',
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
    }

    describe('Success Cases', () => {
      it('should create a task successfully with all fields', async () => {
        // Mock service responses
        mockTaskMasterService.getProjectStatus.mockResolvedValue({
          success: true,
          data: { initialized: true },
        } as TaskMasterResult)

        mockTaskMasterService.listTasks.mockResolvedValue({
          success: true,
          data: [
            { id: '1', title: 'Existing TaskInfo 1', status: 'pending', priority: 'medium' },
            { id: '2', title: 'Existing TaskInfo 2', status: 'pending', priority: 'medium' },
          ] as TaskInfo[],
        } as TaskMasterResult)

        const createdTaskInfo = {
          id: 3,
          ...validTaskInfoData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        mockTaskMasterService.createTask.mockResolvedValue({
          success: true,
          data: createdTaskInfo,
        } as TaskMasterResult)

        const response = await request(app)
          .post('/api/tasks')
          .send(validTaskInfoData)
          .expect(201)

        expect(response.body).toMatchObject({
          task: expect.objectContaining({
            id: 3,
            title: validTaskInfoData.title,
            description: validTaskInfoData.description,
            priority: validTaskInfoData.priority,
            status: validTaskInfoData.status,
          }),
          metadata: expect.objectContaining({
            createdAt: expect.any(String),
            taskNumber: '3',
          }),
        })

        // Verify service calls
        expect(mockTaskMasterService.getProjectStatus).toHaveBeenCalledWith(validTaskInfoData.repositoryPath)
        expect(mockTaskMasterService.listTasks).toHaveBeenCalledWith(validTaskInfoData.repositoryPath, {})
        expect(mockTaskMasterService.createTask).toHaveBeenCalledWith(
          validTaskInfoData.repositoryPath,
          expect.objectContaining({
            prompt: validTaskInfoData.title,
            priority: validTaskInfoData.priority,
            status: validTaskInfoData.status,
            dependencies: '1,2',
            tags: 'test,integration',
          }),
          {}
        )
      })

      it('should create a task with minimal required fields', async () => {
        const minimalTaskInfoData = {
          repositoryPath: '/test/repo',
          title: 'Minimal TaskInfo',
          description: 'Minimal task description',
          priority: 'medium',
        }

        mockTaskMasterService.getProjectStatus.mockResolvedValue({
          success: true,
          data: { initialized: true },
        } as TaskMasterResult)

        mockTaskMasterService.listTasks.mockResolvedValue({
          success: true,
          data: [] as TaskInfo[],
        } as TaskMasterResult)

        mockTaskMasterService.createTask.mockResolvedValue({
          success: true,
          data: {
            id: 1,
            ...minimalTaskInfoData,
            status: 'pending',
            tags: [],
            dependencies: [],
          },
        } as TaskMasterResult)

        const response = await request(app)
          .post('/api/tasks')
          .send(minimalTaskInfoData)
          .expect(201)

        expect(response.body.task).toMatchObject({
          id: 1,
          title: minimalTaskInfoData.title,
          description: minimalTaskInfoData.description,
          priority: minimalTaskInfoData.priority,
          status: 'pending',
        })
      })
    })

    describe('Validation Errors', () => {
      it('should return 400 for missing repository path', async () => {
        const invalidData = { ...validTaskInfoData }
        delete (invalidData as any).repositoryPath

        const response = await request(app)
          .post('/api/tasks')
          .send(invalidData)
          .expect(400)

        expect(response.body.error).toMatchObject({
          code: 'VALIDATION_ERROR',
          message: expect.stringContaining('repositoryPath'),
        })
      })

      it('should return 400 for title too short', async () => {
        const invalidData = {
          ...validTaskInfoData,
          title: 'AB', // Less than 3 characters
        }

        const response = await request(app)
          .post('/api/tasks')
          .send(invalidData)
          .expect(400)

        expect(response.body.error).toMatchObject({
          code: 'VALIDATION_ERROR',
          message: expect.stringContaining('at least 3 characters'),
        })
      })

      it('should return 400 for description too short', async () => {
        const invalidData = {
          ...validTaskInfoData,
          description: 'Too short', // Less than 10 characters
        }

        const response = await request(app)
          .post('/api/tasks')
          .send(invalidData)
          .expect(400)

        expect(response.body.error).toMatchObject({
          code: 'VALIDATION_ERROR',
          message: expect.stringContaining('at least 10 characters'),
        })
      })

      it('should return 400 for invalid priority', async () => {
        const invalidData = {
          ...validTaskInfoData,
          priority: 'super-high', // Invalid priority
        }

        const response = await request(app)
          .post('/api/tasks')
          .send(invalidData)
          .expect(400)

        expect(response.body.error).toMatchObject({
          code: 'VALIDATION_ERROR',
          message: expect.stringContaining('priority'),
        })
      })

      it('should return 400 for past due date', async () => {
        const invalidData = {
          ...validTaskInfoData,
          dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        }

        const response = await request(app)
          .post('/api/tasks')
          .send(invalidData)
          .expect(400)

        expect(response.body.error).toMatchObject({
          code: 'VALIDATION_ERROR',
          message: expect.stringContaining('past'),
        })
      })

      it('should return 400 for invalid tags', async () => {
        const invalidData = {
          ...validTaskInfoData,
          tags: ['valid-tag', 'invalid tag!'], // Tag with invalid characters
        }

        const response = await request(app)
          .post('/api/tasks')
          .send(invalidData)
          .expect(400)

        expect(response.body.error).toMatchObject({
          code: 'VALIDATION_ERROR',
          message: expect.stringContaining('tags'),
        })
      })
    })

    describe('Business Logic Errors', () => {
      it('should return 400 if TaskInfoMaster not initialized', async () => {
        mockTaskMasterService.getProjectStatus.mockResolvedValue({
          success: true,
          data: { initialized: false },
        } as TaskMasterResult)

        const response = await request(app)
          .post('/api/tasks')
          .send(validTaskInfoData)
          .expect(400)

        expect(response.body.error).toMatchObject({
          code: 'NOT_INITIALIZED',
          message: expect.stringContaining('not initialized'),
        })
      })

      it('should return 400 for invalid dependencies', async () => {
        mockTaskMasterService.getProjectStatus.mockResolvedValue({
          success: true,
          data: { initialized: true },
        } as TaskMasterResult)

        mockTaskMasterService.listTasks.mockResolvedValue({
          success: true,
          data: [
            { id: 1, title: 'TaskInfo 1' },
            // TaskInfo 2 doesn't exist
          ] as TaskInfo[],
        } as TaskMasterResult)

        const response = await request(app)
          .post('/api/tasks')
          .send(validTaskInfoData)
          .expect(400)

        expect(response.body.error).toMatchObject({
          code: 'INVALID_DEPENDENCY',
          message: expect.stringContaining('Dependencies not found: 2'),
        })
      })

      it('should return 400 for circular dependency on subtask', async () => {
        const subtaskData = {
          ...validTaskInfoData,
          dependencies: [1], // Depends on parent task
        }

        // Mock as subtask (ID format 1.1)
        mockTaskMasterService.getProjectStatus.mockResolvedValue({
          success: true,
          data: { initialized: true },
        } as TaskMasterResult)

        mockTaskMasterService.listTasks.mockResolvedValue({
          success: true,
          data: [
            { id: 1, title: 'Parent TaskInfo' },
            { id: 1.1, title: 'Current Subtask' }, // This would be the current task
          ] as TaskInfo[],
        } as TaskMasterResult)

        const response = await request(app)
          .post('/api/tasks')
          .send(subtaskData)
          .expect(400)

        expect(response.body.error).toMatchObject({
          code: 'CIRCULAR_DEPENDENCY',
          message: expect.stringContaining('cannot depend on its parent'),
        })
      })
    })

    describe('Service Errors', () => {
      it('should return 500 for service failure', async () => {
        mockTaskMasterService.getProjectStatus.mockRejectedValue(
          new Error('Service unavailable')
        )

        const response = await request(app)
          .post('/api/tasks')
          .send(validTaskInfoData)
          .expect(500)

        expect(response.body.error).toMatchObject({
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        })
      })

      it('should handle TaskInfoMaster CLI errors', async () => {
        mockTaskMasterService.getProjectStatus.mockResolvedValue({
          success: true,
          data: { initialized: true },
        } as TaskMasterResult)

        mockTaskMasterService.listTasks.mockResolvedValue({
          success: true,
          data: [] as TaskInfo[],
        } as TaskMasterResult)

        mockTaskMasterService.createTask.mockResolvedValue({
          success: false,
          error: 'TaskInfoMaster CLI error: Invalid command',
        } as TaskMasterResult)

        const response = await request(app)
          .post('/api/tasks')
          .send(validTaskInfoData)
          .expect(500)

        expect(response.body.error).toMatchObject({
          code: 'CREATE_FAILED',
          message: expect.stringContaining('Failed to create task'),
        })
      })
    })

    describe('Edge Cases', () => {
      it('should handle special characters in task fields', async () => {
        const specialCharData = {
          ...validTaskInfoData,
          title: 'TaskInfo with "quotes" and \'apostrophes\'',
          description: 'Description with special chars: <>&$#@!',
          details: 'Code snippet: `const x = "test"`',
        }

        mockTaskMasterService.getProjectStatus.mockResolvedValue({
          success: true,
          data: { initialized: true },
        } as TaskMasterResult)

        mockTaskMasterService.listTasks.mockResolvedValue({
          success: true,
          data: [] as TaskInfo[],
        } as TaskMasterResult)

        mockTaskMasterService.createTask.mockResolvedValue({
          success: true,
          data: { id: 1, ...specialCharData },
        } as TaskMasterResult)

        const response = await request(app)
          .post('/api/tasks')
          .send(specialCharData)
          .expect(201)

        expect(response.body.task.title).toBe(specialCharData.title)
        expect(response.body.task.description).toBe(specialCharData.description)
      })

      it('should handle maximum length fields', async () => {
        const maxLengthData = {
          ...validTaskInfoData,
          title: 'A'.repeat(100), // Max length
          description: 'B'.repeat(500), // Max length
          repositoryPath: '/very/long/path/' + 'x'.repeat(450), // Near max of 500
        }

        mockTaskMasterService.getProjectStatus.mockResolvedValue({
          success: true,
          data: { initialized: true },
        } as TaskMasterResult)

        mockTaskMasterService.listTasks.mockResolvedValue({
          success: true,
          data: [] as TaskInfo[],
        } as TaskMasterResult)

        mockTaskMasterService.createTask.mockResolvedValue({
          success: true,
          data: { id: 1, ...maxLengthData },
        } as TaskMasterResult)

        const response = await request(app)
          .post('/api/tasks')
          .send(maxLengthData)
          .expect(201)

        expect(response.body.task.title).toHaveLength(100)
        expect(response.body.task.description).toHaveLength(500)
      })

      it('should handle concurrent task creation with ID generation', async () => {
        // First request
        mockTaskMasterService.getProjectStatus.mockResolvedValue({
          success: true,
          data: { initialized: true },
        } as TaskMasterResult)

        mockTaskMasterService.listTasks.mockResolvedValue({
          success: true,
          data: [
            { id: 1, title: 'TaskInfo 1' },
            { id: 2, title: 'TaskInfo 2' },
          ] as TaskInfo[],
        } as TaskMasterResult)

        // Simulate concurrent requests
        const promises = [
          request(app).post('/api/tasks').send(validTaskInfoData),
          request(app).post('/api/tasks').send({ ...validTaskInfoData, title: 'Concurrent TaskInfo 2' }),
        ]

        // Mock different responses for each call
        mockTaskMasterService.createTask
          .mockResolvedValueOnce({
            success: true,
            data: { id: 3, ...validTaskInfoData },
          } as TaskMasterResult)
          .mockResolvedValueOnce({
            success: true,
            data: { id: 4, title: 'Concurrent TaskInfo 2' },
          } as TaskMasterResult)

        const responses = await Promise.all(promises)

        // Both should succeed with different IDs
        const [response1, response2] = responses
        expect(response1?.status).toBe(201)
        expect(response2?.status).toBe(201)
        expect(response1?.body.task.id).toBe(3)
        expect(response2?.body.task.id).toBe(4)
      })
    })
  })
})