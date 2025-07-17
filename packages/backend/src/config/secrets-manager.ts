/**
 * Simplified Production Secrets Manager
 * 
 * This module provides secure secrets management with environment variables as primary provider
 * and optional cloud provider support that can be added later.
 */

import { z } from 'zod';
import { env } from './environment';

// Secret value with metadata
export interface SecretValue {
  value: string;
  version?: string;
  lastUpdated?: Date;
  source: 'env' | 'aws' | 'gcp' | 'vault' | 'k8s';
}

// Secrets manager configuration schema
const secretsManagerConfigSchema = z.object({
  provider: z.enum(['env', 'aws', 'gcp', 'vault', 'k8s']).default('env'),
  timeout: z.number().default(5000),
  retries: z.number().default(3),
  cacheTtl: z.number().default(300000), // 5 minutes
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

// Main secrets manager class
export class SecretsManager {
  private cache: Map<string, { value: SecretValue; expiry: number }> = new Map();
  private config: SecretsManagerConfig;
  private provider: EnvironmentProvider;

  constructor(config: Partial<SecretsManagerConfig> = {}) {
    this.config = secretsManagerConfigSchema.parse(config);
    this.provider = new EnvironmentProvider();
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
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        return await Promise.race([
          operation(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Operation timeout')), this.config.timeout)
          ),
        ]);
      } catch (error: any) {
        lastError = error;
        
        if (attempt === this.config.retries) {
          break;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
}

// Default secrets manager instance
let defaultSecretsManager: SecretsManager;

/**
 * Get the default secrets manager instance
 */
export function getSecretsManager(): SecretsManager {
  if (!defaultSecretsManager) {
    const config: Partial<SecretsManagerConfig> = {
      provider: (process.env.SECRETS_PROVIDER as any) || 'env',
      timeout: parseInt(process.env.SECRETS_TIMEOUT || '5000'),
      retries: parseInt(process.env.SECRETS_RETRIES || '3'),
      cacheTtl: parseInt(process.env.SECRETS_CACHE_TTL || '300000'),
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
}> {
  const secretsManager = getSecretsManager();
  
  const secrets = {
    jwtSecret: env.JWT_SECRET || await secretsManager.getSecret('JWT_SECRET').catch(() => ''),
    encryptionKey: env.ENCRYPTION_KEY || await secretsManager.getSecret('ENCRYPTION_KEY').catch(() => ''),
    databaseUrl: env.DATABASE_URL || await secretsManager.getSecret('DATABASE_URL').catch(() => ''),
    githubToken: env.GITHUB_TOKEN || await secretsManager.getSecret('GITHUB_TOKEN').catch(() => undefined),
    slackToken: env.SLACK_BOT_TOKEN || await secretsManager.getSecret('SLACK_BOT_TOKEN').catch(() => undefined),
    anthropicKey: env.ANTHROPIC_API_KEY || await secretsManager.getSecret('ANTHROPIC_API_KEY').catch(() => undefined),
  };
  
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