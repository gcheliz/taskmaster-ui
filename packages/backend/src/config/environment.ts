import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation schema
const environmentSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3001),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  POSTGRES_HOST: z.string().optional(),
  POSTGRES_PORT: z.coerce.number().optional(),
  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DB: z.string().optional(),

  // Security
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ENCRYPTION_KEY: z
    .string()
    .min(32, 'ENCRYPTION_KEY must be at least 32 characters')
    .optional(),
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters')
    .optional(),

  // OAuth Configuration
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().optional(),

  // Frontend URL for OAuth redirects
  CLIENT_URL: z.string().default('http://localhost:5174'),

  // SSL/TLS
  DATABASE_SSL: z.enum(['true', 'false']).default('false'),
  SSL_CERT_PATH: z.string().optional(),
  SSL_KEY_PATH: z.string().optional(),
  SSL_CA_PATH: z.string().optional(),

  // Performance
  ENABLE_QUERY_ANALYSIS: z.enum(['true', 'false']).default('false'),
  QUERY_TIMEOUT: z.coerce.number().default(30000),
  CONNECTION_POOL_SIZE: z.coerce.number().default(10),

  // Integrations
  GITHUB_TOKEN: z.string().optional(),
  SLACK_BOT_TOKEN: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // External Services
  REDIS_URL: z.string().optional(),
  EXTERNAL_API_BASE_URL: z.string().url().optional(),

  // Monitoring
  DATADOG_API_KEY: z.string().optional(),
  DATADOG_APP_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Development
  SEED_DATABASE: z.enum(['true', 'false']).default('false'),
  PRISMA_STUDIO_PORT: z.coerce.number().default(5555),
});

// Validate environment variables
function validateEnvironment() {
  try {
    return environmentSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.issues.forEach((err: any) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

// Export validated environment configuration
export const env = validateEnvironment();

// Database configuration with SSL support
export const getDatabaseConfig = () => {
  const config: any = {
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log:
      env.LOG_LEVEL === 'debug'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    errorFormat: 'pretty',
  };

  // Add SSL configuration if enabled
  if (env.DATABASE_SSL === 'true') {
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

// Security configuration
export const getSecurityConfig = () => ({
  jwtSecret: env.JWT_SECRET || generateSecretKey(),
  encryptionKey: env.ENCRYPTION_KEY || generateSecretKey(),
  enableSsl: env.DATABASE_SSL === 'true',
  corsOrigins:
    env.NODE_ENV === 'production'
      ? ['https://taskmaster.holded.com']
      : ['http://localhost:3000', 'http://localhost:5173'],
});

// Generate a secure random key if not provided
function generateSecretKey(): string {
  const crypto = require('crypto');
  const key = crypto.randomBytes(32).toString('hex');

  if (env.NODE_ENV === 'production') {
    console.warn(
      '⚠️  Using auto-generated secret key. Set JWT_SECRET/ENCRYPTION_KEY in production!'
    );
  }

  return key;
}

// Validate required secrets for production
export function validateProductionSecrets() {
  if (env.NODE_ENV !== 'production') {
    return;
  }

  const requiredSecrets = ['JWT_SECRET', 'ENCRYPTION_KEY', 'DATABASE_URL'];

  const missingSecrets = requiredSecrets.filter(
    secret => !process.env[secret] || process.env[secret]?.length === 0
  );

  if (missingSecrets.length > 0) {
    console.error('❌ Missing required production secrets:');
    missingSecrets.forEach(secret => {
      console.error(`  - ${secret}`);
    });
    console.error(
      'Please set these environment variables before starting the application.'
    );
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
export function logConfiguration() {
  const safeConfig = {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    databaseSsl: env.DATABASE_SSL,
    queryAnalysis: env.ENABLE_QUERY_ANALYSIS,
    logLevel: env.LOG_LEVEL,
    connectionPoolSize: env.CONNECTION_POOL_SIZE,
    queryTimeout: env.QUERY_TIMEOUT,
  };

  console.log('📋 Application Configuration:');
  console.log(JSON.stringify(safeConfig, null, 2));
}

// Export environment types for TypeScript
export type Environment = typeof env;
export type DatabaseConfig = ReturnType<typeof getDatabaseConfig>;
export type SecurityConfig = ReturnType<typeof getSecurityConfig>;
