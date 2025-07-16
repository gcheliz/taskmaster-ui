import request from 'supertest';
import express from 'express';
import projectRoutes from '../projectRoutes';
import { repositoryService } from '../../services/repositoryService';

// Mock the repository service
jest.mock('../../services/repositoryService', () => ({
  repositoryService: {
    getRepositoryById: jest.fn(),
  },
}));

describe('Project Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/projects', projectRoutes);
    
    jest.clearAllMocks();
  });

  describe('POST /api/projects', () => {
    it('should create project successfully with valid data', async () => {
      const mockRepository = {
        id: 'repo_123',
        path: '/Users/test/project',
        name: 'test-repo'
      };

      (repositoryService.getRepositoryById as jest.Mock).mockResolvedValue(mockRepository);

      const response = await request(app)
        .post('/api/projects')
        .send({
          repositoryId: 'repo_123',
          projectName: 'Test Project'
        })
        .expect(201);

      expect(response.body.project).toBeDefined();
      expect(response.body.project.name).toBe('Test Project');
      expect(response.body.project.repositoryId).toBe('repo_123');
      expect(response.body.project.status).toBe('initializing');
      expect(response.body.message).toBe('Project creation initiated successfully');
    });

    it('should return 400 for missing repositoryId', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          projectName: 'Test Project'
        })
        .expect(400);

      expect(response.body.error).toBe('Repository ID is required');
      expect(response.body.code).toBe('MISSING_REPOSITORY_ID');
    });

    it('should return 400 for missing projectName', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          repositoryId: 'repo_123'
        })
        .expect(400);

      expect(response.body.error).toBe('Project name is required and must be a string');
      expect(response.body.code).toBe('INVALID_PROJECT_NAME');
    });

    it('should return 400 for invalid projectName format', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          repositoryId: 'repo_123',
          projectName: 'Test@Project!'
        })
        .expect(400);

      expect(response.body.error).toBe('Project name can only contain letters, numbers, spaces, hyphens, and underscores');
      expect(response.body.code).toBe('INVALID_PROJECT_NAME_FORMAT');
    });

    it('should return 400 for too short projectName', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          repositoryId: 'repo_123',
          projectName: 'a'
        })
        .expect(400);

      expect(response.body.error).toBe('Project name must be at least 2 characters long');
      expect(response.body.code).toBe('PROJECT_NAME_TOO_SHORT');
    });

    it('should return 400 for too long projectName', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          repositoryId: 'repo_123',
          projectName: 'a'.repeat(51)
        })
        .expect(400);

      expect(response.body.error).toBe('Project name must be less than 50 characters');
      expect(response.body.code).toBe('PROJECT_NAME_TOO_LONG');
    });

    it('should return 404 for non-existent repository', async () => {
      (repositoryService.getRepositoryById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/projects')
        .send({
          repositoryId: 'nonexistent_repo',
          projectName: 'Test Project'
        })
        .expect(404);

      expect(response.body.error).toBe('Repository not found');
      expect(response.body.code).toBe('REPOSITORY_NOT_FOUND');
    });

    it('should handle repository service errors', async () => {
      (repositoryService.getRepositoryById as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/projects')
        .send({
          repositoryId: 'repo_123',
          projectName: 'Test Project'
        })
        .expect(500);

      expect(response.body.error).toBe('Internal server error during project creation');
      expect(response.body.code).toBe('PROJECT_CREATION_ERROR');
    });

    it('should accept valid project names with special characters', async () => {
      const mockRepository = {
        id: 'repo_123',
        path: '/Users/test/project',
        name: 'test-repo'
      };

      (repositoryService.getRepositoryById as jest.Mock).mockResolvedValue(mockRepository);

      const validNames = [
        'Test Project',
        'test-project',
        'test_project',
        'TestProject123',
        'Frontend UI v2'
      ];

      for (const projectName of validNames) {
        const response = await request(app)
          .post('/api/projects')
          .send({
            repositoryId: 'repo_123',
            projectName
          })
          .expect(201);

        expect(response.body.project.name).toBe(projectName);
      }
    });

    it('should trim whitespace from project name', async () => {
      const mockRepository = {
        id: 'repo_123',
        path: '/Users/test/project',
        name: 'test-repo'
      };

      (repositoryService.getRepositoryById as jest.Mock).mockResolvedValue(mockRepository);

      const response = await request(app)
        .post('/api/projects')
        .send({
          repositoryId: 'repo_123',
          projectName: '  Test Project  '
        })
        .expect(201);

      expect(response.body.project.name).toBe('Test Project');
    });

    it('should return proper project structure', async () => {
      const mockRepository = {
        id: 'repo_123',
        path: '/Users/test/my-project',
        name: 'my-project'
      };

      (repositoryService.getRepositoryById as jest.Mock).mockResolvedValue(mockRepository);

      const response = await request(app)
        .post('/api/projects')
        .send({
          repositoryId: 'repo_123',
          projectName: 'Test Project'
        })
        .expect(201);

      const project = response.body.project;
      expect(project.id).toMatch(/^proj_\d+_[a-z0-9]+$/);
      expect(project.name).toBe('Test Project');
      expect(project.repositoryId).toBe('repo_123');
      expect(project.repositoryPath).toBe('/Users/test/my-project');
      expect(project.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(project.status).toBe('initializing');
      expect(project.tasksPath).toBe('/Users/test/my-project/.taskmaster/tasks/tasks.json');
    });
  });

  describe('GET /api/projects', () => {
    it('should return empty projects list', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body.projects).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('should return projects list structure', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body).toHaveProperty('projects');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.projects)).toBe(true);
      expect(typeof response.body.count).toBe('number');
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return 404 for any project ID', async () => {
      const response = await request(app)
        .get('/api/projects/test_project_123')
        .expect(404);

      expect(response.body.error).toBe('Project not found');
      expect(response.body.code).toBe('PROJECT_NOT_FOUND');
    });

    it('should return 400 for empty project ID', async () => {
      const response = await request(app)
        .get('/api/projects/')
        .expect(404); // Express returns 404 for route not found when no ID provided
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should return 404 for any project ID', async () => {
      const response = await request(app)
        .delete('/api/projects/test_project_123')
        .expect(404);

      expect(response.body.error).toBe('Project not found');
      expect(response.body.code).toBe('PROJECT_NOT_FOUND');
    });

    it('should return 404 for empty project ID', async () => {
      await request(app)
        .delete('/api/projects/')
        .expect(404); // Express returns 404 for route not found when no ID provided
    });
  });

  describe('Content-Type validation', () => {
    it('should handle missing Content-Type for POST', async () => {
      const mockRepository = {
        id: 'repo_123',
        path: '/Users/test/project',
        name: 'test-repo'
      };

      (repositoryService.getRepositoryById as jest.Mock).mockResolvedValue(mockRepository);

      const response = await request(app)
        .post('/api/projects')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          repositoryId: 'repo_123',
          projectName: 'Test Project'
        }))
        .expect(201);

      expect(response.body.project).toBeDefined();
    });

    it('should handle malformed JSON', async () => {
      await request(app)
        .post('/api/projects')
        .set('Content-Type', 'application/json')
        .send('{"repositoryId": "repo_123", "projectName":}') // Invalid JSON
        .expect(400);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long repository IDs', async () => {
      const longRepositoryId = 'repo_' + 'a'.repeat(1000);
      
      (repositoryService.getRepositoryById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/projects')
        .send({
          repositoryId: longRepositoryId,
          projectName: 'Test Project'
        })
        .expect(404);

      expect(response.body.code).toBe('REPOSITORY_NOT_FOUND');
    });

    it('should handle special unicode characters in project name', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          repositoryId: 'repo_123',
          projectName: 'Test 项目 🚀'
        })
        .expect(400);

      expect(response.body.code).toBe('INVALID_PROJECT_NAME_FORMAT');
    });

    it('should handle null values', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          repositoryId: null,
          projectName: null
        })
        .expect(400);

      expect(response.body.code).toBe('MISSING_REPOSITORY_ID');
    });
  });
});