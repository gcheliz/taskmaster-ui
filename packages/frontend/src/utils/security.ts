/**
 * Security Utilities for TaskMaster UI
 * 
 * Provides input validation, sanitization, and security-focused utilities
 * to prevent XSS, injection attacks, and other security vulnerabilities.
 */

/**
 * Input validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

/**
 * Regular expressions for validation
 */
const VALIDATION_PATTERNS = {
  // Path validation - allows absolute paths for Unix and Windows
  absolutePath: /^(?:\/[\w\-.~\s/]*|[A-Za-z]:[\\]?[\w\-.~\s\\]*)$/,
  
  // Project name - alphanumeric, spaces, hyphens, underscores
  projectName: /^[a-zA-Z0-9\-_\s]+$/,
  
  // File name - basic file name validation
  fileName: /^[a-zA-Z0-9\-_.\s]+$/,
  
  // Git branch name - follows git naming conventions
  gitBranch: /^[a-zA-Z0-9][a-zA-Z0-9\-_/.]*[a-zA-Z0-9]$/,
  
  // Task ID - numeric or compound (e.g., 18.4)
  taskId: /^[0-9]+(?:\.[0-9]+)?$/,
  
  // Safe HTML content - very restrictive
  safeText: /^[a-zA-Z0-9\-_\s.,!?;:(){}[\]'"@#$%&+=~`]*$/
};

/**
 * Dangerous patterns that should be rejected
 */
const DANGEROUS_PATTERNS = [
  // Path traversal attempts
  /\.\./,
  /\.\/\.\./,
  /\.\.\//,
  /\.\.\\/,
  
  // Command injection attempts
  /[;&|`$()]/,
  /\${.*}/,
  
  // Script injection attempts
  /<script[^>]*>/i,
  /<\/script>/i,
  /javascript:/i,
  /vbscript:/i,
  /onload=/i,
  /onerror=/i,
  /onclick=/i,
  
  // SQL injection patterns
  /union.*select/i,
  /drop\s+table/i,
  /insert\s+into/i,
  /delete\s+from/i,
  
  // Null bytes and control characters (using Unicode escapes)
  /\u0000/,
  /[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/,
  
  // File system manipulation
  /\/dev\//i,
  /\/proc\//i,
  /\/sys\//i,
  /\/etc\//i,
  /system32/i,
  /windows/i,
  
  // Protocol handlers
  /file:\/\//i,
  /ftp:\/\//i,
  /data:/i
];

/**
 * Sanitize a string by removing or escaping dangerous characters
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    // Remove null bytes and control characters
    .replace(/[\u0000-\u001F\u007F]/g, '')
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate and sanitize repository path
 */
export const validateRepositoryPath = (path: string): ValidationResult => {
  if (!path || typeof path !== 'string') {
    return {
      isValid: false,
      error: 'Repository path is required'
    };
  }
  
  const trimmedPath = path.trim();
  
  // Check length constraints
  if (trimmedPath.length < 2) {
    return {
      isValid: false,
      error: 'Path is too short'
    };
  }
  
  if (trimmedPath.length > 500) {
    return {
      isValid: false,
      error: 'Path is too long (max 500 characters)'
    };
  }
  
  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmedPath)) {
      return {
        isValid: false,
        error: 'Path contains potentially dangerous characters'
      };
    }
  }
  
  // Validate absolute path format
  if (!VALIDATION_PATTERNS.absolutePath.test(trimmedPath)) {
    return {
      isValid: false,
      error: 'Please provide an absolute path (e.g., /Users/john/my-repo or C:\\Users\\john\\my-repo)'
    };
  }
  
  // Additional security checks
  const normalizedPath = trimmedPath.toLowerCase();
  
  // Prevent access to system directories
  const systemPaths = [
    '/bin', '/boot', '/dev', '/etc', '/lib', '/proc', '/root', '/sbin', '/sys', '/tmp', '/var',
    'c:\\windows', 'c:\\system32', 'c:\\program files', 'c:\\programdata'
  ];
  
  for (const sysPath of systemPaths) {
    if (normalizedPath.startsWith(sysPath)) {
      return {
        isValid: false,
        error: 'Access to system directories is not allowed'
      };
    }
  }
  
  return {
    isValid: true,
    sanitizedValue: trimmedPath
  };
};

/**
 * Validate and sanitize project name
 */
export const validateProjectName = (name: string): ValidationResult => {
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      error: 'Project name is required'
    };
  }
  
  const trimmedName = name.trim();
  
  // Check length constraints
  if (trimmedName.length < 2) {
    return {
      isValid: false,
      error: 'Project name must be at least 2 characters long'
    };
  }
  
  if (trimmedName.length > 50) {
    return {
      isValid: false,
      error: 'Project name must be less than 50 characters'
    };
  }
  
  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmedName)) {
      return {
        isValid: false,
        error: 'Project name contains invalid characters'
      };
    }
  }
  
  // Validate allowed characters
  if (!VALIDATION_PATTERNS.projectName.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Project name can only contain letters, numbers, spaces, hyphens, and underscores'
    };
  }
  
  // Prevent reserved names
  const reservedNames = [
    'con', 'prn', 'aux', 'nul', 'com1', 'com2', 'com3', 'com4', 'com5',
    'com6', 'com7', 'com8', 'com9', 'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5',
    'lpt6', 'lpt7', 'lpt8', 'lpt9', 'system', 'admin', 'root', 'test'
  ];
  
  if (reservedNames.includes(trimmedName.toLowerCase())) {
    return {
      isValid: false,
      error: 'Project name is reserved and cannot be used'
    };
  }
  
  return {
    isValid: true,
    sanitizedValue: trimmedName
  };
};

/**
 * Validate task ID format
 */
export const validateTaskId = (taskId: string | number): ValidationResult => {
  const stringId = String(taskId).trim();
  
  if (!stringId) {
    return {
      isValid: false,
      error: 'Task ID is required'
    };
  }
  
  if (!VALIDATION_PATTERNS.taskId.test(stringId)) {
    return {
      isValid: false,
      error: 'Invalid task ID format'
    };
  }
  
  return {
    isValid: true,
    sanitizedValue: stringId
  };
};

/**
 * Validate and sanitize generic text input
 */
export const validateTextInput = (
  input: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    allowSpecialChars?: boolean;
  } = {}
): ValidationResult => {
  const {
    required = false,
    minLength = 0,
    maxLength = 1000,
    allowSpecialChars = false
  } = options;
  
  if (!input || typeof input !== 'string') {
    if (required) {
      return {
        isValid: false,
        error: 'This field is required'
      };
    }
    return {
      isValid: true,
      sanitizedValue: ''
    };
  }
  
  const trimmedInput = input.trim();
  
  // Check required
  if (required && !trimmedInput) {
    return {
      isValid: false,
      error: 'This field is required'
    };
  }
  
  // Check length constraints
  if (trimmedInput.length < minLength) {
    return {
      isValid: false,
      error: `Must be at least ${minLength} characters long`
    };
  }
  
  if (trimmedInput.length > maxLength) {
    return {
      isValid: false,
      error: `Must be less than ${maxLength} characters`
    };
  }
  
  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmedInput)) {
      return {
        isValid: false,
        error: 'Input contains potentially dangerous characters'
      };
    }
  }
  
  // Validate allowed characters
  if (!allowSpecialChars && !VALIDATION_PATTERNS.safeText.test(trimmedInput)) {
    return {
      isValid: false,
      error: 'Input contains invalid characters'
    };
  }
  
  return {
    isValid: true,
    sanitizedValue: sanitizeString(trimmedInput)
  };
};

/**
 * Create a Content Security Policy header value
 */
export const generateCSPHeader = (): string => {
  const policies = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // Note: 'unsafe-inline' should be avoided in production
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' https:",
    "connect-src 'self' ws: wss:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'"
  ];
  
  return policies.join('; ');
};

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;
  
  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }
  
  /**
   * Check if an IP/identifier is rate limited
   */
  isLimited(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(timestamp => now - timestamp < this.windowMs);
    
    this.attempts.set(identifier, validAttempts);
    
    return validAttempts.length >= this.maxAttempts;
  }
  
  /**
   * Record an attempt
   */
  recordAttempt(identifier: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    attempts.push(now);
    this.attempts.set(identifier, attempts);
  }
  
  /**
   * Reset attempts for an identifier
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

/**
 * Secure random string generator
 */
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use crypto.getRandomValues if available (browser environment)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return result;
};

/**
 * Hash function for sensitive data (client-side)
 * Note: This is not suitable for password hashing - use on server with proper salt
 */
export const hashString = async (input: string): Promise<string> => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Simple fallback hash (not cryptographically secure)
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
};

/**
 * Environment security checks
 */
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'Content-Security-Policy': generateCSPHeader(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development' || 
         process.env.NODE_ENV === 'test' ||
         typeof window !== 'undefined' && window.location.hostname === 'localhost';
};

/**
 * Validate URL for safety
 */
export const validateURL = (url: string): ValidationResult => {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'URL is required'
    };
  }
  
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: 'Only HTTP and HTTPS URLs are allowed'
      };
    }
    
    // Prevent localhost in production
    if (!isDevelopment() && ['localhost', '127.0.0.1', '0.0.0.0'].includes(urlObj.hostname)) {
      return {
        isValid: false,
        error: 'Localhost URLs are not allowed in production'
      };
    }
    
    return {
      isValid: true,
      sanitizedValue: urlObj.toString()
    };
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format'
    };
  }
};