"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projectController_1 = require("../controllers/projectController");
const router = express_1.default.Router();
/**
 * @openapi
 * components:
 *   schemas:
 *     CreateProjectRequest:
 *       type: object
 *       required:
 *         - repositoryId
 *         - projectName
 *       properties:
 *         repositoryId:
 *           type: string
 *           description: ID of the repository to create the project in
 *           example: "repo_123456789"
 *         projectName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           pattern: "^[a-zA-Z0-9\\-_\\s]+$"
 *           description: Name of the project to create
 *           example: "My TaskMaster Project"
 *
 *     ProjectResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the project
 *           example: "proj_1234567890_abc123"
 *         name:
 *           type: string
 *           description: Name of the project
 *           example: "My TaskMaster Project"
 *         repositoryId:
 *           type: string
 *           description: ID of the associated repository
 *           example: "repo_123456789"
 *         repositoryPath:
 *           type: string
 *           description: File system path to the repository
 *           example: "/Users/john/projects/my-project"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: ISO timestamp when the project was created
 *           example: "2023-01-15T10:30:00.000Z"
 *         status:
 *           type: string
 *           enum: [initializing, active, error]
 *           description: Current status of the project
 *           example: "active"
 *         tasksPath:
 *           type: string
 *           description: Path to the TaskMaster tasks.json file
 *           example: "/Users/john/projects/my-project/.taskmaster/tasks/tasks.json"
 *
 *     TaskMasterInfo:
 *       type: object
 *       properties:
 *         taskCount:
 *           type: integer
 *           description: Number of tasks created during initialization
 *           example: 5
 *         initOutput:
 *           type: string
 *           description: Output from TaskMaster CLI initialization
 *           example: "TaskMaster project initialized successfully"
 *         duration:
 *           type: integer
 *           description: Duration of initialization in milliseconds
 *           example: 1500
 *
 *     ProjectCreateResponse:
 *       type: object
 *       properties:
 *         project:
 *           $ref: '#/components/schemas/ProjectResponse'
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Project created and initialized successfully"
 *         taskMasterInfo:
 *           $ref: '#/components/schemas/TaskMasterInfo'
 *           description: Information about TaskMaster CLI initialization
 *
 *     ProjectListResponse:
 *       type: object
 *       properties:
 *         projects:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProjectResponse'
 *         count:
 *           type: integer
 *           description: Total number of projects
 *           example: 3
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *           example: "Project name is required"
 *         code:
 *           type: string
 *           description: Error code for programmatic handling
 *           example: "INVALID_PROJECT_NAME"
 */
