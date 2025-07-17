/**
 * API Security Utilities
 * 
 * Provides secure handling of API requests related to file system
 * and repository operations from the frontend.
 */

import { validateRepositoryPath, validateProjectName, validateTaskId } from './security';
import { config } from '../config/environment';
import { useSecurityPolicy } from '../config/security';

/**
 * Secure API request configuration
 */
export interface SecureApiConfig {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
  retries: number;
  retryDelay: number;
}

/**
 * API request options
 */
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  validateResponse?: boolean;
  rateLimitKey?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
  headers: Headers;
}

/**
 * Secure API client for file system and repository operations
 */
export class SecureApiClient {
  private config: SecureApiConfig;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(configOverrides?: Partial<SecureApiConfig>) {
    this.config = {
      baseUrl: configOverrides?.baseUrl || config.apiBaseUrl,
      timeout: configOverrides?.timeout || config.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Client-Version': '1.0.0',
        ...configOverrides?.headers
      },
      retries: configOverrides?.retries || 3,
      retryDelay: configOverrides?.retryDelay || 1000
    };
  }

  /**
   * Make a secure API request
   */
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.config.timeout,
      validateResponse = true,
      rateLimitKey
    } = options;

    // Validate endpoint
    const sanitizedEndpoint = this.sanitizeEndpoint(endpoint);
    if (!sanitizedEndpoint) {
      return {
        success: false,
        error: 'Invalid API endpoint',
        status: 400,
        headers: new Headers()
      };
    }

    // Check rate limiting
    if (rateLimitKey) {
      const { checkRateLimit, recordAttempt } = useSecurityPolicy();
      if (checkRateLimit('api')) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          status: 429,
          headers: new Headers()
        };
      }
      recordAttempt('api');
    }

    const requestId = this.generateRequestId();
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    // Set timeout
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeout);

    try {
      const url = `${this.config.baseUrl}${sanitizedEndpoint}`;
      const requestHeaders: Record<string, string> = {
        ...this.config.headers,
        ...headers,
        'X-Request-ID': requestId
      };

      // Prepare request body
      let requestBody: string | FormData | undefined;
      if (body !== undefined) {
        if (body instanceof FormData) {
          requestBody = body;
          delete (requestHeaders as any)['Content-Type']; // Let browser set it for FormData
        } else {
          requestBody = JSON.stringify(this.sanitizeRequestBody(body));
        }
      }

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal: abortController.signal,
        credentials: 'include',
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (validateResponse && !this.isValidResponse(response)) {
        return {
          success: false,
          error: `Invalid response: ${response.status} ${response.statusText}`,
          status: response.status,
          headers: response.headers
        };
      }

      let data: T | undefined;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const text = await response.text();
        if (text.trim()) {
          data = JSON.parse(text) as T;
        }
      } else if (contentType?.includes('text/')) {
        data = (await response.text()) as unknown as T;
      }

      return {
        success: response.ok,
        data,
        error: response.ok ? undefined : `Request failed: ${response.status} ${response.statusText}`,
        status: response.status,
        headers: response.headers
      };

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
            status: 408,
            headers: new Headers()
          };
        }

        return {
          success: false,
          error: error.message,
          status: 500,
          headers: new Headers()
        };
      }

      return {
        success: false,
        error: 'Unknown error occurred',
        status: 500,
        headers: new Headers()
      };
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Secure repository operations
   */
  async addRepository(repositoryPath: string): Promise<ApiResponse> {
    const validation = validateRepositoryPath(repositoryPath);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || 'Invalid repository path',
        status: 400,
        headers: new Headers()
      };
    }

    return this.request('/api/repositories', {
      method: 'POST',
      body: { path: validation.sanitizedValue },
      rateLimitKey: 'repository'
    });
  }

  async getRepositories(): Promise<ApiResponse> {
    return this.request('/api/repositories', {
      method: 'GET',
      rateLimitKey: 'repository'
    });
  }

  async deleteRepository(repositoryId: string): Promise<ApiResponse> {
    if (!repositoryId || typeof repositoryId !== 'string') {
      return {
        success: false,
        error: 'Invalid repository ID',
        status: 400,
        headers: new Headers()
      };
    }

    const sanitizedId = this.sanitizeId(repositoryId);
    return this.request(`/api/repositories/${sanitizedId}`, {
      method: 'DELETE',
      rateLimitKey: 'repository'
    });
  }

  /**
   * Secure project operations
   */
  async createProject(repositoryId: string, projectName: string): Promise<ApiResponse> {
    const nameValidation = validateProjectName(projectName);
    if (!nameValidation.isValid) {
      return {
        success: false,
        error: nameValidation.error || 'Invalid project name',
        status: 400,
        headers: new Headers()
      };
    }

    const sanitizedRepoId = this.sanitizeId(repositoryId);
    return this.request('/api/projects', {
      method: 'POST',
      body: {
        repositoryId: sanitizedRepoId,
        name: nameValidation.sanitizedValue
      },
      rateLimitKey: 'project'
    });
  }

  /**
   * Secure task operations
   */
  async updateTaskStatus(taskId: string | number, status: string): Promise<ApiResponse> {
    const idValidation = validateTaskId(taskId);
    if (!idValidation.isValid) {
      return {
        success: false,
        error: idValidation.error || 'Invalid task ID',
        status: 400,
        headers: new Headers()
      };
    }

    const allowedStatuses = ['pending', 'in-progress', 'done', 'blocked', 'cancelled', 'deferred'];
    if (!allowedStatuses.includes(status)) {
      return {
        success: false,
        error: 'Invalid task status',
        status: 400,
        headers: new Headers()
      };
    }

    return this.request(`/api/tasks/${idValidation.sanitizedValue}`, {
      method: 'PATCH',
      body: { status },
      rateLimitKey: 'task'
    });
  }

  /**
   * Sanitize API endpoint
   */
  private sanitizeEndpoint(endpoint: string): string | null {
    if (!endpoint || typeof endpoint !== 'string') {
      return null;
    }

    // Remove any potentially dangerous patterns
    const sanitized = endpoint
      .replace(/[^a-zA-Z0-9\-_/?&=.]/g, '')
      .replace(/.{2,}/g, '') // Remove path traversal
      .replace(/\/+/g, '/') // Normalize slashes
      .trim();

    // Ensure it starts with /
    if (!sanitized.startsWith('/')) {
      return `/${sanitized}`;
    }

    // Basic length check
    if (sanitized.length > 200) {
      return null;
    }

    return sanitized;
  }

  /**
   * Sanitize request body
   */
  private sanitizeRequestBody(body: any): any {
    if (body === null || body === undefined) {
      return body;
    }

    if (typeof body === 'string') {
      return body.slice(0, 10000); // Limit string length
    }

    if (Array.isArray(body)) {
      return body.slice(0, 100).map(item => this.sanitizeRequestBody(item));
    }

    if (typeof body === 'object') {
      const sanitized: any = {};
      let fieldCount = 0;

      for (const [key, value] of Object.entries(body)) {
        if (fieldCount >= 50) break; // Limit number of fields

        const sanitizedKey = String(key).slice(0, 100);
        sanitized[sanitizedKey] = this.sanitizeRequestBody(value);
        fieldCount++;
      }

      return sanitized;
    }

    return body;
  }

  /**
   * Sanitize ID parameter
   */
  private sanitizeId(id: string): string {
    return String(id)
      .replace(/[^a-zA-Z0-9\-_.]/g, '')
      .slice(0, 50);
  }

  /**
   * Validate response
   */
  private isValidResponse(response: Response): boolean {
    // Check status code range
    if (response.status < 100 || response.status >= 600) {
      return false;
    }

    // Check for required security headers
    const requiredHeaders = ['x-content-type-options', 'x-frame-options'];
    for (const header of requiredHeaders) {
      if (!response.headers.has(header)) {
        console.warn(`Missing security header: ${header}`);
      }
    }

    return true;
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    for (const [requestId, controller] of this.abortControllers.entries()) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Cancel specific request
   */
  cancelRequest(requestId: string): boolean {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
      return true;
    }
    return false;
  }
}

// Create singleton instance
export const secureApiClient = new SecureApiClient();

/**
 * React hook for secure API operations
 */
export const useSecureApi = () => {
  return {
    client: secureApiClient,
    
    // Repository operations
    addRepository: (path: string) => secureApiClient.addRepository(path),
    getRepositories: () => secureApiClient.getRepositories(),
    deleteRepository: (id: string) => secureApiClient.deleteRepository(id),
    
    // Project operations
    createProject: (repoId: string, name: string) => secureApiClient.createProject(repoId, name),
    
    // Task operations
    updateTaskStatus: (taskId: string | number, status: string) => 
      secureApiClient.updateTaskStatus(taskId, status),
    
    // Utility
    cancelAllRequests: () => secureApiClient.cancelAllRequests()
  };
};

export default secureApiClient;