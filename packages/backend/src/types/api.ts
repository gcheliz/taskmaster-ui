// Advanced API Type System
// Demonstrates: Domain-driven design, comprehensive request/response typing

import { TaskMasterResult, TaskInfo, ProjectInfo } from './taskMaster';

// Base API Response Pattern
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata: ApiMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
  correlationId?: string;
}

export interface ApiMetadata {
  timestamp: string;
  requestId: string;
  duration: number;
  version: string;
  rateLimit?: RateLimitInfo;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: string;
}

// CLI Execution API Types
export interface CliExecuteRequest {
  repositoryPath: string;
  operation: string;
  arguments?: Record<string, any>;
  options?: CliExecuteOptions;
}

export interface CliExecuteOptions {
  timeout?: number;
  tag?: string;
  async?: boolean;
  streaming?: boolean;
}

export interface CliExecuteResponse extends ApiResponse<TaskMasterResult> {
  data?: TaskMasterResult;
}

// Project Management API Types
export interface ProjectStatusRequest {
  repositoryPath: string;
  includeStats?: boolean;
  includeTasks?: boolean;
}

export interface ProjectStatusResponse extends ApiResponse<ProjectStatusData> {}

export interface ProjectStatusData {
  project: ProjectInfo;
  stats?: ProjectStats;
  tasks?: TaskInfo[];
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  averageComplexity: number;
  estimatedCompletion: string;
  lastActivity: string;
}

// Task Management API Types
export interface TaskListRequest {
  repositoryPath: string;
  filters?: TaskFilters;
  pagination?: PaginationOptions;
  sorting?: SortingOptions;
}

export interface TaskFilters {
  status?: string[];
  priority?: string[];
  complexityRange?: [number, number];
  complexity?: string[];
  assignee?: string[];
  dependencies?: string[];
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset?: number;
}

export interface SortingOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TaskListResponse extends ApiResponse<TaskListData> {}

export interface TaskListData {
  tasks: TaskInfo[];
  pagination: PaginationMetadata;
  filters: TaskFilters;
  totalCount: number;
}

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface TaskDetailRequest {
  repositoryPath: string;
  taskId: string;
  includeSubtasks?: boolean;
  includeHistory?: boolean;
}

export interface TaskDetailResponse extends ApiResponse<TaskDetailData> {}

export interface TaskDetailData {
  task: TaskInfo;
  subtasks?: TaskInfo[];
  history?: TaskHistoryEntry[];
  dependencies?: TaskInfo[];
  dependents?: TaskInfo[];
}

export interface TaskHistoryEntry {
  timestamp: string;
  action: string;
  previousValue?: any;
  newValue?: any;
  user?: string;
  metadata?: Record<string, any>;
}

export interface TaskUpdateRequest {
  repositoryPath: string;
  taskId: string;
  updates: TaskUpdateData;
  options?: TaskUpdateOptions;
}

export interface TaskUpdateData {
  status?: string;
  priority?: string;
  description?: string;
  notes?: string;
}

export interface TaskUpdateOptions {
  validateDependencies?: boolean;
  notifySubscribers?: boolean;
  createHistoryEntry?: boolean;
}

export interface TaskUpdateResponse extends ApiResponse<TaskInfo> {}

// Advanced Operations API Types
export interface TaskExpansionRequest {
  repositoryPath: string;
  taskId?: string;
  expandAll?: boolean;
  options?: TaskExpansionOptions;
}

export interface TaskExpansionOptions {
  research?: boolean;
  force?: boolean;
  maxSubtasks?: number;
  complexityThreshold?: number;
}

export interface TaskExpansionResponse extends ApiResponse<TaskExpansionResult> {}

export interface TaskExpansionResult {
  expandedTasks: TaskInfo[];
  expansionMetadata: ExpansionMetadata;
}

export interface ExpansionMetadata {
  totalTasksExpanded: number;
  totalSubtasksCreated: number;
  averageExpansionRatio: number;
  estimatedTimeToComplete: string;
  researchUsed: boolean;
}

export interface ComplexityAnalysisRequest {
  repositoryPath: string;
  range?: TaskRange;
  options?: ComplexityAnalysisOptions;
}

export interface TaskRange {
  from?: number;
  to?: number;
}

export interface ComplexityAnalysisOptions {
  research?: boolean;
  includeRecommendations?: boolean;
  analyzeDependendies?: boolean;
}

export interface ComplexityAnalysisResponse extends ApiResponse<ComplexityAnalysisResult> {}

export interface ComplexityAnalysisResult {
  overallComplexity: number;
  taskComplexities: TaskComplexityInfo[];
  recommendations: ComplexityRecommendation[];
  metadata: ComplexityMetadata;
}

export interface TaskComplexityInfo {
  taskId: string;
  complexity: number;
  factors: ComplexityFactor[];
  estimatedHours: number;
}

export interface ComplexityFactor {
  name: string;
  weight: number;
  description: string;
}

export interface ComplexityRecommendation {
  type: 'split' | 'merge' | 'prioritize' | 'defer';
  taskId: string;
  reason: string;
  action: string;
  impact: number;
}

export interface ComplexityMetadata {
  analysisTime: number;
  algorithmsUsed: string[];
  confidenceScore: number;
  lastUpdate: string;
}

// Streaming API Types for Real-time Operations
export interface StreamingRequest {
  repositoryPath: string;
  operation: string;
  arguments?: Record<string, any>;
  streamOptions?: StreamingOptions;
}

export interface StreamingOptions {
  bufferSize?: number;
  heartbeatInterval?: number;
  includeProgress?: boolean;
  includeDebug?: boolean;
}

export interface StreamingResponse {
  type: 'start' | 'progress' | 'data' | 'error' | 'complete';
  timestamp: string;
  requestId: string;
  payload?: any;
}

// WebSocket Message Types
export interface WebSocketMessage {
  id: string;
  type: 'subscribe' | 'unsubscribe' | 'execute' | 'status' | 'notification';
  payload: any;
  timestamp: string;
}

export interface WebSocketSubscription {
  repositoryPath: string;
  events: string[];
  filters?: Record<string, any>;
}

// Validation and Error Types
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
}

export interface RequestValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// API Documentation Types
export interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  requestSchema: any;
  responseSchema: any;
  examples: ApiExample[];
  deprecated?: boolean;
}

export interface ApiExample {
  name: string;
  description: string;
  request: any;
  response: any;
}

// Repository Management API Types
export interface RepositoryValidateRequest {
  repositoryPath: string;
  validateGit?: boolean;
  validateTaskMaster?: boolean;
}

export interface RepositoryValidateResponse extends ApiResponse<RepositoryValidationResult> {}

export interface RepositoryValidationResult {
  isValid: boolean;
  validations: RepositoryValidation[];
  repositoryInfo?: RepositoryInfo;
  errors?: string[];
}

export interface RepositoryValidation {
  type: 'path' | 'directory' | 'git' | 'taskmaster' | 'permissions';
  isValid: boolean;
  message: string;
  details?: Record<string, any>;
}

export interface RepositoryInfo {
  path: string;
  name: string;
  isGitRepository: boolean;
  isTaskMasterProject: boolean;
  gitBranch?: string;
  gitRemoteUrl?: string;
  lastCommit?: GitCommitInfo;
  taskMasterConfig?: TaskMasterProjectConfig;
}

export interface GitCommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface TaskMasterProjectConfig {
  initialized: boolean;
  taskCount: number;
  lastUpdated: string;
  configPath: string;
}