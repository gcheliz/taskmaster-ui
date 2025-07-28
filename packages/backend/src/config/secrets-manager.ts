/**
 * Simplified Production Secrets Manager
 *
 * This module provides secure secrets management with environment variables as primary provider
 * and optional cloud provider support that can be added later.
 */

import { z } from 'zod';
import { env } from './environment';
import { promises as fs } from 'fs';
import path from 'path';
import { securityLogger } from '../utils/bootstrap-logger';

// Secret value with metadata
export interface SecretValue {
  value: string;
  version?: string;
  lastUpdated?: Date;
  source: 'env' | 'file' | 'aws' | 'gcp' | 'vault' | 'k8s';
}

// Secrets manager configuration schema
const secretsManagerConfigSchema = z.object({
  provider: z
    .enum(['env', 'file', 'aws', 'gcp', 'vault', 'k8s'])
    .default('env'),
  timeout: z.number().default(5000),
  retries: z.number().default(3),
  cacheTtl: z.number().default(300000), // 5 minutes
  secretsPath: z.string().default('/run/secrets'), // Docker secrets mount path
});

export type SecretsManagerConfig = z.infer<typeof secretsManagerConfigSchema>;

// Environment variables provider
class EnvironmentProvider {
  getName(): string {
    return 'Environment Variables';
  }

