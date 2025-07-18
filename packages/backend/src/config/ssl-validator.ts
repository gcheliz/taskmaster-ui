/**
 * SSL/TLS Configuration Validator
 *
 * This module validates and enforces SSL/TLS configurations for database connections
 * and other secure communications.
 */

import * as fs from 'fs';
import * as path from 'path';
import { env } from './environment';

export interface SSLConfiguration {
  enabled: boolean;
  rejectUnauthorized: boolean;
  ca?: string;
  cert?: string;
  key?: string;
  passphrase?: string;
  servername?: string;
  checkServerIdentity?: boolean;
}

export interface SSLValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  configuration: SSLConfiguration;
}

/**
 * Validate SSL certificate file
 */
function validateCertificateFile(
  filePath: string,
  type: 'CA' | 'Certificate' | 'Key'
): { valid: boolean; error?: string } {
  if (!filePath) {
    return {
      valid: false,
      error: `${type} path is required when SSL is enabled`,
    };
  }

  if (!fs.existsSync(filePath)) {
    return { valid: false, error: `${type} file not found: ${filePath}` };
  }

  try {
    const stats = fs.statSync(filePath);

    // Check file permissions (should not be world-readable for private keys)
    if (type === 'Key' && (stats.mode & 0o044) !== 0) {
      return {
        valid: false,
        error: `${type} file has unsafe permissions: ${filePath}`,
      };
    }

    // Check file size (should not be empty)
    if (stats.size === 0) {
      return { valid: false, error: `${type} file is empty: ${filePath}` };
    }

    // Read and validate certificate format
    const content = fs.readFileSync(filePath, 'utf8');

    switch (type) {
      case 'CA':
      case 'Certificate':
        if (!content.includes('BEGIN CERTIFICATE')) {
          return {
            valid: false,
            error: `${type} file does not contain a valid certificate: ${filePath}`,
          };
        }
        break;
      case 'Key':
        if (!content.includes('BEGIN') || !content.includes('PRIVATE KEY')) {
          return {
            valid: false,
            error: `${type} file does not contain a valid private key: ${filePath}`,
          };
        }
        break;
    }

    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      error: `Failed to validate ${type} file: ${error.message}`,
    };
  }
}

/**
 * Validate SSL configuration
 */
export function validateSSLConfiguration(): SSLValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const sslEnabled = env.DATABASE_SSL === 'true';
  const isProduction = env.NODE_ENV === 'production';

  // Production SSL requirements
  if (isProduction && !sslEnabled) {
    errors.push('SSL/TLS is required for production database connections');
  }

  if (!sslEnabled) {
    if (isProduction) {
      errors.push('SSL is disabled in production environment');
    } else {
      warnings.push('SSL is disabled - only acceptable in development');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      configuration: {
        enabled: false,
        rejectUnauthorized: false,
      },
    };
  }

  // Validate certificate files
  const certValidation = env.SSL_CERT_PATH
    ? validateCertificateFile(env.SSL_CERT_PATH, 'Certificate')
    : { valid: true };
  const keyValidation = env.SSL_KEY_PATH
    ? validateCertificateFile(env.SSL_KEY_PATH, 'Key')
    : { valid: true };
  const caValidation = env.SSL_CA_PATH
    ? validateCertificateFile(env.SSL_CA_PATH, 'CA')
    : { valid: true };

  if (!certValidation.valid) {
    errors.push(certValidation.error!);
  }

  if (!keyValidation.valid) {
    errors.push(keyValidation.error!);
  }

  if (!caValidation.valid) {
    errors.push(caValidation.error!);
  }

  // SSL configuration warnings
  if (isProduction && !env.SSL_CA_PATH) {
    warnings.push(
      'No CA certificate specified - server certificate will not be verified'
    );
  }

  if (isProduction && (!env.SSL_CERT_PATH || !env.SSL_KEY_PATH)) {
    warnings.push('No client certificate specified - using server-only SSL');
  }

  const configuration: SSLConfiguration = {
    enabled: sslEnabled,
    rejectUnauthorized: isProduction,
    ca: env.SSL_CA_PATH ? fs.readFileSync(env.SSL_CA_PATH, 'utf8') : undefined,
    cert: env.SSL_CERT_PATH
      ? fs.readFileSync(env.SSL_CERT_PATH, 'utf8')
      : undefined,
    key: env.SSL_KEY_PATH
      ? fs.readFileSync(env.SSL_KEY_PATH, 'utf8')
      : undefined,
    checkServerIdentity: isProduction,
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    configuration,
  };
}

