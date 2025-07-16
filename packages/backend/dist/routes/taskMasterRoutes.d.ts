import { Router } from 'express';
import { TaskMasterService } from '../services/taskMasterService';
import { WebSocketService } from '../services/websocket';
declare const schemas: {
    CliExecuteRequest: {
        type: string;
        required: string[];
        properties: {
            repositoryPath: {
                type: string;
                description: string;
                example: string;
            };
            operation: {
                type: string;
                enum: string[];
                description: string;
            };
            arguments: {
                type: string;
                description: string;
                additionalProperties: boolean;
            };
            options: {
                type: string;
                properties: {
                    timeout: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    tag: {
                        type: string;
                    };
                    async: {
                        type: string;
                    };
                    streaming: {
                        type: string;
                    };
                };
            };
        };
    };
    ProjectStatusRequest: {
        type: string;
        required: string[];
        properties: {
            repositoryPath: {
                type: string;
            };
            includeStats: {
                type: string;
                default: boolean;
            };
            includeTasks: {
                type: string;
                default: boolean;
            };
        };
    };
    TaskListRequest: {
        type: string;
        required: string[];
        properties: {
            repositoryPath: {
                type: string;
            };
            filters: {
                type: string;
                properties: {
                    status: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    priority: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    complexityRange: {
                        type: string;
                        items: {
                            type: string;
                        };
                        minItems: number;
                        maxItems: number;
                    };
                    search: {
                        type: string;
                    };
                };
            };
            pagination: {
                type: string;
                properties: {
                    page: {
                        type: string;
                        minimum: number;
                        default: number;
                    };
                    limit: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                    };
                };
            };
            sorting: {
                type: string;
                properties: {
                    field: {
                        type: string;
                        enum: string[];
                    };
                    direction: {
                        type: string;
                        enum: string[];
                        default: string;
                    };
                };
            };
        };
    };
    TaskUpdateRequest: {
        type: string;
        required: string[];
        properties: {
            repositoryPath: {
                type: string;
            };
            updates: {
                type: string;
                properties: {
                    status: {
                        type: string;
                        enum: string[];
                    };
                    priority: {
                        type: string;
                        enum: string[];
                    };
                    description: {
                        type: string;
                    };
                    notes: {
                        type: string;
                    };
                };
            };
            options: {
                type: string;
                properties: {
                    validateDependencies: {
                        type: string;
                        default: boolean;
                    };
                    notifySubscribers: {
                        type: string;
                        default: boolean;
                    };
                    createHistoryEntry: {
                        type: string;
                        default: boolean;
                    };
                };
            };
        };
    };
};
export declare class TaskMasterRouteFactory {
    private controller;
    constructor(taskMasterService: TaskMasterService, webSocketService?: WebSocketService);
    createRouter(): Router;
    private addCliRoutes;
    private addProjectRoutes;
    private addTaskRoutes;
    private addAnalysisRoutes;
    private addStreamingRoutes;
    private createHealthEndpoint;
    private createDocsEndpoint;
    private validateCliOperation;
    private validateRepositoryAccess;
    private asyncHandler;
}
export declare function createTaskMasterRoutes(taskMasterService?: TaskMasterService, webSocketService?: WebSocketService): Router;
export { schemas as taskMasterApiSchemas };
//# sourceMappingURL=taskMasterRoutes.d.ts.map