  async getSecret(key: string): Promise<SecretValue> {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Environment variable ${key} not found`);
    }

    return {
      value,
      source: 'env',
      lastUpdated: new Date(),
    };
  }

  async listSecrets(): Promise<string[]> {
    return Object.keys(process.env);
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

// File-based secrets provider (for Docker secrets)
class FileSecretsProvider {
  constructor(private secretsPath: string = '/run/secrets') {}

  getName(): string {
    return 'File-based Secrets (Docker)';
  }

  async getSecret(key: string): Promise<SecretValue> {
    // For .pem files, use the key as-is; for others, convert to lowercase
    const secretPath = key.endsWith('.pem')
      ? path.join(this.secretsPath, key)
      : path.join(this.secretsPath, key.toLowerCase());

    try {
      const value = await fs.readFile(secretPath, 'utf8');
      return {
        value: value.trim(), // Remove whitespace/newlines
        source: 'file',
        lastUpdated: new Date(),
      };
    } catch (error) {
      throw new Error(`Secret file ${key} not found at ${secretPath}`);
    }
  }

  async listSecrets(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.secretsPath);
      return files.filter(file => !file.startsWith('.'));
    } catch (error) {
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await fs.access(this.secretsPath);
      return true;
    } catch {
      return false;
    }
  }
}

// Main secrets manager class
export class SecretsManager {
  private cache: Map<string, { value: SecretValue; expiry: number }> =
    new Map();
  private config: SecretsManagerConfig;
  private provider: EnvironmentProvider | FileSecretsProvider;

  constructor(config: Partial<SecretsManagerConfig> = {}) {
    this.config = secretsManagerConfigSchema.parse(config);

    // Choose provider based on configuration
    switch (this.config.provider) {
      case 'file':
        this.provider = new FileSecretsProvider(this.config.secretsPath);
        break;
      case 'env':
      default:
        this.provider = new EnvironmentProvider();
        break;
    }
  }

  /**
   * Get a secret value with caching
   */
  async getSecret(key: string): Promise<string> {
    const cacheKey = `${this.config.provider}:${key}`;
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return cached.value.value;
    }

    const secret = await this.withRetries(() => this.provider.getSecret(key));

    // Cache the result
    this.cache.set(cacheKey, {
      value: secret,
      expiry: Date.now() + this.config.cacheTtl,
    });

    return secret.value;
  }

  /**
   * Get secret with metadata
   */
  async getSecretWithMetadata(key: string): Promise<SecretValue> {
    const cacheKey = `${this.config.provider}:${key}`;
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    const secret = await this.withRetries(() => this.provider.getSecret(key));

    // Cache the result
    this.cache.set(cacheKey, {
      value: secret,
      expiry: Date.now() + this.config.cacheTtl,
    });

    return secret;
  }

  /**
   * List all available secrets
   */
  async listSecrets(): Promise<string[]> {
    return await this.withRetries(() => this.provider.listSecrets());
  }

  /**
   * Check if the provider is available
   */
  async isProviderAvailable(): Promise<boolean> {
    return await this.provider.isAvailable();
  }

  /**
   * Get provider status
   */
  async getProviderStatus(): Promise<Map<string, boolean>> {
    const status = new Map<string, boolean>();
    status.set('env', await this.provider.isAvailable());

    // Cloud providers would be checked here if available
    status.set('aws', false);
    status.set('gcp', false);
    status.set('k8s', false);

    return status;
  }

  /**
   * Clear the secrets cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  /**
   * Execute operation with retries
   */
  private async withRetries<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        return await Promise.race([
          operation(),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error('Operation timeout')),
              this.config.timeout
            )
          ),
        ]);
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.config.retries) {
          break;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw (
      lastError ||
      new Error('Failed to retrieve secret after multiple attempts')
    );
  }
}

// Default secrets manager instance
let defaultSecretsManager: SecretsManager;

/**
 * Get the default secrets manager instance
 */
export function getSecretsManager(): SecretsManager {
  if (!defaultSecretsManager) {
    // Auto-detect provider based on environment
    let provider = process.env['SECRETS_PROVIDER'] as any;

    // If no provider specified, auto-detect
    if (!provider) {
      // In production Docker environments, prefer file-based secrets
      if (
        process.env['NODE_ENV'] === 'production' &&
        process.env['DOCKER_SECRETS'] === 'true'
      ) {
        provider = 'file';
      } else {
        provider = 'env';
      }
    }

    const config: Partial<SecretsManagerConfig> = {
      provider,
      timeout: parseInt(process.env['SECRETS_TIMEOUT'] || '5000'),
      retries: parseInt(process.env['SECRETS_RETRIES'] || '3'),
      cacheTtl: parseInt(process.env['SECRETS_CACHE_TTL'] || '300000'),
      secretsPath: process.env['SECRETS_PATH'] || '/run/secrets',
    };

    defaultSecretsManager = new SecretsManager(config);
  }

  return defaultSecretsManager;
}

/**
 * Helper function to get secrets for the application
 */
export async function getApplicationSecrets(): Promise<{
  jwtSecret: string;
  encryptionKey: string;
  databaseUrl: string;
  githubToken?: string;
  slackToken?: string;
  anthropicKey?: string;
  sslConfig?: {
    ca: string;
    cert: string;
    key: string;
  };
}> {
  const secretsManager = getSecretsManager();

  // For file-based secrets, try to get secrets individually
  let databaseUrl = env.DATABASE_URL;

  // If using file-based secrets and no DATABASE_URL is set, construct it from individual secrets
  if (!databaseUrl && secretsManager['config'].provider === 'file') {
    try {
      const dbPassword = await secretsManager.getSecret('db_password');
      databaseUrl = `postgresql://taskmaster:${dbPassword}@postgres:5432/taskmaster_prod?sslmode=require`;
    } catch (error) {
      // Fallback to environment variable or empty string
      databaseUrl = await secretsManager
        .getSecret('DATABASE_URL')
        .catch(() => '');
    }
  }

  // Get SSL configuration if using file-based secrets
  let sslConfig: { ca: string; cert: string; key: string } | undefined;
  if (secretsManager['config'].provider === 'file') {
    try {
      const [ca, cert, key] = await Promise.all([
        secretsManager.getSecret('ssl_ca_cert.pem'),
        secretsManager.getSecret('ssl_client_cert.pem'),
        secretsManager.getSecret('ssl_client_key.pem'),
      ]);
      sslConfig = { ca, cert, key };
    } catch (error) {
      // SSL certificates not available, continue without SSL
      securityLogger.warn(
        'SSL certificates not available for database connection'
      );
    }
  }

  const githubToken =
    env.GITHUB_TOKEN ||
    (await secretsManager.getSecret('github_token').catch(() => undefined));
  const slackToken =
    env.SLACK_BOT_TOKEN ||
    (await secretsManager.getSecret('slack_bot_token').catch(() => undefined));
  const anthropicKey =
    env.ANTHROPIC_API_KEY ||
    (await secretsManager
      .getSecret('anthropic_api_key')
      .catch(() => undefined));

  const secrets: {
    jwtSecret: string;
    encryptionKey: string;
    databaseUrl: string;
    githubToken?: string;
    slackToken?: string;
    anthropicKey?: string;
    sslConfig?: {
      ca: string;
      cert: string;
      key: string;
    };
  } = {
    jwtSecret:
      env.JWT_SECRET ||
      (await secretsManager.getSecret('jwt_secret').catch(() => '')),
    encryptionKey:
      env.ENCRYPTION_KEY ||
      (await secretsManager.getSecret('encryption_key').catch(() => '')),
    databaseUrl:
      databaseUrl ||
      (await secretsManager.getSecret('DATABASE_URL').catch(() => '')),
  };

  // Only add optional properties if they have values
  if (githubToken) secrets.githubToken = githubToken;
  if (slackToken) secrets.slackToken = slackToken;
  if (anthropicKey) secrets.anthropicKey = anthropicKey;
  if (sslConfig) secrets.sslConfig = sslConfig;

  return secrets;
}

/**
 * Validate that required secrets are available
 */
export async function validateSecrets(): Promise<void> {
  const secretsManager = getSecretsManager();
  const requiredSecrets = ['JWT_SECRET', 'ENCRYPTION_KEY', 'DATABASE_URL'];

  const missing: string[] = [];

  for (const secret of requiredSecrets) {
    try {
      await secretsManager.getSecret(secret);
    } catch (error) {
      missing.push(secret);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required secrets: ${missing.join(', ')}`);
  }
}
