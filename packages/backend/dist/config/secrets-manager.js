"use strict";
/**
 * Simplified Production Secrets Manager
 *
 * This module provides secure secrets management with environment variables as primary provider
 * and optional cloud provider support that can be added later.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretsManager = void 0;
exports.getSecretsManager = getSecretsManager;
exports.getApplicationSecrets = getApplicationSecrets;
exports.validateSecrets = validateSecrets;
const zod_1 = require("zod");
const environment_1 = require("./environment");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// Secrets manager configuration schema
const secretsManagerConfigSchema = zod_1.z.object({
    provider: zod_1.z.enum(['env', 'file', 'aws', 'gcp', 'vault', 'k8s']).default('env'),
    timeout: zod_1.z.number().default(5000),
    retries: zod_1.z.number().default(3),
    cacheTtl: zod_1.z.number().default(300000), // 5 minutes
    secretsPath: zod_1.z.string().default('/run/secrets'), // Docker secrets mount path
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
// File-based secrets provider (for Docker secrets)
class FileSecretsProvider {
    constructor(secretsPath = '/run/secrets') {
        this.secretsPath = secretsPath;
    }
    getName() {
        return 'File-based Secrets (Docker)';
    }
    async getSecret(key) {
        // For .pem files, use the key as-is; for others, convert to lowercase
        const secretPath = key.endsWith('.pem') ?
            path_1.default.join(this.secretsPath, key) :
            path_1.default.join(this.secretsPath, key.toLowerCase());
        try {
            const value = await fs_1.promises.readFile(secretPath, 'utf8');
            return {
                value: value.trim(), // Remove whitespace/newlines
                source: 'file',
                lastUpdated: new Date(),
            };
        }
        catch (error) {
            throw new Error(`Secret file ${key} not found at ${secretPath}`);
        }
    }
    async listSecrets() {
        try {
            const files = await fs_1.promises.readdir(this.secretsPath);
            return files.filter(file => !file.startsWith('.'));
        }
        catch (error) {
            return [];
        }
    }
    async isAvailable() {
        try {
            await fs_1.promises.access(this.secretsPath);
            return true;
        }
        catch {
            return false;
        }
    }
}
// Main secrets manager class
class SecretsManager {
    constructor(config = {}) {
        this.cache = new Map();
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
        // Auto-detect provider based on environment
        let provider = process.env.SECRETS_PROVIDER;
        // If no provider specified, auto-detect
        if (!provider) {
            // In production Docker environments, prefer file-based secrets
            if (process.env.NODE_ENV === 'production' && process.env.DOCKER_SECRETS === 'true') {
                provider = 'file';
            }
            else {
                provider = 'env';
            }
        }
        const config = {
            provider,
            timeout: parseInt(process.env.SECRETS_TIMEOUT || '5000'),
            retries: parseInt(process.env.SECRETS_RETRIES || '3'),
            cacheTtl: parseInt(process.env.SECRETS_CACHE_TTL || '300000'),
            secretsPath: process.env.SECRETS_PATH || '/run/secrets',
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
    // For file-based secrets, try to get secrets individually
    let databaseUrl = environment_1.env.DATABASE_URL;
    // If using file-based secrets and no DATABASE_URL is set, construct it from individual secrets
    if (!databaseUrl && secretsManager['config'].provider === 'file') {
        try {
            const dbPassword = await secretsManager.getSecret('db_password');
            databaseUrl = `postgresql://taskmaster:${dbPassword}@postgres:5432/taskmaster_prod?sslmode=require`;
        }
        catch (error) {
            // Fallback to environment variable or empty string
            databaseUrl = await secretsManager.getSecret('DATABASE_URL').catch(() => '');
        }
    }
    // Get SSL configuration if using file-based secrets
    let sslConfig;
    if (secretsManager['config'].provider === 'file') {
        try {
            const [ca, cert, key] = await Promise.all([
                secretsManager.getSecret('ssl_ca_cert.pem'),
                secretsManager.getSecret('ssl_client_cert.pem'),
                secretsManager.getSecret('ssl_client_key.pem'),
            ]);
            sslConfig = { ca, cert, key };
        }
        catch (error) {
            // SSL certificates not available, continue without SSL
            console.warn('SSL certificates not available for database connection');
        }
    }
    const secrets = {
        jwtSecret: environment_1.env.JWT_SECRET || await secretsManager.getSecret('jwt_secret').catch(() => ''),
        encryptionKey: environment_1.env.ENCRYPTION_KEY || await secretsManager.getSecret('encryption_key').catch(() => ''),
        databaseUrl: databaseUrl || await secretsManager.getSecret('DATABASE_URL').catch(() => ''),
        githubToken: environment_1.env.GITHUB_TOKEN || await secretsManager.getSecret('github_token').catch(() => undefined),
        slackToken: environment_1.env.SLACK_BOT_TOKEN || await secretsManager.getSecret('slack_bot_token').catch(() => undefined),
        anthropicKey: environment_1.env.ANTHROPIC_API_KEY || await secretsManager.getSecret('anthropic_api_key').catch(() => undefined),
        sslConfig,
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
//# sourceMappingURL=secrets-manager.js.map