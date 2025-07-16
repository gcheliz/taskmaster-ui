// API Service for TaskMaster UI
// Handles communication with the backend REST API

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    correlationId?: string;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    duration: number;
    version: string;
  };
}

export interface RepositoryValidation {
  type: 'path' | 'directory' | 'git' | 'taskmaster' | 'permissions';
  isValid: boolean;
  message: string;
  details?: any;
}

export interface RepositoryInfo {
  path: string;
  name: string;
  isGitRepository: boolean;
  isTaskMasterProject: boolean;
  gitBranch?: string;
  gitRemoteUrl?: string;
}

export interface RepositoryValidationResult {
  isValid: boolean;
  validations: RepositoryValidation[];
  repositoryInfo: RepositoryInfo;
  errors: string[];
}

export interface RepositoryValidateRequest {
  repositoryPath: string;
  validateGit?: boolean;
  validateTaskMaster?: boolean;
}

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

export class ApiError extends Error {
  public code: string;
  public status?: number;
  public correlationId?: string;

  constructor(
    code: string,
    message: string,
    status?: number,
    correlationId?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.correlationId = correlationId;
  }
}

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error?.code || 'UNKNOWN_ERROR',
          data.error?.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data.error?.correlationId
        );
      }

      if (!data.success) {
        throw new ApiError(
          data.error?.code || 'API_ERROR',
          data.error?.message || 'API request failed',
          response.status,
          data.error?.correlationId
        );
      }

      return data.data!;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(
          'NETWORK_ERROR',
          'Unable to connect to the server. Please check your connection.',
          0
        );
      }

      throw new ApiError(
        'UNKNOWN_ERROR',
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }

  // Repository Management API
  async validateRepository(
    request: RepositoryValidateRequest
  ): Promise<RepositoryValidationResult> {
    return this.request<RepositoryValidationResult>('/repositories/validate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getRepositoryInfo(repositoryPath: string): Promise<RepositoryInfo> {
    const params = new URLSearchParams({ repositoryPath });
    return this.request<RepositoryInfo>(`/repositories/info?${params}`);
  }

  async getRepositoryHealth(): Promise<any> {
    return this.request('/repositories/health');
  }

  // Project Management API
  async createProject(request: CreateProjectRequest): Promise<CreateProjectResponse> {
    return this.request<CreateProjectResponse>('/projects', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getProjects(): Promise<{ projects: ProjectResponse[]; count: number }> {
    return this.request<{ projects: ProjectResponse[]; count: number }>('/projects');
  }

  async getProject(id: string): Promise<ProjectResponse> {
    return this.request<ProjectResponse>(`/projects/${id}`);
  }

  async deleteProject(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Task Management API
  async getProjectTasks(projectId: string): Promise<any> {
    return this.request<any>(`/projects/${projectId}/tasks`);
  }

  async getTasksFromFile(filePath: string): Promise<any> {
    const params = new URLSearchParams({ filePath });
    return this.request<any>(`/tasks/file?${params}`);
  }

  async getTasksFromRepository(repositoryPath: string, projectTag?: string): Promise<any> {
    const params = new URLSearchParams({ repositoryPath });
    if (projectTag) {
      params.append('projectTag', projectTag);
    }
    return this.request<any>(`/tasks/repository?${params}`);
  }
}

// Default API service instance
export const apiService = new ApiService();