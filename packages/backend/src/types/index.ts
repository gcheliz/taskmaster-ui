export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}