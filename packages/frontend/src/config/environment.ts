/**
 * Environment Configuration Manager
 * 
 * Provides secure, type-safe access to environment variables
 * with validation and fallback values for TaskMaster UI.
 */

import { isDevelopment } from '../utils/security';

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  // Application
  nodeEnv: 'development' | 'production' | 'test';
  
  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;
  
  // WebSocket Configuration
  wsUrl: string;
  wsReconnectDelay: number;
  
  // Security
  enableCSP: boolean;
  enableRateLimiting: boolean;
  rateLimitMaxAttempts: number;
  rateLimitWindowMs: number;
  
  // Development
  enableDebug: boolean;
  enableSourceMaps: boolean;
  enableDevTools: boolean;
  
  // Feature Flags
  enableNotifications: boolean;
  enableThemeToggle: boolean;
  enableDragDrop: boolean;
  
  // Limits
  maxRepositories: number;
  maxProjectsPerRepo: number;
  maxTasksPerProject: number;
  autoSaveInterval: number;
  
  // File Upload
  maxFileSize: number;
  allowedFileTypes: string[];
  
  // Optional Analytics
  analyticsId?: string;
  sentryDsn?: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Environment variable accessor with validation
 */
class EnvironmentManager {
  private config: EnvironmentConfig;
  private isInitialized = false;
  
