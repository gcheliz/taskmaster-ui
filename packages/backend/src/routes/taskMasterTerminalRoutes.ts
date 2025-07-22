import { Router } from 'express';
import { taskMasterTerminalController } from '../controllers/taskMasterTerminalController';
import authMiddleware from '../middleware/auth';
import { RateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * TaskMaster Terminal API Routes
 *
 * Provides REST API endpoints for TaskMaster-integrated terminal sessions.
 * All routes require authentication and are rate-limited for security.
 */

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticateJWT);

// TODO: Add rate limiting - currently disabled due to type conflicts

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskMasterTerminalSession:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique session identifier
 *         workingDirectory:
 *           type: string
 *           description: Working directory path
 *         repositoryPath:
 *           type: string
 *           description: Repository path if scoped to a repository
 *         projectTag:
 *           type: string
 *           description: TaskMaster project tag
 *         shell:
 *           type: string
 *           description: Shell type (bash, cmd, etc.)
 *         isActive:
 *           type: boolean
 *           description: Whether the session is active
 *         taskMasterIntegrated:
 *           type: boolean
 *           description: Whether TaskMaster CLI integration is enabled
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Session creation timestamp
 *         lastActivity:
 *           type: string
 *           format: date-time
 *           description: Last activity timestamp
 *         commandHistoryLength:
 *           type: integer
 *           description: Number of commands in history
 */

/**
 * @swagger
 * /api/taskmaster-terminal/sessions:
 *   post:
 *     summary: Create a new TaskMaster terminal session
 *     tags: [TaskMaster Terminal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workingDirectory:
 *                 type: string
 *                 description: Working directory for the terminal
 *                 example: "/Users/dev/my-project"
 *               repositoryPath:
 *                 type: string
 *                 description: Repository path if scoped to a repository
 *                 example: "/Users/dev/my-project"
 *               projectTag:
 *                 type: string
 *                 description: TaskMaster project tag
 *                 example: "my-awesome-project"
 *     responses:
 *       201:
 *         description: Terminal session created successfully
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
 *                     sessionId:
 *                       type: string
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     message:
 *                       type: string
 *                       example: "TaskMaster terminal session created successfully"
 *       400:
 *         description: Bad request - Invalid parameters
 *       401:
 *         description: Unauthorized - Authentication required
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.post(
  '/sessions',
  taskMasterTerminalController.createSession.bind(taskMasterTerminalController)
);

/**
 * @swagger
 * /api/taskmaster-terminal/sessions:
 *   get:
 *     summary: Get all active TaskMaster terminal sessions
 *     tags: [TaskMaster Terminal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active sessions retrieved successfully
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
 *                     sessions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TaskMasterTerminalSession'
 *                     count:
 *                       type: integer
 *                       example: 3
 */
router.get(
  '/sessions',
  taskMasterTerminalController.getActiveSessions.bind(
    taskMasterTerminalController
  )
);

/**
 * @swagger
 * /api/taskmaster-terminal/sessions/{sessionId}:
 *   get:
 *     summary: Get TaskMaster terminal session information
 *     tags: [TaskMaster Terminal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Terminal session ID
 *     responses:
 *       200:
 *         description: Session information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TaskMasterTerminalSession'
 *       404:
 *         description: Session not found
 */
router.get(
  '/sessions/:sessionId',
  taskMasterTerminalController.getSession.bind(taskMasterTerminalController)
);

/**
 * @swagger
 * /api/taskmaster-terminal/sessions/{sessionId}/commands:
 *   post:
 *     summary: Execute a command in a TaskMaster terminal session
 *     tags: [TaskMaster Terminal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Terminal session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - command
 *             properties:
 *               command:
 *                 type: string
 *                 description: Command to execute
 *                 example: "task-master list"
 *     responses:
 *       200:
 *         description: Command executed successfully
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
 *                     message:
 *                       type: string
 *                       example: "Command executed successfully"
 *                     isTaskMasterCommand:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid command
 *       404:
 *         description: Session not found
 */
router.post(
  '/sessions/:sessionId/commands',
  taskMasterTerminalController.executeCommand.bind(taskMasterTerminalController)
);

/**
 * @swagger
 * /api/taskmaster-terminal/sessions/{sessionId}/suggestions:
 *   get:
 *     summary: Get TaskMaster command suggestions
 *     tags: [TaskMaster Terminal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Terminal session ID
 *       - in: query
 *         name: partialCommand
 *         schema:
 *           type: string
 *           default: ""
 *         description: Partial command to get suggestions for
 *         example: "task-master li"
 *     responses:
 *       200:
 *         description: Suggestions retrieved successfully
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
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["task-master list", "task-master list --tag=project"]
 *                     count:
 *                       type: integer
 *                       example: 2
 *                     partialCommand:
 *                       type: string
 *                       example: "task-master li"
 */