/**
 * Enforce SSL configuration for database connections
 */
export function enforceSSLConfiguration(): SSLConfiguration {
  const validation = validateSSLConfiguration();

  if (!validation.valid) {
    console.error('❌ SSL Configuration Validation Failed:');
    validation.errors.forEach(error => {
      console.error(`  - ${error}`);
    });

    if (env.NODE_ENV === 'production') {
      console.error('SSL configuration errors are fatal in production');
      process.exit(1);
    }
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️  SSL Configuration Warnings:');
    validation.warnings.forEach(warning => {
      console.warn(`  - ${warning}`);
    });
  }

  if (validation.configuration.enabled) {
    console.log('🔒 SSL/TLS encryption enabled for database connections');
  }

  return validation.configuration;
}

/**
 * Get SSL configuration for Prisma
 */
export function getPrismaSSLConfig(): any {
  const sslConfig = enforceSSLConfiguration();

  if (!sslConfig.enabled) {
    return undefined;
  }

  return {
    ssl: {
      rejectUnauthorized: sslConfig.rejectUnauthorized,
      ca: sslConfig.ca,
      cert: sslConfig.cert,
      key: sslConfig.key,
    },
  };
}

/**
 * Test SSL connection
 */
export async function testSSLConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { getDatabaseConfig } = await import('./environment');
    const config = getDatabaseConfig();

    // Extract connection details from DATABASE_URL
    const dbUrl = new URL(env.DATABASE_URL);

    // Use Node.js TLS module to test SSL connection
    const tls = await import('tls');

    return new Promise(resolve => {
      const socket = tls.connect(
        {
          host: dbUrl.hostname,
          port: parseInt(dbUrl.port) || 5432,
          ...config.ssl,
        },
        () => {
          socket.destroy();
          resolve({ success: true });
        }
      );

      socket.on('error', error => {
        socket.destroy();
        resolve({ success: false, error: error.message });
      });

      socket.setTimeout(10000, () => {
        socket.destroy();
        resolve({ success: false, error: 'Connection timeout' });
      });
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate SSL certificate information
 */
export function getSSLCertificateInfo(): any {
  const validation = validateSSLConfiguration();

  if (!validation.configuration.enabled) {
    return { enabled: false };
  }

  const info: any = {
    enabled: true,
    rejectUnauthorized: validation.configuration.rejectUnauthorized,
    files: {
      ca: env.SSL_CA_PATH || 'Not specified',
      cert: env.SSL_CERT_PATH || 'Not specified',
      key: env.SSL_KEY_PATH || 'Not specified',
    },
  };

  // Add certificate expiration info if available
  if (validation.configuration.cert) {
    try {
      const crypto = require('crypto');
      const cert = crypto.X509Certificate
        ? new crypto.X509Certificate(validation.configuration.cert)
        : null;

      if (cert) {
        info.certificate = {
          subject: cert.subject,
          issuer: cert.issuer,
          validFrom: cert.validFrom,
          validTo: cert.validTo,
          fingerprint: cert.fingerprint,
        };
      }
    } catch (error) {
      info.certificate = { error: 'Failed to parse certificate' };
    }
  }

  return info;
}

/**
 * Monitor SSL certificate expiration
 */
export function checkSSLCertificateExpiration(): {
  expiring: boolean;
  daysUntilExpiration?: number;
  error?: string;
} {
  const validation = validateSSLConfiguration();

  if (!validation.configuration.enabled || !validation.configuration.cert) {
    return { expiring: false };
  }

  try {
    const crypto = require('crypto');
    const cert = crypto.X509Certificate
      ? new crypto.X509Certificate(validation.configuration.cert)
      : null;

    if (!cert) {
      return { expiring: false, error: 'Could not parse certificate' };
    }

    const validTo = new Date(cert.validTo);
    const now = new Date();
    const daysUntilExpiration = Math.floor(
      (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      expiring: daysUntilExpiration < 30, // Alert if expiring within 30 days
      daysUntilExpiration,
    };
  } catch (error: any) {
    return { expiring: false, error: error.message };
  }
}