  constructor() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
    this.isInitialized = true;
  }
  
  /**
   * Load configuration from environment variables
   */
  private loadConfiguration(): EnvironmentConfig {
    const mode = import.meta.env.MODE || 'production';
    const isDev = mode === 'development';
    
    return {
      // Application
      nodeEnv: this.getString('VITE_TASKMASTER_NODE_ENV', mode) as 'development' | 'production' | 'test',
      
      // API Configuration
      apiBaseUrl: this.getString('VITE_TASKMASTER_API_BASE_URL', isDev ? 'http://localhost:3001' : ''),
      apiTimeout: this.getNumber('VITE_TASKMASTER_API_TIMEOUT', 30000),
      
      // WebSocket Configuration
      wsUrl: this.getString('VITE_TASKMASTER_WS_URL', isDev ? 'ws://localhost:3001' : ''),
      wsReconnectDelay: this.getNumber('VITE_TASKMASTER_WS_RECONNECT_DELAY', 5000),
      
      // Security
      enableCSP: this.getBoolean('VITE_TASKMASTER_ENABLE_CSP', true),
      enableRateLimiting: this.getBoolean('VITE_TASKMASTER_ENABLE_RATE_LIMITING', true),
      rateLimitMaxAttempts: this.getNumber('VITE_TASKMASTER_RATE_LIMIT_MAX_ATTEMPTS', isDev ? 100 : 10),
      rateLimitWindowMs: this.getNumber('VITE_TASKMASTER_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
      
      // Development
      enableDebug: this.getBoolean('VITE_TASKMASTER_ENABLE_DEBUG', isDev),
      enableSourceMaps: this.getBoolean('VITE_TASKMASTER_ENABLE_SOURCE_MAPS', isDev),
      enableDevTools: this.getBoolean('VITE_TASKMASTER_ENABLE_DEV_TOOLS', isDev),
      
      // Feature Flags
      enableNotifications: this.getBoolean('VITE_TASKMASTER_ENABLE_NOTIFICATIONS', true),
      enableThemeToggle: this.getBoolean('VITE_TASKMASTER_ENABLE_THEME_TOGGLE', true),
      enableDragDrop: this.getBoolean('VITE_TASKMASTER_ENABLE_DRAG_DROP', true),
      
      // Limits
      maxRepositories: this.getNumber('VITE_TASKMASTER_MAX_REPOSITORIES', isDev ? 50 : 10),
      maxProjectsPerRepo: this.getNumber('VITE_TASKMASTER_MAX_PROJECTS_PER_REPO', isDev ? 10 : 5),
      maxTasksPerProject: this.getNumber('VITE_TASKMASTER_MAX_TASKS_PER_PROJECT', isDev ? 5000 : 1000),
      autoSaveInterval: this.getNumber('VITE_TASKMASTER_AUTO_SAVE_INTERVAL', isDev ? 10000 : 30000),
      
      // File Upload
      maxFileSize: this.getNumber('VITE_TASKMASTER_MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB
      allowedFileTypes: this.getStringArray('VITE_TASKMASTER_ALLOWED_FILE_TYPES', ['txt', 'md', 'json']),
      
      // Optional Analytics
      analyticsId: this.getString('VITE_TASKMASTER_ANALYTICS_ID', undefined),
      sentryDsn: this.getString('VITE_TASKMASTER_SENTRY_DSN', undefined),
      logLevel: this.getString('VITE_TASKMASTER_LOG_LEVEL', isDev ? 'debug' : 'info') as 'debug' | 'info' | 'warn' | 'error'
    };
  }
  
  /**
   * Get string environment variable
   */
  private getString(key: string, defaultValue?: string): string {
    const value = import.meta.env[key];
    
    if (value === undefined || value === null || value === '') {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Environment variable ${key} is required but not provided`);
    }
    
    return String(value);
  }
  
  /**
   * Get number environment variable
   */
  private getNumber(key: string, defaultValue: number): number {
    const value = import.meta.env[key];
    
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }
    
    const parsed = Number(value);
    if (isNaN(parsed)) {
      if (this.config?.enableDebug) {
        console.warn(`Environment variable ${key} is not a valid number, using default: ${defaultValue}`);
      }
      return defaultValue;
    }
    
    return parsed;
  }
  
  /**
   * Get boolean environment variable
   */
  private getBoolean(key: string, defaultValue: boolean): boolean {
    const value = import.meta.env[key];
    
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }
    
    const stringValue = String(value).toLowerCase();
    return stringValue === 'true' || stringValue === '1' || stringValue === 'yes' || stringValue === 'on';
  }
  
  /**
   * Get string array environment variable
   */
  private getStringArray(key: string, defaultValue: string[]): string[] {
    const value = import.meta.env[key];
    
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }
    
    try {
      return String(value).split(',').map(item => item.trim()).filter(item => item.length > 0);
    } catch {
      if (this.config?.enableDebug) {
        console.warn(`Environment variable ${key} is not a valid array, using default: ${defaultValue}`);
      }
      return defaultValue;
    }
  }
  
  /**
   * Validate configuration values
   */
  private validateConfiguration(): void {
    const errors: string[] = [];
    
    // Validate API URL
    if (this.config.apiBaseUrl && !this.isValidUrl(this.config.apiBaseUrl)) {
      errors.push('Invalid API base URL');
    }
    
    // Validate WebSocket URL
    if (this.config.wsUrl && !this.isValidWebSocketUrl(this.config.wsUrl)) {
      errors.push('Invalid WebSocket URL');
    }
    
    // Validate timeouts and intervals
    if (this.config.apiTimeout < 1000 || this.config.apiTimeout > 120000) {
      errors.push('API timeout must be between 1 and 120 seconds');
    }
    
    if (this.config.autoSaveInterval < 5000) {
      errors.push('Auto-save interval must be at least 5 seconds');
    }
    
    // Validate limits
    if (this.config.maxRepositories < 1 || this.config.maxRepositories > 1000) {
      errors.push('Max repositories must be between 1 and 1000');
    }
    
    if (this.config.maxFileSize < 1024 || this.config.maxFileSize > 100 * 1024 * 1024) {
      errors.push('Max file size must be between 1KB and 100MB');
    }
    
    // Validate rate limiting
    if (this.config.rateLimitMaxAttempts < 1 || this.config.rateLimitMaxAttempts > 10000) {
      errors.push('Rate limit max attempts must be between 1 and 10000');
    }
    
    if (this.config.rateLimitWindowMs < 1000 || this.config.rateLimitWindowMs > 24 * 60 * 60 * 1000) {
      errors.push('Rate limit window must be between 1 second and 24 hours');
    }
    
    if (errors.length > 0) {
      const errorMessage = `Configuration validation failed:\n${errors.join('\n')}`;
      console.error(errorMessage);
      
      if (!isDevelopment()) {
        throw new Error('Invalid configuration detected');
      }
    }
  }
  
  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
  
  /**
   * Validate WebSocket URL format
   */
  private isValidWebSocketUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['ws:', 'wss:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
  
  /**
   * Get configuration
   */
  getConfig(): EnvironmentConfig {
    if (!this.isInitialized) {
      throw new Error('Environment manager not initialized');
    }
    return { ...this.config };
  }
  
  /**
   * Get specific configuration value
   */
  get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.getConfig()[key];
  }
  
  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: keyof Pick<EnvironmentConfig, 'enableNotifications' | 'enableThemeToggle' | 'enableDragDrop' | 'enableDebug' | 'enableCSP' | 'enableRateLimiting'>): boolean {
    return Boolean(this.get(feature));
  }
  
  /**
   * Get sanitized configuration for logging (removes sensitive data)
   */
  getSanitizedConfig(): Partial<EnvironmentConfig> {
    const config = this.getConfig();
    const sanitized = { ...config };
    
    // Remove potentially sensitive information
    delete sanitized.analyticsId;
    delete sanitized.sentryDsn;
    
    return sanitized;
  }
  
  /**
   * Validate runtime environment
   */
  validateRuntime(): boolean {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return false;
      }
      
      // Check for required browser APIs
      const requiredAPIs = [
        'localStorage',
        'sessionStorage',
        'JSON',
        'fetch',
        'URL',
        'URLSearchParams'
      ];
      
      for (const api of requiredAPIs) {
        if (!(api in window)) {
          console.error(`Required browser API not available: ${api}`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Runtime validation failed:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const env = new EnvironmentManager();

// Export configuration for easy access
export const config = env.getConfig();

// Export convenience functions
export const isFeatureEnabled = (feature: Parameters<typeof env.isFeatureEnabled>[0]) => env.isFeatureEnabled(feature);
export const getConfig = () => env.getConfig();
export const getSanitizedConfig = () => env.getSanitizedConfig();

// Development helper to log configuration
if (isDevelopment()) {
  console.group('🔧 TaskMaster UI Configuration');
  console.info('Environment:', config.nodeEnv);
  console.info('Debug mode:', config.enableDebug);
  console.info('Configuration:', getSanitizedConfig());
  console.groupEnd();
}

export default env;