router.get(
  '/sessions/:sessionId/suggestions',
  taskMasterTerminalController.getCommandSuggestions.bind(
    taskMasterTerminalController
  )
);

/**
 * @swagger
 * /api/taskmaster-terminal/sessions/{sessionId}/history:
 *   get:
 *     summary: Get command history for a TaskMaster terminal session
 *     tags: [TaskMaster Terminal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Terminal session ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Number of history entries to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Number of entries to skip
 *     responses:
 *       200:
 *         description: Command history retrieved successfully
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
 *                     history:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["task-master list", "git status", "task-master next"]
 *                     totalCount:
 *                       type: integer
 *                       example: 25
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     offset:
 *                       type: integer
 *                       example: 0
 */
router.get(
  '/sessions/:sessionId/history',
  taskMasterTerminalController.getCommandHistory.bind(
    taskMasterTerminalController
  )
);

/**
 * @swagger
 * /api/taskmaster-terminal/sessions/{sessionId}/input:
 *   post:
 *     summary: Send input to a running process in a TaskMaster terminal session
 *     tags: [TaskMaster Terminal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Terminal session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - input
 *             properties:
 *               input:
 *                 type: string
 *                 description: Input to send to the running process
 *                 example: "y\n"
 *     responses:
 *       200:
 *         description: Input sent successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Session not found or no running process
 */
router.post(
  '/sessions/:sessionId/input',
  taskMasterTerminalController.sendInput.bind(taskMasterTerminalController)
);

/**
 * @swagger
 * /api/taskmaster-terminal/sessions/{sessionId}/kill:
 *   post:
 *     summary: Kill a running process in a TaskMaster terminal session
 *     tags: [TaskMaster Terminal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Terminal session ID
 *     responses:
 *       200:
 *         description: Process killed successfully
 *       404:
 *         description: Session not found or no running process
 */
router.post(
  '/sessions/:sessionId/kill',
  taskMasterTerminalController.killProcess.bind(taskMasterTerminalController)
);

/**
 * @swagger
 * /api/taskmaster-terminal/sessions/{sessionId}/resize:
 *   post:
 *     summary: Resize a TaskMaster terminal session
 *     tags: [TaskMaster Terminal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Terminal session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cols
 *               - rows
 *             properties:
 *               cols:
 *                 type: integer
 *                 minimum: 10
 *                 maximum: 300
 *                 description: Number of columns
 *                 example: 80
 *               rows:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 100
 *                 description: Number of rows
 *                 example: 24
 *     responses:
 *       200:
 *         description: Terminal resized successfully
 *       400:
 *         description: Invalid terminal size
 *       404:
 *         description: Session not found
 */
router.post(
  '/sessions/:sessionId/resize',
  taskMasterTerminalController.resizeTerminal.bind(taskMasterTerminalController)
);

/**
 * @swagger
 * /api/taskmaster-terminal/sessions/{sessionId}/environment:
 *   get:
 *     summary: Get TaskMaster environment information for a session
 *     tags: [TaskMaster Terminal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Terminal session ID
 *     responses:
 *       200:
 *         description: Environment information retrieved successfully
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
 *                     environment:
 *                       type: object
 *                       description: Environment variables
 *                       example:
 *                         TASKMASTER_WORKING_DIR: "/Users/dev/my-project"
 *                         TASKMASTER_PROJECT_TAG: "my-project"
 *                     workingDirectory:
 *                       type: string
 *                       example: "/Users/dev/my-project"
 *                     projectTag:
 *                       type: string
 *                       example: "my-project"
 *                     taskMasterIntegrated:
 *                       type: boolean
 *                       example: true
 */
router.get(
  '/sessions/:sessionId/environment',
  taskMasterTerminalController.getEnvironment.bind(taskMasterTerminalController)
);

/**
 * @swagger
 * /api/taskmaster-terminal/sessions/{sessionId}:
 *   delete:
 *     summary: Close a TaskMaster terminal session
 *     tags: [TaskMaster Terminal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Terminal session ID
 *     responses:
 *       200:
 *         description: Terminal session closed successfully
 *       404:
 *         description: Session not found
 */
router.delete(
  '/sessions/:sessionId',
  taskMasterTerminalController.closeSession.bind(taskMasterTerminalController)
);

export default router;
