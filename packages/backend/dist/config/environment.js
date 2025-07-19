"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecurityConfig = exports.getDatabaseConfig = exports.env = void 0;
exports.validateProductionSecrets = validateProductionSecrets;
exports.logConfiguration = logConfiguration;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// Load environment variables
dotenv_1.default.config();
// Environment validation schema
const environmentSchema = zod_1.z.object({
    // Application
    NODE_ENV: zod_1.z
        .enum(['development', 'production', 'test'])
        .default('development'),
    PORT: zod_1.z.coerce.number().default(3001),
    // Database
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    POSTGRES_HOST: zod_1.z.string().optional(),
    POSTGRES_PORT: zod_1.z.coerce.number().optional(),
    POSTGRES_USER: zod_1.z.string().optional(),
    POSTGRES_PASSWORD: zod_1.z.string().optional(),
    POSTGRES_DB: zod_1.z.string().optional(),
    // Security
    JWT_SECRET: zod_1.z
        .string()
        .min(32, 'JWT_SECRET must be at least 32 characters')
        .optional(),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    ENCRYPTION_KEY: zod_1.z
        .string()
        .min(32, 'ENCRYPTION_KEY must be at least 32 characters')
        .optional(),
    SESSION_SECRET: zod_1.z
        .string()
        .min(32, 'SESSION_SECRET must be at least 32 characters')
        .optional(),
    // OAuth Configuration
    GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    GOOGLE_CALLBACK_URL: zod_1.z.string().optional(),
    GITHUB_CLIENT_ID: zod_1.z.string().optional(),
    GITHUB_CLIENT_SECRET: zod_1.z.string().optional(),
    GITHUB_CALLBACK_URL: zod_1.z.string().optional(),
    // Frontend URL for OAuth redirects
    CLIENT_URL: zod_1.z.string().default('http://localhost:5174'),
    // SSL/TLS
    DATABASE_SSL: zod_1.z.enum(['true', 'false']).default('false'),
    SSL_CERT_PATH: zod_1.z.string().optional(),
    SSL_KEY_PATH: zod_1.z.string().optional(),
    SSL_CA_PATH: zod_1.z.string().optional(),
    // Performance
    ENABLE_QUERY_ANALYSIS: zod_1.z.enum(['true', 'false']).default('false'),
    QUERY_TIMEOUT: zod_1.z.coerce.number().default(30000),
    CONNECTION_POOL_SIZE: zod_1.z.coerce.number().default(10),
    // Integrations
    GITHUB_TOKEN: zod_1.z.string().optional(),
    SLACK_BOT_TOKEN: zod_1.z.string().optional(),
    ANTHROPIC_API_KEY: zod_1.z.string().optional(),
    // External Services
    REDIS_URL: zod_1.z.string().optional(),
    EXTERNAL_API_BASE_URL: zod_1.z.string().url().optional(),
    // Monitoring
    DATADOG_API_KEY: zod_1.z.string().optional(),
    DATADOG_APP_KEY: zod_1.z.string().optional(),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    // Development
    SEED_DATABASE: zod_1.z.enum(['true', 'false']).default('false'),
    PRISMA_STUDIO_PORT: zod_1.z.coerce.number().default(5555),
});
// Validate environment variables
function validateEnvironment() {
    try {
        return environmentSchema.parse(process.env);
    }
    catch (error) {
        console.error('❌ Environment validation failed:');
        if (error instanceof zod_1.z.ZodError) {
            error.issues.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
        }
        process.exit(1);
    }
}
// Export validated environment configuration
exports.env = validateEnvironment();
// Database configuration with SSL support
const getDatabaseConfig = () => {
    const config = {
        datasources: {
            db: {
                url: exports.env.DATABASE_URL,
            },
        },
        log: exports.env.LOG_LEVEL === 'debug'
            ? ['query', 'info', 'warn', 'error']
            : ['warn', 'error'],
        errorFormat: 'pretty',
    };
    // Add SSL configuration if enabled
    if (exports.env.DATABASE_SSL === 'true') {
        // Import SSL validator to enforce SSL configuration
        const { enforceSSLConfiguration } = require('./ssl-validator');
        const sslConfig = enforceSSLConfiguration();
        if (sslConfig.enabled) {
            config.ssl = {
                rejectUnauthorized: sslConfig.rejectUnauthorized,
                ca: sslConfig.ca,
                cert: sslConfig.cert,
                key: sslConfig.key,
            };
        }
    }
    return config;
};
exports.getDatabaseConfig = getDatabaseConfig;
// Security configuration
const getSecurityConfig = () => ({
    jwtSecret: exports.env.JWT_SECRET || generateSecretKey(),
    encryptionKey: exports.env.ENCRYPTION_KEY || generateSecretKey(),
    enableSsl: exports.env.DATABASE_SSL === 'true',
    corsOrigins: exports.env.NODE_ENV === 'production'
        ? ['https://taskmaster.holded.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
});
exports.getSecurityConfig = getSecurityConfig;
// Generate a secure random key if not provided
function generateSecretKey() {
    const crypto = require('crypto');
    const key = crypto.randomBytes(32).toString('hex');
    if (exports.env.NODE_ENV === 'production') {
        console.warn('⚠️  Using auto-generated secret key. Set JWT_SECRET/ENCRYPTION_KEY in production!');
    }
    return key;
}
// Validate required secrets for production
function validateProductionSecrets() {
    if (exports.env.NODE_ENV !== 'production') {
        return;
    }
    const requiredSecrets = ['JWT_SECRET', 'ENCRYPTION_KEY', 'DATABASE_URL'];
    const missingSecrets = requiredSecrets.filter(secret => !process.env[secret] || process.env[secret]?.length === 0);
    if (missingSecrets.length > 0) {
        console.error('❌ Missing required production secrets:');
        missingSecrets.forEach(secret => {
            console.error(`  - ${secret}`);
        });
        console.error('Please set these environment variables before starting the application.');
        process.exit(1);
    }
    // Validate secret strength
    const weakSecrets = requiredSecrets.filter(secret => {
        const value = process.env[secret];
        return value && value.length < 32;
    });
    if (weakSecrets.length > 0) {
        console.error('❌ Weak secrets detected (must be at least 32 characters):');
        weakSecrets.forEach(secret => {
            console.error(`  - ${secret}: ${process.env[secret]?.length} characters`);
        });
        process.exit(1);
    }
    console.log('✅ Production secrets validation passed');
}
// Log configuration (without sensitive data)
function logConfiguration() {
    const safeConfig = {
        nodeEnv: exports.env.NODE_ENV,
        port: exports.env.PORT,
        databaseSsl: exports.env.DATABASE_SSL,
        queryAnalysis: exports.env.ENABLE_QUERY_ANALYSIS,
        logLevel: exports.env.LOG_LEVEL,
        connectionPoolSize: exports.env.CONNECTION_POOL_SIZE,
        queryTimeout: exports.env.QUERY_TIMEOUT,
    };
    console.log('📋 Application Configuration:');
    console.log(JSON.stringify(safeConfig, null, 2));
}
//# sourceMappingURL=environment.js.map