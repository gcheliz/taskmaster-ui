import * as fs from 'fs/promises';
import { backendTestingAgent } from '../backend-testing-core';

// Mock dependencies
jest.mock('fs/promises');
jest.mock('../../template-engine', () => ({
  templateEngine: {
    saveGeneratedFile: jest.fn().mockResolvedValue(undefined),
  }
}));


describe('BackendTestingAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.mkdir as any).mockResolvedValue(undefined);
    (fs.readFile as any).mockResolvedValue('// mock file content');
  });

  describe('generateTests', () => {
    it('should generate unit tests for a simple function file', async () => {
      const mockContent = `
export function calculateTotal(items: number[]): number {
  return items.reduce((sum, item) => sum + item, 0);
}

export async function fetchUserData(id: string) {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}`;

      (fs.readFile as any).mockResolvedValue(mockContent);

      const result = await backendTestingAgent.generateTests({
        targetFile: '/src/utils/helpers.ts',
        testType: 'unit',
      });

      expect(result.files).toHaveLength(1);
      expect(result.files[0]).toContain('helpers.test.ts');
      expect(result.coverage.passed).toBe(true);
      expect(result.documentation).toContain('Test Report');
    });

    it('should generate integration tests for Express routes', async () => {
      const mockContent = `
import express from 'express';
const router = express.Router();

router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

router.post('/users', async (req, res) => {
  const user = await prisma.user.create({ data: req.body });
  res.json(user);
});

export default router;`;

      (fs.readFile as any).mockResolvedValue(mockContent);

      const result = await backendTestingAgent.generateTests({
        targetFile: '/src/routes/users.ts',
        testType: 'integration',
        mocking: {
          mockDatabase: true,
          mockExternalAPIs: true,
        },
      });

      expect(result.files).toHaveLength(1);
      expect(result.documentation).toContain('Routes: 2');
    });

    it('should generate tests with data factories when requested', async () => {
      const mockContent = `
import { prisma } from '../lib/prisma';

export async function createUser(data: any) {
  return prisma.user.create({ data });
}`;

      (fs.readFile as any).mockResolvedValue(mockContent);

      const result = await backendTestingAgent.generateTests({
        targetFile: '/src/services/userService.ts',
        testType: 'integration',
        dataFactories: true,
        mocking: {
          mockDatabase: true,
        },
      });

      expect(result.files.length).toBeGreaterThan(1);
      expect(result.files.some(f => f.includes('factories'))).toBe(true);
    });

    it('should generate performance tests when requested', async () => {
      const mockContent = `
export async function processLargeDataset(data: any[]) {
  return data.map(item => transformItem(item));
}

function transformItem(item: any) {
  return { ...item, processed: true };
}`;

      (fs.readFile as any).mockResolvedValue(mockContent);

      const result = await backendTestingAgent.generateTests({
        targetFile: '/src/services/dataProcessor.ts',
        testType: 'unit',
        performanceTests: true,
      });

      expect(result.files.some(f => f.includes('.perf.test.ts'))).toBe(true);
    });

    it('should respect coverage thresholds', async () => {
      const mockContent = `export function simpleFunction() { return true; }`;
      (fs.readFile as any).mockResolvedValue(mockContent);

      const result = await backendTestingAgent.generateTests({
        targetFile: '/src/utils/simple.ts',
        testType: 'unit',
        coverage: {
          threshold: 90,
          includeStatements: true,
          includeBranches: true,
          includeFunctions: true,
          includeLines: true,
        },
      });

      expect(result.coverage.threshold).toBe(90);
      expect(result.documentation).toContain('threshold: 90%');
    });

    it('should handle class-based files', async () => {
      const mockContent = `
export class UserService {
  constructor(private prisma: PrismaClient) {}
  
  async findAll() {
    return this.prisma.user.findMany();
  }
  
  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}`;

      (fs.readFile as any).mockResolvedValue(mockContent);

      const result = await backendTestingAgent.generateTests({
        targetFile: '/src/services/UserService.ts',
        testType: 'unit',
        mocking: {
          autoMock: true,
          mockDatabase: true,
        },
      });

      expect(result.files).toHaveLength(1);
      expect(result.documentation).toContain('Classes: 1');
    });

    it('should generate tests for middleware', async () => {
      const mockContent = `
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Verify token
  next();
}`;

      (fs.readFile as any).mockResolvedValue(mockContent);

      const result = await backendTestingAgent.generateTests({
        targetFile: '/src/middleware/auth.ts',
        testType: 'unit',
      });

      expect(result.files).toHaveLength(1);
    });

    it('should handle Prisma model tests', async () => {
      const mockContent = `
import { prisma } from '../lib/prisma';

export const userRepository = {
  create: async (data: any) => prisma.user.create({ data }),
  findMany: async () => prisma.user.findMany(),
  update: async (id: string, data: any) => prisma.user.update({ where: { id }, data }),
  delete: async (id: string) => prisma.user.delete({ where: { id } }),
};`;

      (fs.readFile as any).mockResolvedValue(mockContent);

      const result = await backendTestingAgent.generateTests({
        targetFile: '/src/repositories/userRepository.ts',
        testType: 'integration',
        mocking: {
          mockDatabase: true,
        },
      });

      expect(result.documentation).toContain('Models: 1');
    });

    it('should handle API endpoint with authentication', async () => {
      const mockContent = `
router.get('/profile', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId }
  });
  res.json(user);
});`;

      (fs.readFile as any).mockResolvedValue(mockContent);

      const result = await backendTestingAgent.generateTests({
        targetFile: '/src/routes/profile.ts',
        testType: 'integration',
        mocking: {
          mockDatabase: true,
          mockModules: ['../middleware/auth'],
        },
      });

      expect(result.files).toHaveLength(1);
    });

    it('should generate appropriate mocks for external APIs', async () => {
      const mockContent = `
import axios from 'axios';

export async function fetchWeatherData(city: string) {
  const response = await axios.get(\`https://api.weather.com/v1/\${city}\`);
  return response.data;
}`;

      (fs.readFile as any).mockResolvedValue(mockContent);

      const result = await backendTestingAgent.generateTests({
        targetFile: '/src/services/weather.ts',
        testType: 'unit',
        mocking: {
          mockExternalAPIs: true,
          mockModules: ['axios'],
        },
      });

      expect(result.files).toHaveLength(1);
    });
  });
});