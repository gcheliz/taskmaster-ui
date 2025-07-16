/**
 * PRD API Service
 * 
 * Provides backend API integration for saving and loading PRD documents
 * to/from the file system via the backend API.
 */

export interface PRDDocument {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  charCount: number;
  version: string;
  metadata?: Record<string, any>;
}

export interface PRDDocumentList {
  documents: PRDDocument[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePRDRequest {
  title: string;
  content: string;
  wordCount: number;
  charCount: number;
  metadata?: Record<string, any>;
}

export interface UpdatePRDRequest {
  title?: string;
  content?: string;
  wordCount?: number;
  charCount?: number;
  metadata?: Record<string, any>;
}

export interface PRDApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const API_BASE_URL = '/api/prd';

/**
 * Generic API request handler
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<PRDApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Save a new PRD document
 */
export const savePRDDocument = async (
  prdData: CreatePRDRequest
): Promise<PRDApiResponse<PRDDocument>> => {
  return apiRequest<PRDDocument>('/documents', {
    method: 'POST',
    body: JSON.stringify(prdData),
  });
};

/**
 * Update an existing PRD document
 */
export const updatePRDDocument = async (
  id: string,
  prdData: UpdatePRDRequest
): Promise<PRDApiResponse<PRDDocument>> => {
  return apiRequest<PRDDocument>(`/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(prdData),
  });
};

/**
 * Load a PRD document by ID
 */
export const loadPRDDocument = async (
  id: string
): Promise<PRDApiResponse<PRDDocument>> => {
  return apiRequest<PRDDocument>(`/documents/${id}`, {
    method: 'GET',
  });
};

/**
 * Delete a PRD document
 */
export const deletePRDDocument = async (
  id: string
): Promise<PRDApiResponse<void>> => {
  return apiRequest<void>(`/documents/${id}`, {
    method: 'DELETE',
  });
};

/**
 * List all PRD documents
 */
export const listPRDDocuments = async (
  page: number = 1,
  limit: number = 10
): Promise<PRDApiResponse<PRDDocumentList>> => {
  return apiRequest<PRDDocumentList>(`/documents?page=${page}&limit=${limit}`, {
    method: 'GET',
  });
};

/**
 * Search PRD documents
 */
export const searchPRDDocuments = async (
  query: string,
  page: number = 1,
  limit: number = 10
): Promise<PRDApiResponse<PRDDocumentList>> => {
  return apiRequest<PRDDocumentList>(
    `/documents/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    {
      method: 'GET',
    }
  );
};

/**
 * Export PRD document to different formats
 */
export const exportPRDDocument = async (
  id: string,
  format: 'pdf' | 'docx' | 'html' | 'md'
): Promise<PRDApiResponse<Blob>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/export?format=${format}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    return {
      success: true,
      data: blob,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
};

/**
 * Check if the backend API is available
 */
export const checkApiHealth = async (): Promise<PRDApiResponse<{ status: string }>> => {
  return apiRequest<{ status: string }>('/health', {
    method: 'GET',
  });
};

/**
 * Auto-save functionality for PRD documents
 */
export class PRDAutoSaver {
  private saveTimer: NodeJS.Timeout | null = null;
  private readonly saveInterval: number;
  private readonly onSave: (content: string, title: string) => Promise<void>;
  private readonly onError: (error: string) => void;

  constructor(
    saveInterval: number = 5000,
    onSave: (content: string, title: string) => Promise<void>,
    onError: (error: string) => void = console.error
  ) {
    this.saveInterval = saveInterval;
    this.onSave = onSave;
    this.onError = onError;
  }

  /**
   * Start auto-saving
   */
  start(content: string, title: string): void {
    this.stop(); // Clear any existing timer
    
    this.saveTimer = setTimeout(async () => {
      try {
        await this.onSave(content, title);
      } catch (error) {
        this.onError(error instanceof Error ? error.message : 'Auto-save failed');
      }
    }, this.saveInterval);
  }

  /**
   * Stop auto-saving
   */
  stop(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
  }

  /**
   * Save immediately
   */
  async saveNow(content: string, title: string): Promise<void> {
    this.stop(); // Clear any pending save
    await this.onSave(content, title);
  }
}

export default {
  savePRDDocument,
  updatePRDDocument,
  loadPRDDocument,
  deletePRDDocument,
  listPRDDocuments,
  searchPRDDocuments,
  exportPRDDocument,
  checkApiHealth,
  PRDAutoSaver,
};