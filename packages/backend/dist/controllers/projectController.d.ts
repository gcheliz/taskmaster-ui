import { Request, Response } from 'express';
export interface CreateProjectRequest {
    repositoryId: string;
    projectName: string;
}
export interface ProjectResponse {
    id: string;
    name: string;
    repositoryId: string;
    repositoryPath: string;
    createdAt: string;
    status: 'initializing' | 'active' | 'error';
    tasksPath?: string;
}
export interface TaskMasterInfo {
    taskCount: number;
    initOutput: string;
    duration: number;
}
export interface CreateProjectResponse {
    project: ProjectResponse;
    message: string;
    taskMasterInfo?: TaskMasterInfo;
}
/**
 * Project Controller
 *
 * Handles project-related operations including:
 * - Project creation and initialization
 * - Project listing and management
 * - Integration with TaskMaster CLI
 */
export declare class ProjectController {
    /**
     * Create a new TaskMaster project
     * POST /api/projects
     */
    createProject(req: Request, res: Response): Promise<void>;
    /**
     * Get all projects
     * GET /api/projects
     */
    getProjects(req: Request, res: Response): Promise<void>;
    /**
     * Get project by ID
     * GET /api/projects/:id
     */
    getProjectById(req: Request, res: Response): Promise<void>;
    /**
     * Delete project by ID
     * DELETE /api/projects/:id
     */
    deleteProject(req: Request, res: Response): Promise<void>;
}
export declare const projectController: ProjectController;
//# sourceMappingURL=projectController.d.ts.map