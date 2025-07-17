/**
 * Security Configuration for TaskMaster UI
 * 
 * Centralizes security settings and provides runtime security enforcement
 * for the TaskMaster UI application.
 */

import { RateLimiter } from '../utils/security';
import { config } from './environment';

export interface SecurityConfig {
  // Content Security Policy
  csp: {
    enabled: boolean;
    reportOnly: boolean;
    policy: string;
  };
  
  // Rate limiting
  rateLimiting: {
    enabled: boolean;
    maxAttempts: number;
    windowMs: number;
  };
  
  // Security headers
  headers: {
    enableXSSProtection: boolean;
    enableContentTypeOptions: boolean;
    enableFrameOptions: boolean;
    enableReferrerPolicy: boolean;
  };
  
  // Environment-specific settings
  environment: {
    isDevelopment: boolean;
    isProduction: boolean;
    allowDebugMode: boolean;
    enableSourceMaps: boolean;
  };
  
  // API security
  api: {
    baseUrl: string;
    timeout: number;
    allowedOrigins: string[];
  };
}

/**
 * Default security configuration
 */
const createSecurityConfig = (): SecurityConfig => {
  return {
    csp: {
      enabled: config.enableCSP,
      reportOnly: config.nodeEnv === 'development',
      policy: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'", // Note: 'unsafe-inline' should be removed when possible
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' https:",
        "connect-src 'self' ws: wss:",
        "frame-ancestors 'none'",
        "object-src 'none'",
        "base-uri 'self'"
      ].join('; ')
    },
    
    rateLimiting: {
      enabled: config.enableRateLimiting,
      maxAttempts: config.rateLimitMaxAttempts,
      windowMs: config.rateLimitWindowMs
    },
    
    headers: {
      enableXSSProtection: true,
      enableContentTypeOptions: true,
      enableFrameOptions: true,
      enableReferrerPolicy: true
    },
    
    environment: {
      isDevelopment: config.nodeEnv === 'development',
      isProduction: config.nodeEnv === 'production',
      allowDebugMode: config.enableDebug,
      enableSourceMaps: config.enableSourceMaps
    },
    
    api: {
      baseUrl: config.apiBaseUrl,
      timeout: config.apiTimeout,
      allowedOrigins: config.nodeEnv === 'development' 
        ? ['http://localhost:3000', 'http://localhost:3001']
        : []
    }
  };
};

export const securityConfig = createSecurityConfig();

/**
 * Rate limiter instances for different operations
 */
export const rateLimiters = {
  // Repository operations
  repository: new RateLimiter(
    securityConfig.rateLimiting.maxAttempts,
    securityConfig.rateLimiting.windowMs
  ),
  
  // Project operations
  project: new RateLimiter(
    securityConfig.rateLimiting.maxAttempts,
    securityConfig.rateLimiting.windowMs
  ),
  
  // Task operations
  task: new RateLimiter(
    securityConfig.rateLimiting.maxAttempts * 2, // More lenient for task operations
    securityConfig.rateLimiting.windowMs
  ),
  
  // General API calls
  api: new RateLimiter(
    securityConfig.rateLimiting.maxAttempts * 5, // Most lenient for general API
    securityConfig.rateLimiting.windowMs
  )
};

/**
 * Security enforcement functions
 */
export class SecurityEnforcer {
  /**
   * Initialize security policies
   */
  static initialize(): void {
    this.enforceContentSecurityPolicy();
    this.preventRightClick();
    this.preventDevTools();
    this.enforceSecureConnection();
  }
  
  /**
   * Enforce Content Security Policy if not already set
   */
  private static enforceContentSecurityPolicy(): void {
    if (!securityConfig.csp.enabled) return;
    
    // Check if CSP is already set in HTML
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingCSP) return;
    
    // Add CSP meta tag dynamically
    const cspMeta = document.createElement('meta');
    cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
    cspMeta.setAttribute('content', securityConfig.csp.policy);
    document.head.appendChild(cspMeta);
  }
  
  /**
   * Prevent right-click context menu in production
   */
  private static preventRightClick(): void {
    if (securityConfig.environment.isDevelopment) return;
    
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  }
  
  /**
   * Prevent dev tools access in production
   */
  private static preventDevTools(): void {
    if (securityConfig.environment.isDevelopment) return;
    
    // Detect dev tools
    let devtools = {
      open: false,
      orientation: null as string | null
    };
    
    const threshold = 160;
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          console.clear();
          console.warn('Developer tools detected. Please close them for security reasons.');
          
          // Optional: Redirect or take action
          // window.location.href = '/';
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  }
  
  /**
   * Enforce secure connection in production
   */
  private static enforceSecureConnection(): void {
    if (securityConfig.environment.isDevelopment) return;
    
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }
  }
  
  /**
   * Check if an operation is rate limited
   */
  static checkRateLimit(operation: keyof typeof rateLimiters, identifier: string): boolean {
    const limiter = rateLimiters[operation];
    return limiter.isLimited(identifier);
  }
  
  /**
   * Record an operation attempt
   */
  static recordAttempt(operation: keyof typeof rateLimiters, identifier: string): void {
    const limiter = rateLimiters[operation];
    limiter.recordAttempt(identifier);
  }
  
  /**
   * Generate client session ID for rate limiting
   */
  static getClientId(): string {
    let clientId = sessionStorage.getItem('taskmaster-client-id');
    
    if (!clientId) {
      // Generate a simple client ID based on browser fingerprint
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx!.textBaseline = 'top';
      ctx!.font = '14px Arial';
      ctx!.fillText('TaskMaster UI', 2, 2);
      
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL()
      ].join('|');
      
      // Simple hash
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      clientId = Math.abs(hash).toString(36);
      sessionStorage.setItem('taskmaster-client-id', clientId);
    }
    
    return clientId;
  }
  
  /**
   * Log security events
   */
  static logSecurityEvent(event: string, details?: any): void {
    if (securityConfig.environment.isDevelopment) {
      console.warn(`[Security] ${event}`, details);
    }
    
    // In production, this could send to a logging service
    // Example: sendToSecurityLog({ event, details, timestamp: new Date(), clientId: this.getClientId() });
  }
}

/**
 * Hook for components to check security policies
 */
export const useSecurityPolicy = () => {
  return {
    config: securityConfig,
    checkRateLimit: (operation: keyof typeof rateLimiters) => {
      const clientId = SecurityEnforcer.getClientId();
      return SecurityEnforcer.checkRateLimit(operation, clientId);
    },
    recordAttempt: (operation: keyof typeof rateLimiters) => {
      const clientId = SecurityEnforcer.getClientId();
      SecurityEnforcer.recordAttempt(operation, clientId);
    },
    logEvent: SecurityEnforcer.logSecurityEvent
  };
};

export default securityConfig;