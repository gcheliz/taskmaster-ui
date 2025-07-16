import express from 'express';
import { prdController } from '../controllers/prdController';
import { validatePrdAnalysisRequest, authMiddleware } from '../middleware/validation';
import { rateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

/**
 * @swagger
 * /api/prd/analyze:
 *   post:
 *     summary: Analyze PRD content
 *     description: Parse PRD content and perform complexity analysis using task-master CLI
 *     tags:
 *       - PRD Analysis
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - repositoryPath
 *               - prdContent
 *             properties:
 *               repositoryPath:
 *                 type: string
 *                 description: Absolute path to the repository
 *                 example: /Users/john/projects/my-app
 *               prdContent:
 *                 type: string
 *                 description: PRD content as plain text
 *                 example: "# Product Requirements Document\n\n## Overview\nThis document describes..."
 *               options:
 *                 type: object
 *                 properties:
 *                   tag:
 *                     type: string
 *                     description: Project tag for task-master
 *                     example: my-app
 *                   append:
 *                     type: boolean
 *                     description: Whether to append to existing tasks
 *                     default: false
 *                   research:
 *                     type: boolean
 *                     description: Whether to enable research mode for complexity analysis
 *                     default: false
 *     responses:
 *       200:
 *         description: PRD analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     parsedTasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           status:
 *                             type: string
 *                           priority:
 *                             type: string
 *                     complexityAnalysis:
 *                       type: object
 *                       properties:
 *                         tasks:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               complexity:
 *                                 type: number
 *                               level:
 *                                 type: string
 *                         summary:
 *                           type: object
 *                           properties:
 *                             totalTasks:
 *                               type: number
 *                             averageComplexity:
 *                               type: number
 *                             complexityDistribution:
 *                               type: object
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalTasks:
 *                           type: number
 *                         averageComplexity:
 *                           type: number
 *                         estimatedEffort:
 *                           type: string
 *                 executionTime:
 *                   type: number
 *                   description: Execution time in milliseconds
 *       400:
 *         description: Invalid request payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Repository path and PRD content are required
 *                 executionTime:
 *                   type: number
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: PRD analysis failed
 *                 executionTime:
 *                   type: number
 */
router.post('/analyze', 
  // rateLimiter.createLimiter({ windowMs: 60000, maxRequests: 10 }), // 10 requests per minute
  // validatePrdAnalysisRequest,
  async (req, res) => {
    await prdController.analyzePrd(req, res);
  }
);

/**
 * @swagger
 * /api/prd/health:
 *   get:
 *     summary: Health check for PRD analysis service
 *     description: Check if the PRD analysis service and task-master CLI are working
 *     tags:
 *       - PRD Analysis
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 service:
 *                   type: string
 *                   example: prd-analysis
 *                 healthy:
 *                   type: boolean
 *                   example: true
 *                 details:
 *                   type: object
 *                   properties:
 *                     cliAvailable:
 *                       type: boolean
 *                     version:
 *                       type: string
 *                     lastCheck:
 *                       type: string
 *                     executorHealthy:
 *                       type: boolean
 *                     activeProcesses:
 *                       type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 service:
 *                   type: string
 *                   example: prd-analysis
 *                 healthy:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Health check failed
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', async (req, res) => {
  await prdController.healthCheck(req, res);
});

export default router;