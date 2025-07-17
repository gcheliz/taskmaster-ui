"use strict";
/**
 * Simplified Production Secrets Manager
 *
 * This module provides secure secrets management with environment variables as primary provider
 * and optional cloud provider support that can be added later.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretsManager = void 0;
exports.getSecretsManager = getSecretsManager;
exports.getApplicationSecrets = getApplicationSecrets;
exports.validateSecrets = validateSecrets;
const zod_1 = require("zod");
const environment_1 = require("./environment");
// Secrets manager configuration schema
const secretsManagerConfigSchema = zod_1.z.object({
    provider: zod_1.z.enum(['env', 'aws', 'gcp', 'vault', 'k8s']).default('env'),
    timeout: zod_1.z.number().default(5000),
    retries: zod_1.z.number().default(3),
    cacheTtl: zod_1.z.number().default(300000), // 5 minutes
});
// Environment variables provider
class EnvironmentProvider {
    getName() {
        return 'Environment Variables';
    }
    async getSecret(key) {
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
    async listSecrets() {
        return Object.keys(process.env);
    }
    async isAvailable() {
        return true;
    }
}
// Main secrets manager class
class SecretsManager {
    constructor(config = {}) {
        this.cache = new Map();
        this.config = secretsManagerConfigSchema.parse(config);
        this.provider = new EnvironmentProvider();
    }
    /**
     * Get a secret value with caching
     */
    async getSecret(key) {
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
    async getSecretWithMetadata(key) {
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
    async listSecrets() {
        return await this.withRetries(() => this.provider.listSecrets());
    }
    /**
     * Check if the provider is available
     */
    async isProviderAvailable() {
        return await this.provider.isAvailable();
    }
    /**
     * Get provider status
     */
    async getProviderStatus() {
        const status = new Map();
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
    clearCache() {
        this.cache.clear();
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys()),
        };
    }
    /**
     * Execute operation with retries
     */
    async withRetries(operation) {
        let lastError;
        for (let attempt = 1; attempt <= this.config.retries; attempt++) {
            try {
                return await Promise.race([
                    operation(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timeout')), this.config.timeout)),
                ]);
            }
            catch (error) {
                lastError = error;
                if (attempt === this.config.retries) {
                    break;
                }
                // Exponential backoff
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }
}
exports.SecretsManager = SecretsManager;
// Default secrets manager instance
let defaultSecretsManager;
/**
 * Get the default secrets manager instance
 */
function getSecretsManager() {
    if (!defaultSecretsManager) {
        const config = {
            provider: process.env.SECRETS_PROVIDER || 'env',
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
async function getApplicationSecrets() {
    const secretsManager = getSecretsManager();
    const secrets = {
        jwtSecret: environment_1.env.JWT_SECRET || await secretsManager.getSecret('JWT_SECRET').catch(() => ''),
        encryptionKey: environment_1.env.ENCRYPTION_KEY || await secretsManager.getSecret('ENCRYPTION_KEY').catch(() => ''),
        databaseUrl: environment_1.env.DATABASE_URL || await secretsManager.getSecret('DATABASE_URL').catch(() => ''),
        githubToken: environment_1.env.GITHUB_TOKEN || await secretsManager.getSecret('GITHUB_TOKEN').catch(() => undefined),
        slackToken: environment_1.env.SLACK_BOT_TOKEN || await secretsManager.getSecret('SLACK_BOT_TOKEN').catch(() => undefined),
        anthropicKey: environment_1.env.ANTHROPIC_API_KEY || await secretsManager.getSecret('ANTHROPIC_API_KEY').catch(() => undefined),
    };
    return secrets;
}
/**
 * Validate that required secrets are available
 */
async function validateSecrets() {
    const secretsManager = getSecretsManager();
    const requiredSecrets = ['JWT_SECRET', 'ENCRYPTION_KEY', 'DATABASE_URL'];
    const missing = [];
    for (const secret of requiredSecrets) {
        try {
            await secretsManager.getSecret(secret);
        }
        catch (error) {
            missing.push(secret);
        }
    }
    if (missing.length > 0) {
        throw new Error(`Missing required secrets: ${missing.join(', ')}`);
    }
}
//# sourceMappingURL=secrets-manager-simple.js.map