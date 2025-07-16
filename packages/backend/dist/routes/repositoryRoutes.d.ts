import { Router } from 'express';
declare const schemas: {
    RepositoryValidateRequest: {
        type: string;
        required: string[];
        properties: {
            repositoryPath: {
                type: string;
                description: string;
                example: string;
                minLength: number;
                maxLength: number;
            };
            validateGit: {
                type: string;
                description: string;
                default: boolean;
            };
            validateTaskMaster: {
                type: string;
                description: string;
                default: boolean;
            };
        };
    };
    RepositoryValidateResponse: {
        type: string;
        properties: {
            success: {
                type: string;
            };
            data: {
                type: string;
                properties: {
                    isValid: {
                        type: string;
                    };
                    validations: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                type: {
                                    type: string;
                                    enum: string[];
                                };
                                isValid: {
                                    type: string;
                                };
                                message: {
                                    type: string;
                                };
                                details: {
                                    type: string;
                                };
                            };
                        };
                    };
                    repositoryInfo: {
                        type: string;
                        properties: {
                            path: {
                                type: string;
                            };
                            name: {
                                type: string;
                            };
                            isGitRepository: {
                                type: string;
                            };
                            isTaskMasterProject: {
                                type: string;
                            };
                            gitBranch: {
                                type: string;
                            };
                            gitRemoteUrl: {
                                type: string;
                            };
                        };
                    };
                    errors: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                };
            };
            error: {
                type: string;
                properties: {
                    code: {
                        type: string;
                    };
                    message: {
                        type: string;
                    };
                    correlationId: {
                        type: string;
                    };
                };
            };
            metadata: {
                type: string;
                properties: {
                    timestamp: {
                        type: string;
                    };
                    requestId: {
                        type: string;
                    };
                    duration: {
                        type: string;
                    };
                    version: {
                        type: string;
                    };
                };
            };
        };
    };
};
export declare class RepositoryRouteFactory {
    private controller;
    constructor();
    createRouter(): Router;
    private addValidationRoutes;
    private addInfoRoutes;
    private addHealthRoutes;
    private validateRepositoryPath;
    private validateRepositoryPathFromQuery;
    private validateSecurityConstraints;
    private asyncHandler;
}
export declare function createRepositoryRoutes(): Router;
export { schemas as repositoryApiSchemas };
//# sourceMappingURL=repositoryRoutes.d.ts.map