/**
 * @openapi
 * /api/projects:
 *   post:
 *     summary: Create a new TaskMaster project
 *     description: |
 *       Creates a new TaskMaster project in the specified repository.
 *       This will initialize the TaskMaster directory structure and configuration.
 *     tags:
 *       - Projects
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *           examples:
 *             basicProject:
 *               summary: Basic project creation
 *               value:
 *                 repositoryId: "repo_123456789"
 *                 projectName: "My TaskMaster Project"
 *             dashesAndUnderscores:
 *               summary: Project with special characters
 *               value:
 *                 repositoryId: "repo_987654321"
 *                 projectName: "frontend-ui_v2"
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectCreateResponse'
 *             examples:
 *               success:
 *                 summary: Successful project creation
 *                 value:
 *                   project:
 *                     id: "proj_1234567890_abc123"
 *                     name: "My TaskMaster Project"
 *                     repositoryId: "repo_123456789"
 *                     repositoryPath: "/Users/john/projects/my-project"
 *                     createdAt: "2023-01-15T10:30:00.000Z"
 *                     status: "active"
 *                     tasksPath: "/Users/john/projects/my-project/.taskmaster/tasks/tasks.json"
 *                   message: "Project created and initialized successfully"
 *                   taskMasterInfo:
 *                     taskCount: 5
 *                     initOutput: "TaskMaster project initialized successfully"
 *                     duration: 1500
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingRepositoryId:
 *                 summary: Missing repository ID
 *                 value:
 *                   error: "Repository ID is required"
 *                   code: "MISSING_REPOSITORY_ID"
 *               invalidProjectName:
 *                 summary: Invalid project name format
 *                 value:
 *                   error: "Project name can only contain letters, numbers, spaces, hyphens, and underscores"
 *                   code: "INVALID_PROJECT_NAME_FORMAT"
 *               projectNameTooShort:
 *                 summary: Project name too short
 *                 value:
 *                   error: "Project name must be at least 2 characters long"
 *                   code: "PROJECT_NAME_TOO_SHORT"
 *       404:
 *         description: Repository not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               repositoryNotFound:
 *                 summary: Repository not found
 *                 value:
 *                   error: "Repository not found"
 *                   code: "REPOSITORY_NOT_FOUND"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 summary: Server error
 *                 value:
 *                   error: "Internal server error during project creation"
 *                   code: "PROJECT_CREATION_ERROR"
 *               taskMasterInitFailed:
 *                 summary: TaskMaster CLI initialization failed
 *                 value:
 *                   error: "Failed to initialize TaskMaster project"
 *                   code: "TASKMASTER_INIT_FAILED"
 *                   details:
 *                     output: "TaskMaster init failed: No git repository found"
 *                     error: "fatal: not a git repository"
 *                     exitCode: 1
 *               taskMasterError:
 *                 summary: TaskMaster CLI execution error
 *                 value:
 *                   error: "Failed to initialize TaskMaster project"
 *                   code: "TASKMASTER_INIT_ERROR"
 *                   details:
 *                     message: "TaskMaster CLI not found"
 *
 *   get:
 *     summary: Get all projects
 *     description: Retrieves a list of all TaskMaster projects
 *     tags:
 *       - Projects
 *     responses:
 *       200:
 *         description: List of projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectListResponse'
 *             examples:
 *               withProjects:
 *                 summary: Response with projects
 *                 value:
 *                   projects:
 *                     - id: "proj_1234567890_abc123"
 *                       name: "Frontend UI"
 *                       repositoryId: "repo_123456789"
 *                       repositoryPath: "/Users/john/projects/frontend"
 *                       createdAt: "2023-01-15T10:30:00.000Z"
 *                       status: "active"
 *                       tasksPath: "/Users/john/projects/frontend/.taskmaster/tasks/tasks.json"
 *                     - id: "proj_0987654321_def456"
 *                       name: "Backend API"
 *                       repositoryId: "repo_987654321"
 *                       repositoryPath: "/Users/john/projects/backend"
 *                       createdAt: "2023-01-14T15:45:00.000Z"
 *                       status: "active"
 *                       tasksPath: "/Users/john/projects/backend/.taskmaster/tasks/tasks.json"
 *                   count: 2
 *               empty:
 *                 summary: No projects found
 *                 value:
 *                   projects: []
 *                   count: 0
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     description: Retrieves detailed information about a specific project
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *         example: "proj_1234567890_abc123"
 *     responses:
 *       200:
 *         description: Project details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project:
 *                   $ref: '#/components/schemas/ProjectResponse'
 *             examples:
 *               success:
 *                 summary: Project found
 *                 value:
 *                   project:
 *                     id: "proj_1234567890_abc123"
 *                     name: "My TaskMaster Project"
 *                     repositoryId: "repo_123456789"
 *                     repositoryPath: "/Users/john/projects/my-project"
 *                     createdAt: "2023-01-15T10:30:00.000Z"
 *                     status: "active"
 *                     tasksPath: "/Users/john/projects/my-project/.taskmaster/tasks/tasks.json"
 *       400:
 *         description: Invalid project ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     summary: Delete project by ID
 *     description: Removes a project and its TaskMaster configuration (does not delete the repository)
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *         example: "proj_1234567890_abc123"
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Project deleted successfully"
 *       400:
 *         description: Invalid project ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Create new project
router.post('/', projectController_1.projectController.createProject.bind(projectController_1.projectController));
// Get all projects
router.get('/', projectController_1.projectController.getProjects.bind(projectController_1.projectController));
// Get project by ID
router.get('/:id', projectController_1.projectController.getProjectById.bind(projectController_1.projectController));
// Delete project by ID
router.delete('/:id', projectController_1.projectController.deleteProject.bind(projectController_1.projectController));
exports.default = router;
//# sourceMappingURL=projectRoutes.js.map