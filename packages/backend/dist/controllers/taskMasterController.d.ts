import { TaskMasterService } from '../services/taskMasterService';
import { WebSocketService } from '../services/websocket';
import { EnhancedRequest, EnhancedResponse } from '../middleware';
export interface ITaskMasterController {
    executeCommand(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    getProjectStatus(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    listTasks(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    getTask(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    updateTask(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    expandTask(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    analyzeComplexity(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    streamCommand(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
}
export declare class TaskMasterController implements ITaskMasterController {
    private readonly taskMasterService;
    private readonly webSocketService?;
    constructor(taskMasterService: TaskMasterService, webSocketService?: WebSocketService | undefined);
    /**
     * Execute CLI Command Endpoint
     * POST /api/cli/execute
     */
    executeCommand(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    /**
     * Get Project Status Endpoint
     * GET /api/project/status
     */
    getProjectStatus(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    /**
     * List Tasks with Advanced Filtering
     * GET /api/tasks
     */
    listTasks(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    /**
     * Get Task Details
     * GET /api/tasks/:taskId
     */
    getTask(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    /**
     * Update Task
     * PUT /api/tasks/:taskId
     */
    updateTask(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    /**
     * Expand Task into Subtasks
     * POST /api/tasks/:taskId/expand
     */
    expandTask(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    /**
     * Analyze Project Complexity
     * POST /api/analysis/complexity
     */
    analyzeComplexity(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    /**
     * Stream Command Execution (Server-Sent Events)
     * GET /api/cli/stream
     */
    streamCommand(req: EnhancedRequest, res: EnhancedResponse): Promise<void>;
    private handleError;
    private getErrorCode;
    private getStatusCode;
    private emitWebSocketEvent;
    private sendSSE;
    private extractTagFromPath;
    private calculateProjectStats;
    private sortTasks;
    private getTaskComplexityLevel;
}
//# sourceMappingURL=taskMasterController.d.ts.map